/** Blood donor & emergency request types — CSFS-005 */

export const BLOOD_GROUPS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
] as const;

export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export type DonorAvailabilityStatus =
  | "Available"
  | "Not Available"
  | "Recently Donated"
  | "Temporarily Unavailable";

export type BloodRequestStatus =
  | "Draft"
  | "Pending Moderation"
  | "Active"
  | "Partially Fulfilled"
  | "Fulfilled"
  | "Expired"
  | "Cancelled";

export type BloodRequestUrgency = "Urgent" | "Moderate" | "Planned";

export type DonationTypeEnum = "Whole Blood" | "Platelets" | "Plasma";

export type DonorContactPreference = "Call" | "WhatsApp" | "Any";

export type DonorPrivacySetting = "Public" | "Anonymous";

export type DonorResponseStatus = "I Can Help" | "Committed" | "Donated" | "Cancelled";

export type ClubVerificationStatus = "Pending" | "Verified" | "Rejected";

export const DONATION_TYPES: DonationTypeEnum[] = ["Whole Blood", "Platelets", "Plasma"];
export const CONTACT_PREFERENCES: DonorContactPreference[] = ["Call", "WhatsApp", "Any"];
export const URGENCY_LEVELS: BloodRequestUrgency[] = ["Urgent", "Moderate", "Planned"];

export type BloodDonorUserRef = {
  _id?: string;
  phone?: string;
  name?: string;
  gender?: string;
  photo?: { url?: string } | null;
  department?: string;
  hall?: string;
};

export type RespondedDonorEntry = {
  donor: string;
  status: DonorResponseStatus;
  respondedAt?: string;
  committedAt?: string;
  donatedAt?: string;
};

export type BloodDonorRow = {
  _id: string;
  user?: BloodDonorUserRef;
  university?: string;
  bloodGroup: BloodGroup | string;
  isAvailable?: boolean;
  availabilityStatus?: DonorAvailabilityStatus | string;
  temporarilyUnavailableUntil?: string | null;
  lastDonationDate?: string;
  campusLocation?: string;
  department?: string;
  hall?: string;
  phoneNumber?: string;
  email?: string;
  emergencyContact?: string;
  donationCount?: number;
  donationType?: DonationTypeEnum | string;
  contactPreference?: DonorContactPreference | string;
  privacySetting?: DonorPrivacySetting | string;
  weight?: number;
  dateOfBirth?: string;
  notes?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type BloodDonorProfile = BloodDonorRow;

export type BloodRequestRow = {
  _id: string;
  requestedBy?: BloodDonorUserRef;
  university?: string;
  bloodGroup: BloodGroup | string;
  urgencyLevel: BloodRequestUrgency | string;
  hospital?: string;
  location?: string;
  contactNumber?: string;
  patientName?: string;
  requiredUnits?: number;
  fulfilledUnits?: number;
  additionalInfo?: string;
  status?: BloodRequestStatus | string;
  expiresAt?: string;
  flagWindowUntil?: string | null;
  respondedDonors?: RespondedDonorEntry[];
  createdAt?: string;
  updatedAt?: string;
};

export type DonorEligibility = {
  donationType: DonationTypeEnum;
  eligible: boolean;
  reason?: string;
};

export type DonorStats = {
  totalDonors: number;
  availableDonors: number;
  activeRequests: number;
  donorsByBloodGroup: { _id: string; count: number }[];
};

export type DonationHistoryRequest = {
  _id: string;
  bloodGroup?: string;
  hospital?: string;
  urgencyLevel?: string;
};

export type DonationHistory = {
  _id: string;
  request?: DonationHistoryRequest | null;
  donationType?: DonationTypeEnum | string;
  donationDate?: string;
  centre?: string;
  units?: number;
  donorConfirmed?: boolean;
  requesterConfirmed?: boolean;
  milestoneBadge?: string | null;
  gratitudeNote?: string;
  notes?: string;
};

export type BloodDonorClub = {
  _id: string;
  name: string;
  university?: string;
  foundedYear?: number;
  description?: string;
  activeMemberCount?: number;
  contactPerson?: string;
  contactPhone?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    [key: string]: string | undefined;
  };
  verificationStatus?: ClubVerificationStatus | string;
  followersCount?: number;
  isActive?: boolean;
  createdAt?: string;
};

export type RegisterBloodDonorPayload = {
  bloodGroup: BloodGroup | string;
  phoneNumber: string;
  dateOfBirth?: string;
  weight?: number;
  donationType?: DonationTypeEnum | string;
  contactPreference?: DonorContactPreference | string;
  privacySetting?: DonorPrivacySetting | string;
  email?: string;
  hall?: string;
  department?: string;
  campusLocation?: string;
  lastDonationDate?: string;
  emergencyContact?: string;
  notes?: string;
};

export type UpdateBloodDonorPayload = {
  isAvailable?: boolean;
  availabilityStatus?: DonorAvailabilityStatus;
  weight?: number;
  donationType?: DonationTypeEnum | string;
  contactPreference?: DonorContactPreference | string;
  privacySetting?: DonorPrivacySetting | string;
  phoneNumber?: string;
  email?: string;
  hall?: string;
  department?: string;
  campusLocation?: string;
  lastDonationDate?: string;
  emergencyContact?: string;
  notes?: string;
};

export type ToggleAvailabilityPayload = {
  isAvailable: boolean;
  unavailableUntil?: string;
};

export type FindBloodDonorsParams = {
  page?: number;
  limit?: number;
  university?: string;
  bloodGroup?: string;
  search?: string;
  hall?: string;
  department?: string;
  campusLocation?: string;
  isAvailable?: boolean;
};

export type BloodDonorsFindResponse = {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  data: BloodDonorRow[];
};

export type BloodRequestsListParams = {
  page?: number;
  limit?: number;
  status?: BloodRequestStatus | string;
  urgencyLevel?: BloodRequestUrgency | string;
  university?: string;
};

export type BloodRequestsListResponse = {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  data: BloodRequestRow[];
};

export type CreateBloodRequestPayload = {
  bloodGroup: BloodGroup | string;
  urgencyLevel: BloodRequestUrgency | string;
  hospital?: string;
  location: string;
  contactNumber: string;
  patientName?: string;
  requiredUnits?: number;
  additionalInfo?: string;
};

export type LogDonationPayload = {
  requestId?: string;
  donationType?: DonationTypeEnum | string;
  donationDate?: string;
  centre?: string;
  units?: number;
  notes?: string;
};

export type DonationHistoryResponse = {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  data: DonationHistory[];
};

export type GetClubsParams = {
  university?: string;
  verified?: boolean;
  page?: number;
  limit?: number;
};

export type CreateClubPayload = {
  name: string;
  foundedYear?: number;
  description?: string;
  contactPerson?: string;
  contactPhone?: string;
};
