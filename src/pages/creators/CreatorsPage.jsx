import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LayoutGrid, List, Search } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { creatorService } from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { Button, Card, Modal, DataTable, StatusBadge, Skeleton, FormField, Input, Select, SearchInput, Avatar, Badge } from '../../components/ui';

export default function CreatorsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', gender: '', ageGroup: '', languages: '', location: '', niches: '', phone: '', email: '', ratePerVideo: '', photo: '', demographics: '', whatsapp: '', bankDetails: '', upiId: '', portfolioLinks: '' });

  useEffect(() => {
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      const res = await creatorService.getAll();
      setCreators(res.data);
    } catch (error) {
      showToast('Failed to load creators', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await creatorService.create({
        ...formData, 
        niches: formData.niches ? formData.niches.split(',').map(s => s.trim()).filter(Boolean) : [], 
        languages: formData.languages ? formData.languages.split(',').map(s => s.trim()).filter(Boolean) : [],
        portfolioLinks: formData.portfolioLinks ? formData.portfolioLinks.split(',').map(s => s.trim()).filter(Boolean) : []
      });
      showToast('Creator added successfully', 'success');
      setIsAddOpen(false);
      fetchCreators();
    } catch (error) {
      showToast('Failed to add creator', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = creators.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Creators</h1>
        <div className="flex gap-2">
          <div className="bg-gray-100 p-1 rounded-md flex">
            <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className={viewMode==='grid' ? 'bg-white text-gray-900 shadow-sm hover:bg-white' : ''}><LayoutGrid className="w-4 h-4" /></Button>
            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className={viewMode==='list' ? 'bg-white text-gray-900 shadow-sm hover:bg-white' : ''}><List className="w-4 h-4" /></Button>
          </div>
          <Button onClick={() => setIsAddOpen(true)} className="bg-amber-500 hover:bg-amber-600"><Plus className="w-4 h-4 mr-2" /> Add Creator</Button>
        </div>
      </div>

      <Card className="mb-6 p-4">
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search creators by name..." />
      </Card>

      {loading ? (
        <Skeleton className="h-64 w-full" />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filtered.map(c => (
            <Card key={c.id} className="p-6 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/creators/${c.id}`)}>
              <div className="flex items-start justify-between mb-4">
                <Avatar name={c.name} size="lg" />
                <StatusBadge status={c.availability || 'AVAILABLE'} type="default" />
              </div>
              <h3 className="text-lg font-bold">{c.name}</h3>
              <p className="text-gray-500 text-sm mb-3">{c.location || 'No location'}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {c.niches?.map((n, i) => <Badge key={i} variant="secondary">{n}</Badge>)}
              </div>
              <div className="flex justify-between items-center border-t pt-3 mt-3">
                <span className="text-sm text-gray-600">Rate: {formatCurrency(c.ratePerVideo)}</span>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-0">
          <DataTable 
            columns={[{key:'name', title:'Name'}, {key:'location', title:'Location'}, {key:'ratePerVideo', title:'Rate', render: v => formatCurrency(v)}, {key:'availability', title:'Status', render: v => <StatusBadge status={v} />}]} 
            data={filtered} 
            onRowClick={r => navigate(`/creators/${r.id}`)}
          />
        </Card>
      )}

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Creator">
        <form onSubmit={handleAdd} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Basic Information</h3>
            <FormField label="Name *" required><Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required /></FormField>
            <FormField label="Photo URL"><Input value={formData.photo} onChange={e => setFormData({...formData, photo: e.target.value})} placeholder="https://..." /></FormField>
            <FormField label="Location"><Input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Mumbai, Delhi, Bangalore" /></FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Gender">
                <Select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-Binary">Non-Binary</option>
                  <option value="Other">Other</option>
                </Select>
              </FormField>
              <FormField label="Age Group">
                <Select value={formData.ageGroup} onChange={e => setFormData({...formData, ageGroup: e.target.value})}>
                  <option value="">Select Age Group</option>
                  <option value="18-25">18-25</option>
                  <option value="25-35">25-35</option>
                  <option value="35-45">35-45</option>
                  <option value="45+">45+</option>
                </Select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField label="Email"><Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} /></FormField>
              <FormField label="Phone"><Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></FormField>
              <FormField label="WhatsApp"><Input value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} /></FormField>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Creator Profile</h3>
            <FormField label="Demographics"><Input value={formData.demographics} onChange={e => setFormData({...formData, demographics: e.target.value})} placeholder="e.g. Urban, Tier 1, Gen Z" /></FormField>
            <FormField label="Niches (comma separated)"><Input value={formData.niches} onChange={e => setFormData({...formData, niches: e.target.value})} /></FormField>
            <FormField label="Languages (comma separated)"><Input value={formData.languages} onChange={e => setFormData({...formData, languages: e.target.value})} /></FormField>
            <FormField label="Portfolio Links (comma separated)"><Input value={formData.portfolioLinks} onChange={e => setFormData({...formData, portfolioLinks: e.target.value})} placeholder="https://..." /></FormField>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Commercial & Financial</h3>
            <FormField label="Rate Per Video"><Input type="number" value={formData.ratePerVideo} onChange={e => setFormData({...formData, ratePerVideo: e.target.value})} /></FormField>
            <FormField label="Bank Details"><Input value={formData.bankDetails} onChange={e => setFormData({...formData, bankDetails: e.target.value})} placeholder="Account number, IFSC, Bank name" /></FormField>
            <FormField label="UPI ID"><Input value={formData.upiId} onChange={e => setFormData({...formData, upiId: e.target.value})} placeholder="username@upi" /></FormField>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-amber-500 hover:bg-amber-600">
              {isSubmitting ? 'Adding...' : 'Save'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
