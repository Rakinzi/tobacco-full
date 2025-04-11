import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { getStorageImageUrl } from '../utils/formatters';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { 
  CheckCircle2, 
  AlertCircle, 
  Leaf, 
  ArrowRight, 
  RefreshCw, 
  PlusCircle, 
  ListFilter, 
  ImagePlus, 
  FileX,
  X
} from 'lucide-react';
import tobaccoService from '../services/tobaccoService';
import TobaccoListingTable from '../components/TobaccoListingTable';

const TobaccoListingPage = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [listings, setListings] = useState([]);
  const [activeTab, setActiveTab] = useState('create');
  const [selectedListing, setSelectedListing] = useState(null);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const [formData, setFormData] = useState({
    batch_number: '',
    tobacco_type: '',
    quantity: '',
    grade: '',
    region_grown: '',
    season_grown: new Date().getFullYear().toString(),
    description: '',
    minimum_price: ''
  });

  useEffect(() => {
    fetchTobaccoListings();
  }, [user]);

  const fetchTobaccoListings = async () => {
    setIsFetching(true);
    setError(null);

    try {
      const response = await tobaccoService.getAllListings();
      
      if (response.data && response.data.data) {
        setListings(response.data.data);
        
        // If listings exist, show the list view by default
        if (response.data.data.length > 0) {
          setActiveTab('list');
        }
      }
    } catch (err) {
      console.error('Error fetching tobacco listings:', err);
      
      if (err.response && err.response.status !== 404) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch tobacco listings');
      }
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

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Only allow up to 5 images
    const allowedFiles = files.slice(0, 5 - images.length);
    
    if (allowedFiles.length + images.length > 5) {
      setError("Maximum 5 images allowed");
      return;
    }
    
    setImages(prev => [...prev, ...allowedFiles]);
    
    // Create preview URLs
    const newPreviewUrls = allowedFiles.map(file => URL.createObjectURL(file));
    setPreviewImages(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(previewImages[index]);
    
    // Remove the image from both arrays
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Validate that at least one image is selected
    if (images.length === 0) {
      setError("At least one image is required");
      setIsLoading(false);
      return;
    }

    try {
      // Create FormData for multipart/form-data request (for file uploads)
      const formDataToSend = new FormData();
      
      // Append all form fields
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      // Append all images
      images.forEach(image => {
        formDataToSend.append('images[]', image);
      });

      let response;
      
      if (selectedListing) {
        // For updates
        response = await tobaccoService.updateListing(selectedListing.id, formDataToSend);
      } else {
        // For new listings
        response = await tobaccoService.createListing(formDataToSend);
      }

      if (response.data.status === 'success') {
        setSuccessMessage(selectedListing
          ? "Tobacco listing updated successfully!"
          : "Tobacco listing created successfully!"
        );

        // Refresh listings
        fetchTobaccoListings();

        // If we created a new listing, reset the form
        if (!selectedListing) {
          resetForm();
        }

        // Switch to the list tab after successful creation/update
        setActiveTab('list');

        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      }
    } catch (err) {
      console.error('Error with tobacco listing:', err);
      
      if (err.response?.data?.errors) {
        setError(err.response.data.errors);
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to process tobacco listing');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (listing) => {
    setSelectedListing(listing);
    
    // Set form data from listing
    setFormData({
      batch_number: listing.batch_number,
      tobacco_type: listing.tobacco_type,
      quantity: listing.quantity,
      grade: listing.grade,
      region_grown: listing.region_grown,
      season_grown: listing.season_grown,
      description: listing.description || '',
      minimum_price: listing.minimum_price
    });
    
    // Set preview images from listing
    if (listing.images && listing.images.length > 0) {
      const imageUrls = listing.images.map(img => getStorageImageUrl(img.image_path));
      setPreviewImages(imageUrls);
      // Note: We can't set the actual File objects for existing images
      setImages([]);
    }
    
    setActiveTab('create');
  };

  const handleAddNew = () => {
    resetForm();
    setSelectedListing(null);
    setActiveTab('create');
  };

  const resetForm = () => {
    setFormData({
      batch_number: '',
      tobacco_type: '',
      quantity: '',
      grade: '',
      region_grown: '',
      season_grown: new Date().getFullYear().toString(),
      description: '',
      minimum_price: ''
    });
    
    // Clear images
    setImages([]);
    
    // Revoke all preview URLs to avoid memory leaks
    previewImages.forEach(url => URL.revokeObjectURL(url));
    setPreviewImages([]);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Leaf className="h-8 w-8 text-green-500" />
        <div>
          <h1 className="text-3xl font-bold text-white">Tobacco Listings</h1>
          <p className="text-green-500">
            Create and manage your tobacco listings on the platform
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                <span>{selectedListing ? 'Edit Listing' : 'Create Listing'}</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <ListFilter className="h-4 w-4" />
                <span>Listings</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} className="mt-2">
            <TabsContent value="create">
              {selectedListing && (
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Batch: {selectedListing.batch_number}</h3>
                      <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">
                        Status: {selectedListing.status}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddNew}
                      className="flex items-center gap-2"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>New Listing</span>
                    </Button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Tobacco Details */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="batch_number" className="text-white">Batch Number *</Label>
                      <Input
                        id="batch_number"
                        name="batch_number"
                        value={formData.batch_number}
                        onChange={handleChange}
                        placeholder="e.g. BATCH-2024-0025"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tobacco_type" className="text-white">Tobacco Type *</Label>
                      <Select
                        value={formData.tobacco_type}
                        onValueChange={(value) => handleSelectChange('tobacco_type', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tobacco type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flue_cured">Flue Cured</SelectItem>
                          <SelectItem value="burley">Burley</SelectItem>
                          <SelectItem value="dark_fired">Dark Fired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity" className="text-white">Quantity (kg) *</Label>
                      <Input
                        id="quantity"
                        name="quantity"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.quantity}
                        onChange={handleChange}
                        placeholder="e.g. 1000.50"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="grade" className="text-white">Grade *</Label>
                      <Input
                        id="grade"
                        name="grade"
                        value={formData.grade}
                        onChange={handleChange}
                        placeholder="e.g. A1"
                        required
                      />
                    </div>
                  </div>

                  {/* Right Column - Additional Info */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="region_grown" className="text-white">Region Grown *</Label>
                      <Input
                        id="region_grown"
                        name="region_grown"
                        value={formData.region_grown}
                        onChange={handleChange}
                        placeholder="e.g. Mashonaland East"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="season_grown" className="text-white">Season Grown *</Label>
                      <Input
                        id="season_grown"
                        name="season_grown"
                        value={formData.season_grown}
                        onChange={handleChange}
                        placeholder="e.g. 2024"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="minimum_price" className="text-white">Minimum Price (USD) *</Label>
                      <Input
                        id="minimum_price"
                        name="minimum_price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.minimum_price}
                        onChange={handleChange}
                        placeholder="e.g. 450.00"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-white">Description</Label>
                      <Input
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter description of the tobacco"
                      />
                    </div>
                  </div>
                </div>

                {/* Images Section */}
                <div className="mt-6 border-t border-green-500/20 pt-6">
                  <div className="space-y-4">
                    <Label className="text-white">Tobacco Images * (max 5)</Label>
                    
                    {/* Image preview section */}
                    {previewImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                        {previewImages.map((src, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={src} 
                              alt={`Preview ${index + 1}`} 
                              className="h-24 w-full object-cover rounded-lg border border-green-500/20"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Image upload button */}
                    {previewImages.length < 5 && (
                      <div className="flex items-center justify-center h-24 border-2 border-dashed border-green-500/20 rounded-lg cursor-pointer hover:border-green-500/40 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="flex flex-col items-center space-y-2">
                          <ImagePlus className="h-8 w-8 text-green-500" />
                          <p className="text-sm text-green-500">Click to upload images</p>
                          <p className="text-xs text-green-500/50">JPG, PNG (max 2MB each)</p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/jpg"
                          onChange={handleImageChange}
                          multiple
                          className="hidden"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 border-t border-green-500/20 pt-6">
                  <p className="text-sm text-white/70 mb-4">
                    <span className="text-red-400">*</span> Required fields
                  </p>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full sm:w-auto flex items-center gap-2"
                  >
                    {isLoading && <RefreshCw className="h-4 w-4 animate-spin" />}
                    <span>
                      {isLoading
                        ? "Processing..."
                        : selectedListing
                          ? "Update Tobacco Listing"
                          : "Create Tobacco Listing"
                      }
                    </span>
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="list">
              {listings.length > 0 ? (
                <TobaccoListingTable
                  listings={listings}
                  onViewDetails={handleViewDetails}
                />
              ) : (
                <div className="text-center py-12">
                  <Leaf className="h-12 w-12 text-green-500/50 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Tobacco Listings Yet</h3>
                  <p className="text-green-500/70 mb-6">You haven't created any tobacco listings yet.</p>
                  <Button onClick={() => setActiveTab('create')} className="flex items-center gap-2 mx-auto">
                    <PlusCircle className="h-4 w-4" />
                    <span>Create Your First Listing</span>
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TobaccoListingPage;