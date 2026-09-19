import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, ShoppingBag, Send, CheckCircle, XCircle, Clock, AlertCircle, MessageSquare, ArrowRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { orderService, clientService, orderRequestService } from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { ORDER_STATUSES, ORDER_REQUEST_STATUSES, getStatusLabel } from '../../utils/constants';
import { Button, Card, Modal, DataTable, StatusBadge, Skeleton, FormField, Input, Select, SearchInput, Textarea } from '../../components/ui';

export default function OrdersPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('orders');
  
  // Orders state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [clientFilter, setClientFilter] = useState('');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [clients, setClients] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  const initialForm = { clientId: '', packageName: '', videoCount: '5', pricing: '50000', gstAmount: '0', amountReceived: '0', startDate: '', dueDate: '', notes: '' };
  const [formData, setFormData] = useState(initialForm);

  // Order Requests state
  const [orderRequests, setOrderRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestStatusFilter, setRequestStatusFilter] = useState('');
  const [requestSearch, setRequestSearch] = useState('');
  
  // Review modal state
  const [reviewModal, setReviewModal] = useState({ open: false, request: null });
  const [reviewAction, setReviewAction] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchClients();
    fetchOrderRequests();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderService.getAll();
      const list = res?.data || (Array.isArray(res) ? res : []);
      setOrders(list);
    } catch (error) {
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await clientService.getAll();
      const list = res?.data || (Array.isArray(res) ? res : []);
      setClients(list);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOrderRequests = async () => {
    try {
      setRequestsLoading(true);
      const res = await orderRequestService.getAll();
      const list = res?.data || (Array.isArray(res) ? res : []);
      setOrderRequests(list);
    } catch (error) {
      console.error('Failed to load order requests:', error);
    } finally {
      setRequestsLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.clientId || !formData.packageName) {
      showToast('Client and package name are required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const pricing = parseFloat(formData.pricing) || 0;
      const gstAmount = parseFloat(formData.gstAmount) || 0;
      const totalAmount = pricing + gstAmount;
      const amountReceived = parseFloat(formData.amountReceived) || 0;
      const outstandingBalance = totalAmount - amountReceived;

      await orderService.create({
        ...formData,
        videoCount: parseInt(formData.videoCount) || 1,
        pricing,
        gstAmount,
        totalAmount,
        amountReceived,
        outstandingBalance
      });
      showToast('Order created successfully', 'success');
      setIsAddOpen(false);
      setFormData(initialForm);
      fetchOrders();
    } catch (error) {
      showToast(error.message || 'Failed to create order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Review actions
  const openReviewModal = (request) => {
    setReviewModal({ open: true, request });
    setReviewAction('');
    setAdminNotes(request.adminNotes || '');
  };

  const closeReviewModal = () => {
    setReviewModal({ open: false, request: null });
    setReviewAction('');
    setAdminNotes('');
    setReviewSubmitting(false);
  };

  const handleReviewAction = async (action) => {
    const req = reviewModal.request;
    if (!req) return;

    try {
      setReviewSubmitting(true);

      if (action === 'APPROVED') {
        await orderRequestService.approve(req.id, { adminNotes });
        showToast('Order request approved and order created!', 'success');
      } else {
        await orderRequestService.review(req.id, { status: action, adminNotes });
        const actionLabel = action === 'REJECTED' ? 'rejected' : action === 'UNDER_REVIEW' ? 'marked as under review' : 'sent back for changes';
        showToast(`Order request ${actionLabel}`, 'success');
      }

      closeReviewModal();
      fetchOrderRequests();
      if (action === 'APPROVED') fetchOrders();
    } catch (error) {
      showToast(error.message || 'Failed to update request', 'error');
    } finally {
      setReviewSubmitting(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.client?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.packageName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? o.status === statusFilter : true;
    const matchesClient = clientFilter ? o.clientId === clientFilter : true;
    return matchesSearch && matchesStatus && matchesClient;
  });

  const filteredRequests = orderRequests.filter(r => {
    const matchesSearch =
      r.campaignName?.toLowerCase().includes(requestSearch.toLowerCase()) ||
      r.client?.companyName?.toLowerCase().includes(requestSearch.toLowerCase());
    const matchesStatus = requestStatusFilter ? r.status === requestStatusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const pendingRequestCount = orderRequests.filter(r => ['PENDING', 'UNDER_REVIEW'].includes(r.status)).length;

  const orderColumns = [
    { 
      key: 'client', 
      title: 'Client', 
      render: (_, row) => (
        <div>
          <span className="font-bold text-gray-900 block">{row.client?.companyName || 'Client'}</span>
          <span className="text-[11px] font-mono text-gray-400">#{row.id?.substring(0, 8)}</span>
        </div>
      )
    },
    { 
      key: 'packageName', 
      title: 'Package',
      render: (val) => <span className="font-semibold text-gray-800">{val}</span>
    },
    { 
      key: 'videos', 
      title: 'Videos', 
      render: (_, row) => (
        <span className="text-xs font-mono font-medium text-gray-700">
          {row.deliveredCount || 0} / {row.videoCount || 0} Del
        </span>
      )
    },
    {
      key: 'progress',
      title: 'Progress',
      render: (_, row) => {
        const total = row.videoCount || 1;
        const delivered = row.deliveredCount || 0;
        const pct = Math.min(100, Math.round((delivered / total) * 100));
        return (
          <div className="w-24">
            <div className="flex justify-between text-[10px] font-medium text-gray-500 mb-0.5">
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      }
    },
    { 
      key: 'totalAmount', 
      title: 'Contract Value', 
      render: (val) => <span className="font-bold text-gray-900">{formatCurrency(val)}</span> 
    },
    { 
      key: 'outstandingBalance', 
      title: 'Outstanding', 
      render: (val) => {
        const num = parseFloat(val || 0);
        return (
          <span className={`font-semibold text-xs ${num > 0 ? 'text-amber-700 font-bold' : 'text-emerald-600'}`}>
            {formatCurrency(num)}
          </span>
        );
      }
    },
    { 
      key: 'dueDate', 
      title: 'Due Date', 
      render: (val) => <span className="text-xs text-gray-500">{formatDate(val)}</span> 
    },
    { 
      key: 'status', 
      title: 'Status', 
      render: (val) => <StatusBadge status={val} type="order" /> 
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/orders/${row.id}`);
          }}
          className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-amber-600 transition-colors"
          title="View Order"
        >
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ];

  const requestColumns = [
    {
      key: 'campaign',
      title: 'Campaign',
      render: (_, row) => (
        <div>
          <span className="font-bold text-gray-900 block">{row.campaignName}</span>
          <span className="text-[11px] font-mono text-gray-400">#{row.id?.substring(0, 8).toUpperCase()}</span>
        </div>
      )
    },
    {
      key: 'client',
      title: 'Client',
      render: (_, row) => (
        <span className="font-medium text-gray-700">{row.client?.companyName || '—'}</span>
      )
    },
    {
      key: 'packageName',
      title: 'Package',
      render: (val) => <span className="font-medium text-gray-800 text-xs">{val}</span>
    },
    {
      key: 'videoCount',
      title: 'Videos',
      render: (val) => <span className="font-mono font-bold text-gray-900">{val}</span>
    },
    {
      key: 'budget',
      title: 'Budget',
      render: (val) => (
        <span className="font-medium text-gray-700 text-xs">
          {val ? formatCurrency(parseFloat(val)) : '—'}
        </span>
      )
    },
    {
      key: 'createdAt',
      title: 'Submitted',
      render: (val) => <span className="text-xs text-gray-500">{formatDate(val)}</span>
    },
    {
      key: 'status',
      title: 'Status',
      render: (val) => <StatusBadge status={val} />
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            openReviewModal(row);
          }}
          className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-colors flex items-center gap-1"
        >
          <Eye className="w-3.5 h-3.5" /> Review
        </button>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#111111]">Orders & Contracts</h1>
          <p className="text-xs text-gray-500 mt-0.5">Package subscriptions, quota limits, and production progress</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Order
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'orders'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5 inline mr-1.5" />
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'requests'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          Order Requests ({orderRequests.length})
          {pendingRequestCount > 0 && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {pendingRequestCount}
            </span>
          )}
        </button>
      </div>

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <>
          <Card className="p-4 border border-gray-200/80 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search package or client..." />
              <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Order Statuses</option>
                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
              <Select value={clientFilter} onChange={e => setClientFilter(e.target.value)}>
                <option value="">All Clients</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
              </Select>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden border border-gray-200/80 bg-white">
            <DataTable 
              columns={orderColumns} 
              data={filteredOrders} 
              loading={loading}
              onRowClick={(row) => navigate(`/orders/${row.id}`)}
              emptyMessage="No orders found matching filters."
            />
          </Card>
        </>
      )}

      {/* Order Requests Tab */}
      {activeTab === 'requests' && (
        <>
          <Card className="p-4 border border-gray-200/80 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SearchInput value={requestSearch} onChange={setRequestSearch} placeholder="Search campaign or client..." />
              <Select value={requestStatusFilter} onChange={e => setRequestStatusFilter(e.target.value)}>
                <option value="">All Request Statuses</option>
                {ORDER_REQUEST_STATUSES.map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
              </Select>
            </div>
          </Card>

          <Card className="p-0 overflow-hidden border border-gray-200/80 bg-white">
            <DataTable
              columns={requestColumns}
              data={filteredRequests}
              loading={requestsLoading}
              onRowClick={(row) => openReviewModal(row)}
              emptyMessage="No order requests found."
            />
          </Card>
        </>
      )}

      {/* Add Order Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Order">
        <form onSubmit={handleAdd} className="space-y-4">
          <FormField label="Client" required>
            <Select value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})} required>
              <option value="">Select Brand / Client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
            </Select>
          </FormField>
          
          <FormField label="Package Name" required>
            <Input 
              placeholder="e.g. 10x UGC Monthly Retainer" 
              value={formData.packageName} 
              onChange={e => setFormData({...formData, packageName: e.target.value})} 
              required 
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Video Count" required>
              <Input 
                type="number" 
                min="1" 
                value={formData.videoCount} 
                onChange={e => setFormData({...formData, videoCount: e.target.value})} 
                required 
              />
            </FormField>
            <FormField label="Pricing (₹)" required>
              <Input 
                type="number" 
                min="0" 
                value={formData.pricing} 
                onChange={e => setFormData({...formData, pricing: e.target.value})} 
                required 
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="GST Amount (₹)">
              <Input 
                type="number" 
                min="0" 
                value={formData.gstAmount} 
                onChange={e => setFormData({...formData, gstAmount: e.target.value})} 
              />
            </FormField>
            <FormField label="Total Invoice Amount (₹)">
              <Input 
                type="number"
                disabled
                className="bg-gray-50 font-bold text-gray-900"
                value={(parseFloat(formData.pricing || 0) + parseFloat(formData.gstAmount || 0)).toString()} 
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Amount Received (₹)">
              <Input 
                type="number" 
                min="0" 
                value={formData.amountReceived} 
                onChange={e => setFormData({...formData, amountReceived: e.target.value})} 
              />
            </FormField>
            <FormField label="Outstanding Balance (₹)">
              <Input 
                type="number"
                disabled
                className="bg-gray-50 text-amber-700 font-bold"
                value={((parseFloat(formData.pricing || 0) + parseFloat(formData.gstAmount || 0)) - parseFloat(formData.amountReceived || 0)).toString()} 
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start Date">
              <Input 
                type="date" 
                value={formData.startDate} 
                onChange={e => setFormData({...formData, startDate: e.target.value})} 
              />
            </FormField>
            <FormField label="Due Date">
              <Input 
                type="date" 
                value={formData.dueDate} 
                onChange={e => setFormData({...formData, dueDate: e.target.value})} 
              />
            </FormField>
          </div>

          <FormField label="Production Notes">
            <Textarea 
              placeholder="Creative brief notes, target audience, preferred styles..." 
              value={formData.notes} 
              onChange={e => setFormData({...formData, notes: e.target.value})} 
              rows={3} 
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-white">
              {submitting ? 'Creating...' : 'Create Order'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Review Order Request Modal */}
      <Modal
        isOpen={reviewModal.open}
        onClose={closeReviewModal}
        title="Review Order Request"
      >
        {reviewModal.request && (
          <div className="space-y-5">
            {/* Request Summary */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-black text-gray-900">{reviewModal.request.campaignName}</h3>
                  <p className="text-xs text-gray-400 font-mono">#{reviewModal.request.id?.substring(0, 8).toUpperCase()}</p>
                </div>
                <StatusBadge status={reviewModal.request.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Client</p>
                  <p className="text-gray-900 font-bold">{reviewModal.request.client?.companyName || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Package</p>
                  <p className="text-gray-900 font-bold">{reviewModal.request.packageName}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Videos</p>
                  <p className="text-gray-900 font-bold">{reviewModal.request.videoCount}</p>
                </div>
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Budget</p>
                  <p className="text-gray-900 font-bold">
                    {reviewModal.request.budget ? formatCurrency(parseFloat(reviewModal.request.budget)) : '—'}
                  </p>
                </div>
                {reviewModal.request.preferredDeadline && (
                  <div>
                    <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Deadline</p>
                    <p className="text-gray-900 font-bold">{formatDate(reviewModal.request.preferredDeadline)}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Submitted</p>
                  <p className="text-gray-900 font-bold">{formatDate(reviewModal.request.createdAt)}</p>
                </div>
              </div>

              {reviewModal.request.description && (
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Description</p>
                  <p className="text-gray-700 text-xs leading-relaxed">{reviewModal.request.description}</p>
                </div>
              )}

              {reviewModal.request.requirements && (
                <div>
                  <p className="text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Requirements</p>
                  <p className="text-gray-700 text-xs leading-relaxed">{reviewModal.request.requirements}</p>
                </div>
              )}
            </div>

            {/* Admin Notes */}
            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block uppercase tracking-wider">
                Admin Notes / Feedback
              </label>
              <Textarea
                value={adminNotes}
                onChange={e => setAdminNotes(e.target.value)}
                placeholder="Add notes for the client or internal reference..."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            {['PENDING', 'UNDER_REVIEW'].includes(reviewModal.request.status) && (
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  {reviewModal.request.status === 'PENDING' && (
                    <button
                      onClick={() => handleReviewAction('UNDER_REVIEW')}
                      disabled={reviewSubmitting}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors border border-blue-200"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      Mark Under Review
                    </button>
                  )}
                  <button
                    onClick={() => handleReviewAction('CHANGES_REQUESTED')}
                    disabled={reviewSubmitting || !adminNotes.trim()}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold transition-colors border border-orange-200 disabled:opacity-50"
                    title={!adminNotes.trim() ? 'Add notes explaining what changes are needed' : ''}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Request Changes
                  </button>
                  <button
                    onClick={() => handleReviewAction('REJECTED')}
                    disabled={reviewSubmitting}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition-colors border border-red-200"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleReviewAction('APPROVED')}
                    disabled={reviewSubmitting}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve & Create Order
                  </button>
                </div>
                {reviewSubmitting && (
                  <p className="text-xs text-amber-600 font-medium text-center animate-pulse">Processing...</p>
                )}
              </div>
            )}

            {/* Already handled statuses */}
            {reviewModal.request.status === 'APPROVED' && reviewModal.request.createdOrderId && (
              <div className="border-t border-gray-100 pt-4">
                <div className="bg-green-50 rounded-xl p-4 border border-green-200 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-green-800">✓ Approved</p>
                    <p className="text-xs text-green-600 mt-0.5">Order #{reviewModal.request.createdOrderId?.substring(0, 8)} was created</p>
                  </div>
                  <button
                    onClick={() => {
                      closeReviewModal();
                      navigate(`/orders/${reviewModal.request.createdOrderId}`);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    View Order <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {reviewModal.request.status === 'REJECTED' && (
              <div className="border-t border-gray-100 pt-4">
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <p className="text-sm font-bold text-red-800">✗ Rejected</p>
                  {reviewModal.request.adminNotes && (
                    <p className="text-xs text-red-600 mt-1">{reviewModal.request.adminNotes}</p>
                  )}
                </div>
              </div>
            )}

            {reviewModal.request.status === 'CHANGES_REQUESTED' && (
              <div className="border-t border-gray-100 pt-4">
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <p className="text-sm font-bold text-orange-800">⚠ Changes Requested</p>
                  <p className="text-xs text-orange-600 mt-1">Waiting for the client to resubmit.</p>
                </div>
              </div>
            )}

            {/* Close button */}
            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={closeReviewModal}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
