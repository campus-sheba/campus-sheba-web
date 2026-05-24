const baseURL = process.env.BASE_URL || process.env.NEXT_PUBLIC_API_URL;


export const landingPageEndpoints = {
    heroBanner: `${baseURL}/banners`,
    heroBannerByUniversity: (universityId: string) =>
        `${baseURL}/banners?page=1&limit=10&isActive=true&type=home&placement=home&university=${universityId}`,
    heroBannerByUniversityAndType: (universityId: string, bannerType: string) =>
        `${baseURL}/banners?page=1&limit=10&isActive=true&type=${encodeURIComponent(bannerType)}&university=${universityId}`,
    heroBannerByUniversityAndPlacement: (universityId: string, placement: string) =>
        `${baseURL}/banners?page=1&limit=10&isActive=true&placement=${encodeURIComponent(placement)}&university=${universityId}`,
    universityFeatures: (universityId: string) =>
        `${baseURL}/user/features/university/${universityId}`,
    bannersResolve: (params: string) => `${baseURL}/banners/resolve?${params}`,
};

// careers page endpoints
export const careersEndpoints = {
    universities: `${baseURL}/universities`,
    universityLocations: `${baseURL}/university-locations`,
    universityLocationById: (id: string) =>
        `${baseURL}/university-locations/${encodeURIComponent(id)}`,
    sendApplication: `${baseURL}/career/send-cv`,
};

export const searchEndpoints = {
    search: `${baseURL}/search`,
    suggestions: `${baseURL}/search/suggestions`,
};

export const campusMapEndpoints = {
    list: `${baseURL}/campus-map`,
    featured: `${baseURL}/campus-map/featured`,
    search: `${baseURL}/campus-map/search`,
    bySlug: (slug: string) => `${baseURL}/campus-map/by-slug/${encodeURIComponent(slug)}`,
    byId: (id: string) => `${baseURL}/campus-map/${encodeURIComponent(id)}`,
    favourites: `${baseURL}/campus-map/favourites`,
    favouriteToggle: (id: string) => `${baseURL}/campus-map/${encodeURIComponent(id)}/favourite`,
    report: (id: string) => `${baseURL}/campus-map/${encodeURIComponent(id)}/report`,
    submissions: `${baseURL}/campus-map/submissions`,
};

export const emergencyEndpoints = {
    contacts: `${baseURL}/emergency/contacts`,
    contactsByCategory: `${baseURL}/emergency/contacts/by-category`,
    contactsQuickDial: `${baseURL}/emergency/contacts/quick-dial`,
    contactById: (id: string) => `${baseURL}/emergency/contacts/${encodeURIComponent(id)}`,
    contactReportIssue: (id: string) => `${baseURL}/emergency/contacts/${encodeURIComponent(id)}/report-issue`,
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
    availability: `${baseURL}/blood-donor/availability`,
    eligibility: `${baseURL}/blood-donor/eligibility`,
    find: `${baseURL}/blood-donor/find`,
    stats: `${baseURL}/blood-donor/stats`,
    request: `${baseURL}/blood-donor/request`,
    requests: `${baseURL}/blood-donor/requests`,
    myRequests: `${baseURL}/blood-donor/my-requests`,
    requestStatus: (id: string) =>
        `${baseURL}/blood-donor/request/${encodeURIComponent(id)}/status`,
    requestRespond: (id: string) =>
        `${baseURL}/blood-donor/request/${encodeURIComponent(id)}/respond`,
    donationLog: `${baseURL}/blood-donor/donation/log`,
    donationConfirm: `${baseURL}/blood-donor/donation/confirm-received`,
    donationHistory: `${baseURL}/blood-donor/donation/history`,
    clubs: `${baseURL}/blood-donor/clubs`,
    clubFollow: (id: string) =>
        `${baseURL}/blood-donor/clubs/${encodeURIComponent(id)}/follow`,
};

export const addressEndpoints = {
    base: `${baseURL}/addresses`,
    byId: (id: string) => `${baseURL}/addresses/${encodeURIComponent(id)}`,
};

