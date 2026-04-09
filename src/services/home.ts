"use server";

import { getPublic } from "@/utils/api/get";
import { landingPageEndpoints } from "@/utils/endpoints/endpoints";
import type { UniversityFeature } from "@/components/siteSettings/navbar/navbar.constants";

export interface Banner {
  _id: string;
  title: string;
  description: string;
  photo?: { url: string };
  link?: string;
}

export async function fetchHomeBannersByUniversity(universityId: string): Promise<Banner[]> {
  if (!universityId) return [];
  const response = await getPublic<{ data?: Banner[] }>(
    landingPageEndpoints.heroBannerByUniversity(universityId),
    { universityId },
  );
  return response.data ?? [];
}

export async function fetchUniversityFeatures(universityId: string): Promise<UniversityFeature[]> {
  if (!universityId) return [];
  const response = await getPublic<{ data?: Array<{ feature?: UniversityFeature }> }>(
    landingPageEndpoints.universityFeatures(universityId),
    { universityId },
  );
  return (response.data ?? [])
    .map((item) => item.feature)
    .filter((feature): feature is UniversityFeature => Boolean(feature));
}
