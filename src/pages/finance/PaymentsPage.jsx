import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { PAYMENT_STATUSES, STATUS_COLORS } from '../../utils/constants';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const { user } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    clientId: '',
    orderId: '',
    invoiceAmount: '',
    amountReceived: '',
    paymentDate: '',
    paymentMethod: 'Bank Transfer',
    transactionReference: '',
    notes: ''
  });

  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchPayments();
    fetchClients();
  }, []);

  useEffect(() => {
    if (formData.clientId) {
      fetchOrders(formData.clientId);
    }
  }, [formData.clientId]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments');
      setPayments(res.data || []);
    } catch (error) {
      showToast('Failed to load payments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchOrders = async (clientId) => {
    try {
      const res = await api.get(`/orders?client=${clientId}`);
      setOrders(res.data || []);
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
      const pendingBalance = Number(formData.invoiceAmount) - Number(formData.amountReceived);
      const payload = {
        ...formData,
        invoiceAmount: Number(formData.invoiceAmount),
        amountReceived: Number(formData.amountReceived),
        pendingBalance
      };
      await api.post('/payments', payload);
      showToast('Payment added successfully', 'success');
      setIsModalOpen(false);
      setFormData({
        clientId: '', orderId: '', invoiceAmount: '', amountReceived: '',
        paymentDate: '', paymentMethod: 'Bank Transfer', transactionReference: '', notes: ''
      });
      fetchPayments();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to add payment', 'error');
    }
  };

  const filteredPayments = filter === 'ALL' ? payments : payments.filter(p => p.status === filter);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
          <p className="text-gray-500 text-sm mt-1">Manage client payments and invoices for Leadyfy OS</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={20} />
          Add Payment
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
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIALLY_PAID">Partially Paid</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading payments...</div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No payments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Invoice Amount</th>
                  <th className="px-6 py-4">Received</th>
                  <th className="px-6 py-4">Pending</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id || payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{payment.client?.companyName || payment.clientId?.name || 'Client'}</td>
                    <td className="px-6 py-4">{formatCurrency(payment.amount || payment.invoiceAmount || 0)}</td>
                    <td className="px-6 py-4 text-green-600">{formatCurrency(payment.amount || payment.amountReceived || 0)}</td>
                    <td className="px-6 py-4 text-gray-500">{formatCurrency(payment.pendingBalance || 0)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${payment.status === 'PAID' ? 'bg-green-100 text-green-800' : 
                          payment.status === 'PARTIALLY_PAID' ? 'bg-blue-100 text-blue-800' :
                          payment.status === 'UNPAID' ? 'bg-gray-100 text-gray-800' :
                          'bg-red-100 text-red-800'}`}>
                        {payment.status || 'PAID'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{formatDate(payment.paymentDate || payment.createdAt)}</td>
                    <td className="px-6 py-4">{payment.paymentMethod || 'NEFT'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add Payment</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
                <select name="clientId" value={formData.clientId} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500">
                  <option value="">Select Client</option>
                  {clients.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.companyName || c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                <select name="orderId" value={formData.orderId} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500">
                  <option value="">Select Order</option>
                  {orders.map(o => <option key={o.id || o._id} value={o.id || o._id}>{o.packageName || 'Order'} - {formatDate(o.createdAt)}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Amount</label>
                  <input type="number" name="invoiceAmount" value={formData.invoiceAmount} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount Received</label>
                  <input type="number" name="amountReceived" value={formData.amountReceived} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pending Balance (Auto)</label>
                <input type="text" readOnly value={Number(formData.invoiceAmount) - Number(formData.amountReceived) || 0} className="w-full border border-gray-200 bg-gray-50 rounded-lg px-4 py-2 text-gray-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                  <input type="date" name="paymentDate" value={formData.paymentDate} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select name="paymentMethod" value={formData.paymentMethod} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500">
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="UPI">UPI</option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Ref</label>
                <input type="text" name="transactionReference" value={formData.transactionReference} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium">Save Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
