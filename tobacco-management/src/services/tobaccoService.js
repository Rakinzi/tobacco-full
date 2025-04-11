import apiClient from './api-client';

const tobaccoService = {
  getAllListings: async () => {
    return apiClient.get('/tobacco_listings');
  },

  getListing: async (id) => {
    return apiClient.get(`/tobacco_listings/${id}`);
  },

  // Create a new tobacco listing with FormData (for image uploads)
  createListing: async (formData) => {
    return apiClient.post('/tobacco_listings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Update an existing tobacco listing
  updateListing: async (id, formData) => {
    return apiClient.post(`/tobacco_listings/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Delete a tobacco listing
  deleteListing: async (id) => {
    return apiClient.delete(`/tobacco_listings/${id}`);
  }
};

export default tobaccoService;