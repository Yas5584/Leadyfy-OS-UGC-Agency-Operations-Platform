import React, { useState, useEffect, useMemo } from 'react';
import { 
  Video, Clock, AlertCircle, CheckCircle2, Calendar, 
  ExternalLink, MessageSquare, Filter, Play, Send, ChevronRight, User
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { videoService } from '../../services/api';
import { formatDate } from '../../utils/formatters';
import { VIDEO_PIPELINE_COLUMNS, getStatusLabel, STATUS_COLORS } from '../../utils/constants';
import { Card, Button, Modal, StatusBadge, Skeleton, FormField, Input, Select, Badge } from '../../components/ui';

export default function EditorDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState('all'); // 'all' | 'overdue' | 'dueToday' | 'dueTomorrow' | 'completed'
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [renderLinkInput, setRenderLinkInput] = useState('');
  const [isUpdatingLink, setIsUpdatingLink] = useState(false);

  useEffect(() => {
    fetchMyVideos();
  }, []);

  const fetchMyVideos = async () => {
    try {
      setLoading(true);
      const res = await videoService.getAll();
      const list = res?.data || (Array.isArray(res) ? res : []);
      // If user is EDITOR, can filter by assigned editor or show all active video queue
      setVideos(list);
    } catch (err) {
      showToast('Failed to load video queue', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyCategory = (v) => {
    if (['FINAL_APPROVED', 'DELIVERED'].includes(v.status)) return 'completed';
    if (!v.deadline) return 'upcoming';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(v.deadline);
    d.setHours(0, 0, 0, 0);

    const diffTime = d - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'dueToday';
    if (diffDays === 1) return 'dueTomorrow';
    return 'upcoming';
  };

  const categorizedVideos = useMemo(() => {
    const overdue = [];
    const dueToday = [];
    const dueTomorrow = [];
    const completed = [];
    const upcoming = [];

    videos.forEach(v => {
      const cat = getUrgencyCategory(v);
      if (cat === 'overdue') overdue.push(v);
      else if (cat === 'dueToday') dueToday.push(v);
      else if (cat === 'dueTomorrow') dueTomorrow.push(v);
      else if (cat === 'completed') completed.push(v);
      else upcoming.push(v);
    });

    return { overdue, dueToday, dueTomorrow, completed, upcoming };
  }, [videos]);

  const displayedVideos = useMemo(() => {
    if (filterTab === 'overdue') return categorizedVideos.overdue;
    if (filterTab === 'dueToday') return categorizedVideos.dueToday;
    if (filterTab === 'dueTomorrow') return categorizedVideos.dueTomorrow;
    if (filterTab === 'completed') return categorizedVideos.completed;
    return videos;
  }, [filterTab, videos, categorizedVideos]);

  const handleUpdateStatus = async (videoId, newStatus) => {
    try {
      await videoService.updateStatus(videoId, { status: newStatus });
      showToast(`Status updated to ${getStatusLabel(newStatus)}`, 'success');
      fetchMyVideos();
      if (selectedVideo && selectedVideo.id === videoId) {
        setSelectedVideo(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleSaveRenderLink = async (e) => {
    e.preventDefault();
    if (!selectedVideo) return;
    try {
      setIsUpdatingLink(true);
      await videoService.update(selectedVideo.id, { renderLink: renderLinkInput });
      showToast('Render link updated successfully', 'success');
      setSelectedVideo(prev => ({ ...prev, renderLink: renderLinkInput }));
      setVideos(prev => prev.map(v => v.id === selectedVideo.id ? { ...v, renderLink: renderLinkInput } : v));
    } catch (err) {
      showToast('Failed to update render link', 'error');
    } finally {
      setIsUpdatingLink(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-[#111111]">Editor Video Queue</h1>
            <Badge className="bg-indigo-100 text-indigo-800 border border-indigo-200">Editor Workbench</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Urgency-filtered production queue: manage timeline cuts, render uploads, and client revision flags
          </p>
        </div>
      </div>

      {/* Urgency Filter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <button
          onClick={() => setFilterTab('all')}
          className={`p-3 rounded-xl border text-left transition-all ${
            filterTab === 'all'
              ? 'bg-[#111111] text-white border-[#111111] shadow-sm'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
          }`}
        >
          <div className="text-[11px] uppercase tracking-wider font-semibold opacity-70">Total Queue</div>
          <div className="text-2xl font-black mt-1">{videos.length}</div>
        </button>

        <button
          onClick={() => setFilterTab('overdue')}
          className={`p-3 rounded-xl border text-left transition-all ${
            filterTab === 'overdue'
              ? 'bg-red-600 text-white border-red-600 shadow-sm'
              : 'bg-white text-red-700 border-red-200 hover:border-red-300'
          }`}
        >
          <div className="text-[11px] uppercase tracking-wider font-semibold opacity-80 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> Overdue
          </div>
          <div className="text-2xl font-black mt-1">{categorizedVideos.overdue.length}</div>
        </button>

        <button
          onClick={() => setFilterTab('dueToday')}
          className={`p-3 rounded-xl border text-left transition-all ${
            filterTab === 'dueToday'
              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
              : 'bg-white text-amber-800 border-amber-200 hover:border-amber-300'
          }`}
        >
          <div className="text-[11px] uppercase tracking-wider font-semibold opacity-80 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Due Today
          </div>
          <div className="text-2xl font-black mt-1">{categorizedVideos.dueToday.length}</div>
        </button>

        <button
          onClick={() => setFilterTab('dueTomorrow')}
          className={`p-3 rounded-xl border text-left transition-all ${
            filterTab === 'dueTomorrow'
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
              : 'bg-white text-blue-800 border-blue-200 hover:border-blue-300'
          }`}
        >
          <div className="text-[11px] uppercase tracking-wider font-semibold opacity-80 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Due Tomorrow
          </div>
          <div className="text-2xl font-black mt-1">{categorizedVideos.dueTomorrow.length}</div>
        </button>

        <button
          onClick={() => setFilterTab('completed')}
          className={`p-3 rounded-xl border text-left transition-all ${
            filterTab === 'completed'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
              : 'bg-white text-emerald-800 border-emerald-200 hover:border-emerald-300'
          }`}
        >
          <div className="text-[11px] uppercase tracking-wider font-semibold opacity-80 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </div>
          <div className="text-2xl font-black mt-1">{categorizedVideos.completed.length}</div>
        </button>
      </div>

      {/* Video List */}
      {loading ? (
        <Skeleton className="h-96 w-full rounded-xl" />
      ) : displayedVideos.length === 0 ? (
        <Card className="p-12 text-center border border-gray-200 bg-white">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="font-bold text-gray-900 text-base">No videos in this category</h3>
          <p className="text-xs text-gray-500 mt-1">Great job! All edits in this filter are up to date.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedVideos.map((video) => {
            const urgency = getUrgencyCategory(video);
            return (
              <Card
                key={video.id}
                className="p-5 border border-gray-200 bg-white hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2.5">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase">
                        Video #{video.videoNumber}
                      </span>
                      <h3 className="font-black text-gray-900 text-base mt-1 truncate max-w-[210px]">
                        {video.client?.companyName || 'Client Asset'}
                      </h3>
                      <p className="text-xs text-gray-400">{video.order?.packageName || 'UGC Delivery'}</p>
                    </div>
                    <StatusBadge status={video.status} type="video" />
                  </div>

                  {/* Urgency Badge */}
                  <div className="my-2.5">
                    {urgency === 'overdue' && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 flex items-center gap-1 w-fit">
                        <AlertCircle className="w-3 h-3" /> Overdue ({formatDate(video.deadline)})
                      </span>
                    )}
                    {urgency === 'dueToday' && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3" /> Due Today
                      </span>
                    )}
                    {urgency === 'dueTomorrow' && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 flex items-center gap-1 w-fit">
                        <Calendar className="w-3 h-3" /> Due Tomorrow
                      </span>
                    )}
                    {urgency === 'completed' && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" /> Ready / Delivered
                      </span>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1.5 text-xs text-gray-600 bg-gray-50/80 p-2.5 rounded-lg border border-gray-100 my-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Creator:</span>
                      <span className="font-semibold text-gray-800">{video.creator?.name || 'In-House'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Revisions:</span>
                      <span className={`font-bold ${video.revisionCount > 0 ? 'text-orange-600' : 'text-gray-700'}`}>
                        {video.revisionCount} rounds
                      </span>
                    </div>
                    {video.renderLink ? (
                      <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                        <span className="text-gray-400">Current Render:</span>
                        <a 
                          href={video.renderLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-indigo-600 font-bold hover:underline flex items-center gap-1 text-[11px]"
                        >
                          Watch Cut <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-700 pt-1 border-t border-gray-100 italic">
                        No rough cut uploaded yet
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedVideo(video);
                      setRenderLinkInput(video.renderLink || '');
                    }}
                    className="text-xs flex-1"
                  >
                    Edit / Upload Link
                  </Button>

                  {/* Quick Pipeline Transition */}
                  {video.status === 'RAW_FOOTAGE_RECEIVED' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(video.id, 'VIDEO_EDITING')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs"
                    >
                      Start Editing
                    </Button>
                  )}
                  {video.status === 'VIDEO_EDITING' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(video.id, 'INTERNAL_QA')}
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                    >
                      Submit QA
                    </Button>
                  )}
                  {video.status === 'INTERNAL_QA' && (
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(video.id, 'CLIENT_REVIEW')}
                      className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
                    >
                      Send to Client
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Video Details & Render Link Modal */}
      <Modal
        isOpen={!!selectedVideo}
        onClose={() => setSelectedVideo(null)}
        title={selectedVideo ? `${selectedVideo.client?.companyName} — Video #${selectedVideo.videoNumber}` : 'Video Details'}
      >
        {selectedVideo && (
          <div className="space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <span className="text-gray-400 block">Current Pipeline Stage</span>
                <StatusBadge status={selectedVideo.status} type="video" />
              </div>
              <div className="text-right">
                <span className="text-gray-400 block">Target Deadline</span>
                <span className="font-bold text-gray-900">{formatDate(selectedVideo.deadline)}</span>
              </div>
            </div>

            {/* Advance Status Dropdown */}
            <FormField label="Move Pipeline Stage">
              <Select
                value={selectedVideo.status}
                onChange={(e) => handleUpdateStatus(selectedVideo.id, e.target.value)}
              >
                {VIDEO_PIPELINE_COLUMNS.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </Select>
            </FormField>

            {/* Render Link Form */}
            <form onSubmit={handleSaveRenderLink} className="space-y-2 pt-2 border-t border-gray-100">
              <FormField label="Cloud Render Link (Google Drive / Frame.io / Vimeo)" required>
                <Input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={renderLinkInput}
                  onChange={(e) => setRenderLinkInput(e.target.value)}
                  required
                />
              </FormField>
              <div className="flex justify-end pt-1">
                <Button type="submit" disabled={isUpdatingLink} className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                  {isUpdatingLink ? 'Saving...' : 'Save Render Link'}
                </Button>
              </div>
            </form>

            {/* Video Script Content (if attached) */}
            {selectedVideo.script?.scriptText && (
              <div className="pt-2 border-t border-gray-100">
                <span className="font-bold text-gray-800 block mb-1">Approved Script Reference:</span>
                <p className="bg-gray-50 p-2.5 rounded border border-gray-100 text-gray-700 font-mono text-[11px] whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {selectedVideo.script.scriptText}
                </p>
              </div>
            )}

            {/* Revision Feedback Log */}
            {selectedVideo.feedback && selectedVideo.feedback.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <span className="font-bold text-gray-800 block mb-2">Feedback & Revision Notes:</span>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedVideo.feedback.map((f, i) => (
                    <div key={i} className="p-2 bg-amber-50/80 border border-amber-200 rounded text-[11px]">
                      <div className="flex justify-between font-bold text-amber-900 mb-0.5">
                        <span>{f.timestamp ? `[${f.timestamp}]` : 'General Feedback'}</span>
                        <span className="text-[10px] text-amber-700">{formatDate(f.createdAt)}</span>
                      </div>
                      <p className="text-gray-700">{f.feedbackText}</p>
                    </div>
                  ))}
                </div>
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
    </div>
  );
}
