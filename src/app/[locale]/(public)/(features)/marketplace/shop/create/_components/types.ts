export type CreateFlowCategory = "Food" | "Product" | "Service";

export interface ShopCategory {
  _id: string;
  type: string;
  title: string;
  icon?: string;
  description?: string;
  parent?: string;
}

export interface ShopCreateCategoryOption {
  kind: CreateFlowCategory;
  label: string;
  description: string;
  categoryId: string;
  available: boolean;
}

export interface SlotForm {
  open: string;
  close: string;
}

export interface OperatingHourForm {
  day: string;
  isClosed: boolean;
  slots: SlotForm[];
}

export interface PhotoForm {
  url: string;
  key: string;
  size: number;
}

export interface SocialLinksForm {
  facebook: string;
  instagram: string;
  twitter: string;
  whatsapp: string;
}

export interface PreOrderPolicyForm {
  isPreOrderOnly: boolean;
  leadTimeHours: number;
  nextDeliveryDate: string;
}

export interface ShopCreateFormState {
  type: "Student Shop";
  name: string;
  description: string;
  address: string;
  logo: PhotoForm;
  coverPhoto: PhotoForm;
  contactEmail: string;
  phoneNumber: string;
  website: string;
  socialLinks: SocialLinksForm;
  minimumOrderAmount: number;
  operatingHours: OperatingHourForm[];
  latitude: string;
  longitude: string;
  tagsText: string;
  preOrderPolicy: PreOrderPolicyForm;
}

export interface OwnerAddShopPayload {
  type: "Student Shop";
  category: string;
  subCategories?: string[];
  name: string;
  description?: string;
  address?: string;
  logo: {
    url: string;
    key: string;
    size: number;
  };
  coverPhoto: {
    url: string;
    key: string;
    size: number;
  };
  contactEmail?: string;
  phoneNumber?: string;
  website?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
  minimumOrderAmount: number;
  operatingHours?: {
    day: string;
    isClosed: boolean;
    slots: {
      open: string;
      close: string;
    }[];
  }[];
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  isAggregator?: boolean;
  isSkillBased?: boolean;
  tags?: string[];
  preOrderPolicy?: {
    isPreOrderOnly: boolean;
    leadTimeHours: number;
    nextDeliveryDate?: string;
  };
}

export const OPERATING_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const CATEGORY_MINIMUM_ORDER: Record<CreateFlowCategory, number> = {
  Food: 100,
  Product: 300,
  Service: 0,
};