import React, { useState, useEffect } from 'react';
import { Plus, LayoutGrid, List, FileText, ChevronRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { scriptService, clientService, orderService, employeeService, creatorService } from '../../services/api';
import { SCRIPT_PIPELINE_COLUMNS, SCRIPT_STATUSES } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import { Button, Card, Modal, DataTable, KanbanBoard, StatusBadge, Skeleton, FormField, Select, Input, Textarea } from '../../components/ui';

export default function ScriptsPage() {
  const { showToast } = useToast();
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedScript, setSelectedScript] = useState(null);
  const [clients, setClients] = useState([]);
  const [orders, setOrders] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [creators, setCreators] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = { 
    clientId: '', 
    orderId: '', 
    videoNumber: '1', 
    title: '', 
    language: 'Hindi', 
    deadline: '', 
    scriptText: '',
    writerId: '',
    creatorId: '',
    referenceLinks: '',
    comments: ''
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchScripts();
    clientService.getAll().then(res => setClients(res?.data || [])).catch(console.error);
    orderService.getAll().then(res => setOrders(res?.data || [])).catch(console.error);
    employeeService.getAll().then(res => setEmployees(res?.data || [])).catch(console.error);
    creatorService.getAll().then(res => setCreators(res?.data || [])).catch(console.error);
  }, []);

  const fetchScripts = async () => {
    try {
      setLoading(true);
      const res = await scriptService.getAll();
      const list = res?.data || (Array.isArray(res) ? res : []);
      setScripts(list);
    } catch (error) {
      showToast('Failed to load scripts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (scriptId, newStatus) => {
    try {
      await scriptService.updateStatus(scriptId, { status: newStatus });
      showToast('Script stage updated', 'success');
      fetchScripts();
    } catch (error) {
      showToast('Failed to update stage', 'error');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.clientId || !formData.orderId) {
      showToast('Client and associated order are required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await scriptService.create({
        ...formData,
        videoNumber: parseInt(formData.videoNumber) || 1
      });
      showToast('Script drafted successfully', 'success');
      setIsAddOpen(false);
      setFormData(initialForm);
      fetchScripts();
    } catch (error) {
      showToast(error.message || 'Failed to create script', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { 
      key: 'client', 
      title: 'Client', 
      render: (_, r) => (
        <div>
          <span className="font-bold text-gray-900 block">{r.client?.companyName || 'Client'}</span>
          <span className="text-xs text-gray-400">Order: {r.order?.packageName || 'Standard'}</span>
        </div>
      )
    },
    { 
      key: 'videoNumber', 
      title: 'Video #', 
      render: (v) => <span className="font-mono font-bold text-amber-600">#{v}</span> 
    },
    { 
      key: 'language', 
      title: 'Language', 
      render: (v) => <span className="text-xs text-gray-600">{v || 'Hindi'}</span> 
    },
    { 
      key: 'writer', 
      title: 'Writer', 
      render: (_, r) => <span className="text-xs font-medium text-gray-700">{r.writer?.name || 'Unassigned'}</span> 
    },
    { 
      key: 'status', 
      title: 'Stage', 
      render: (v) => <StatusBadge status={v} type="script" /> 
    },
    { 
      key: 'deadline', 
      title: 'Deadline', 
      render: (v) => <span className="text-xs text-gray-500">{formatDate(v)}</span> 
    },
    { 
      key: 'revisionCount', 
      title: 'Revisions', 
      render: (v) => (
        <span className={`text-xs px-2 py-0.5 rounded-full ${v > 0 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'}`}>
          {v || 0} rev
        </span>
      ) 
    }
  ];

  // Map over SCRIPT_PIPELINE_COLUMNS ensuring cards match column ID
  const kanbanColumns = SCRIPT_PIPELINE_COLUMNS.map(col => {
    const matching = scripts.filter(s => s.status === col.id);
    return {
      id: col.id,
      title: col.title,
      color: col.color,
      cards: matching.map(s => ({
        id: s.id,
        title: `${s.client?.companyName || 'Client'} - Script #${s.videoNumber}`,
        description: `Writer: ${s.writer?.name || 'Unassigned'}\nOrder: ${s.order?.packageName || 'UGC'}`,
        badge: s.revisionCount > 0 ? `${s.revisionCount} Revs` : null,
        dueDate: s.deadline,
        raw: s
      }))
    };
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-[#111111]">Scriptwriting Board</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {scripts.length} Total Scripts
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Drafts, client approvals, and creator-ready scripts</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
            <Button 
              variant={viewMode === 'kanban' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('kanban')} 
              className={viewMode === 'kanban' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'}
            >
              <LayoutGrid className="w-4 h-4 mr-1.5" /> Pipeline
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => setViewMode('list')} 
              className={viewMode === 'list' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'}
            >
              <List className="w-4 h-4 mr-1.5" /> Table
            </Button>
          </div>
          <Button onClick={() => setIsAddOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Script
          </Button>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : (
        <div>
          {viewMode === 'kanban' ? (
            <div className="overflow-x-auto pb-4">
              <KanbanBoard 
                columns={kanbanColumns} 
                onCardClick={(c) => setSelectedScript(c.raw)} 
                onCardMove={(cardId, targetCol) => handleStatusChange(cardId, targetCol)} 
              />
            </div>
          ) : (
            <Card className="p-0 overflow-hidden border border-gray-200/80 bg-white">
              <DataTable 
                columns={columns} 
                data={scripts} 
                onRowClick={(row) => setSelectedScript(row)}
                emptyMessage="No scripts created yet." 
              />
            </Card>
          )}
        </div>
      )}

      {/* Script Detail & ScriptText View Modal */}
      <Modal 
        isOpen={!!selectedScript} 
        onClose={() => setSelectedScript(null)} 
        title={selectedScript ? `${selectedScript.client?.companyName} — Script #${selectedScript.videoNumber}` : 'Script'}
      >
        {selectedScript && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-gray-500">Stage:</span>
              <StatusBadge status={selectedScript.status} type="script" />
            </div>

            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
              <div>
                <span className="text-gray-400 block font-medium">Assigned Writer</span>
                <span className="font-semibold text-gray-900">{selectedScript.writer?.name || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Target Creator</span>
                <span className="font-semibold text-gray-900">{selectedScript.creator?.name || selectedScript.creator?.handle || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Language</span>
                <span className="font-semibold text-gray-900">{selectedScript.language || 'Hindi'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Deadline</span>
                <span className="font-semibold text-gray-900">{formatDate(selectedScript.deadline)}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Revisions</span>
                <span className="font-semibold text-gray-900">{selectedScript.revisionCount || 0}</span>
              </div>
            </div>

            {(selectedScript.referenceLinks || selectedScript.comments) && (
              <div className="grid grid-cols-1 gap-3 bg-gray-50 p-3 rounded-lg">
                {selectedScript.referenceLinks && (
                  <div>
                    <span className="text-gray-400 block font-medium">Reference Links</span>
                    <a href={selectedScript.referenceLinks} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline break-all">
                      {selectedScript.referenceLinks}
                    </a>
                  </div>
                )}
                {selectedScript.comments && (
                  <div>
                    <span className="text-gray-400 block font-medium">Comments</span>
                    <span className="text-gray-900">{selectedScript.comments}</span>
                  </div>
                )}
              </div>
            )}

            <div>
              <span className="font-bold text-gray-800 block mb-1">Full Script Draft:</span>
              <div className="p-3 bg-gray-50 border border-gray-200/80 rounded-lg max-h-56 overflow-y-auto whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                {selectedScript.scriptText || 'No draft content entered yet.'}
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">Move stage:</span>
                <select
                  value={selectedScript.status}
                  onChange={(e) => {
                    handleStatusChange(selectedScript.id, e.target.value);
                    setSelectedScript({ ...selectedScript, status: e.target.value });
                  }}
                  className="px-2 py-1 bg-white border border-gray-300 rounded text-xs"
                >
                  {SCRIPT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <Button variant="outline" onClick={() => setSelectedScript(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Script Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Draft New Script">
        <form onSubmit={handleAdd} className="space-y-4">
          <FormField label="Client" required>
            <Select 
              value={formData.clientId} 
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} 
              required
            >
              <option value="">Select Client</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.companyName}</option>)}
            </Select>
          </FormField>

          <FormField label="Order" required>
            <Select 
              value={formData.orderId} 
              onChange={(e) => setFormData({ ...formData, orderId: e.target.value })} 
              required
            >
              <option value="">Select Contract / Order</option>
              {orders
                .filter(o => !formData.clientId || o.clientId === formData.clientId)
                .map(o => (
                  <option key={o.id} value={o.id}>
                    {o.packageName} (#{o.id.substring(0, 6)})
                  </option>
                ))}
            </Select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Video Number" required>
              <Input 
                type="number" 
                min="1" 
                value={formData.videoNumber} 
                onChange={(e) => setFormData({ ...formData, videoNumber: e.target.value })} 
                required 
              />
            </FormField>
            <FormField label="Language">
              <Select 
                value={formData.language} 
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
                <option value="Hinglish">Hinglish</option>
                <option value="Tamil">Tamil</option>
                <option value="Telugu">Telugu</option>
              </Select>
            </FormField>
          </div>

          <FormField label="Target Deadline">
            <Input 
              type="date" 
              value={formData.deadline} 
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} 
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Assigned Writer">
              <Select 
                value={formData.writerId} 
                onChange={(e) => setFormData({ ...formData, writerId: e.target.value })} 
              >
                <option value="">Select Writer</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </Select>
            </FormField>
            
            <FormField label="Targeted Creator">
              <Select 
                value={formData.creatorId} 
                onChange={(e) => setFormData({ ...formData, creatorId: e.target.value })} 
              >
                <option value="">Select Creator</option>
                {creators.map(c => <option key={c.id} value={c.id}>{c.name || c.handle}</option>)}
              </Select>
            </FormField>
          </div>

          <FormField label="Reference Links">
            <Textarea 
              rows={2}
              placeholder="e.g. https://example.com/ref"
              value={formData.referenceLinks} 
              onChange={(e) => setFormData({ ...formData, referenceLinks: e.target.value })} 
            />
          </FormField>

          <FormField label="Additional Comments">
            <Textarea 
              rows={2} 
              placeholder="Any specific instructions..."
              value={formData.comments} 
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })} 
            />
          </FormField>

          <FormField label="Script Content (Hook, Body, CTA)">
            <Textarea 
              rows={5} 
              placeholder="Hook: Stop scrolling if you want...&#10;Body: Here is how this brand changed my routine...&#10;CTA: Check the link in bio!"
              value={formData.scriptText} 
              onChange={(e) => setFormData({ ...formData, scriptText: e.target.value })} 
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-white">
              {submitting ? 'Creating...' : 'Draft Script'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
