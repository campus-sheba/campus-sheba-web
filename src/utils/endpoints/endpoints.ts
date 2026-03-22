const baseURL = process.env.BASE_URL || process.env.NEXT_PUBLIC_API_URL;


export const landingPageEndpoints = {
    heroBanner: `${baseURL}/banners`,
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
};

export const mediaEndpoints = {
    upload: `${baseURL}/media2/upload`,
    delete: `${baseURL}/media2`,
};