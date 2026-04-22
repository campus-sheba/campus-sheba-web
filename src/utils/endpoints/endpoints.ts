const baseURL = process.env.BASE_URL || process.env.NEXT_PUBLIC_API_URL;


export const landingPageEndpoints = {
    heroBanner: `${baseURL}/banners`,
    heroBannerByUniversity: (universityId: string) =>
        `${baseURL}/banners?page=1&limit=10&isActive=true&type=home&university=${universityId}`,
    heroBannerByUniversityAndType: (universityId: string, bannerType: string) =>
        `${baseURL}/banners?page=1&limit=10&isActive=true&type=${encodeURIComponent(bannerType)}&university=${universityId}`,
    universityFeatures: (universityId: string) =>
        `${baseURL}/user/features/university/${universityId}`,
};

// careers page endpoints
export const careersEndpoints = {
    universities: `${baseURL}/universities`,
    universityLocations: `${baseURL}/university-locations`,
    universityLocationById: (id: string) =>
        `${baseURL}/university-locations/${encodeURIComponent(id)}`,
    sendApplication: `${baseURL}/career/send-cv`,
};

export const emergencyEndpoints = {
    contacts: `${baseURL}/emergency/contacts`,
    contactsByCategory: `${baseURL}/emergency/contacts/by-category`,
    contactById: (id: string) => `${baseURL}/emergency/contacts/${encodeURIComponent(id)}`,
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
    update: `${baseURL}/user`,
    updateLocation: `${baseURL}/user/update-location`,
    categories: `${baseURL}/user/categories`,
    lostAndFound: `${baseURL}/user/lost-and-found`,
    addresses: `${baseURL}/addresses`,
};

export const notificationEndpoints = {
    userBase: `${baseURL}/user/notifications`,
    userById: (id: string) => `${baseURL}/user/notifications/${encodeURIComponent(id)}`,
    userRead: (id: string) => `${baseURL}/user/notifications/${encodeURIComponent(id)}/read`,
    userSubscribe: `${baseURL}/user/notifications/subscribe`,
    userUnsubscribe: `${baseURL}/user/notifications/unsubscribe`,
    guestBase: `${baseURL}/guest/notifications`,
    guestSubscribe: `${baseURL}/guest/notifications/subscribe`,
    guestUnsubscribe: `${baseURL}/guest/notifications/unsubscribe`,
};

export const lostFoundEndpoints = {
    base: `${baseURL}/user/lost-and-found`,
    myPosts: `${baseURL}/user/lost-and-found/my-posts`,
    byId: (id: string) => `${baseURL}/user/lost-and-found/${encodeURIComponent(id)}`,
    resolve: (id: string) => `${baseURL}/user/lost-and-found/${encodeURIComponent(id)}/resolve`,
    cancel: (id: string) => `${baseURL}/user/lost-and-found/${encodeURIComponent(id)}/cancel`,
    resolveRequest: (postId: string) =>
        `${baseURL}/user/lost-and-found/${encodeURIComponent(postId)}/resolve-request`,
    resolveRequestsList: (postId: string) =>
        `${baseURL}/user/lost-and-found/${encodeURIComponent(postId)}/resolve-requests`,
    resolveRequestRespond: (requestId: string) =>
        `${baseURL}/user/lost-and-found/resolve-request/${encodeURIComponent(requestId)}`,
    escalateToParcel: (postId: string) =>
        `${baseURL}/user/lost-and-found/${encodeURIComponent(postId)}/escalate-to-parcel`,
};

export const parcelEndpoints = {
    base: `${baseURL}/user/parcel`,
    estimate: `${baseURL}/user/parcel/estimate`,
    byId: (id: string) => `${baseURL}/user/parcel/${encodeURIComponent(id)}`,
    cancel: (id: string) => `${baseURL}/user/parcel/${encodeURIComponent(id)}/cancel`,
};

export const bloodDonorEndpoints = {
    register: `${baseURL}/blood-donor/register`,
    profile: `${baseURL}/blood-donor/profile`,
    find: `${baseURL}/blood-donor/find`,
    request: `${baseURL}/blood-donor/request`,
    requests: `${baseURL}/blood-donor/requests`,
    myRequests: `${baseURL}/blood-donor/my-requests`,
    requestStatus: (id: string) =>
        `${baseURL}/blood-donor/request/${encodeURIComponent(id)}/status`,
    stats: `${baseURL}/blood-donor/stats`,
};

export const addressEndpoints = {
    base: `${baseURL}/addresses`,
    byId: (id: string) => `${baseURL}/addresses/${encodeURIComponent(id)}`,
};

export const userProfileEndpoints = {
    updateEmailSendCode: `${baseURL}/user/profile/update-email/send-code`,
    updateEmailVerify: `${baseURL}/user/profile/update-email`,
};

