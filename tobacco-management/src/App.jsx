import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './contexts/AuthContext';

// Layout
import Layout from './components/layout/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AuctionsPage from './pages/AuctionsPage';
import AuctionDetailsPage from './pages/AuctionDetailsPage';
import CreateAuctionPage from './pages/CreateAuctionPage';
import AuctionTrackingPage from './pages/AuctionTrackingPage';
import CreateOrderPage from './pages/CreateOrderPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import CompanyRegistrationPage from './pages/CompanyRegistrationPage';
import AdminCompanyVerificationPage from './pages/AdminCompanyVerificationPage';
import TobaccoListingPage from './pages/TobaccoListingPage';
import TimbOfficerPage from './pages/TimbOfficerPage';
import TraderOrdersPage from './pages/TraderOrdersPage'; // Add this import
import { FullPageLoader } from './components/Loader';
import { Toaster, toast } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
         
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            
            {/* Auctions */}
            <Route path="auctions" element={<AuctionsPage />} />
            <Route path="auctions/:id" element={<AuctionDetailsPage />} />
            <Route path="create-auction" element={<CreateAuctionPage />} />
            
            {/* Auction Tracking */}
            <Route path="auction-tracking" element={<AuctionTrackingPage />} />
            
            {/* Orders */}
            <Route path="create-order/:id" element={<CreateOrderPage />} />
            <Route path="orders/:id" element={<OrderDetailsPage />} />
            
            {/* Trader Orders */}
            <Route path="trader/orders" element={<TraderOrdersPage />} />
            
            {/* Profile */}
            <Route path="profile" element={<ProfilePage />} />
            
            {/* Company */}
            <Route path="company" element={<CompanyRegistrationPage />} />
            <Route path="admin/company-verification" element={<AdminCompanyVerificationPage />} />
            
            {/* Tobacco Listings */}
            <Route path="tobacco-listings" element={<TobaccoListingPage />} />
            
            {/* TIMB Officer */}
            <Route path="timb-officer" element={<TimbOfficerPage />} />
          </Route>
         
          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

export default App;