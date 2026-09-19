import React, { useState, useEffect } from 'react';
import { 
  Plus, Calendar as CalendarIcon, List, Camera, MapPin, Clock, User, 
  CheckCircle2, AlertTriangle, Eye, ChevronLeft, ChevronRight, CheckSquare, 
  Square, ShieldAlert, Sparkles, Film, ArrowRight
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { shootService, clientService, creatorService, orderService, scriptService } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { SHOOT_STATUSES } from '../../utils/constants';
import { Button, Card, Modal, DataTable, StatusBadge, Skeleton, FormField, Input, Select, SearchInput, Badge } from '../../components/ui';

export default function ShootsPage() {
  const { showToast } = useToast();
  const [shoots, setShoots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('calendar'); // Default to calendar
  const [calendarSubView, setCalendarSubView] = useState('month'); // 'month' | 'week' | 'day'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedShoot, setSelectedShoot] = useState(null);
  const [updatingChecklist, setUpdatingChecklist] = useState(false);

  const [clients, setClients] = useState([]);
  const [creators, setCreators] = useState([]);
  const [orders, setOrders] = useState([]);
  const [scripts, setScripts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    clientId: '',
    orderId: '',
    creatorId: '',
    scriptId: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    location: 'Studio Alpha, Mumbai',
    cameraman: '',
    shootingAssistant: '',
    specialNotes: '',
    status: 'SCHEDULED'
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchShoots();
    clientService.getAll({ limit: 100 }).then(res => setClients(res?.data || (Array.isArray(res) ? res : []))).catch(console.error);
    creatorService.getAll({ limit: 100 }).then(res => setCreators(res?.data || (Array.isArray(res) ? res : []))).catch(console.error);
    orderService.getAll({ limit: 100 }).then(res => setOrders(res?.data || (Array.isArray(res) ? res : []))).catch(console.error);
    scriptService.getAll({ limit: 100 }).then(res => setScripts(res?.data || (Array.isArray(res) ? res : []))).catch(console.error);
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

  const handleToggleChecklist = async (field, currentValue) => {
    if (!selectedShoot) return;
    try {
      setUpdatingChecklist(true);
      const updatedValue = !currentValue;
      const res = await shootService.update(selectedShoot.id, { [field]: updatedValue });
      const updatedShoot = { ...selectedShoot, [field]: updatedValue };
      setSelectedShoot(updatedShoot);
      setShoots(prev => prev.map(s => s.id === selectedShoot.id ? { ...s, [field]: updatedValue } : s));
      showToast(`Updated checklist item`, 'success');
    } catch (err) {
      showToast('Failed to update checklist', 'error');
    } finally {
      setUpdatingChecklist(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedShoot) return;
    try {
      await shootService.update(selectedShoot.id, { status: newStatus });
      const updated = { ...selectedShoot, status: newStatus };
      setSelectedShoot(updated);
      setShoots(prev => prev.map(s => s.id === selectedShoot.id ? { ...s, status: newStatus } : s));
      showToast(`Status changed to ${newStatus}`, 'success');
    } catch (err) {
      showToast('Failed to update status', 'error');
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

  // Calendar Helper Logic
  const getShootsForDate = (dateStr) => {
    return filteredShoots.filter(s => {
      if (!s.date) return false;
      const shootDateStr = new Date(s.date).toISOString().split('T')[0];
      return shootDateStr === dateStr;
    });
  };

  // Calendar Navigation
  const navigateCalendar = (direction) => {
    const newDate = new Date(currentDate);
    if (calendarSubView === 'month') {
      newDate.setMonth(currentDate.getMonth() + direction);
    } else if (calendarSubView === 'week') {
      newDate.setDate(currentDate.getDate() + (direction * 7));
    } else {
      newDate.setDate(currentDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => setCurrentDate(new Date());

  // Generate Days for Month View
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Day of week for 1st (0 = Sun, adjust so Mon = 0)
    let startDayIndex = firstDay.getDay() - 1;
    if (startDayIndex === -1) startDayIndex = 6;

    const days = [];
    // Previous month filler days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({ date: d, isCurrentMonth: false });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }

    // Next month filler days to complete rows of 7
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
      }
    }

    return days;
  };

  // Generate 7 Days for Week View
  const getWeekDays = () => {
    const curr = new Date(currentDate);
    let day = curr.getDay() - 1;
    if (day === -1) day = 6;
    const monday = new Date(curr);
    monday.setDate(curr.getDate() - day);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      week.push(d);
    }
    return week;
  };

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
      key: 'crew',
      title: 'Cameraman / Crew',
      render: (_, row) => (
        <span className="text-xs text-gray-600">
          {row.cameraman || row.shootingAssistant || 'In-House Crew'}
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
      title: 'Checklists',
      render: (_, row) => {
        const preShootDone = row.scriptApproved && row.creatorConfirmed && row.locationPermission && row.clientProductReceived && row.teamBriefingDone;
        const postShootDone = row.footageUploaded && row.rawFilesVerified;
        return (
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${preShootDone ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
              Pre: {preShootDone ? 'Ready' : 'In Prep'}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${postShootDone ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
              Post: {postShootDone ? 'Verified' : 'Pending'}
            </span>
          </div>
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
          title="Shoot Details & Checklist"
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
            <h1 className="text-2xl font-black tracking-tight text-[#111111]">Shoot Logistics & Calendar</h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {shoots.length} Scheduled
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Crew call sheets, creator bookings, and pre/post-shoot verification checklists</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Main View Switch (Calendar vs Table) */}
          <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className={viewMode === 'calendar' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'}
            >
              <CalendarIcon className="w-4 h-4 mr-1.5" /> Calendar
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
            <Plus className="w-4 h-4" /> Schedule Shoot
          </Button>
        </div>
      </div>

      {/* Calendar Controls & Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {viewMode === 'calendar' && (
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1 shadow-2xs">
              <button onClick={() => navigateCalendar(-1)} className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={goToToday} className="px-3 py-1 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded">
                Today
              </button>
              <button onClick={() => navigateCalendar(1)} className="p-1.5 hover:bg-gray-100 rounded text-gray-600">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <span className="font-bold text-sm text-gray-800 min-w-[160px]">
              {calendarSubView === 'month' && currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              {calendarSubView === 'week' && `Week of ${getWeekDays()[0].toLocaleDateString('default', { month: 'short', day: 'numeric' })}`}
              {calendarSubView === 'day' && currentDate.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            <div className="bg-gray-100 p-0.5 rounded-lg flex text-xs">
              <button
                onClick={() => setCalendarSubView('month')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${calendarSubView === 'month' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500'}`}
              >
                Month
              </button>
              <button
                onClick={() => setCalendarSubView('week')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${calendarSubView === 'week' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500'}`}
              >
                Week
              </button>
              <button
                onClick={() => setCalendarSubView('day')}
                className={`px-2.5 py-1 rounded font-semibold transition-colors ${calendarSubView === 'day' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500'}`}
              >
                Day
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 flex-1 max-w-md ml-auto">
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search client, creator, studio..." />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {SHOOT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>
      </div>

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
      ) : calendarSubView === 'month' ? (
        /* ── MONTH CALENDAR VIEW ── */
        <Card className="p-0 overflow-hidden border border-gray-200 bg-white">
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center text-xs font-bold text-gray-600 py-2.5">
            <div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div><div>Sun</div>
          </div>
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-gray-100 min-h-[560px]">
            {getMonthDays().map((item, idx) => {
              const dateStr = item.date.toISOString().split('T')[0];
              const dayShoots = getShootsForDate(dateStr);
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, date: dateStr }));
                    setIsAddOpen(true);
                  }}
                  className={`p-2 min-h-[95px] flex flex-col transition-colors cursor-pointer hover:bg-amber-50/40 ${
                    !item.isCurrentMonth ? 'bg-gray-50/60 text-gray-400' : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      isToday ? 'bg-amber-500 text-white shadow-2xs' : 'text-gray-700'
                    }`}>
                      {item.date.getDate()}
                    </span>
                    {dayShoots.length > 0 && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full">
                        {dayShoots.length} shoot{dayShoots.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-thin">
                    {dayShoots.map(s => (
                      <div
                        key={s.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedShoot(s);
                        }}
                        className="text-[11px] p-1 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 truncate font-medium flex items-center justify-between"
                      >
                        <span className="truncate">{s.time?.split(' ')[0]} {s.client?.companyName}</span>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                          s.status === 'COMPLETED' ? 'bg-green-500' :
                          s.status === 'IN_PROGRESS' ? 'bg-amber-500' :
                          s.status === 'CONFIRMED' ? 'bg-blue-500' : 'bg-gray-400'
                        }`} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : calendarSubView === 'week' ? (
        /* ── WEEK CALENDAR VIEW ── */
        <Card className="p-0 overflow-hidden border border-gray-200 bg-white">
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 text-center text-xs font-bold text-gray-700 py-3">
            {getWeekDays().map((d, i) => {
              const isToday = new Date().toISOString().split('T')[0] === d.toISOString().split('T')[0];
              return (
                <div key={i} className="space-y-0.5">
                  <div className="text-gray-400 uppercase text-[10px]">
                    {d.toLocaleString('default', { weekday: 'short' })}
                  </div>
                  <div className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                    isToday ? 'bg-amber-500 text-white' : 'text-gray-800'
                  }`}>
                    {d.getDate()}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-7 divide-x divide-gray-100 min-h-[480px]">
            {getWeekDays().map((d, i) => {
              const dateStr = d.toISOString().split('T')[0];
              const dayShoots = getShootsForDate(dateStr);
              return (
                <div 
                  key={i} 
                  onClick={() => { setFormData(prev => ({ ...prev, date: dateStr })); setIsAddOpen(true); }}
                  className="p-2 space-y-2 hover:bg-gray-50/50 cursor-pointer min-h-[300px]"
                >
                  {dayShoots.length === 0 ? (
                    <div className="text-[11px] text-gray-300 text-center pt-8 italic">No shoots</div>
                  ) : (
                    dayShoots.map(s => (
                      <div
                        key={s.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedShoot(s); }}
                        className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/80 hover:bg-amber-100 transition-all text-xs space-y-1.5 cursor-pointer shadow-2xs"
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-bold text-gray-900 block truncate">{s.client?.companyName}</span>
                          <span className="text-[10px] font-mono text-amber-700 font-bold">{s.time}</span>
                        </div>
                        <div className="text-[11px] text-gray-600 flex items-center gap-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="truncate">{s.creator?.name || 'TBD'}</span>
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          <span className="truncate">{s.location || 'Studio'}</span>
                        </div>
                        <div className="pt-1 flex justify-between items-center">
                          <StatusBadge status={s.status} type="shoot" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        /* ── DAY CALENDAR VIEW ── */
        <Card className="p-6 border border-gray-200 bg-white">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {currentDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <p className="text-xs text-gray-500">Call sheets and shooting schedule for this date</p>
            </div>
            <Button onClick={() => { setFormData(prev => ({ ...prev, date: currentDate.toISOString().split('T')[0] })); setIsAddOpen(true); }} size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
              <Plus className="w-4 h-4 mr-1" /> Add Shoot for Today
            </Button>
          </div>

          {getShootsForDate(currentDate.toISOString().split('T')[0]).length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Camera className="w-12 h-12 mx-auto text-gray-300 mb-2" />
              <p className="font-medium text-gray-600">No shoots scheduled for this day</p>
              <p className="text-xs mt-1">Click "Add Shoot for Today" to book studio time or creator call sheet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getShootsForDate(currentDate.toISOString().split('T')[0]).map(s => (
                <div 
                  key={s.id}
                  onClick={() => setSelectedShoot(s)}
                  className="p-4 rounded-xl border border-gray-200 hover:border-amber-400 transition-all cursor-pointer bg-white hover:shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-center min-w-[75px]">
                      <Clock className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                      <span className="font-bold text-xs text-amber-900 block">{s.time || '10:00 AM'}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-gray-900">{s.client?.companyName}</h3>
                        <StatusBadge status={s.status} type="shoot" />
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">Order: {s.order?.packageName || 'UGC Package'}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 mt-2">
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-gray-400" /> Creator: <strong>{s.creator?.name || 'Unassigned'}</strong></span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-gray-400" /> Location: <strong>{s.location || 'In-Studio'}</strong></span>
                        <span className="flex items-center gap-1"><Camera className="w-3.5 h-3.5 text-gray-400" /> Crew: <strong>{s.cameraman || 'In-House'}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedShoot(s); }}>
                      Checklist & Call Sheet <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Shoot Logistics & Interactive Checklist Modal */}
      <Modal
        isOpen={!!selectedShoot}
        onClose={() => setSelectedShoot(null)}
        title={selectedShoot ? `${selectedShoot.client?.companyName} — Production Logistics & Checklist` : 'Shoot'}
      >
        {selectedShoot && (
          <div className="space-y-5 text-xs">
            {/* Overview Row */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-gray-400 block">Date & Call Time</span>
                <span className="font-bold text-gray-900 text-sm">{formatDate(selectedShoot.date)} ({selectedShoot.time || '10:00 AM'})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400">Status:</span>
                <Select
                  value={selectedShoot.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="text-xs py-1 h-8"
                >
                  {SHOOT_STATUSES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Crew & Details */}
            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3.5 rounded-lg border border-gray-100">
              <div>
                <span className="text-gray-400 block font-medium">Assigned Creator</span>
                <span className="font-semibold text-gray-900">{selectedShoot.creator?.name || 'TBD'}</span>
                {selectedShoot.creator?.phone && <span className="text-gray-500 block text-[11px]">{selectedShoot.creator.phone}</span>}
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Cameraman / DP</span>
                <span className="font-semibold text-gray-900">{selectedShoot.cameraman || 'In-House'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Shooting Assistant</span>
                <span className="font-semibold text-gray-900">{selectedShoot.shootingAssistant || 'None Assigned'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Studio / Location</span>
                <span className="font-semibold text-gray-900 truncate block">{selectedShoot.location || 'Studio Alpha'}</span>
              </div>
            </div>

            {/* MANDATORY PRE-SHOOT CHECKLIST */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="font-black text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
                  Pre-Shoot Readiness Checklist
                </span>
                <span className="text-[10px] text-gray-400">Click to toggle and verify</span>
              </div>
              
              <div className="space-y-1.5 bg-gray-50/80 p-3 rounded-lg border border-gray-200">
                {[
                  { field: 'scriptApproved', label: '1. Script Approvals Verified', desc: 'Client has signed off on the active script draft' },
                  { field: 'creatorConfirmed', label: '2. Creator Call Confirmed', desc: 'Creator agreed to call time, wardrobe, and location' },
                  { field: 'locationPermission', label: '3. Location & Studio Booked', desc: 'Permissions secured and studio slot reserved' },
                  { field: 'clientProductReceived', label: '4. Client Product In-Hand', desc: 'Physical merchandise received and unboxed for shoot' },
                  { field: 'teamBriefingDone', label: '5. Crew & Assistant Briefed', desc: 'Call sheet, shot list, and lighting setup reviewed' }
                ].map(item => {
                  const checked = !!selectedShoot[item.field];
                  return (
                    <div 
                      key={item.field}
                      onClick={() => handleToggleChecklist(item.field, checked)}
                      className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-colors border select-none ${
                        checked ? 'bg-green-50/80 border-green-200 text-green-900' : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <button type="button" className="mt-0.5">
                        {checked ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="font-bold text-xs">{item.label}</div>
                        <div className="text-[10px] text-gray-500">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MANDATORY POST-SHOOT VERIFICATION */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <span className="font-black text-gray-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5 text-indigo-500" />
                  Post-Shoot Footage Verification
                </span>
                <span className="text-[10px] text-gray-400">Post-production handoff</span>
              </div>

              <div className="space-y-1.5 bg-gray-50/80 p-3 rounded-lg border border-gray-200">
                {[
                  { field: 'footageUploaded', label: 'Footage Uploaded to Cloud', desc: 'Raw memory card dump uploaded to Google Drive folder' },
                  { field: 'rawFilesVerified', label: 'Raw Files & Audio Integrity Check', desc: 'Framerate, focus, audio levels, and clip completeness verified' },
                  { field: 'reshootRequired', label: 'Reshoot Required Flag', desc: 'Flag if takes are missing, out of focus, or audio corrupted' }
                ].map(item => {
                  const checked = !!selectedShoot[item.field];
                  const isReshoot = item.field === 'reshootRequired';
                  return (
                    <div 
                      key={item.field}
                      onClick={() => handleToggleChecklist(item.field, checked)}
                      className={`flex items-start gap-3 p-2 rounded cursor-pointer transition-colors border select-none ${
                        checked 
                          ? isReshoot ? 'bg-red-50 border-red-200 text-red-900' : 'bg-blue-50 border-blue-200 text-blue-900'
                          : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <button type="button" className="mt-0.5">
                        {checked ? (
                          isReshoot ? <ShieldAlert className="w-4 h-4 text-red-600" /> : <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="font-bold text-xs">{item.label}</div>
                        <div className="text-[10px] text-gray-500">{item.desc}</div>
                      </div>
                    </div>
                  );
                })}
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
                Done
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
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value, orderId: '', scriptId: '' })}
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

          <FormField label="Contract / Package Order" required>
            <Select
              value={formData.orderId}
              onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              required
            >
              <option value="">{formData.clientId ? 'Select Order' : 'Select Client first'}</option>
              {orders
                .filter((o) => !formData.clientId || o.clientId === formData.clientId)
                .map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.packageName} ({o.videoCount} videos)
                  </option>
                ))}
            </Select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Assign Creator">
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

            <FormField label="Approved Script Reference">
              <Select
                value={formData.scriptId}
                onChange={(e) => setFormData({ ...formData, scriptId: e.target.value })}
              >
                <option value="">Select Script (Optional)</option>
                {scripts
                  .filter(sc => !formData.clientId || sc.clientId === formData.clientId)
                  .map(sc => (
                    <option key={sc.id} value={sc.id}>
                      Video #{sc.videoNumber} — {sc.status}
                    </option>
                  ))}
              </Select>
            </FormField>
          </div>

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

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Cameraman / DP">
              <Input
                placeholder="e.g. Rahul Sharma"
                value={formData.cameraman}
                onChange={(e) => setFormData({ ...formData, cameraman: e.target.value })}
              />
            </FormField>
            <FormField label="Shooting Assistant">
              <Input
                placeholder="e.g. Aman Verma"
                value={formData.shootingAssistant}
                onChange={(e) => setFormData({ ...formData, shootingAssistant: e.target.value })}
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
              placeholder="Bring ring light, spare wireless mics, product backdrops..."
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
