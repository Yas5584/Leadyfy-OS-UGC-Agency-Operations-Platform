import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Play, MessageSquare, Check, History, Clock, Film } from 'lucide-react';
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

export default function PortalVideoReview() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);
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
      await videoService.addFeedback(id, { feedbackText: feedbackText.trim(), type: 'REVISION' });
      showToast('Revision request submitted. Our editing team has been notified.', 'success');
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

  const creatorName = video.creator?.name || video.creatorName || 'UGC Creator';
  const editorName = video.editor?.user?.name || video.editorName || 'Production Editor';

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
            Package: {video.order?.packageName || 'Standard UGC'} • Deadline: {formatDate(video.deadline)}
          </p>
        </div>
      </div>

      {/* Video Player Placeholder */}
      <div className="aspect-video bg-gradient-to-br from-gray-900 to-black rounded-2xl flex flex-col items-center justify-center relative shadow-lg overflow-hidden border border-gray-800 text-white">
        <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center ring-8 ring-amber-500/10 mb-2 cursor-pointer hover:scale-105 transition-transform">
          <Play className="w-8 h-8 fill-current ml-1" />
        </div>
        <p className="text-sm font-medium text-gray-300">Rough Cut Preview</p>
        <p className="text-xs text-gray-500 mt-1">Status: {getStatusLabel(video.status)}</p>
        <div className="absolute bottom-4 right-4 text-xs font-mono bg-black/60 px-2.5 py-1 rounded backdrop-blur">
          Rev #{video.revisionCount || 0}
        </div>
      </div>

      {/* Review Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="p-5 border border-gray-200/80">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
              Production Meta
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-gray-400 block font-medium">Assigned Creator</span>
                <span className="font-semibold text-gray-900 mt-0.5 block">{creatorName}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Assigned Editor</span>
                <span className="font-semibold text-gray-900 mt-0.5 block">{editorName}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Revisions Count</span>
                <span className="font-semibold text-gray-900 mt-0.5 block">{video.revisionCount || 0}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Expected Delivery</span>
                <span className="font-semibold text-gray-900 mt-0.5 block">{formatDate(video.deadline)}</span>
              </div>
            </div>
          </Card>

          {/* Feedback & Revision History */}
          <Card className="p-5 border border-gray-200/80">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-amber-500" /> Revision History & Notes
            </h3>
            {feedbacks && feedbacks.length > 0 ? (
              <div className="space-y-3">
                {feedbacks.map((f, i) => (
                  <div key={i} className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                    <div className="flex justify-between text-gray-400 mb-1.5">
                      <span className="font-bold text-gray-700 uppercase tracking-wider text-[10px]">
                        {f.type === 'REVISION' ? 'Revision Request' : 'Feedback'}
                      </span>
                      <span>{formatRelative(f.createdAt)}</span>
                    </div>
                    <p className="text-gray-800 leading-relaxed">{f.feedbackText}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 py-4 text-center">No revision history yet</p>
            )}
          </Card>
        </div>

        {/* Action Panel */}
        <div className="space-y-4">
          {video.status === 'CLIENT_REVIEW' && (
            <Card className="p-5 border-amber-200 bg-amber-50/40">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Your Decision</h3>
              <p className="text-xs text-gray-500 mb-4">
                Review the rough cut above and choose whether to approve or request changes.
              </p>
              <div className="space-y-2.5">
                <Button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 py-2.5"
                >
                  <Check className="w-4 h-4" /> Approve Final Cut
                </Button>
                <Button
                  onClick={() => setIsRevisionModalOpen(true)}
                  disabled={submitting}
                  variant="outline"
                  className="w-full border-amber-300 text-amber-800 hover:bg-amber-100 flex items-center justify-center gap-2 py-2.5"
                >
                  <MessageSquare className="w-4 h-4" /> Request Revision
                </Button>
              </div>
            </Card>
          )}

          {video.status === 'FINAL_APPROVED' && (
            <Card className="p-6 bg-emerald-50 border-emerald-200 text-center">
              <Check className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
              <h3 className="font-bold text-emerald-900 text-sm">Cut Approved</h3>
              <p className="text-xs text-emerald-700 mt-1">
                Your approval has been logged. Final high-res renders are being exported.
              </p>
            </Card>
          )}

          {video.status === 'DELIVERED' && (
            <Card className="p-6 bg-purple-50 border-purple-200 text-center">
              <Film className="w-10 h-10 text-purple-600 mx-auto mb-2" />
              <h3 className="font-bold text-purple-900 text-sm">Delivered & Ready</h3>
              <p className="text-xs text-purple-700 mt-1 mb-3">
                All production edits are complete and approved.
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs">
                Download Master Files
              </Button>
            </Card>
          )}

          {video.status === 'REVISION' && (
            <Card className="p-6 bg-orange-50 border-orange-200 text-center">
              <Clock className="w-10 h-10 text-orange-600 mx-auto mb-2" />
              <h3 className="font-bold text-orange-900 text-sm">Under Revision</h3>
              <p className="text-xs text-orange-700 mt-1">
                Our editor is actively working on your feedback notes. You will be notified when the new cut is ready.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Revision Request Confirmation Modal */}
      <Modal
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        title="Request Video Revision"
      >
        <form onSubmit={handleRequestRevision} className="space-y-4">
          <p className="text-xs text-gray-500">
            Please be as specific as possible regarding timing, text overlays, hook pacing, or music changes so our editors can make the exact edits.
          </p>
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
              Revision Notes <span className="text-red-500">*</span>
            </label>
            <Textarea
              required
              rows={5}
              placeholder="e.g. 0:03 - please shorten the intro pause; 0:15 - make the CTA subtitle bigger; swap background music."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              className="w-full text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
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
              {submitting ? 'Submitting...' : 'Submit Revision Request'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
