import React, { useState, useEffect } from 'react';
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, Users, Video, TrendingUp, CreditCard, Activity } from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';

const COLORS = ['#F59E0B', '#3B82F6', '#10B981', '#EF4444', '#8B5CF6'];

const ReportsPage = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    kpis: { revenue: 0, expenses: 0, netProfit: 0, totalClients: 0, totalVideos: 0, avgOrderValue: 0 },
    revenueTrend: [],
    expensesByCategory: [],
    videoDelivery: [],
    clientAcquisition: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // In a real app, these would come from specialized reporting endpoints
      // Mocking data for visual demonstration
      setData({
        kpis: {
          revenue: 1250000,
          expenses: 450000,
          netProfit: 800000,
          totalClients: 42,
          totalVideos: 350,
          avgOrderValue: 45000
        },
        revenueTrend: [
          { name: 'Jan', revenue: 40000 },
          { name: 'Feb', revenue: 60000 },
          { name: 'Mar', revenue: 120000 },
          { name: 'Apr', revenue: 180000 },
          { name: 'May', revenue: 250000 },
          { name: 'Jun', revenue: 320000 }
        ],
        expensesByCategory: [
          { name: 'Salaries', value: 250000 },
          { name: 'Equipment', value: 100000 },
          { name: 'Payouts', value: 50000 },
          { name: 'Office', value: 30000 },
          { name: 'Misc', value: 20000 }
        ],
        videoDelivery: [
          { name: 'Week 1', completed: 15, targeted: 20 },
          { name: 'Week 2', completed: 25, targeted: 22 },
          { name: 'Week 3', completed: 30, targeted: 30 },
          { name: 'Week 4', completed: 35, targeted: 35 }
        ],
        clientAcquisition: [
          { name: 'Jan', clients: 2 },
          { name: 'Feb', clients: 5 },
          { name: 'Mar', clients: 8 },
          { name: 'Apr', clients: 12 },
          { name: 'May', clients: 18 },
          { name: 'Jun', clients: 25 }
        ]
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const KPICard = ({ title, value, icon: Icon, isCurrency = false, trend }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="bg-amber-100 p-3 rounded-lg text-amber-600">
          <Icon size={24} />
        </div>
        {trend && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">
          {isCurrency ? formatCurrency(value) : value}
        </p>
      </div>
    </div>
  );

  if (loading) return <div className="p-8 text-center text-gray-500">Loading reports...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Business performance overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <KPICard title="Total Revenue" value={data.kpis.revenue} icon={IndianRupee} isCurrency trend="+12%" />
        <KPICard title="Total Expenses" value={data.kpis.expenses} icon={CreditCard} isCurrency />
        <KPICard title="Net Profit" value={data.kpis.netProfit} icon={TrendingUp} isCurrency trend="+18%" />
        <KPICard title="Total Clients" value={data.kpis.totalClients} icon={Users} trend="+5" />
        <KPICard title="Total Videos Delivered" value={data.kpis.totalVideos} icon={Video} trend="+32" />
        <KPICard title="Avg. Order Value" value={data.kpis.avgOrderValue} icon={Activity} isCurrency />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.revenueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#F59E0B" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Expenses by Category</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.expensesByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {data.expensesByCategory.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name}
              </div>
            ))}
          </div>
        </div>

        {/* Video Delivery */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Video Delivery Rate</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.videoDelivery} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="targeted" fill="#E5E7EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Client Acquisition */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Client Acquisition</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.clientAcquisition} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="clients" stroke="#3B82F6" strokeWidth={3} dot={{r: 4, fill: '#3B82F6'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
