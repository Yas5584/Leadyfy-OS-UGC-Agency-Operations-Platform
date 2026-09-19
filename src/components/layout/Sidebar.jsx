import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canAccess } from '../../utils/permissions';
import {
  LayoutDashboard, Users, ShoppingBag, FileText, UserCircle,
  Camera, Video, CheckSquare, Headphones, Bell,
  CreditCard, Receipt, Wallet, BarChart3, UserCog, ScrollText,
  Settings, LogOut, Shield, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const role = user.role;

  const navGroups = [
    {
      label: 'MAIN',
      items: [
        { label: 'Dashboard', icon: LayoutDashboard, path: '/', resource: 'dashboard' }
      ]
    },
    {
      label: 'WORKSPACE',
      items: [
        { label: 'Clients', icon: Users, path: '/clients', resource: 'clients' },
        { label: 'Orders', icon: ShoppingBag, path: '/orders', resource: 'orders' },
        { label: 'Scripts', icon: FileText, path: '/scripts', resource: 'scripts' },
        { label: 'Creators', icon: UserCircle, path: '/creators', resource: 'creators' },
        { label: 'Shoots', icon: Camera, path: '/shoots', resource: 'shoots' },
        { label: 'Videos', icon: Video, path: '/videos', resource: 'videos' }
      ]
    },
    {
      label: 'OPERATIONS',
      items: [
        { label: 'Tasks', icon: CheckSquare, path: '/tasks', resource: 'tasks' },
        { label: 'Support', icon: Headphones, path: '/support', resource: 'support' },
        { label: 'Notifications', icon: Bell, path: '/notifications', resource: 'notifications' }
      ]
    },
    {
      label: 'FINANCE',
      items: [
        { label: 'Payments', icon: CreditCard, path: '/payments', resource: 'payments' },
        { label: 'Expenses', icon: Receipt, path: '/expenses', resource: 'expenses' },
        { label: 'Creator Payouts', icon: Wallet, path: '/creator-payouts', resource: 'payouts' }
      ]
    },
    {
      label: 'ANALYTICS',
      items: [
        { label: 'Reports', icon: BarChart3, path: '/reports', resource: 'reports' }
      ]
    },
    {
      label: 'ADMINISTRATION',
      items: [
        { label: 'Employees', icon: UserCog, path: '/employees', resource: 'employees' },
        { label: 'Roles & Permissions', icon: Shield, path: '/settings', resource: 'employees' },
        { label: 'Activity Logs', icon: ScrollText, path: '/activity-logs', resource: 'activity_logs' }
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (user.name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <div className={`${collapsed ? 'w-[68px]' : 'w-[240px]'} bg-[#111111] text-gray-400 flex flex-col h-full transition-all duration-200 select-none`}>
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/[0.06]">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-amber-500 flex items-center justify-center text-white font-black text-xs">
              LO
            </div>
            <span className="text-[15px] font-bold tracking-tight text-white">LEADYFY <span className="text-amber-500">OS</span></span>
          </div>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-md bg-amber-500 flex items-center justify-center text-white font-black text-xs mx-auto">
            LO
          </div>
        )}
        {onToggle && !collapsed && (
          <button onClick={onToggle} className="p-1 rounded hover:bg-white/[0.06] text-gray-500 hover:text-gray-300 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-3 scrollbar-thin scrollbar-thumb-white/10">
        {navGroups.map((group, i) => {
          const visibleItems = group.items.filter(item => canAccess(role, item.resource));
          if (visibleItems.length === 0) return null;

          return (
            <div key={i} className="mb-1">
              {group.label && !collapsed && (
                <h3 className="px-4 pt-4 pb-1.5 text-[10px] font-semibold text-gray-600 uppercase tracking-[0.08em]">
                  {group.label}
                </h3>
              )}
              {group.label && collapsed && <div className="h-px bg-white/[0.04] mx-3 my-2" />}
              <ul>
                {visibleItems.map(item => (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.path === '/'}
                      title={collapsed ? item.label : undefined}
                      className={({ isActive }) =>
                        `flex items-center gap-3 mx-2 px-2.5 py-[7px] rounded-md text-[13px] font-medium transition-colors ${
                          isActive
                            ? 'bg-amber-500/[0.12] text-amber-500'
                            : 'text-gray-400 hover:bg-white/[0.04] hover:text-gray-200'
                        }`
                      }
                    >
                      <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Bottom User Section */}
      <div className="border-t border-white/[0.06] p-3">
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2.5 mb-3 px-1">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-gray-200 truncate">{user.name}</p>
                <p className="text-[11px] text-gray-500 truncate">{user.role.replace(/_/g, ' ')}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <NavLink
                to="/settings"
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] text-gray-500 hover:text-gray-300 hover:bg-white/[0.04] rounded transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Settings</span>
              </NavLink>
              <button
                onClick={handleLogout}
                className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[12px] text-gray-500 hover:text-red-400 hover:bg-white/[0.04] rounded transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-white/[0.04] rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Collapse toggle at bottom */}
      {onToggle && collapsed && (
        <button onClick={onToggle} className="p-2 border-t border-white/[0.06] flex items-center justify-center text-gray-600 hover:text-gray-400 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
