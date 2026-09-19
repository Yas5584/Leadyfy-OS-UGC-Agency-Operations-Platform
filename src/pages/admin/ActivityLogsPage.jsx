import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Filter, Search, ShieldAlert, ScrollText, ArrowUpRight, 
  ChevronLeft, ChevronRight, User, Clock, Building 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { formatDateTime } from '../../utils/formatters';
import { Card, Button, Badge, Skeleton, Input, Select } from '../../components/ui';

export default function ActivityLogsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [loading, setLoading] = useState(true);

  const [actionFilter, setActionFilter] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, entityFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      if (actionFilter) params.append('action', actionFilter);
      if (entityFilter) params.append('entity', entityFilter);

      const res = await api.get(`/activity-logs?${params.toString()}`);
      const list = res?.data || (Array.isArray(res) ? res : []);
      setLogs(list);
      setTotal(res?.meta?.total || list.length);
    } catch (error) {
      showToast('Failed to load activity logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'OWNER' && user?.role !== 'ADMIN') {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full text-center">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-500 mt-2">Only Owners and Admins have access to the immutable audit trail.</p>
      </div>
    );
  }

  const handleEntityClick = (entity, entityId) => {
    if (!entityId) return;
    switch (entity) {
      case 'CLIENT': navigate(`/clients/${entityId}`); break;
      case 'ORDER': navigate(`/orders/${entityId}`); break;
      case 'SCRIPT': navigate(`/scripts`); break;
      case 'SHOOT': navigate(`/shoots`); break;
      case 'VIDEO': navigate(`/videos`); break;
      case 'PAYMENT': navigate(`/payments`); break;
      default: break;
    }
  };

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const userName = log.user?.name?.toLowerCase() || '';
    const clientName = log.client?.companyName?.toLowerCase() || '';
    const entity = log.entity?.toLowerCase() || '';
    const action = log.action?.toLowerCase() || '';
    return userName.includes(term) || clientName.includes(term) || entity.includes(term) || action.includes(term);
  });

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-[#111111]">System Audit Logs</h1>
            <Badge className="bg-purple-100 text-purple-800 border border-purple-200 font-mono text-[11px]">
              {total} Logged Events
            </Badge>
          </div>
          <p className="text-gray-500 text-xs mt-0.5">
            Immutable regulatory audit trail recording all client, video, and financial operations
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-4 border border-gray-200 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            placeholder="Search by user, client, or event..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Select value={entityFilter} onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}>
            <option value="">All Entities</option>
            <option value="CLIENT">Clients</option>
            <option value="ORDER">Orders</option>
            <option value="SCRIPT">Scripts</option>
            <option value="SHOOT">Shoots</option>
            <option value="VIDEO">Videos</option>
            <option value="PAYMENT">Payments</option>
            <option value="EMPLOYEE">Employees</option>
          </Select>

          <Select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}>
            <option value="">All Actions</option>
            <option value="CREATE">Create</option>
            <option value="UPDATE">Update</option>
            <option value="UPDATE_STATUS">Status Change</option>
            <option value="DELETE">Delete</option>
          </Select>
        </div>
      </Card>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <ScrollText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-gray-700">No activity logs recorded for this criteria</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5">Operator</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Target Entity</th>
                  <th className="px-5 py-3.5">Related Brand / Client</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => {
                  const userName = log.user?.name || 'System / Automated';
                  const userRole = log.user?.role;
                  const clientName = log.client?.companyName;

                  return (
                    <tr key={log.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-[11px]">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{userName}</span>
                            {userRole && <span className="text-[10px] text-gray-400 font-mono">{userRole}</span>}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                          log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                          log.action.includes('UPDATE') ? 'bg-blue-100 text-blue-800' :
                          log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {log.action.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => handleEntityClick(log.entity, log.entityId)}
                          className="font-semibold text-gray-800 hover:text-amber-600 flex items-center gap-1 transition-colors text-left"
                        >
                          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[11px] font-mono text-gray-700">
                            {log.entity}
                          </span>
                          {log.entityId && (
                            <span className="text-[10px] text-gray-400 truncate max-w-[120px]">
                              #{log.entityId.substring(0, 8)}
                            </span>
                          )}
                          <ArrowUpRight className="w-3 h-3 text-gray-300" />
                        </button>
                      </td>

                      <td className="px-5 py-3.5 text-gray-700">
                        {clientName ? (
                          <span className="font-medium text-gray-900">{clientName}</span>
                        ) : (
                          <span className="text-gray-400 italic">—</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 text-gray-500 font-mono text-[11px]">
                        {formatDateTime(log.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing page <strong>{page}</strong> of <strong>{totalPages}</strong> ({total} entries)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(prev => Math.max(1, prev - 1))}
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
