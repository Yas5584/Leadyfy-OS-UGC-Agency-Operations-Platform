import React, { useState, useEffect } from 'react';
import { Plus, Calendar as CalendarIcon, List, Camera, MapPin, Clock, User, CheckCircle2, AlertTriangle, Eye } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { shootService, clientService, creatorService, orderService } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { SHOOT_STATUSES } from '../../utils/constants';
import { Button, Card, Modal, DataTable, StatusBadge, Skeleton, FormField, Input, Select, SearchInput } from '../../components/ui';

export default function ShootsPage() {
  const { showToast } = useToast();
  const [shoots, setShoots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedShoot, setSelectedShoot] = useState(null);
  const [clients, setClients] = useState([]);
  const [creators, setCreators] = useState([]);
  const [orders, setOrders] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    clientId: '',
    orderId: '',
    creatorId: '',
    date: '',
    time: '10:00 AM',
    location: 'Studio Alpha, Mumbai',
    cameraman: '',
    specialNotes: '',
    status: 'SCHEDULED'
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchShoots();
    clientService.getAll({ limit: 100 }).then(res => setClients(res?.data || (Array.isArray(res) ? res : []))).catch(console.error);
    creatorService.getAll({ limit: 100 }).then(res => setCreators(res?.data || (Array.isArray(res) ? res : []))).catch(console.error);
    orderService.getAll({ limit: 100 }).then(res => setOrders(res?.data || (Array.isArray(res) ? res : []))).catch(console.error);
  }, []);

  const fetchShoots = async () => {
    try {
      setLoading(true);
      const res = await shootService.getAll();
      const list = res?.data || (Array.isArray(res) ? res : []);
      setShoots(list);
    } catch (err) {
      showToast('Failed to load shoots', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.clientId || !formData.date) {
      showToast('Client and shoot date are required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await shootService.create(formData);
      showToast('Shoot scheduled successfully', 'success');
      setIsAddOpen(false);
      setFormData(initialForm);
      fetchShoots();
    } catch (err) {
      showToast(err.message || 'Failed to create shoot', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredShoots = shoots.filter((s) => {
    const matchesSearch =
      s.client?.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.creator?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? s.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'date',
      title: 'Date & Time',
      render: (val, row) => (
        <div>
          <span className="font-bold text-gray-900 block">{formatDate(val)}</span>
          <span className="text-xs text-gray-400">{row.time || 'All Day'}</span>
        </div>
      )
    },
    {
      key: 'client',
      title: 'Client & Order',
      render: (_, row) => (
        <div>
          <span className="font-semibold text-gray-900 block">{row.client?.companyName || 'Client'}</span>
          <span className="text-xs text-gray-400">Order: {row.order?.packageName || row.orderId?.substring(0, 8) || 'UGC'}</span>
        </div>
      )
    },
    {
      key: 'creator',
      title: 'Creator',
      render: (_, row) => (
        <span className="text-xs font-semibold text-gray-800 bg-gray-100 px-2.5 py-1 rounded-md">
          {row.creator?.name || 'TBD'}
        </span>
      )
    },
    {
      key: 'location',
      title: 'Location',
      render: (val) => (
        <span className="text-xs text-gray-600 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
          {val || 'In-Studio'}
        </span>
      )
    },
    {
      key: 'cameraman',
      title: 'Crew / Manager',
      render: (val, row) => (
        <span className="text-xs text-gray-600">
          {row.manager?.user?.name || row.cameraman || 'In-House Team'}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      render: (val) => <StatusBadge status={val} type="shoot" />
    },
    {
      key: 'checklists',
      title: 'Checklist',
      render: (_, row) => {
        const ready = row.scriptApproved && row.creatorConfirmed;
        return (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${ready ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
            {ready ? 'Ready' : 'Prep Needed'}
          </span>
        );
      }
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, row) => (
        <button
          onClick={() => setSelectedShoot(row)}
          className="p-1.5 hover:bg-gray-100 rounded text-gray-400 hover:text-amber-600 transition-colors"
          title="Shoot Details"
        >
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-[#111111]">Shoots & Production Logistics</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {shoots.length} Scheduled
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Crew scheduling, creator call sheets, and studio logistics</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'}
            >
              <List className="w-4 h-4 mr-1.5" /> Table
            </Button>
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className={viewMode === 'calendar' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'}
            >
              <CalendarIcon className="w-4 h-4 mr-1.5" /> Calendar
            </Button>
          </div>
          <Button onClick={() => setIsAddOpen(true)} className="bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-2">
            <Plus className="w-4 h-4" /> Schedule Shoot
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 border border-gray-200/80 bg-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search client, creator, or studio location..." />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Shoot Statuses</option>
            {SHOOT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : viewMode === 'list' ? (
        <Card className="p-0 overflow-hidden border border-gray-200/80 bg-white">
          <DataTable
            columns={columns}
            data={filteredShoots}
            onRowClick={(row) => setSelectedShoot(row)}
            emptyMessage="No shoots found matching filters."
          />
        </Card>
      ) : (
        /* Calendar View Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredShoots.map((shoot) => (
            <Card
              key={shoot.id}
              onClick={() => setSelectedShoot(shoot)}
              className="p-5 border border-gray-200/80 bg-white hover:border-amber-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block">
                      {formatDate(shoot.date)}
                    </span>
                    <h3 className="font-bold text-gray-900 text-base mt-0.5">{shoot.client?.companyName}</h3>
                  </div>
                  <StatusBadge status={shoot.status} type="shoot" />
                </div>

                <div className="space-y-2 text-xs text-gray-600 my-3">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>Creator: <strong className="text-gray-800">{shoot.creator?.name || 'TBD'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Call Time: {shoot.time || '10:00 AM'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{shoot.location || 'Studio Alpha'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-[11px]">
                <span className="text-gray-400">Order #{shoot.orderId?.substring(0, 6)}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedShoot(shoot);
                  }}
                  className="font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  View Logistics <Eye className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Shoot Logistics Modal */}
      <Modal
        isOpen={!!selectedShoot}
        onClose={() => setSelectedShoot(null)}
        title={selectedShoot ? `${selectedShoot.client?.companyName} — Shoot Logistics` : 'Shoot'}
      >
        {selectedShoot && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-gray-500">Scheduled Date:</span>
              <span className="font-bold text-gray-900 text-sm">{formatDate(selectedShoot.date)} ({selectedShoot.time || '10:00 AM'})</span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
              <div>
                <span className="text-gray-400 block font-medium">Creator</span>
                <span className="font-semibold text-gray-900">{selectedShoot.creator?.name || 'TBD'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Status</span>
                <StatusBadge status={selectedShoot.status} type="shoot" />
              </div>
              <div className="col-span-2">
                <span className="text-gray-400 block font-medium">Studio / Location</span>
                <span className="font-semibold text-gray-900">{selectedShoot.location || 'Standard Studio'}</span>
              </div>
            </div>

            <div>
              <span className="font-bold text-gray-800 block mb-2">Pre-Shoot Readiness Checklist:</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 p-2 rounded bg-gray-50 border border-gray-100">
                  <CheckCircle2 className={`w-4 h-4 ${selectedShoot.scriptApproved ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className="text-gray-700">Script Approved</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-gray-50 border border-gray-100">
                  <CheckCircle2 className={`w-4 h-4 ${selectedShoot.creatorConfirmed ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className="text-gray-700">Creator Confirmed</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-gray-50 border border-gray-100">
                  <CheckCircle2 className={`w-4 h-4 ${selectedShoot.locationPermission ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className="text-gray-700">Location Booked</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-gray-50 border border-gray-100">
                  <CheckCircle2 className={`w-4 h-4 ${selectedShoot.clientProductReceived ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className="text-gray-700">Product In Hand</span>
                </div>
              </div>
            </div>

            {selectedShoot.specialNotes && (
              <div>
                <span className="font-bold text-gray-800 block mb-1">Production Notes:</span>
                <p className="p-2.5 bg-gray-50 rounded border text-gray-700">{selectedShoot.specialNotes}</p>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedShoot(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Schedule Shoot Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Schedule Production Shoot">
        <form onSubmit={handleAdd} className="space-y-4">
          <FormField label="Client" required>
            <Select
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value, orderId: '' })}
              required
            >
              <option value="">Select Client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </Select>
          </FormField>

          <FormField label="Contract / Order" required>
            <Select
              value={formData.orderId}
              onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              required
            >
              <option value="">{formData.clientId ? 'Select Order' : 'Select Client first, or choose order'}</option>
              {orders
                .filter((o) => !formData.clientId || o.clientId === formData.clientId)
                .map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.packageName} {o.client?.companyName ? `(${o.client.companyName})` : ''}
                  </option>
                ))}
            </Select>
          </FormField>

          <FormField label="Creator">
            <Select
              value={formData.creatorId}
              onChange={(e) => setFormData({ ...formData, creatorId: e.target.value })}
            >
              <option value="">Assign Creator (Optional)</option>
              {creators.map((cr) => (
                <option key={cr.id} value={cr.id}>
                  {cr.name} ({cr.location || 'India'})
                </option>
              ))}
            </Select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Shoot Date" required>
              <Input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </FormField>
            <FormField label="Call Time">
              <Input
                placeholder="10:00 AM"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </FormField>
          </div>

          <FormField label="Studio / Location">
            <Input
              placeholder="e.g. Studio 4, Bandra West, Mumbai"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </FormField>

          <FormField label="Special Equipment / Logistics Notes">
            <Input
              placeholder="Bring ring light, spare wireless mics, ring backdrop..."
              value={formData.specialNotes}
              onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-white">
              {submitting ? 'Scheduling...' : 'Schedule Shoot'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
