const baseURL = process.env.BASE_URL || process.env.NEXT_PUBLIC_API_URL;


export const landingPageEndpoints = {
    heroBanner: `${baseURL}/banners`,
};

// careers page endpoints
export const careersEndpoints = {
    universities: `${baseURL}/universities`,
    sendApplication: `${baseURL}/career/send-cv`,
};