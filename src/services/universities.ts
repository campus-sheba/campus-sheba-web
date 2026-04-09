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
