/** Loose owner-facing shop shape from GET /owner/shops/* */
export type OwnerShop = {
  _id: string;
  name?: string;
  description?: string;
  address?: string;
  status?: string;
  isActive?: boolean;
  kycStatus?: string;
  kycRejectedReason?: string;
  phoneNumber?: string;
  contactEmail?: string | null;
  website?: string | null;
  category?: string | { _id?: string; title?: string };
  subCategories?: string[] | unknown[];
  logo?: { url?: string; key?: string; size?: number };
  coverPhoto?: { url?: string; key?: string; size?: number };
  socialLinks?: Record<string, string | null | undefined>;
  minimumOrderAmount?: number;
  operatingHours?: unknown[];
  tags?: string[];
  isAggregator?: boolean;
  isSkillBased?: boolean;
  location?: { type?: string; coordinates?: number[] };
  [key: string]: unknown;
};

export type ShopKycDocumentPayload = { url: string; key: string };

export type SubmitShopKycPayload = {
  kycDocuments: {
    studentId?: ShopKycDocumentPayload;
    nationalId?: ShopKycDocumentPayload;
    businessLicense?: ShopKycDocumentPayload;
    bankStatement?: ShopKycDocumentPayload;
  };
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    branchName: string;
    routingNumber: string;
  };
};
