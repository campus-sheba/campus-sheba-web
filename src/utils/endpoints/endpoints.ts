const baseURL = process.env.BASE_URL || process.env.NEXT_PUBLIC_API_URL;


export const landingPageEndpoints = {
    heroBanner: `${baseURL}/banners`,
};

// careers page endpoints
export const careersEndpoints = {
    universities: `${baseURL}/universities`,
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
};