import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  DollarSign, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Clock
} from 'lucide-react';
import auctionService from '../services/auctionService';
import webSocketService from '../services/webSocketService';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

const RealTimeBidding = ({ auctionId, initialData, onBidPlaced }) => {
  const { user } = useAuth();
  const [auction, setAuction] = useState(initialData);
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showLiveBidding, setShowLiveBidding] = useState(true);
  const [newBidNotification, setNewBidNotification] = useState(null);
  
  const timerRef = useRef(null);
  const unsubscribeRef = useRef(null);
  
  // Set suggested bid amount (current price + minimum increment)
  useEffect(() => {
    if (auction) {
      const currentPrice = parseFloat(auction.current_price);
      const minIncrement = currentPrice * 0.05; // Default 5% increment
      const suggestedBid = (currentPrice + minIncrement).toFixed(2);
      setBidAmount(suggestedBid);
    }
  }, [auction]);
  
  // Initialize WebSocket connection
  useEffect(() => {
    // Initialize Echo with the user's token
    const token = localStorage.getItem('token');
    if (token) {
      const echo = webSocketService.init(token);
      
      // Subscribe to auction channel
      unsubscribeRef.current = webSocketService.subscribeToAuction(auctionId, {
        onNewBid: handleNewBidReceived,
        onStatusChange: handleStatusChange,
        onAuctionEnded: handleAuctionEnded
      });
    }
    
    // Clean up on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [auctionId]);
  
  // Fetch bids on mount and set up timer
  useEffect(() => {
    fetchBids();
    
    // Set up timer to update countdown
    timerRef.current = setInterval(updateTimeRemaining, 1000);
    updateTimeRemaining();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [auction]);
  
  // Handle new bids received via WebSocket
  const handleNewBidReceived = (data) => {
    // Update the auction price
    setAuction(prev => ({
      ...prev,
      current_price: data.amount
    }));
    
    // Add the new bid to the bids list
    setBids(prev => [data.bid, ...prev]);
    
    // Show notification
    setNewBidNotification({
      message: `New bid: ${formatCurrency(data.amount)} by ${data.bidder_name}`,
      timestamp: new Date()
    });
    
    // Hide notification after 5 seconds
    setTimeout(() => setNewBidNotification(null), 5000);
    
    // Update suggested bid
    const newCurrentPrice = parseFloat(data.amount);
    const minIncrement = newCurrentPrice * 0.05;
    const suggestedBid = (newCurrentPrice + minIncrement).toFixed(2);
    setBidAmount(suggestedBid);
  };
  
  // Handle auction status changes
  const handleStatusChange = (data) => {
    setAuction(prev => ({
      ...prev,
      status: data.status
    }));
  };
  
  // Handle auction ended event
  const handleAuctionEnded = (data) => {
    setAuction(prev => ({
      ...prev,
      status: 'ended',
      winner_id: data.winner_id
    }));
  };
  
  // Fetch bids from API
  const fetchBids = async () => {
    try {
      const response = await auctionService.getAuctionBids(auctionId);
      
      if (response.data.status === 'success') {
        setBids(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching bids:', err);
    }
  };
  
  // Update time remaining countdown
  const updateTimeRemaining = () => {
    if (!auction) return;
    
    const endTime = new Date(auction.end_time);
    const now = new Date();
    
    if (now >= endTime) {
      setTimeRemaining('Auction ended');
      clearInterval(timerRef.current);
      return;
    }
    
    const total = endTime - now;
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((total % (1000 * 60)) / 1000);
    
    if (days > 0) {
      setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    } else {
      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    }
  };
  
  // Handle bid submission
  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    // Validate bid amount
    const bidValue = parseFloat(bidAmount);
    const currentPrice = parseFloat(auction.current_price);
    const minIncrement = currentPrice * 0.05;
    
    if (isNaN(bidValue) || bidValue <= currentPrice) {
      setError(`Bid must be greater than current price of ${formatCurrency(currentPrice)}`);
      setIsLoading(false);
      return;
    }
    
    if (bidValue < currentPrice + minIncrement) {
      setError(`Minimum bid increment is ${formatCurrency(minIncrement)}`);
      setIsLoading(false);
      return;
    }
    
    try {
      const bidData = {
        amount: bidValue
      };
      
      const response = await auctionService.placeBid(auction.id, bidData);
      
      if (response.data.status === 'success') {
        setSuccessMessage('Bid placed successfully!');
        
        // The WebSocket will handle updating the UI with the new bid
        // but we'll set our local state anyway in case the WebSocket is slow
        setAuction(prev => ({
          ...prev,
          current_price: bidValue
        }));
        
        // Call the parent component's callback (if provided)
        if (onBidPlaced) {
          onBidPlaced(response.data.data);
        }
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
      }
    } catch (err) {
      console.error('Error placing bid:', err);
      setError(err.response?.data?.message || err.message || 'Failed to place bid. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle quick bids
  const handleQuickBid = (percentage) => {
    const currentPrice = parseFloat(auction.current_price);
    const increment = currentPrice * (percentage / 100);
    const newBid = (currentPrice + increment).toFixed(2);
    setBidAmount(newBid);
  };
  
  // Format the name of the bidder for display
  const formatBidderName = (bidder) => {
    if (!bidder) return 'Unknown';
    
    if (bidder.id === user?.id) {
      return 'You';
    }
    
    // Mask other bidders for privacy
    const name = bidder.name || '';
    if (name.length <= 4) return name;
    
    return name.substring(0, 2) + '****' + name.substring(name.length - 2);
  };
  
  return (
    <div className="space-y-4">
      {/* Bid notification popup */}
      {newBidNotification && (
        <div className="fixed top-24 right-4 z-50 bg-green-500/90 text-white py-2 px-4 rounded-lg shadow-lg animate-slideIn">
          <p>{newBidNotification.message}</p>
        </div>
      )}
      
      {/* Bid form */}
      {auction?.status === 'active' && user?.user_type === 'buyer' && (
        <Card className="border-green-500/20 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Place Your Bid</CardTitle>
                <CardDescription>
                  Current Price: <span className="text-green-500 font-bold">{formatCurrency(auction.current_price)}</span>
                </CardDescription>
              </div>
              <div className="flex items-center p-2 bg-green-500/10 rounded-lg">
                <Clock className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-white">{timeRemaining}</span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {successMessage && (
              <Alert variant="success" className="mb-4">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{successMessage}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleBidSubmit} className="space-y-4">
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500/50" />
                <Input
                  type="number"
                  step="0.01"
                  min={(parseFloat(auction.current_price) + parseFloat(auction.current_price) * 0.05).toFixed(2)}
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  className="pl-8"
                  placeholder="Enter your bid amount"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleQuickBid(5)}
                >
                  +5%
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleQuickBid(10)}
                >
                  +10%
                </Button>
                <Button 
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleQuickBid(15)}
                >
                  +15%
                </Button>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Placing Bid...
                  </>
                ) : 'Place Bid'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
      
      {/* Live bids */}
      <Card className="border-green-500/20">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle>Bid History</CardTitle>
            <CardDescription>
              {bids.length} bids placed
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowLiveBidding(!showLiveBidding)}
          >
            {showLiveBidding ? (
              <>
                <ArrowUp className="h-4 w-4 mr-1" />
                <span>Hide</span>
              </>
            ) : (
              <>
                <ArrowDown className="h-4 w-4 mr-1" />
                <span>Show</span>
              </>
            )}
          </Button>
        </CardHeader>
        
        {showLiveBidding && (
          <CardContent>
            {bids.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/70">No bids have been placed yet</p>
              </div>
            ) : (
              <div className="space-y-4 divide-y divide-green-500/20">
                {bids.map((bid) => (
                  <div key={bid.id} className="pt-4 first:pt-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-white">
                          {formatBidderName(bid.user)}
                          {bid.is_winning && (
                            <span className="ml-2 text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-green-500/10 text-green-400">
                              Highest
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-white/50">
                          {new Date(bid.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${bid.is_winning ? 'text-green-500' : 'text-white'}`}>
                          {formatCurrency(bid.amount)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default RealTimeBidding;