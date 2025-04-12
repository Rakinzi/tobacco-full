import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  Clock,
  RefreshCw,
  Package,
  DollarSign,
  Users,
  Calendar,
  ShoppingBag,
  MapPin,
  ClipboardCheck,
  ArrowLeft,
  Award,
  Leaf,
  AlertCircle,
  CheckCircle2,
  Gavel,
  ChevronLeft,
  ChevronRight,
  Image
} from 'lucide-react';
import auctionService from '../services/auctionService';
import { formatTobaccoType, formatCurrency, formatWeight, getStorageImageUrl } from '../utils/formatters';

const AuctionDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [bidError, setBidError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isEnded, setIsEnded] = useState(false);
  const timerRef = useRef(null);
  const carouselRef = useRef(null);
  const [bidNotification, setBidNotification] = useState(null);
  const pollingIntervalRef = useRef(null);

  // Initial data fetch on component mount
  useEffect(() => {
    // Fetch data immediately on mount
    fetchAuctionDetails();
    
    // Set up polling to fetch updates every 5 seconds
    pollingIntervalRef.current = setInterval(() => {
      fetchAuctionDetails(false); // Pass false to avoid setting loading state during polling
    }, 5000); // 5 seconds

    // Clean up on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (carouselRef.current) clearInterval(carouselRef.current);
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [id]);

  useEffect(() => {
    // Update isEnded whenever auction changes
    if (auction) {
      const auctionEnded = new Date(auction.end_time) < new Date() || auction.status === 'ended';
      setIsEnded(auctionEnded);
      
      // If auction ended, stop the polling
      if (auctionEnded && pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    }
  }, [auction]);

  const fetchAuctionDetails = async (setLoadingState = true) => {
    if (setLoadingState) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await auctionService.getAuction(id);

      if (response.data.status === 'success') {
        const auctionData = response.data.data;
        const previousAuction = auction;
        
        // Immediately update auction data - don't wait for bids
        setAuction(auctionData);
        startCountdownTimer(auctionData.end_time);

        if (auctionData.status === 'active') {
          const minIncrement = auctionData.min_bid_increment || (parseFloat(auctionData.current_price) * 0.05);
          const suggestedBid = (parseFloat(auctionData.current_price) + parseFloat(minIncrement)).toFixed(2);
          setBidAmount(suggestedBid);
        }

        try {
          const bidsResponse = await auctionService.getAuctionBids(id);
          if (bidsResponse.data.status === 'success') {
            const newBids = bidsResponse.data.data;
            
            // If this is not the initial load and we have a previous auction
            if (!setLoadingState && previousAuction && newBids.length > 0) {
              // Check if there are new bids
              const previousHighestBidId = bids.length > 0 ? bids[0].id : null;
              const currentHighestBidId = newBids.length > 0 ? newBids[0].id : null;
              
              if (currentHighestBidId && currentHighestBidId !== previousHighestBidId) {
                // Someone else placed a new bid - show notification
                const latestBid = newBids[0]; // Assuming bids are returned sorted with newest first
                
                // Don't show notification for the current user's own bids
                if (latestBid.user_id !== user?.id) {
                  setBidNotification({
                    amount: latestBid.amount,
                    bidder: latestBid.user?.name || 'Unknown bidder',
                    timestamp: Date.now()
                  });
                  
                  // Auto-hide notification after 3 seconds
                  setTimeout(() => setBidNotification(null), 3000);
                }
              }
            }
            
            // Update bids state after checking for notifications
            setBids(newBids);
          }
        } catch (bidsError) {
          console.error('Error fetching bids:', bidsError);
        }
      }
    } catch (err) {
      console.error('Error fetching auction details:', err);
      if (setLoadingState) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch auction details');
      }
    } finally {
      if (setLoadingState) {
        setIsLoading(false);
      }
    }
  };

  const startCountdownTimer = (endTime) => {
    if (timerRef.current) clearInterval(timerRef.current);

    updateTimeRemaining(endTime);

    timerRef.current = setInterval(() => {
      updateTimeRemaining(endTime);
    }, 1000);
  };

  const updateTimeRemaining = (endTime) => {
    const total = new Date(endTime) - new Date();

    if (total <= 0) {
      setTimeRemaining('Auction ended');
      setIsEnded(true);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

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

  const handleBidSubmit = async (e) => {
    e.preventDefault();

    const bidValue = parseFloat(bidAmount);
    const currentPrice = parseFloat(auction.current_price);
    const minIncrement = auction.min_bid_increment || (currentPrice * 0.05);

    if (isNaN(bidValue) || bidValue <= currentPrice) {
      setBidError(`Bid must be greater than current price of ${formatCurrency(currentPrice)}`);
      return;
    }

    if (bidValue < currentPrice + minIncrement) {
      setBidError(`Minimum bid increment is ${formatCurrency(minIncrement)}`);
      return;
    }

    setBidError('');
    setIsBidding(true);

    try {
      const bidData = { amount: bidValue };
      const response = await auctionService.placeBid(auction.id, bidData);

      if (response.data.status === 'success') {
        setSuccessMessage('Bid placed successfully!');
        
        // Show notification about new bid
        setBidNotification({
          amount: bidValue,
          bidder: user.name,
          timestamp: Date.now()
        });
        
        // Auto-hide the notification after 3 seconds
        setTimeout(() => setBidNotification(null), 3000);
        
        // Refresh auction data
        fetchAuctionDetails();
        setTimeout(() => setSuccessMessage(''), 5000);
      }
    } catch (err) {
      console.error('Error placing bid:', err);
      setBidError(err.response?.data?.message || err.message || 'Failed to place bid. Please try again.');
    } finally {
      setIsBidding(false);
    }
  };

  const handleEndAuction = async () => {
    if (!confirm('Are you sure you want to end this auction now?')) return;

    setIsLoading(true);

    try {
      const response = await auctionService.endAuction(auction.id);

      if (response.data.status === 'success') {
        setSuccessMessage('Auction ended successfully');
        fetchAuctionDetails();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to end auction');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAuction = async () => {
    if (!confirm('Are you sure you want to cancel this auction? This action cannot be undone.')) return;

    setIsLoading(true);

    try {
      const response = await auctionService.cancelAuction(auction.id);

      if (response.data.status === 'success') {
        setSuccessMessage('Auction cancelled successfully');
        fetchAuctionDetails();
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to cancel auction');
    } finally {
      setIsLoading(false);
    }
  };

  const nextImage = () => {
    if (!auction?.tobacco_listing?.images || auction.tobacco_listing.images.length <= 1) return;

    setSelectedImageIndex(prevIndex =>
      prevIndex === auction.tobacco_listing.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    if (!auction?.tobacco_listing?.images || auction.tobacco_listing.images.length <= 1) return;

    setSelectedImageIndex(prevIndex =>
      prevIndex === 0 ? auction.tobacco_listing.images.length - 1 : prevIndex - 1
    );
  };

  const selectImage = (index) => setSelectedImageIndex(index);

  useEffect(() => {
    if (!auction?.tobacco_listing?.images || auction.tobacco_listing.images.length <= 1) return;

    carouselRef.current = setInterval(nextImage, 5000);

    return () => {
      if (carouselRef.current) clearInterval(carouselRef.current);
    };
  }, [auction, selectedImageIndex]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-green-500/50 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-green-500">Loading auction details...</p>
        </div>
      </div>
    );
  }

  if (!auction && !error) {
    return (
      <div className="text-center py-16 bg-zinc-950/60 border border-green-500/20 rounded-xl">
        <Gavel className="h-12 w-12 text-green-500/30 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-white">Auction not found</h3>
        <p className="text-green-500/70 mt-2 mb-6">The auction you're looking for doesn't exist or has been removed</p>
        <Button className="mt-6" onClick={() => navigate('/auctions')}>
          Back to Auctions
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="outline" className="mb-4" onClick={() => navigate('/auctions')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Auctions
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const listing = auction.tobacco_listing;
  const hasImages = listing.images && listing.images.length > 0;
  const isUserSeller = user && user.id === auction.user_id;
  const isUserWinner = user && auction.winner_id === user.id;

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div>
        <Button variant="outline" className="mb-4" onClick={() => navigate('/auctions')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Auctions
        </Button>

        <h1 className="text-3xl font-bold tracking-tight text-white">
          {listing.batch_number} - {formatTobaccoType(listing.tobacco_type)}
        </h1>

        <div className="mt-2 flex items-center text-green-500">
          <ClipboardCheck className="mr-2 h-4 w-4" />
          <span>TIMB Certificate: {listing.timb_certificate_number}</span>
        </div>
      </div>

      {successMessage && (
        <Alert variant="success" className="mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Bid notification */}
      {bidNotification && (
        <div className="fixed top-16 right-4 z-50 max-w-md w-full bg-zinc-900 border border-green-500/20 shadow-lg rounded-lg pointer-events-auto flex items-center p-4 animate-in fade-in slide-in-from-right duration-300">
          <div className="flex-1">
            <p className="text-sm font-medium text-white">
              New bid: {formatCurrency(bidNotification.amount)}
            </p>
            <p className="text-xs text-white/70">
              {bidNotification.bidder} just placed a bid!
            </p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <span className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-green-500" />
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative overflow-hidden rounded-lg border border-green-500/20 bg-zinc-950/60 h-96">
            {hasImages ? (
              <>
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={getStorageImageUrl(listing.images[selectedImageIndex].image_path)}
                    alt={listing.batch_number}
                    className="w-full h-full object-contain transition-opacity duration-500"
                  />
                </div>

                {listing.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>

                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>

                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1} / {listing.images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Leaf className="h-24 w-24 text-green-500/20" />
              </div>
            )}
          </div>

          {hasImages && listing.images.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {listing.images.map((image, index) => (
                <div
                  key={index}
                  onClick={() => selectImage(index)}
                  className={`w-24 h-24 overflow-hidden rounded-md border cursor-pointer transition-all duration-200
                    ${selectedImageIndex === index
                      ? 'border-green-500 shadow-lg shadow-green-500/20 scale-105'
                      : 'border-green-500/20 opacity-70 hover:opacity-100'
                    }`}
                >
                  <img
                    src={getStorageImageUrl(image.image_path)}
                    alt={`${listing.batch_number} - Image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <Card className="border-green-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Tobacco Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-white/70">
                {listing.description || `High-quality ${formatTobaccoType(listing.tobacco_type)} tobacco from ${listing.region_grown}.`}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
                <div className="flex items-start gap-2">
                  <Package className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Type</p>
                    <p className="text-white/70 capitalize">{formatTobaccoType(listing.tobacco_type)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <ShoppingBag className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Quantity</p>
                    <p className="text-white/70">{formatWeight(listing.quantity)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Award className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Grade</p>
                    <p className="text-white/70">{listing.grade}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Region</p>
                    <p className="text-white/70">{listing.region_grown}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Calendar className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Season</p>
                    <p className="text-white/70">{listing.season_grown}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Users className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-white">Seller</p>
                    <p className="text-white/70">{auction.user?.name || 'Unknown'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Bid History</CardTitle>
              <CardDescription>
                {bids.length} bids placed in this auction
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bids.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-white/70">No bids have been placed yet</p>
                </div>
              ) : (
                <div className="space-y-4 divide-y divide-green-500/20">
                  {/* Create a map of unique bidders with their highest bids */}
                  {(() => {
                    // Create a map to track highest bid for each user
                    const uniqueBidders = new Map();
                    
                    // Process all bids and keep only the highest bid for each user
                    bids.forEach(bid => {
                      const userId = bid.user?.id || bid.user_id || 'unknown';
                      const userName = bid.user?.name || 'Anonymous Bidder';
                      
                      // If this user isn't in our map yet or this bid is higher than their previous one
                      if (!uniqueBidders.has(userId) || 
                          parseFloat(bid.amount) > parseFloat(uniqueBidders.get(userId).amount)) {
                        uniqueBidders.set(userId, {
                          ...bid,
                          user: { ...bid.user, name: userName }
                        });
                      }
                    });
                    
                    // Convert map to array and sort by bid amount (highest first)
                    const uniqueBids = Array.from(uniqueBidders.values())
                      .sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
                    
                    // Mark the highest bid as winning
                    if (uniqueBids.length > 0) {
                      uniqueBids[0].is_winning = true;
                    }
                    
                    return uniqueBids.map((bid, index) => (
                      <div key={bid.id || index} className="pt-4 first:pt-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-white">
                              {bid.user?.name || 'Anonymous Bidder'}
                              {index === 0 && (
                                <span className="ml-2 text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-green-500/10 text-green-400">
                                  Current Leader
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-white/50">
                              {new Date(bid.created_at).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${index === 0 ? 'text-green-500' : 'text-white'}`}>
                              {formatCurrency(bid.amount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-green-500/20 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">Auction Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-green-500">Current Bid</p>
                <div className="flex items-end gap-2">
                  <p className="text-3xl font-bold text-green-500">
                    {formatCurrency(auction.current_price)}
                  </p>
                  <p className="text-sm text-white/70 mb-1">
                    Started at {formatCurrency(auction.starting_price)}
                  </p>
                </div>
              </div>

              <div className="bg-green-500/10 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-green-500" />
                  <p className="font-medium text-white">
                    {isEnded ? 'Auction Ended' : 'Time Remaining'}
                  </p>
                </div>
                <p className="text-2xl font-bold text-white">
                  {timeRemaining}
                </p>
                <div className="text-xs text-white/70">
                  <div>Start: {new Date(auction.start_time).toLocaleString()}</div>
                  <div>End: {new Date(auction.end_time).toLocaleString()}</div>
                </div>
              </div>

              <div className={`rounded-lg p-3 text-center 
                ${auction.status === 'active'
                  ? 'bg-green-500/10 text-green-400'
                  : auction.status === 'ended'
                    ? 'bg-blue-500/10 text-blue-400'
                    : 'bg-red-500/10 text-red-400'
                }`}>
                <p className="font-medium capitalize">
                  Status: {auction.status}
                </p>

                {auction.winner && (
                  <p className="text-sm mt-1">
                    Won by: {auction.winner?.name || 'Unknown Buyer'}
                  </p>
                )}
              </div>

              {user?.user_type === 'buyer' && auction.status === 'active' && (
                <form onSubmit={handleBidSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bidAmount" className="text-white">Your Bid</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500/50" />
                      <Input
                        id="bidAmount"
                        type="number"
                        step="0.01"
                        min={(parseFloat(auction.current_price) +
                          (auction.min_bid_increment || parseFloat(auction.current_price) * 0.05)).toFixed(2)}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="pl-8"
                        placeholder="Enter your bid amount"
                      />
                    </div>
                    {bidError && (
                      <p className="text-sm text-red-400">{bidError}</p>
                    )}
                    <p className="text-xs text-green-500/70">
                      Minimum bid: {formatCurrency(
                        parseFloat(auction.current_price) +
                        (auction.min_bid_increment || parseFloat(auction.current_price) * 0.05)
                      )}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isBidding}
                  >
                    {isBidding ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Placing Bid...
                      </>
                    ) : 'Place Bid'}
                  </Button>
                </form>
              )}

              {isUserWinner && auction.status === 'ended' && (
                <div className="space-y-4">
                  <div className="bg-green-500/10 rounded-lg p-3 text-center">
                    <CheckCircle2 className="h-5 w-5 text-green-400 mx-auto mb-2" />
                    <p className="font-medium text-white">Congratulations!</p>
                    <p className="text-sm text-white/70">
                      You won this auction with a bid of {formatCurrency(auction.current_price)}
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => navigate(`/create-order/${auction.id}`)}
                  >
                    Complete Purchase
                  </Button>
                </div>
              )}

              {isUserSeller && (
                <div className="space-y-3 pt-2 border-t border-green-500/20">
                  <p className="text-sm text-white font-medium">Auction Management</p>

                  {auction.status === 'active' && (
                    <>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleEndAuction}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Clock className="mr-2 h-4 w-4" />
                        )}
                        End Auction Now
                      </Button>

                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={handleCancelAuction}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <AlertCircle className="mr-2 h-4 w-4" />
                        )}
                        Cancel Auction
                      </Button>
                    </>
                  )}

                  {auction.status === 'ended' && bids.length > 0 && (
                    <Button className="w-full">
                      Contact Buyer
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-green-500/20 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-white">About the Seller</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <span className="text-green-500 font-medium">
                      {auction.user?.name?.charAt(0) || 'S'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{auction.user?.name || 'Unknown Seller'}</p>
                    <p className="text-sm text-white/70">
                      {auction.user?.company_profile?.company_name || 'Trading Company'}
                    </p>
                  </div>
                </div>

                <Button variant="outline" className="w-full text-sm" asChild>
                  <Link to={`/traders/${auction.user_id}`}>View Seller Profile</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetailsPage;