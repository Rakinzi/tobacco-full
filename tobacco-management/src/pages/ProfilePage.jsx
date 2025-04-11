import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Loader2, Save, User, Building, Phone, Mail, AlertTriangle } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompanySaving, setIsCompanySaving] = useState(false);
  const [personalInfo, setPersonalInfo] = useState({
    name: '',
    email: '',
    phone_number: ''
  });
  const [companyInfo, setCompanyInfo] = useState({
    company_name: '',
    trading_name: '',
    company_registration_number: '',
    bp_number: '',
    zimra_number: '',
    physical_address: '',
    city: '',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    business_type: '',
    license_expiry_date: ''
  });
  const [errors, setErrors] = useState({});
  const [companyErrors, setCompanyErrors] = useState({});
  const [hasCompanyProfile, setHasCompanyProfile] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        // In a real application, you would fetch this data from your API
        // For now, we'll use the user data from auth context and mock company data
        
        // Set personal info from user data
        if (user) {
          setPersonalInfo({
            name: user.name || '',
            email: user.email || '',
            phone_number: user.phone_number || ''
          });
        }
        
        // Mock company profile data
        // In a real app, this would come from an API call
        // Only traders and timb_officers would typically have company profiles
        if (user?.user_type === 'trader' || user?.user_type === 'timb_officer') {
          const mockCompanyData = {
            company_name: 'Virginia Farms Ltd',
            trading_name: 'VF Tobacco',
            company_registration_number: 'REG12345678',
            bp_number: 'BP987654321',
            zimra_number: 'ZIMRA2023456',
            physical_address: '123 Farm Road, Richmond',
            city: 'Virginia',
            contact_person: user?.name || 'Contact Person',
            contact_phone: user?.phone_number || '+1234567890',
            contact_email: user?.email || 'contact@example.com',
            business_type: 'merchant',
            license_expiry_date: '2026-12-31'
          };
          
          setCompanyInfo(mockCompanyData);
          setHasCompanyProfile(true);
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, [user]);

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCompanyInfoChange = (e) => {
    const { name, value } = e.target;
    setCompanyInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBusinessTypeChange = (value) => {
    setCompanyInfo(prev => ({
      ...prev,
      business_type: value
    }));
  };

  const handlePersonalInfoSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    const newErrors = {};
    if (!personalInfo.name) newErrors.name = 'Name is required';
    if (!personalInfo.email) newErrors.email = 'Email is required';
    if (!personalInfo.phone_number) newErrors.phone_number = 'Phone number is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would make an API call to update the user profile
      // After success, you would update the user in auth context
      
      alert('Personal information updated successfully!');
    } catch (error) {
      console.error('Error updating personal information:', error);
      setErrors({ general: 'Failed to update profile. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompanyInfoSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation for company info
    const newErrors = {};
    if (!companyInfo.company_name) newErrors.company_name = 'Company name is required';
    if (!companyInfo.company_registration_number) newErrors.company_registration_number = 'Registration number is required';
    if (!companyInfo.physical_address) newErrors.physical_address = 'Physical address is required';
    
    if (Object.keys(newErrors).length > 0) {
      setCompanyErrors(newErrors);
      return;
    }
    
    setCompanyErrors({});
    setIsCompanySaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, you would make an API call to update or create company profile
      
      setHasCompanyProfile(true);
      alert('Company information saved successfully!');
    } catch (error) {
      console.error('Error saving company information:', error);
      setCompanyErrors({ general: 'Failed to save company information. Please try again.' });
    } finally {
      setIsCompanySaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and company profile
        </p>
      </div>
      
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="personal">Personal Information</TabsTrigger>
          {(user?.user_type === 'trader' || user?.user_type === 'timb_officer') && (
            <TabsTrigger value="company">Company Profile</TabsTrigger>
          )}
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        {/* Personal Information Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and contact information
              </CardDescription>
            </CardHeader>
            <form onSubmit={handlePersonalInfoSubmit}>
              <CardContent className="space-y-4">
                {errors.general && (
                  <div className="bg-destructive/10 p-4 rounded-md flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{errors.general}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="name"
                        name="name"
                        value={personalInfo.name}
                        onChange={handlePersonalInfoChange}
                        className="pl-10"
                        placeholder="Your full name"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-xs text-destructive mt-1">{errors.name}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={personalInfo.email}
                        onChange={handlePersonalInfoChange}
                        className="pl-10"
                        placeholder="your.email@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-destructive mt-1">{errors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="phone_number"
                        name="phone_number"
                        value={personalInfo.phone_number}
                        onChange={handlePersonalInfoChange}
                        className="pl-10"
                        placeholder="+1234567890"
                      />
                    </div>
                    {errors.phone_number && (
                      <p className="text-xs text-destructive mt-1">{errors.phone_number}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <Input
                      value={user?.user_type === 'admin' ? 'Administrator' :
                              user?.user_type === 'trader' ? 'Trader/Seller' :
                              user?.user_type === 'buyer' ? 'Buyer' :
                              user?.user_type === 'timb_officer' ? 'TIMB Officer' :
                              'User'}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">Account type cannot be changed</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="ml-auto"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        {/* Company Profile Tab */}
        {(user?.user_type === 'trader' || user?.user_type === 'timb_officer') && (
          <TabsContent value="company">
            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
                <CardDescription>
                  {hasCompanyProfile 
                    ? 'Update your company information and business details' 
                    : 'Complete your company profile to start trading'}
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleCompanyInfoSubmit}>
                <CardContent className="space-y-6">
                  {companyErrors.general && (
                    <div className="bg-destructive/10 p-4 rounded-md flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                      <p className="text-sm text-destructive">{companyErrors.general}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company_name">Company Name</Label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="company_name"
                          name="company_name"
                          value={companyInfo.company_name}
                          onChange={handleCompanyInfoChange}
                          className="pl-10"
                          placeholder="Your company name"
                        />
                      </div>
                      {companyErrors.company_name && (
                        <p className="text-xs text-destructive mt-1">{companyErrors.company_name}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="trading_name">Trading Name</Label>
                      <Input
                        id="trading_name"
                        name="trading_name"
                        value={companyInfo.trading_name}
                        onChange={handleCompanyInfoChange}
                        placeholder="Trading name (if different)"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="company_registration_number">Registration Number</Label>
                      <Input
                        id="company_registration_number"
                        name="company_registration_number"
                        value={companyInfo.company_registration_number}
                        onChange={handleCompanyInfoChange}
                        placeholder="Company registration number"
                      />
                      {companyErrors.company_registration_number && (
                        <p className="text-xs text-destructive mt-1">{companyErrors.company_registration_number}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="bp_number">BP Number</Label>
                      <Input
                        id="bp_number"
                        name="bp_number"
                        value={companyInfo.bp_number}
                        onChange={handleCompanyInfoChange}
                        placeholder="Business Partner number"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="zimra_number">ZIMRA Number</Label>
                      <Input
                        id="zimra_number"
                        name="zimra_number"
                        value={companyInfo.zimra_number}
                        onChange={handleCompanyInfoChange}
                        placeholder="ZIMRA registration number"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="business_type">Business Type</Label>
                      <Select
                        value={companyInfo.business_type}
                        onValueChange={handleBusinessTypeChange}
                      >
                        <SelectTrigger id="business_type">
                          <SelectValue placeholder="Select business type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auction_floor">Auction Floor</SelectItem>
                          <SelectItem value="contractor">Contractor</SelectItem>
                          <SelectItem value="merchant">Merchant</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="physical_address">Physical Address</Label>
                      <Input
                        id="physical_address"
                        name="physical_address"
                        value={companyInfo.physical_address}
                        onChange={handleCompanyInfoChange}
                        placeholder="Street address"
                      />
                      {companyErrors.physical_address && (
                        <p className="text-xs text-destructive mt-1">{companyErrors.physical_address}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        name="city"
                        value={companyInfo.city}
                        onChange={handleCompanyInfoChange}
                        placeholder="City"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contact_person">Contact Person</Label>
                      <Input
                        id="contact_person"
                        name="contact_person"
                        value={companyInfo.contact_person}
                        onChange={handleCompanyInfoChange}
                        placeholder="Primary contact person"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contact_phone">Contact Phone</Label>
                      <Input
                        id="contact_phone"
                        name="contact_phone"
                        value={companyInfo.contact_phone}
                        onChange={handleCompanyInfoChange}
                        placeholder="Contact phone number"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="contact_email">Contact Email</Label>
                      <Input
                        id="contact_email"
                        name="contact_email"
                        type="email"
                        value={companyInfo.contact_email}
                        onChange={handleCompanyInfoChange}
                        placeholder="Contact email address"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="license_expiry_date">License Expiry Date</Label>
                      <Input
                        id="license_expiry_date"
                        name="license_expiry_date"
                        type="date"
                        value={companyInfo.license_expiry_date}
                        onChange={handleCompanyInfoChange}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <Button 
                    type="submit" 
                    disabled={isCompanySaving}
                    className="ml-auto"
                  >
                    {isCompanySaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        {hasCompanyProfile ? 'Update Company Profile' : 'Save Company Profile'}
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        )}
        
        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Update your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current_password">Current Password</Label>
                <Input
                  id="current_password"
                  type="password"
                  placeholder="Enter your current password"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  placeholder="Enter new password"
                />
                <p className="text-xs text-muted-foreground">
                  Password must be at least 8 characters long and include at least one number and one special character
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm New Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  placeholder="Confirm new password"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button variant="outline" className="mr-2">
                Cancel
              </Button>
              <Button>
                Update Password
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;