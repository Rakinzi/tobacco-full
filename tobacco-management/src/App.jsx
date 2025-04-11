import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';

// Layout
import Layout from './components/layout/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import AuctionsPage from './pages/AuctionsPage';
import AuctionDetailsPage from './pages/AuctionDetailsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import CompanyRegistrationPage from './pages/CompanyRegistrationPage';
import AdminCompanyVerificationPage from './pages/AdminCompanyVerificationPage';
import TobaccoListingPage from './pages/TobaccoListingPage';
import TimbOfficerPage from './pages/TimbOfficerPage';
import { FullPageLoader } from './components/Loader';
import CreateAuctionPage from './pages/CreateAuctionPage';
// Protected route component
// Move this component inside the AuthProvider context
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
 
  if (isLoading) {
    return <FullPageLoader />;
  }
 
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
 
  return children;
};

// The main Routes component that should be used inside AuthProvider
const AppRoutes = () => {
  return (
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
        <Route path="auctions" element={<AuctionsPage />} />
        <Route path="auctions/:id" element={<AuctionDetailsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="company" element={< CompanyRegistrationPage/>} />
        <Route path="admin/company-verification" element={<AdminCompanyVerificationPage />} />
        <Route path='tobacco-details' element={<TobaccoListingPage />} />
        <Route path='timb-officer' element={<TimbOfficerPage />} />
        <Route path='create-auction' element={<CreateAuctionPage />} />

        
      </Route>
     
      {/* 404 route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;