import React, { useState, useEffect, useMemo } from 'react';
import { 
  Video, Clock, User, MessageSquare, ChevronDown, ExternalLink, 
  FileText, Camera, CheckCircle2, Send, Eye, Link as LinkIcon
} from 'lucide-react';
import { videoService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { VIDEO_PIPELINE_COLUMNS, getStatusLabel, STATUS_COLORS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';
import { Modal, Button, FormField, Input, Select, StatusBadge } from '../../components/ui';

const VideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [deliveryModalVideo, setDeliveryModalVideo] = useState(null);
  const [finalDeliveryLink, setFinalDeliveryLink] = useState('');
  const [savingDelivery, setSavingDelivery] = useState(false);

  const { showToast, addToast } = useToast();
  const notify = showToast || addToast;

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = typeof videoService.getVideos === 'function' 
        ? await videoService.getVideos() 
        : await videoService.getAll();
        
      if (response && response.success) {
        setVideos(response.data);
      } else {
        setVideos(response?.data || response || []);
      }
    } catch (err) {
      console.error(err);
      if (notify) notify('Error loading videos', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleStatusChange = async (video, newStatus) => {
    if (newStatus === 'DELIVERED' && !video.finalLink) {
      // Prompt for final delivery link before marking delivered
      setDeliveryModalVideo(video);
      setFinalDeliveryLink('');
      return;
    }

    try {
      await videoService.updateStatus(video.id, { status: newStatus });
      if (notify) notify(`Status moved to ${getStatusLabel(newStatus)}`, 'success');
      fetchVideos();
      if (selectedVideo && selectedVideo.id === video.id) {
        setSelectedVideo(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error(err);
      if (notify) notify('Error updating status', 'error');
    }
  };

  const handleConfirmDelivery = async (e) => {
    e.preventDefault();
    if (!deliveryModalVideo || !finalDeliveryLink.trim()) {
      if (notify) notify('Final delivery Google Drive or Cloud link is required', 'error');
      return;
    }

    try {
      setSavingDelivery(true);
      // Update link and status
      await videoService.update(deliveryModalVideo.id, { 
        finalLink: finalDeliveryLink.trim(),
        deliveryDate: new Date().toISOString()
      });
      await videoService.updateStatus(deliveryModalVideo.id, { status: 'DELIVERED' });
      
      if (notify) notify('Video marked as DELIVERED with final cloud link!', 'success');
      setDeliveryModalVideo(null);
      setFinalDeliveryLink('');
      fetchVideos();
    } catch (err) {
      if (notify) notify('Failed to complete delivery', 'error');
    } finally {
      setSavingDelivery(false);
    }
  };

  const getDeadlineColor = (deadline) => {
    if (!deadline) return 'text-gray-500 bg-gray-50 border border-gray-200';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(deadline);
    d.setHours(0, 0, 0, 0);
    const diffTime = d - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    if (diffDays < 0) return 'text-red-700 bg-red-50 border border-red-200';
    if (diffDays === 0) return 'text-amber-700 bg-amber-50 border border-amber-200';
    if (diffDays === 1) return 'text-blue-700 bg-blue-50 border border-blue-200';
    return 'text-gray-600 bg-gray-50 border border-gray-200';
  };

  const columnsData = useMemo(() => {
    const cols = {};
    VIDEO_PIPELINE_COLUMNS.forEach(col => {
      cols[col.id] = { ...col, items: [] };
    });
    
    videos.forEach(v => {
      if (cols[v.status]) {
        cols[v.status].items.push(v);
      } else if (VIDEO_PIPELINE_COLUMNS.length > 0) {
        const firstCol = VIDEO_PIPELINE_COLUMNS[0].id;
        cols[firstCol].items.push(v);
      }
    });
    return Object.values(cols);
  }, [videos]);

  if (loading) {
    return (
      <div className="p-6 h-full flex flex-col bg-white min-h-screen">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse" />
          <div className="w-48 h-8 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <div className="flex space-x-6 h-full overflow-x-auto pb-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-xl min-w-[320px] w-[320px] h-[70vh] border border-gray-100 p-4">
              <div className="w-32 h-6 bg-gray-200 rounded animate-pulse mb-6" />
              <div className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-32 bg-white rounded-lg shadow-sm border border-gray-100 animate-pulse" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-4rem)] overflow-hidden bg-white">
      <div className="p-6 border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Video className="w-6 h-6 text-indigo-600" />
            </div>
            Video Production Pipeline
            <span className="ml-3 bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full text-sm font-semibold">
              {videos.length} {videos.length === 1 ? 'Video' : 'Videos'}
            </span>
          </h1>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 bg-gray-50/50">
        <div className="flex gap-6 h-full pb-4">
          {columnsData.map(col => (
            <div key={col.id} className="flex flex-col w-[320px] min-w-[320px] bg-gray-50/80 rounded-xl max-h-full border border-gray-200 shadow-sm">
              <div className="p-4 border-b border-gray-200/80 bg-gray-100/50 flex items-center justify-between shrink-0 rounded-t-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full shadow-sm ${col.color || 'bg-gray-400'}`} />
                  <h3 className="font-semibold text-gray-800 tracking-tight">{col.title}</h3>
                </div>
                <span className="bg-white text-gray-600 py-0.5 px-2.5 rounded-full text-xs font-bold border border-gray-200 shadow-sm">
                  {col.items.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-3 kanban-scroll">
                {col.items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-sm text-gray-400 font-medium border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50">
                    No videos in this stage
                  </div>
                ) : (
                  col.items.map(video => (
                    <div 
                      key={video.id} 
                      onClick={() => setSelectedVideo(video)}
                      className="group bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-200 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-2.5">
                        <div className="pr-2">
                          <h4 className="font-bold text-gray-900 truncate max-w-[200px] leading-tight" title={video.client?.companyName}>
                            {video.client?.companyName || 'Unknown Client'}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                              #{video.videoNumber}
                            </span>
                            {video.order?.packageName && (
                              <span className="text-xs text-gray-500 truncate max-w-[110px]" title={video.order.packageName}>
                                {video.order.packageName}
                              </span>
                            )}
                          </div>
                        </div>
                        {video.revisionCount > 0 && (
                          <span className="bg-orange-50 text-orange-700 text-xs font-bold px-2 py-1 rounded-md border border-orange-200 flex items-center gap-1.5 shadow-sm" title={`${video.revisionCount} Revisions`}>
                            <MessageSquare className="w-3 h-3" />
                            {video.revisionCount}
                          </span>
                        )}
                      </div>
                      
                      {/* Pipeline References */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-gray-500 mb-2.5">
                        {video.scriptId && (
                          <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <FileText className="w-3 h-3 text-gray-400" /> Script
                          </span>
                        )}
                        {video.shootId && (
                          <span className="bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Camera className="w-3 h-3 text-gray-400" /> Shoot
                          </span>
                        )}
                        {video.renderLink && (
                          <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-bold">
                            Cut Ready
                          </span>
                        )}
                        {video.finalLink && (
                          <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">
                            Delivered Link
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2.5 text-sm text-gray-600 bg-gray-50 rounded-lg p-2 border border-gray-100">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-xs">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              <span className="truncate font-medium text-gray-700" title={video.creator?.name}>
                                C: {video.creator?.name || 'Unassigned'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs mt-1">
                              <User className="w-3.5 h-3.5 text-gray-400" />
                              <span className="truncate font-medium text-gray-700" title={video.editor?.user?.name}>
                                E: {video.editor?.user?.name || 'Unassigned'}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        {video.deadline && (
                          <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg w-full ${getDeadlineColor(video.deadline)}`}>
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">Due {formatDate(video.deadline)}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Move Stage Select */}
                      <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <select
                          className="block w-full pl-3 pr-8 py-2 text-xs text-gray-700 bg-gray-50 border-gray-200 rounded-lg hover:bg-gray-100 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors cursor-pointer appearance-none font-medium"
                          value={video.status}
                          onChange={(e) => handleStatusChange(video, e.target.value)}
                        >
                          {VIDEO_PIPELINE_COLUMNS.map(c => (
                            <option key={c.id} value={c.id}>
                              Move to: {c.title}
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Details Modal */}
      <Modal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        title={selectedVideo ? `${selectedVideo.client?.companyName} — Video #${selectedVideo.videoNumber}` : 'Video Asset'}
      >
        {selectedVideo && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-gray-400 block">Current Status</span>
                <StatusBadge status={selectedVideo.status} type="video" />
              </div>
              <div className="text-right">
                <span className="text-gray-400 block">Deadline</span>
                <span className="font-bold text-gray-900">{formatDate(selectedVideo.deadline)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg">
              <div>
                <span className="text-gray-400 block">Creator</span>
                <span className="font-semibold text-gray-800">{selectedVideo.creator?.name || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Assigned Editor</span>
                <span className="font-semibold text-gray-800">{selectedVideo.editor?.user?.name || 'Unassigned'}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Revision Count</span>
                <span className="font-semibold text-orange-600">{selectedVideo.revisionCount} rounds</span>
              </div>
              <div>
                <span className="text-gray-400 block">Order Package</span>
                <span className="font-semibold text-gray-800">{selectedVideo.order?.packageName || 'UGC'}</span>
              </div>
            </div>

            {/* Links */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <span className="font-bold text-gray-800 block">Video Links & Deliverables:</span>
              {selectedVideo.renderLink && (
                <div className="flex items-center justify-between p-2.5 rounded bg-indigo-50 border border-indigo-200">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-indigo-600" />
                    <div>
                      <span className="font-bold text-indigo-900 block">Latest Rough Cut</span>
                      <span className="text-indigo-700 truncate max-w-[250px] block">{selectedVideo.renderLink}</span>
                    </div>
                  </div>
                  <a href={selectedVideo.renderLink} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-bold flex items-center gap-1">
                    Open <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {selectedVideo.finalLink && (
                <div className="flex items-center justify-between p-2.5 rounded bg-emerald-50 border border-emerald-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-emerald-900 block">Final Approved Asset</span>
                      <span className="text-emerald-700 truncate max-w-[250px] block">{selectedVideo.finalLink}</span>
                    </div>
                  </div>
                  <a href={selectedVideo.finalLink} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline font-bold flex items-center gap-1">
                    Download <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Script Text */}
            {selectedVideo.script?.scriptText && (
              <div className="pt-2 border-t border-gray-100">
                <span className="font-bold text-gray-800 block mb-1">Approved Script:</span>
                <p className="p-2.5 bg-gray-50 rounded border text-gray-700 font-mono text-[11px] whitespace-pre-wrap max-h-36 overflow-y-auto">
                  {selectedVideo.script.scriptText}
                </p>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <Button variant="outline" onClick={() => setSelectedVideo(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Mandatory Final Delivery Link Modal */}
      <Modal
        isOpen={!!deliveryModalVideo}
        onClose={() => setDeliveryModalVideo(null)}
        title={deliveryModalVideo ? `Final Delivery — ${deliveryModalVideo.client?.companyName} Video #${deliveryModalVideo.videoNumber}` : 'Final Delivery'}
      >
        <form onSubmit={handleConfirmDelivery} className="space-y-4 text-xs">
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-amber-900">
            <span className="font-bold block mb-1">Final Delivery Protocol:</span>
            <p>
              Moving this asset to <strong>DELIVERED</strong> will publish the final Google Drive download link to the client portal and increment the order quota.
            </p>
          </div>

          <FormField label="Google Drive / Cloud Delivery Link" required>
            <Input
              type="url"
              placeholder="https://drive.google.com/drive/folders/..."
              value={finalDeliveryLink}
              onChange={(e) => setFinalDeliveryLink(e.target.value)}
              required
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button variant="outline" type="button" onClick={() => setDeliveryModalVideo(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={savingDelivery} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {savingDelivery ? 'Publishing...' : 'Deliver & Notify Client'}
            </Button>
          </div>
        </form>
      </Modal>

      <style dangerouslySetInnerHTML={{__html: `
        .kanban-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .kanban-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .kanban-scroll::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 20px;
        }
      `}} />
    </div>
  );
};

export default VideosPage;
