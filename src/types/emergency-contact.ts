export type EmergencyContact = {
  _id: string;
  university?: string;
  category: string;
  name: string;
  description?: string;
  location?: string;
  phoneNumbers?: string[];
  hasSMS?: boolean;
  priority?: number;
  tags?: string[];
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
