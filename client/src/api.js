const BASE = "https://hunarwadi-server.onrender.com/api";

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  sendOtp: (email) => req("/auth/send-otp", { method: "POST", body: JSON.stringify({ email }) }),
  verifyOtp: (email, otp) => req("/auth/verify-otp", { method: "POST", body: JSON.stringify({ email, otp }) }),
  getUser: (id) => req(`/users/${id}`),
  updateUser: (id, data) => req(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return req(`/products${qs ? `?${qs}` : ""}`);
  },
  getProduct: (id) => req(`/products/${id}`),
  createProduct: (data) => req("/products", { method: "POST", body: JSON.stringify(data) }),
  updateProduct: (id, data) => req(`/products/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteProduct: (id) => req(`/products/${id}`, { method: "DELETE" }),
  getSellerProducts: (id) => req(`/sellers/${id}/products`),
  getSellerStats: (id) => req(`/sellers/${id}/stats`),
  getChats: (userId) => req(`/chats?user_id=${userId}`),
  createChat: (data) => req("/chats", { method: "POST", body: JSON.stringify(data) }),
  getChat: (id) => req(`/chats/${id}`),
  getMessages: (chatId) => req(`/chats/${chatId}/messages`),
  sendMessage: (chatId, data) => req(`/chats/${chatId}/messages`, { method: "POST", body: JSON.stringify(data) }),
  setOfferStatus: (msgId, offer_status) => req(`/messages/${msgId}/offer-status`, { method: "PUT", body: JSON.stringify({ offer_status }) }),
  getWishlist: (userId) => req(`/wishlist?user_id=${userId}`),
  addWishlist: (user_id, product_id) => req("/wishlist", { method: "POST", body: JSON.stringify({ user_id, product_id }) }),
  removeWishlist: (user_id, product_id) => req("/wishlist", { method: "DELETE", body: JSON.stringify({ user_id, product_id }) }),
  getProductReviews: (productId) => req(`/products/${productId}/reviews`),
  submitReview: (data) => req("/reviews", { method: "POST", body: JSON.stringify(data) }),
  getSellerRating: (sellerId) => req(`/sellers/${sellerId}/rating`),
  createOrder: (data) => req("/orders", { method: "POST", body: JSON.stringify(data) }),
  getOrders: (userId) => req(`/orders?user_id=${userId}`),
  getOrder: (id) => req(`/orders/${id}`),
  getChatOrder: (chatId) => req(`/chats/${chatId}/order`),
  updateOrderStatus: (id, status, actor_id) => req(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify({ status, actor_id }) }),
};
