import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Film, Camera, FileText, CreditCard, Calendar, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { orderService } from '../../services/api';
import { formatDateTime, formatDate, formatCurrency } from '../../utils/formatters';
import { Button, Card, StatusBadge, Skeleton, EmptyState, KPICard, ProgressBar, DataTable, Tabs } from '../../components/ui';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Production');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await orderService.getById(id);
        setOrder(res.data);
      } catch (error) {
        showToast('Failed to load order', 'error');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate, showToast]);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!order) return <EmptyState title="Order not found" description="The requested order could not be found." />;

  const amountReceived = parseFloat(order.amountReceived || 0);
  const totalAmount = parseFloat(order.totalAmount || 0);
  const balance = parseFloat(order.outstandingBalance ?? (totalAmount - amountReceived));
  const videoCount = order.videoCount || 0;
  const deliveredCount = order.deliveredCount || 0;
  const completedCount = order.completedCount || 0;
  const assignedCount = order.assignedCount || (order.videos?.length || 0);
  const remainingCount = Math.max(0, videoCount - deliveredCount);
  const progressPercent = videoCount ? Math.min(100, Math.round((deliveredCount / videoCount) * 100)) : 0;

  const tabs = ['Production', 'Videos', 'Scripts', 'Shoots', 'Payments'];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-5">
        <div className="flex items-start sm:items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/orders')} className="mt-1 sm:mt-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-black tracking-tight text-[#111111]">{order.packageName}</h1>
              <StatusBadge status={order.status} type="order" />
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              Client:{' '}
              <Link to={`/clients/${order.clientId}`} className="font-semibold text-amber-600 hover:underline">
                {order.client?.companyName}
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Contract Value" value={formatCurrency(totalAmount)} subtitle="Total Package Cost" />
        <KPICard title="Amount Received" value={formatCurrency(amountReceived)} subtitle="Paid to date" />
        <KPICard
          title="Outstanding"
          value={formatCurrency(balance)}
          subtitle={balance > 0 ? 'Pending collection' : 'Fully settled'}
        />
        <KPICard title="Due Date" value={formatDate(order.dueDate)} subtitle={`Started ${formatDate(order.startDate)}`} />
      </div>

      {/* Production Lifecycle Progress Box */}
      <Card className="p-6 border border-gray-200/80 shadow-sm bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-gray-900">Production Lifecycle & Quota</h2>
            <p className="text-xs text-gray-500">Live delivery metrics tracked against contracted quota</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            {deliveredCount} of {videoCount} Delivered
          </span>
        </div>

        {/* 5-counter strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 text-center mb-5">
          <div className="p-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Ordered</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{videoCount}</p>
          </div>
          <div className="p-2 border-l border-gray-200/60">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Assigned</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{assignedCount}</p>
          </div>
          <div className="p-2 border-l border-gray-200/60">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Completed</p>
            <p className="text-2xl font-black text-purple-600 mt-1">{completedCount}</p>
          </div>
          <div className="p-2 border-l border-gray-200/60">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Delivered</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">{deliveredCount}</p>
          </div>
          <div className="p-2 border-l border-gray-200/60 col-span-2 sm:col-span-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Remaining</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{remainingCount}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-gray-600">
            <span>Overall Order Completion</span>
            <span className="font-bold text-gray-900">{progressPercent}%</span>
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Tabs navigation */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* Tab 1: Production Overview */}
      {activeTab === 'Production' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5 border border-gray-200/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Film className="w-4 h-4 text-amber-500" /> Active Videos ({order.videos?.length || 0})
              </h3>
              <Link to="/videos" className="text-xs font-semibold text-amber-600 hover:underline">
                View All in Kanban →
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {(order.videos || []).slice(0, 5).map((v) => (
                <div key={v.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-900">Video #{v.videoNumber}</span>
                    <span className="text-gray-400 ml-2">
                      {v.editor?.user?.name ? `Editor: ${v.editor.user.name}` : 'Unassigned'}
                    </span>
                  </div>
                  <StatusBadge status={v.status} type="video" />
                </div>
              ))}
              {(!order.videos || order.videos.length === 0) && (
                <p className="text-xs text-gray-400 py-4 text-center">No videos generated yet</p>
              )}
            </div>
          </Card>

          <Card className="p-5 border border-gray-200/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-500" /> Scheduled Shoots ({order.shoots?.length || 0})
              </h3>
              <Link to="/shoots" className="text-xs font-semibold text-amber-600 hover:underline">
                Open Schedule →
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {(order.shoots || []).map((s) => (
                <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-gray-900">{formatDate(s.date)}</span>
                    <span className="text-gray-400 ml-2">{s.location || 'Studio'}</span>
                    {s.creator?.name && (
                      <span className="text-gray-500 ml-2 bg-gray-100 px-1.5 py-0.5 rounded">
                        {s.creator.name}
                      </span>
                    )}
                  </div>
                  <StatusBadge status={s.status} type="shoot" />
                </div>
              ))}
              {(!order.shoots || order.shoots.length === 0) && (
                <p className="text-xs text-gray-400 py-4 text-center">No shoots scheduled yet</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tab 2: Videos */}
      {activeTab === 'Videos' && (
        <Card className="p-0 overflow-hidden border border-gray-200/80">
          <DataTable
            columns={[
              { key: 'videoNumber', title: 'Video #', render: (v) => <span className="font-bold">#{v}</span> },
              { key: 'status', title: 'Status', render: (val) => <StatusBadge status={val} type="video" /> },
              {
                key: 'creator',
                title: 'Creator',
                render: (_, row) => row.creator?.name || 'Unassigned'
              },
              {
                key: 'editor',
                title: 'Editor',
                render: (_, row) => row.editor?.user?.name || 'Unassigned'
              },
              { key: 'deadline', title: 'Deadline', render: (val) => formatDate(val) },
              {
                key: 'revisionCount',
                title: 'Revisions',
                render: (val) => (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${val > 0 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'}`}>
                    {val || 0} rev
                  </span>
                )
              }
            ]}
            data={order.videos || []}
            emptyMessage="No videos created for this order yet."
          />
        </Card>
      )}

      {/* Tab 3: Scripts */}
      {activeTab === 'Scripts' && (
        <Card className="p-0 overflow-hidden border border-gray-200/80">
          <DataTable
            columns={[
              { key: 'videoNumber', title: 'Video #', render: (v) => <span className="font-bold">Script #{v}</span> },
              { key: 'status', title: 'Status', render: (val) => <StatusBadge status={val} type="script" /> },
              { key: 'language', title: 'Language', render: (val) => val || 'Hindi' },
              { key: 'writer', title: 'Writer', render: (_, row) => row.writer?.name || 'Unassigned' },
              { key: 'deadline', title: 'Deadline', render: (val) => formatDate(val) }
            ]}
            data={order.scripts || []}
            emptyMessage="No scripts created for this order yet."
          />
        </Card>
      )}

      {/* Tab 4: Shoots */}
      {activeTab === 'Shoots' && (
        <Card className="p-0 overflow-hidden border border-gray-200/80">
          <DataTable
            columns={[
              { key: 'date', title: 'Shoot Date', render: (val) => <span className="font-bold">{formatDate(val)}</span> },
              { key: 'location', title: 'Location', render: (val) => val || 'Studio' },
              { key: 'creator', title: 'Creator', render: (_, row) => row.creator?.name || 'TBD' },
              { key: 'status', title: 'Status', render: (val) => <StatusBadge status={val} type="shoot" /> }
            ]}
            data={order.shoots || []}
            emptyMessage="No shoots scheduled for this order."
          />
        </Card>
      )}

      {/* Tab 5: Payments */}
      {activeTab === 'Payments' && (
        <Card className="p-0 overflow-hidden border border-gray-200/80">
          <DataTable
            columns={[
              { key: 'invoiceNumber', title: 'Invoice #', render: (v) => <span className="font-mono font-medium">{v || 'INV-001'}</span> },
              { key: 'amount', title: 'Amount', render: (val) => <span className="font-bold">{formatCurrency(val)}</span> },
              { key: 'paymentDate', title: 'Payment Date', render: (val) => formatDate(val) },
              { key: 'paymentMethod', title: 'Method', render: (val) => val || 'NEFT/UPI' },
              { key: 'status', title: 'Status', render: (val) => <StatusBadge status={val || 'PAID'} type="payment" /> }
            ]}
            data={order.payments || []}
            emptyMessage="No payments logged for this order."
          />
        </Card>
      )}
    </div>
  );
}
