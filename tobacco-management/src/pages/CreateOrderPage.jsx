import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  ArrowLeft, 
  Truck, 
  Calendar, 
  Clipboard, 
  Package, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  User
} from 'lucide-react';
import auctionService from '../services/auctionService';
import orderService from '../services/orderService';
import { formatCurrency, formatTobaccoType, formatWeight } from '../utils/formatters';

const CreateOrderPage = () => {
  const { id: auctionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [auction, setAuction] = useState(null);
  
  const [formData, setFormData] = useState({
    auction_id: auctionId,
    delivery_instructions: '',
    delivery_date: ''
  });

  useEffect(() => {
    fetchAuctionDetails();
  }, [auctionId]);

  // Set minimum delivery date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDeliveryDate = tomorrow.toISOString().split('T')[0];
  
  // Calculate price including fees (example: 2.5% platform fee)
  const calculateTotal = (price) => {
    if (!price) return 0;
    const platformFee = parseFloat(price) * 0.025;
    return parseFloat(price) + platformFee;
  };

  const fetchAuctionDetails = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await auctionService.getAuction(auctionId);
      
      if (response.data.status === 'success') {
        const auctionData = response.data.data;
        
        // Verify this auction is ended and user is the winner
        if (auctionData.status !== 'ended') {
          setError('This auction is not yet ended or is not available for ordering.');
          setIsLoading(false);
          return;
        }
        
        if (auctionData.winner_id !== user.id) {
          setError('You are not the winner of this auction and cannot create an order for it.');
          setIsLoading(false);
          return;
        }
        
        setAuction(auctionData);
        
        // Set default delivery date to 7 days from now
        const defaultDeliveryDate = new Date();
        defaultDeliveryDate.setDate(defaultDeliveryDate.getDate() + 7);
        setFormData(prev => ({
          ...prev,
          delivery_date: defaultDeliveryDate.toISOString().split('T')[0]
        }));
      }
    } catch (err) {
      console.error('Error fetching auction details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch auction details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    // Validate the form
    if (!formData.delivery_date) {
      setError('Please select a delivery date');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await orderService.createOrder(formData);
      
      if (response.data.status === 'success') {
        setSuccessMessage('Order created successfully!');
        
        // Wait for a moment before redirecting
        setTimeout(() => {
          navigate(`/orders/${response.data.data.id}`);
        }, 2000);
      }
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create order');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  // Handle error states
  if (error && !auction) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4 space-y-6">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => navigate(`/auctions/${auctionId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Auction
        </Button>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="flex items-start gap-3">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate(`/auctions/${auctionId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Create Order</h1>
          <p className="text-green-500">
            Complete your purchase for the won auction
          </p>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {successMessage && (
        <Alert variant="success">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Details</CardTitle>
              <CardDescription>
                Provide details for the delivery of your tobacco
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="delivery_date">Delivery Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500/50" />
                      <Input
                        id="delivery_date"
                        name="delivery_date"
                        type="date"
                        min={minDeliveryDate}
                        value={formData.delivery_date}
                        onChange={handleChange}
                        className="pl-10"
                        required
                      />
                    </div>
                    <p className="text-xs text-green-500/70">
                      Select a date at least 1 day in the future
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="delivery_instructions">Delivery Instructions</Label>
                    <div className="relative">
                      <Truck className="absolute left-3 top-3 h-4 w-4 text-green-500/50" />
                      <Textarea
                        id="delivery_instructions"
                        name="delivery_instructions"
                        value={formData.delivery_instructions}
                        onChange={handleChange}
                        className="pl-10 min-h-32"
                        placeholder="Provide any special instructions for delivery (optional)"
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Confirm Order
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Auction Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-500" />
                  <h3 className="text-white font-medium">Tobacco Details</h3>
                </div>
                
                <div className="border border-green-500/20 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/70">Batch Number</span>
                    <span className="text-white font-medium">{auction.tobacco_listing.batch_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Type</span>
                    <span className="text-white">{formatTobaccoType(auction.tobacco_listing.tobacco_type)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Grade</span>
                    <span className="text-white">{auction.tobacco_listing.grade}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Quantity</span>
                    <span className="text-white">{formatWeight(auction.tobacco_listing.quantity)}</span>
                  </div>
                </div>
              </div>
              
              {/* Seller Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-green-500" />
                  <h3 className="text-white font-medium">Seller Details</h3>
                </div>
                
                <div className="border border-green-500/20 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/70">Seller</span>
                    <span className="text-white">{auction.user?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Company</span>
                    <span className="text-white">{auction.tobacco_listing.company_profile?.company_name || 'Unknown'}</span>
                  </div>
                </div>
              </div>
              
              {/* Price Summary */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <h3 className="text-white font-medium">Price Summary</h3>
                </div>
                
                <div className="border border-green-500/20 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-white/70">Auction Price</span>
                    <span className="text-white">{formatCurrency(auction.current_price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/70">Platform Fee (2.5%)</span>
                    <span className="text-white">{formatCurrency(parseFloat(auction.current_price) * 0.025)}</span>
                  </div>
                  <div className="border-t border-green-500/20 pt-3 flex justify-between">
                    <span className="text-white font-medium">Total</span>
                    <span className="text-green-500 font-bold">{formatCurrency(calculateTotal(auction.current_price))}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-white/70">
                <span className="text-green-500">Note:</span> Payment will be requested after order confirmation. Delivery will be arranged by the seller.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderPage;