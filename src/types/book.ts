export type BookCategory = {
    _id: string;
    type?: string;
    title: string;
    icon?: string;
    description?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type BookUniversity = {
    _id: string;
    name: string;
    shortName: string;
    coverPhoto?: string;
    logo?: string;
};

export type BookListingType = "Sell" | "Lend" | "Donate";

export type BookListing = {
    _id: string;
    title: string;
    brand?: string;
    modelName?: string;
    author?: string;
    edition?: string;
    isbn?: string;
    publication?: string;
    department?: string;
    semester?: string;
    slug: string;
    photos: Array<{ url: string; key?: string; size?: number; _id?: string }>;
    category?: BookCategory | string;
    university?: BookUniversity | string;
    address?: string | { _id: string };
    description?: string;
    status?: string;
    price: number;
    negotiable?: boolean;
    quantity?: number;
    condition?: string;
    listingType?: BookListingType;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
    createdAt?: string;
    updatedAt?: string;
};

export type BookPaginatedResponse = {
    page: number;
    limit: number;
    total: number;
    data: BookListing[];
};

export type BookPhotoPayload = {
    url: string;
    key: string;
    size: number;
};

export type CreateBookListingPayload = {
    title: string;
    brand?: string;
    modelName?: string;
    author?: string;
    edition?: string;
    isbn?: string;
    publication?: string;
    department?: string;
    semester?: string;
    listingType?: BookListingType;
    addressId: string;
    photos: BookPhotoPayload[];
    category: string;
    description: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    condition: string;
    price: number;
    negotiable: boolean;
    quantity: number;
};

export type UpdateBookListingPayload = CreateBookListingPayload;
