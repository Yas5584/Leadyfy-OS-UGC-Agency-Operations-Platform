import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, Play, Pause, MessageSquare, Check, History, Clock, 
  Film, ExternalLink, Download, Sparkles, AlertCircle 
} from 'lucide-react';
import { videoService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatRelative, formatDate } from '../../utils/formatters';
import { getStatusLabel } from '../../utils/constants';
import StatusBadge from '../../components/ui/StatusBadge';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import { SkeletonCard, SkeletonText } from '../../components/ui/Skeleton';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import FormField from '../../components/ui/FormField';

export default function PortalVideoReview() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [currentTimeStamp, setCurrentTimeStamp] = useState('00:00');
  const [submitting, setSubmitting] = useState(false);

  // Video Player Ref & State
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  const { showToast } = useToast();

  useEffect(() => {
    fetchVideo();
  }, [id]);

  const fetchVideo = async () => {
    try {
      const vidRes = await videoService.getById(id);
      const videoData = vidRes.data || vidRes;
      setVideo(videoData);
      setFeedbacks(videoData.feedback || []);
    } catch (err) {
      showToast('Failed to load video details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatSeconds = (totalSeconds) => {
    if (isNaN(totalSeconds) || totalSeconds < 0) return '00:00';
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setVideoCurrentTime(cur);
      setCurrentTimeStamp(formatSeconds(cur));
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setVideoDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const seekToTimestamp = (timestampStr) => {
    if (!videoRef.current || !timestampStr) return;
    const parts = timestampStr.split(':').map(Number);
    let targetSecs = 0;
    if (parts.length === 2) {
      targetSecs = parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      targetSecs = parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    videoRef.current.currentTime = targetSecs;
    setVideoCurrentTime(targetSecs);
  };

  const openRevisionAtCurrentTime = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      const timeStr = formatSeconds(videoRef.current.currentTime);
      setCurrentTimeStamp(timeStr);
    }
    setIsRevisionModalOpen(true);
  };

  const handleApprove = async () => {
    try {
      setSubmitting(true);
      await videoService.updateStatus(id, { status: 'FINAL_APPROVED' });
      showToast('Video approved! Our team will prepare the final delivery files.', 'success');
      fetchVideo();
    } catch (err) {
      showToast('Failed to approve video', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestRevision = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    try {
      setSubmitting(true);
      await videoService.addFeedback(id, { 
        feedbackText: feedbackText.trim(), 
        timestamp: currentTimeStamp || null,
        type: 'REVISION' 
      });
      showToast('Timestamped revision submitted. Editing team notified!', 'success');
      setIsRevisionModalOpen(false);
      setFeedbackText('');
      fetchVideo();
    } catch (err) {
      showToast(err.message || 'Failed to submit revision', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto p-4">
        <SkeletonText lines={2} />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Video not found.</p>
        <Link to="/portal/videos" className="text-amber-500 hover:underline text-sm mt-2 inline-block">
          ← Back to Videos
        </Link>
      </div>
    );
  }

  const creatorName = video.creator?.name || 'Assigned Creator';
  const editorName = video.editor?.user?.name || 'Production Editor';

  // Determine if video source is playable directly or external
  const isDirectVideo = video.renderLink && (
    video.renderLink.endsWith('.mp4') || 
    video.renderLink.endsWith('.webm') || 
    video.renderLink.includes('commondatastorage') ||
    video.renderLink.includes('blob.core')
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/portal/videos" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">
              {video.title || `Video #${video.videoNumber}`}
            </h1>
            <StatusBadge status={video.status} type="video" />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            Package: {video.order?.packageName || 'Standard UGC'} • Target Delivery: {formatDate(video.deadline)}
          </p>
        </div>
      </div>

      {/* Interactive Video Player or Cloud Link Preview */}
      <div className="bg-[#111111] rounded-2xl overflow-hidden shadow-xl border border-gray-800 text-white relative">
        {isDirectVideo ? (
          <div className="relative aspect-video bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              src={video.renderLink}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              className="w-full h-full object-contain"
              playsInline
            />
            {/* Custom Bottom Bar */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button 
                  onClick={togglePlay}
                  className="w-9 h-9 rounded-full bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
                <span className="font-mono text-xs text-gray-300">
                  {formatSeconds(videoCurrentTime)} / {formatSeconds(videoDuration)}
                </span>
              </div>

              {video.status === 'CLIENT_REVIEW' && (
                <Button 
                  size="sm" 
                  onClick={openRevisionAtCurrentTime}
                  className="bg-white/20 hover:bg-white/30 text-white backdrop-blur border border-white/20 text-xs flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Note at {formatSeconds(videoCurrentTime)}
                </Button>
              )}
            </div>
          </div>
        ) : (
          /* Web/Drive Video Cut Preview */
          <div className="aspect-video bg-gradient-to-br from-gray-950 via-gray-900 to-black flex flex-col items-center justify-center relative p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center ring-8 ring-amber-500/10 mb-3">
              <Film className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Production Rough Cut</h3>
            <p className="text-xs text-gray-400 max-w-md mb-4">
              {video.renderLink 
                ? 'Your video draft is ready on cloud storage. Open the cut to inspect pacing and captions.' 
                : 'Our editing team is actively cutting raw footage for this video.'}
            </p>

            {video.renderLink && (
              <div className="flex items-center gap-3">
                <a
                  href={video.renderLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Watch Draft on Cloud <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {video.status === 'CLIENT_REVIEW' && (
                  <Button
                    onClick={() => setIsRevisionModalOpen(true)}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs"
                  >
                    Add Timestamped Feedback
                  </Button>
                )}
              </div>
            )}

            <div className="absolute bottom-4 right-4 text-xs font-mono bg-black/70 px-2.5 py-1 rounded backdrop-blur text-gray-300">
              Round #{video.revisionCount || 0}
            </div>
          </div>
        )}
      </div>

      {/* Review Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-5 border border-gray-200/80 bg-white">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
              Production Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400 block font-medium">UGC Creator</span>
                <span className="font-semibold text-gray-900 mt-0.5 block">{creatorName}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Assigned Editor</span>
                <span className="font-semibold text-gray-900 mt-0.5 block">{editorName}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Revisions Logged</span>
                <span className="font-semibold text-orange-600 mt-0.5 block">{video.revisionCount || 0} rounds</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Target Schedule</span>
                <span className="font-semibold text-gray-900 mt-0.5 block">{formatDate(video.deadline)}</span>
              </div>
            </div>
          </Card>

          {/* Timestamped Revision History */}
          <Card className="p-5 border border-gray-200/80 bg-white">
            <h3 className="text-xs font-bold text-gray-900 flex items-center gap-2 mb-4 uppercase tracking-wider">
              <History className="w-4 h-4 text-amber-500" /> Revision Log & Timestamped Feedback
            </h3>
            {feedbacks && feedbacks.length > 0 ? (
              <div className="space-y-3">
                {feedbacks.map((f, i) => (
                  <div key={i} className="p-3.5 bg-gray-50 rounded-xl border border-gray-200/70 text-xs">
                    <div className="flex items-center justify-between text-gray-500 mb-1.5">
                      <div className="flex items-center gap-2">
                        {f.timestamp && (
                          <button
                            type="button"
                            onClick={() => seekToTimestamp(f.timestamp)}
                            className="bg-amber-100 text-amber-800 hover:bg-amber-200 px-2 py-0.5 rounded font-mono font-bold text-[11px] transition-colors flex items-center gap-1"
                            title="Click to jump to timestamp"
                          >
                            <Clock className="w-3 h-3" /> {f.timestamp}
                          </button>
                        )}
                        <span className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                          {f.type === 'REVISION' ? 'Revision Request' : 'Client Note'}
                        </span>
                      </div>
                      <span className="text-[11px] text-gray-400">{formatRelative(f.createdAt)}</span>
                    </div>
                    <p className="text-gray-800 leading-relaxed font-sans">{f.feedbackText}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-400 py-6 text-center italic border border-dashed border-gray-200 rounded-lg">
                No revisions requested yet. If any changes are needed, click "Request Revision".
              </div>
            )}
          </Card>
        </div>

        {/* Action Panel */}
        <div className="space-y-4">
          {video.status === 'CLIENT_REVIEW' && (
            <Card className="p-5 border-amber-200 bg-amber-50/50">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Client Decision Required</h3>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                Review this rough cut draft. Once you approve, high-resolution master renders will be produced and released.
              </p>
              <div className="space-y-2.5">
                <Button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 py-2.5 font-bold shadow-xs text-xs"
                >
                  <Check className="w-4 h-4" /> Approve Final Cut
                </Button>
                <Button
                  onClick={() => setIsRevisionModalOpen(true)}
                  disabled={submitting}
                  variant="outline"
                  className="w-full border-amber-300 text-amber-900 bg-white hover:bg-amber-100 flex items-center justify-center gap-2 py-2.5 font-bold text-xs"
                >
                  <MessageSquare className="w-4 h-4" /> Request Changes
                </Button>
              </div>
            </Card>
          )}

          {video.status === 'FINAL_APPROVED' && (
            <Card className="p-6 bg-emerald-50 border-emerald-200 text-center">
              <Check className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-bold text-emerald-900 text-sm">Cut Approved by Client</h3>
              <p className="text-xs text-emerald-700 mt-1">
                Your approval has been logged in the audit ledger. The team is packaging the final high-bitrate deliverables.
              </p>
            </Card>
          )}

          {video.status === 'DELIVERED' && (
            <Card className="p-6 bg-purple-50 border-purple-200 text-center">
              <Film className="w-10 h-10 text-purple-600 mx-auto mb-2" />
              <h3 className="font-bold text-purple-900 text-sm">Master Asset Delivered</h3>
              <p className="text-xs text-purple-700 mt-1 mb-4">
                Full-resolution render files are ready for commercial ad deployment.
              </p>
              {video.finalLink ? (
                <a
                  href={video.finalLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2.5 rounded-lg transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4" /> Download Master Deliverable
                </a>
              ) : (
                <span className="text-xs text-gray-500">Delivery files published</span>
              )}
            </Card>
          )}

          {video.status === 'REVISION' && (
            <Card className="p-6 bg-orange-50 border-orange-200 text-center">
              <Clock className="w-10 h-10 text-orange-600 mx-auto mb-2" />
              <h3 className="font-bold text-orange-900 text-sm">Under Editor Revision</h3>
              <p className="text-xs text-orange-700 mt-1">
                Our post-production team has received your timestamped notes and is editing the next cut.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Timestamped Revision Modal */}
      <Modal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        title="Submit Timestamped Revision Request"
      >
        <form onSubmit={handleRequestRevision} className="space-y-4 text-xs">
          <p className="text-gray-500">
            Specify the exact video timestamp and revision instructions for captions, hook pacing, background audio, or color grading.
          </p>

          <FormField label="Video Timestamp Marker (MM:SS)">
            <Input
              placeholder="e.g. 00:15"
              value={currentTimeStamp}
              onChange={(e) => setCurrentTimeStamp(e.target.value)}
              className="font-mono"
            />
          </FormField>

          <FormField label="Revision Details & Feedback" required>
            <Textarea
              required
              rows={4}
              placeholder="e.g. Trim opening pause by 0.5s; emphasize brand logo overlay; lower background music volume during creator voiceover."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full text-xs"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRevisionModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !feedbackText.trim()}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {submitting ? 'Submitting...' : 'Send Revision to Editor'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
