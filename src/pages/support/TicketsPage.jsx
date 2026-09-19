import React, { useState, useEffect } from 'react';
import { Plus, Filter, MessageSquare, CheckCircle, Clock, AlertCircle, Headphones, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { Button, Card, Modal, StatusBadge, Skeleton } from '../../components/ui';

const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    clientId: '',
    subject: '',
    description: '',
    priority: 'MEDIUM'
  });
  
  const [clients, setClients] = useState([]);
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    fetchTickets();
    fetchClients();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/support');
      const list = res?.data || (Array.isArray(res) ? res : []);
      setTickets(list);
    } catch (error) {
      showToast('Failed to load tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      const list = res?.data || (Array.isArray(res) ? res : []);
      setClients(list);
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
      setSubmitting(true);
      await api.post('/support', formData);
      showToast('Ticket created successfully', 'success');
      setIsModalOpen(false);
      setFormData({ clientId: '', subject: '', description: '', priority: 'MEDIUM' });
      fetchTickets();
    } catch (error) {
      showToast(error.message || 'Failed to create ticket', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const updateTicketStatus = async (ticketId, status) => {
    try {
      await api.patch(`/support/${ticketId}/status`, { status });
      showToast(`Ticket marked as ${status}`, 'success');
      fetchTickets();
      if (selectedTicket && (selectedTicket.id === ticketId || selectedTicket._id === ticketId)) {
        setSelectedTicket(prev => ({ ...prev, status }));
      }
    } catch (error) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleSendResponse = async () => {
    const ticketId = selectedTicket?.id || selectedTicket?._id;
    if (!responseMessage.trim() || !ticketId) return;

    try {
      await api.post(`/support/${ticketId}/responses`, { message: responseMessage });
      showToast('Response logged', 'success');
      setResponseMessage('');
      fetchTickets();
      const res = await api.get(`/support/${ticketId}`);
      if (res?.data) setSelectedTicket(res.data);
    } catch (error) {
      showToast('Failed to send response', 'error');
    }
  };

  const filteredTickets = tickets.filter(t => 
    (statusFilter === 'ALL' || t.status === statusFilter) &&
    (priorityFilter === 'ALL' || t.priority === priorityFilter)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-[#111111]">Support & Inquiries</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              {tickets.length} Total
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Manage client tickets, revision inquiries, and support requests</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Ticket
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Tickets List */}
        <div className={`flex-1 w-full ${selectedTicket ? 'hidden lg:block' : ''}`}>
          <Card className="p-4 border border-gray-200/80 bg-white mb-4">
            <div className="flex flex-wrap gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white border border-gray-200 text-gray-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-white border border-gray-200 text-gray-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </Card>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="p-12 text-center text-gray-400 text-xs font-medium">No tickets found matching current filters.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                    <tr>
                      <th className="px-5 py-3.5">Ticket</th>
                      <th className="px-5 py-3.5">Client</th>
                      <th className="px-5 py-3.5">Subject</th>
                      <th className="px-5 py-3.5">Priority</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Logged Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTickets.map((ticket) => {
                      const ticketId = ticket.id || ticket._id || '';
                      const isSelected = selectedTicket && (selectedTicket.id === ticketId || selectedTicket._id === ticketId);
                      const clientName = ticket.client?.companyName || ticket.clientId?.name || 'Client';

                      return (
                        <tr 
                          key={ticketId} 
                          onClick={() => setSelectedTicket(ticket)}
                          className={`cursor-pointer transition-colors text-xs ${isSelected ? 'bg-amber-50/70 font-medium' : 'hover:bg-gray-50/60'}`}
                        >
                          <td className="px-5 py-3.5 font-mono text-gray-500">#{ticketId.substring(0, 8)}</td>
                          <td className="px-5 py-3.5 font-bold text-gray-900">{clientName}</td>
                          <td className="px-5 py-3.5 text-gray-800 max-w-xs truncate">{ticket.subject}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              ticket.priority === 'HIGH' || ticket.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                              ticket.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge status={ticket.status} type="support" />
                          </td>
                          <td className="px-5 py-3.5 text-gray-500">{formatDate(ticket.createdAt)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Selected Ticket Details */}
        {selectedTicket && (
          <div className="w-full lg:w-96 bg-white rounded-xl shadow-sm border border-gray-200/80 flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-gray-100 flex justify-between items-start bg-gray-50/60 rounded-t-xl">
              <div>
                <h2 className="font-bold text-gray-900 text-sm">{selectedTicket.subject}</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  #{String(selectedTicket.id || selectedTicket._id || '').substring(0, 8)} • {selectedTicket.client?.companyName || 'Client'}
                </p>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-3 border-b border-gray-100 flex gap-2">
              {selectedTicket.status !== 'IN_PROGRESS' && selectedTicket.status !== 'RESOLVED' && (
                <button 
                  onClick={() => updateTicketStatus(selectedTicket.id || selectedTicket._id, 'IN_PROGRESS')} 
                  className="flex-1 text-[11px] py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 font-bold transition-colors cursor-pointer"
                >
                  Mark In Progress
                </button>
              )}
              {selectedTicket.status !== 'RESOLVED' && (
                <button 
                  onClick={() => updateTicketStatus(selectedTicket.id || selectedTicket._id, 'RESOLVED')} 
                  className="flex-1 text-[11px] py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 font-bold transition-colors cursor-pointer"
                >
                  Mark Resolved
                </button>
              )}
              {selectedTicket.status === 'RESOLVED' && (
                <button 
                  onClick={() => updateTicketStatus(selectedTicket.id || selectedTicket._id, 'OPEN')} 
                  className="flex-1 text-[11px] py-1.5 bg-gray-100 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-200 font-bold transition-colors cursor-pointer"
                >
                  Reopen Ticket
                </button>
              )}
            </div>

            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
              <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-100 text-xs">
                <div className="flex justify-between items-center mb-1.5 text-gray-400">
                  <span className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">Client Description</span>
                  <span>{formatDate(selectedTicket.createdAt)}</span>
                </div>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedTicket.description}</p>
              </div>

              {selectedTicket.response && (
                <div className="bg-blue-50 rounded-lg p-3.5 border border-blue-100 text-xs">
                  <div className="flex justify-between items-center mb-1.5 text-blue-500">
                    <span className="font-bold uppercase tracking-wider text-[10px]">Staff Response</span>
                  </div>
                  <p className="text-blue-900 leading-relaxed">{selectedTicket.response}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
              <textarea 
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Type resolution notes or reply..." 
                className="w-full border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none min-h-[80px]"
              />
              <Button 
                onClick={handleSendResponse}
                disabled={!responseMessage.trim()}
                className="mt-2 w-full flex items-center justify-center gap-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-semibold py-2"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Send Response
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Ticket Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Support Ticket">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1">Brand / Client</label>
            <select 
              name="clientId" 
              value={formData.clientId} 
              onChange={handleInputChange} 
              required 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Select Client</option>
              {clients.map(c => <option key={c.id || c._id} value={c.id || c._id}>{c.companyName || c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1">Ticket Subject</label>
            <input 
              type="text" 
              name="subject" 
              placeholder="e.g. Revision request on Reel #3" 
              value={formData.subject} 
              onChange={handleInputChange} 
              required 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500" 
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1">Priority</label>
            <select 
              name="priority" 
              value={formData.priority} 
              onChange={handleInputChange} 
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-gray-700 uppercase tracking-wider mb-1">Description</label>
            <textarea 
              rows={4} 
              name="description" 
              placeholder="Describe the client inquiry or issue in detail..." 
              value={formData.description} 
              onChange={handleInputChange} 
              required 
              className="w-full border border-gray-300 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-amber-500" 
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-white">
              {submitting ? 'Creating...' : 'Log Ticket'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TicketsPage;
