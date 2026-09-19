import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, ShieldAlert, UserCheck, Mail, Briefcase, 
  Phone, Calendar, DollarSign, Award, CheckCircle2, Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { employeeService } from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { USER_ROLES } from '../../utils/constants';
import { Card, Button, Modal, Skeleton, FormField, Input, Select, Badge } from '../../components/ui';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { user } = useAuth();
  const { showToast } = useToast();

  const isOwner = user?.role === 'OWNER';

  const initialForm = {
    name: '',
    email: '',
    password: 'Demo@123',
    role: 'EDITOR',
    department: 'Video Editing',
    position: 'Video Editor',
    salary: '',
    joinDate: new Date().toISOString().split('T')[0],
    phone: ''
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await employeeService.getAll();
      const list = res?.data || (Array.isArray(res) ? res : []);
      setEmployees(list);
    } catch (error) {
      showToast('Failed to load employees', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.role) {
      showToast('Name, email, and role are required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await employeeService.create(formData);
      showToast('Team member onboarded successfully', 'success');
      setIsAddOpen(false);
      setFormData(initialForm);
      fetchEmployees();
    } catch (err) {
      showToast(err.message || 'Failed to create employee', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingEmployee) return;

    try {
      setSubmitting(true);
      await employeeService.update(editingEmployee.id, {
        name: formData.name,
        role: formData.role,
        department: formData.department,
        position: formData.position,
        salary: formData.salary,
        joinDate: formData.joinDate,
        phone: formData.phone
      });
      showToast('Staff profile updated', 'success');
      setEditingEmployee(null);
      fetchEmployees();
    } catch (err) {
      showToast(err.message || 'Failed to update employee', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.user?.name || '',
      email: emp.user?.email || '',
      role: emp.user?.role || 'STAFF',
      department: emp.department || 'Operations',
      position: emp.position || 'Team Member',
      salary: emp.salary ? String(emp.salary) : '',
      joinDate: emp.joinDate ? new Date(emp.joinDate).toISOString().split('T')[0] : '',
      phone: emp.user?.phone || ''
    });
  };

  if (user?.role !== 'OWNER' && user?.role !== 'ADMIN') {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Access Restricted</h2>
        <p className="text-gray-500 mt-2">Only Executive Owners and Admins have clearance for staff operations.</p>
      </div>
    );
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'OWNER': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'ADMIN': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'SCRIPT_WRITER': return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'SHOOT_MANAGER': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'EDITOR': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'SALES': return 'bg-green-100 text-green-800 border border-green-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const name = emp.user?.name || '';
    const email = emp.user?.email || '';
    const dept = emp.department || '';
    const pos = emp.position || '';
    const matchesSearch = 
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pos.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDepartment ? dept === selectedDepartment : true;
    return matchesSearch && matchesDept;
  });

  const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-[#111111]">Internal Team & Staff Directory</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
              {employees.length} Staff Members
            </span>
          </div>
          <p className="text-gray-500 text-xs mt-0.5">
            Manage operational team profiles, compensation ledgers, and live production output
          </p>
        </div>
        <Button onClick={() => { setFormData(initialForm); setIsAddOpen(true); }} className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" /> Onboard Employee
        </Button>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border border-gray-200 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input 
            placeholder="Search by staff name, email, or title..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <Select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Employees Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">Employee</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Department & Title</th>
                  {isOwner && <th className="px-6 py-3.5">Salary</th>}
                  <th className="px-6 py-3.5">Live Production Output</th>
                  <th className="px-6 py-3.5">Joined</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmployees.map((emp) => {
                  const name = emp.user?.name || 'Team Member';
                  const email = emp.user?.email || '-';
                  const role = emp.user?.role || 'STAFF';
                  const counts = emp._count || {};

                  return (
                    <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-bold text-gray-900 block">{name}</span>
                        <span className="text-xs text-gray-400 font-mono">{email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getRoleBadgeColor(role)}`}>
                          {role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <span className="font-semibold text-gray-800 block">{emp.position || 'Team Member'}</span>
                        <span className="text-gray-400">{emp.department || 'Operations'}</span>
                      </td>
                      {isOwner && (
                        <td className="px-6 py-4 text-xs font-mono font-bold text-gray-900">
                          {emp.salary ? formatCurrency(emp.salary) : '—'}
                        </td>
                      )}
                      <td className="px-6 py-4 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          {counts.writtenScripts > 0 && (
                            <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 text-[11px] font-bold" title="Scripts Written">
                              {counts.writtenScripts} Scripts
                            </span>
                          )}
                          {counts.managedShoots > 0 && (
                            <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 text-[11px] font-bold" title="Shoots Managed">
                              {counts.managedShoots} Shoots
                            </span>
                          )}
                          {counts.editedVideos > 0 && (
                            <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded border border-indigo-200 text-[11px] font-bold" title="Videos Edited">
                              {counts.editedVideos} Videos
                            </span>
                          )}
                          {counts.assignedClients > 0 && (
                            <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 text-[11px] font-bold" title="Clients Managed">
                              {counts.assignedClients} Clients
                            </span>
                          )}
                          {!counts.writtenScripts && !counts.managedShoots && !counts.editedVideos && !counts.assignedClients && (
                            <span className="text-gray-400 italic text-[11px]">Ready for assignment</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500">{formatDate(emp.joinDate || emp.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEdit(emp)}
                          className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-amber-600 transition-colors"
                          title="Edit Profile"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Onboard / Add Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Onboard New Team Member">
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Full Name" required>
              <Input
                placeholder="e.g. Priya Nair"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </FormField>
            <FormField label="Work Email" required>
              <Input
                type="email"
                placeholder="priya@leadyfy.demo"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="System Role" required>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                {USER_ROLES.filter(r => r !== 'CLIENT').map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Department">
              <Input
                placeholder="e.g. Video Editing, Scriptwriting"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Position Title">
              <Input
                placeholder="e.g. Lead Motion Editor"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </FormField>
            <FormField label="Monthly Salary (₹)">
              <Input
                type="number"
                placeholder="e.g. 55000"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Contact Phone">
              <Input
                placeholder="+91 98765 43210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </FormField>
            <FormField label="Joining Date">
              <Input
                type="date"
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-white">
              {submitting ? 'Creating...' : 'Confirm Onboarding'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal isOpen={!!editingEmployee} onClose={() => setEditingEmployee(null)} title={`Edit Staff — ${formData.name}`}>
        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Full Name" required>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </FormField>
            <FormField label="System Role" required>
              <Select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                {USER_ROLES.filter(r => r !== 'CLIENT').map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Department">
              <Input
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </FormField>
            <FormField label="Position Title">
              <Input
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Monthly Salary (₹)">
              <Input
                type="number"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              />
            </FormField>
            <FormField label="Contact Phone">
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setEditingEmployee(null)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-white">
              {submitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
