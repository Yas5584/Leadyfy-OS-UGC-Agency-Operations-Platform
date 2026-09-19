import React, { useState, useEffect } from 'react';
import { Plus, LayoutGrid, List, Paperclip, ExternalLink, Calendar, User, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { taskService, employeeService } from '../../services/api';
import { formatDateTime, formatDate } from '../../utils/formatters';
import { TASK_PRIORITIES, TASK_STATUSES } from '../../utils/constants';
import { Button, Card, Modal, DataTable, KanbanBoard, StatusBadge, Skeleton, FormField, Input, Textarea, Select, Badge } from '../../components/ui';

export default function TasksPage() {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const initialForm = { 
    title: '', 
    description: '', 
    assigneeId: '', 
    priority: 'MEDIUM', 
    status: 'TODO', 
    deadline: '',
    attachments: ''
  };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
    employeeService.getAll({ limit: 100 })
      .then(res => setEmployees(res?.data || (Array.isArray(res) ? res : [])))
      .catch(console.error);
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await taskService.getAll();
      setTasks(res.data || []);
    } catch (e) {
      showToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      showToast('Please enter a task title', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await taskService.create({
        ...formData,
        assigneeId: formData.assigneeId || null,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
        attachments: formData.attachments?.trim() || null
      });
      showToast('Task added successfully', 'success');
      setIsAddOpen(false);
      setFormData(initialForm);
      fetchTasks();
    } catch (e) {
      showToast(e.message || 'Failed to add task', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardMove = async (cardId, newStatus) => {
    try {
      await taskService.update(cardId, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === cardId ? { ...t, status: newStatus } : t));
      showToast(`Task moved to ${newStatus.replace('_', ' ')}`, 'success');
    } catch (e) {
      showToast(e.message || 'Failed to update task', 'error');
    }
  };

  const handleUpdateSelectedTaskStatus = async (newStatus) => {
    if (!selectedTask) return;
    try {
      await taskService.update(selectedTask.id, { status: newStatus });
      setSelectedTask(prev => ({ ...prev, status: newStatus }));
      setTasks(prev => prev.map(t => t.id === selectedTask.id ? { ...t, status: newStatus } : t));
      showToast(`Task marked as ${newStatus}`, 'success');
    } catch (err) {
      showToast('Failed to update task status', 'error');
    }
  };

  const columns = [
    { key: 'title', title: 'Task Title', render: (val, row) => (
      <div>
        <span className="font-bold text-gray-900 block">{val}</span>
        {row.attachments && (
          <span className="text-[11px] text-amber-600 flex items-center gap-1 mt-0.5">
            <Paperclip className="w-3 h-3" /> Attached Brief
          </span>
        )}
      </div>
    )},
    { key: 'assignee', title: 'Assignee', render: (_, r) => r.assignee?.name || 'Unassigned' },
    { key: 'priority', title: 'Priority', render: v => <StatusBadge status={v} /> },
    { key: 'deadline', title: 'Deadline', render: v => v ? formatDate(v) : 'No Deadline' },
    { key: 'status', title: 'Status', render: v => <StatusBadge status={v} /> },
    { key: 'actions', title: 'Actions', render: (_, row) => (
      <Button variant="ghost" size="sm" onClick={() => setSelectedTask(row)}>
        Details
      </Button>
    )}
  ];

  const kCols = ['TODO', 'IN_PROGRESS', 'DONE'].map(status => ({
    id: status,
    title: status.replace('_', ' '),
    cards: tasks.filter(t => t.status === status).map(t => ({
      id: t.id,
      title: t.title,
      description: t.assignee?.name ? `👤 ${t.assignee.name}` : 'Unassigned',
      badge: t.priority,
      dueDate: t.deadline,
      rawTask: t
    }))
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto h-full flex flex-col space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Internal Task Operations</h1>
          <p className="text-xs text-gray-500 mt-0.5">Cross-functional team assignments, briefs, and deadlines</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-md flex">
            <Button variant={viewMode === 'kanban' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('kanban')}>
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')}>
              <List className="w-4 h-4" />
            </Button>
          </div>
          <Button onClick={() => setIsAddOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 text-xs">
            <Plus className="w-4 h-4" /> Add Task
          </Button>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : viewMode === 'kanban' ? (
        <KanbanBoard 
          columns={kCols} 
          onCardMove={handleCardMove} 
          onCardClick={(card) => {
            const found = tasks.find(t => t.id === card.id);
            if (found) setSelectedTask(found);
          }} 
        />
      ) : (
        <Card className="p-0 overflow-hidden border border-gray-200 bg-white">
          <DataTable 
            columns={columns} 
            data={tasks} 
            onRowClick={(row) => setSelectedTask(row)}
            emptyMessage="No tasks found." 
          />
        </Card>
      )}

      {/* Add Task Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create New Task">
        <form onSubmit={handleAdd} className="space-y-4 text-xs">
          <FormField label="Task Title" required>
            <Input 
              placeholder="e.g. Color grade Scene 2 rough cut for Acme" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              required 
            />
          </FormField>

          <FormField label="Description & Notes">
            <Textarea 
              rows={3} 
              placeholder="Add key guidelines or deliverables..." 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Assign Team Member">
              <Select
                value={formData.assigneeId}
                onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
              >
                <option value="">Unassigned</option>
                {employees.map(emp => (
                  <option key={emp.userId || emp.id} value={emp.userId || emp.id}>
                    {emp.user?.name || emp.name} ({emp.position || emp.department})
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField label="Priority Level">
              <Select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                {TASK_PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </Select>
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Due Date">
              <Input 
                type="date" 
                value={formData.deadline} 
                onChange={e => setFormData({...formData, deadline: e.target.value})} 
              />
            </FormField>

            <FormField label="Attachment / Brief Link (URL)">
              <Input 
                placeholder="Google Drive, Figma, or Notion link" 
                value={formData.attachments} 
                onChange={e => setFormData({...formData, attachments: e.target.value})} 
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-white">
              {submitting ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Task Detail Modal */}
      <Modal
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title={selectedTask ? selectedTask.title : 'Task Details'}
      >
        {selectedTask && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Status:</span>
                <Select
                  value={selectedTask.status}
                  onChange={(e) => handleUpdateSelectedTaskStatus(e.target.value)}
                  className="text-xs h-8"
                >
                  {TASK_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
              <StatusBadge status={selectedTask.priority} />
            </div>

            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
              <div>
                <span className="text-gray-400 block font-medium">Assignee</span>
                <span className="font-bold text-gray-900">{selectedTask.assignee?.name || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Due Date</span>
                <span className="font-bold text-gray-900">{selectedTask.deadline ? formatDate(selectedTask.deadline) : 'No Deadline'}</span>
              </div>
            </div>

            {selectedTask.description && (
              <div>
                <span className="text-gray-500 font-bold block mb-1">Description:</span>
                <p className="p-3 bg-gray-50 rounded border border-gray-100 text-gray-800 whitespace-pre-wrap">
                  {selectedTask.description}
                </p>
              </div>
            )}

            {selectedTask.attachments && (
              <div className="pt-2 border-t border-gray-100">
                <span className="text-gray-500 font-bold block mb-1.5">Attached Brief / Link:</span>
                <a
                  href={selectedTask.attachments}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-amber-600 hover:underline font-bold bg-amber-50 p-2.5 rounded border border-amber-200 break-all"
                >
                  <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                  {selectedTask.attachments}
                </a>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedTask(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
