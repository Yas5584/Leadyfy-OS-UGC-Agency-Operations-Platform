import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, Package, CheckCircle, FileText, Calendar, DollarSign, Film, AlignLeft, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function PortalOrderRequestForm() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [form, setForm] = useState({
    campaignName: '',
    packageName: '',
    videoCount: '',
    budget: '',
    preferredDeadline: '',
    description: '',
    requirements: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handlePackageChange = (e) => {
    const packageName = e.target.value;
    let videoCount = form.videoCount;
    
    if (packageName === 'UGC Starter (5 Videos)') videoCount = '5';
    else if (packageName === 'UGC Growth (10 Videos)') videoCount = '10';
    else if (packageName === 'UGC Scale (20 Videos)') videoCount = '20';
    else if (packageName === 'UGC Enterprise (50 Videos)') videoCount = '50';
    
    setForm({ ...form, packageName, videoCount });
    if (errors.packageName) setErrors({ ...errors, packageName: null });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.campaignName || form.campaignName.length < 3) {
      newErrors.campaignName = "Campaign name must be at least 3 characters";
    }
    if (!form.packageName) {
      newErrors.packageName = "Please select a package";
    }
    if (!form.videoCount || parseInt(form.videoCount, 10) < 1) {
      newErrors.videoCount = "Video count must be at least 1";
    }
    if (!form.description || form.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }
    if (form.budget && parseFloat(form.budget) < 0) {
      newErrors.budget = "Budget must be a positive number";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        videoCount: parseInt(form.videoCount, 10),
        budget: form.budget ? parseFloat(form.budget) : null,
        preferredDeadline: form.preferredDeadline ? new Date(form.preferredDeadline).toISOString() : null,
        requirements: form.requirements || null
      };
      const response = await api.post('/order-requests', payload);
      setSubmitted(response.data || { ...payload, id: Math.random().toString(36).substring(7), status: 'PENDING' });
      showToast('Order request submitted successfully', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || error.message || 'Failed to submit order request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-center p-12">
          <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Order Request Submitted!</h2>
          <p className="text-gray-500 mb-8 max-w-lg mx-auto font-medium">
            Your request has been sent to the Leadyfy team. We'll review the requirements and get back to you.
          </p>
          
          <div className="bg-gray-50 rounded-xl p-6 text-left max-w-md mx-auto mb-10 border border-gray-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 mb-4 border-b border-gray-200 pb-2">Request Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm font-medium">Request ID</span>
                <span className="text-gray-900 font-bold">#{String(submitted.id || 'REQ').substring(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm font-medium">Campaign</span>
                <span className="text-gray-900 font-medium truncate ml-4">{submitted.campaignName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm font-medium">Package</span>
                <span className="text-gray-900 font-medium">{submitted.packageName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm font-medium">Videos</span>
                <span className="text-gray-900 font-medium">{submitted.videoCount}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                <span className="text-gray-500 text-sm font-medium">Status</span>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                  PENDING
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate(`/portal/orders/requests/${submitted.id || '1'}`)}
              className="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors"
            >
              View Request
            </button>
            <button
              onClick={() => navigate('/portal/orders')}
              className="px-6 py-3 bg-white text-gray-700 font-bold border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Back to My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Link 
        to="/portal/orders" 
        className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to My Orders
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Request a New Order</h1>
        <p className="text-gray-500 font-medium">
          Tell us about the campaign or content you need. Our team will review and get back to you.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="md:col-span-2">
              <label htmlFor="campaignName" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center">
                <FileText className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                Campaign Name
              </label>
              <input
                type="text"
                id="campaignName"
                name="campaignName"
                value={form.campaignName}
                onChange={handleChange}
                placeholder="e.g. Summer Product Campaign"
                className={`w-full border ${errors.campaignName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-amber-500 focus:border-amber-500'} rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none transition-all`}
              />
              {errors.campaignName && <p className="text-xs text-red-500 mt-1">{errors.campaignName}</p>}
            </div>

            <div>
              <label htmlFor="packageName" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center">
                <Package className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                Package
              </label>
              <select
                id="packageName"
                name="packageName"
                value={form.packageName}
                onChange={handlePackageChange}
                className={`w-full border ${errors.packageName ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-amber-500 focus:border-amber-500'} rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none transition-all bg-white`}
              >
                <option value="">Select a package...</option>
                <option value="UGC Starter (5 Videos)">UGC Starter (5 Videos)</option>
                <option value="UGC Growth (10 Videos)">UGC Growth (10 Videos)</option>
                <option value="UGC Scale (20 Videos)">UGC Scale (20 Videos)</option>
                <option value="UGC Enterprise (50 Videos)">UGC Enterprise (50 Videos)</option>
                <option value="Custom Package">Custom Package</option>
              </select>
              {errors.packageName && <p className="text-xs text-red-500 mt-1">{errors.packageName}</p>}
            </div>

            <div>
              <label htmlFor="videoCount" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center">
                <Film className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                Number of Videos
              </label>
              <input
                type="number"
                id="videoCount"
                name="videoCount"
                value={form.videoCount}
                onChange={handleChange}
                min="1"
                placeholder="e.g. 10"
                className={`w-full border ${errors.videoCount ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-amber-500 focus:border-amber-500'} rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none transition-all`}
              />
              {errors.videoCount && <p className="text-xs text-red-500 mt-1">{errors.videoCount}</p>}
            </div>

            <div>
              <label htmlFor="budget" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center">
                <DollarSign className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                Estimated Budget (₹) <span className="text-gray-400 ml-1 lowercase normal-case text-xs font-medium">(Optional)</span>
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={form.budget}
                onChange={handleChange}
                min="0"
                placeholder="e.g. 50000"
                className={`w-full border ${errors.budget ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-amber-500 focus:border-amber-500'} rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none transition-all`}
              />
              {errors.budget && <p className="text-xs text-red-500 mt-1">{errors.budget}</p>}
            </div>

            <div>
              <label htmlFor="preferredDeadline" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                Preferred Deadline <span className="text-gray-400 ml-1 lowercase normal-case text-xs font-medium">(Optional)</span>
              </label>
              <input
                type="date"
                id="preferredDeadline"
                name="preferredDeadline"
                value={form.preferredDeadline}
                onChange={handleChange}
                min={getTodayDate()}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all bg-white"
              />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center">
                <AlignLeft className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                Campaign Description
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the content style, products, target audience, and key messaging..."
                className={`w-full border ${errors.description ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-200 focus:ring-amber-500 focus:border-amber-500'} rounded-xl px-4 py-3 text-sm focus:ring-2 outline-none transition-all resize-none`}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="requirements" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5 flex items-center">
                <AlignLeft className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
                Additional Requirements <span className="text-gray-400 ml-1 lowercase normal-case text-xs font-medium">(Optional)</span>
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                rows={3}
                placeholder="Creator preferences, platform focus (Instagram Reels, YouTube Shorts), specific deliverables..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-6 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Order Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
