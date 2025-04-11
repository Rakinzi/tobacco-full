import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Initialize Echo once
let echoInstance = null;

const webSocketService = {
  // Initialize Echo with connection details
  init: (token) => {
    if (echoInstance) return echoInstance;
    
    // Make Pusher available globally (required by Laravel Echo)
    window.Pusher = Pusher;
    
    // Create a new Echo instance
    echoInstance = new Echo({
      broadcaster: 'pusher',
      key: import.meta.env.VITE_PUSHER_APP_KEY || 'your-pusher-key',
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
      forceTLS: true,
      encrypted: true,
      // Use the authentication token for private channels
      auth: {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
      },
    });
    
    return echoInstance;
  },
  
  // Subscribe to auction updates
  subscribeToAuction: (auctionId, callbacks) => {
    if (!echoInstance) return null;
    
    const channel = echoInstance.channel(`auction.${auctionId}`);
    
    // Listen for new bids
    if (callbacks.onNewBid) {
      channel.listen('.bid.placed', (data) => {
        callbacks.onNewBid(data);
      });
    }
    
    // Listen for auction status changes
    if (callbacks.onStatusChange) {
      channel.listen('.auction.status-changed', (data) => {
        callbacks.onStatusChange(data);
      });
    }
    
    // Listen for auction ending
    if (callbacks.onAuctionEnded) {
      channel.listen('.auction.ended', (data) => {
        callbacks.onAuctionEnded(data);
      });
    }
    
    return () => {
      channel.unsubscribe();
    };
  },
  
  // Subscribe to private user notifications
  subscribeToUserNotifications: (userId, callback) => {
    if (!echoInstance) return null;
    
    const channel = echoInstance.private(`App.Models.User.${userId}`);
    
    channel.listen('.notification.created', (data) => {
      callback(data);
    });
    
    return () => {
      channel.unsubscribe();
    };
  },
  
  // Disconnect Echo
  disconnect: () => {
    if (echoInstance) {
      echoInstance.disconnect();
      echoInstance = null;
    }
  },
};

export default webSocketService;