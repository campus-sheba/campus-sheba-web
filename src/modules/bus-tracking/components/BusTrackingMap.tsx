"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type BusMapPoint = {
  code: string;
  name: string;
  lat: number;
  lng: number;
  isLive: boolean;
  heading?: number;
};

const DEFAULT_CENTER: L.LatLngTuple = [23.8792, 90.2668];

type Props = {
  points: BusMapPoint[];
  selectedCode: string | null;
  onSelect: (code: string) => void;
};

export default function BusTrackingMap({ points, selectedCode, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.CircleMarker>>(new Map());
  const didFitRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const map = L.map(containerRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView(DEFAULT_CENTER, 15);
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const markers = markersRef.current;
    return () => {
      map.remove();
      mapRef.current = null;
      markers.clear();
      didFitRef.current = false;
    };
  }, []);

  // Sync markers with points (create / move / remove).
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const seen = new Set<string>();
    for (const p of points) {
      if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng)) continue;
      seen.add(p.code);
      const isSelected = p.code === selectedCode;
      const fill = p.isLive ? "#00A651" : "#94a3b8";
      let marker = markersRef.current.get(p.code);
      if (!marker) {
        marker = L.circleMarker([p.lat, p.lng], {
          radius: isSelected ? 12 : 9,
          color: "#ffffff",
          weight: 2,
          fillColor: fill,
          fillOpacity: 0.95,
        }).addTo(map);
        marker.on("click", () => onSelect(p.code));
        markersRef.current.set(p.code, marker);
      } else {
        marker.setLatLng([p.lat, p.lng]);
        marker.setStyle({ fillColor: fill, radius: isSelected ? 12 : 9 });
      }
      marker.bindTooltip(`${p.name}${p.isLive ? " • live" : ""}`, { direction: "top" });
    }

    // Remove markers for buses no longer present.
    for (const [code, marker] of markersRef.current) {
      if (!seen.has(code)) {
        map.removeLayer(marker);
        markersRef.current.delete(code);
      }
    }

    // Fit once to all live points on first render with data.
    if (!didFitRef.current) {
      const live = points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
      if (live.length > 0) {
        const bounds = L.latLngBounds(live.map((p) => [p.lat, p.lng] as L.LatLngTuple));
        map.fitBounds(bounds, { padding: [56, 56], maxZoom: 16 });
        didFitRef.current = true;
      }
    }
  }, [points, selectedCode, onSelect]);

  // Fly to the selected bus when it has a location.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedCode) return;
    const p = points.find((x) => x.code === selectedCode);
    if (!p || !Number.isFinite(p.lat) || !Number.isFinite(p.lng)) return;
    map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 16), { duration: 0.5 });
  }, [selectedCode, points]);

  return (
    <div
      ref={containerRef}
      className="z-0 h-[min(52vh,520px)] min-h-[300px] w-full rounded-2xl shadow-inner md:h-full md:min-h-[520px]"
    />
  );
}
