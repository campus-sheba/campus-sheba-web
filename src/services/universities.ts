"use server";

import { getPublic } from "@/utils/api/get";
import { careersEndpoints } from "@/utils/endpoints/endpoints";
import type { University } from "@/types/global";

interface UniversitiesResponse {
  page: number;
  limit: number;
  total: number;
  data: University[];
}

export async function fetchUniversities(page = 1, limit = 100): Promise<University[]> {
  const url = `${careersEndpoints.universities}?page=${page}&limit=${limit}&isActive=true`;
  const response = await getPublic<UniversitiesResponse>(url, { includeUniversity: false });
  return response.data ?? [];
}

export async function fetchUniversityById(id: string): Promise<University | null> {
  if (!id) return null;
  const url = `${careersEndpoints.universities}/${id}`;
  return getPublic<University>(url, { includeUniversity: false });
}

export async function fetchUniversityByShortName(shortName: string): Promise<University | null> {
  const trimmed = shortName?.trim();
  if (!trimmed) return null;
  const universities = await fetchUniversities(1, 200);
  const lowered = trimmed.toLowerCase();
  return (
    universities.find((uni) => uni.shortName?.toLowerCase() === lowered) ??
    universities.find((uni) => uni.name?.toLowerCase() === lowered) ??
    null
  );
}
