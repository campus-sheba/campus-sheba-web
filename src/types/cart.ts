/* eslint-disable @typescript-eslint/no-explicit-any */



export interface CartItemContent {
    _id: string;
    title: string;
    slug: string;
    description: string;
    owner: string;
    university: string;
    category: string;
    address: string;
    type: string;
    status: string;
    price: number;
    discountPrice?: number;
    quantity: number;
    photos: { url: string; key: string; size: number }[];
    isActive: boolean;
    isDeleted: boolean;
    condition: string;
    isNegotiable: boolean;
    isFeatured: boolean;
    viewCount: number;
    contactName: string;
    contactPhone: string;
    createdAt: string;
    updatedAt: string;
}

export interface CartItem {
    content: CartItemContent;
    quantity: number;
    type: string;
    _id: string;
    createdAt: string;
    updatedAt: string;
}

export interface Cart {
    _id: string;
    user: string;
    items: CartItem[];
    createdAt: string;
    updatedAt: string;
    groupedByShop: any[];
    otherItems: CartItem[];
}
