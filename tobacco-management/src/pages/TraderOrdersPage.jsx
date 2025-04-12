import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
    Calendar,
    DollarSign,
    Users,
    AlertCircle,
    PackageOpen,
    Filter,
    Search,
    Download,
    RefreshCw,
    Eye,
    Truck
} from 'lucide-react';
import orderService from '../services/orderService';
import { formatCurrency, formatDate, formatTobaccoType, formatWeight } from '../utils/formatters';

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

const TraderOrdersPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orders, setOrders] = useState([]);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date_desc');

    // Stats
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0
    });

    useEffect(() => {
        fetchOrders();
    }, [user]);

    const fetchOrders = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await orderService.getAllOrders();

            if (response.data.status === 'success') {
                setOrders(response.data.data);

                // Calculate stats
                const totalRevenue = response.data.data.reduce(
                    (sum, order) => sum + parseFloat(order.amount), 0
                );

                setStats({
                    totalOrders: response.data.data.length,
                    totalRevenue: totalRevenue,
                    averageOrderValue: response.data.data.length > 0
                        ? totalRevenue / response.data.data.length
                        : 0
                });
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch orders');
        } finally {
            setIsLoading(false);
        }
    };

    // Apply filters and sorting to orders
    const getFilteredOrders = () => {
        return orders
            .filter(order => {
                // Filter by search term
                const matchesSearch =
                    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.buyer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    order.auction?.tobacco_listing?.batch_number.toLowerCase().includes(searchTerm.toLowerCase());

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

                // Delivery status filter
                const matchesDeliveryStatus =
                    deliveryStatusFilter === 'all' || order.delivery_status === deliveryStatusFilter;

                return matchesSearch && matchesDate && matchesStatus && matchesDeliveryStatus;
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

    // Export to CSV
    const exportToCSV = () => {
        const filteredData = getFilteredOrders();
        let csvContent = 'Order Number,Buyer,Tobacco Batch,Tobacco Type,Quantity,Amount,Status,Delivery Status,Created Date\n';

        filteredData.forEach(order => {
            csvContent += `"${order.order_number}",`;
            csvContent += `"${order.buyer?.name || 'Unknown'}",`;
            csvContent += `"${order.auction?.tobacco_listing?.batch_number || 'N/A'}",`;
            csvContent += `"${formatTobaccoType(order.auction?.tobacco_listing?.tobacco_type) || 'N/A'}",`;
            csvContent += `"${formatWeight(order.auction?.tobacco_listing?.quantity) || 'N/A'}",`;
            csvContent += `"${order.amount}",`;
            csvContent += `"${order.status}",`;
            csvContent += `"${order.delivery_status}",`;
            csvContent += `"${formatDate(order.created_at, true)}"\n`;
        });

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'trader-orders.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredOrders = getFilteredOrders();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-green-500/50 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-green-500">Loading orders...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Your Sales</h1>
                <p className="text-green-500">
                    Track and manage orders for your tobacco sales
                </p>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-white/50 uppercase">Total Sales</p>
                                <h3 className="text-2xl font-bold text-white">{stats.totalOrders}</h3>
                            </div>
                            <div className="bg-green-500/10 p-2 rounded-full">
                                <PackageOpen className="h-5 w-5 text-green-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs text-white/50 uppercase">Total Revenue</p>
                                <h3 className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</h3>
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
                                <p className="text-xs text-white/50 uppercase">Avg Sale Value</p>
                                <h3 className="text-2xl font-bold text-white">{formatCurrency(stats.averageOrderValue)}</h3>
                            </div>
                            <div className="bg-green-500/10 p-2 rounded-full">
                                <Calendar className="h-5 w-5 text-green-500" />
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
                                placeholder="Search by order number, buyer, batch..."
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
                                            <Users className="h-4 w-4 text-green-500/50" />
                                            <span>Order Status</span>
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

                            <div className="w-full sm:w-1/3">
                                <Select
                                    value={deliveryStatusFilter}
                                    onValueChange={setDeliveryStatusFilter}
                                >
                                    <SelectTrigger>
                                        <div className="flex items-center gap-2">
                                            <Truck className="h-4 w-4 text-green-500/50" />
                                            <span>Delivery Status</span>
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Delivery Status</SelectItem>
                                        <SelectItem value="scheduled">Scheduled</SelectItem>
                                        <SelectItem value="in_transit">In Transit</SelectItem>
                                        <SelectItem value="delivered">Delivered</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button
                            variant="outline"
                            className="md:w-auto whitespace-nowrap"
                            onClick={exportToCSV}
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
                    <CardTitle className="text-xl">Your Sales</CardTitle>
                    <CardDescription>
                        Track and manage orders for your tobacco sales
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <PackageOpen className="h-12 w-12 text-green-500/20 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No Sales Yet</h3>
                            <p className="text-green-500/70 max-w-md mx-auto">
                                You haven't sold any tobacco yet. Create auctions to start selling.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-green-500/20">
                                        <th className="text-left py-3 px-4 text-green-500">Order #</th>
                                        <th className="text-left py-3 px-4 text-green-500">Buyer</th>
                                        <th className="text-left py-3 px-4 text-green-500">Tobacco Batch</th>
                                        <th className="text-left py-3 px-4 text-green-500">Tobacco Type</th>
                                        <th className="text-left py-3 px-4 text-green-500">Quantity</th>
                                        <th className="text-left py-3 px-4 text-green-500">Amount</th>
                                        <th className="text-left py-3 px-4 text-green-500">Status</th>
                                        <th className="text-left py-3 px-4 text-green-500">Delivery</th>
                                        <th className="text-left py-3 px-4 text-green-500">Created</th>
                                        <th className="text-right py-3 px-4 text-green-500">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="border-b border-green-500/10 hover:bg-green-500/5 transition-colors"
                                        >
                                            <td className="py-4 px-4 text-white font-medium">
                                                {order.order_number}
                                            </td>
                                            <td className="py-4 px-4 text-white/70">
                                                {order.buyer?.name || 'Unknown'}
                                            </td>
                                            <td className="py-4 px-4 text-white/70">
                                                {order.auction?.tobacco_listing?.batch_number || 'N/A'}
                                            </td>
                                            <td className="py-4 px-4 text-white/70">
                                                {formatTobaccoType(order.auction?.tobacco_listing?.tobacco_type) || 'N/A'}
                                            </td>
                                            <td className="py-4 px-4 text-white/70">
                                                {formatWeight(order.auction?.tobacco_listing?.quantity) || 'N/A'}
                                            </td>
                                            <td className="py-4 px-4 text-white font-medium">
                                                {formatCurrency(order.amount)}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDeliveryStatusColor(order.delivery_status)}`}>
                                                    {order.delivery_status.replace('_', ' ').charAt(0).toUpperCase() +
                                                        order.delivery_status.replace('_', ' ').slice(1)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-white/70">
                                                {formatDate(order.created_at)}
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                                    onClick={() => navigate(`/orders/${order.id}`)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    <span>View Details</span>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
export default TraderOrdersPage;