/** API-aligned campus parcel delivery types. */

export type ParcelSize = "Small" | "Medium" | "Large";

export type ParcelStatus =
  | "Pending"
  | "Picked Up"
  | "In Transit"
  | "Delivered"
  | "Cancelled";

export type ParcelPaymentMethod = "Cash on Delivery" | "Wallet" | "Online";

export type ParcelPhoto = {
  url: string;
  key?: string;
  size?: number;
  _id?: string;
};

export type Parcel = {
  _id: string;
  parcelId?: string;
  pickupLocation?: string | { _id: string; name?: string };
  pickupDetails?: string;
  deliveryLocation?: string | { _id: string; name?: string };
  deliveryDetails?: string;
  recipientName?: string;
  recipientPhone?: string;
  size?: ParcelSize;
  estimatedWeight?: string;
  description?: string;
  photos?: ParcelPhoto[];
  paymentMethod?: ParcelPaymentMethod;
  codAmount?: number;
  deliveryFee?: number;
  baseFee?: number;
  status?: ParcelStatus;
  sender?: string | unknown;
  university?: string;
  sourceModule?: string;
  linkedLostFoundPostId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateParcelPayload = {
  pickupLocation: string;
  pickupDetails: string;
  deliveryLocation: string;
  deliveryDetails: string;
  recipientName: string;
  recipientPhone: string;
  size: ParcelSize;
  estimatedWeight?: string;
  description?: string;
  photos?: { url: string; key: string; size: number }[];
  paymentMethod: ParcelPaymentMethod;
  codAmount?: number;
};

export type ParcelEstimatePayload = {
  pickupLocation: string;
  deliveryLocation: string;
  size: ParcelSize;
  estimatedWeight?: string;
};
