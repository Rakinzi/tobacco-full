import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { AlertCircle, Check, Leaf } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    phone_number: '',
    user_type: 'buyer', // default value from allowed enum types
  });
  
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserTypeChange = (value) => {
    setFormData({ ...formData, user_type: value });
  };

  const nextStep = (e) => {
    e.preventDefault();
    // Basic validation before proceeding to next step
    if (!formData.email || !formData.password || !formData.password_confirmation) {
      return;
    }
    if (formData.password !== formData.password_confirmation) {
      // You could add form validation error here
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await register(formData);
    if (result.success) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-200 p-4">
      <div className="absolute inset-0 overflow-hidden">
        {/* Abstract background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.15),transparent_40%),radial-gradient(circle_at_70%_60%,rgba(34,197,94,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-soft-light"></div>
      </div>
      
      <div className="container max-w-screen-xl mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center justify-between">
          {/* Left side - Brand info */}
          <div className="lg:w-5/12 space-y-6 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-8">
              <Leaf className="h-8 w-8 text-green-500" />
              <span className="text-2xl font-bold tracking-tight text-white">TobaccoTrade</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight">
              Trade with <span className="text-green-500">confidence</span> on our platform
            </h1>
            
            <p className="text-zinc-400 text-lg max-w-lg mx-auto lg:mx-0">
              Join the premier marketplace for tobacco trading, connecting producers and buyers in a secure, streamlined environment.
            </p>
            
            <div className="pt-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-zinc-300">Real-time auctions and competitive bidding</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-zinc-300">Secure payments and transaction management</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-zinc-300">Regulatory compliance and quality assurance</p>
              </div>
            </div>
          </div>
          
          {/* Right side - Registration form */}
          <div className="lg:w-6/12">
            <Card className="bg-zinc-900/60 backdrop-blur-lg border-zinc-800 rounded-2xl shadow-2xl shadow-green-900/10 overflow-hidden">
              <div className="relative p-8">
                {/* Progress indicator */}
                <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: step === 1 ? '50%' : '100%' }}
                  ></div>
                </div>
                
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {step === 1 ? 'Create your account' : 'Complete your profile'}
                  </h2>
                  <p className="text-zinc-400">
                    {step === 1 
                      ? 'Enter your details to get started with our platform' 
                      : 'Just a few more details to complete your registration'}
                  </p>
                </div>
                
                {error && (
                  <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-200">{error}</div>
                  </div>
                )}
                
                {step === 1 ? (
                  <form onSubmit={nextStep} className="space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="email" className="text-zinc-300 text-sm font-medium">Email address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="bg-zinc-800/50 border-zinc-700 focus:border-green-500 focus:ring-green-500/20 text-white h-12 rounded-lg placeholder:text-zinc-500"
                          placeholder="you@example.com"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="password" className="text-zinc-300 text-sm font-medium">Password</Label>
                        <Input
                          id="password"
                          name="password"
                          type="password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="bg-zinc-800/50 border-zinc-700 focus:border-green-500 focus:ring-green-500/20 text-white h-12 rounded-lg placeholder:text-zinc-500"
                          placeholder="Create a secure password"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="password_confirmation" className="text-zinc-300 text-sm font-medium">Confirm password</Label>
                        <Input
                          id="password_confirmation"
                          name="password_confirmation"
                          type="password"
                          required
                          value={formData.password_confirmation}
                          onChange={handleChange}
                          className="bg-zinc-800/50 border-zinc-700 focus:border-green-500 focus:ring-green-500/20 text-white h-12 rounded-lg placeholder:text-zinc-500"
                          placeholder="Confirm your password"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-3 h-auto text-base rounded-lg transition-all duration-200 shadow-lg shadow-green-900/30"
                    >
                      Continue
                    </Button>
                    
                    <div className="pt-4 text-center">
                      <div className="text-sm text-zinc-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-green-500 hover:text-green-400 transition-colors">
                          Sign in
                        </Link>
                      </div>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="name" className="text-zinc-300 text-sm font-medium">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="bg-zinc-800/50 border-zinc-700 focus:border-green-500 focus:ring-green-500/20 text-white h-12 rounded-lg placeholder:text-zinc-500"
                          placeholder="Enter your full name"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="phone_number" className="text-zinc-300 text-sm font-medium">Phone Number</Label>
                        <Input
                          id="phone_number"
                          name="phone_number"
                          required
                          value={formData.phone_number}
                          onChange={handleChange}
                          className="bg-zinc-800/50 border-zinc-700 focus:border-green-500 focus:ring-green-500/20 text-white h-12 rounded-lg placeholder:text-zinc-500"
                          placeholder="+1234567890"
                        />
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="user_type" className="text-zinc-300 text-sm font-medium">Account Type</Label>
                        <Select
                          value={formData.user_type}
                          onValueChange={handleUserTypeChange}
                          required
                        >
                          <SelectTrigger id="user_type" className="bg-zinc-800/50 border-zinc-700 focus:border-green-500 focus:ring-green-500/20 text-white h-12 rounded-lg">
                            <SelectValue placeholder="Select account type" className="text-zinc-500" />
                          </SelectTrigger>
                          <SelectContent className="bg-zinc-800 border-zinc-700 text-white">
                            <SelectItem value="trader" className="focus:bg-green-500/20 focus:text-white">Trader (Seller)</SelectItem>
                            <SelectItem value="buyer" className="focus:bg-green-500/20 focus:text-white">Buyer</SelectItem>
                            <SelectItem value="timb_officer" className="focus:bg-green-500/20 focus:text-white">TIMB Officer</SelectItem>
                            <SelectItem value="admin" className="focus:bg-green-500/20 focus:text-white">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="flex gap-3">
                      <Button 
                        type="button" 
                        onClick={prevStep}
                        className="w-1/3 bg-transparent hover:bg-zinc-800 text-white border border-zinc-700 font-medium py-3 h-auto text-base rounded-lg transition-all duration-200"
                      >
                        Back
                      </Button>
                      
                      <Button 
                        type="submit" 
                        className="w-2/3 bg-green-600 hover:bg-green-500 text-white font-medium py-3 h-auto text-base rounded-lg transition-all duration-200 shadow-lg shadow-green-900/30"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Creating account...
                          </span>
                        ) : (
                          'Complete Registration'
                        )}
                      </Button>
                    </div>
                    
                    <div className="pt-4 text-center">
                      <div className="mt-4 text-xs text-zinc-500">
                        By signing up, you agree to our{' '}
                        <Link to="/terms" className="text-zinc-400 hover:text-white">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-zinc-400 hover:text-white">
                          Privacy Policy
                        </Link>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;