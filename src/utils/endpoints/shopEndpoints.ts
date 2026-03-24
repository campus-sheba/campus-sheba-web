const baseURL = process.env.BASE_URL || process.env.NEXT_PUBLIC_API_URL;

export const shopEndpoints = {
  myShop: `${baseURL}/owner/shops/my?type=Student%20Shop`,
  createShop: `${baseURL}/owner/shops`,
  updateShop: (id: string) => `${baseURL}/owner/shops/${id}`,
};
