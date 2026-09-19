import React, { useState, useEffect } from 'react';
import { Headphones, Plus } from 'lucide-react';
import { ticketService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import StatusBadge from '../../components/ui/StatusBadge';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';

export default function PortalSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'MEDIUM' });
  const { showToast } = useToast();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await ticketService.getAll();
      setTickets(res.data);
    } catch (err) {
      showToast('Failed to load tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await ticketService.create(form);
      showToast('Support ticket created', 'success');
      setIsModalOpen(false);
      setForm({ subject: '', description: '', priority: 'MEDIUM' });
      fetchTickets();
    } catch (err) {
      showToast('Failed to create ticket', 'error');
    }
  };

  if (loading) return <div className="grid grid-cols-1 gap-4"><SkeletonCard/><SkeletonCard/></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Support</h1>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Ticket
        </Button>
      </div>

      {!tickets || tickets.length === 0 ? (
        <EmptyState icon={Headphones} title="No Tickets" description="You have no active support tickets." />
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
          {tickets.map(ticket => (
            <div 
              key={ticket.id} 
              onClick={() => setSelectedTicket(ticket)}
              className="p-4 hover:bg-gray-50 cursor-pointer flex items-center justify-between transition-colors"
            >
              <div className="space-y-1">
                <h4 className="font-medium text-gray-900">{ticket.subject}</h4>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span>#{ticket.id}</span>
                  <span>{formatDate(ticket.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={ticket.priority === 'HIGH' ? 'error' : 'default'}>{ticket.priority}</Badge>
                <StatusBadge status={ticket.status} />
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Support Ticket">
        <form onSubmit={handleCreate} className="space-y-4">
          <FormField label="Subject" required>
            <Input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required />
          </FormField>
          <FormField label="Priority" required>
            <Select 
              options={[
                { label: 'Low', value: 'LOW' },
                { label: 'Medium', value: 'MEDIUM' },
                { label: 'High', value: 'HIGH' }
              ]}
              value={form.priority} 
              onChange={e => setForm({...form, priority: e.target.value})} 
            />
          </FormField>
          <FormField label="Description" required>
            <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} required rows={5} />
          </FormField>
          <div className="flex justify-end pt-4">
            <Button type="submit">Submit Ticket</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title={selectedTicket?.subject || ''}>
        {selectedTicket && (
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div className="space-y-1">
                <p className="text-sm text-gray-500">Ticket #{selectedTicket.id}</p>
                <p className="text-xs text-gray-400">{formatDate(selectedTicket.createdAt)}</p>
              </div>
              <StatusBadge status={selectedTicket.status} />
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">{selectedTicket.description}</p>
            </div>
            {selectedTicket.response && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2"><Headphones className="w-4 h-4 text-amber-500"/> Support Response</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap bg-amber-50 border border-amber-100 p-4 rounded-lg">{selectedTicket.response}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
