export type CampusMapUniversityRef = {
  _id: string;
  name?: string;
  shortName?: string;
};

export type CampusMapAccessibility = {
  wheelchair?: boolean;
  lighting?: string | null;
  notes?: string | null;
};

export type CampusMapLocation = {
  _id: string;
  name?: string;
  slug?: string;
  type?: string;
  description?: string;
  whyFamous?: string;
  practicalTips?: string;
  bestTimeToVisit?: string;
  crowdLevel?: string;
  accessibility?: CampusMapAccessibility | null;
  latitude?: number;
  longitude?: number;
  coverImage?: string;
  photoGallery?: string[];
  isPopular?: boolean;
  isFeatured?: boolean;
  isHot?: boolean;
  hotExpiresAt?: string | null;
  priority?: number;
  isActive?: boolean;
  archivedAt?: string | null;
  rating?: number;
  reviewCount?: number;
  submissionStatus?: string;
  submittedBy?: string | null;
  rejectionFeedback?: string | null;
  isCampusCenter?: boolean;
  geofenceRadiusM?: number;
  university?: string | CampusMapUniversityRef;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  isFavourited?: boolean;
  shareLink?: string;
};

export type CampusMapSearchResult = CampusMapLocation & {
  score?: number;
};

export type CampusMapFavourite = {
  _id: string;
  user: string;
  location: CampusMapLocation;
  university: string;
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
  "sports",
  "religious",
  "administrative",
  "other",
] as const;

export type CampusLocationTypeFilter = (typeof CAMPUS_LOCATION_TYPES)[number];
