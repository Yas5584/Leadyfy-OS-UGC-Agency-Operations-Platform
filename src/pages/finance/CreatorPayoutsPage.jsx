import React, { useState, useEffect } from 'react';
import { Plus, Filter, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const CreatorPayoutsPage = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const { user } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    creatorId: '',
    orderId: '',
    videoCount: 1,
    contractedRate: '',
    reference: ''
  });

  const [creators, setCreators] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchPayouts();
    fetchCreatorsAndOrders();
  }, []);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payouts');
      setPayouts(res.data || []);
    } catch (error) {
      showToast('Failed to load payouts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCreatorsAndOrders = async () => {
    try {
      const [creatorsRes, ordersRes] = await Promise.all([
        api.get('/creators'),
        api.get('/orders')
      ]);
      setCreators(creatorsRes.data || []);
      setOrders(ordersRes.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const totalPayout = Number(formData.videoCount) * Number(formData.contractedRate);
      await api.post('/payouts', {
        ...formData,
        videoCount: Number(formData.videoCount),
        contractedRate: Number(formData.contractedRate),
        totalPayout,
        status: 'PENDING'
      });
      showToast('Payout created successfully', 'success');
      setIsModalOpen(false);
      setFormData({ creatorId: '', orderId: '', videoCount: 1, contractedRate: '', reference: '' });
      fetchPayouts();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to create payout', 'error');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/payouts/${id}/status`, { status });
      showToast(`Payout marked as ${status}`, 'success');
      fetchPayouts();
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const filteredPayouts = filter === 'ALL' ? payouts : payouts.filter(p => p.status === filter);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Creator Payouts</h1>
          <p className="text-gray-500 text-sm mt-1">Manage external creator payments</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Add Payout
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-500" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-white border border-gray-300 text-gray-700 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading payouts...</div>
        ) : filteredPayouts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No payouts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Creator</th>
                  <th className="px-6 py-4">Order / Reference</th>
                  <th className="px-6 py-4">Videos</th>
                  <th className="px-6 py-4">Rate</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayouts.map((payout) => {
                  const pid = payout.id || payout._id;
                  const creatorName = payout.creator?.name || payout.creatorId?.name || 'Creator';
                  const orderDisplay = payout.order?.packageName || (payout.orderId ? `Order: ${String(payout.orderId).substring(0, 8)}` : payout.reference || '-');
                  return (
                    <tr key={pid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">{creatorName}</td>
                      <td className="px-6 py-4">{orderDisplay}</td>
                      <td className="px-6 py-4">{payout.videoCount}</td>
                      <td className="px-6 py-4">{formatCurrency(payout.contractedRate)}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(payout.totalPayout)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${payout.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                            payout.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'}`}>
                          {payout.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">{formatDate(payout.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        {payout.status === 'PENDING' && (
                          <button onClick={() => updateStatus(pid, 'APPROVED')} className="text-blue-600 hover:text-blue-900 text-sm font-medium">Approve</button>
                        )}
                        {payout.status === 'APPROVED' && (
                          <button onClick={() => updateStatus(pid, 'PAID')} className="text-green-600 hover:text-green-900 text-sm font-medium">Mark Paid</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add Creator Payout</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Creator</label>
                <select name="creatorId" value={formData.creatorId} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500">
                  <option value="">Select Creator</option>
                  {creators.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order (Optional)</label>
                <select name="orderId" value={formData.orderId} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500">
                  <option value="">Select Order</option>
                  {orders.map(o => <option key={o.id || o._id} value={o.id || o._id}>{o.packageName || 'Order'} - {formatDate(o.createdAt)}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video Count</label>
                  <input type="number" name="videoCount" min="1" value={formData.videoCount} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rate per Video</label>
                  <input type="number" name="contractedRate" value={formData.contractedRate} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Payout (Auto)</label>
                <input type="text" readOnly value={formatCurrency((Number(formData.videoCount) || 0) * (Number(formData.contractedRate) || 0))} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference Notes</label>
                <input type="text" name="reference" value={formData.reference} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium">Create Payout</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorPayoutsPage;
