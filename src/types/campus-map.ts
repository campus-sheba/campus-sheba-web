export type CampusMapUniversityRef = {
  _id: string;
  name?: string;
};

export type CampusMapLocation = {
  _id: string;
  name?: string;
  slug?: string;
  type?: string;
  latitude?: number;
  longitude?: number;
  description?: string;
  isPopular?: boolean;
  priority?: number;
  isActive?: boolean;
  university?: string | CampusMapUniversityRef;
  createdAt?: string;
  updatedAt?: string;
};

export type CampusMapListResponse = {
  page: number;
  limit: number;
  total: number;
  data: CampusMapLocation[];
};

export const CAMPUS_LOCATION_TYPES = [
  "",
  "academic",
  "hall",
  "food",
  "transport",
  "hangout",
  "lake",
  "cultural",
] as const;

export type CampusLocationTypeFilter = (typeof CAMPUS_LOCATION_TYPES)[number];
