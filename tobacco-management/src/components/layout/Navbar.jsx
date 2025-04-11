import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, Bell, Settings, LogOut, User, Leaf } from 'lucide-react';
import { Button } from '../ui/button';
import { useState } from 'react';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  
  const handleLogout = async () => {
    await logout();
  };
  
  return (
    <div className="h-12 bg-zinc-950">
      <div className="absolute inset-0 overflow-hidden">
        {/* Abstract background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.15),transparent_40%),radial-gradient(circle_at_70%_60%,rgba(34,197,94,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-soft-light"></div>
      </div>

      <header className="relative z-10 border-b border-green-500/20 h-12 px-3 md:px-4">
        <div className="flex items-center justify-between h-full">
          {/* Left section */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              className="md:hidden text-green-500 hover:text-green-400 hover:bg-green-500/10 h-7 w-7" 
              onClick={toggleSidebar}
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Toggle menu</span>
            </Button>
            
            <Link to="/" className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-green-500" />
              <span className="text-sm font-bold text-white hidden sm:inline-block">TobaccoTrade</span>
            </Link>
          </div>
          
          {/* Right section */}
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              className="text-green-500 hover:text-green-400 hover:bg-green-500/10 h-7 w-7"
            >
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-green-500/10"
              >
                <div className="w-6 h-6 rounded-full bg-green-600/20 border border-green-500/20 flex items-center justify-center text-green-500 text-xs">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                
                <div className="hidden md:block">
                  <div className="text-xs font-medium text-white leading-none">{user?.name || 'User'}</div>
                  <div className="text-[10px] text-green-500">{user?.user_type}</div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-green-500 hover:text-green-400 hover:bg-green-500/10 h-7 w-7"
                >
                  <Settings className="h-3.5 w-3.5" />
                </Button>
              </button>
              
              {showMenu && (
                <ul className="absolute right-0 mt-1 p-1.5 shadow-lg shadow-green-900/30 bg-zinc-950/95 backdrop-blur-sm border border-green-500/20 rounded-lg w-48">
                  <li>
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-2 px-2.5 py-1.5 text-sm text-green-500 hover:text-green-400 hover:bg-green-500/10 rounded-md"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </li>
                  <li>
                    <button 
                      onClick={handleLogout} 
                      className="flex items-center gap-2 px-2.5 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md w-full text-left"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Navbar;