import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingCart, 
  Video, 
  CheckSquare, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Calendar,
  AlertCircle,
  Clock,
  Activity,
  FileText,
  Film,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, formatRelative } from '../../utils/formatters';
import { getStatusLabel } from '../../utils/constants';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard');
        // Handle both { data: { ... } } and direct payload formats safely
        const payload = res?.data?.data || res?.data || res;
        setData(payload);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center p-8">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-500 border-t-transparent"></div>
          <p className="text-sm text-gray-500 font-medium">Loading agency metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-96 items-center justify-center p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center max-w-md">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-500" />
          <h3 className="mb-1 text-base font-bold text-red-900">Dashboard Unavailable</h3>
          <p className="text-xs text-red-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const isAdminOrOwner = user?.role === 'ADMIN' || user?.role === 'OWNER';
  const PIE_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6'];

  const revenueNum = parseFloat(data.revenue || 0);
  const expensesNum = parseFloat(data.expenses || 0);
  const payoutsNum = parseFloat(data.payouts || 0);
  const netProfitNum = parseFloat(data.netProfit || (revenueNum - expensesNum - payoutsNum));
  const receivablesNum = parseFloat(data.pendingInvoices || 0);

  const totalPipelineVideos = data.charts?.videoPipeline?.reduce((acc, curr) => acc + (curr.count || 0), 0) || 0;
  const pipelineData = data.charts?.videoPipeline?.map((entry, index) => ({
    ...entry,
    displayName: getStatusLabel(entry.status),
    color: PIE_COLORS[index % PIE_COLORS.length],
    percent: totalPipelineVideos > 0 ? Math.round((entry.count / totalPipelineVideos) * 100) : 0
  })) || [];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#111111] tracking-tight">
            {getGreeting()}, {user?.name || 'Director'}
          </h1>
          <p className="mt-0.5 text-xs text-gray-500 font-medium">Agency operations overview & live performance</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Systems Active
          </span>
        </div>
      </div>

      {/* Primary Operational KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Clients</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-gray-900">{data.totalActiveClients || 0}</p>
          <p className="text-[11px] text-gray-500 mt-1">{data.newClients || 0} onboarded recently</p>
        </div>

        <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Orders</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-gray-900">{data.activeOrders || 0}</p>
          <p className="text-[11px] text-gray-500 mt-1">{data.pendingScripts || 0} scripts in review</p>
        </div>

        <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">In Production</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Video className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-gray-900">{data.videosInProduction || 0}</p>
          <p className="text-[11px] text-gray-500 mt-1">{data.upcomingShoots || 0} shoots queued</p>
        </div>

        <div className="rounded-xl border border-gray-200/80 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Approvals Due</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-gray-900">{data.pendingApprovals || 0}</p>
          <p className="text-[11px] text-gray-500 mt-1">{data.deliveredVideos || 0} videos delivered</p>
        </div>
      </div>

      {/* Financial KPIs (Owner / Admin) */}
      {isAdminOrOwner && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Gross Revenue</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-emerald-700">{formatCurrency(revenueNum)}</p>
            <p className="text-[11px] text-emerald-600 mt-1">Total collections</p>
          </div>

          <div className="rounded-xl border border-red-100 bg-red-50/40 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-700">Agency Expenses</span>
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-red-700">{formatCurrency(expensesNum)}</p>
            <p className="text-[11px] text-red-600 mt-1">Operational overhead</p>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Creator Payouts</span>
              <CreditCard className="w-4 h-4 text-amber-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-amber-700">{formatCurrency(payoutsNum)}</p>
            <p className="text-[11px] text-amber-600 mt-1">Disbursed talent fees</p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">Net Profit</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <p className="mt-2 text-2xl font-black text-blue-700">{formatCurrency(netProfitNum)}</p>
            <p className="text-[11px] text-blue-600 mt-1">
              Receivables: {formatCurrency(receivablesNum)}
            </p>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue vs Expenses */}
        {isAdminOrOwner && (
          <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Revenue vs Expenses</h3>
                <p className="text-xs text-gray-500">Monthly cashflow distribution</p>
              </div>
            </div>
            <div className="h-64 w-full">
              {data.revenueVsExpenses?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.revenueVsExpenses} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#6b7280', fontSize: 11 }}
                      tickFormatter={(value) => `₹${value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}`}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(value)}
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                    <Bar dataKey="revenue" name="Revenue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Expenses" fill="#9ca3af" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-gray-400">
                  No monthly cashflow data logged yet
                </div>
              )}
            </div>
          </div>
        )}

        {/* Video Production Pipeline Breakdown */}
        <div className={`rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm flex flex-col justify-between ${!isAdminOrOwner ? 'lg:col-span-2' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Video Pipeline Breakdown</h3>
              <p className="text-xs text-gray-500">Active reels & videos across pipeline stages</p>
            </div>
            {totalPipelineVideos > 0 && (
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full border border-gray-200">
                {totalPipelineVideos} {totalPipelineVideos === 1 ? 'Video' : 'Videos'}
              </span>
            )}
          </div>

          {pipelineData.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-6 my-auto pt-2">
              {/* Donut Chart with Centered Total */}
              <div className="h-52 w-52 flex-shrink-0 relative mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pipelineData}
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={82}
                      paddingAngle={3}
                      dataKey="count"
                      nameKey="displayName"
                    >
                      {pipelineData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value, name) => [`${value} Videos`, name]}
                      contentStyle={{ borderRadius: '0.5rem', border: '1px solid #e2e8f0', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-gray-900">{totalPipelineVideos}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Active</span>
                </div>
              </div>

              {/* Clean Legend Grid with human-readable names, counts, and % */}
              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-2">
                {pipelineData.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between p-2 rounded-lg bg-gray-50/70 border border-gray-100 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-700 font-semibold truncate" title={item.displayName}>
                        {item.displayName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-mono text-xs whitespace-nowrap">
                      <span className="font-bold text-gray-900">{item.count}</span>
                      <span className="text-gray-400 text-[11px]">({item.percent}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-xs text-gray-400">
              No pipeline data available
            </div>
          )}
        </div>
      </div>
      {/* Needs Attention Section */}
      {(() => {
        const attentionItems = [];
        if ((data.pendingApprovals || 0) > 0) {
          attentionItems.push({ icon: Film, label: `${data.pendingApprovals} Video${data.pendingApprovals > 1 ? 's' : ''} Awaiting Client Review`, link: '/videos', color: 'text-amber-600 bg-amber-50' });
        }
        if ((data.pendingScripts || 0) > 0) {
          attentionItems.push({ icon: FileText, label: `${data.pendingScripts} Script${data.pendingScripts > 1 ? 's' : ''} In Review Pipeline`, link: '/scripts', color: 'text-blue-600 bg-blue-50' });
        }
        if ((data.upcomingShoots || 0) > 0) {
          attentionItems.push({ icon: Calendar, label: `${data.upcomingShoots} Shoot${data.upcomingShoots > 1 ? 's' : ''} Scheduled Soon`, link: '/shoots', color: 'text-purple-600 bg-purple-50' });
        }
        if (isAdminOrOwner && receivablesNum > 0) {
          attentionItems.push({ icon: CreditCard, label: `${formatCurrency(receivablesNum)} Outstanding Receivables`, link: '/payments', color: 'text-red-600 bg-red-50' });
        }
        if (attentionItems.length === 0) return null;
        return (
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/30 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-gray-900">Needs Attention</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {attentionItems.map((item, idx) => (
                <a
                  key={idx}
                  href={item.link}
                  className="flex items-center gap-3 rounded-lg border border-gray-200/80 bg-white p-3 hover:shadow-md transition-all group"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-gray-800 line-clamp-2">{item.label}</p>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-amber-500 transition-colors flex-shrink-0" />
                </a>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Operational Widgets Strip */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Today's Shoots */}
        <div className="rounded-xl border border-gray-200/80 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-gray-100 px-5 py-3.5 bg-gray-50/50">
            <h3 className="flex items-center text-xs font-bold uppercase tracking-wider text-gray-700">
              <Calendar className="mr-2 h-4 w-4 text-amber-500" />
              Upcoming Shoots ({data.widgets?.todayShoots?.length || 0})
            </h3>
          </div>
          <div className="p-4 flex-1">
            {data.widgets?.todayShoots?.length > 0 ? (
              <ul className="space-y-3">
                {data.widgets.todayShoots.slice(0, 5).map((shoot, idx) => (
                  <li key={idx} className="flex items-start justify-between text-xs border-b border-gray-50 pb-2.5 last:border-0 last:pb-0">
                    <div>
                      <p className="font-bold text-gray-900">{shoot.client?.companyName || 'Client'}</p>
                      <p className="text-gray-400 mt-0.5">
                        Creator: {shoot.creator?.name || 'Pending'}
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {formatDate(shoot.date)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400 py-6 text-center">No shoots scheduled for today.</p>
            )}
          </div>
        </div>

        {/* Urgent Tasks */}
        <div className="rounded-xl border border-gray-200/80 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-gray-100 px-5 py-3.5 bg-gray-50/50">
            <h3 className="flex items-center text-xs font-bold uppercase tracking-wider text-gray-700">
              <AlertCircle className="mr-2 h-4 w-4 text-red-500" />
              Urgent Tasks ({data.widgets?.urgentTasks?.length || 0})
            </h3>
          </div>
          <div className="p-4 flex-1">
            {data.widgets?.urgentTasks?.length > 0 ? (
              <ul className="space-y-3">
                {data.widgets.urgentTasks.slice(0, 5).map((task, idx) => (
                  <li key={idx} className="flex items-start justify-between text-xs border-b border-gray-50 pb-2.5 last:border-0 last:pb-0">
                    <div className="pr-2">
                      <p className="font-bold text-gray-900 line-clamp-1">{task.title}</p>
                      <p className="text-gray-400 mt-0.5">
                        {task.assignee?.name || 'Unassigned'} • Due {formatDate(task.deadline)}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 uppercase flex-shrink-0">
                      {task.priority || 'Urgent'}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400 py-6 text-center">No urgent tasks pending.</p>
            )}
          </div>
        </div>

        {/* Recent Activity Audit */}
        <div className="rounded-xl border border-gray-200/80 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-gray-100 px-5 py-3.5 bg-gray-50/50">
            <h3 className="flex items-center text-xs font-bold uppercase tracking-wider text-gray-700">
              <Activity className="mr-2 h-4 w-4 text-blue-500" />
              Live Activity Feed
            </h3>
          </div>
          <div className="p-4 flex-1">
            {data.widgets?.recentActivity?.length > 0 ? (
              <ul className="space-y-3">
                {data.widgets.recentActivity.slice(0, 5).map((activity, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs border-b border-gray-50 pb-2.5 last:border-0 last:pb-0">
                    <Clock className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-800">
                        <span className="font-bold text-gray-900">{activity.user?.name || 'System'}</span>{' '}
                        <span className="text-gray-500">{activity.action}</span>{' '}
                        <span className="font-semibold text-gray-900">{activity.entity}</span>
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{formatRelative(activity.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-400 py-6 text-center">No recent activity.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;