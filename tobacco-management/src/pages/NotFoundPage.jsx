import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Leaf } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-200 p-4">
      <div className="absolute inset-0 overflow-hidden">
        {/* Abstract background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.15),transparent_40%),radial-gradient(circle_at_70%_60%,rgba(34,197,94,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-soft-light"></div>
      </div>
      
      <div className="relative z-10 text-center space-y-6 max-w-[500px] mx-auto">
        <div className="flex items-center justify-center">
          <Leaf className="h-12 w-12 text-green-500" />
        </div>
        
        <h1 className="text-6xl sm:text-8xl font-bold text-white">404</h1>
        <h2 className="text-2xl sm:text-3xl font-medium text-white">Page Not Found</h2>
        
        <p className="text-zinc-400 mt-4">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button 
            size="lg" 
            className="bg-green-600 hover:bg-green-500 text-white"
            asChild
          >
            <Link to="/">Go Home</Link>
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            asChild
          >
            <Link to="/auctions">Browse Auctions</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;