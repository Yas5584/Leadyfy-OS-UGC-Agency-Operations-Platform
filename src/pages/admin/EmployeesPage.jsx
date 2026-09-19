import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { ShieldAlert, UserCheck, Mail, Briefcase } from 'lucide-react';
import { Card, Skeleton } from '../../components/ui';

const EmployeesPage = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await api.get('/employees');
      const list = res?.data || (Array.isArray(res) ? res : []);
      setEmployees(list);
    } catch (error) {
      showToast('Failed to load employees', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'OWNER' && user?.role !== 'ADMIN') {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-500 mt-2">You do not have permission to view internal staff rosters.</p>
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

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="border-b border-gray-200/80 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black tracking-tight text-[#111111]">Internal Team & Roles</h1>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            {employees.length} Members
          </span>
        </div>
        <p className="text-gray-500 text-xs mt-0.5">Manage operational staff, creators managers, and editors</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200/80 overflow-hidden">
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
                  <th className="px-6 py-3.5">System Role</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Position</th>
                  <th className="px-6 py-3.5">Work Email</th>
                  <th className="px-6 py-3.5">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {employees.map((emp) => {
                  const name = emp.user?.name || emp.name || 'Team Member';
                  const email = emp.user?.email || emp.email || '-';
                  const role = emp.user?.role || emp.role || 'STAFF';
                  return (
                    <tr key={emp.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-gray-900">{name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${getRoleBadgeColor(role)}`}>
                          {role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-700">{emp.department || '-'}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{emp.position || '-'}</td>
                      <td className="px-6 py-4 text-xs text-gray-600 font-mono">{email}</td>
                      <td className="px-6 py-4 text-xs text-gray-500">{formatDate(emp.joinDate || emp.createdAt)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeesPage;
