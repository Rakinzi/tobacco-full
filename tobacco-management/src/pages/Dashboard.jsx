import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  BarChart, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  Activity, 
  Package, 
  AlertTriangle,
  Clock,
  FileText,
  Users,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import auctionService from '../services/auctionService';
import orderService from '../services/orderService';
import tobaccoService from '../services/tobaccoService';
import { formatCurrency, formatTobaccoType } from '../utils/formatters';

const Dashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentAuctions: [],
    notifications: [],
    recentOrders: [],
    activeListings: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Common data for all user types
      let stats = [];
      let recentAuctions = [];
      let recentOrders = [];
      let activeListings = [];
      let notifications = []; // We would fetch these from a notifications endpoint

      // Fetch data based on user type
      if (user?.user_type === 'trader') {
        // Get tobacco listings for traders
        const listingsResponse = await tobaccoService.getAllListings();
        if (listingsResponse.data.status === 'success') {
          activeListings = listingsResponse.data.data;
        }
        
        // Get auctions created by the trader
        const auctionsResponse = await auctionService.getAllAuctions();
        if (auctionsResponse.data.status === 'success') {
          recentAuctions = auctionsResponse.data.data
            .filter(auction => auction.user_id === user.id)
            .slice(0, 4);
        }
        
        // Get orders where trader is the seller
        const ordersResponse = await orderService.getAllOrders();
        if (ordersResponse.data.status === 'success') {
          recentOrders = ordersResponse.data.data.slice(0, 3);
        }
        
        // Calculate stats
        const pendingListings = activeListings.filter(listing => listing.status === 'pending').length;
        const approvedListings = activeListings.filter(listing => listing.status === 'approved').length;
        const totalSales = recentOrders.reduce((sum, order) => sum + parseFloat(order.amount), 0);
        const activeAuctions = recentAuctions.filter(auction => auction.status === 'active').length;
        
        stats = [
          { 
            id: 1, 
            title: 'Active Listings', 
            value: String(approvedListings), 
            icon: <Package className="h-5 w-5 text-emerald-500" />, 
            trend: pendingListings > 0 ? `+${pendingListings} pending` : '0 pending', 
            color: 'emerald' 
          },
          { 
            id: 2, 
            title: 'Pending Orders', 
            value: String(recentOrders.filter(order => order.status === 'pending').length), 
            icon: <ShoppingBag className="h-5 w-5 text-blue-500" />, 
            trend: `${recentOrders.filter(order => order.status === 'paid').length} paid`, 
            color: 'blue' 
          },
          { 
            id: 3, 
            title: 'Revenue', 
            value: formatCurrency(totalSales), 
            icon: <DollarSign className="h-5 w-5 text-purple-500" />, 
            trend: `${recentOrders.length} orders`, 
            color: 'purple' 
          },
          { 
            id: 4, 
            title: 'Active Auctions', 
            value: String(activeAuctions), 
            icon: <TrendingUp className="h-5 w-5 text-amber-500" />, 
            trend: `${recentAuctions.filter(auction => auction.status === 'ended').length} ended`, 
            color: 'amber' 
          },
        ];
      } 
      else if (user?.user_type === 'buyer') {
        // Get auctions won by the buyer
        const wonAuctionsResponse = await auctionService.getWonAuctions();
        if (wonAuctionsResponse.data.status === 'success') {
          recentAuctions = wonAuctionsResponse.data.data.slice(0, 4);
        }
        
        // Get active auctions
        const auctionsResponse = await auctionService.getAllAuctions();
        if (auctionsResponse.data.status === 'success') {
          // Filter for active auctions
          const activeAuctions = auctionsResponse.data.data
            .filter(auction => auction.status === 'active')
            .slice(0, 4);
            
          recentAuctions = [...recentAuctions, ...activeAuctions]
            .slice(0, 4); // Keep only the 4 most recent
        }
        
        // Get orders where buyer is the buyer
        const ordersResponse = await orderService.getAllOrders();
        if (ordersResponse.data.status === 'success') {
          recentOrders = ordersResponse.data.data.slice(0, 3);
        }
        
        // Calculate stats
        const totalSpent = recentOrders.reduce((sum, order) => sum + parseFloat(order.amount), 0);
        const activeAuctions = recentAuctions.filter(auction => auction.status === 'active').length;
        const wonAuctions = recentAuctions.filter(auction => auction.winner_id === user.id).length;
        
        stats = [
          { 
            id: 1, 
            title: 'Active Bids', 
            value: String(activeAuctions), 
            icon: <Activity className="h-5 w-5 text-emerald-500" />, 
            trend: `${activeAuctions} auctions`, 
            color: 'emerald' 
          },
          { 
            id: 2, 
            title: 'Purchased Items', 
            value: String(recentOrders.length), 
            icon: <ShoppingBag className="h-5 w-5 text-blue-500" />, 
            trend: `${recentOrders.filter(order => order.status === 'completed').length} completed`, 
            color: 'blue' 
          },
          { 
            id: 3, 
            title: 'Total Spent', 
            value: formatCurrency(totalSpent), 
            icon: <DollarSign className="h-5 w-5 text-purple-500" />, 
            trend: `${wonAuctions} won auctions`, 
            color: 'purple' 
          },
          { 
            id: 4, 
            title: 'Upcoming Deliveries', 
            value: String(recentOrders.filter(order => order.delivery_status === 'scheduled').length), 
            icon: <Calendar className="h-5 w-5 text-amber-500" />, 
            trend: `${recentOrders.filter(order => order.delivery_status === 'in_transit').length} in transit`, 
            color: 'amber' 
          },
        ];
      } 
      else if (user?.user_type === 'timb_officer') {
        // Get tobacco listings for TIMB officers to review
        const listingsResponse = await tobaccoService.getAllListings();
        if (listingsResponse.data.status === 'success') {
          activeListings = listingsResponse.data.data;
        }
        
        // Calculate stats
        const pendingClearances = activeListings.filter(listing => listing.status === 'pending').length;
        const approvedToday = activeListings.filter(listing => {
          if (listing.status !== 'approved') return false;
          
          const today = new Date();
          const clearedDate = new Date(listing.timb_cleared_at);
          return clearedDate.toDateString() === today.toDateString();
        }).length;
        
        const totalTobaccoVolume = activeListings.reduce((sum, listing) => {
          return sum + (parseFloat(listing.quantity) || 0);
        }, 0);
        
        stats = [
          { 
            id: 1, 
            title: 'Pending Clearances', 
            value: String(pendingClearances), 
            icon: <AlertTriangle className="h-5 w-5 text-amber-500" />, 
            trend: `${pendingClearances} to review`, 
            color: 'amber' 
          },
          { 
            id: 2, 
            title: 'Approved Today', 
            value: String(approvedToday), 
            icon: <Activity className="h-5 w-5 text-emerald-500" />, 
            trend: `${approvedToday} batches`, 
            color: 'emerald' 
          },
          { 
            id: 3, 
            title: 'Total Tobacco Volume', 
            value: `${totalTobaccoVolume.toLocaleString()} kg`, 
            icon: <Package className="h-5 w-5 text-blue-500" />, 
            trend: `${activeListings.length} batches`, 
            color: 'blue' 
          },
          { 
            id: 4, 
            title: 'Average Processing Time', 
            value: '1.8 days', // This would require more complex calculation
            icon: <Clock className="h-5 w-5 text-purple-500" />, 
            trend: 'Last 30 days', 
            color: 'purple' 
          },
        ];
        
        // Get the recent approved listings for display
        recentAuctions = activeListings
          .filter(listing => listing.status === 'approved')
          .slice(0, 4)
          .map(listing => ({
            id: listing.id,
            title: `${listing.batch_number} - ${formatTobaccoType(listing.tobacco_type)}`,
            current_price: listing.minimum_price,
            bids: 0,
            ends_at: listing.timb_cleared_at,
            status: 'approved'
          }));
      } 
      else if (user?.user_type === 'admin') {
        // Admin dashboard data
        // Get all users (would need an endpoint)
        // Get all auctions
        const auctionsResponse = await auctionService.getAllAuctions();
        if (auctionsResponse.data.status === 'success') {
          recentAuctions = auctionsResponse.data.data.slice(0, 4);
        }
        
        // Get all orders
        const ordersResponse = await orderService.getAllOrders();
        if (ordersResponse.data.status === 'success') {
          recentOrders = ordersResponse.data.data.slice(0, 3);
        }
        
        // Get all listings
        const listingsResponse = await tobaccoService.getAllListings();
        if (listingsResponse.data.status === 'success') {
          activeListings = listingsResponse.data.data;
        }
        
        // Calculate stats
        const totalRevenue = recentOrders.reduce((sum, order) => sum + parseFloat(order.amount), 0);
        const activeAuctions = recentAuctions.filter(auction => auction.status === 'active').length;
        const dailyTransactions = recentOrders.filter(order => {
          const today = new Date();
          const orderDate = new Date(order.created_at);
          return orderDate.toDateString() === today.toDateString();
        }).length;
        
        stats = [
          { 
            id: 1, 
            title: 'Active Users', 
            value: '20+', // Would need a users endpoint
            icon: <Users className="h-5 w-5 text-emerald-500" />, 
            trend: 'Growing', 
            color: 'emerald' 
          },
          { 
            id: 2, 
            title: 'Platform Revenue', 
            value: formatCurrency(totalRevenue), 
            icon: <DollarSign className="h-5 w-5 text-blue-500" />, 
            trend: `${recentOrders.length} orders`, 
            color: 'blue' 
          },
          { 
            id: 3, 
            title: 'Active Auctions', 
            value: String(activeAuctions), 
            icon: <Package className="h-5 w-5 text-purple-500" />, 
            trend: `${recentAuctions.length} total`, 
            color: 'purple' 
          },
          { 
            id: 4, 
            title: 'Daily Transactions', 
            value: String(dailyTransactions), 
            icon: <BarChart className="h-5 w-5 text-amber-500" />, 
            trend: `${recentOrders.filter(order => order.status === 'completed').length} completed`, 
            color: 'amber' 
          },
        ];
      }

      // Set the dashboard data
      setDashboardData({
        stats,
        recentAuctions,
        notifications,
        recentOrders,
        activeListings
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Here's an overview of your activities.
          </p>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        
        <Button onClick={fetchDashboardData}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name}! Here's an overview of your activities.
        </p>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardData.stats.map((stat) => (
          <Card key={stat.id} className="border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                </div>
                <div className={`rounded-full p-2 bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                  {stat.icon}
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-xs font-medium text-${stat.color}-600 dark:text-${stat.color}-400`}>
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Recent auctions and notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent auctions */}
        <Card className="lg:col-span-2 shadow-sm border-border">
          <CardHeader className="pb-3">
            <CardTitle>
              {user?.user_type === 'buyer' ? 'Recent Auctions' : 
               user?.user_type === 'trader' ? 'Your Auctions' :
               user?.user_type === 'timb_officer' ? 'Recent Approved Listings' :
               'Platform Auctions'}
            </CardTitle>
            <CardDescription>
              {user?.user_type === 'buyer' ? 'Browse and bid on tobacco auctions' : 
               user?.user_type === 'trader' ? 'Manage your tobacco auctions' :
               user?.user_type === 'timb_officer' ? 'Recently approved tobacco listings' :
               'Monitor auction activity across the platform'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentAuctions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent auctions available
                </div>
              ) : (
                dashboardData.recentAuctions.map((auction) => (
                  <div key={auction.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition duration-150">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        auction.status === 'ending_soon' ? 'bg-amber-500' : 
                        auction.status === 'active' ? 'bg-emerald-500' :
                        auction.status === 'ended' ? 'bg-blue-500' :
                        auction.status === 'approved' ? 'bg-green-500' :
                        'bg-muted'
                      }`}></div>
                      <div>
                        <h4 className="text-sm font-medium">{auction.title || auction.tobacco_listing?.batch_number || `Auction #${auction.id}`}</h4>
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium text-primary">
                            {formatCurrency(auction.current_price)}
                          </span>
                          {' '} · {auction.bids || 0} bids · {auction.status === 'active' ? `Ends ${new Date(auction.end_time || auction.ends_at).toLocaleDateString()}` : auction.status}
                        </div>
                      </div>
                    </div>
                    
                    <Link to={`/auctions/${auction.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-3 border-t">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/auctions">View All Auctions</Link>
            </Button>
          </CardFooter>
        </Card>
        
        {/* Notifications */}
        <Card className="shadow-sm border-border">
          <CardHeader className="pb-3">
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Stay updated with your latest activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentOrders.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity available
                </div>
              ) : (
                dashboardData.recentOrders.map((order) => (
                  <div key={order.id} className="p-3 rounded-lg border border-border">
                    <h4 className="text-sm font-medium flex items-center">
                      Order #{order.order_number}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {order.status === 'pending' ? 'Payment pending' : 
                       order.status === 'paid' ? 'Payment received' :
                       order.status === 'completed' ? 'Order completed' :
                       'Order ' + order.status}
                    </p>
                    <div className="text-xs text-muted-foreground mt-2 flex justify-between">
                      <span>{new Date(order.created_at).toLocaleDateString()}</span>
                      <span className="font-medium">{formatCurrency(order.amount)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          <CardFooter className="pt-3 border-t">
            <Button variant="outline" className="w-full" asChild>
              <Link to="/auction-tracking">View All Activity</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Action buttons for specific user types */}
      <div className="flex flex-wrap gap-4">
        {user?.user_type === 'trader' && (
          <>
            <Button className="gap-2" asChild>
              <Link to="/tobacco-listings">
                <Package className="h-4 w-4" />
                <span>Manage Listings</span>
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link to="/trader/orders">
                <ShoppingBag className="h-4 w-4" />
                <span>View Orders</span>
              </Link>
            </Button>
          </>
        )}
        
        {user?.user_type === 'buyer' && (
          <>
            <Button className="gap-2" asChild>
              <Link to="/auctions">
                <Package className="h-4 w-4" />
                <span>Browse Auctions</span>
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link to="/auction-tracking">
                <ShoppingBag className="h-4 w-4" />
                <span>View My Orders</span>
              </Link>
            </Button>
          </>
        )}
        
        {user?.user_type === 'timb_officer' && (
          <>
            <Button className="gap-2" asChild>
              <Link to="/timb-officer">
                <AlertTriangle className="h-4 w-4" />
                <span>Review Pending Clearances</span>
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link to="/tobacco-listings">
                <FileText className="h-4 w-4" />
                <span>View All Listings</span>
              </Link>
            </Button>
          </>
        )}
        
        {user?.user_type === 'admin' && (
          <>
            <Button className="gap-2" asChild>
              <Link to="/admin/company-verification">
                <Users className="h-4 w-4" />
                <span>Manage Companies</span>
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" asChild>
              <Link to="/auction-tracking">
                <BarChart className="h-4 w-4" />
                <span>Platform Analytics</span>
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;