export type UserAddressType = "DELIVERY" | "PICKUP";

export type UserAddress = {
  _id: string;
  address: string;
  type: UserAddressType;
  latitude: number;
  longitude: number;
  description: string | null;
  isDefault: boolean;
  user: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateAddressPayload = {
  latitude: number;
  longitude: number;
  type: UserAddressType;
  address: string;
  description?: string;
  isDefault?: boolean;
};

export type UpdateAddressPayload = {
  latitude?: number;
  longitude?: number;
  address?: string;
  description?: string | null;
  isDefault?: boolean;
};
