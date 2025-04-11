import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { CheckCircle2, AlertCircle, Building2, ArrowRight, RefreshCw, PlusCircle, ListFilter } from 'lucide-react';
import apiClient from '../services/api-client';
import CompanyStatusBadge from '../components/CompanyStatusBadge';
import CompanyStatusTable from '../components/CompanyStatusTable';
// import { formatBusinessType, formatDate } from '../utils/formatters';

const CompanyRegistrationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [userCompanies, setUserCompanies] = useState([]);
  const [activeTab, setActiveTab] = useState('register');
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [formData, setFormData] = useState({
    company_name: '',
    trading_name: '',
    company_registration_number: '',
    bp_number: '',
    zimra_number: '',
    physical_address: '',
    city: '',
    contact_person: '',
    contact_phone: '',
    contact_email: user?.email || '',
    business_type: '',
    license_expiry_date: ''
  });

  useEffect(() => {
    // Fetch user's companies
    fetchUserCompanies();
  }, [user]);

  const fetchUserCompanies = async () => {
    setIsFetching(true);
    setError(null);

    try {
      // Fetch the user's companies
      const response = await apiClient.get('/company_profile/');

      // If response is a single company (object with id) wrap it in an array
      if (response.data.data && response.data.data.id) {
        setUserCompanies([response.data.data]);
        setCompanyProfile(response.data.data);
      }
      // If response is an array, use it directly
      else if (Array.isArray(response.data.data)) {
        setUserCompanies(response.data.data);

        // If companies exist, select the first one as the active profile
        if (response.data.data.length > 0) {
          setCompanyProfile(response.data.data[0]);
        }
      }

      // If companies exist, show the list view by default
      if ((Array.isArray(response.data.data) && response.data.data.length > 0) ||
        (response.data.data && response.data.data.id)) {
        setActiveTab('list');
      }
    } catch (err) {
      console.error('Error fetching company profiles:', err);

      // 404 is expected for users without a company profile
      if (err.response && err.response.status !== 404) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch company profiles');
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

  const handleSelectChange = (value) => {
    setFormData(prev => ({
      ...prev,
      business_type: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      let response;

      if (selectedCompany) {
        // For updates, only send the fields that have changed
        const changedFields = {};
        for (const key in formData) {
          // Check if the field has changed from the original value
          if (formData[key] !== selectedCompany[key]) {
            changedFields[key] = formData[key];
          }
        }

        // Only make the update request if there are changes
        if (Object.keys(changedFields).length > 0) {
          response = await apiClient.put('/company_profile', changedFields);
        } else {
          // No changes were made
          setSuccessMessage("No changes were made to the company profile.");
          setIsLoading(false);
          return;
        }
      } else {
        // For new companies, send the complete form data
        response = await apiClient.post('/company_profile/', formData);
      }

      if (response.data.status === 'success') {
        setSuccessMessage(selectedCompany
          ? "Company profile updated successfully!"
          : "Company profile created successfully! You can now start trading on the platform."
        );

        // Refresh company list
        fetchUserCompanies();

        // If we created a new company, reset the form
        if (!selectedCompany) {
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
      console.error('Error with company profile:', err);
      setError(err.response?.data?.errors || err.message || 'Failed to process company profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (company) => {
    setSelectedCompany(company);
    setFormData(company);
    setActiveTab('register');
  };

  const handleAddNew = () => {
    resetForm();
    setSelectedCompany(null);
    setActiveTab('register');
  };

  const resetForm = () => {
    setFormData({
      company_name: '',
      trading_name: '',
      company_registration_number: '',
      bp_number: '',
      zimra_number: '',
      physical_address: '',
      city: '',
      contact_person: '',
      contact_phone: '',
      contact_email: user?.email || '',
      business_type: '',
      license_expiry_date: ''
    });
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  // Show loader while initially checking company profile
  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-green-500/50 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-green-500">Loading company information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <Building2 className="h-8 w-8 text-green-500" />
        <div>
          <h1 className="text-3xl font-bold text-white">Company Management</h1>
          <p className="text-green-500">
            Register and manage your companies on the platform
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {typeof error === 'object'
              ? Object.entries(error).map(([key, value]) => (
                <div key={key}>{key}: {value}</div>
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
              <TabsTrigger value="register" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{selectedCompany ? 'Edit Company' : 'Register Company'}</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <ListFilter className="h-4 w-4" />
                <span>Company List</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} className="mt-2">
            <TabsContent value="register">
              {selectedCompany && (
                <div className="mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{selectedCompany.company_name}</h3>
                      <CompanyStatusBadge status={selectedCompany.is_verified} />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddNew}
                      className="flex items-center gap-2"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>New Company</span>
                    </Button>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Information */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="company_name" className="text-white">Company Name *</Label>
                      <Input
                        id="company_name"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        placeholder="Enter company name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="trading_name" className="text-white">Trading Name</Label>
                      <Input
                        id="trading_name"
                        name="trading_name"
                        value={formData.trading_name || ''}
                        onChange={handleChange}
                        placeholder="Enter trading name (if different)"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_registration_number" className="text-white">Registration Number *</Label>
                      <Input
                        id="company_registration_number"
                        name="company_registration_number"
                        value={formData.company_registration_number}
                        onChange={handleChange}
                        placeholder="e.g. CR123456"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bp_number" className="text-white">BP Number</Label>
                      <Input
                        id="bp_number"
                        name="bp_number"
                        value={formData.bp_number || ''}
                        onChange={handleChange}
                        placeholder="e.g. BP789012"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="zimra_number" className="text-white">ZIMRA Number *</Label>
                      <Input
                        id="zimra_number"
                        name="zimra_number"
                        value={formData.zimra_number}
                        onChange={handleChange}
                        placeholder="e.g. ZIMRA345"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="business_type" className="text-white">Business Type *</Label>
                      <Select
                        value={formData.business_type}
                        onValueChange={handleSelectChange}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auction_floor">Auction Floor</SelectItem>
                          <SelectItem value="contractor">Contractor</SelectItem>
                          <SelectItem value="merchant">Merchant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="physical_address" className="text-white">Physical Address *</Label>
                      <Input
                        id="physical_address"
                        name="physical_address"
                        value={formData.physical_address}
                        onChange={handleChange}
                        placeholder="Enter physical address"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-white">City *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Enter city"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_person" className="text-white">Contact Person *</Label>
                      <Input
                        id="contact_person"
                        name="contact_person"
                        value={formData.contact_person}
                        onChange={handleChange}
                        placeholder="Enter contact person name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_phone" className="text-white">Contact Phone *</Label>
                      <Input
                        id="contact_phone"
                        name="contact_phone"
                        value={formData.contact_phone}
                        onChange={handleChange}
                        placeholder="e.g. +263771234567"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contact_email" className="text-white">Contact Email *</Label>
                      <Input
                        type="email"
                        id="contact_email"
                        name="contact_email"
                        value={formData.contact_email}
                        onChange={handleChange}
                        placeholder="Enter contact email"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="license_expiry_date" className="text-white">License Expiry Date</Label>
                      <Input
                        type="date"
                        id="license_expiry_date"
                        name="license_expiry_date"
                        value={formData.license_expiry_date || ''}
                        onChange={handleChange}
                      />
                    </div>
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
                        : selectedCompany
                          ? "Update Company Profile"
                          : "Register Company"
                      }
                    </span>
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="list">
              <CompanyStatusTable
                companies={userCompanies}
                onViewDetails={handleViewDetails}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyRegistrationPage;