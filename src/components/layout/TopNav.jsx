import React from 'react';
import { Menu, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function TopNav({ onMobileMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Build breadcrumb from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const pageTitle = pathParts.length > 0
    ? pathParts[0].replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Dashboard';

  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <header className="h-12 bg-white border-b border-gray-200/80 flex items-center justify-between px-4 sm:px-6 z-10 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="text-sm font-medium text-gray-800">
          {pageTitle}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
        </button>

        <div className="flex items-center gap-2 pl-3 ml-1 border-l border-gray-200/80">
          <div className="w-7 h-7 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center text-[11px] font-bold">
            {initials}
          </div>
          <span className="hidden sm:block text-[13px] font-medium text-gray-700">{user?.name}</span>
        </div>

        <button
          onClick={handleLogout}
          title="Logout"
          className="flex items-center gap-1.5 ml-2 px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
