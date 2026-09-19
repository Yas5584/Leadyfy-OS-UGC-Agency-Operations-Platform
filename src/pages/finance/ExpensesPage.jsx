import React, { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';


const ExpensesPage = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const { user } = useAuth();
  const { showToast } = useToast();

  const isOwnerOrAdmin = user?.role === 'OWNER' || user?.role === 'ADMIN';

  const [formData, setFormData] = useState({
    category: 'SALARIES',
    amount: '',
    date: '',
    receipt: '',
    notes: ''
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await api.get('/expenses');
      setExpenses(res.data || []);
    } catch (error) {
      showToast('Failed to load expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/expenses', {
        ...formData,
        amount: Number(formData.amount)
      });
      showToast('Expense added successfully', 'success');
      setIsModalOpen(false);
      setFormData({ category: 'SALARIES', amount: '', date: '', receipt: '', notes: '' });
      fetchExpenses();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to add expense', 'error');
    }
  };

  const filteredExpenses = filter === 'ALL' ? expenses : expenses.filter(e => e.category === filter);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
          <p className="text-gray-500 text-sm mt-1">Track internal expenses for Leadyfy OS</p>
        </div>
        {isOwnerOrAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Add Expense
          </button>
        )}
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
              <option value="ALL">All Categories</option>
              <option value="SALARIES">Salaries</option>
              <option value="OFFICE">Office</option>
              <option value="STUDIO">Studio</option>
              <option value="EQUIPMENT">Equipment</option>
              <option value="FUEL">Fuel</option>
              <option value="PAYOUTS">Payouts</option>
              <option value="MISC">Miscellaneous</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading expenses...</div>
        ) : filteredExpenses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No expenses found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredExpenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{expense.category}</td>
                    <td className="px-6 py-4 text-red-600">{formatCurrency(expense.amount)}</td>
                    <td className="px-6 py-4">{expense.userId?.name || 'Unknown'}</td>
                    <td className="px-6 py-4">{formatDate(expense.date)}</td>
                    <td className="px-6 py-4 text-gray-500">{expense.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add Expense</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500">
                  <option value="SALARIES">Salaries</option>
                  <option value="OFFICE">Office</option>
                  <option value="STUDIO">Studio</option>
                  <option value="EQUIPMENT">Equipment</option>
                  <option value="FUEL">Fuel</option>
                  <option value="PAYOUTS">Payouts</option>
                  <option value="MISC">Miscellaneous</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt URL (Optional)</label>
                <input type="text" name="receipt" value={formData.receipt} onChange={handleInputChange} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows="2" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500"></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium">Save Expense</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpensesPage;
