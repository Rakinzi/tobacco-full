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
  Users
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: [],
    recentAuctions: [],
    notifications: []
  });

  useEffect(() => {
    // Here you would fetch the dashboard data from your API
    // This is a placeholder for demonstration purposes
    
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Simulating API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock data based on user type
        const stats = generateMockStats(user?.user_type);
        const recentAuctions = generateMockAuctions();
        const notifications = generateMockNotifications();
        
        setDashboardData({
          stats,
          recentAuctions,
          notifications
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  // Generate mock stats based on user type
  const generateMockStats = (userType) => {
    switch (userType) {
      case 'trader':
        return [
          { id: 1, title: 'Active Listings', value: '12', icon: <Package className="h-5 w-5 text-emerald-500" />, trend: '+2.5%', color: 'emerald' },
          { id: 2, title: 'Pending Orders', value: '4', icon: <ShoppingBag className="h-5 w-5 text-blue-500" />, trend: '+12%', color: 'blue' },
          { id: 3, title: 'Monthly Revenue', value: '$8,532', icon: <DollarSign className="h-5 w-5 text-purple-500" />, trend: '+18.2%', color: 'purple' },
          { id: 4, title: 'Auction Win Rate', value: '62%', icon: <TrendingUp className="h-5 w-5 text-amber-500" />, trend: '-3.1%', color: 'amber' },
        ];
      case 'buyer':
        return [
          { id: 1, title: 'Active Bids', value: '7', icon: <Activity className="h-5 w-5 text-emerald-500" />, trend: '+4.3%', color: 'emerald' },
          { id: 2, title: 'Purchased Items', value: '23', icon: <ShoppingBag className="h-5 w-5 text-blue-500" />, trend: '+8.1%', color: 'blue' },
          { id: 3, title: 'Total Spent', value: '$12,845', icon: <DollarSign className="h-5 w-5 text-purple-500" />, trend: '+5.4%', color: 'purple' },
          { id: 4, title: 'Upcoming Deliveries', value: '3', icon: <Calendar className="h-5 w-5 text-amber-500" />, trend: '0%', color: 'amber' },
        ];
      case 'timb_officer':
        return [
          { id: 1, title: 'Pending Clearances', value: '18', icon: <AlertTriangle className="h-5 w-5 text-amber-500" />, trend: '+3', color: 'amber' },
          { id: 2, title: 'Approved Today', value: '7', icon: <Activity className="h-5 w-5 text-emerald-500" />, trend: '+2', color: 'emerald' },
          { id: 3, title: 'Total Tobacco Volume', value: '24.5 tons', icon: <Package className="h-5 w-5 text-blue-500" />, trend: '+12.3%', color: 'blue' },
          { id: 4, title: 'Average Clearance Time', value: '1.8 days', icon: <Clock className="h-5 w-5 text-purple-500" />, trend: '-8%', color: 'purple' },
        ];
      case 'admin':
        return [
          { id: 1, title: 'Active Users', value: '238', icon: <Activity className="h-5 w-5 text-emerald-500" />, trend: '+12', color: 'emerald' },
          { id: 2, title: 'Platform Revenue', value: '$24,532', icon: <DollarSign className="h-5 w-5 text-blue-500" />, trend: '+15.2%', color: 'blue' },
          { id: 3, title: 'Active Auctions', value: '42', icon: <Package className="h-5 w-5 text-purple-500" />, trend: '+8', color: 'purple' },
          { id: 4, title: 'Daily Transactions', value: '156', icon: <BarChart className="h-5 w-5 text-amber-500" />, trend: '+23.5%', color: 'amber' },
        ];
      default:
        return [];
    }
  };

  // Generate mock auctions
  const generateMockAuctions = () => {
    return [
      { 
        id: 1, 
        title: 'Premium Flue-Cured Virginia Tobacco', 
        current_price: 350.00, 
        bids: 8, 
        ends_at: '2025-03-15 18:00:00',
        status: 'active' 
      },
      { 
        id: 2, 
        title: 'Organic Burley Tobacco Batch #FB284', 
        current_price: 280.50, 
        bids: 5, 
        ends_at: '2025-03-16 14:30:00',
        status: 'active' 
      },
      { 
        id: 3, 
        title: 'Dark Fired Kentucky Tobacco', 
        current_price: 420.75, 
        bids: 12, 
        ends_at: '2025-03-14 09:45:00',
        status: 'ending_soon' 
      },
      { 
        id: 4, 
        title: 'Premium Oriental Tobacco', 
        current_price: 385.25, 
        bids: 7, 
        ends_at: '2025-03-14 21:15:00',
        status: 'active' 
      },
    ];
  };

  // Generate mock notifications
  const generateMockNotifications = () => {
    return [
      { 
        id: 1, 
        title: 'New bid placed', 
        message: 'A new bid of $355.00 has been placed on your "Premium Flue-Cured Virginia" auction.',
        time: '15 minutes ago',
        read: false,
        type: 'bid' 
      },
      { 
        id: 2, 
        title: 'Auction ended', 
        message: 'Your auction for "Burley Tobacco Batch #FB124" has ended with a winning bid of $298.50.',
        time: '2 hours ago',
        read: true,
        type: 'auction' 
      },
      { 
        id: 3, 
        title: 'Order status update', 
        message: 'Your order #ORD-2023-000123 has been shipped and is on its way.',
        time: '1 day ago',
        read: true,
        type: 'order' 
      },
      { 
        id: 4, 
        title: 'New message', 
        message: 'You have a new message from support regarding your recent query.',
        time: '2 days ago',
        read: true,
        type: 'message' 
      },
    ];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </div>
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
                <span className="text-xs text-muted-foreground ml-1">
                  from last month
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
            <CardTitle>Recent Auctions</CardTitle>
            <CardDescription>
              Browse and manage recent tobacco auctions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentAuctions.map((auction) => (
                <div key={auction.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition duration-150">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      auction.status === 'ending_soon' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}></div>
                    <div>
                      <h4 className="text-sm font-medium">{auction.title}</h4>
                      <div className="text-xs text-muted-foreground mt-1">
                        <span className="font-medium text-primary">
                          ${auction.current_price.toFixed(2)}
                        </span>
                        {' '} · {auction.bids} bids · Ends {new Date(auction.ends_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <Link to={`/auctions/${auction.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </div>
              ))}
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
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>
              Stay updated with your latest activities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.notifications.map((notification) => (
                <div key={notification.id} className={`p-3 rounded-lg border ${
                  notification.read ? 'border-border' : 'border-primary/50 bg-primary/5'
                }`}>
                  <h4 className="text-sm font-medium flex items-center">
                    {!notification.read && <span className="w-2 h-2 rounded-full bg-primary mr-2"></span>}
                    {notification.title}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notification.message}
                  </p>
                  <div className="text-xs text-muted-foreground mt-2">
                    {notification.time}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="pt-3 border-t">
            <Button variant="outline" className="w-full">
              View All Notifications
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Action buttons for specific user types */}
      <div className="flex flex-wrap gap-4">
        {user?.user_type === 'trader' && (
          <>
            <Button className="gap-2">
              <Package className="h-4 w-4" />
              <span>Create New Listing</span>
            </Button>
            <Button variant="outline" className="gap-2">
              <BarChart className="h-4 w-4" />
              <span>View Sales Reports</span>
            </Button>
          </>
        )}
        
        {user?.user_type === 'buyer' && (
          <>
            <Button className="gap-2">
              <Package className="h-4 w-4" />
              <span>Browse Auctions</span>
            </Button>
            <Button variant="outline" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span>View My Orders</span>
            </Button>
          </>
        )}
        
        {user?.user_type === 'timb_officer' && (
          <>
            <Button className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Review Pending Clearances</span>
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              <span>Generate Reports</span>
            </Button>
          </>
        )}
        
        {user?.user_type === 'admin' && (
          <>
            <Button className="gap-2">
              <Users className="h-4 w-4" />
              <span>Manage Users</span>
            </Button>
            <Button variant="outline" className="gap-2">
              <BarChart className="h-4 w-4" />
              <span>Platform Analytics</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;