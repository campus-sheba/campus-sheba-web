"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ContentWrapper } from "@/components/wrappers";
import { useAppState } from "@/contexts/AppStateContext";
import { fetchUniversityFeatures } from "@/services/home";
import { ModuleOverlayItem } from "../types";
import { ModuleButton } from "./ModuleButton";

export function FeaturesSection() {
  const { state } = useAppState();
  const selectedUniversityId = state.university.selected?._id;
  const [dynamicModules, setDynamicModules] = useState<ModuleOverlayItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const skeletonCards = useMemo(() => Array.from({ length: 8 }), []);

  useEffect(() => {
    const loadUniversityFeatures = async () => {
      if (!selectedUniversityId) {
        setDynamicModules([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const features = await fetchUniversityFeatures(selectedUniversityId);
        setDynamicModules(
          features
            .filter((feature) => feature.isActive)
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((feature) => ({
              id: feature._id,
              label: feature.title,
              href: feature.routeName,
              iconUrl: feature.icon?.url,
            })),
        );
      } catch {
        setDynamicModules([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadUniversityFeatures();
  }, [selectedUniversityId]);

  if (isLoading) {
    return (
      <ContentWrapper maxWidth="container" padding="none">
        <div className="rounded-3xl border border-emerald-100/60 bg-gradient-to-br from-emerald-50/60 via-white to-sky-50/60 p-4 sm:p-6">
         
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {skeletonCards.map((_, index) => (
              <div
                key={`features-skeleton-${index}`}
                className="h-[110px] animate-pulse rounded-2xl border border-emerald-100/60 bg-white/70"
              />
            ))}
          </div>
        </div>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper maxWidth="container" padding="none">
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {dynamicModules.map((module) => (
          <ModuleButton
            key={module.id}
            label={module.label}
            href={module.href}
            iconUrl={module.iconUrl}
          />
        ))}
        {/* explore all */}
        <ModuleButton
          label="Explore All"
          href="/explore"
          iconUrl="/search.png"
          color="#475569"
          bg="#E2E8F0"
        />
      </div>
    </ContentWrapper>
  );
}
