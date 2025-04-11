import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import apiClient from '../../services/api-client';

const CompanyRegistrationForm = ({ isEdit = false, initialData = null, onSuccess = () => {} }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  const [formData, setFormData] = useState(initialData || {
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
      
      if (isEdit) {
        response = await apiClient.put('/company_profile/', formData);
      } else {
        response = await apiClient.post('/company_profile/', formData);
      }
      
      if (response.data.status === 'success') {
        setSuccessMessage(isEdit 
          ? "Company profile updated successfully" 
          : "Company profile created successfully"
        );
        
        // Call the success callback
        onSuccess();
        
        if (!isEdit) {
          // Reset form after successful submission
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
            contact_email: '',
            business_type: '',
            license_expiry_date: ''
          });
        }
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSuccessMessage(null);
        }, 5000);
      }
    } catch (err) {
      console.error('Error creating company profile:', err);
      setError(err.response?.data?.errors || err.message || 'Failed to create company profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {isEdit ? 'Edit Company Profile' : 'Company Registration'}
          </CardTitle>
          <CardDescription>
            {isEdit 
              ? 'Update your company information' 
              : 'Create your company profile to continue with the tobacco trading platform'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
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
              <AlertDescription>
                {successMessage}
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Information */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name *</Label>
                  <Input 
                    id="company_name" 
                    name="company_name" 
                    value={formData.company_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="trading_name">Trading Name</Label>
                  <Input 
                    id="trading_name" 
                    name="trading_name" 
                    value={formData.trading_name}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company_registration_number">Registration Number *</Label>
                  <Input 
                    id="company_registration_number" 
                    name="company_registration_number" 
                    value={formData.company_registration_number}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bp_number">BP Number</Label>
                  <Input 
                    id="bp_number" 
                    name="bp_number" 
                    value={formData.bp_number}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="zimra_number">ZIMRA Number *</Label>
                  <Input 
                    id="zimra_number" 
                    name="zimra_number" 
                    value={formData.zimra_number}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="business_type">Business Type *</Label>
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
                  <Label htmlFor="physical_address">Physical Address *</Label>
                  <Input 
                    id="physical_address" 
                    name="physical_address" 
                    value={formData.physical_address}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input 
                    id="city" 
                    name="city" 
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person *</Label>
                  <Input 
                    id="contact_person" 
                    name="contact_person" 
                    value={formData.contact_person}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Contact Phone *</Label>
                  <Input 
                    id="contact_phone" 
                    name="contact_phone" 
                    value={formData.contact_phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Contact Email *</Label>
                  <Input 
                    type="email"
                    id="contact_email" 
                    name="contact_email" 
                    value={formData.contact_email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="license_expiry_date">License Expiry Date</Label>
                  <Input 
                    type="date"
                    id="license_expiry_date" 
                    name="license_expiry_date" 
                    value={formData.license_expiry_date}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </form>
        </CardContent>
        
        <CardFooter>
          <Button 
            className="w-full" 
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : isEdit ? "Update Company" : "Register Company"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default CompanyRegistrationForm;