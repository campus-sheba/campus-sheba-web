export type ShopImagePayload = {
  url: string;
  key: string;
  size: number;
};

export type ShopOperatingSlot = { open: string; close: string };

export type ShopOperatingDayPayload = {
  day: string;
  isClosed: boolean;
  slots: ShopOperatingSlot[];
};

export type ShopSocialLinksPayload = {
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  whatsapp?: string | null;
};

/** POST /api/owner/shops — `type: "Student Shop"` is injected by the server action */
export type CreateStudentShopBody = {
  category: string;
  subCategories: string[];
  name: string;
  description: string;
  address: string;
  logo: ShopImagePayload;
  coverPhoto: ShopImagePayload;
  contactEmail?: string | null;
  phoneNumber: string;
  website?: string | null;
  socialLinks: ShopSocialLinksPayload;
  minimumOrderAmount: number;
  operatingHours: ShopOperatingDayPayload[];
  isAggregator: boolean;
  isSkillBased: boolean;
  tags?: string[];
  location?: { type: "Point"; coordinates: [number, number] };
  preOrderPolicy?: {
    isPreOrderOnly: boolean;
    leadTimeHours: number;
    nextDeliveryDate?: string;
  };
  isActive?: boolean;
};
