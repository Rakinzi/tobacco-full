import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import {
  BarChart,
  TrendingUp,
  Calendar,
  RefreshCw,
  Clock,
  Filter,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Search,
  AlertCircle,
  CheckCircle2,
  Eye,
  ArrowRight,
  Download
} from 'lucide-react';
import auctionService from '../services/auctionService';
import orderService from '../services/orderService';
import { formatCurrency, formatDate, formatTobaccoType, formatWeight } from '../utils/formatters';

// Function to get color based on status
const getStatusColor = (status) => {
  switch (status) {
    case 'active':
      return 'text-green-500 bg-green-500/10';
    case 'ended':
      return 'text-blue-500 bg-blue-500/10';
    case 'cancelled':
      return 'text-red-500 bg-red-500/10';
    case 'pending':
      return 'text-yellow-500 bg-yellow-500/10';
    default:
      return 'text-gray-500 bg-gray-500/10';
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
      return 'text-yellow-500 bg-yellow-500/10';
    default:
      return 'text-gray-500 bg-gray-500/10';
  }
};

const AuctionTrackingPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('won_auctions');
  const [auctionsWithOrders, setAuctionsWithOrders] = useState({});

  // Data states
  const [wonAuctions, setWonAuctions] = useState([]);
  const [myAuctions, setMyAuctions] = useState([]);
  const [orders, setOrders] = useState([]);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  // Stats
  const [stats, setStats] = useState({
    totalWon: 0,
    totalSold: 0,
    totalValue: 0,
    averagePrice: 0
  });

  useEffect(() => {
    // Initial data load based on active tab
    fetchData();
  }, [activeTab, user]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Different data based on tab and user type
      if (activeTab === 'won_auctions' && user.user_type === 'buyer') {
        await fetchWonAuctions();
      } else if (activeTab === 'my_sales' && user.user_type === 'trader') {
        await fetchMySales();
      } else if (activeTab === 'orders') {
        await fetchOrders();
      } else if (activeTab === 'analytics') {
        await fetchAnalytics();
      }
    } catch (err) {
      console.error(`Error fetching ${activeTab} data:`, err);
      setError(err.response?.data?.message || err.message || `Failed to fetch ${activeTab} data`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch auctions won by the current buyer
  const fetchWonAuctions = async () => {
    try {
      const response = await auctionService.getWonAuctions();

      if (response.data.status === 'success') {
        const wonAuctions = response.data.data;
        setWonAuctions(wonAuctions);

        // After loading won auctions, check which ones have orders
        checkExistingOrders(wonAuctions.map(auction => auction.id));

        // Calculate stats
        const totalValue = wonAuctions.reduce((sum, auction) =>
          sum + parseFloat(auction.current_price), 0);

        setStats({
          totalWon: wonAuctions.length,
          totalValue: totalValue,
          averagePrice: wonAuctions.length > 0 ? totalValue / wonAuctions.length : 0
        });
      }
    } catch (err) {
      console.error('Error fetching won auctions:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch won auctions');
    }
  };

  const checkExistingOrders = async (auctionIds) => {
    if (!auctionIds.length) return;

    try {
      const response = await orderService.checkAuctionOrders(auctionIds);
      if (response.data.status === 'success') {
        setAuctionsWithOrders(response.data.data);
      }
    } catch (err) {
      console.error('Error checking existing orders:', err);
    }
  };

  // Fetch auctions sold by the current trader
  const fetchMySales = async () => {
    const response = await auctionService.getAllAuctions();

    if (response.data.status === 'success') {
      const auctions = response.data.data;
      const sold = auctions.filter(auction =>
        auction.user_id === user.id && auction.status === 'ended' && auction.winner_id
      );

      setMyAuctions(sold);

      // Calculate stats
      const totalValue = sold.reduce((sum, auction) => sum + parseFloat(auction.current_price), 0);

      setStats({
        totalSold: sold.length,
        totalValue: totalValue,
        averagePrice: sold.length > 0 ? totalValue / sold.length : 0
      });
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    const response = await orderService.getAllOrders();

    if (response.data.status === 'success') {
      setOrders(response.data.data);

      // Calculate stats
      const totalValue = response.data.data.reduce(
        (sum, order) => sum + parseFloat(order.amount), 0
      );

      setStats({
        totalOrders: response.data.data.length,
        totalValue: totalValue,
        averageOrderValue: response.data.data.length > 0
          ? totalValue / response.data.data.length
          : 0
      });
    }
  };

  // Fetch analytics data
  const fetchAnalytics = async () => {
    // In a real app, this would fetch aggregated data from the backend
    // For now, we'll use the data we already have
    await Promise.all([
      user.user_type === 'buyer' ? fetchWonAuctions() : null,
      user.user_type === 'trader' ? fetchMySales() : null,
      fetchOrders()
    ]);
  };

  // Apply filters and sorting to won auctions
  const getFilteredWonAuctions = () => {
    return wonAuctions
      .filter(auction => {
        // Search filter
        const matchesSearch =
          auction.tobacco_listing.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          auction.tobacco_listing.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
          auction.tobacco_listing.description?.toLowerCase().includes(searchTerm.toLowerCase());

        // Date filter
        let matchesDate = true;
        const auctionDate = new Date(auction.end_time);
        const now = new Date();

        if (dateFilter === 'last_7_days') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          matchesDate = auctionDate >= sevenDaysAgo;
        } else if (dateFilter === 'last_30_days') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          matchesDate = auctionDate >= thirtyDaysAgo;
        } else if (dateFilter === 'last_90_days') {
          const ninetyDaysAgo = new Date();
          ninetyDaysAgo.setDate(now.getDate() - 90);
          matchesDate = auctionDate >= ninetyDaysAgo;
        }

        // Status filter - not applicable for won auctions, as they're all ended

        return matchesSearch && matchesDate;
      })
      .sort((a, b) => {
        // Sorting
        switch (sortBy) {
          case 'price_asc':
            return parseFloat(a.current_price) - parseFloat(b.current_price);
          case 'price_desc':
            return parseFloat(b.current_price) - parseFloat(a.current_price);
          case 'date_asc':
            return new Date(a.end_time) - new Date(b.end_time);
          case 'date_desc':
          default:
            return new Date(b.end_time) - new Date(a.end_time);
        }
      });
  };

  // Apply filters and sorting to my sales
  const getFilteredMySales = () => {
    return myAuctions
      .filter(auction => {
        // Search filter
        const matchesSearch =
          auction.tobacco_listing.batch_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          auction.tobacco_listing.grade.toLowerCase().includes(searchTerm.toLowerCase()) ||
          auction.tobacco_listing.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          auction.winner?.name.toLowerCase().includes(searchTerm.toLowerCase());

        // Date filter
        let matchesDate = true;
        const auctionDate = new Date(auction.end_time);
        const now = new Date();

        if (dateFilter === 'last_7_days') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          matchesDate = auctionDate >= sevenDaysAgo;
        } else if (dateFilter === 'last_30_days') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          matchesDate = auctionDate >= thirtyDaysAgo;
        } else if (dateFilter === 'last_90_days') {
          const ninetyDaysAgo = new Date();
          ninetyDaysAgo.setDate(now.getDate() - 90);
          matchesDate = auctionDate >= ninetyDaysAgo;
        }

        return matchesSearch && matchesDate;
      })
      .sort((a, b) => {
        // Sorting
        switch (sortBy) {
          case 'price_asc':
            return parseFloat(a.current_price) - parseFloat(b.current_price);
          case 'price_desc':
            return parseFloat(b.current_price) - parseFloat(a.current_price);
          case 'date_asc':
            return new Date(a.end_time) - new Date(b.end_time);
          case 'date_desc':
          default:
            return new Date(b.end_time) - new Date(a.end_time);
        }
      });
  };

  // Apply filters and sorting to orders
  const getFilteredOrders = () => {
    return orders
      .filter(order => {
        // Search filter
        const matchesSearch =
          order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.buyer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.seller?.name.toLowerCase().includes(searchTerm.toLowerCase());

        // Date filter
        let matchesDate = true;
        const orderDate = new Date(order.created_at);
        const now = new Date();

        if (dateFilter === 'last_7_days') {
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(now.getDate() - 7);
          matchesDate = orderDate >= sevenDaysAgo;
        } else if (dateFilter === 'last_30_days') {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          matchesDate = orderDate >= thirtyDaysAgo;
        } else if (dateFilter === 'last_90_days') {
          const ninetyDaysAgo = new Date();
          ninetyDaysAgo.setDate(now.getDate() - 90);
          matchesDate = orderDate >= ninetyDaysAgo;
        }

        // Status filter
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        return matchesSearch && matchesDate && matchesStatus;
      })
      .sort((a, b) => {
        // Sorting
        switch (sortBy) {
          case 'price_asc':
            return parseFloat(a.amount) - parseFloat(b.amount);
          case 'price_desc':
            return parseFloat(b.amount) - parseFloat(a.amount);
          case 'date_asc':
            return new Date(a.created_at) - new Date(b.created_at);
          case 'date_desc':
          default:
            return new Date(b.created_at) - new Date(a.created_at);
        }
      });
  };

  const filteredWonAuctions = getFilteredWonAuctions();
  const filteredMySales = getFilteredMySales();
  const filteredOrders = getFilteredOrders();

  // Export data to CSV
  const exportToCSV = (data, filename) => {
    let csvContent = '';

    // Different headers and row data depending on what we're exporting
    if (filename.includes('won-auctions')) {
      // Headers for won auctions
      csvContent = 'Batch Number,Tobacco Type,Grade,Quantity,Final Price,Auction End Date\n';

      // Row data
      data.forEach(auction => {
        csvContent += `"${auction.tobacco_listing.batch_number}",`;
        csvContent += `"${formatTobaccoType(auction.tobacco_listing.tobacco_type)}",`;
        csvContent += `"${auction.tobacco_listing.grade}",`;
        csvContent += `"${auction.tobacco_listing.quantity}",`;
        csvContent += `"${auction.current_price}",`;
        csvContent += `"${formatDate(auction.end_time, true)}"\n`;
      });
    } else if (filename.includes('my-sales')) {
      // Headers for my sales
      csvContent = 'Batch Number,Tobacco Type,Buyer,Final Price,Auction End Date\n';

      // Row data
      data.forEach(auction => {
        csvContent += `"${auction.tobacco_listing.batch_number}",`;
        csvContent += `"${formatTobaccoType(auction.tobacco_listing.tobacco_type)}",`;
        csvContent += `"${auction.winner?.name || 'Unknown'}",`;
        csvContent += `"${auction.current_price}",`;
        csvContent += `"${formatDate(auction.end_time, true)}"\n`;
      });
    } else if (filename.includes('orders')) {
      // Headers for orders
      csvContent = 'Order Number,Buyer,Seller,Amount,Status,Delivery Status,Created Date\n';

      // Row data
      data.forEach(order => {
        csvContent += `"${order.order_number}",`;
        csvContent += `"${order.buyer?.name || 'Unknown'}",`;
        csvContent += `"${order.seller?.name || 'Unknown'}",`;
        csvContent += `"${order.amount}",`;
        csvContent += `"${order.status}",`;
        csvContent += `"${order.delivery_status}",`;
        csvContent += `"${formatDate(order.created_at, true)}"\n`;
      });
    }

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-green-500/50 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-green-500">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Auction Tracking</h1>
        <p className="text-green-500">
          Track auction results, sales, and orders
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex justify-between items-center">
          <TabsList>
            {user.user_type === 'buyer' && (
              <TabsTrigger value="won_auctions" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>Won Auctions</span>
              </TabsTrigger>
            )}

            {user.user_type === 'trader' && (
              <TabsTrigger value="my_sales" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>My Sales</span>
              </TabsTrigger>
            )}

            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Orders</span>
            </TabsTrigger>

            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => fetchData()}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Won Auctions Tab */}
        <TabsContent value="won_auctions" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-white/50 uppercase">Total Won</p>
                    <h3 className="text-2xl font-bold text-white">{stats.totalWon}</h3>
                  </div>
                  <div className="bg-green-500/10 p-2 rounded-full">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-white/50 uppercase">Total Value</p>
                    <h3 className="text-2xl font-bold text-white">{formatCurrency(stats.totalValue)}</h3>
                  </div>
                  <div className="bg-green-500/10 p-2 rounded-full">
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-white/50 uppercase">Average Price</p>
                    <h3 className="text-2xl font-bold text-white">{formatCurrency(stats.averagePrice)}</h3>
                  </div>
                  <div className="bg-green-500/10 p-2 rounded-full">
                    <BarChart className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
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
                      value={dateFilter}
                      onValueChange={setDateFilter}
                    >
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-500/50" />
                          <span>Date Range</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                        <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                        <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full sm:w-1/3">
                    <Select
                      value={sortBy}
                      onValueChange={setSortBy}
                    >
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4 text-green-500/50" />
                          <span>Sort By</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date_desc">Newest First</SelectItem>
                        <SelectItem value="date_asc">Oldest First</SelectItem>
                        <SelectItem value="price_desc">Price (High to Low)</SelectItem>
                        <SelectItem value="price_asc">Price (Low to High)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="md:w-auto whitespace-nowrap"
                  onClick={() => exportToCSV(filteredWonAuctions, 'won-auctions.csv')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Auctions Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Won Auctions</CardTitle>
              <CardDescription>
                Auctions you have won
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredWonAuctions.length === 0 ? (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-green-500/20 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Won Auctions</h3>
                  <p className="text-green-500/70 max-w-md mx-auto">
                    You haven't won any auctions yet. Start bidding to see your won auctions here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-green-500/20">
                        <th className="text-left py-3 px-4 text-green-500">Batch Number</th>
                        <th className="text-left py-3 px-4 text-green-500">Type</th>
                        <th className="text-left py-3 px-4 text-green-500">Grade</th>
                        <th className="text-left py-3 px-4 text-green-500">Quantity</th>
                        <th className="text-left py-3 px-4 text-green-500">Final Price</th>
                        <th className="text-left py-3 px-4 text-green-500">Auction Ended</th>
                        <th className="text-right py-3 px-4 text-green-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWonAuctions.map((auction) => (
                        <tr key={auction.id} className="border-b border-green-500/10 hover:bg-green-500/5">
                          <td className="py-4 px-4 text-white font-medium">
                            {auction.tobacco_listing.batch_number}
                          </td>
                          <td className="py-4 px-4 text-white/70">
                            {formatTobaccoType(auction.tobacco_listing.tobacco_type)}
                          </td>
                          <td className="py-4 px-4 text-white/70">
                            {auction.tobacco_listing.grade}
                          </td>
                          <td className="py-4 px-4 text-white/70">
                            {formatWeight(auction.tobacco_listing.quantity)}
                          </td>
                          <td className="py-4 px-4 text-white font-medium">
                            {formatCurrency(auction.current_price)}
                          </td>
                          <td className="py-4 px-4 text-white/70">
                            {formatDate(auction.end_time)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                onClick={() => window.location.href = `/auctions/${auction.id}`}
                              >
                                <Eye className="h-4 w-4" />
                                <span>View</span>
                              </Button>

                              {auctionsWithOrders[auction.id] ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                  onClick={() => window.location.href = `/orders/${auctionsWithOrders[auction.id]}`}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>View Order</span>
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                  onClick={() => window.location.href = `/create-order/${auction.id}`}
                                >
                                  <ArrowRight className="h-4 w-4" />
                                  <span>Order</span>
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Sales Tab */}
        <TabsContent value="my_sales" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-white/50 uppercase">Total Sold</p>
                    <h3 className="text-2xl font-bold text-white">{stats.totalSold}</h3>
                  </div>
                  <div className="bg-green-500/10 p-2 rounded-full">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-white/50 uppercase">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-white">{formatCurrency(stats.totalValue)}</h3>
                  </div>
                  <div className="bg-green-500/10 p-2 rounded-full">
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-white/50 uppercase">Average Sale</p>
                    <h3 className="text-2xl font-bold text-white">{formatCurrency(stats.averagePrice)}
                    </h3>
                  </div>
                  <div className="bg-green-500/10 p-2 rounded-full">
                    <BarChart className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative w-full md:w-1/3">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500/50" />
                  <Input
                    placeholder="Search by batch number, buyer..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex flex-1 flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-1/3">
                    <Select
                      value={dateFilter}
                      onValueChange={setDateFilter}
                    >
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-500/50" />
                          <span>Date Range</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                        <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                        <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full sm:w-1/3">
                    <Select
                      value={sortBy}
                      onValueChange={setSortBy}
                    >
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4 text-green-500/50" />
                          <span>Sort By</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="date_desc">Newest First</SelectItem>
                        <SelectItem value="date_asc">Oldest First</SelectItem>
                        <SelectItem value="price_desc">Price (High to Low)</SelectItem>
                        <SelectItem value="price_asc">Price (Low to High)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="md:w-auto whitespace-nowrap"
                  onClick={() => exportToCSV(filteredMySales, 'my-sales.csv')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sales Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">My Sales</CardTitle>
              <CardDescription>
                Tobacco auctions you've sold
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredMySales.length === 0 ? (
                <div className="text-center py-12">
                  <DollarSign className="h-12 w-12 text-green-500/20 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Sales Yet</h3>
                  <p className="text-green-500/70 max-w-md mx-auto">
                    None of your auctions have been completed with a winning bid yet.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-green-500/20">
                        <th className="text-left py-3 px-4 text-green-500">Batch Number</th>
                        <th className="text-left py-3 px-4 text-green-500">Type</th>
                        <th className="text-left py-3 px-4 text-green-500">Grade</th>
                        <th className="text-left py-3 px-4 text-green-500">Buyer</th>
                        <th className="text-left py-3 px-4 text-green-500">Final Price</th>
                        <th className="text-left py-3 px-4 text-green-500">Auction Ended</th>
                        <th className="text-right py-3 px-4 text-green-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMySales.map((auction) => (
                        <tr key={auction.id} className="border-b border-green-500/10 hover:bg-green-500/5">
                          <td className="py-4 px-4 text-white font-medium">
                            {auction.tobacco_listing.batch_number}
                          </td>
                          <td className="py-4 px-4 text-white/70">
                            {formatTobaccoType(auction.tobacco_listing.tobacco_type)}
                          </td>
                          <td className="py-4 px-4 text-white/70">
                            {auction.tobacco_listing.grade}
                          </td>
                          <td className="py-4 px-4 text-white/70">
                            {auction.winner?.name || 'Unknown'}
                          </td>
                          <td className="py-4 px-4 text-white font-medium">
                            {formatCurrency(auction.current_price)}
                          </td>
                          <td className="py-4 px-4 text-white/70">
                            {formatDate(auction.end_time)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                onClick={() => window.location.href = `/auctions/${auction.id}`}
                              >
                                <Eye className="h-4 w-4" />
                                <span>View</span>
                              </Button>

                              {auctionsWithOrders[auction.id] ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                  onClick={() => window.location.href = `/orders/${auctionsWithOrders[auction.id]}`}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>View Order</span>
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-1 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                                  onClick={() => window.location.href = `/create-order/${auction.id}`}
                                >
                                  <ArrowRight className="h-4 w-4" />
                                  <span>Order</span>
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-white/50 uppercase">Total Orders</p>
                    <h3 className="text-2xl font-bold text-white">{stats.totalOrders || 0}</h3>
                  </div>
                  <div className="bg-green-500/10 p-2 rounded-full">
                    <Calendar className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-white/50 uppercase">Total Value</p>
                    <h3 className="text-2xl font-bold text-white">{formatCurrency(stats.totalValue)}</h3>
                  </div>
                  <div className="bg-green-500/10 p-2 rounded-full">
                    <DollarSign className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-white/50 uppercase">Avg Order Value</p>
                    <h3 className="text-2xl font-bold text-white">{formatCurrency(stats.averageOrderValue || 0)}</h3>
                  </div>
                  <div className="bg-green-500/10 p-2 rounded-full">
                    <BarChart className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative w-full md:w-1/3">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500/50" />
                  <Input
                    placeholder="Search by order number, buyer, seller..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="flex flex-1 flex-col sm:flex-row gap-4">
                  <div className="w-full sm:w-1/3">
                    <Select
                      value={dateFilter}
                      onValueChange={setDateFilter}
                    >
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-500/50" />
                          <span>Date Range</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="last_7_days">Last 7 Days</SelectItem>
                        <SelectItem value="last_30_days">Last 30 Days</SelectItem>
                        <SelectItem value="last_90_days">Last 90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="w-full sm:w-1/3">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <div className="flex items-center gap-2">
                          <Filter className="h-4 w-4 text-green-500/50" />
                          <span>Status</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="md:w-auto whitespace-nowrap"
                  onClick={() => exportToCSV(filteredOrders, 'orders.csv')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Orders Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Orders</CardTitle>
              <CardDescription>
                {user.user_type === 'buyer' ? 'Orders you have placed' :
                  user.user_type === 'trader' ? 'Orders for your tobacco' : 'All orders'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-green-500/20 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Orders Found</h3>
                  <p className="text-green-500/70 max-w-md mx-auto">
                    {user.user_type === 'buyer'
                      ? 'You haven\'t placed any orders yet. Win auctions to place orders.'
                      : 'No orders have been placed for your tobacco yet.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-green-500/20">
                        <th className="text-left py-3 px-4 text-green-500">Order #</th>
                        <th className="text-left py-3 px-4 text-green-500">Buyer</th>
                        <th className="text-left py-3 px-4 text-green-500">Seller</th>
                        <th className="text-left py-3 px-4 text-green-500">Amount</th>
                        <th className="text-left py-3 px-4 text-green-500">Status</th>
                        <th className="text-left py-3 px-4 text-green-500">Delivery Status</th>
                        <th className="text-left py-3 px-4 text-green-500">Created</th>
                        <th className="text-right py-3 px-4 text-green-500">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="border-b border-green-500/10 hover:bg-green-500/5">
                          <td className="py-4 px-4 text-white font-medium">
                            {order.order_number}
                          </td>
                          <td className="py-4 px-4 text-white/70">
                            {order.buyer?.name || 'Unknown'}
                          </td>
                          <td className="py-4 px-4 text-white/70">
                            {order.seller?.name || 'Unknown'}
                          </td>
                          <td className="py-4 px-4 text-white font-medium">
                            {formatCurrency(order.amount)}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                              {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDeliveryStatusColor(order.delivery_status)}`}>
                              {order.delivery_status?.replace('_', ' ').charAt(0).toUpperCase()
                                + order.delivery_status?.replace('_', ' ').slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-white/70">
                            {formatDate(order.created_at)}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                onClick={() => window.location.href = `/orders/${order.id}`}
                              >
                                <Eye className="h-4 w-4" />
                                <span>View</span>
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Analytics</CardTitle>
              <CardDescription>
                Visual overview of your auction and sales data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-zinc-950/60 p-8 rounded-lg text-center">
                <BarChart className="h-24 w-24 text-green-500/20 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Analytics Coming Soon</h3>
                <p className="text-green-500/70 max-w-md mx-auto mb-4">
                  We're working on adding detailed analytics and visualizations for your tobacco trading data.
                </p>
                <Button className="mx-auto">
                  View Basic Reports
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Summary for Buyer */}
            {user.user_type === 'buyer' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Purchasing Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 divide-y divide-green-500/10">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-white/70">Total Auctions Won</span>
                      <span className="text-white font-medium">{stats.totalWon}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-white/70">Total Orders Placed</span>
                      <span className="text-white font-medium">{stats.totalOrders || 0}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-white/70">Total Amount Spent</span>
                      <span className="text-white font-medium">{formatCurrency(stats.totalValue)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-white/70">Average Purchase Price</span>
                      <span className="text-white font-medium">{formatCurrency(stats.averagePrice)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Summary for Trader */}
            {user.user_type === 'trader' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Sales Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 divide-y divide-green-500/10">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-white/70">Total Auctions Sold</span>
                      <span className="text-white font-medium">{stats.totalSold}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-white/70">Total Revenue</span>
                      <span className="text-white font-medium">{formatCurrency(stats.totalValue)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-white/70">Average Sale Price</span>
                      <span className="text-white font-medium">{formatCurrency(stats.averagePrice)}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-white/70">Completed Orders</span>
                      <span className="text-white font-medium">
                        {filteredOrders.filter(order => order.status === 'completed').length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 && wonAuctions.length === 0 && myAuctions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-white/70">No recent activity to display</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Recent orders */}
                    {orders.slice(0, 3).map(order => (
                      <div key={order.id} className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            Order {order.order_number} {user.user_type === 'buyer' ? 'placed' : 'received'}
                          </p>
                          <p className="text-white/70 text-sm mt-1">
                            {formatCurrency(order.amount)} - {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Recent won auctions */}
                    {wonAuctions.slice(0, 2).map(auction => (
                      <div key={auction.id} className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            Won auction for {auction.tobacco_listing.batch_number}
                          </p>
                          <p className="text-white/70 text-sm mt-1">
                            {formatCurrency(auction.current_price)} - {formatDate(auction.end_time)}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Recent sold auctions */}
                    {myAuctions.slice(0, 2).map(auction => (
                      <div key={auction.id} className="flex items-start gap-3">
                        <div className="mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                        </div>
                        <div className="flex-1">
                          <p className="text-white font-medium">
                            Sold {auction.tobacco_listing.batch_number} to {auction.winner?.name}
                          </p>
                          <p className="text-white/70 text-sm mt-1">
                            {formatCurrency(auction.current_price)} - {formatDate(auction.end_time)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuctionTrackingPage;