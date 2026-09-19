import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Eye, Edit, Building2, User, Phone, Mail, ChevronRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { clientService, employeeService } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { CLIENT_STATUSES } from '../../utils/constants';
import { Button, Card, Modal, DataTable, StatusBadge, Skeleton, FormField, Input, Select, SearchInput } from '../../components/ui';

export default function ClientsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const initialForm = {
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    brandName: '',
    industry: 'E-commerce',
    assignedToId: '',
    status: 'LEAD',
    notes: ''
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchClients();
    fetchEmployees();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await clientService.getAll();
      const list = res?.data || (Array.isArray(res) ? res : []);
      setClients(list);
    } catch (error) {
      showToast('Failed to load clients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await employeeService.getAll();
      const list = res?.data || (Array.isArray(res) ? res : []);
      setEmployees(list);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      showToast('Company name is required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await clientService.create(formData);
      showToast('Client created successfully', 'success');
      setIsAddOpen(false);
      setFormData(initialForm);
      fetchClients();
    } catch (error) {
      showToast(error.message || 'Failed to create client', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.industry?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    const matchesEmployee = employeeFilter ? c.assignedToId === employeeFilter : true;

    return matchesSearch && matchesStatus && matchesEmployee;
  });

  const columns = [
    {
      key: 'companyName',
      title: 'Company',
      render: (val, row) => (
        <div>
          <span className="font-bold text-gray-900 block">{row.companyName}</span>
          <span className="text-xs text-gray-400">{row.brandName || row.contactName || '-'}</span>
        </div>
      )
    },
    {
      key: 'contactName',
      title: 'Contact',
      render: (val, row) => (
        <div className="text-xs">
          <span className="font-medium text-gray-800 block">{row.contactName || '-'}</span>
          <span className="text-gray-400 block">{row.email || row.phone || '-'}</span>
        </div>
      )
    },
    {
      key: 'industry',
      title: 'Industry',
      render: (val) => <span className="text-xs font-medium text-gray-600">{val || 'General'}</span>
    },
    {
      key: 'orders',
      title: 'Orders',
      render: (_, row) => (
        <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded font-semibold text-gray-700">
          {row._count?.orders ?? (row.orders?.length || 0)}
        </span>
      )
    },
    {
      key: 'videos',
      title: 'Videos',
      render: (_, row) => (
        <span className="font-mono text-xs bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-semibold border border-amber-200">
          {row._count?.videos ?? (row.videos?.length || 0)}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (val) => <StatusBadge status={val} type="client" />
    },
    {
      key: 'assignedTo',
      title: 'Assigned To',
      render: (_, row) => {
        const empName = row.assignedTo?.user?.name || row.assignedTo?.name || 'Unassigned';
        return <span className="text-xs text-gray-600">{empName}</span>;
      }
    },
    {
      key: 'createdAt',
      title: 'Created',
      render: (val) => <span className="text-xs text-gray-500">{formatDate(val)}</span>
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/clients/${row.id}`)}
            className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-amber-600 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-[#111111]">Clients CRM</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage brand partners, client pipelines, and accounts</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Client
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border border-gray-200/80 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search company, contact, email..."
          />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Client Statuses</option>
            {CLIENT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
          <Select value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
            <option value="">All Account Managers</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.user?.name || emp.position}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-0 overflow-hidden border border-gray-200/80 bg-white">
        <DataTable
          columns={columns}
          data={filteredClients}
          loading={loading}
          onRowClick={(row) => navigate(`/clients/${row.id}`)}
          emptyMessage="No clients found matching current filters."
        />
      </Card>

      {/* Add Client Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Onboard New Client">
        <form onSubmit={handleAdd} className="space-y-4">
          <FormField label="Company Name" required>
            <Input
              required
              placeholder="e.g. Acme Health Corp"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Brand / Trading Name">
              <Input
                placeholder="e.g. Acme"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
              />
            </FormField>
            <FormField label="Industry">
              <Input
                placeholder="e.g. Health & Fitness"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Contact Person Name">
              <Input
                placeholder="Contact Name"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
              />
            </FormField>
            <FormField label="Work Email">
              <Input
                type="email"
                placeholder="client@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Phone Number">
              <Input
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </FormField>
            <FormField label="Initial Lifecycle Status">
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                {CLIENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <FormField label="Assign Account Manager">
            <Select
              value={formData.assignedToId}
              onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
            >
              <option value="">Select Account Manager</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.user?.name || emp.position} ({emp.department})
                </option>
              ))}
            </Select>
          </FormField>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {submitting ? 'Creating...' : 'Create Client'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}