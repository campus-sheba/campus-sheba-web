const baseURL = process.env.BASE_URL || process.env.NEXT_PUBLIC_API_URL;

export const ownerHubEndpoints = {
  myShop: (type: string) =>
    `${baseURL}/owner/shops/my?type=${encodeURIComponent(type)}`,
  shops: `${baseURL}/owner/shops`,
  shopById: (id: string) => `${baseURL}/owner/shops/${encodeURIComponent(id)}`,
  productsOwn: (query: string) => `${baseURL}/creator/products/own${query}`,
  productsStatistics: `${baseURL}/creator/products/statistics`,
  products: `${baseURL}/creator/products`,
  productById: (id: string) => `${baseURL}/creator/products/${encodeURIComponent(id)}`,
  userCategories: `${baseURL}/user/categories`,
  ownerOrders: (query: string) => `${baseURL}/owner/orders${query}`,
  ownerOrderById: (id: string) => `${baseURL}/owner/orders/${encodeURIComponent(id)}`,
  confirmOrderItem: (orderId: string, itemId: string) =>
    `${baseURL}/owner/orders/${encodeURIComponent(orderId)}/items/${encodeURIComponent(itemId)}/confirm`,
  cancelOrderItem: (orderId: string, itemId: string) =>
    `${baseURL}/owner/orders/${encodeURIComponent(orderId)}/items/${encodeURIComponent(itemId)}/cancel`,
  reviewsByType: (type: string, query: string) =>
    `${baseURL}/creator/reviews/${encodeURIComponent(type)}${query}`,
  reviewRespond: (reviewId: string) =>
    `${baseURL}/creator/reviews/${encodeURIComponent(reviewId)}/respond`,
};
