import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Mail, Phone, MessageSquare, Building, User } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { clientService, employeeService } from '../../services/api';
import { formatDateTime, formatCurrency, getInitials } from '../../utils/formatters';
import { CLIENT_STATUSES } from '../../utils/constants';
import { Badge, Button, Card, Modal, DataTable, StatusBadge, EmptyState, Skeleton, ConfirmDialog, FormField, Input, Select, Tabs, Avatar } from '../../components/ui';

export default function ClientDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [employees, setEmployees] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchClient();
    fetchEmployees();
  }, [id]);

  const fetchClient = async () => {
    try {
      setLoading(true);
      const res = await clientService.getById(id);
      setClient(res.data);
      setFormData(res.data);
    } catch (error) {
      showToast('Failed to load client details', 'error');
      navigate('/clients');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await employeeService.getAll();
      setEmployees(res.data);
    } catch (error) {
      console.error('Failed to load employees', error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const cleanData = {
        companyName: formData.companyName,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        brandName: formData.brandName,
        industry: formData.industry,
        status: formData.status,
        assignedToId: formData.assignedToId
      };
      await clientService.update(id, cleanData);
      showToast('Client updated successfully', 'success');
      setIsEditModalOpen(false);
      fetchClient();
    } catch (error) {
      showToast('Failed to update client', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      await clientService.update(id, { status: 'INACTIVE' });
      showToast('Client deactivated', 'success');
      setIsDeactivateOpen(false);
      fetchClient();
    } catch (error) {
      showToast('Failed to deactivate client', 'error');
    }
  };

  if (loading) {
    return <div className="p-6"><Skeleton className="h-8 w-1/3 mb-6" /><Skeleton className="h-64 w-full" /></div>;
  }

  if (!client) {
    return <EmptyState title="Client not found" description="The requested client could not be found." />;
  }

  const tabs = ['Overview', 'Orders', 'Scripts', 'Videos', 'Invoices', 'Support', 'Activity'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{client.companyName}</h1>
              <StatusBadge status={client.status} type="client" />
            </div>
            <p className="text-gray-500">{client.brandName || 'No brand name'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditModalOpen(true)}><Edit className="w-4 h-4 mr-2" /> Edit</Button>
          <Button variant="destructive" onClick={() => setIsDeactivateOpen(true)}><Trash2 className="w-4 h-4 mr-2" /> Deactivate</Button>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <User className="w-5 h-5 text-gray-400" />
                <span>{client.contactName || 'No contact name'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="w-5 h-5 text-gray-400" />
                <span>{client.email || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-5 h-5 text-gray-400" />
                <span>{client.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <MessageSquare className="w-5 h-5 text-gray-400" />
                <span>{client.whatsapp || 'N/A'}</span>
              </div>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Company Info</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <Building className="w-5 h-5 text-gray-400" />
                <span>Industry: {client.industry || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Badge className="bg-gray-100 text-gray-800">GST: {client.gstId || 'N/A'}</Badge>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <User className="w-5 h-5 text-gray-400" />
                <span>Assigned: {client.assignedTo?.user?.name || 'Unassigned'}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'Orders' && (
        <Card className="p-0">
          <DataTable 
            columns={[
              { key: 'packageName', title: 'Package' },
              { key: 'videoCount', title: 'Videos' },
              { key: 'status', title: 'Status', render: (val) => <StatusBadge status={val} type="order" /> },
              { key: 'dueDate', title: 'Due Date', render: (val) => formatDateTime(val) }
            ]} 
            data={client.orders || []} 
            emptyMessage="No orders found for this client."
          />
        </Card>
      )}
      
      {activeTab === 'Scripts' && (
        <Card className="p-0">
          <DataTable 
            columns={[
              { key: 'videoNumber', title: 'Video #' },
              { key: 'status', title: 'Status', render: (val) => <StatusBadge status={val} type="script" /> },
              { key: 'writer', title: 'Writer', render: (_, row) => row.writer?.name || 'N/A' },
              { key: 'deadline', title: 'Deadline', render: (val) => formatDateTime(val) }
            ]} 
            data={client.scripts || []} 
            emptyMessage="No scripts found."
          />
        </Card>
      )}

      {activeTab === 'Videos' && (
        <Card className="p-0">
          <DataTable 
            columns={[
              { key: 'videoNumber', title: 'Video #' },
              { key: 'status', title: 'Status', render: (val) => <StatusBadge status={val} type="video" /> },
              { key: 'editor', title: 'Editor', render: (_, row) => row.editor?.name || 'N/A' },
              { key: 'deadline', title: 'Deadline', render: (val) => formatDateTime(val) }
            ]} 
            data={client.videos || []} 
            emptyMessage="No videos found."
          />
        </Card>
      )}

      {['Invoices', 'Support', 'Activity'].includes(activeTab) && (
        <Card className="p-6">
          <EmptyState title={`No ${activeTab} data`} description={`There is no ${activeTab.toLowerCase()} data to display for this client yet.`} />
        </Card>
      )}

      <Modal isOpen={isEditModalOpen} onClose={() => !isSaving && setIsEditModalOpen(false)} title="Edit Client">
        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Company Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Company Name" required>
                <Input value={formData.companyName || ''} onChange={e => setFormData({...formData, companyName: e.target.value})} required disabled={isSaving} />
              </FormField>
              <FormField label="Brand Name">
                <Input value={formData.brandName || ''} onChange={e => setFormData({...formData, brandName: e.target.value})} disabled={isSaving} />
              </FormField>
              <FormField label="Industry">
                <Input value={formData.industry || ''} onChange={e => setFormData({...formData, industry: e.target.value})} disabled={isSaving} />
              </FormField>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Contact Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Contact Person Name">
                <Input value={formData.contactName || ''} onChange={e => setFormData({...formData, contactName: e.target.value})} disabled={isSaving} />
              </FormField>
              <FormField label="Email">
                <Input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} disabled={isSaving} />
              </FormField>
              <FormField label="Phone">
                <Input value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} disabled={isSaving} />
              </FormField>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Account Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Status">
                <Select value={formData.status || ''} onChange={e => setFormData({...formData, status: e.target.value})} disabled={isSaving}>
                  {CLIENT_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Account Manager">
                <Select value={formData.assignedToId || ''} onChange={e => setFormData({...formData, assignedToId: e.target.value})} disabled={isSaving}>
                  <option value="">Unassigned</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.user?.name || 'Unknown'}</option>
                  ))}
                </Select>
              </FormField>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} type="button" disabled={isSaving}>Cancel</Button>
            <Button type="submit" className="bg-amber-500 hover:bg-amber-600" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog 
        isOpen={isDeactivateOpen} 
        onClose={() => setIsDeactivateOpen(false)} 
        onConfirm={handleDeactivate}
        title="Deactivate Client"
        message={`Are you sure you want to deactivate ${client.companyName}? They will not be able to access the portal.`}
        confirmText="Deactivate"
        isDestructive
      />
    </div>
  );
}
