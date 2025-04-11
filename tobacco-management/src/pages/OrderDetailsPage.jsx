import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { 
  ArrowLeft, 
  Truck, 
  Calendar, 
  Clipboard, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw,
  User,
  Package,
  CreditCard,
  Download,
  Send
} from 'lucide-react';
import orderService from '../services/orderService';
import { formatCurrency, formatDate } from '../utils/formatters';

// Function to get color based on status
const getStatusColor = (status) => {
  switch (status) {
    case 'paid':
      return 'text-blue-500 bg-blue-500/10';
    case 'completed':
      return 'text-green-500 bg-green-500/10';
    case 'cancelled':
      return 'text-red-500 bg-red-500/10';
    case 'pending':
    default:
      return 'text-yellow-500 bg-yellow-500/10';
  }
};

// Function to get color based on delivery status
const getDeliveryStatusColor = (status) => {
  switch (status) {
    case 'delivered':
      return 'text-green-500 bg-green-500/10';
    case 'in_transit':
      return 'text-blue-500 bg-blue-500/10';
    case 'scheduled':
    default:
      return 'text-yellow-500 bg-yellow-500/10';
  }
};

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [order, setOrder] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    fetchOrderDetails();
  }, [id]);
  
  const fetchOrderDetails = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await orderService.getOrder(id);
      
      if (response.data.status === 'success') {
        setOrder(response.data.data);
        
        // Set transactions if they exist
        if (response.data.data.transactions) {
          setTransactions(response.data.data.transactions);
        }
      }
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch order details');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreatePayment = async () => {
    if (!order) return;
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Sample payment data - in a real app, this would be integrated with a payment gateway
      const paymentData = {
        payment_method: 'bank_transfer',
        payment_gateway: 'paynow',
        payment_details: {
          bank_name: 'Example Bank',
          account_number: '1234567890',
          reference: `PAY-${order.order_number}`
        }
      };
      
      const response = await orderService.createTransaction(order.id, paymentData);
      
      if (response.data.status === 'success') {
        setSuccessMessage('Payment initiated successfully!');
        
        // Add the new transaction to the list
        setTransactions(prev => [response.data.data, ...prev]);
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      }
    } catch (err) {
      console.error('Error creating payment:', err);
      setError(err.response?.data?.message || err.message || 'Failed to initiate payment');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDownloadInvoice = () => {
    // In a real app, this would download an invoice
    alert('Invoice download functionality would be integrated here');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-green-500/50 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-green-500">Loading order details...</p>
        </div>
      </div>
    );
  }
  
  if (error && !order) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4 space-y-6">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => navigate('/auction-tracking')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  // Ensure order exists
  if (!order) {
    return (
      <div className="container max-w-3xl mx-auto py-8 px-4 space-y-6">
        <Button 
          variant="outline" 
          className="mb-6"
          onClick={() => navigate('/auction-tracking')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Order not found</AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container max-w-5xl mx-auto py-8 px-4 space-y-8">
      <div className="flex items-start gap-3">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/auction-tracking')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Order Details</h1>
          <p className="text-green-500">
            Order #{order.order_number}
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
      
      {/* Order Status */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="space-y-2">
              <div className="text-sm text-white/50">Order Status</div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-white/50">Delivery Status</div>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDeliveryStatusColor(order.delivery_status)}`}>
                {order.delivery_status.replace('_', ' ').charAt(0).toUpperCase() + order.delivery_status.replace('_', ' ').slice(1)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-white/50">Order Date</div>
              <div className="font-medium text-white">{formatDate(order.created_at)}</div>
            </div>
            
            <div className="space-y-2">
              <div className="text-sm text-white/50">Total Amount</div>
              <div className="font-bold text-green-500">{formatCurrency(order.amount)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Clipboard className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span>Delivery</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>Payment</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buyer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Buyer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{order.buyer?.name || 'Unknown'}</p>
                    <p className="text-sm text-white/70">{order.buyer?.email || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="border-t border-green-500/20 pt-4">
                  <div className="text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-white/70">Phone</div>
                      <div className="text-white">{order.buyer?.phone_number || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Seller Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Seller</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{order.seller?.name || 'Unknown'}</p>
                    <p className="text-sm text-white/70">{order.seller?.email || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="border-t border-green-500/20 pt-4">
                  <div className="text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-white/70">Phone</div>
                      <div className="text-white">{order.seller?.phone_number || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Product Information */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-xl">Product Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-green-500/20">
                        <th className="text-left py-3 px-4 text-green-500">Item</th>
                        <th className="text-left py-3 px-4 text-green-500">Description</th>
                        <th className="text-right py-3 px-4 text-green-500">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-green-500/10">
                        <td className="py-4 px-4 text-white font-medium">
                          {order.auction?.tobacco_listing?.batch_number || 'Tobacco Batch'}
                        </td>
                        <td className="py-4 px-4 text-white/70">
                          {order.auction?.tobacco_listing?.description || 
                           `${order.auction?.tobacco_listing?.tobacco_type || 'Tobacco'} - 
                            Grade ${order.auction?.tobacco_listing?.grade || 'A'} - 
                            ${order.auction?.tobacco_listing?.quantity || '100'} kg`}
                        </td>
                        <td className="py-4 px-4 text-right text-white font-medium">
                          {formatCurrency(order.amount)}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-green-500/20">
                        <td colSpan="2" className="py-4 px-4 text-white font-medium">Total</td>
                        <td className="py-4 px-4 text-right text-green-500 font-bold">
                          {formatCurrency(order.amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
              <CardFooter className="border-t border-green-500/20 flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="gap-2"
                  onClick={handleDownloadInvoice}
                >
                  <Download className="h-4 w-4" />
                  <span>Download Invoice</span>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Delivery Tab */}
        <TabsContent value="delivery" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Scheduled Delivery Date</p>
                      <p className="text-white font-medium">{formatDate(order.delivery_date) || 'No date scheduled'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <Truck className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-white/70 text-sm">Delivery Status</p>
                      <div className={`inline-flex items-center mt-1 px-3 py-1 rounded-full text-xs font-medium ${getDeliveryStatusColor(order.delivery_status)}`}>
                        {order.delivery_status.replace('_', ' ').charAt(0).toUpperCase() + order.delivery_status.replace('_', ' ').slice(1)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-white/70 text-sm">Delivery Instructions</p>
                  <div className="p-4 bg-zinc-950/60 rounded-lg border border-green-500/20 text-white">
                    {order.delivery_instructions || 'No special instructions provided.'}
                  </div>
                </div>
              </div>
              
              {/* Delivery Timeline */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-white mb-4">Delivery Timeline</h3>
                
                <div className="relative pl-8 border-l-2 border-green-500/20 space-y-8">
                  {/* Order Placed */}
                  <div className="relative">
                    <div className="absolute -left-[25px] top-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">Order Placed</p>
                      <p className="text-sm text-white/70">{formatDate(order.created_at, true)}</p>
                    </div>
                  </div>
                  
                  {/* Processing */}
                  <div className="relative">
                    <div className={`absolute -left-[25px] top-0 w-6 h-6 rounded-full ${
                      order.status === 'paid' || order.status === 'completed'
                        ? 'bg-green-500' : 'bg-green-500/20'
                    } flex items-center justify-center`}>
                      {order.status === 'paid' || order.status === 'completed' ? (
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">Order Processing</p>
                      <p className="text-sm text-white/70">
                        {order.status === 'paid' || order.status === 'completed'
                          ? 'Payment confirmed and order processed'
                          : order.status === 'pending' 
                            ? 'Waiting for payment'
                            : 'Order cancelled'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {/* Delivery */}
                  <div className="relative">
                    <div className={`absolute -left-[25px] top-0 w-6 h-6 rounded-full ${
                      order.delivery_status === 'in_transit' || order.delivery_status === 'delivered'
                        ? 'bg-green-500' : 'bg-green-500/20'
                    } flex items-center justify-center`}>
                      {order.delivery_status === 'in_transit' || order.delivery_status === 'delivered' ? (
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">In Transit</p>
                      <p className="text-sm text-white/70">
                        {order.delivery_status === 'in_transit'
                          ? 'Your order is on the way'
                          : order.delivery_status === 'delivered'
                            ? 'Order has been shipped and delivered'
                            : 'Waiting for shipment'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {/* Delivered */}
                  <div className="relative">
                    <div className={`absolute -left-[25px] top-0 w-6 h-6 rounded-full ${
                      order.delivery_status === 'delivered'
                        ? 'bg-green-500' : 'bg-green-500/20'
                    } flex items-center justify-center`}>
                      {order.delivery_status === 'delivered' ? (
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">Delivered</p>
                      <p className="text-sm text-white/70">
                        {order.delivery_status === 'delivered'
                          ? 'Order has been delivered successfully'
                          : 'Waiting for delivery'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            
            {user.id === order.buyer_id && (
              <CardFooter className="border-t border-green-500/20 flex justify-end">
                <Button size="sm" className="gap-2">
                  <Send className="h-4 w-4" />
                  <span>Contact Seller</span>
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        {/* Payment Tab */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Summary */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Summary</h3>
                
                <div className="border border-green-500/20 rounded-lg p-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-white/70">Order Total</span>
                    <span className="text-white font-medium">{formatCurrency(order.amount)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-white/70">Payment Status</span>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </div>
                  </div>
                  
                  {order.status === 'pending' && user.id === order.buyer_id && (
                    <Button 
                      className="w-full mt-4"
                      onClick={handleCreatePayment}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" />
                          Make Payment
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Transaction History */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Transaction History</h3>
                
                {transactions.length === 0 ? (
                  <div className="text-center py-8 border border-green-500/20 rounded-lg">
                    <p className="text-white/70">No transactions found for this order</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="border border-green-500/20 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                          <p className="font-medium text-white">
                              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} - {transaction.transaction_reference}
                            </p>
                            <p className="text-xs text-white/50">{formatDate(transaction.created_at, true)}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold ${transaction.status === 'completed' ? 'text-green-500' : 'text-white'}`}>
                              {formatCurrency(transaction.amount)}
                            </p>
                            <div className={`inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              transaction.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                              transaction.status === 'processing' ? 'bg-blue-500/10 text-blue-400' :
                              transaction.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                              'bg-yellow-500/10 text-yellow-400'
                            }`}>
                              {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-sm text-white/70">
                          <p>Method: {transaction.payment_method.replace('_', ' ').charAt(0).toUpperCase() + transaction.payment_method.replace('_', ' ').slice(1)}</p>
                          <p>Gateway: {transaction.payment_gateway.charAt(0).toUpperCase() + transaction.payment_gateway.slice(1)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderDetailsPage;