import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { 
  CheckCircle2, 
  AlertCircle, 
  Shield, 
  Search, 
  RefreshCw, 
  CheckSquare, 
  XCircle,
  Eye,
  Filter
} from 'lucide-react';
import apiClient from '../services/api-client';
import CompanyStatusBadge from '../components/CompanyStatusBadge';
import { formatBusinessType, formatDate } from '../utils/formatters';

const AdminCompanyVerificationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Check if user is admin, redirect if not
  useEffect(() => {
    if (user && user.user_type !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    // Apply filters to companies
    let filtered = [...companies];
    
    // Filter by verification status
    if (statusFilter !== 'all') {
      const isVerified = statusFilter === 'verified';
      filtered = filtered.filter(company => company.is_verified === isVerified);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(company => 
        company.company_name.toLowerCase().includes(term) ||
        company.company_registration_number.toLowerCase().includes(term) ||
        company.contact_person.toLowerCase().includes(term) ||
        company.city.toLowerCase().includes(term)
      );
    }
    
    setFilteredCompanies(filtered);
  }, [companies, statusFilter, searchTerm]);

  const fetchCompanies = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get('/company_profile/all');
      
      if (response.data.status === 'success') {
        setCompanies(response.data.data || []);
        setFilteredCompanies(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('Failed to fetch companies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCompany = async (companyId, verified = true) => {
    setIsVerifying(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await apiClient.post(`/company_profile/${companyId}/verify`);
      
      if (response.data.status === 'success') {
        setSuccess(`Company ${verified ? 'verified' : 'rejected'} successfully!`);
        
        // Update companies list
        setCompanies(prevCompanies => 
          prevCompanies.map(company => 
            company.id === companyId 
              ? { ...company, is_verified: true }
              : company
          )
        );
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Error verifying company:', err);
      setError(err.response?.data?.message || 'Failed to verify company. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleViewDetails = (company) => {
    setSelectedCompany(company);
  };

  const handleCloseDetails = () => {
    setSelectedCompany(null);
  };

  // Show loader while fetching data
  if (isLoading && companies.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-green-500/50 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-green-500">Loading company data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-green-500" />
        <div>
          <h1 className="text-3xl font-bold text-white">Company Verification</h1>
          <p className="text-green-500">
            Review and verify company registration applications
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" className="mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Company Applications</CardTitle>
          <CardDescription>
            Review and approve company registration applications
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Search and filter bar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-green-500/50" />
              <Input
                placeholder="Search companies..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-full sm:w-64">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-green-500" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Companies</SelectItem>
                  <SelectItem value="pending">Pending Verification</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline" 
              className="sm:w-auto"
              onClick={fetchCompanies}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  <span>Refresh</span>
                </>
              )}
            </Button>
          </div>

          {/* Companies table */}
          {filteredCompanies.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="h-12 w-12 mx-auto text-green-500/30 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No companies found</h3>
              <p className="text-green-500/70 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try changing your search or filter criteria'
                  : 'There are no company applications yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-green-500/20">
                    <th className="py-4 px-4 text-left text-green-500 font-medium">Company Name</th>
                    <th className="py-4 px-4 text-left text-green-500 font-medium">Registration #</th>
                    <th className="py-4 px-4 text-left text-green-500 font-medium">Contact Person</th>
                    <th className="py-4 px-4 text-left text-green-500 font-medium">Location</th>
                    <th className="py-4 px-4 text-left text-green-500 font-medium">Status</th>
                    <th className="py-4 px-4 text-left text-green-500 font-medium">Registered On</th>
                    <th className="py-4 px-4 text-right text-green-500 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((company) => (
                    <tr 
                      key={company.id} 
                      className="border-b border-green-500/10 hover:bg-green-500/5 transition-colors"
                    >
                      <td className="py-4 px-4 text-white font-medium">{company.company_name}</td>
                      <td className="py-4 px-4 text-white/70">{company.company_registration_number}</td>
                      <td className="py-4 px-4 text-white/70">{company.contact_person}</td>
                      <td className="py-4 px-4 text-white/70">{company.city}</td>
                      <td className="py-4 px-4">
                        <CompanyStatusBadge status={company.is_verified} />
                      </td>
                      <td className="py-4 px-4 text-white/70">
                        {formatDate(company.created_at)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            onClick={() => handleViewDetails(company)}
                          >
                            <Eye className="w-4 h-4" />
                            <span>View</span>
                          </Button>

                          {!company.is_verified && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex items-center gap-1 text-green-400 hover:text-green-300 hover:bg-green-500/10"
                              onClick={() => handleVerifyCompany(company.id, true)}
                              disabled={isVerifying}
                            >
                              <CheckSquare className="w-4 h-4" />
                              <span>Verify</span>
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

      {/* Company details modal */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="sticky top-0 bg-zinc-950/90 backdrop-blur-sm z-10 border-b border-green-500/20">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{selectedCompany.company_name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <CompanyStatusBadge status={selectedCompany.is_verified} />
                    <span>Registered on {formatDate(selectedCompany.created_at)}</span>
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-white/70 hover:text-white"
                  onClick={handleCloseDetails}
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-green-500">Company Details</h3>
                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-sm text-white/70">Trading Name</p>
                        <p className="text-white">{selectedCompany.trading_name || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-white/70">Registration Number</p>
                        <p className="text-white">{selectedCompany.company_registration_number}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-white/70">BP Number</p>
                        <p className="text-white">{selectedCompany.bp_number || 'N/A'}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-white/70">ZIMRA Number</p>
                        <p className="text-white">{selectedCompany.zimra_number}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-white/70">Business Type</p>
                        <p className="text-white capitalize">{formatBusinessType(selectedCompany.business_type)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-white/70">License Expiry Date</p>
                        <p className="text-white">{formatDate(selectedCompany.license_expiry_date) || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-green-500">Contact Information</h3>
                    <div className="mt-4 space-y-3">
                      <div>
                        <p className="text-sm text-white/70">Physical Address</p>
                        <p className="text-white">{selectedCompany.physical_address}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-white/70">City</p>
                        <p className="text-white">{selectedCompany.city}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-white/70">Contact Person</p>
                        <p className="text-white">{selectedCompany.contact_person}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-white/70">Contact Phone</p>
                        <p className="text-white">{selectedCompany.contact_phone}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-white/70">Contact Email</p>
                        <p className="text-white">{selectedCompany.contact_email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="border-t border-green-500/20 p-6 flex justify-between">
              <Button 
                variant="outline" 
                onClick={handleCloseDetails}
              >
                Close
              </Button>
              
              {!selectedCompany.is_verified && (
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => handleVerifyCompany(selectedCompany.id, true)}
                  disabled={isVerifying}
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-4 w-4" />
                      <span>Verify Company</span>
                    </>
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminCompanyVerificationPage;