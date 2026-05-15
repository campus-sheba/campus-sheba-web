/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import CampusLocationDetailContent from "./CampusLocationDetailContent";
import { fetchCampusMapLocationBySlugAction } from "@/services/campus-map";
import { fetchUniversityByShortName } from "@/services/universities";
import type { CampusMapLocation } from "@/types/campus-map";

export default function CampusLocationSlugDetail() {
  const params = useParams();
  const campus = typeof params?.campus === "string" ? params.campus : "";
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const [loc, setLoc] = useState<CampusMapLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!campus || !slug) {
      setLoading(false);
      setError("Invalid link");
      return;
    }
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const university = await fetchUniversityByShortName(campus);
      if (cancelled) return;
      if (!university?._id) {
        setLoc(null);
        setError("University not found");
        setLoading(false);
        return;
      }
      const res = await fetchCampusMapLocationBySlugAction(slug, university._id);
      if (cancelled) return;
      if (res.success && res.data) {
        setLoc(res.data);
        setError(null);
      } else {
        setLoc(null);
        setError(res.message ?? "Not found.");
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [campus, slug]);

  return <CampusLocationDetailContent location={loc} loading={loading} error={error} />;
}
