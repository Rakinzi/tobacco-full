import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Eye, Leaf, ExternalLink } from 'lucide-react';
import { formatTobaccoType, formatCurrency, formatWeight, getStatusStyles, getStorageImageUrl } from '../utils/formatters';

// Helper function to format status with appropriate color
const formatStatus = (status) => {
  const { bgColor, textColor } = getStatusStyles(status);
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor} capitalize`}>
      {status}
    </span>
  );
};

const TobaccoListingTable = ({ listings, onViewDetails }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  // Function to handle image preview
  const openImagePreview = (imagePath) => {
    const fullImageUrl = getStorageImageUrl(imagePath);
    
    // Debug the image URL
    console.log('Image URL:', fullImageUrl);
    
    setSelectedImage(fullImageUrl);
  };

  // Function to close image preview
  const closeImagePreview = () => {
    setSelectedImage(null);
  };

  // If no listings, display a message
  if (!listings || listings.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-white/70">No tobacco listings found.</p>
      </div>
    );
  }

  return (
    <div>
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

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-green-500/20">
              <th className="py-3 px-4 text-left text-xs font-medium text-green-500 uppercase tracking-wider">Batch</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-green-500 uppercase tracking-wider">Type</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-green-500 uppercase tracking-wider">Grade</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-green-500 uppercase tracking-wider">Quantity</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-green-500 uppercase tracking-wider">Price</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-green-500 uppercase tracking-wider">Status</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-green-500 uppercase tracking-wider">Preview</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-green-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-green-500/10">
            {listings.map((listing) => (
              <tr key={listing.id} className="hover:bg-green-500/5">
                <td className="py-4 px-4 text-sm font-medium text-white">
                  {listing.batch_number}
                </td>
                <td className="py-4 px-4 text-sm text-white">
                  {formatTobaccoType(listing.tobacco_type)}
                </td>
                <td className="py-4 px-4 text-sm text-white">
                  {listing.grade}
                </td>
                <td className="py-4 px-4 text-sm text-white">
                  {formatWeight(listing.quantity)}
                </td>
                <td className="py-4 px-4 text-sm text-white">
                  {formatCurrency(listing.minimum_price)}
                </td>
                <td className="py-4 px-4 text-sm">
                  {formatStatus(listing.status)}
                </td>
                <td className="py-4 px-4 text-sm">
                  {listing.images && listing.images.length > 0 ? (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => openImagePreview(listing.images[0].image_path)}
                      className="hover:bg-green-500/10"
                    >
                      <Eye className="h-4 w-4 text-green-500" />
                    </Button>
                  ) : (
                    <span className="text-white/50 text-xs">No image</span>
                  )}
                </td>
                <td className="py-4 px-4 text-sm">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewDetails(listing)}
                      className="flex items-center gap-1"
                    >
                      <Leaf className="h-3 w-3" />
                      <span>View</span>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TobaccoListingTable;