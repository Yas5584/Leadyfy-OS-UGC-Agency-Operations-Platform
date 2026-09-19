import React, { useState, useEffect } from 'react';
import { Check, X, FileText } from 'lucide-react';
import { scriptService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/ui/StatusBadge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';

export default function PortalScripts() {
  const [scripts, setScripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revisionMode, setRevisionMode] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      const res = await scriptService.getAll();
      setScripts(res.data);
    } catch (err) {
      showToast('Failed to load scripts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, feedback = '') => {
    try {
      await scriptService.updateStatus(id, { status, feedback });
      showToast(`Script ${status === 'APPROVED' ? 'approved' : 'revision requested'} successfully`, 'success');
      setRevisionMode(null);
      setFeedbackText('');
      fetchScripts();
    } catch (err) {
      showToast('Failed to update script', 'error');
    }
  };

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><SkeletonCard/><SkeletonCard/><SkeletonCard/></div>;
  if (!scripts || scripts.length === 0) return <EmptyState icon={FileText} title="No Scripts" description="You don't have any scripts yet." />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Scripts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {scripts.map(script => (
          <Card key={script.id} className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">Video #{script.videoNumber}</h3>
                <p className="text-sm text-gray-500">Order: {script.order?.packageName || `#${script.orderId}`}</p>
              </div>
              <StatusBadge status={script.status} />
            </div>
            
            <div className="flex-1 space-y-2 mb-4">
              <p className="text-sm text-gray-600"><span className="font-medium">Writer:</span> {script.writer?.name || script.writerName || 'Assigned Writer'}</p>
              <p className="text-sm text-gray-600"><span className="font-medium">Deadline:</span> {formatDate(script.deadline)}</p>
              {script.scriptText && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-700 whitespace-pre-wrap max-h-36 overflow-y-auto">
                  <p className="font-bold text-gray-900 mb-1">Script Draft:</p>
                  {script.scriptText}
                </div>
              )}
            </div>

            {script.status === 'APPROVED' && (
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs flex items-center justify-between mt-auto">
                <span className="flex items-center gap-1.5 font-bold">
                  <Check className="w-4 h-4 text-emerald-600" /> Script Approved
                </span>
                <span className="text-[11px] font-semibold text-emerald-600">Locked</span>
              </div>
            )}

            {script.status === 'REVISION_REQUIRED' && (
              <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-800 text-xs flex items-center justify-between mt-auto">
                <span className="flex items-center gap-1.5 font-bold">
                  <X className="w-4 h-4 text-orange-600" /> Revision Required
                </span>
                <span className="text-[11px] font-semibold text-orange-600">Writer Updating</span>
              </div>
            )}

            {script.status === 'IN_REVIEW' && (
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 text-blue-800 text-xs flex items-center justify-between mt-auto">
                <span className="flex items-center gap-1.5 font-bold">
                  <FileText className="w-4 h-4 text-blue-600" /> Internal Review
                </span>
                <span className="text-[11px] font-semibold text-blue-600">Drafting</span>
              </div>
            )}

            {script.status === 'SENT_TO_CLIENT' && (
              revisionMode === script.id ? (
                <div className="space-y-3 mt-auto pt-2 border-t border-gray-100">
                  <Textarea 
                    placeholder="Describe specific script changes required..." 
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="text-xs"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => setRevisionMode(null)}>Cancel</Button>
                    <Button 
                      size="sm"
                      className="flex-1 bg-amber-500 text-white hover:bg-amber-600 text-xs font-bold"
                      onClick={() => handleStatusUpdate(script.id, 'REVISION_REQUIRED', feedbackText)}
                      disabled={!feedbackText.trim()}
                    >
                      Submit Notes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 mt-auto pt-2 border-t border-gray-100">
                  <Button 
                    size="sm"
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1 text-xs font-bold shadow-xs"
                    onClick={() => handleStatusUpdate(script.id, 'APPROVED')}
                  >
                    <Check className="w-3.5 h-3.5" /> Approve Script
                  </Button>
                  <Button 
                    size="sm"
                    className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 flex items-center justify-center gap-1 text-xs font-bold"
                    onClick={() => setRevisionMode(script.id)}
                  >
                    <X className="w-3.5 h-3.5" /> Request Edit
                  </Button>
                </div>
              )
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
