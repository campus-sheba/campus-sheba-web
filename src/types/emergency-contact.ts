export type PhoneEntry = {
  number: string;
  smsCapable?: boolean;
  label?: string;
};

export type ContactVerificationStatus = "active" | "pending-reverification" | "verify-before-calling";

export type ContactIssueType =
  | "unreachable"
  | "wrong-number"
  | "service-unavailable"
  | "number-changed"
  | "other";

export type IssueReportStatus = "submitted" | "under-review" | "resolved";

export type EmergencyContact = {
  _id: string;
  university?: string;
  category: string;
  name: string;
  description?: string;
  location?: string;
  phones: PhoneEntry[];
  is24h: boolean;
  availabilityNote?: string;
  quickDialPosition?: number | null;
  priority?: number;
  tags?: string[];
  isSponsored?: boolean;
  verificationStatus: ContactVerificationStatus;
  lastVerifiedAt?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type EmergencyContactsByCategory = Record<string, EmergencyContact[]>;

export type EmergencyContactsListResponse = {
  page: number;
  limit: number;
  total: number;
  totalPages?: number;
  data: EmergencyContact[];
};

export type ContactIssueReport = {
  _id: string;
  contact: string;
  university: string;
  issueType: ContactIssueType;
  notes?: string;
  reportedBy?: string;
  status: IssueReportStatus;
  resolvedAt?: string;
  resolvedNote?: string;
  createdAt?: string;
  updatedAt?: string;
};
