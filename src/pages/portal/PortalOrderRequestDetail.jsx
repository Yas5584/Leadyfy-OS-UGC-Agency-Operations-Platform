import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Package, Clock, CheckCircle, XCircle, AlertCircle, MessageSquare, Edit3, Send, Loader2, ExternalLink } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/ui/StatusBadge';

export default function PortalOrderRequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    campaignName: '',
    packageName: '',
    videoCount: '',
    budget: '',
    preferredDeadline: '',
    description: '',
    requirements: ''
  });

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/order-requests/${id}`);
      if (res.data.success) {
        setRequest(res.data.data);
        const r = res.data.data;
        setFormData({
          campaignName: r.campaignName || '',
          packageName: r.packageName || '',
          videoCount: r.videoCount || '',
          budget: r.budget || '',
          preferredDeadline: r.preferredDeadline ? new Date(r.preferredDeadline).toISOString().split('T')[0] : '',
          description: r.description || '',
          requirements: r.requirements || ''
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load order request details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        videoCount: parseInt(formData.videoCount, 10) || 0,
        budget: parseFloat(formData.budget) || 0,
        status: 'PENDING' // Update status back to PENDING on resubmit if needed by backend, though usually handled backend side. We'll send it anyway.
      };
      const res = await api.put(`/order-requests/${id}`, payload);
      if (res.data.success) {
        showToast('Request resubmitted successfully', 'success');
        setIsEditing(false);
        fetchRequest();
      }
    } catch (err) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to resubmit request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
        <p className="text-gray-500">{error || 'Request not found'}</p>
        <button 
          onClick={() => navigate('/portal/orders')}
          className="mt-6 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-6">
        <Link 
          to="/portal/orders" 
          className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Order Request Details
              <span className="text-sm font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full border border-gray-200">
                #{request.id?.substring(0, 8).toUpperCase()}
              </span>
            </h1>
          </div>
          <StatusBadge status={request.status} />
        </div>
      </div>

      {/* Status Banner */}
      {request.status === 'PENDING' && (
        <div className="mb-6 rounded-xl p-4 bg-blue-50 border border-blue-100 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">Waiting for Review</h3>
            <p className="text-sm text-blue-700 mt-1">Your request is waiting for review by the Leadyfy team.</p>
          </div>
        </div>
      )}

      {request.status === 'UNDER_REVIEW' && (
        <div className="mb-6 rounded-xl p-4 bg-amber-50 border border-amber-100 flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-amber-900">Under Review</h3>
            <p className="text-sm text-amber-700 mt-1">Your request is currently being reviewed by our team.</p>
          </div>
        </div>
      )}

      {request.status === 'CHANGES_REQUESTED' && !isEditing && (
        <div className="mb-6 rounded-xl p-4 bg-orange-50 border border-orange-200 flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Edit3 className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-orange-900">Changes Requested</h3>
              <p className="text-sm text-orange-800 mt-1">The Leadyfy team has requested additional information or changes.</p>
              {request.adminNotes && (
                <div className="mt-2 p-3 bg-white/60 rounded-lg text-sm text-orange-900 font-medium">
                  "{request.adminNotes}"
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="shrink-0 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-lg hover:bg-orange-700 transition-colors"
          >
            Edit & Resubmit
          </button>
        </div>
      )}

      {request.status === 'APPROVED' && (
        <div className="mb-6 rounded-xl p-4 bg-green-50 border border-green-100 flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-green-900">Request Approved!</h3>
              <p className="text-sm text-green-700 mt-1">Your order request has been approved and your order has been created.</p>
            </div>
          </div>
          {request.createdOrderId && (
            <Link
              to={`/portal/orders/${request.createdOrderId}`}
              className="shrink-0 inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              View Order <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          )}
        </div>
      )}

      {request.status === 'REJECTED' && (
        <div className="mb-6 rounded-xl p-4 bg-red-50 border border-red-100 flex items-start gap-3">
          <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-900">Request Rejected</h3>
            <p className="text-sm text-red-700 mt-1">This request was not approved.</p>
            {request.adminNotes && (
              <p className="text-sm text-red-800 mt-2 font-medium">Reason: {request.adminNotes}</p>
            )}
          </div>
        </div>
      )}

      {/* Admin Notes Card (if not changes requested as that has it inline, but good to have a dedicated section if there's feedback outside of just changes requested) */}
      {request.adminNotes && request.status !== 'CHANGES_REQUESTED' && request.status !== 'REJECTED' && (
        <div className="mb-6 bg-amber-50 rounded-2xl border border-amber-200 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <MessageSquare className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-amber-900 mb-1">Admin Feedback</h2>
              <div className="text-sm text-amber-700 mb-2">
                {request.reviewedBy?.name ? `Reviewed by ${request.reviewedBy.name}` : 'Reviewed'}{' '}
                {request.reviewedAt && `on ${formatDate(request.reviewedAt)}`}
              </div>
              <p className="text-amber-900 whitespace-pre-wrap">{request.adminNotes}</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Form or Detail View */}
      {isEditing ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Edit Request Details</h2>
          <form onSubmit={handleResubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name *</label>
                <input
                  type="text"
                  name="campaignName"
                  value={formData.campaignName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Name *</label>
                <select
                  name="packageName"
                  value={formData.packageName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">Select a package</option>
                  <option value="Starter">Starter</option>
                  <option value="Growth">Growth</option>
                  <option value="Scale">Scale</option>
                  <option value="Custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Videos *</label>
                <input
                  type="number"
                  name="videoCount"
                  min="1"
                  value={formData.videoCount}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Budget (Optional)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    name="budget"
                    min="0"
                    step="0.01"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full pl-7 px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Deadline (Optional)</label>
                <input
                  type="date"
                  name="preferredDeadline"
                  value={formData.preferredDeadline}
                  onChange={handleChange}
                  className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 resize-none"
                  placeholder="Describe your request..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Requirements (Optional)</label>
                <textarea
                  name="requirements"
                  rows={3}
                  value={formData.requirements}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-amber-500 focus:border-amber-500 resize-none"
                  placeholder="Any specific requirements or notes?"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 disabled:opacity-50"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Resubmit Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Request Details</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8 mb-8">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Campaign Name</h4>
                <p className="text-base font-bold text-gray-900">{request.campaignName}</p>
              </div>
              
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Package</h4>
                <div className="flex items-center text-base font-bold text-gray-900">
                  <Package className="h-4 w-4 text-gray-400 mr-2" />
                  {request.packageName || 'Not specified'}
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Number of Videos</h4>
                <p className="text-base font-bold text-gray-900">{request.videoCount || 0}</p>
              </div>
              
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Estimated Budget</h4>
                <p className="text-base font-bold text-gray-900">
                  {request.budget ? formatCurrency(request.budget) : 'Not specified'}
                </p>
              </div>
              
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Preferred Deadline</h4>
                <p className="text-base font-bold text-gray-900">
                  {request.preferredDeadline ? formatDate(request.preferredDeadline) : 'Not specified'}
                </p>
              </div>
              
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Submitted Date</h4>
                <p className="text-base font-bold text-gray-900">
                  {request.createdAt ? formatDate(request.createdAt) : 'Unknown'}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Description</h4>
              <p className="text-gray-800 whitespace-pre-wrap">{request.description}</p>
            </div>

            {request.requirements && (
              <div className="pt-6 mt-6 border-t border-gray-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Additional Requirements</h4>
                <p className="text-gray-800 whitespace-pre-wrap">{request.requirements}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
