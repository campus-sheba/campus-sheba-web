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
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 xl:grid-cols-8">
          {skeletonCards.map((_, index) => (
            <div
              key={`features-skeleton-${index}`}
              className="h-[90px] animate-pulse rounded-xl border border-neutral-200 bg-neutral-100 md:h-[112px]"
            />
          ))}
        </div>
      </ContentWrapper>
    );
  }

  return (
    <ContentWrapper maxWidth="container" padding="none">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-3 xl:grid-cols-7">
        {dynamicModules.map((module) => (
          <ModuleButton
            key={module.id}
            label={module.label}
            href={module.href}
            iconUrl={module.iconUrl}
          />
        ))}
      </div>
    </ContentWrapper>
  );
}
