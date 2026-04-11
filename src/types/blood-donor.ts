/** Blood donor & emergency request APIs (user). */

export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export type DonorAvailabilityStatus = "Available" | "Not Available" | "Recently Donated";

export type BloodRequestStatus = "Open" | "Fulfilled" | "Cancelled";

export type BloodRequestUrgency = "Low" | "Medium" | "High" | "Critical";

export type BloodDonorUserRef = {
  _id?: string;
  phone?: string;
  name?: string;
  gender?: string;
  photo?: { url?: string } | null;
  department?: string;
  hall?: string;
};

export type BloodDonorRow = {
  _id: string;
  user?: BloodDonorUserRef;
  university?: string;
  bloodGroup: BloodGroup | string;
  isAvailable?: boolean;
  availabilityStatus?: DonorAvailabilityStatus | string;
  lastDonationDate?: string;
  campusLocation?: string;
  department?: string;
  hall?: string;
  phoneNumber?: string;
  email?: string;
  emergencyContact?: string;
  donationCount?: number;
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
  additionalInfo?: string;
  status?: BloodRequestStatus | string;
  createdAt?: string;
  updatedAt?: string;
};

export type RegisterBloodDonorPayload = {
  bloodGroup: BloodGroup | string;
  phoneNumber: string;
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
  phoneNumber?: string;
  email?: string;
  hall?: string;
  department?: string;
  campusLocation?: string;
  lastDonationDate?: string;
  emergencyContact?: string;
  notes?: string;
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
