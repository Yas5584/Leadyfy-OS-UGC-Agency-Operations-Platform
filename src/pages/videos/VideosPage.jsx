import React, { useState, useEffect, useMemo } from 'react';
import { 
  Video, 
  Clock, 
  User, 
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import { videoService } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { VIDEO_PIPELINE_COLUMNS, getStatusLabel, STATUS_COLORS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const VideosPage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast, addToast } = useToast();
  const notify = showToast || addToast;

  const fetchVideos = async () => {
    try {
      setLoading(true);
      // Fallback in case the method is named differently, commonly it's getVideos or getAll
      const response = typeof videoService.getVideos === 'function' 
        ? await videoService.getVideos() 
        : await videoService.getAll();
        
      if (response && response.success) {
        setVideos(response.data);
      } else {
        // If the structure is directly the data array or paginated
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

  const handleStatusChange = async (id, newStatus) => {
    try {
      await videoService.updateStatus(id, { status: newStatus });
      if (notify) notify('Status updated successfully', 'success');
      fetchVideos();
    } catch (err) {
      console.error(err);
      if (notify) notify('Error updating status', 'error');
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
        // Fallback for unknown status
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
                    <div key={video.id} className="group bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-indigo-200 transition-all duration-200">
                      <div className="flex justify-between items-start mb-3">
                        <div className="pr-2">
                          <h4 className="font-bold text-gray-900 truncate max-w-[200px] leading-tight" title={video.client?.companyName}>
                            {video.client?.companyName || 'Unknown Client'}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                              #{video.videoNumber}
                            </span>
                            {video.order?.packageName && (
                              <span className="text-xs text-gray-500 truncate max-w-[100px]" title={video.order.packageName}>
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
                      
                      <div className="space-y-2.5 mb-4">
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
                      
                      <div className="relative">
                        <select
                          className="block w-full pl-3 pr-8 py-2 text-sm text-gray-700 bg-gray-50 border-gray-200 rounded-lg hover:bg-gray-100 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors cursor-pointer appearance-none font-medium"
                          value={video.status}
                          onChange={(e) => handleStatusChange(video.id, e.target.value)}
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
