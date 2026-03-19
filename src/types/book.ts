export type BookCategory = "Textbook" | "Notebook" | "Reference" | "Novel" | "Lab Manual" | "Study Guide" | "Question Bank" | "Other";
export type BookCondition = "New" | "Like New" | "Good" | "Acceptable";
export type ListingType = "Sell" | "Rent";
export type FilterType = "All" | "For Sale" | "For Rent";

export interface Book {
    id: string;
    title: string;
    author: string;
    category: BookCategory;
    condition: BookCondition;
    listingType: ListingType;
    sellingPrice?: number;
    originalPrice?: number;
    rentalPrice?: number;
    description: string;
    department: string;
    semester: string;
    location: string;
    postedTime: string;
    subject: string;
    seller: SellerInfo;
    images?: string[];
}

export interface SellerInfo {
    id: string;
    name: string;
    phone: string;
    email: string;
    rating?: number;
    totalListings?: number;
}

export interface BookListingForm {
    listingType: ListingType;
    title: string;
    author: string;
    subject: string;
    category: BookCategory;
    condition: BookCondition;
    description: string;
    sellingPrice?: number;
    originalPrice?: number;
    rentalPrice?: number;
    department: string;
    semester: string;
    location: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
}

export interface Department {
    id: string;
    name: string;
}

export interface BookListingResponse {
    success: boolean;
    message: string;
    data?: Book;
}
