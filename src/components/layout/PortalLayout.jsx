import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TopNav from './TopNav';
import { 
  LayoutDashboard, ShoppingBag, FileText, Video, 
  Headphones, Receipt, BarChart3, LogOut, ShieldAlert 
} from 'lucide-react';
import { canAccess, syncPermissionsFromServer } from '../../utils/permissions';
import { Button } from '../ui';
import ErrorBoundary from '../ui/ErrorBoundary';

export default function PortalLayout() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [, setPermVersion] = useState(0);

  useEffect(() => {
    // Initial sync from server on mount
    syncPermissionsFromServer().then(() => {
      setPermVersion(v => v + 1);
    });

    const handleUpdate = () => {
      setPermVersion(v => v + 1);
    };

    window.addEventListener('permissionsUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('permissionsUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500 flex items-center justify-center text-white font-black text-sm animate-pulse">LO</div>
          <p className="text-sm text-gray-400">Loading Client Portal...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user?.role !== 'CLIENT') return <Navigate to="/" />;

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/portal', resource: 'dashboard' },
    { label: 'My Orders', icon: ShoppingBag, path: '/portal/orders', resource: 'orders' },
    { label: 'Scripts', icon: FileText, path: '/portal/scripts', resource: 'scripts' },
    { label: 'Videos', icon: Video, path: '/portal/videos', resource: 'videos' },
    { label: 'Reports', icon: BarChart3, path: '/portal/reports', resource: 'reports' },
    { label: 'Support', icon: Headphones, path: '/portal/support', resource: 'support' },
    { label: 'Invoices', icon: Receipt, path: '/portal/invoices', resource: 'payments' }
  ];

  const visibleNavItems = navItems.filter(item => canAccess(user?.role, item.resource));

  // If on /portal root and dashboard is disabled, redirect to first allowed route
  if (location.pathname === '/portal' && !canAccess(user?.role, 'dashboard')) {
    if (visibleNavItems.length > 0 && visibleNavItems[0].path !== '/portal') {
      return <Navigate to={visibleNavItems[0].path} replace />;
    }
  }

  // Check if current route is restricted
  const currentNavItem = navItems.find(item => 
    item.path === location.pathname || (item.path !== '/portal' && location.pathname.startsWith(item.path))
  );
  const isCurrentRestricted = currentNavItem && !canAccess(user?.role, currentNavItem.resource);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="w-64 bg-gray-900 text-gray-300 flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-amber-500 flex items-center justify-center text-white font-black text-xs">
              LO
            </div>
            <h1 className="text-base font-bold text-white tracking-tight">Client Portal</h1>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-dark">
          <ul className="space-y-1">
            {visibleNavItems.map(item => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/portal'}
                  className={({ isActive }) => 
                    `flex items-center px-6 py-3 text-sm font-medium transition-colors border-l-4 ${
                      isActive 
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500' 
                        : 'border-transparent hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        {/* Bottom User / Logout Section */}
        <div className="border-t border-gray-800 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[11px] text-gray-400 truncate">{user?.clientProfile?.companyName || 'Client'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors border border-gray-800 hover:border-red-900/50"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <ErrorBoundary>
            {isCurrentRestricted ? (
              <div className="p-8 max-w-md mx-auto text-center space-y-4 mt-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">Access Restricted</h2>
                <p className="text-xs text-gray-500 leading-relaxed">
                  This module is not currently enabled for your portal role by the agency administrators.
                </p>
                {visibleNavItems.length > 0 && (
                  <Button 
                    onClick={() => navigate(visibleNavItems[0].path)} 
                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
                  >
                    Go to {visibleNavItems[0].label}
                  </Button>
                )}
              </div>
            ) : (
              <Outlet />
            )}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
