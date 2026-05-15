"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { CampusMapLocation } from "@/types/campus-map";

function validCoord(loc: CampusMapLocation): loc is CampusMapLocation & { latitude: number; longitude: number } {
  return (
    typeof loc.latitude === "number" &&
    typeof loc.longitude === "number" &&
    Number.isFinite(loc.latitude) &&
    Number.isFinite(loc.longitude)
  );
}

function typeColor(type?: string): string {
  const t = (type ?? "").toLowerCase();
  const m: Record<string, string> = {
    academic: "#2563eb",
    hall: "#7c3aed",
    food: "#ea580c",
    transport: "#475569",
    hangout: "#db2777",
    lake: "#0891b2",
    cultural: "#d97706",
    sports: "#e11d48",
    religious: "#6366f1",
    administrative: "#78716c",
    other: "#059669",
  };
  return m[t] ?? "#00A651";
}

const DEFAULT_CENTER: L.LatLngTuple = [23.8792, 90.2668];

type Props = {
  locations: CampusMapLocation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export default function CampusMapLeaflet({ locations, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.Layer[]>([]);

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

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    layersRef.current.forEach((layer) => {
      map.removeLayer(layer);
    });
    layersRef.current = [];

    const points = locations.filter(validCoord);
    for (const loc of points) {
      const fill = typeColor(loc.type);
      const circle = L.circleMarker([loc.latitude, loc.longitude], {
        radius: 10,
        color: "#ffffff",
        weight: 2,
        fillColor: fill,
        fillOpacity: 0.92,
      }).addTo(map);

      circle.bindPopup(
        `<div class="text-sm font-semibold text-gray-900">${loc.name ?? "Place"}</div>` +
          (loc.type ? `<div class="text-xs text-gray-500 mt-0.5 capitalize">${loc.type}</div>` : ""),
      );
      circle.on("click", () => {
        onSelect(loc._id);
      });
      layersRef.current.push(circle);
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => [p.latitude, p.longitude]));
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 17 });
    } else {
      map.setView(DEFAULT_CENTER, 15);
    }
  }, [locations, onSelect]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const loc = locations.find((l) => l._id === selectedId);
    if (!loc || !validCoord(loc)) return;
    map.flyTo([loc.latitude, loc.longitude], Math.max(map.getZoom(), 16), { duration: 0.55 });
  }, [selectedId, locations]);

  return <div ref={containerRef} className="z-0 h-[min(52vh,520px)] min-h-[280px] w-full rounded-2xl shadow-inner md:h-full md:min-h-[520px]" />;
}