export const universityMetadataEndpoints = {
    base: `${baseURL}/university-metadata`,
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

export const chargesEndpoints = {
    query: `${baseURL}/charges/query`,
};

export const walletEndpoints = {
    base: `${baseURL}/wallet`,
    transactions: `${baseURL}/wallet/transactions`,
    topupInitiate: `${baseURL}/wallet/topup/initiate`,
    topupList: `${baseURL}/wallet/topup`,
    withdraw: `${baseURL}/wallet/withdraw`,
    withdrawList: `${baseURL}/wallet/withdraw`,
};

export const orderEndpoints = {
    summary: `${baseURL}/user/orders/summary`,
    /** POST place order, GET list orders (same path, different method). */
    base: `${baseURL}/user/orders`,
    byId: (id: string) => `${baseURL}/user/orders/${encodeURIComponent(id)}`,
    cancel: (id: string) => `${baseURL}/user/orders/${encodeURIComponent(id)}/cancel`,
    cancelItem: (id: string, itemId: string) =>
        `${baseURL}/user/orders/${encodeURIComponent(id)}/items/${encodeURIComponent(itemId)}/cancel`,
};

export const checkoutEndpoints = {
    paymentGateways: `${baseURL}/user/payment-gateways/available`,
    deliveryOptions: `${baseURL}/user/delivery-options/available`,
};

export const bookEndpoints = {
    creatorBase: `${baseURL}/creator/books`,
    creatorSell: `${baseURL}/creator/books/sell`,
    creatorLend: `${baseURL}/creator/books/lend`,
    creatorDonate: `${baseURL}/creator/books/donate`,
    creatorOwn: `${baseURL}/creator/books/own`,
    creatorById: (bookId: string) => `${baseURL}/creator/books/${encodeURIComponent(bookId)}`,
    userBase: `${baseURL}/user/books`,
    userBorrowable: `${baseURL}/user/books/borrowable`,
    userMyListed: `${baseURL}/user/books/my-listed`,
    userBorrowed: `${baseURL}/user/books/borrowed`,
    userById: (bookId: string) => `${baseURL}/user/books/${encodeURIComponent(bookId)}`,
};

export const bookBorrowingEndpoints = {
    request: `${baseURL}/book-borrowing/request`,
    respond: (id: string) => `${baseURL}/book-borrowing/respond/${encodeURIComponent(id)}`,
    returnBook: (id: string) => `${baseURL}/book-borrowing/return/${encodeURIComponent(id)}`,
    extendRequest: (id: string) => `${baseURL}/book-borrowing/extend/${encodeURIComponent(id)}`,
    extendRespond: (borrowId: string, extendId: string) =>
        `${baseURL}/book-borrowing/extend/${encodeURIComponent(borrowId)}/${encodeURIComponent(extendId)}`,
    borrowed: `${baseURL}/book-borrowing/borrowed`,
    lent: `${baseURL}/book-borrowing/lent`,
};

export const buySellEndpoints = {
    creatorBase: `${baseURL}/creator/buy-sell`,
    creatorOwn: `${baseURL}/creator/buy-sell/own`,
    creatorById: (id: string) => `${baseURL}/creator/buy-sell/${id}`,
    userBase: `${baseURL}/user/buy-sell`,
    userMyListed: `${baseURL}/user/buy-sell/my-listed`,
    userById: (id: string) => `${baseURL}/user/buy-sell/${id}`,
};

export const pointsEndpoints = {
    balance: `${baseURL}/points/balance`,
    transactions: `${baseURL}/points/transactions`,
    config: `${baseURL}/points/config`,
    redeem: `${baseURL}/points/redeem`,
};

export const referralEndpoints = {
    validate: (code: string) => `${baseURL}/referral/validate/${encodeURIComponent(code)}`,
    myCode: `${baseURL}/referral/my-code`,
    myReferrals: `${baseURL}/referral/my-referrals`,
    leaderboard: `${baseURL}/referral/leaderboard`,
};

/** Browse shops, products, and food (guest or authenticated; university from cookie or query). */
export const marketplaceEndpoints = {
    /** Legacy direct shop/product endpoints — kept for backward compat. */
    shops: `${baseURL}/user/shops`,
    shopById: (id: string) => `${baseURL}/user/shops/${encodeURIComponent(id)}`,
    products: `${baseURL}/user/products`,
    productsFeatured: `${baseURL}/user/products/featured`,
    productsByShop: (shopId: string) =>
        `${baseURL}/user/products/shop/${encodeURIComponent(shopId)}`,
    productById: (id: string) => `${baseURL}/user/products/${encodeURIComponent(id)}`,
    foods: `${baseURL}/user/foods`,
    foodById: (id: string) => `${baseURL}/user/foods/${encodeURIComponent(id)}`,
    /** New marketplace aggregation endpoints. */
    homeFeed: `${baseURL}/user/marketplace`,
    marketplaceShops: `${baseURL}/user/marketplace/shops`,
    marketplaceProducts: `${baseURL}/user/marketplace/products`,
    marketplaceShopWithProducts: (shopId: string) =>
        `${baseURL}/user/marketplace/shops/${encodeURIComponent(shopId)}/products`,
};