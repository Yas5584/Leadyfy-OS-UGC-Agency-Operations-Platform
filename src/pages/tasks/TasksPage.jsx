import React, { useState, useEffect } from 'react';
import { Plus, LayoutGrid, List } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { taskService } from '../../services/api';
import { formatDateTime } from '../../utils/formatters';
import { Button, Card, Modal, DataTable, KanbanBoard, StatusBadge, Skeleton, FormField, Input, Textarea, Select } from '../../components/ui';

export default function TasksPage() {
  const { showToast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const initialForm = { title: '', description: '', priority: 'MEDIUM', status: 'TODO', deadline: '' };
  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTasks();
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
        deadline: formData.deadline || null
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

  const columns = [
    {key: 'title', title: 'Title'},
    {key: 'assignee', title: 'Assignee', render: (_, r) => r.assignee?.name},
    {key: 'priority', title: 'Priority', render: v => <StatusBadge status={v} />},
    {key: 'deadline', title: 'Deadline', render: v => formatDateTime(v)},
    {key: 'status', title: 'Status', render: v => <StatusBadge status={v} />}
  ];

  const kCols = ['TODO', 'IN_PROGRESS', 'DONE'].map(status => ({
    id: status,
    title: status.replace('_', ' '),
    cards: tasks.filter(t => t.status === status).map(t => ({
      id: t.id,
      title: t.title,
      description: t.assignee?.name || 'Unassigned',
      badge: t.priority,
      dueDate: t.deadline
    }))
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
        <div className="flex gap-2">
          <div className="bg-gray-100 p-1 rounded-md flex">
            <Button variant={viewMode === 'kanban' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('kanban')}><LayoutGrid className="w-4 h-4" /></Button>
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')}><List className="w-4 h-4" /></Button>
          </div>
          <Button onClick={() => setIsAddOpen(true)} className="bg-amber-500 hover:bg-amber-600"><Plus className="w-4 h-4 mr-2" /> Add Task</Button>
        </div>
      </div>

      {loading ? <Skeleton className="h-64 w-full" /> : (
        viewMode === 'kanban' ? 
          <KanbanBoard columns={kCols} onCardMove={handleCardMove} onCardClick={() => {}} /> : 
          <Card className="p-0"><DataTable columns={columns} data={tasks} emptyMessage="No tasks found." /></Card>
      )}

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Task">
        <form onSubmit={handleAdd} className="space-y-4">
          <FormField label="Title" required><Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required /></FormField>
          <FormField label="Description"><Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Priority">
              <Select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
              </Select>
            </FormField>
            <FormField label="Deadline"><Input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} /></FormField>
          </div>
          <Button type="submit" disabled={submitting} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
