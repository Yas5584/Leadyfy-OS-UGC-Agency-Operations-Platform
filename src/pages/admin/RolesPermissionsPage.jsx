import React, { useState, useEffect } from 'react';
import { Shield, Check, RotateCcw, Save, AlertCircle, Info, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { 
  DEFAULT_ROLE_PERMISSIONS, 
  getActivePermissions, 
  savePermissions, 
  resetPermissions 
} from '../../utils/permissions';
import { Card, Button, Badge } from '../../components/ui';

const MODULES = [
  { id: 'dashboard', name: 'Dashboard', actions: ['view', 'manage'] },
  { id: 'clients', name: 'Client CRM', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'orders', name: 'Orders & Packages', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'scripts', name: 'Script Management', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'creators', name: 'Creator Hub', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'shoots', name: 'Shoot Logistics', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'videos', name: 'Video Production', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'tasks', name: 'Task Management', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'payments', name: 'Client Payments', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'expenses', name: 'Agency Expenses', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'payouts', name: 'Creator Payouts', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'support', name: 'Support Tickets', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'notifications', name: 'Notifications', actions: ['view', 'manage'] },
  { id: 'employees', name: 'Employees Directory', actions: ['view', 'create', 'edit', 'delete'] },
  { id: 'activity_logs', name: 'System Audit Logs', actions: ['view'] },
  { id: 'reports', name: 'Reports & Analytics', actions: ['view', 'export'] }
];

const ROLES = [
  { id: 'OWNER', label: 'Owner (Super Admin)', color: 'bg-purple-100 text-purple-800' },
  { id: 'ADMIN', label: 'Admin / Ops Manager', color: 'bg-blue-100 text-blue-800' },
  { id: 'SALES', label: 'Sales / BD', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'SCRIPT_WRITER', label: 'Script Writer', color: 'bg-amber-100 text-amber-800' },
  { id: 'SHOOT_MANAGER', label: 'Shoot Manager', color: 'bg-orange-100 text-orange-800' },
  { id: 'EDITOR', label: 'Video Editor', color: 'bg-indigo-100 text-indigo-800' },
  { id: 'CLIENT', label: 'Client (Portal)', color: 'bg-teal-100 text-teal-800' }
];

export default function RolesPermissionsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [permissions, setPermissions] = useState(DEFAULT_ROLE_PERMISSIONS);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setPermissions(getActivePermissions());
  }, []);

  const handleToggle = (moduleId, action) => {
    if (selectedRole === 'OWNER') {
      showToast('Owner permissions cannot be modified (Super Admin policy)', 'info');
      return;
    }

    setPermissions(prev => {
      const rolePerms = { ...(prev[selectedRole] || {}) };
      const currentActions = [...(rolePerms[moduleId] || [])];

      let newActions;
      if (currentActions.includes(action)) {
        newActions = currentActions.filter(a => a !== action);
      } else {
        newActions = [...currentActions, action];
      }

      const updated = {
        ...prev,
        [selectedRole]: {
          ...rolePerms,
          [moduleId]: newActions
        }
      };

      setHasChanges(true);
      return updated;
    });
  };

  const handleSave = () => {
    const success = savePermissions(permissions);
    if (success) {
      showToast('Role permissions saved successfully', 'success');
      setHasChanges(false);
    } else {
      showToast('Failed to save permissions', 'error');
    }
  };

  const handleReset = () => {
    resetPermissions();
    setPermissions(DEFAULT_ROLE_PERMISSIONS);
    setHasChanges(false);
    showToast('Reset to default system permissions', 'success');
  };

  const isChecked = (moduleId, action) => {
    if (selectedRole === 'OWNER') return true;
    return permissions[selectedRole]?.[moduleId]?.includes(action) || false;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-[#111111]">Roles & Permissions</h1>
            <Badge className="bg-amber-100 text-amber-800 border border-amber-300">RBAC Engine</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Configure role-based access control and granular CRUD permissions across system modules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleReset}
            className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!hasChanges}
            className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 text-xs"
          >
            <Save className="w-3.5 h-3.5" /> Save Changes
          </Button>
        </div>
      </div>

      {/* Role Selector Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {ROLES.map(role => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(role.id)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
              selectedRole === role.id
                ? 'bg-[#111111] text-white border-[#111111] shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Shield className={`w-3.5 h-3.5 ${selectedRole === role.id ? 'text-amber-400' : 'text-gray-400'}`} />
            <span>{role.label}</span>
          </button>
        ))}
      </div>

      {/* Role Banner */}
      {selectedRole === 'OWNER' && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3.5 flex items-center gap-3 text-xs text-purple-900">
          <Lock className="w-4 h-4 text-purple-600 flex-shrink-0" />
          <div>
            <span className="font-bold">Super Admin Policy:</span> The Owner role has complete, irrevocable system-wide authority across all financial, operational, and administrative subsystems.
          </div>
        </div>
      )}

      {selectedRole === 'CLIENT' && (
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-3.5 flex items-center gap-3 text-xs text-teal-900">
          <Info className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <div>
            <span className="font-bold">Isolated Client Portal:</span> Client users are restricted exclusively to their isolated portal interface with zero access to internal financial rates, team salaries, or raw logs.
          </div>
        </div>
      )}

      {/* Permissions Matrix */}
      <Card className="p-0 overflow-hidden border border-gray-200 bg-white">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            Module Permissions for: <span className="text-amber-600 font-black">{ROLES.find(r => r.id === selectedRole)?.label}</span>
          </div>
          <span className="text-xs text-gray-400">Toggle checkboxes to grant or revoke actions</span>
        </div>

        <div className="divide-y divide-gray-100">
          {MODULES.map(module => (
            <div key={module.id} className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/70 transition-colors">
              <div className="min-w-[220px]">
                <div className="font-semibold text-sm text-gray-900">{module.name}</div>
                <div className="text-xs text-gray-400 font-mono">module: {module.id}</div>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                {module.actions.map(action => {
                  const checked = isChecked(module.id, action);
                  const disabled = selectedRole === 'OWNER';

                  return (
                    <label 
                      key={action}
                      className={`flex items-center gap-2 text-xs font-medium cursor-pointer select-none ${
                        disabled ? 'cursor-not-allowed opacity-75' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => handleToggle(module.id, action)}
                        className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400 focus:ring-offset-0 transition-colors"
                      />
                      <span className={`capitalize ${checked ? 'text-gray-900 font-semibold' : 'text-gray-400'}`}>
                        {action}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
