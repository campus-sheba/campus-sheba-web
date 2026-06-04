// Live Bus Tracking — mirrors the backend bus interface & WebSocket contract.

export type ShareIntent = "view" | "share";
export type ReportVote = "accurate" | "inaccurate";
export type StopReason = "user" | "geofence" | "disconnect" | "blocked";
export type BlockReason = "fake_location" | "community_report" | "admin_action";

/** Client → server WS events. */
export const WS_CLIENT_EVENT = {
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  LOCATION_UPDATE: "location_update",
  SUBMIT_REPORT: "submit_report",
  APPEAL_REQUEST: "appeal_request",
} as const;

/** Server → client WS events. */
export const WS_SERVER_EVENT = {
  LOCATION_BROADCAST: "location_broadcast",
  ROOM_STATUS: "room_status",
  SHARER_JOINED: "sharer_joined",
  SHARER_LEFT: "sharer_left",
  SHARER_ALREADY_ACTIVE: "sharer_already_active",
  SHARING_AUTO_STOPPED: "sharing_auto_stopped",
  SHARER_BLOCKED: "sharer_blocked",
  WARNING_ISSUED: "warning_issued",
  REPORT_UPDATE: "report_update",
  ERROR: "error",
} as const;

/** A bus row (GET /buses). */
export type Bus = {
  _id: string;
  university?: string;
  code: string;
  name: string;
  route?: string;
  capacity?: number;
  isActive: boolean;
  isLive?: boolean;
  createdAt?: string;
};

export type BusSharer = {
  userId: string;
  name: string | null;
  photo: string | null;
  startedAt: number;
};

export type BusLocation = {
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  updatedAt: number;
};

/** A bus with live state (GET /buses/live). */
export type LiveBus = Bus & {
  isLive: boolean;
  sharer: BusSharer | null;
  location: BusLocation | null;
};

/** GET /bus-tracking/me/status */
export type BusShareStatus = {
  blocked: boolean;
  isPermanent: boolean;
  blockedUntil: string | null;
  blockCount: number;
  reporterScore: number;
  lastBlockReason: BlockReason | null;
};

// ---- WebSocket payload shapes ----

export type LocationUpdatePayload = {
  busId: string;
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  isMock?: boolean;
  accelerometerMoving?: boolean;
};

export type RoomStatusEvent = {
  busId: string;
  hasActiveSharer: boolean;
  role: ShareIntent;
};

export type LocationBroadcastEvent = {
  busId: string;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  updatedAt: number;
  sharer: { userId: string; name: string | null; photo: string | null };
};

export type SharerJoinedEvent = { busId: string; sharer: BusSharer };
export type SharerLeftEvent = { busId: string; reason: StopReason };
export type ReportUpdateEvent = {
  busId: string;
  accurate: number;
  inaccurate: number;
  total: number;
};
export type WarningIssuedEvent = { message: string; flagScore: number };
export type SharerBlockedEvent = {
  reason: BlockReason | "temporary" | "permanent";
  blockedUntil?: string | null;
  blockCount?: number;
  isPermanent?: boolean;
};
export type WsErrorEvent = { message: string };
