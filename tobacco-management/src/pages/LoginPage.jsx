import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { AlertCircle, Leaf } from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuth();
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData);
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
              Welcome back to <span className="text-green-500">TobaccoTrade</span>
            </h1>
            
            <p className="text-zinc-400 text-lg max-w-lg mx-auto lg:mx-0">
              Sign in to access your account and continue trading on our secure platform.
            </p>
          </div>
          
          {/* Right side - Login form */}
          <div className="lg:w-6/12">
            <Card className="bg-zinc-900/60 backdrop-blur-lg border-zinc-800 rounded-2xl shadow-2xl shadow-green-900/10 overflow-hidden w-full max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">Sign in</CardTitle>
                <CardDescription className="text-zinc-400">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {error && (
                  <div className="mb-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-200">{error}</div>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
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
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-zinc-300 text-sm font-medium">Password</Label>
                      <Link to="/forgot-password" className="text-xs text-green-500 hover:text-green-400 transition-colors">
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="bg-zinc-800/50 border-zinc-700 focus:border-green-500 focus:ring-green-500/20 text-white h-12 rounded-lg placeholder:text-zinc-500"
                      placeholder="Enter your password"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-medium py-3 h-auto text-base rounded-lg transition-all duration-200 shadow-lg shadow-green-900/30"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      'Sign in'
                    )}
                  </Button>
                </form>
              </CardContent>
              
              <CardFooter className="flex flex-col space-y-4 border-t border-zinc-800 pt-6">
                <div className="text-center text-sm text-zinc-400">
                  Don't have an account?{' '}
                  <Link to="/register" className="font-medium text-green-500 hover:text-green-400 transition-colors">
                    Create an account
                  </Link>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;