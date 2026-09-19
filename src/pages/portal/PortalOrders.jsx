import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, ChevronRight, Calendar, CheckCircle2, Film, Clock, AlertCircle, Plus, FileText, Send } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import ProgressBar from '../../components/ui/ProgressBar';
import StatusBadge from '../../components/ui/StatusBadge';
import { getStatusLabel } from '../../utils/constants';

const PortalOrders = () => {
  const [orders, setOrders] = useState([]);
  const [orderRequests, setOrderRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchOrders();
    fetchOrderRequests();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      setOrders(res.data || []);
    } catch (error) {
      showToast('Failed to load your orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderRequests = async () => {
    try {
      setRequestsLoading(true);
      const res = await api.get('/order-requests');
      setOrderRequests(res.data || []);
    } catch (error) {
      // Silently fail — order requests feature may not be available
      console.error('Failed to load order requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const getRequestStatusColor = (status) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      UNDER_REVIEW: 'bg-blue-100 text-blue-700 border-blue-200',
      CHANGES_REQUESTED: 'bg-orange-100 text-orange-700 border-orange-200',
      APPROVED: 'bg-green-100 text-green-700 border-green-200',
      REJECTED: 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getRequestStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle2 size={14} />;
      case 'REJECTED': return <AlertCircle size={14} />;
      case 'CHANGES_REQUESTED': return <AlertCircle size={14} />;
      case 'UNDER_REVIEW': return <Clock size={14} />;
      default: return <Clock size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Packages & Orders</h1>
          <p className="text-gray-500 text-xs mt-0.5">Track production progress, quotas, and milestone deliveries</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
            {orders.length} Active {orders.length === 1 ? 'Package' : 'Packages'}
          </div>
          <Link
            to="/portal/orders/request"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            <Plus size={14} />
            Request New Order
          </Link>
        </div>
      </div>

      {/* Order Requests Section */}
      {orderRequests.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Send size={16} className="text-amber-600" />
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">My Order Requests</h2>
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {orderRequests.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {orderRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => navigate(`/portal/orders/requests/${req.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 group-hover:text-amber-600 transition-colors truncate">
                      {req.campaignName}
                    </h3>
                    <p className="text-[11px] text-gray-400 font-mono mt-0.5">
                      #{req.id?.substring(0, 8).toUpperCase()}
                    </p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border flex items-center gap-1 whitespace-nowrap ${getRequestStatusColor(req.status)}`}>
                    {getRequestStatusIcon(req.status)}
                    {getStatusLabel(req.status)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <Package size={12} />
                    {req.packageName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Film size={12} />
                    {req.videoCount} videos
                  </span>
                </div>
                {req.status === 'CHANGES_REQUESTED' && req.adminNotes && (
                  <div className="mt-2 p-2 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="text-[10px] text-orange-700 font-medium line-clamp-2">
                      ⚠️ {req.adminNotes}
                    </p>
                  </div>
                )}
                {req.status === 'APPROVED' && req.createdOrderId && (
                  <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-[10px] text-green-700 font-medium">
                      ✓ Order created — click to view
                    </p>
                  </div>
                )}
                <div className="mt-2 text-[10px] text-gray-400">
                  Submitted {formatDate(req.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Orders Section */}
      {orders.length === 0 && orderRequests.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <Package size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No active orders</h3>
          <p className="text-gray-500 text-xs mt-1 max-w-md">
            Ready to start a new campaign? Submit an order request and our team will get back to you.
          </p>
          <Link
            to="/portal/orders/request"
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-colors"
          >
            <Plus size={14} />
            Request Your First Order
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <Package size={16} className="text-gray-600" />
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider">Active Orders</h2>
            </div>
          )}
          {orders.map((order) => {
            const totalCount = order.videoCount || 0;
            const completedCount = order.completedCount || 0;
            const deliveredCount = order.deliveredCount || 0;
            const remainingCount = Math.max(0, totalCount - deliveredCount);
            const total = parseFloat(order.totalAmount || order.pricing || 0);
            const received = parseFloat(order.amountReceived || 0);
            const balance = parseFloat(order.outstandingBalance ?? (total - received));
            const progressPercent = totalCount > 0 ? Math.round((deliveredCount / totalCount) * 100) : 0;

            return (
              <div
                key={order.id}
                onClick={() => navigate(`/portal/orders/${order.id}`)}
                className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-6 hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-lg border border-amber-200 flex-shrink-0">
                      <Package className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-gray-900 group-hover:text-amber-600 transition-colors">
                        {order.packageName || 'UGC Package'}
                      </h2>
                      <p className="text-xs text-gray-400 font-mono">
                        Order #{order.id?.substring(0, 8)} • Started {formatDate(order.startDate || order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} type="order" />
                    <button className="px-3 py-1.5 rounded-lg bg-gray-100 group-hover:bg-amber-500 group-hover:text-white text-gray-700 text-xs font-semibold transition-colors flex items-center gap-1">
                      View Order <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Body Content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-5">
                  {/* Quota & Progress */}
                  <div className="md:col-span-2 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                      <span>Production Delivery Progress</span>
                      <span className="text-amber-600">{deliveredCount} of {totalCount} Videos Delivered ({progressPercent}%)</span>
                    </div>
                    <ProgressBar value={deliveredCount} max={totalCount} />

                    <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
                      <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                        <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Ordered</p>
                        <p className="text-base font-black text-gray-900 mt-0.5">{totalCount}</p>
                      </div>
                      <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-100">
                        <p className="text-emerald-700 text-[10px] uppercase font-bold tracking-wider">Completed</p>
                        <p className="text-base font-black text-emerald-700 mt-0.5">{completedCount}</p>
                      </div>
                      <div className="bg-indigo-50 p-2.5 rounded-xl border border-indigo-100">
                        <p className="text-indigo-700 text-[10px] uppercase font-bold tracking-wider">Delivered</p>
                        <p className="text-base font-black text-indigo-700 mt-0.5">{deliveredCount}</p>
                      </div>
                      <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-100">
                        <p className="text-amber-700 text-[10px] uppercase font-bold tracking-wider">Remaining</p>
                        <p className="text-base font-black text-amber-700 mt-0.5">{remainingCount}</p>
                      </div>
                    </div>
                  </div>

                  {/* Financials & Dates */}
                  <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200/70 flex flex-col justify-between text-xs space-y-2">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="text-gray-500 font-medium">Contract Value</span>
                      <span className="font-bold text-gray-900 text-sm">{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="text-gray-500 font-medium">Paid to Date</span>
                      <span className="font-bold text-emerald-600">{formatCurrency(received)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                      <span className="text-gray-500 font-medium">Outstanding</span>
                      <span className="font-bold text-amber-600">{formatCurrency(balance)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 text-[11px] text-gray-500">
                      <span className="flex items-center gap-1"><Calendar size={12} /> Target Delivery</span>
                      <span className="font-semibold text-gray-800">{formatDate(order.dueDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PortalOrders;
