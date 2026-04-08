const baseURL = process.env.BASE_URL || process.env.NEXT_PUBLIC_API_URL;


export const landingPageEndpoints = {
    heroBanner: `${baseURL}/banners`,
    heroBannerByUniversity: (universityId: string) =>
        `${baseURL}/banners?page=1&limit=10&isActive=true&type=home&university=${universityId}`,
    universityFeatures: (universityId: string) =>
        `${baseURL}/user/features/university/${universityId}`,
};

// careers page endpoints
export const careersEndpoints = {
    universities: `${baseURL}/universities`,
    universityLocations: `${baseURL}/university-locations`,
    sendApplication: `${baseURL}/career/send-cv`,
};

export const authenticationEndpoints = {
    signupSendOtp: `${baseURL}/auth/signup/send-otp`,
    signupVerifyOtp: `${baseURL}/auth/signup/verify-otp`,
    signupComplete: `${baseURL}/auth/signup/complete`,
    login: `${baseURL}/auth/login`,
    refresh: `${baseURL}/auth/refresh`,
    logout: `${baseURL}/auth/logout`,
};

export const userEndpoints = {
    me: `${baseURL}/user/me`,
    categories: `${baseURL}/user/categories`,
    lostAndFound: `${baseURL}/user/lost-and-found`,
    addresses: `${baseURL}/addresses`,
};

export const mediaEndpoints = {
    upload: `${baseURL}/media2/upload`,
    delete: `${baseURL}/media2`,
};

export const cartEndpoints = {
    cart: `${baseURL}/cart`,
    increase: `${baseURL}/cart/increase`,
    decrease: `${baseURL}/cart/decrease`,
    clear: `${baseURL}/cart/clear`,
    applyCoupon: `${baseURL}/cart/apply-coupon`,
    removeCoupon: `${baseURL}/cart/remove-coupon`,
    checkout: `${baseURL}/cart/checkout`,
};

export const bookEndpoints = {
    creatorBase: `${baseURL}/creator/books`,
    creatorSell: `${baseURL}/creator/books/sell`,
    creatorLend: `${baseURL}/creator/books/lend`,
    creatorDonate: `${baseURL}/creator/books/donate`,
    creatorOwn: `${baseURL}/creator/books/own`,
    creatorById: (bookId: string) => `${baseURL}/creator/books/${bookId}`,
    userBase: `${baseURL}/user/books`,
    userBorrowable: `${baseURL}/user/books/borrowable`,
    userMyListed: `${baseURL}/user/books/my-listed`,
    userBorrowed: `${baseURL}/user/books/borrowed`,
    userById: (bookId: string) => `${baseURL}/user/books/${bookId}`,
    borrowingRequest: `${baseURL}/book-borrowing/request`,
};

export const buySellEndpoints = {
    creatorBase: `${baseURL}/creator/buy-sell`,
    creatorOwn: `${baseURL}/creator/buy-sell/own`,
    creatorById: (id: string) => `${baseURL}/creator/buy-sell/${id}`,
    userBase: `${baseURL}/user/buy-sell`,
    userMyListed: `${baseURL}/user/buy-sell/my-listed`,
    userById: (id: string) => `${baseURL}/user/buy-sell/${id}`,
};