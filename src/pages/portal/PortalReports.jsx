import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, CheckCircle2, Clock, Video, 
  ShoppingBag, Download, Calendar, DollarSign, AlertCircle, 
  ArrowUpRight, Eye, RefreshCw, FileText
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { orderService, videoService, paymentService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Card, Button, Badge } from '../../components/ui';

const STATUS_COLORS = {
  DELIVERED: '#059669', // Emerald 600
  FINAL_APPROVED: '#10B981', // Emerald 500
  CLIENT_REVIEW: '#F59E0B', // Amber 500
  REVISION: '#F97316', // Orange 500
  VIDEO_EDITING: '#8B5CF6', // Purple 500
  INTERNAL_QA: '#EAB308', // Yellow 500
  RAW_FOOTAGE_RECEIVED: '#6366F1', // Indigo 500
  SHOOT_PENDING: '#3B82F6', // Blue 500
  SCRIPT_APPROVED: '#06B6D4', // Cyan 500
  OTHER: '#6B7280' // Gray 500
};

export default function PortalReports() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [videos, setVideos] = useState([]);
  const [payments, setPayments] = useState([]);
  const [dateFilter, setDateFilter] = useState('ALL'); // ALL, 30D, 90D, YTD

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [ordersRes, videosRes, paymentsRes] = await Promise.all([
        orderService.getAll(),
        videoService.getAll(),
        paymentService.getAll()
      ]);

      setOrders(ordersRes?.data || ordersRes || []);
      setVideos(videosRes?.data || videosRes || []);
      setPayments(paymentsRes?.data || paymentsRes || []);
    } catch (err) {
      console.error('Failed to load portal reports data:', err);
      showToast('Failed to load report analytics', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter items by selected date range
  const filterByDate = (dateStr) => {
    if (dateFilter === 'ALL' || !dateStr) return true;
    const date = new Date(dateStr);
    const now = new Date();
    if (dateFilter === '30D') {
      const cutoff = new Date();
      cutoff.setDate(now.getDate() - 30);
      return date >= cutoff;
    }
    if (dateFilter === '90D') {
      const cutoff = new Date();
      cutoff.setDate(now.getDate() - 90);
      return date >= cutoff;
    }
    if (dateFilter === 'YTD') {
      const cutoff = new Date(now.getFullYear(), 0, 1);
      return date >= cutoff;
    }
    return true;
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => filterByDate(o.createdAt));
  }, [orders, dateFilter]);

  const filteredVideos = useMemo(() => {
    return videos.filter(v => filterByDate(v.createdAt));
  }, [videos, dateFilter]);

  const filteredPayments = useMemo(() => {
    return payments.filter(p => filterByDate(p.paymentDate || p.createdAt));
  }, [payments, dateFilter]);

  // Aggregate Metrics
  const totalContractedVideos = filteredOrders.reduce((sum, o) => sum + (o.videoCount || 0), 0) || filteredVideos.length;
  const totalDeliveredVideos = filteredVideos.filter(v => v.status === 'DELIVERED').length;
  const totalApprovedVideos = filteredVideos.filter(v => v.status === 'FINAL_APPROVED' || v.status === 'DELIVERED').length;
  const awaitingClientReview = filteredVideos.filter(v => v.status === 'CLIENT_REVIEW').length;
  const inProduction = filteredVideos.filter(v => !['FINAL_APPROVED', 'DELIVERED'].includes(v.status)).length;
  const completionRate = totalContractedVideos > 0 
    ? Math.min(100, Math.round((totalDeliveredVideos / totalContractedVideos) * 100)) 
    : 0;

  // Financial Summary (Client Perspective Only)
  const totalInvoiced = filteredPayments.reduce((acc, curr) => acc + parseFloat(curr.invoiceAmount || curr.amount || 0), 0) ||
    filteredOrders.reduce((acc, curr) => acc + parseFloat(curr.totalAmount || curr.pricing || 0), 0);
  const totalPaid = filteredPayments.reduce((acc, curr) => acc + parseFloat(curr.amountReceived || curr.received || 0), 0) ||
    filteredOrders.reduce((acc, curr) => acc + parseFloat(curr.amountReceived || 0), 0);
  const totalOutstanding = Math.max(0, totalInvoiced - totalPaid);

  // Chart Data: Status Distribution
  const statusCounts = filteredVideos.reduce((acc, v) => {
    const s = v.status || 'OTHER';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusCounts).map(([status, count]) => {
    const formatted = status.replace(/_/g, ' ').toLowerCase()
      .replace(/\b\w/g, l => l.toUpperCase());
    return {
      name: formatted,
      statusKey: status,
      value: count,
      color: STATUS_COLORS[status] || STATUS_COLORS.OTHER
    };
  });

  // Chart Data: Orders Fulfillment Bar Chart
  const orderProgressData = filteredOrders.map(o => {
    const pkgName = (o.packageName || 'Campaign').length > 15 
      ? (o.packageName || 'Campaign').substring(0, 15) + '...' 
      : (o.packageName || 'Campaign');
    const contracted = o.videoCount || 0;
    const delivered = o.deliveredCount || 0;
    return {
      name: pkgName,
      Contracted: contracted,
      Delivered: delivered,
      Remaining: Math.max(0, contracted - delivered)
    };
  }).slice(0, 6);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (filteredOrders.length === 0 && filteredVideos.length === 0) {
      showToast('No report data available to export', 'info');
      return;
    }

    const headers = ['Order / Campaign', 'Video Count', 'Delivered', 'Pending', 'Status', 'Total Price', 'Paid', 'Outstanding'];
    const rows = filteredOrders.map(o => {
      const contracted = o.videoCount || 0;
      const delivered = o.deliveredCount || 0;
      const total = o.totalAmount || o.pricing || 0;
      const paid = o.amountReceived || 0;
      const balance = Math.max(0, total - paid);
      return [
        `"${(o.packageName || 'UGC Campaign').replace(/"/g, '""')}"`,
        contracted,
        delivered,
        Math.max(0, contracted - delivered),
        o.status,
        total,
        paid,
        balance
      ];
    });

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Leadyfy_Client_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report downloaded successfully', 'success');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-pulse">
        <div className="h-16 bg-gray-200 rounded-xl w-1/3" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-100 rounded-xl" />
          <div className="h-80 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-gray-900">Reports & Analytics</h1>
            <Badge className="bg-amber-100 text-amber-800 border border-amber-300">Client Insights</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time delivery velocity, fulfillment rates, and milestone invoice summaries for {user?.clientProfile?.companyName || user?.name || 'your brand'}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs">
            {['ALL', '30D', '90D', 'YTD'].map(filter => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                  dateFilter === filter
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {filter === 'ALL' ? 'All Time' : filter === '30D' ? '30 Days' : filter === '90D' ? '90 Days' : 'YTD'}
              </button>
            ))}
          </div>

          <Button
            onClick={fetchReportData}
            variant="outline"
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900"
            title="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>

          <Button
            onClick={handleExportCSV}
            className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 text-xs font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5" /> Export Report
          </Button>
        </div>
      </div>

      {/* Top High-Impact KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Contracted Videos</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{totalContractedVideos}</span>
            <span className="text-xs text-gray-400">across {filteredOrders.length} packages</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-gray-500 mb-1">
              <span>Overall Delivery Progress</span>
              <span className="font-bold text-gray-700">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${completionRate}%` }} 
              />
            </div>
          </div>
        </Card>

        <Card className="p-5 border border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Delivered Assets</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600">{totalDeliveredVideos}</span>
            <span className="text-xs text-gray-400">ready to use</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-3 flex items-center gap-1">
            <span className="font-semibold text-gray-700">{totalApprovedVideos}</span> videos approved or delivered
          </p>
        </Card>

        <Card className="p-5 border border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Action Required</span>
            <div className={`p-2 rounded-lg ${awaitingClientReview > 0 ? 'bg-amber-50 text-amber-600 animate-pulse' : 'bg-gray-50 text-gray-400'}`}>
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl font-black ${awaitingClientReview > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
              {awaitingClientReview}
            </span>
            <span className="text-xs text-gray-400">in Client Review</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-3">
            {awaitingClientReview > 0 
              ? 'Videos waiting on your review & feedback' 
              : 'All review queues are cleared'}
          </p>
        </Card>

        <Card className="p-5 border border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Invoiced Total</span>
            <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{formatCurrency(totalInvoiced)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-emerald-600 font-semibold">{formatCurrency(totalPaid)} paid</span>
            <span className="text-amber-600 font-semibold">{formatCurrency(totalOutstanding)} pending</span>
          </div>
        </Card>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Video Status Breakdown */}
        <Card className="p-6 border border-gray-200 bg-white flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Video Status Distribution</h2>
              <p className="text-xs text-gray-500">Live breakdown of all videos across production stages</p>
            </div>
            <Badge className="bg-gray-100 text-gray-600 border border-gray-200">
              {filteredVideos.length} Total Videos
            </Badge>
          </div>

          {filteredVideos.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8 text-gray-400 text-xs">
              No video asset records found for this period.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val, name) => [`${val} Videos`, name]}
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* Right: Order Fulfillment Comparison */}
        <Card className="p-6 border border-gray-200 bg-white flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Campaign Delivery Progress</h2>
              <p className="text-xs text-gray-500">Contracted quota vs delivered deliverables per package</p>
            </div>
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200">
              Fulfillment
            </Badge>
          </div>

          {orderProgressData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center p-8 text-gray-400 text-xs">
              No active or historical campaigns recorded.
            </div>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Delivered" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Remaining" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      {/* Campaign Details Table */}
      <Card className="p-0 overflow-hidden border border-gray-200 bg-white">
        <div className="p-4 sm:px-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700">Campaign Fulfillment Ledger</h2>
            <p className="text-[11px] text-gray-400">Detailed delivery and financial pacing across ordered packages</p>
          </div>
          <span className="text-xs font-semibold text-gray-500 bg-white px-2.5 py-1 rounded border border-gray-200">
            {filteredOrders.length} Campaigns
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-6">Campaign / Package</th>
                <th className="py-3 px-4 text-center">Contracted</th>
                <th className="py-3 px-4 text-center">Delivered</th>
                <th className="py-3 px-6">Fulfillment Pacing</th>
                <th className="py-3 px-4 text-right">Package Investment</th>
                <th className="py-3 px-4 text-right">Pending Balance</th>
                <th className="py-3 px-6 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    No campaign records available.
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => {
                  const count = order.videoCount || 0;
                  const delivered = order.deliveredCount || 0;
                  const pct = count > 0 ? Math.min(100, Math.round((delivered / count) * 100)) : 0;
                  const total = order.totalAmount || order.pricing || 0;
                  const balance = order.outstandingBalance ?? Math.max(0, total - (order.amountReceived || 0));

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-gray-900">
                        <div>
                          <span>{order.packageName || 'UGC Package'}</span>
                          <span className="block text-[11px] font-normal text-gray-400">
                            Ordered: {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-gray-700">
                        {count}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600">
                        {delivered}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                pct === 100 ? 'bg-emerald-500' : pct > 50 ? 'bg-amber-500' : 'bg-blue-500'
                              }`} 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                          <span className="text-[11px] font-bold text-gray-600 min-w-[32px]">{pct}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-gray-900">
                        {formatCurrency(total)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold">
                        <span className={balance > 0 ? 'text-amber-600' : 'text-gray-400'}>
                          {formatCurrency(balance)}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-center">
                        <Badge className={`capitalize ${
                          order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status?.toLowerCase().replace(/_/g, ' ')}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
