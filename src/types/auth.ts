export type UserRole = "User" | "Provider" | "DeliveryHero" | "Admin" | string;

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type SignupSendOtpPayload = {
  phone: string;
  role: UserRole;
};

export type SignupVerifyOtpPayload = {
  phone: string;
  code: string;
};

export type SignupCompletePayload = {
  phone: string;
  university: string;
  name: string;
  role: UserRole;
  pin: string;
};

export type LoginPayload = {
  role: UserRole;
  phone: string;
  pin: string;
};

export type ApiEnvelope<T> = {
  data: T;
};

export type SignupSendOtpResponseData = {
  message: string;
  otp?: string;
};

export type GenericMessageResponseData = {
  message: string;
};

export type AuthMe = {
  _id: string;
  email?: string;
  phone: string;
  role?: UserRole;
  photo?: string | null;
  password?: string;
  fcmToken?: string;
  birthDate?: string;
  name?: string;
  gender?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  expirationDate?: string;
  isDeleted?: boolean;
  deletionGracePeriodEndsAt?: string;
  isNotificationEnabled?: boolean;
};
