import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Package, Film, FileText, CheckCircle } from 'lucide-react';
import { orderService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/ui/StatusBadge';
import ProgressBar from '../../components/ui/ProgressBar';
import Card from '../../components/ui/Card';
import { SkeletonCard, SkeletonText } from '../../components/ui/Skeleton';

export default function PortalOrderDetail() {
  const { id } = useParams();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await orderService.getById(id);
      setOrder(res.data);
    } catch (err) {
      showToast('Failed to load order', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonText lines={2} />
        <div className="grid grid-cols-3 gap-6"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
      </div>
    );
  }

  if (!order) return <div className="p-8 text-center text-gray-500">Order not found</div>;

  const total = parseFloat(order.totalAmount || order.pricing || order.amount || 0);
  const received = parseFloat(order.amountReceived || 0);
  const balance = parseFloat(order.outstandingBalance ?? (total - received));
  const totalCount = order.videoCount || 0;
  const completedCount = order.completedCount ?? (order.videos?.filter(v => v.status === 'FINAL_APPROVED' || v.status === 'DELIVERED').length || 0);
  const deliveredCount = order.deliveredCount ?? (order.videos?.filter(v => v.status === 'DELIVERED').length || 0);
  const remainingCount = Math.max(0, totalCount - deliveredCount);

  // Production Stage Evidence from Database
  const hasScripts = (order.scripts?.length || 0) > 0;
  const hasApprovedScript = order.scripts?.some(s => s.status === 'APPROVED' || s.status === 'READY_FOR_SHOOT');
  const hasCreator = order.videos?.some(v => v.creatorId) || order.shoots?.some(s => s.creatorId);
  const hasShoot = (order.shoots?.length || 0) > 0;
  const hasShootDone = order.shoots?.some(s => s.status === 'COMPLETED');
  const hasEditing = order.videos?.some(v => ['VIDEO_EDITING', 'INTERNAL_QA', 'CLIENT_REVIEW', 'REVISION', 'FINAL_APPROVED', 'DELIVERED'].includes(v.status));
  const hasReview = order.videos?.some(v => ['CLIENT_REVIEW', 'REVISION', 'FINAL_APPROVED', 'DELIVERED'].includes(v.status));
  const hasApproval = order.videos?.some(v => ['FINAL_APPROVED', 'DELIVERED'].includes(v.status));
  const hasDelivered = order.videos?.some(v => v.status === 'DELIVERED');

  const stages = [
    { name: 'Scripts', done: hasApprovedScript, active: hasScripts && !hasApprovedScript, sub: hasApprovedScript ? 'Approved' : hasScripts ? 'Drafting' : 'Queued' },
    { name: 'Creator', done: hasCreator, active: !hasCreator && hasApprovedScript, sub: hasCreator ? 'Cast Assigned' : 'Casting' },
    { name: 'Shoot', done: hasShootDone, active: hasShoot && !hasShootDone, sub: hasShootDone ? 'Footage Uploaded' : hasShoot ? 'Scheduled' : 'Queued' },
    { name: 'Editing', done: hasReview, active: hasEditing && !hasReview, sub: hasReview ? 'Cut Ready' : hasEditing ? 'In Post' : 'Queued' },
    { name: 'Client Review', done: hasApproval, active: hasReview && !hasApproval, sub: hasApproval ? 'Client Approved' : hasReview ? 'Review Pending' : 'Upcoming' },
    { name: 'Approval', done: hasApproval, active: false, sub: hasApproval ? `${completedCount} Approved` : 'Pending' },
    { name: 'Delivery', done: hasDelivered, active: hasApproval && !hasDelivered, sub: hasDelivered ? `${deliveredCount} Delivered` : 'Mastering' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-200/80 pb-4">
        <Link to="/portal/orders" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{order.packageName || 'UGC Campaign'}</h1>
            <StatusBadge status={order.status} type="order" />
          </div>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Order #{order.id} • Target Delivery: {formatDate(order.dueDate)}
          </p>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Contract Value</span>
          <p className="text-2xl font-black text-gray-900 mt-1">{formatCurrency(total)}</p>
          <p className="text-[11px] text-gray-500 mt-0.5">{totalCount} Videos Contracted</p>
        </div>
        <div className="bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Amount Received</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{formatCurrency(received)}</p>
          <p className="text-[11px] text-emerald-600 mt-0.5">Milestone Collections</p>
        </div>
        <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-100 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Outstanding Balance</span>
          <p className="text-2xl font-black text-amber-700 mt-1">{formatCurrency(balance)}</p>
          <p className="text-[11px] text-amber-600 mt-0.5">Due upon project delivery</p>
        </div>
      </div>

      {/* Production Progress Bar */}
      <Card title="Production Progress & Quota">
        <div className="space-y-4 pt-1">
          <div className="flex justify-between text-xs font-bold text-gray-700">
            <span>Overall Delivery Milestone</span>
            <span className="text-amber-600">{deliveredCount} of {totalCount} Videos Completed ({totalCount > 0 ? Math.round((deliveredCount / totalCount) * 100) : 0}%)</span>
          </div>
          <ProgressBar value={deliveredCount} max={totalCount} showLabel />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-center text-xs">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <p className="text-2xl font-black text-gray-900">{totalCount}</p>
              <p className="text-gray-400 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 mt-1">
                <Package className="w-3.5 h-3.5"/> Ordered
              </p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100">
              <p className="text-2xl font-black text-emerald-700">{completedCount}</p>
              <p className="text-emerald-700 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 mt-1">
                <CheckCircle className="w-3.5 h-3.5"/> Approved
              </p>
            </div>
            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
              <p className="text-2xl font-black text-indigo-700">{deliveredCount}</p>
              <p className="text-indigo-700 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 mt-1">
                <Film className="w-3.5 h-3.5"/> Delivered
              </p>
            </div>
            <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
              <p className="text-2xl font-black text-amber-700">{remainingCount}</p>
              <p className="text-amber-700 text-[11px] font-bold uppercase tracking-wider mt-1">
                Remaining
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Production Lifecycle Stages */}
      <Card title="Production Lifecycle">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2">
          {stages.map((st, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl border text-center transition-all ${
                st.done
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : st.active
                  ? 'bg-amber-50/80 border-amber-300 text-amber-900 shadow-xs ring-1 ring-amber-400/40'
                  : 'bg-gray-50 border-gray-100 text-gray-400'
              }`}
            >
              <p className="text-xs font-black">{st.name}</p>
              <p className={`text-[10px] font-semibold mt-1 ${st.done ? 'text-emerald-700' : st.active ? 'text-amber-700 font-bold' : 'text-gray-400'}`}>
                {st.sub}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Scripts and Videos Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title={`Scripts in this Package (${order.scripts?.length || 0})`}>
          <div className="space-y-3">
            {order.scripts?.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No scripts drafted for this package yet.</p>
            ) : (
              order.scripts?.map(script => (
                <div key={script.id} className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-xs transition-all">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-bold text-gray-900 text-xs">Video #{script.videoNumber}</p>
                      <p className="text-[11px] text-gray-400">Language: {script.language || 'Hindi'} • Due: {formatDate(script.deadline)}</p>
                    </div>
                  </div>
                  <StatusBadge status={script.status} type="script" />
                </div>
              ))
            )}
          </div>
        </Card>

        <Card title={`Videos in this Package (${order.videos?.length || 0})`}>
          <div className="space-y-3">
            {order.videos?.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No videos produced yet.</p>
            ) : (
              order.videos?.map(video => (
                <div key={video.id} className="flex items-center justify-between p-3.5 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-xs transition-all">
                  <div className="flex items-center gap-3">
                    <Film className="w-5 h-5 text-gray-400" />
                    <div>
                      <Link to={`/portal/videos/${video.id}`} className="font-bold text-gray-900 text-xs hover:text-amber-600 transition-colors">
                        {video.title || `Video #${video.videoNumber}`}
                      </Link>
                      <p className="text-[11px] text-gray-400">Revisions: {video.revisionCount || 0} • Due: {formatDate(video.deadline)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={video.status} type="video" />
                    <Link to={`/portal/videos/${video.id}`} className="text-[11px] font-bold text-amber-600 hover:text-amber-700 underline">
                      Review
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
