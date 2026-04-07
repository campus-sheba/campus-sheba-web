export type ShopCategoryKind = "Food" | "Product" | "Service" | "Logistics" | "General";

export interface ShopCategory {
  _id: string;
  type: string;
  title: string;
  icon?: string;
  description?: string;
  parent?: string;
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

export interface DeliveryPolicyForm {
  zoneName: string;
  maxRadiusKm: number;
  baseDeliveryFee: number;
  minOrderForFreeDelivery: number;
}

export interface InventoryPolicyForm {
  allowBackOrder: boolean;
  maxOrderPerUser: number;
}

export interface ServiceSlaForm {
  responseTimeHours: number;
  revisionPolicy: string;
}

export interface ConnectorConfigForm {
  provider: string;
  merchantCode: string;
  hubId: string;
  coverageArea: string;
  deliveryFeeModel: string;
}

export interface DynamicShopFormState {
  type: "Student Shop" | "Startup";
  categoryId: string;
  subCategoryIds: string[];
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
  isActive: boolean;
  isAggregator: boolean;
  isSkillBased: boolean;
  preOrderPolicy: PreOrderPolicyForm;
  deliveryPolicy: DeliveryPolicyForm;
  inventoryPolicy: InventoryPolicyForm;
  serviceSla: ServiceSlaForm;
  connector: ConnectorConfigForm;
}

export interface OwnerAddShopPayload {
  type: "Student Shop" | "Startup";
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
  isActive?: boolean;
}

export interface AdvancedShopConfig {
  deliveryPolicy?: DeliveryPolicyForm;
  inventoryPolicy?: InventoryPolicyForm;
  serviceSla?: ServiceSlaForm;
  connector?: ConnectorConfigForm;
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

export const SHOP_TYPE_NOTES: Record<ShopCategoryKind, string> = {
  Food: "Enable pre-order windows, aggregator mode, and delivery connector-ready settings.",
  Product: "Manage inventory behavior and per-user purchase limits for student demand peaks.",
  Service: "Set service SLA standards and revision policy to build trust and transparency.",
  Logistics: "Configure zone coverage and connector details for campus pickup and rider dispatch.",
  General: "Configure core shop details and launch quickly with editable operational policies.",
};