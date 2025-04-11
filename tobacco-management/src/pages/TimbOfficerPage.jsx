import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  CheckCircle2, 
  AlertCircle, 
  Leaf, 
  RefreshCw, 
  FileCheck, 
  Eye,
  Filter
} from 'lucide-react';
import apiClient from '../services/api-client';
import { formatTobaccoType, formatCurrency, formatWeight, getStatusStyles, getStorageImageUrl } from '../utils/formatters';

const TimbOfficerPage = () => {
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchTobaccoListings();
  }, [user]);

  const fetchTobaccoListings = async () => {
    setIsFetching(true);
    setError(null);

    try {
      // Use the TIMB officer endpoint
      const response = await apiClient.get('/tobacco_listings/timb');      
      if (response.data && response.data.data) {
        setListings(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching tobacco listings:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch tobacco listings');
    } finally {
      setIsFetching(false);
    }
  };

  const handleApproval = async (listingId) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await apiClient.post(`/tobacco_listings/${listingId}/timb_clearance`);
      
      if (response.data.status === 'success') {
        setSuccessMessage(`Tobacco listing #${listingId} has been approved successfully`);
        
        // Refresh the listings
        fetchTobaccoListings();
        
        // Close the details view if it's open
        if (selectedListing && selectedListing.id === listingId) {
          setSelectedListing(null);
        }
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      }
    } catch (err) {
      console.error('Error approving tobacco listing:', err);
      setError(err.response?.data?.message || err.message || 'Failed to approve tobacco listing');
    } finally {
      setIsLoading(false);
    }
  };

  const openImagePreview = (imagePath) => {
    const fullImageUrl = getStorageImageUrl(imagePath);
    setSelectedImage(fullImageUrl);
  };

  const closeImagePreview = () => {
    setSelectedImage(null);
  };

  const handleViewDetails = (listing) => {
    setSelectedListing(listing);
  };

  const closeDetails = () => {
    setSelectedListing(null);
  };

  // Filter listings based on active tab
  const filteredListings = listings.filter(listing => {
    if (activeTab === 'pending') return listing.status === 'pending';
    if (activeTab === 'approved') return listing.status === 'approved';
    return true; // 'all' tab
  });

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
    <div className="container max-w-5xl mx-auto py-8 px-4">
      {/* Image preview modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={closeImagePreview}
        >
          <div className="relative max-w-2xl max-h-[80vh]">
            <img 
              src={selectedImage} 
              alt="Tobacco Preview" 
              className="max-h-[80vh] max-w-full object-contain"
            />
            <button 
              onClick={closeImagePreview}
              className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
            >
              <Eye className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <FileCheck className="h-8 w-8 text-green-500" />
        <div>
          <h1 className="text-3xl font-bold text-white">TIMB Officer Dashboard</h1>
          <p className="text-green-500">
            Review and approve tobacco listings
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" className="mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Tobacco Listings</CardTitle>
              <CardDescription>Manage tobacco listings</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="pending" className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    <span>Pending</span>
                  </TabsTrigger>
                  <TabsTrigger value="approved" className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Approved</span>
                  </TabsTrigger>
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>All</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="mt-4 space-y-2">
                {filteredListings.length === 0 ? (
                  <p className="text-white/70 text-center py-4">No {activeTab} listings found</p>
                ) : (
                  filteredListings.map(listing => (
                    <div 
                      key={listing.id} 
                      className={`p-3 rounded-lg border border-green-500/20 cursor-pointer transition-colors ${
                        selectedListing?.id === listing.id 
                          ? 'bg-green-500/20 border-green-500/40' 
                          : 'hover:bg-green-500/10'
                      }`}
                      onClick={() => handleViewDetails(listing)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-white">{listing.batch_number}</h4>
                        <div className={`${getStatusStyles(listing.status).bgColor} ${getStatusStyles(listing.status).textColor} text-xs px-2 py-1 rounded-full capitalize`}>
                          {listing.status}
                        </div>
                      </div>
                      
                      <div className="text-sm text-white/70">
                        <p>{formatTobaccoType(listing.tobacco_type)} - Grade {listing.grade}</p>
                        <p>{listing.company_profile?.company_name || 'Unknown Company'}</p>
                        <div className="flex justify-between mt-2">
                          <span>{formatWeight(listing.quantity)}</span>
                          <span>{formatCurrency(listing.minimum_price)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          {selectedListing ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Listing Details</CardTitle>
                  <CardDescription>Batch: {selectedListing.batch_number}</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={closeDetails}>
                  Close
                </Button>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Tobacco Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/70">Type:</span>
                        <span className="text-white font-medium">{formatTobaccoType(selectedListing.tobacco_type)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Grade:</span>
                        <span className="text-white font-medium">{selectedListing.grade}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Quantity:</span>
                        <span className="text-white font-medium">{formatWeight(selectedListing.quantity)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Minimum Price:</span>
                        <span className="text-white font-medium">{formatCurrency(selectedListing.minimum_price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Region Grown:</span>
                        <span className="text-white font-medium">{selectedListing.region_grown}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Season:</span>
                        <span className="text-white font-medium">{selectedListing.season_grown}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Created:</span>
                        <span className="text-white font-medium">{new Date(selectedListing.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Company Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-white/70">Company:</span>
                        <span className="text-white font-medium">{selectedListing.company_profile?.company_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Registration #:</span>
                        <span className="text-white font-medium">{selectedListing.company_profile?.company_registration_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Business Type:</span>
                        <span className="text-white font-medium capitalize">{selectedListing.company_profile?.business_type.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Contact Person:</span>
                        <span className="text-white font-medium">{selectedListing.company_profile?.contact_person}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Contact Phone:</span>
                        <span className="text-white font-medium">{selectedListing.company_profile?.contact_phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Location:</span>
                        <span className="text-white font-medium">{selectedListing.company_profile?.city}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Description */}
                {selectedListing.description && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                    <p className="text-white/70">{selectedListing.description}</p>
                  </div>
                )}
                
                {/* Images */}
                {selectedListing.images && selectedListing.images.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-3">Tobacco Images</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                      {selectedListing.images.map((image, index) => (
                        <div 
                          key={image.id} 
                          className="h-24 w-full rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openImagePreview(image.image_path)}
                        >
                          <img 
                            src={getStorageImageUrl(image.image_path)} 
                            alt={`Tobacco Preview ${index + 1}`} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* TIMB Approval Section */}
                <div className="mt-8 pt-6 border-t border-green-500/20">
                  {selectedListing.status === 'pending' ? (
                    <div className="flex flex-col space-y-4">
                      <p className="text-white">
                        This tobacco listing is waiting for TIMB approval. Please review all details before approving.
                      </p>
                      <Button
                        onClick={() => handleApproval(selectedListing.id)}
                        disabled={isLoading}
                        className="w-full sm:w-auto flex items-center gap-2"
                      >
                        {isLoading ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <FileCheck className="h-4 w-4" />
                        )}
                        <span>
                          {isLoading ? "Processing..." : "Approve Tobacco Listing"}
                        </span>
                      </Button>
                    </div>
                  ) : selectedListing.status === 'approved' ? (
                    <div className="bg-green-500/10 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                        <div>
                          <h4 className="font-medium text-green-400">TIMB Approved</h4>
                          <p className="text-white/70 text-sm">
                            Certificate Number: {selectedListing.timb_certificate_number || 'N/A'}
                          </p>
                          <p className="text-white/70 text-sm">
                            Approved on: {selectedListing.timb_cleared_at ? new Date(selectedListing.timb_cleared_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-500/10 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <div>
                          <h4 className="font-medium text-red-400">Listing {selectedListing.status}</h4>
                          <p className="text-white/70 text-sm">
                            Status: {selectedListing.status}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex flex-col justify-center items-center h-full py-16">
              <Leaf className="h-16 w-16 text-green-500/20 mb-4" />
              <h3 className="text-xl font-semibold text-white">No Listing Selected</h3>
              <p className="text-green-500/70 mt-2 mb-6 text-center max-w-md">
                Select a tobacco listing from the left panel to view details and approve
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimbOfficerPage;