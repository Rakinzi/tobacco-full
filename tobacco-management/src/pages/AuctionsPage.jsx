import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Clock, Plus, Search, Filter, Loader2, Leaf, DollarSign, Tag, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import auctionService from '../services/auctionService';
import { formatTobaccoType, formatCurrency, formatWeight, getStorageImageUrl } from '../utils/formatters';

const AuctionsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [auctions, setAuctions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await auctionService.getAllAuctions();
      
      if (response.data.status === 'success') {
        setAuctions(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching auctions:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch auctions');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort auctions
  const filteredAuctions = auctions
    .filter(auction => {
      // Filter by search term
      const matchesSearch = 
        auction.tobacco_listing.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auction.tobacco_listing.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auction.tobacco_listing.grade.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by tobacco type
      const matchesType = filterType === 'all' || auction.tobacco_listing.tobacco_type === filterType;
      
      // Filter by status
      const matchesStatus = filterStatus === 'all' || auction.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      // Sort by selected option
      switch (sortBy) {
        case 'price_asc':
          return parseFloat(a.current_price) - parseFloat(b.current_price);
        case 'price_desc':
          return parseFloat(b.current_price) - parseFloat(a.current_price);
        case 'ending_soon':
          return new Date(a.end_time) - new Date(b.end_time);
        case 'most_recent':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'quantity_desc':
          return parseFloat(b.tobacco_listing.quantity) - parseFloat(a.tobacco_listing.quantity);
        case 'newest':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  // Format time remaining
  const getTimeRemaining = (endTime) => {
    const total = new Date(endTime) - new Date();
    
    // If auction has ended
    if (total <= 0) {
      return 'Ended';
    }
    
    const days = Math.floor(total / (1000 * 60 * 60 * 24));
    const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hr${hours > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min${minutes > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else {
      return 'Ending soon';
    }
  };
  
  // Helper to check if auction is ending soon (within 6 hours)
  const isEndingSoon = (endTime) => {
    const timeLeft = new Date(endTime) - new Date();
    return timeLeft > 0 && timeLeft <= 6 * 60 * 60 * 1000; // 6 hours in milliseconds
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Tobacco Auctions</h1>
        <p className="text-green-500">
          Browse current tobacco listings and place your bids
        </p>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Filters and search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500/50" />
          <Input
            placeholder="Search by batch number, grade..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-1 flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-1/3">
            <Select
              value={filterType}
              onValueChange={setFilterType}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-green-500/50" />
                  <span>Tobacco Type</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="flue_cured">Flue Cured</SelectItem>
                <SelectItem value="burley">Burley</SelectItem>
                <SelectItem value="dark_fired">Dark Fired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-1/3">
            <Select
              value={filterStatus}
              onValueChange={setFilterStatus}
            >
              <SelectTrigger className="w-full">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-500/50" />
                  <span>Status</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-1/3">
            <Select
              value={sortBy}
              onValueChange={setSortBy}
            >
              <SelectTrigger className="w-full">
                <span>Sort By</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="ending_soon">Ending Soon</SelectItem>
                <SelectItem value="price_asc">Price (Low to High)</SelectItem>
                <SelectItem value="price_desc">Price (High to Low)</SelectItem>
                <SelectItem value="quantity_desc">Quantity (High to Low)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {user?.user_type === 'trader' && (
          <Button className="md:w-auto gap-2 whitespace-nowrap" onClick={() => navigate('/auctions/create')}>
            <Plus className="h-4 w-4" />
            <span>New Auction</span>
          </Button>
        )}
      </div>
      
      {/* Auctions grid */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-green-500/50 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-green-500">Loading auctions...</p>
          </div>
        </div>
      ) : filteredAuctions.length === 0 ? (
        <div className="text-center py-16 bg-zinc-950/60 border border-green-500/20 rounded-xl">
          <Leaf className="h-12 w-12 text-green-500/30 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white">No auctions found</h3>
          <p className="text-green-500/70 mt-2 mb-6">Try adjusting your filters or search terms</p>
          {user?.user_type === 'trader' && (
            <Button onClick={() => navigate('/auctions/create')} className="gap-2">
              <Plus className="h-4 w-4" />
              <span>Create Your First Auction</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuctions.map((auction) => {
            const listing = auction.tobacco_listing;
            const isEnding = isEndingSoon(auction.end_time);
            const hasEnded = new Date(auction.end_time) < new Date();
            const showImage = listing.images && listing.images.length > 0;
            
            return (
              <Card key={auction.id} className="flex flex-col overflow-hidden border-green-500/20 backdrop-blur-sm">
                <div className="relative h-48 bg-zinc-950/60">
                  {showImage ? (
                    <img 
                      src={getStorageImageUrl(listing.images[0].image_path)} 
                      alt={listing.batch_number}
                      className="w-full h-full object-cover opacity-90"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-green-500/5">
                      <Leaf className="h-16 w-16 text-green-500/30" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium 
                      ${hasEnded 
                        ? 'bg-blue-500/90 text-blue-50' 
                        : isEnding
                          ? 'bg-amber-500/90 text-amber-50' 
                          : 'bg-emerald-500/90 text-emerald-50'}`
                    }>
                      {hasEnded
                        ? 'Auction Ended'
                        : isEnding
                          ? 'Ending Soon'
                          : 'Active Auction'}
                    </div>
                  </div>
                </div>
                
                <CardContent className="flex-1 pt-6">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg leading-tight text-white">
                      {listing.batch_number} - Grade {listing.grade}
                    </h3>
                    <p className="text-sm text-white/70 line-clamp-2">{listing.description || `${formatTobaccoType(listing.tobacco_type)} tobacco from ${listing.region_grown}.`}</p>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div>
                      <p className="text-xs text-green-500/70">Current Bid</p>
                      <p className="font-bold text-green-500">{formatCurrency(auction.current_price)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-500/70">Starting Price</p>
                      <p className="text-white">{formatCurrency(auction.starting_price)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-500/70">Type</p>
                      <p className="capitalize text-white">{formatTobaccoType(listing.tobacco_type)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-500/70">Quantity</p>
                      <p className="text-white">{formatWeight(listing.quantity)}</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center text-sm text-white/70">
                    <Clock className="h-4 w-4 mr-1 text-green-500/70" />
                    <span>{hasEnded ? 'Auction ended' : `Ends in ${getTimeRemaining(auction.end_time)}`}</span>
                  </div>
                  
                  {auction.winner && (
                    <div className="mt-2 bg-green-500/10 rounded-lg p-2 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-white">
                        Won by: {auction.winner.name}
                      </span>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="border-t border-green-500/20 p-4">
                  <div className="w-full flex gap-3">
                    <Button 
                      variant="outline" 
                      className="w-1/2" 
                      asChild
                    >
                      <Link to={`/auctions/${auction.id}`}>View Details</Link>
                    </Button>
                    
                    {user?.user_type === 'buyer' && auction.status === 'active' && (
                      <Button className="w-1/2" asChild>
                        <Link to={`/auctions/${auction.id}/bid`}>Place Bid</Link>
                      </Button>
                    )}
                    
                    {user?.user_type === 'trader' && auction.user_id === user.id && (
                      <Button 
                        className="w-1/2"
                        variant={auction.status === 'active' ? 'default' : 'outline'}
                        asChild
                      >
                        <Link to={`/auctions/${auction.id}/manage`}>Manage</Link>
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AuctionsPage;