import React from 'react';
import { Navigate, Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import TopNav from './TopNav';
import { LayoutDashboard, ShoppingBag, FileText, Video, Headphones, Receipt, LogOut } from 'lucide-react';

import ErrorBoundary from '../ui/ErrorBoundary';

export default function PortalLayout() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();

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
    { label: 'Dashboard', icon: LayoutDashboard, path: '/portal' },
    { label: 'My Orders', icon: ShoppingBag, path: '/portal/orders' },
    { label: 'Scripts', icon: FileText, path: '/portal/scripts' },
    { label: 'Videos', icon: Video, path: '/portal/videos' },
    { label: 'Support', icon: Headphones, path: '/portal/support' },
    { label: 'Invoices', icon: Receipt, path: '/portal/invoices' }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <div className="w-64 bg-gray-900 text-gray-300 flex flex-col flex-shrink-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-800">
          <h1 className="text-lg font-bold text-white">Client Portal</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-dark">
          <ul className="space-y-1">
            {navItems.map(item => (
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
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
