import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, MapPin, Phone, Mail, MessageSquare } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { creatorService } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { CREATOR_AVAILABILITY } from '../../utils/constants';
import { Button, Card, StatusBadge, Skeleton, EmptyState, Avatar, Badge, Modal, FormField, Input, Select } from '../../components/ui';

export default function CreatorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    email: '',
    phone: '',
    niches: '',
    languages: '',
    ratePerVideo: '',
    availability: 'AVAILABLE'
  });

  const fetchCreator = () => {
    creatorService.getById(id)
      .then(res => {
        const c = res.data;
        setCreator(c);
        setFormData({
          name: c.name || '',
          location: c.location || '',
          email: c.email || '',
          phone: c.phone || '',
          niches: Array.isArray(c.niches) ? c.niches.join(', ') : '',
          languages: Array.isArray(c.languages) ? c.languages.join(', ') : '',
          ratePerVideo: c.ratePerVideo ? String(c.ratePerVideo) : '',
          availability: c.availability || 'AVAILABLE'
        });
      })
      .catch(() => showToast('Failed to load creator', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCreator();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await creatorService.update(id, {
        name: formData.name.trim(),
        location: formData.location.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        niches: formData.niches ? formData.niches.split(',').map(s => s.trim()).filter(Boolean) : [],
        languages: formData.languages ? formData.languages.split(',').map(s => s.trim()).filter(Boolean) : [],
        ratePerVideo: formData.ratePerVideo,
        availability: formData.availability
      });
      showToast('Creator updated successfully', 'success');
      setIsEditOpen(false);
      fetchCreator();
    } catch (err) {
      showToast(err.message || 'Failed to update creator', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="p-6"><Skeleton className="h-64 w-full" /></div>;
  if (!creator) return <EmptyState title="Not found" />;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
          <Avatar name={creator.name} size="xl" />
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">{creator.name}</h1>
              <StatusBadge status={creator.availability || 'AVAILABLE'} />
            </div>
            <p className="text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-4 h-4" /> {creator.location || 'No location'}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => setIsEditOpen(true)}><Edit className="w-4 h-4 mr-2" /> Edit Creator</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 md:col-span-2">
          <h3 className="font-semibold text-lg mb-4 border-b pb-2">Information</h3>
          <div className="grid grid-cols-2 gap-y-4">
            <div><p className="text-gray-500 text-sm">Location</p><p className="font-medium text-gray-900">{creator.location || 'No location'}</p></div>
            <div><p className="text-gray-500 text-sm">Availability</p><p className="font-medium text-gray-900">{creator.availability || 'AVAILABLE'}</p></div>
            <div><p className="text-gray-500 text-sm">Gender</p><p>{creator.gender || 'N/A'}</p></div>
            <div><p className="text-gray-500 text-sm">Age Group</p><p>{creator.ageGroup || 'N/A'}</p></div>
            <div><p className="text-gray-500 text-sm mb-1">Languages</p><div className="flex gap-1 flex-wrap">{creator.languages?.map(l=><Badge key={l} variant="secondary">{l}</Badge>)}</div></div>
            <div><p className="text-gray-500 text-sm mb-1">Niches</p><div className="flex gap-1 flex-wrap">{creator.niches?.map(n=><Badge key={n}>{n}</Badge>)}</div></div>
            <div><p className="text-gray-500 text-sm">Rate per Video</p><p className="font-semibold text-gray-900">{formatCurrency(creator.ratePerVideo)}</p></div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 border-b pb-2">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /> {creator.phone || 'N/A'}</div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /> {creator.email || 'N/A'}</div>
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4 border-b pb-2">Workload</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Assigned Scripts:</span><span className="font-bold">{creator.scripts?.length || 0}</span></div>
              <div className="flex justify-between"><span>Upcoming Shoots:</span><span className="font-bold">{creator.shoots?.length || 0}</span></div>
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Creator Modal */}
      <Modal isOpen={isEditOpen} onClose={() => !isSaving && setIsEditOpen(false)} title="Edit Creator Profile">
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Basic Information</h3>
            <FormField label="Name *" required>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required disabled={isSaving} />
            </FormField>
            <FormField label="Location">
              <Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Mumbai, Delhi, Jaipur" disabled={isSaving} />
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Email">
                <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={isSaving} />
              </FormField>
              <FormField label="Phone">
                <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} disabled={isSaving} />
              </FormField>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Profile & Niches</h3>
            <FormField label="Niches (comma separated)">
              <Input value={formData.niches} onChange={e => setFormData({...formData, niches: e.target.value})} disabled={isSaving} />
            </FormField>
            <FormField label="Languages (comma separated)">
              <Input value={formData.languages} onChange={e => setFormData({...formData, languages: e.target.value})} disabled={isSaving} />
            </FormField>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Commercial & Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Rate Per Video">
                <Input type="number" value={formData.ratePerVideo} onChange={e => setFormData({...formData, ratePerVideo: e.target.value})} disabled={isSaving} />
              </FormField>
              <FormField label="Availability">
                <Select value={formData.availability} onChange={e => setFormData({...formData, availability: e.target.value})} disabled={isSaving}>
                  {CREATOR_AVAILABILITY.map(av => (
                    <option key={av} value={av}>{av}</option>
                  ))}
                </Select>
              </FormField>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving} className="bg-amber-500 hover:bg-amber-600 text-white">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
