import React, { useState, useEffect } from 'react';
import { Bell, FileText, Camera, Video, CreditCard, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
// Assuming formatRelative or similar in formatters, falling back to simple date if not
import { formatDate } from '../../utils/formatters';

const getIcon = (type) => {
  switch (type) {
    case 'ORDER': return <FileText className="text-blue-500" />;
    case 'VIDEO': return <Video className="text-purple-500" />;
    case 'PAYMENT': return <CreditCard className="text-green-500" />;
    case 'SUPPORT': return <AlertTriangle className="text-red-500" />;
    case 'SYSTEM': return <Bell className="text-amber-500" />;
    default: return <Bell className="text-gray-500" />;
  }
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (error) {
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => (n.id === id || n._id === id) ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark read', error);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      showToast('All notifications marked as read', 'success');
    } catch (error) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
              {unreadCount} unread
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-amber-600 font-medium transition-colors"
          >
            <CheckCircle2 size={16} />
            Mark all as read
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <Bell size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No notifications</h3>
            <p className="text-gray-500 mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => !notif.isRead && markAsRead(notif._id)}
                className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors flex gap-4 ${
                  !notif.isRead ? 'bg-amber-50/30 border-l-4 border-l-amber-500' : 'bg-white border-l-4 border-l-transparent'
                }`}
              >
                <div className="mt-1">
                  <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100">
                    {getIcon(notif.type)}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-medium ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                      {formatDate(notif.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm ${!notif.isRead ? 'text-gray-800' : 'text-gray-500'}`}>
                    {notif.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
