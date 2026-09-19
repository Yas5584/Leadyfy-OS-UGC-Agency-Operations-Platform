import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Video, CheckCircle, Clock, Send, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/formatters';


const PortalDashboard = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeOrders: 0,
    videosOrdered: 0,
    videosCompleted: 0,
    awaitingReview: 0,
    videosDelivered: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Mocked endpoints, ideally backend has a /portal/dashboard endpoint
      const [ordersRes, videosRes] = await Promise.all([
        api.get('/orders'),
        api.get('/videos')
      ]);

      const orders = ordersRes.data || [];
      const videos = videosRes.data || [];

      // Calculate stats accurately from database records
      const activeOrders = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED').length;
      const videosOrdered = orders.reduce((sum, o) => sum + (o.videoCount || 0), 0) || videos.length;
      const videosCompleted = videos.filter(v => v.status === 'FINAL_APPROVED' || v.status === 'DELIVERED').length;
      const awaitingReview = videos.filter(v => v.status === 'CLIENT_REVIEW').length;
      const videosDelivered = videos.filter(v => v.status === 'DELIVERED').length;

      setStats({
        activeOrders,
        videosOrdered,
        videosCompleted,
        awaitingReview,
        videosDelivered
      });

      setRecentOrders(orders.slice(0, 5));
      setRecentVideos(videos.slice(0, 5));

    } catch (error) {
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const KPICard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
      <div className={`p-3.5 rounded-xl ${colorClass}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{title}</p>
        <p className="text-2xl font-black text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-32 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-800 rounded-2xl p-8 text-white shadow-md border border-gray-800">
        <h1 className="text-3xl font-black mb-2 tracking-tight">Welcome back, {user?.name || 'Client'}! 👋</h1>
        <p className="text-gray-300 text-sm">Here's what's happening with your UGC production & deliverables today.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KPICard title="Active Orders" value={stats.activeOrders} icon={Package} colorClass="bg-blue-50 text-blue-600 border border-blue-100" />
        <KPICard title="Videos Ordered" value={stats.videosOrdered} icon={Video} colorClass="bg-purple-50 text-purple-600 border border-purple-100" />
        <KPICard title="Awaiting Review" value={stats.awaitingReview} icon={Clock} colorClass="bg-amber-50 text-amber-600 border border-amber-100" />
        <KPICard title="Completed" value={stats.videosCompleted} icon={CheckCircle} colorClass="bg-emerald-50 text-emerald-600 border border-emerald-100" />
        <KPICard title="Delivered" value={stats.videosDelivered} icon={Send} colorClass="bg-indigo-50 text-indigo-600 border border-indigo-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">Recent Orders</h2>
            <Link to="/portal/orders" className="text-amber-600 hover:text-amber-700 text-xs font-semibold flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-100 flex-1">
            {recentOrders.length === 0 ? (
              <p className="p-8 text-gray-400 text-xs text-center">No orders found.</p>
            ) : (
              recentOrders.map(order => {
                const total = order.totalAmount || order.pricing || 0;
                const balance = order.outstandingBalance ?? (total - (order.amountReceived || 0));
                const delivered = order.deliveredCount || 0;
                const count = order.videoCount || 0;
                return (
                  <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
                    <div>
                      <Link to={`/portal/orders/${order.id}`} className="font-bold text-gray-900 hover:text-amber-600 transition-colors text-sm">
                        {order.packageName || 'UGC Package'}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {count} Videos • {delivered}/{count} delivered
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(total)}</p>
                        <p className="text-[11px] font-medium text-amber-600">
                          {formatCurrency(balance)} outstanding
                        </p>
                      </div>
                      <Link
                        to={`/portal/orders/${order.id}`}
                        className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-amber-500 hover:text-white text-gray-700 text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        View Order
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Videos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">Recent Videos</h2>
            <Link to="/portal/videos" className="text-amber-600 hover:text-amber-700 text-xs font-semibold flex items-center gap-1">
              View All <ChevronRight size={14} />
            </Link>
          </div>
          <div className="divide-y divide-gray-100 flex-1">
            {recentVideos.length === 0 ? (
              <p className="p-8 text-gray-400 text-xs text-center">No videos found.</p>
            ) : (
              recentVideos.map(video => (
                <div key={video.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 flex-shrink-0">
                      <Video size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-sm truncate">
                        {video.title || `Video #${video.videoNumber}`}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {video.order?.packageName || 'UGC Package'} • Due {formatDate(video.deadline)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      video.status === 'CLIENT_REVIEW' ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse' :
                      video.status === 'FINAL_APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      video.status === 'DELIVERED' ? 'bg-indigo-100 text-indigo-800' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {video.status === 'CLIENT_REVIEW' ? 'ACTION NEEDED' : video.status}
                    </span>
                    <Link
                      to={`/portal/videos/${video.id}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        video.status === 'CLIENT_REVIEW'
                          ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {video.status === 'CLIENT_REVIEW' ? 'Review Video' : 'Details'}
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortalDashboard;
