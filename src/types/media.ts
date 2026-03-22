export enum MediaFeatureName {
  MEDIA = "media",
  PROFILE = "profile",
  BOOK = "book",
  USER = "user",
  PRODUCT = "product",
  UNIVERSITY = "university",
  FOOD = "food",
  CATEGORY = "category",
  LOST_AND_FOUND = "lost-and-found",
  SHOP = "shop",
  BANNER = "banner",
}

export enum MediaFileType {
  VIDEO = "video",
  IMAGE = "image",
}

export interface MediaInterface {
  _id?: string;
  url: string;
  size: number;
  type: MediaFileType;
  mimetype: string;
  createdAt?: Date;
}

export interface UploadFileSuccessResponse {
  data: MediaInterface;
}
