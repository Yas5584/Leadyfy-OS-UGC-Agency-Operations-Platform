import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Video, ChevronRight, Play, CheckCircle2, Send, Clock, Film } from 'lucide-react';
import { videoService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import StatusBadge from '../../components/ui/StatusBadge';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { SkeletonCard } from '../../components/ui/Skeleton';

export default function PortalVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await videoService.getAll();
      setVideos(res.data || []);
    } catch (err) {
      showToast('Failed to load videos', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      <div className="h-8 w-48 bg-gray-100 rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkeletonCard/><SkeletonCard/><SkeletonCard/>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/80 pb-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Video Deliverables</h1>
          <p className="text-gray-500 text-xs mt-0.5">Review cuts, request revisions, and approve ready deliverables</p>
        </div>
        <div className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200">
          {videos.length} {videos.length === 1 ? 'Deliverable' : 'Deliverables'}
        </div>
      </div>

      {!videos || videos.length === 0 ? (
        <EmptyState icon={Video} title="No Videos" description="Your videos will appear here once production cuts are uploaded." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map(video => {
            const creatorName = video.creator?.name || video.creatorName || 'UGC Creator';
            const orderTitle = video.order?.packageName || 'UGC Package';

            return (
              <div 
                key={video.id} 
                className="bg-white rounded-2xl border border-gray-200/90 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col overflow-hidden group"
              >
                {/* Thumbnail Preview Area */}
                <div 
                  onClick={() => navigate(`/portal/videos/${video.id}`)}
                  className="aspect-video bg-gradient-to-br from-gray-950 to-gray-850 flex flex-col items-center justify-center relative cursor-pointer group-hover:brightness-105 transition-all text-white border-b border-gray-100"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center ring-4 ring-amber-500/10 group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                  <span className="absolute bottom-2.5 left-3 text-[10px] font-mono bg-black/70 px-2 py-0.5 rounded backdrop-blur text-gray-300">
                    Video #{video.videoNumber}
                  </span>
                  <span className="absolute bottom-2.5 right-3 text-[10px] font-mono bg-black/70 px-2 py-0.5 rounded backdrop-blur text-gray-300">
                    {video.revisionCount || 0} {video.revisionCount === 1 ? 'Rev' : 'Revs'}
                  </span>
                </div>

                {/* Card Info */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div className="min-w-0">
                      <h3 className="font-bold text-base text-gray-900 truncate">
                        {video.title || `Video #${video.videoNumber}`}
                      </h3>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{orderTitle}</p>
                    </div>
                    <StatusBadge status={video.status} type="video" />
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-1.5 mb-5 flex-1 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Creator</span>
                      <span className="font-semibold text-gray-800">{creatorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Target Date</span>
                      <span className="font-semibold text-gray-800">{formatDate(video.deadline)}</span>
                    </div>
                  </div>
                  
                  {/* Status Action Buttons */}
                  <div className="pt-2">
                    {video.status === 'CLIENT_REVIEW' && (
                      <Link
                        to={`/portal/videos/${video.id}`}
                        className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Watch & Review Video
                      </Link>
                    )}
                    {video.status === 'FINAL_APPROVED' && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs">
                        <span className="flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Approved by Client
                        </span>
                        <Link to={`/portal/videos/${video.id}`} className="font-semibold text-emerald-700 hover:underline">
                          View
                        </Link>
                      </div>
                    )}
                    {video.status === 'DELIVERED' && (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-800 text-xs">
                        <span className="flex items-center gap-1.5 font-bold">
                          <Send className="w-4 h-4 text-indigo-600" /> Delivered & Ready
                        </span>
                        <Link to={`/portal/videos/${video.id}`} className="font-semibold text-indigo-700 hover:underline">
                          Files
                        </Link>
                      </div>
                    )}
                    {['SCRIPT_APPROVED', 'SHOOT_PENDING', 'RAW_FOOTAGE_RECEIVED', 'VIDEO_EDITING', 'INTERNAL_QA', 'REVISION'].includes(video.status) && (
                      <Link
                        to={`/portal/videos/${video.id}`}
                        className="w-full py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Clock className="w-3.5 h-3.5 text-gray-400" /> Production In Progress
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
