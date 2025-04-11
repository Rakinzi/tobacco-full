import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { 
  CheckCircle2, 
  AlertCircle, 
  Gavel, 
  Calendar, 
  RefreshCw, 
  PlusCircle, 
  ArrowRight,
  DollarSign,
  Clock,
  Clipboard,
  Leaf,
  ImageIcon
} from 'lucide-react';
import tobaccoService from '../services/tobaccoService';
import auctionService from '../services/auctionService';
import { formatTobaccoType, formatCurrency, formatWeight, getStorageImageUrl } from '../utils/formatters';

const CreateAuctionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);

  const [formData, setFormData] = useState({
    tobacco_listing_id: '',
    starting_price: '',
    reserve_price: '',
    start_time: '',
    end_time: ''
  });

  // Set min date for auction start/end time (can't be in the past)
  const today = new Date();
  today.setMinutes(today.getMinutes() + 30); // Add 30 minutes buffer
  const minDateTime = today.toISOString().slice(0, 16);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowDateTime = tomorrow.toISOString().slice(0, 16);

  useEffect(() => {
    fetchTobaccoListings();
  }, [user]);

  const fetchTobaccoListings = async () => {
    setIsFetching(true);
    setError(null);

    try {
      // Fetch only approved tobacco listings that can be auctioned
      const response = await tobaccoService.getAllListings();
      
      if (response.data && response.data.data) {
        // Filter for approved listings only
        const approvedListings = response.data.data.filter(
          listing => listing.status === 'approved' && listing.timb_cleared
        );
        setListings(approvedListings);
      }
    } catch (err) {
      console.error('Error fetching tobacco listings:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch tobacco listings');
    } finally {
      setIsFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectListing = (id) => {
    setFormData(prev => ({
      ...prev,
      tobacco_listing_id: id
    }));
    
    const listing = listings.find(listing => listing.id.toString() === id.toString());
    setSelectedListing(listing);
    
    // Set a default starting price based on minimum price
    if (listing && listing.minimum_price) {
      const minPrice = parseFloat(listing.minimum_price);
      setFormData(prev => ({
        ...prev,
        starting_price: minPrice.toString(),
        reserve_price: Math.round(minPrice * 1.1).toString() // Default 10% higher than minimum
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Validate form
    if (!formData.tobacco_listing_id) {
      setError('Please select a tobacco listing');
      setIsLoading(false);
      return;
    }

    // Validate prices
    const startingPrice = parseFloat(formData.starting_price);
    const reservePrice = parseFloat(formData.reserve_price);
    const minimumPrice = selectedListing ? parseFloat(selectedListing.minimum_price) : 0;

    if (startingPrice < minimumPrice) {
      setError(`Starting price cannot be less than the listing's minimum price (${formatCurrency(minimumPrice)})`);
      setIsLoading(false);
      return;
    }

    if (reservePrice < startingPrice) {
      setError('Reserve price cannot be less than starting price');
      setIsLoading(false);
      return;
    }

    // Validate dates
    const startTime = new Date(formData.start_time);
    const endTime = new Date(formData.end_time);
    const now = new Date();

    if (startTime <= now) {
      setError('Auction start time must be in the future');
      setIsLoading(false);
      return;
    }

    if (endTime <= startTime) {
      setError('Auction end time must be after start time');
      setIsLoading(false);
      return;
    }

    try {
      // Format dates correctly for API
      const formattedData = {
        ...formData,
        start_time: formatDateForBackend(formData.start_time),
        end_time: formatDateForBackend(formData.end_time)
      };

      const response = await auctionService.createAuction(formattedData);
      
      if (response.data.status === 'success') {
        setSuccessMessage('Auction created successfully!');
        
        // Clear form
        setFormData({
          tobacco_listing_id: '',
          starting_price: '',
          reserve_price: '',
          start_time: '',
          end_time: ''
        });
        setSelectedListing(null);
        
        // Navigate to auction details or list
        setTimeout(() => {
          navigate('/auctions');
        }, 2000);
      }
    } catch (err) {
      console.error('Error creating auction:', err);
      setError(err.response?.data?.errors || err.response?.data?.message || err.message || 'Failed to create auction');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format date for backend
  const formatDateForBackend = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 19).replace('T', ' ');
  };

  // Show loader while initially fetching data
  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-green-500/50 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-green-500">Loading tobacco listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Gavel className="h-8 w-8 text-green-500" />
        <div>
          <h1 className="text-3xl font-bold text-white">Create Auction</h1>
          <p className="text-green-500">
            List your approved tobacco for auction
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {typeof error === 'object'
              ? Object.entries(error).map(([key, value]) => (
                <div key={key}>{key}: {Array.isArray(value) ? value[0] : value}</div>
              ))
              : error
            }
          </AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" className="mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Auction Details</CardTitle>
          <CardDescription>
            Create a new auction for your approved tobacco listing
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Select Tobacco Listing */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="bg-green-500/10 p-1 rounded-full">
                  <Leaf className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">Step 1: Select Tobacco Listing</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tobacco_listing_id">Tobacco Listing *</Label>
                <Select 
                  value={formData.tobacco_listing_id} 
                  onValueChange={handleSelectListing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an approved tobacco listing" />
                  </SelectTrigger>
                  <SelectContent>
                    {listings.length === 0 ? (
                      <div className="p-2 text-center text-white/70">
                        No approved listings available
                      </div>
                    ) : (
                      listings.map(listing => (
                        <SelectItem key={listing.id} value={listing.id.toString()}>
                          {listing.batch_number} - {formatTobaccoType(listing.tobacco_type)} ({formatWeight(listing.quantity)})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Listing Preview */}
              {selectedListing && (
                <div className="mt-4 border border-green-500/20 rounded-lg p-4 bg-green-500/5">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium text-white">{selectedListing.batch_number}</h4>
                    <div className="bg-green-500/10 text-green-400 text-xs px-2 py-1 rounded-full capitalize flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>TIMB Certified</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-white/70">
                        <Leaf className="h-3.5 w-3.5" />
                        <span>{formatTobaccoType(selectedListing.tobacco_type)} - Grade {selectedListing.grade}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>Minimum Price: {formatCurrency(selectedListing.minimum_price)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/70">
                        <Clipboard className="h-3.5 w-3.5" />
                        <span>Certificate: {selectedListing.timb_certificate_number}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end">
                      {selectedListing.images && selectedListing.images.length > 0 ? (
                        <img 
                          src={getStorageImageUrl(selectedListing.images[0].image_path)} 
                          alt="Tobacco Preview" 
                          className="h-16 w-16 object-cover rounded-lg border border-green-500/20"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg border border-green-500/20 flex items-center justify-center bg-zinc-900/50">
                          <ImageIcon className="h-8 w-8 text-green-500/30" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Set Auction Prices */}
            <div className="space-y-4 pt-4 border-t border-green-500/20">
              <div className="flex items-center gap-2">
                <div className="bg-green-500/10 p-1 rounded-full">
                  <DollarSign className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">Step 2: Set Auction Prices</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="starting_price">Starting Price (USD) *</Label>
                  <Input
                    id="starting_price"
                    name="starting_price"
                    type="number"
                    step="0.01"
                    min={selectedListing ? selectedListing.minimum_price : 0}
                    value={formData.starting_price}
                    onChange={handleChange}
                    placeholder="e.g. 500.00"
                    required
                  />
                  {selectedListing && (
                    <p className="text-xs text-green-500/70">
                      Must be at least {formatCurrency(selectedListing.minimum_price)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reserve_price">Reserve Price (USD) *</Label>
                  <Input
                    id="reserve_price"
                    name="reserve_price"
                    type="number"
                    step="0.01"
                    min={formData.starting_price}
                    value={formData.reserve_price}
                    onChange={handleChange}
                    placeholder="e.g. 550.00"
                    required
                  />
                  <p className="text-xs text-green-500/70">
                    Must be greater than starting price
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3: Set Auction Duration */}
            <div className="space-y-4 pt-4 border-t border-green-500/20">
              <div className="flex items-center gap-2">
                <div className="bg-green-500/10 p-1 rounded-full">
                  <Clock className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-white">Step 3: Set Auction Duration</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    name="start_time"
                    type="datetime-local"
                    min={minDateTime}
                    value={formData.start_time}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-green-500/70">
                    When the auction will become available for bidding
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time *</Label>
                  <Input
                    id="end_time"
                    name="end_time"
                    type="datetime-local"
                    min={formData.start_time || tomorrowDateTime}
                    value={formData.end_time}
                    onChange={handleChange}
                    required
                  />
                  <p className="text-xs text-green-500/70">
                    When the auction will close for bidding
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-green-500/20">
              <p className="text-sm text-white/70 mb-4">
                <span className="text-red-400">*</span> Required fields
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  type="submit"
                  disabled={isLoading || listings.length === 0}
                  className="flex items-center gap-2"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Gavel className="h-4 w-4" />
                  )}
                  <span>
                    {isLoading ? "Creating Auction..." : "Create Auction"}
                  </span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/auctions')}
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  <span>View All Auctions</span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAuctionPage;