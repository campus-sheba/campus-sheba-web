const baseURL = process.env.BASE_URL || process.env.NEXT_PUBLIC_API_URL;

export const shopEndpoints = {
  myShopStudent: `${baseURL}/owner/shops/my?type=Student%20Shop`,
  /** @deprecated use myShopStudent */
  myShop: `${baseURL}/owner/shops/my?type=Student%20Shop`,
  createShop: `${baseURL}/owner/shops`,
  shopById: (id: string) => `${baseURL}/owner/shops/${encodeURIComponent(id)}`,
  updateShop: (id: string) => `${baseURL}/owner/shops/${encodeURIComponent(id)}`,
  shopKyc: (id: string) => `${baseURL}/owner/shops/${encodeURIComponent(id)}/kyc`,
};
