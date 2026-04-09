"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import {
  mapUniversityFeaturesToServicesMenu,
  servicesMenu as fallbackServicesMenu,
} from "@/components/siteSettings/navbar/navbar.constants";
import { ContentWrapper } from "@/components/wrappers";
import { useAppState } from "@/contexts/AppStateContext";
import { fetchUniversityFeatures } from "@/services/home";
import { ModuleOverlayItem } from "../types";
import { ModuleButton } from "./ModuleButton";

export function FeaturesSection() {
  const { state } = useAppState();
  const selectedUniversityId = state.university.selected?._id;
  const [dynamicModules, setDynamicModules] = useState<ModuleOverlayItem[]>([]);

  const fallbackModules = useMemo<ModuleOverlayItem[]>(
    () =>
      fallbackServicesMenu.slice(0, 7).map((item, index) => ({
        id: `fallback-${index}`,
        label: item.label,
        icon: item.icon,
        color: item.color.includes("text-") ? "#334155" : item.color,
        bg: item.bg.includes("bg-") ? "#F8FAFC" : item.bg,
        href: item.href,
      })),
    [],
  );

  useEffect(() => {
    const loadUniversityFeatures = async () => {
      if (!selectedUniversityId) {
        setDynamicModules(fallbackModules);
        return;
      }

      try {
        const features = await fetchUniversityFeatures(selectedUniversityId);
        const mapped = mapUniversityFeaturesToServicesMenu(features).slice(
          0,
          7,
        );
        if (!mapped.length) {
          setDynamicModules(fallbackModules);
          return;
        }

        setDynamicModules(
          mapped.map((item, index) => ({
            id: `feature-${index}`,
            label: item.label,
            icon: item.icon,
            color: item.color.includes("text-") ? "#334155" : item.color,
            bg: item.bg.includes("bg-") ? "#F8FAFC" : item.bg,
            href: item.href,
          })),
        );
      } catch {
        setDynamicModules(fallbackModules);
      }
    };

    void loadUniversityFeatures();
  }, [fallbackModules, selectedUniversityId]);

  return (
    <ContentWrapper maxWidth="container" padding="none">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 xl:grid-cols-8">
        {dynamicModules.map((module) => (
          <ModuleButton
            key={module.id}
            icon={module.icon}
            label={module.label}
            color={module.color}
            bg={module.bg}
            href={module.href}
          />
        ))}
        <Link
          href="/services"
          className="module-card group flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#00A651]/40 p-1 py-3 text-center transition hover:border-[#00A651] hover:shadow-lg md:p-4"
        >
          <div
            className="flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-200 group-hover:scale-110 group-hover:shadow-md md:h-14 md:w-14"
            style={{ background: "#F0FFF7" }}
          >
            <LayoutGrid
              className="h-5 w-5 md:h-7 md:w-7"
              style={{ color: "#00A651" }}
              strokeWidth={1.8}
            />
          </div>
          <p
            className="text-xs font-semibold leading-tight md:text-sm"
            style={{ color: "#00A651" }}
          >
            Explore All
          </p>
        </Link>
      </div>
    </ContentWrapper>
  );
}
