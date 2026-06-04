"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getBusWsTokenAction } from "@/services/bus";
import {
  WS_CLIENT_EVENT,
  WS_SERVER_EVENT,
  type LocationBroadcastEvent,
  type ReportUpdateEvent,
  type ReportVote,
  type RoomStatusEvent,
  type SharerBlockedEvent,
  type ShareIntent,
  type WarningIssuedEvent,
  type WsErrorEvent,
} from "@/types/bus";

export type BusTrackingState = {
  connected: boolean;
  connecting: boolean;
  /** The bus room we are currently in, or null. */
  activeBusCode: string | null;
  role: ShareIntent | null;
  hasActiveSharer: boolean;
  /** Latest broadcast location for the active bus. */
  location: LocationBroadcastEvent | null;
  reportTotals: ReportUpdateEvent | null;
  warning: string | null;
  blocked: SharerBlockedEvent | null;
  /** Set when sharing auto-stopped (geofence) or someone else holds the slot. */
  notice: string | null;
};

const GPS_EMIT_MS = 4000;

export function useBusTracking() {
  const socketRef = useRef<Socket | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const gpsTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastFixRef = useRef<GeolocationCoordinates | null>(null);
  const activeRef = useRef<{ code: string; role: ShareIntent } | null>(null);

  const [state, setState] = useState<BusTrackingState>({
    connected: false,
    connecting: false,
    activeBusCode: null,
    role: null,
    hasActiveSharer: false,
    location: null,
    reportTotals: null,
    warning: null,
    blocked: null,
    notice: null,
  });

  const patch = useCallback((p: Partial<BusTrackingState>) => {
    setState((s) => ({ ...s, ...p }));
  }, []);

  const stopGps = useCallback(() => {
    if (watchIdRef.current != null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (gpsTimerRef.current) {
      clearInterval(gpsTimerRef.current);
      gpsTimerRef.current = null;
    }
    lastFixRef.current = null;
  }, []);

  // --- connect (lazy, with token from server action) ---
  const connect = useCallback(async (): Promise<Socket | null> => {
    if (socketRef.current?.connected) return socketRef.current;
    patch({ connecting: true });
    const res = await getBusWsTokenAction();
    if (!res.success || !res.token) {
      patch({ connecting: false, notice: "Please sign in to use live bus tracking." });
      return null;
    }
    const socket = io(`${res.wsUrl}/bus-tracking`, {
      transports: ["websocket"],
      auth: { token: res.token },
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      patch({ connected: true, connecting: false });
      // Re-join the room we were in before a reconnect.
      const active = activeRef.current;
      if (active) {
        socket.emit(WS_CLIENT_EVENT.JOIN_ROOM, { busId: active.code, intent: active.role });
      }
    });
    socket.on("disconnect", () => patch({ connected: false }));

    socket.on(WS_SERVER_EVENT.ROOM_STATUS, (s: RoomStatusEvent) => {
      patch({ hasActiveSharer: s.hasActiveSharer, role: s.role, activeBusCode: s.busId });
    });
    socket.on(WS_SERVER_EVENT.LOCATION_BROADCAST, (loc: LocationBroadcastEvent) => {
      patch({ location: loc, hasActiveSharer: true });
    });
    socket.on(WS_SERVER_EVENT.SHARER_JOINED, () => {
      patch({ hasActiveSharer: true });
    });
    socket.on(WS_SERVER_EVENT.SHARER_LEFT, () => {
      patch({ hasActiveSharer: false, location: null });
    });
    socket.on(WS_SERVER_EVENT.REPORT_UPDATE, (r: ReportUpdateEvent) => {
      patch({ reportTotals: r });
    });
    socket.on(WS_SERVER_EVENT.WARNING_ISSUED, (w: WarningIssuedEvent) => {
      patch({ warning: w.message });
    });
    socket.on(WS_SERVER_EVENT.SHARER_ALREADY_ACTIVE, () => {
      patch({ notice: "Someone is already sharing this bus." });
    });
    socket.on(WS_SERVER_EVENT.SHARING_AUTO_STOPPED, () => {
      stopGps();
      activeRef.current = activeRef.current ? { ...activeRef.current, role: "view" } : null;
      patch({ role: "view", notice: "You've reached campus — sharing stopped automatically." });
    });
    socket.on(WS_SERVER_EVENT.SHARER_BLOCKED, (b: SharerBlockedEvent) => {
      stopGps();
      patch({ blocked: b, role: "view" });
    });
    socket.on(WS_SERVER_EVENT.ERROR, (e: WsErrorEvent) => {
      patch({ notice: e?.message ?? "Something went wrong." });
    });

    return socket;
  }, [patch, stopGps]);

  // --- viewer: join a bus room ---
  const watchBus = useCallback(
    async (busCode: string) => {
      const socket = await connect();
      if (!socket) return;
      // Leave previous room (single-room rule).
      if (activeRef.current && activeRef.current.code !== busCode) {
        socket.emit(WS_CLIENT_EVENT.LEAVE_ROOM);
        stopGps();
      }
      activeRef.current = { code: busCode, role: "view" };
      patch({
        activeBusCode: busCode,
        role: "view",
        location: null,
        reportTotals: null,
        warning: null,
        notice: null,
      });
      socket.emit(WS_CLIENT_EVENT.JOIN_ROOM, { busId: busCode, intent: "view" });
    },
    [connect, patch, stopGps],
  );

  // --- sharer: claim a bus and stream GPS ---
  const startSharing = useCallback(
    async (busCode: string) => {
      if (typeof navigator === "undefined" || !navigator.geolocation) {
        patch({ notice: "Location is not available on this device." });
        return;
      }
      const socket = await connect();
      if (!socket) return;
      if (activeRef.current && activeRef.current.code !== busCode) {
        socket.emit(WS_CLIENT_EVENT.LEAVE_ROOM);
      }
      stopGps();
      activeRef.current = { code: busCode, role: "share" };
      patch({
        activeBusCode: busCode,
        role: "share",
        warning: null,
        blocked: null,
        notice: null,
      });
      socket.emit(WS_CLIENT_EVENT.JOIN_ROOM, { busId: busCode, intent: "share" });

      // Track the freshest fix; emit on a fixed cadence (server TTL is 90s).
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          lastFixRef.current = pos.coords;
        },
        () => patch({ notice: "Couldn't read your location. Check GPS permission." }),
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 },
      );
      gpsTimerRef.current = setInterval(() => {
        const c = lastFixRef.current;
        const active = activeRef.current;
        if (!c || !socketRef.current?.connected || active?.role !== "share") return;
        socketRef.current.emit(WS_CLIENT_EVENT.LOCATION_UPDATE, {
          busId: busCode,
          lat: c.latitude,
          lng: c.longitude,
          speed: c.speed ?? 0,
          heading: c.heading ?? 0,
        });
      }, GPS_EMIT_MS);
    },
    [connect, patch, stopGps],
  );

  // --- leave / stop ---
  const leave = useCallback(() => {
    stopGps();
    const socket = socketRef.current;
    if (socket && activeRef.current) socket.emit(WS_CLIENT_EVENT.LEAVE_ROOM);
    activeRef.current = null;
    patch({ activeBusCode: null, role: null, location: null, reportTotals: null });
  }, [patch, stopGps]);

  // --- viewer vote ---
  const vote = useCallback(
    (busCode: string, value: ReportVote) => {
      const socket = socketRef.current;
      if (!socket?.connected) return;
      socket.emit(WS_CLIENT_EVENT.SUBMIT_REPORT, { busId: busCode, vote: value });
    },
    [],
  );

  const dismissNotice = useCallback(() => patch({ notice: null, warning: null }), [patch]);

  // --- cleanup on unmount ---
  useEffect(() => {
    return () => {
      stopGps();
      socketRef.current?.disconnect();
      socketRef.current = null;
      activeRef.current = null;
    };
  }, [stopGps]);

  return { state, connect, watchBus, startSharing, leave, vote, dismissNotice };
}
