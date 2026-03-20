import { University } from "@/types/global";
import { careersEndpoints } from "@/utils/endpoints/endpoints";

export interface UniversitiesResponse {
  page: number;
  limit: number;
  total: number;
  data: University[];
}

/**
 * Fetch all universities from the API
 * @param page Page number (default: 1)
 * @param limit Items per page (default: 100)
 * @returns List of universities
 */
export const fetchUniversities = async (
  page: number = 1,
  limit: number = 100
): Promise<University[]> => {
  try {
    const url = `${careersEndpoints.universities}?page=${page}&limit=${limit}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch universities: ${response.statusText}`);
    }

    const data: UniversitiesResponse = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Error fetching universities:", error);
    return [];
  }
};

/**
 * Fetch a single university by ID
 * @param id University ID
 * @returns University or null
 */
export const fetchUniversityById = async (id: string): Promise<University | null> => {
  try {
    const url = `${careersEndpoints.universities}/${id}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch university: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching university:", error);
    return null;
  }
};
