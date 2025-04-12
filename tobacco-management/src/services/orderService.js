import apiClient from './api-client';

const orderService = {
  // Get all orders
  getAllOrders: async () => {
    return apiClient.get('/orders');
  },

  getOrder: async (id) => {
    return apiClient.get(`/orders/${id}`);
  },

  createOrder: async (orderData) => {
    return apiClient.post('/orders', orderData);
  },

  // Update an existing order
  updateOrder: async (id, orderData) => {
    return apiClient.put(`/orders/${id}`, orderData);
  },

  // Check if orders exist for specific auctions
  checkAuctionOrders: async (auctionIds) => {
    return apiClient.post('/orders/check-auction-orders', { auction_ids: auctionIds });
  },

  // Create a transaction for an order
  createTransaction: async (orderId, transactionData) => {
    return apiClient.post(`/orders/${orderId}/transactions`, transactionData);
  },

  // Get a specific transaction for an order
  getTransaction: async (orderId, transactionId) => {
    return apiClient.get(`/orders/${orderId}/transactions/${transactionId}`);
  }
};

export default orderService;