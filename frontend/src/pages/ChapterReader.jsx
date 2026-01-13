import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight,
  Heart, 
  MessageCircle, 
  Share2,
  BookOpen,
  Clock,
  ChevronDown,
  Send,
  Edit,
  Trash2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const ChapterReader = () => {
  const { storyId, chapterNumber } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [story, setStory] = useState(null);
  const [chapter, setChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [showChapterList, setShowChapterList] = useState(false);
  const [readingTime, setReadingTime] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editChapter, setEditChapter] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchChapter();
    fetchStory();
    fetchChapters();
    
    // Track reading time
    const startTime = Date.now();
    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000 / 60); // in minutes
      if (timeSpent > 0) {
        updateReadingProgress(timeSpent);
      }
    };
  }, [storyId, chapterNumber]);

  const fetchStory = async () => {
    try {
      const response = await api.get(`/stories/${storyId}`);
      setStory(response.data);
      
      // Increment read count when chapter is viewed
      incrementReadCount();
    } catch (error) {
      console.error('Error fetching story:', error);
      toast.error('Failed to load story');
    }
  };

  const incrementReadCount = async () => {
    try {
      // Check if we already incremented for this session
      const sessionKey = `read_${storyId}`;
      if (sessionStorage.getItem(sessionKey)) {
        return; // Already counted for this session
      }
      
      await api.patch(`/stories/${storyId}/read`);
      
      // Mark as counted for this session
      sessionStorage.setItem(sessionKey, 'true');
    } catch (err) {
      // Don't log error as it's not critical for user experience
      console.warn('Failed to increment read count:', err);
    }
  };

  const fetchChapter = async () => {
    try {
      // Find chapter by story and chapter number
      const chaptersResponse = await api.get(`/chapters/story/${storyId}`);
      const chapterData = chaptersResponse.data.find(ch => ch.chapterNumber === parseInt(chapterNumber));
      
      if (chapterData) {
        const chapterResponse = await api.get(`/chapters/${chapterData._id}`);
        setChapter(chapterResponse.data);
        setIsLiked(chapterResponse.data.likes?.includes(user?.id) || false);
        setLikesCount(chapterResponse.data.likes?.length || 0);
        setComments(chapterResponse.data.comments || []);
      } else {
        toast.error('Chapter not found');
        navigate(`/story/${storyId}`);
      }
    } catch (error) {
      console.error('Error fetching chapter:', error);
      toast.error('Failed to load chapter');
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async () => {
    try {
      const response = await api.get(`/chapters/story/${storyId}`);
      setChapters(response.data);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const updateReadingProgress = async (timeSpent) => {
    try {
      await api.post(`/reading-progress/${storyId}`, {
        chapterId: chapter?._id,
        chapterNumber: parseInt(chapterNumber),
        timeSpent
      });
    } catch (error) {
      console.error('Error updating reading progress:', error);
    }
  };

  const handleLike = async () => {
    try {
      const response = await api.post(`/chapters/${chapter._id}/like`);
      setIsLiked(response.data.liked);
      setLikesCount(response.data.likesCount);
    } catch (error) {
      toast.error('Failed to like chapter');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await api.post(`/chapters/${chapter._id}/comment`, {
        text: newComment
      });
      setComments([...comments, response.data]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const navigateToChapter = (newChapterNumber) => {
    navigate(`/story/${storyId}/chapter/${newChapterNumber}`);
  };

  const getEstimatedReadingTime = (content) => {
    const wordsPerMinute = 200;
    const words = content?.replace(/<[^>]*>/g, '').split(/\s+/).length || 0;
    return Math.ceil(words / wordsPerMinute);
  };

  const isAuthor = user && chapter && chapter.author === user.id;

  const handleEditChapter = () => {
    setEditChapter({
      title: chapter.title,
      content: chapter.content
    });
    setShowEditModal(true);
  };

  const handleUpdateChapter = async (e) => {
    e.preventDefault();
    try {
      const response = await api.put(`/chapters/${chapter._id}`, editChapter);
      setChapter(response.data);
      setShowEditModal(false);
      toast.success('Chapter updated successfully!');
    } catch (error) {
      toast.error('Failed to update chapter');
    }
  };

  const handleDeleteChapter = async () => {
    if (!window.confirm('Are you sure you want to delete this chapter? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/chapters/${chapter._id}`);
      toast.success('Chapter deleted successfully!');
      navigate(`/story/${storyId}`);
    } catch (error) {
      toast.error('Failed to delete chapter');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!chapter || !story) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto py-8 px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Chapter not found</h2>
          <button
            onClick={() => navigate(`/story/${storyId}`)}
            className="bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600 transition-colors"
          >
            Back to Story
          </button>
        </div>
      </div>
    );
  }

  const currentChapterIndex = chapters.findIndex(ch => ch.chapterNumber === parseInt(chapterNumber));
  const hasNextChapter = currentChapterIndex < chapters.length - 1;
  const hasPreviousChapter = currentChapterIndex > 0;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Reading Header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back and Chapter Navigation */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(`/story/${storyId}`)}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowChapterList(!showChapterList)}
                  className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Chapter {chapterNumber}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {showChapterList && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50 max-h-64 overflow-y-auto">
                    {chapters.map((ch) => (
                      <button
                        key={ch._id}
                        onClick={() => {
                          navigateToChapter(ch.chapterNumber);
                          setShowChapterList(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                          ch.chapterNumber === parseInt(chapterNumber) ? 'bg-rose-50 text-rose-600' : ''
                        }`}
                      >
                        <div className="font-medium">{ch.title}</div>
                        <div className="text-xs text-gray-500">Chapter {ch.chapterNumber}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Reading Stats */}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{getEstimatedReadingTime(chapter.content)}m read</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4" />
                <span>{likesCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{comments.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Story Info */}
        <div className="mb-8">
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-2">
            {chapter.title}
          </h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <span className="font-medium">{story.title}</span>
            <span>•</span>
            <span>by {story.author?.username}</span>
            <span>•</span>
            <span>Chapter {chapterNumber} of {chapters.length}</span>
          </div>
        </div>

        {/* Chapter Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div 
            dangerouslySetInnerHTML={{ __html: chapter.content }}
            className="leading-relaxed"
          />
        </div>

        {/* Chapter Actions */}
        <div className="flex items-center justify-center space-x-6 py-8 border-t border-b border-gray-100 mb-8">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isLiked
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
            <span>{likesCount}</span>
          </button>
          
          <button className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">
            <Share2 className="h-5 w-5" />
            <span>Share</span>
          </button>

          {isAuthor && (
            <>
              <button
                onClick={handleEditChapter}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
              >
                <Edit className="h-5 w-5" />
                <span>Edit</span>
              </button>
              
              <button
                onClick={handleDeleteChapter}
                className="flex items-center space-x-2 px-6 py-3 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors"
              >
                <Trash2 className="h-5 w-5" />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mb-12">
          <button
            onClick={() => navigateToChapter(parseInt(chapterNumber) - 1)}
            disabled={!hasPreviousChapter}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              hasPreviousChapter
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Previous Chapter</span>
          </button>
          
          <button
            onClick={() => navigateToChapter(parseInt(chapterNumber) + 1)}
            disabled={!hasNextChapter}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              hasNextChapter
                ? 'bg-rose-500 text-white hover:bg-rose-600'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Next Chapter</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Comments Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">
              Comments ({comments.length})
            </h3>
          </div>

          {/* Add Comment */}
          <form onSubmit={handleAddComment} className="bg-gray-50 rounded-lg p-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts about this chapter..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={!newComment.trim()}
                className="flex items-center space-x-2 bg-rose-500 text-white px-4 py-2 rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                <span>Post Comment</span>
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment._id} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-linear-to-r from-rose-400 to-pink-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {comment.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">{comment.user?.username}</h4>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No comments yet. Be the first to share your thoughts!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for chapter list */}
      {/* Edit Chapter Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Edit Chapter</h2>
            </div>
            
            <form onSubmit={handleUpdateChapter} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chapter Title
                  </label>
                  <input
                    type="text"
                    value={editChapter.title}
                    onChange={(e) => setEditChapter(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chapter Content
                  </label>
                  <textarea
                    value={editChapter.content}
                    onChange={(e) => setEditChapter(prev => ({ ...prev, content: e.target.value }))}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent resize-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditChapter({ title: '', content: '' });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                >
                  Update Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showChapterList && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowChapterList(false)}
        />
      )}
    </div>
  );
};

export default ChapterReader;