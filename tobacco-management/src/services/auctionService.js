import apiClient from './api-client';

const auctionService = {
  // Get all auctions
  getAllAuctions: async () => {
    return apiClient.get('/auctions');
  },

  // Get a specific auction by ID
  getAuction: async (id) => {
    return apiClient.get(`/auctions/${id}`);
  },

  // Create a new auction
  createAuction: async (auctionData) => {
    return apiClient.post('/auctions', auctionData);
  },

  // Update an existing auction
  updateAuction: async (id, auctionData) => {
    return apiClient.put(`/auctions/${id}`, auctionData);
  },

  // Cancel an auction
  cancelAuction: async (id) => {
    return apiClient.post(`/auctions/${id}/cancel`);
  },

  // End an auction
  endAuction: async (id) => {
    return apiClient.post(`/auctions/${id}/end`);
  },

  // Get bids for an auction
  getAuctionBids: async (auctionId) => {
    return apiClient.get(`/auctions/${auctionId}/bids`);
  },

  // Place a bid on an auction
  placeBid: async (auctionId, bidData) => {
    return apiClient.post(`/auctions/${auctionId}/bids`, bidData);
  }
};

export default auctionService;