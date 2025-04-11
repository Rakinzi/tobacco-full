import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, 
  Package, 
  ShoppingCart, 
  BarChart, 
  Users, 
  FileText, 
  Settings, 
  X,
  Leaf,
  House,
  BookMarked
} from 'lucide-react';
import { Button } from '../ui/button';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  
  const getNavItems = () => {
    const commonItems = [
      { to: '/', icon: <Home size={16} />, label: 'Dashboard' },
      { to: '/auctions', icon: <Package size={16} />, label: 'Auctions' },
    ];
    
    switch (user?.user_type) {
      case 'admin':
        return [
          ...commonItems,
          { to: '/users', icon: <Users size={16} />, label: 'Users' },
          { to: '/reports', icon: <BarChart size={16} />, label: 'Reports' },
          { to: '/settings', icon: <Settings size={16} />, label: 'Settings' },
          { to: 'admin/company-verification', icon: <House size={16} />, label: 'Companies' },
        ];
      case 'trader':
        return [
          ...commonItems,
          { to: '/company', icon: <House size={16} />, label: 'Company' },
          { to: '/create-auction', icon: <BarChart size={16} />, label: 'Create Auction' },
          { to: '/orders', icon: <ShoppingCart size={16} />, label: 'Orders' },
          { to: '/tobacco-details', icon: <FileText size={16} />, label: 'Tobacco Listings' },
        ];
      case 'buyer':
        return [
          ...commonItems,
          { to: '/my-bids', icon: <BarChart size={16} />, label: 'My Bids' },
          { to: '/orders', icon: <ShoppingCart size={16} />, label: 'Orders' },

        ];
      case 'timb_officer':
        return [
          ...commonItems,
          { to: '/pending-clearance', icon: <FileText size={16} />, label: 'Pending Clearance' },
          { to: '/reports', icon: <BarChart size={16} />, label: 'Reports' },
          {to: '/timb-officer', icon: <Leaf size={16} />, label: 'Tobacco' },
        ];
      default:
        return commonItems;
    }
  };
  
  const navItems = getNavItems();
  
  // Determine if a route is active
  const isActiveRoute = (path) => {
    return window.location.pathname === path || 
           (path !== '/' && window.location.pathname.startsWith(path));
  };
  
  if (!isOpen && window.innerWidth < 768) {
    return null;
  }
  
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && window.innerWidth < 768 && (
        <div 
          onClick={toggleSidebar}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 40
          }}
        />
      )}
      
      <aside 
        style={{
          position: window.innerWidth < 768 ? 'fixed' : 'relative',
          top: 0,
          left: 0,
          height: '100vh',
          width: '256px',
          backgroundColor: '#09090b', // zinc-950
          color: 'white',
          zIndex: 50,
          transform: !isOpen && window.innerWidth < 768 ? 'translateX(-100%)' : 'translateX(0)',
          transition: 'transform 0.2s ease-in-out',
          overflow: 'hidden'
        }}
      >
        <div style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(34, 197, 94, 0.2)', // border-green-500/20
          position: 'relative',
          zIndex: 20
        }}>
          {/* Background pattern */}
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            overflow: 'hidden',
            pointerEvents: 'none'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(circle at 30% 20%, rgba(34, 197, 94, 0.15), transparent 40%), radial-gradient(circle at 70% 60%, rgba(34, 197, 94, 0.1), transparent 50%)'
            }}></div>
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'url("/noise.png")',
              opacity: 0.03,
              mixBlendMode: 'soft-light'
            }}></div>
          </div>
          
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            height: '48px',
            padding: '0 12px',
            borderBottom: '1px solid rgba(34, 197, 94, 0.2)',
            position: 'relative',
            zIndex: 30
          }}>
            <Leaf size={16} color="#22c55e" />
            <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>TobaccoTrade</h2>
            {window.innerWidth < 768 && (
              <button 
                onClick={toggleSidebar}
                style={{
                  marginLeft: 'auto',
                  color: '#22c55e',
                  background: 'transparent',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          {/* Navigation */}
          <nav style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 12px',
            position: 'relative',
            zIndex: 30
          }}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {navItems.map((item) => {
                const active = isActiveRoute(item.to);
                
                return (
                  <li key={item.to} style={{ margin: '2px 0' }}>
                    <a
                      href={item.to}
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = item.to;
                        if (window.innerWidth < 768) {
                          toggleSidebar();
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        position: 'relative',
                        zIndex: 30,
                        transition: 'all 0.2s',
                        color: active ? '#4ade80' : '#a1a1aa',
                        backgroundColor: active ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
                        boxShadow: active ? '0 1px 2px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(34, 197, 94, 0.3)' : 'none'
                      }}
                    >
                      <span style={{ 
                        color: active ? '#4ade80' : '#a1a1aa',
                        transition: 'color 0.2s'
                      }}>
                        {item.icon}
                      </span>
                      <span style={{ 
                        fontSize: '14px',
                        fontWeight: '500'
                      }}>
                        {item.label}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* Footer */}
          <div style={{
            padding: '8px 12px',
            borderTop: '1px solid rgba(34, 197, 94, 0.2)',
            position: 'relative',
            zIndex: 30
          }}>
            <p style={{ 
              fontSize: '10px',
              color: '#22c55e',
              margin: 0
            }}>
              © {new Date().getFullYear()} TobaccoTrade
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;