export const userProfileEndpoints = {
    updateEmailSendCode: `${baseURL}/user/profile/update-email/send-code`,
    updateEmailVerify: `${baseURL}/user/profile/update-email`,
    studentVerificationSendCode: `${baseURL}/user/student-verification/send-code`,
    studentVerificationVerify: `${baseURL}/user/student-verification/verify`,
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

/** Seller (item-owner) order fulfilment — confirm, pickup OTP, cancel. */
export const ownerOrderEndpoints = {
    base: `${baseURL}/owner/orders`,
    byId: (id: string) => `${baseURL}/owner/orders/${encodeURIComponent(id)}`,
    confirmItem: (id: string, itemId: string) =>
        `${baseURL}/owner/orders/${encodeURIComponent(id)}/items/${encodeURIComponent(itemId)}/confirm`,
    cancelItem: (id: string, itemId: string) =>
        `${baseURL}/owner/orders/${encodeURIComponent(id)}/items/${encodeURIComponent(itemId)}/cancel`,
    generatePickupOtp: (id: string) =>
        `${baseURL}/owner/orders/${encodeURIComponent(id)}/pickup-otp/generate`,
};

export const checkoutEndpoints = {
    paymentGateways: `${baseURL}/user/payment-gateways/available`,
    deliveryOptions: `${baseURL}/user/delivery-options/available`,
};

export const promoCodeEndpoints = {
    public: `${baseURL}/user/promo-codes/public`,
    validate: `${baseURL}/user/promo-codes/validate`,
};

export const reviewEndpoints = {
    base: `${baseURL}/user/reviews`,
    universityLocation: (locationId: string) =>
        `${baseURL}/user/reviews/university-location/${encodeURIComponent(locationId)}`,
    byId: (reviewId: string) => `${baseURL}/user/reviews/${encodeURIComponent(reviewId)}`,
};

export const bookEndpoints = {
    // Creator endpoints
    creatorBase: `${baseURL}/creator/books`,
    creatorSell: `${baseURL}/creator/books/sell`,
    creatorLend: `${baseURL}/creator/books/lend`,
    creatorDonate: `${baseURL}/creator/books/donate`,
    creatorSwap: `${baseURL}/creator/books/swap`,
    /** @deprecated Use creatorShelf (slim payload) for showcase books. */
    creatorLibraryOnly: `${baseURL}/creator/books/library-only`,
    creatorShelf: `${baseURL}/creator/books/shelf`,
    creatorPromote: (bookId: string) =>
        `${baseURL}/creator/books/${encodeURIComponent(bookId)}/promote`,
    /** Restore a promoted listing back to the bookshelf (un-sell / cancel listing). */
    creatorRestore: (bookId: string) =>
        `${baseURL}/creator/books/${encodeURIComponent(bookId)}/restore`,
    creatorOwn: `${baseURL}/creator/books/own`,
    creatorById: (bookId: string) => `${baseURL}/creator/books/${encodeURIComponent(bookId)}`,
    // User browse endpoints
    userBase: `${baseURL}/user/books`,
    userBorrowable: `${baseURL}/user/books/borrowable`,
    userMyListed: `${baseURL}/user/books/my-listed`,
    userBorrowed: `${baseURL}/user/books/borrowed`,
    userByOwner: (ownerId: string) =>
        `${baseURL}/user/books/by-owner/${encodeURIComponent(ownerId)}`,
    userById: (bookId: string) => `${baseURL}/user/books/${encodeURIComponent(bookId)}`,
    /** Bluebook home — marketplace, showcase, borrow, swap, bookshelves, following */
    userFeed: `${baseURL}/user/books/feed`,
    userBrowse: `${baseURL}/user/books/browse`,
    userBrowseBookshelves: `${baseURL}/user/books/browse/bookshelves`,
    // Discovery feed endpoints (auth required)
    feedSemester: `${baseURL}/user/books/feed/semester`,
    feedSeniorPicks: `${baseURL}/user/books/feed/senior-picks`,
    feedDepartment: (deptId: string) => `${baseURL}/user/books/feed/department/${encodeURIComponent(deptId)}`,
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

export const bookReviewEndpoints = {
    base: `${baseURL}/book-review`,
    byBook: (bookId: string) => `${baseURL}/book-review/${encodeURIComponent(bookId)}`,
    byId: (reviewId: string) => `${baseURL}/book-review/${encodeURIComponent(reviewId)}`,
};

export const bookDonationEndpoints = {
    base: `${baseURL}/book-donation`,
    mine: `${baseURL}/book-donation/mine`,
    byId: (donationId: string) => `${baseURL}/book-donation/${encodeURIComponent(donationId)}`,
    request: (donationId: string) =>
        `${baseURL}/book-donation/${encodeURIComponent(donationId)}/request`,
    fulfill: (donationId: string, queueEntryId: string) =>
        `${baseURL}/book-donation/${encodeURIComponent(donationId)}/fulfill/${encodeURIComponent(queueEntryId)}`,
};

export const userLibraryEndpoints = {
    base: `${baseURL}/user/library`,
    me: `${baseURL}/user/library/me`,
    leaderboard: `${baseURL}/user/library/leaderboard`,
    activityFeed: `${baseURL}/user/library/feed`,
    byId: (profileId: string) => `${baseURL}/user/library/${encodeURIComponent(profileId)}`,
    hub: (profileId: string) =>
        `${baseURL}/user/library/${encodeURIComponent(profileId)}/hub`,
    followers: (profileId: string) =>
        `${baseURL}/user/library/${encodeURIComponent(profileId)}/followers`,
    following: (profileId: string) =>
        `${baseURL}/user/library/${encodeURIComponent(profileId)}/following`,
    readingList: `${baseURL}/user/library/reading-list`,
    readingListBook: (bookId: string) =>
        `${baseURL}/user/library/reading-list/${encodeURIComponent(bookId)}`,
    follow: (profileId: string) =>
        `${baseURL}/user/library/follow/${encodeURIComponent(profileId)}`,
    report: `${baseURL}/user/library/report`,
    recommendation: (bookId: string) =>
        `${baseURL}/user/library/recommendations/${encodeURIComponent(bookId)}`,
    recommendationsOrder: `${baseURL}/user/library/recommendations/order`,
};

export const bookSwapEndpoints = {
    base: `${baseURL}/book-swap`,
    incoming: `${baseURL}/book-swap/incoming`,
    outgoing: `${baseURL}/book-swap/outgoing`,
    accept: (swapId: string) =>
        `${baseURL}/book-swap/${encodeURIComponent(swapId)}/accept`,
    reject: (swapId: string) =>
        `${baseURL}/book-swap/${encodeURIComponent(swapId)}/reject`,
    complete: (swapId: string) =>
        `${baseURL}/book-swap/${encodeURIComponent(swapId)}/complete`,
    cancel: (swapId: string) =>
        `${baseURL}/book-swap/${encodeURIComponent(swapId)}/cancel`,
};

export const libraryProfileReviewEndpoints = {
    base: `${baseURL}/library-profile-review`,
    byProfile: (profileId: string) =>
        `${baseURL}/library-profile-review/profile/${encodeURIComponent(profileId)}`,
    byId: (reviewId: string) =>
        `${baseURL}/library-profile-review/${encodeURIComponent(reviewId)}`,
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

export const supportEndpoints = {
    base: `${baseURL}/support/tickets`,
    byId: (id: string) => `${baseURL}/support/tickets/${encodeURIComponent(id)}`,
    reply: (id: string) => `${baseURL}/support/tickets/${encodeURIComponent(id)}/reply`,
    reopen: (id: string) => `${baseURL}/support/tickets/${encodeURIComponent(id)}/reopen`,
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
    foodsHome: `${baseURL}/user/foods/home`,
    foodById: (id: string) => `${baseURL}/user/foods/${encodeURIComponent(id)}`,
    /** GET /user/foods/shops — paginated food-shop listing for a university. */
    foodShops: `${baseURL}/user/foods/shops`,
    /** GET /user/foods/shops/:shopId/menus — shop detail + paginated menu items. */
    foodShopMenus: (shopId: string) => `${baseURL}/user/foods/shops/${encodeURIComponent(shopId)}/menus`,
    /** New marketplace aggregation endpoints. */
    homeFeed: `${baseURL}/user/marketplace`,
    marketplaceShops: `${baseURL}/user/marketplace/shops`,
    marketplaceProducts: `${baseURL}/user/marketplace/products`,
    marketplaceShopWithProducts: (shopId: string) =>
        `${baseURL}/user/marketplace/shops/${encodeURIComponent(shopId)}/products`,
};