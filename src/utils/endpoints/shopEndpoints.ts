const baseURL = process.env.BASE_URL || process.env.NEXT_PUBLIC_API_URL;

export const shopEndpoints = {
  myShop: `${baseURL}/owner/shops/my?type=Student%20Shop`,
  list: `${baseURL}/owner/shops`,
  createShop: `${baseURL}/owner/shops`,
  byId: (id: string) => `${baseURL}/owner/shops/${encodeURIComponent(id)}`,
  updateShop: (id: string) => `${baseURL}/owner/shops/${encodeURIComponent(id)}`,
  kyc: (id: string) => `${baseURL}/owner/shops/${encodeURIComponent(id)}/kyc`,
};
