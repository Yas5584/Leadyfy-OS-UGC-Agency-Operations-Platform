import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, FileText, Camera, Video, CreditCard, AlertTriangle, 
  CheckCircle2, ArrowUpRight, CheckCheck, Clock 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { formatRelative, formatDateTime } from '../../utils/formatters';
import { Card, Button, Badge, Skeleton } from '../../components/ui';

const getNotificationIcon = (type) => {
  switch (type) {
    case 'CLIENT_ONBOARDING': return <FileText className="w-4 h-4 text-blue-600" />;
    case 'SCRIPT_ASSIGNED': 
    case 'SCRIPT_REVISION': return <FileText className="w-4 h-4 text-amber-600" />;
    case 'SHOOT_REMINDER': return <Camera className="w-4 h-4 text-purple-600" />;
    case 'VIDEO_ASSIGNED':
    case 'VIDEO_REVISION':
    case 'FINAL_APPROVED': return <Video className="w-4 h-4 text-indigo-600" />;
    case 'PAYMENT_RECORDED':
    case 'OVERDUE_INVOICE': return <CreditCard className="w-4 h-4 text-emerald-600" />;
    case 'SUPPORT': return <AlertTriangle className="w-4 h-4 text-rose-600" />;
    default: return <Bell className="w-4 h-4 text-amber-500" />;
  }
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'unread'
  const { showToast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      const list = res?.data || (Array.isArray(res) ? res : []);
      setNotifications(list);
    } catch (error) {
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all').catch(async () => {
        // Fallback: mark each unread individually
        const unreads = notifications.filter(n => !n.isRead);
        await Promise.all(unreads.map(u => api.patch(`/notifications/${u.id}/read`)));
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      showToast('All notifications marked as read', 'success');
    } catch (error) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.isRead) {
      markAsRead(notif.id);
    }

    // Deep link based on notification type and entityId
    if (notif.type?.includes('SCRIPT')) {
      navigate('/scripts');
    } else if (notif.type?.includes('SHOOT')) {
      navigate('/shoots');
    } else if (notif.type?.includes('VIDEO')) {
      navigate('/videos');
    } else if (notif.type?.includes('PAYMENT') || notif.type?.includes('INVOICE')) {
      navigate('/payments');
    } else if (notif.type?.includes('CLIENT') && notif.entityId) {
      navigate(`/clients/${notif.entityId}`);
    } else if (notif.type?.includes('CLIENT')) {
      navigate('/clients');
    } else if (notif.type?.includes('SUPPORT')) {
      navigate('/support');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const displayedNotifications = filterTab === 'unread' 
    ? notifications.filter(n => !n.isRead)
    : notifications;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-[#111111]">Notifications</h1>
            {unreadCount > 0 && (
              <Badge className="bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                {unreadCount} Unread
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time system alerts triggered across script approvals, call times, editor assignments, and billing
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            className="flex items-center gap-1.5 text-xs text-gray-700 hover:text-amber-600"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark All as Read
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterTab === 'all'
              ? 'bg-[#111111] text-white shadow-2xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilterTab('unread')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterTab === 'unread'
              ? 'bg-amber-500 text-white shadow-2xs'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Unread Only ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : displayedNotifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="bg-amber-50 p-4 rounded-full mb-3 text-amber-500">
              <Bell size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              {filterTab === 'unread' ? 'No unread notifications' : 'No notifications'}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              You are completely up to date with all operational pipelines.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {displayedNotifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 hover:bg-gray-50/80 cursor-pointer transition-colors flex items-start gap-3.5 group ${
                  !notif.isRead ? 'bg-amber-50/20 border-l-4 border-l-amber-500' : 'bg-white border-l-4 border-l-transparent'
                }`}
              >
                <div className="mt-0.5">
                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 group-hover:scale-105 transition-transform">
                    {getNotificationIcon(notif.type)}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-xs font-bold ${!notif.isRead ? 'text-gray-900 font-black' : 'text-gray-800'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap ml-3 font-mono">
                      {formatRelative(notif.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notif.isRead && (
                    <button
                      onClick={(e) => markAsRead(notif.id, e)}
                      className="p-1 text-gray-400 hover:text-amber-600 rounded text-xs"
                      title="Mark Read"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
