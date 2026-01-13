import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Bookmark,
  Clock,
  MessageCircle,
  Plus,
  Edit,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music,
  ChevronRight,
  Trash2,
  Send,
  BookOpen,
  Maximize,
  Minimize,
  X,
  Sun,
  Moon,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const StoryDetail = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [story, setStory] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [newChapter, setNewChapter] = useState({ title: "", content: "" });
  const [showEditChapter, setShowEditChapter] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode for reading

  // Music player states
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isMusicMuted, setIsMusicMuted] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const audioRef = useRef(new Audio());

  // Music tracks for ambient reading - Your uploaded audio files
  const musicTracks = [
    "/audio/documentary-141467.mp3",
    "/audio/love-love-background-music-288434.mp3", 
    "/audio/melody-of-nature-main-6672.mp3",
    "/audio/nature-documentary-427642.mp3",
  ];
  
  const trackNames = [
    "Documentary Theme",
    "Love Background", 
    "Melody of Nature",
    "Nature Documentary"
  ];

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchStory(), fetchChapters(), fetchComments()]);
      setLoading(false);
    };
    loadData();
  }, [storyId]);

  const fetchStory = async () => {
    try {
      const res = await api.get(`/stories/${storyId}`);
      setStory(res.data);
      setIsLiked(res.data.likes?.some((l) => l._id === user?.id) || false);
      setLikesCount(res.data.likes?.length || 0);
      
      // Increment read count when story is viewed
      incrementReadCount();
    } catch (err) {
      console.error(err);
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

  const fetchChapters = async () => {
    try {
      const res = await api.get(`/chapters/story/${storyId}`);
      setChapters(res.data);
      if (res.data.length > 0) setSelectedChapter(res.data[0]);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await api.get(`/stories/${storyId}/comments`);
      console.log('Fetched comments:', res.data); // Debug log
      const fetchedComments = res.data.comments || res.data || [];
      setComments(Array.isArray(fetchedComments) ? fetchedComments : []);
    } catch (err) {
      console.error('Fetch comments error:', err);
      setComments([]); // Set empty array on error
    }
  };

  const handleLike = async () => {
    if (!user) return toast.info("Login to like stories");
    try {
      const res = await api.post(`/stories/${storyId}/like`);
      setIsLiked(res.data.liked);
      setLikesCount((prev) => (res.data.liked ? prev + 1 : prev - 1));
    } catch {
      toast.error("Failed to like story");
    }
  };

  const handleBookmark = async () => {
    if (!user) return toast.info("Login to bookmark stories");
    try {
      const res = await api.post(`/bookmarks/${storyId}`);
      setIsBookmarked(res.data.bookmarked);
      toast.success(
        res.data.bookmarked ? "Added to bookmarks" : "Removed from bookmarks"
      );
    } catch {
      toast.error("Failed to bookmark story");
    }
  };

  const handleAddChapter = async (e) => {
    e.preventDefault();
    if (!newChapter.title.trim() || !newChapter.content.trim())
      return toast.error("Fill all fields");

    try {
      const res = await api.post(`/chapters/story/${storyId}`, newChapter);
      setChapters([...chapters, res.data]);
      setShowAddChapter(false);
      setNewChapter({ title: "", content: "" });
      toast.success("Chapter added");
    } catch {
      toast.error("Failed to add chapter");
    }
  };

  const handleEditChapter = (ch) => {
    setEditingChapter(ch);
    setShowEditChapter(true);
  };

  const handleUpdateChapter = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/chapters/${editingChapter._id}`, {
        title: editingChapter.title,
        content: editingChapter.content,
      });
      setChapters((prev) =>
        prev.map((c) => (c._id === editingChapter._id ? res.data : c))
      );
      if (selectedChapter?._id === editingChapter._id)
        setSelectedChapter(res.data);
      setEditingChapter(null);
      toast.success("Chapter updated");
    } catch (error) {
      console.error('Update chapter error:', error);
      toast.error("Failed to update chapter");
    }
  };

    const handleDeleteChapter = async (chapterId) => {
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      try {
        setDeleting(true);
        await api.delete(`/chapters/${chapterId}`);
        setChapters(chapters.filter(ch => ch._id !== chapterId));
        if (selectedChapter?._id === chapterId) {
          setSelectedChapter(chapters.length > 1 ? chapters[0] : null);
        }
        toast.success('Chapter deleted successfully');
      } catch (error) {
        toast.error('Failed to delete chapter');
      } finally {
        setDeleting(false);
      }
    }
  };

  // Music player functions
  const toggleMusic = async () => {
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      setIsMusicPlaying(true);
      await playCurrentTrack();
    }
  };

  const playCurrentTrack = async () => {
    try {
      audioRef.current.src = musicTracks[currentTrackIndex];
      audioRef.current.loop = true;
      audioRef.current.volume = isMusicMuted ? 0 : 0.3; // 30% volume for ambient music
      
      await audioRef.current.load();
      await audioRef.current.play();
    } catch (error) {
      console.log("Audio playback failed:", error);
      setIsMusicPlaying(false);
    }
  };

  const toggleMute = () => {
    setIsMusicMuted(!isMusicMuted);
    audioRef.current.volume = isMusicMuted ? 0.3 : 0;
  };

  const changeTrack = async () => {
    const nextIndex = (currentTrackIndex + 1) % trackNames.length;
    
    // Stop current audio
    audioRef.current.pause();
    setCurrentTrackIndex(nextIndex);
    
    if (isMusicPlaying) {
      // Start new track
      await playCurrentTrack();
    }
  };

  // Stop music when exiting fullscreen
  useEffect(() => {
    if (!isFullscreen && isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    }
  }, [isFullscreen, isMusicPlaying]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const exitFullscreen = () => {
    setIsFullscreen(false);
  };

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isFullscreen]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await api.post(`/stories/${storyId}/comments`, {
        text: newComment,
      });
      console.log('Comment added:', res.data); // Debug log
      setComments([res.data, ...comments]);
      setNewComment("");
      toast.success("Comment added");
    } catch (error) {
      console.error('Comment error:', error);
      toast.error("Failed to add comment");
    }
  };

  const handleDeleteStory = async () => {
    if (!window.confirm("Delete this story permanently?")) return;
    setDeleting(true);
    try {
      await api.delete(`/stories/${storyId}`);
      toast.success("Story deleted");
      navigate('/profile');
    } catch {
      toast.error("Failed to delete story");
    } finally {
      setDeleting(false);
    }
  };

  const isAuthor = user && story?.author?._id === user?.id;

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Minimal Loading Content */}
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <div className="mb-8">
              <BookOpen className="h-12 w-12 mx-auto text-orange-500 animate-pulse" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading Story</h2>
            <p className="text-gray-600 text-lg mb-8">
              Preparing your reading experience...
            </p>
            
            {/* Minimal Progress Dots */}
            <div className="flex justify-center items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );

  // Fullscreen Reading Mode
  if (isFullscreen && selectedChapter) {
    const themeStyles = isDarkMode
      ? {
          bg: "bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800",
          textPrimary: "text-gray-100",
          textSecondary: "text-gray-300",
          border: "border-gray-600",
          contentBg: "bg-gray-800/50",
          headerFooterBg: "bg-gradient-to-r from-gray-800/90 via-gray-700/90 to-gray-800/90",
          headerFooterText: "text-gray-100",
          headerFooterTextSecondary: "text-gray-300",
          headerFooterBorder: "border-gray-600/30"
        }
      : {
          bg: "bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50",
          textPrimary: "text-gray-900",
          textSecondary: "text-gray-700",
          border: "border-orange-200",
          contentBg: "bg-white/80",
          headerFooterBg: "bg-gradient-to-r from-orange-100/70 via-amber-50/70 to-orange-100/70",
          headerFooterText: "text-gray-800",
          headerFooterTextSecondary: "text-gray-600",
          headerFooterBorder: "border-orange-200/30"
        };

    return (
      <div className={`fixed inset-0 ${themeStyles.bg} z-50 overflow-y-auto`}>
        <div className="min-h-screen">
          {/* Non-sticky Header */}
          <div className={`${themeStyles.headerFooterBg} shadow-lg p-4 border-b ${themeStyles.headerFooterBorder} backdrop-blur-sm`}>
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              <div className="flex-1 min-w-0">
                <h1 className={`text-lg sm:text-xl font-bold ${themeStyles.headerFooterText} truncate mb-1`}>
                  {selectedChapter.title}
                </h1>
                <div className={`flex items-center gap-3 ${themeStyles.headerFooterTextSecondary} text-sm`}>
                  <span className="truncate">{story.title}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">
                    Chapter {chapters.findIndex(ch => ch._id === selectedChapter._id) + 1} of {chapters.length}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline">
                    {Math.ceil((selectedChapter.content?.length || 0) / 1000)} min
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                {/* Music Controls */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-black/10 rounded-lg p-1">
                    <button
                      onClick={toggleMusic}
                      className={`p-2 ${isDarkMode ? 'hover:bg-gray-600/30' : 'hover:bg-orange-200/30'} rounded-md transition-colors ${themeStyles.headerFooterText}`}
                      title={isMusicPlaying ? "Pause Music" : "Play Ambient Music"}
                    >
                      {isMusicPlaying ? <Pause className="h-4 w-4" /> : <Music className="h-4 w-4" />}
                    </button>
                    
                    {isMusicPlaying && (
                      <>
                        <button
                          onClick={toggleMute}
                          className={`p-2 ${isDarkMode ? 'hover:bg-gray-600/30' : 'hover:bg-orange-200/30'} rounded-md transition-colors ${themeStyles.headerFooterText}`}
                          title={isMusicMuted ? "Unmute" : "Mute"}
                        >
                          {isMusicMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                        </button>
                        
                        <button
                          onClick={changeTrack}
                          className={`p-2 ${isDarkMode ? 'hover:bg-gray-600/30' : 'hover:bg-orange-200/30'} rounded-md transition-colors ${themeStyles.headerFooterText}`}
                          title="Change Track"
                        >
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </>
                    )}
                  </div>
                  
                  {isMusicPlaying && (
                    <div className={`text-xs ${themeStyles.headerFooterTextSecondary} hidden sm:block`}>
                      {trackNames[currentTrackIndex]}
                    </div>
                  )}
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className={`p-2.5 ${isDarkMode ? 'hover:bg-gray-600/30' : 'hover:bg-orange-200/30'} rounded-lg transition-colors ${themeStyles.headerFooterText}`}
                  title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>

                {/* Chapter Navigation */}
                {chapters.length > 1 && (
                  <>
                    <button
                      onClick={() => {
                        const currentIndex = chapters.findIndex(ch => ch._id === selectedChapter._id);
                        if (currentIndex > 0) setSelectedChapter(chapters[currentIndex - 1]);
                      }}
                      disabled={chapters.findIndex(ch => ch._id === selectedChapter._id) === 0}
                      className={`p-2.5 ${isDarkMode ? 'hover:bg-gray-600/30' : 'hover:bg-orange-200/30'} rounded-lg transition-colors ${themeStyles.headerFooterText} disabled:opacity-50 disabled:cursor-not-allowed`}
                      title="Previous Chapter"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => {
                        const currentIndex = chapters.findIndex(ch => ch._id === selectedChapter._id);
                        if (currentIndex < chapters.length - 1) setSelectedChapter(chapters[currentIndex + 1]);
                      }}
                      disabled={chapters.findIndex(ch => ch._id === selectedChapter._id) === chapters.length - 1}
                      className={`p-2.5 ${isDarkMode ? 'hover:bg-gray-600/30' : 'hover:bg-orange-200/30'} rounded-lg transition-colors ${themeStyles.headerFooterText} disabled:opacity-50 disabled:cursor-not-allowed`}
                      title="Next Chapter"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
                
                {/* Exit Fullscreen */}
                <button
                  onClick={exitFullscreen}
                  className={`p-2.5 ${isDarkMode ? 'hover:bg-gray-600/30' : 'hover:bg-orange-200/30'} rounded-lg transition-colors ${themeStyles.headerFooterText}`}
                  title="Exit Fullscreen (ESC)"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="max-w-4xl mx-auto p-6 sm:p-8 lg:p-12">
            <div className={`${themeStyles.contentBg} rounded-2xl p-6 sm:p-8 lg:p-12 shadow-2xl backdrop-blur-sm border ${themeStyles.border}`}>
              <div
                className={`prose prose-lg sm:prose-xl max-w-none fullscreen-reading story-content ${isDarkMode ? 'prose-invert' : ''}`}
                style={{
                  fontSize: '19px',
                  lineHeight: '1.85',
                  fontFamily: "'Playfair Display', serif"
                }}
                dangerouslySetInnerHTML={{ __html: selectedChapter.content }}
              />
            </div>
          </div>

          {/* Non-sticky Bottom Navigation */}
          {chapters.length > 1 && (
            <div className={`${themeStyles.headerFooterBg} p-4 border-t ${themeStyles.headerFooterBorder} backdrop-blur-sm`}>
              <div className="flex justify-between items-center max-w-4xl mx-auto gap-4">
                <button
                  onClick={() => {
                    const currentIndex = chapters.findIndex(ch => ch._id === selectedChapter._id);
                    if (currentIndex > 0) setSelectedChapter(chapters[currentIndex - 1]);
                  }}
                  disabled={chapters.findIndex(ch => ch._id === selectedChapter._id) === 0}
                  className={`flex items-center gap-2 px-4 py-3 ${isDarkMode ? 'bg-gray-700/40 hover:bg-gray-700/60' : 'bg-orange-200/40 hover:bg-orange-200/60'} ${themeStyles.headerFooterText} rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium backdrop-blur-sm`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Previous Chapter</span>
                  <span className="sm:hidden">Previous</span>
                </button>
                
                <div className={`${themeStyles.headerFooterText} text-sm font-medium text-center`}>
                  Chapter {chapters.findIndex(ch => ch._id === selectedChapter._id) + 1} of {chapters.length}
                </div>
                
                <button
                  onClick={() => {
                    const currentIndex = chapters.findIndex(ch => ch._id === selectedChapter._id);
                    if (currentIndex < chapters.length - 1) setSelectedChapter(chapters[currentIndex + 1]);
                  }}
                  disabled={chapters.findIndex(ch => ch._id === selectedChapter._id) === chapters.length - 1}
                  className={`flex items-center gap-2 px-4 py-3 ${isDarkMode ? 'bg-gray-700/40 hover:bg-gray-700/60' : 'bg-orange-200/40 hover:bg-orange-200/60'} ${themeStyles.headerFooterText} rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium backdrop-blur-sm`}
                >
                  <span className="hidden sm:inline">Next Chapter</span>
                  <span className="sm:hidden">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!story)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        {/* Minimal Not Found Content */}
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="text-center">
            <div className="mb-8">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Story Not Found</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              The story you're looking for doesn't exist or may have been removed.
            </p>
            
            <Link 
              to="/feed" 
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Browse Stories</span>
            </Link>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100">
      <Navbar />
      <div className="max-w-6xl mx-auto py-3 sm:py-4 px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <Link
            to="/feed"
            className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white transition-all shadow-md border border-orange-200/50 group"
          >
            <ArrowLeft className="h-4 w-4 text-orange-600 group-hover:translate-x-[-2px] transition-transform" />
            <span className="text-orange-700 font-medium text-sm sm:text-base">Back to Feed</span>
          </Link>
          
          {isAuthor && (
            <Link
              to={`/story/${storyId}/edit`}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg font-medium text-sm sm:text-base"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Edit Story</span>
              <span className="sm:hidden">Edit</span>
            </Link>
          )}
        </div>

        {/* --- COMPACT STORY HEADER --- */}
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200/30 overflow-hidden mb-4 sm:mb-6">
          {/* Header Gradient */}
          <div className="h-2 bg-gradient-to-r from-orange-500 via-amber-500 to-red-500"></div>
          
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              {/* Compact Cover Image */}
              <div className="shrink-0 mx-auto lg:mx-0">
                <div className="relative group">
                  <img
                    src={story.coverImage}
                    alt={story.title}
                    className="w-36 h-48 sm:w-40 sm:h-56 lg:w-44 lg:h-60 object-cover rounded-xl shadow-lg ring-2 ring-orange-200/50"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>

              {/* Compact Story Info */}
              <div className="flex-1 space-y-3 sm:space-y-4">
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent leading-tight mb-2 text-center lg:text-left">
                    {story.title}
                  </h1>
                  
                  <Link
                    to={`/profile/${story.author._id}`}
                    className="inline-flex items-center gap-2 px-2 sm:px-3 py-1.5 bg-orange-100 hover:bg-orange-200 rounded-lg transition-all group mx-auto lg:mx-0"
                  >
                    <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-r from-orange-500 to-amber-500 rounded-md flex items-center justify-center text-white font-bold text-xs">
                      {story.author.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-orange-700 font-medium group-hover:text-orange-800 text-xs sm:text-sm">
                      {story.author.username}
                    </span>
                  </Link>
                </div>

                {/* Compact Story Description */}
                <div className="bg-orange-50/50 rounded-lg p-3 border border-orange-200/30">
                  <p className="text-slate-700 leading-relaxed text-sm text-center lg:text-left line-clamp-3">
                    {story.description || "This story awaits your discovery..."}
                  </p>
                </div>

                {/* Compact Story Stats */}
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  <div className="flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1.5 shadow-sm border border-orange-200/30">
                    <MessageCircle className="h-3.5 w-3.5 text-blue-500" />
                    <span className="text-xs font-medium text-slate-700">{comments.length}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1.5 shadow-sm border border-orange-200/30">
                    <Clock className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-xs font-medium text-slate-700">
                      {new Date(story.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Compact Action Buttons */}
                <div className="flex flex-wrap gap-2 justify-center lg:justify-start">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg text-sm ${
                      isLiked 
                        ? "bg-gradient-to-r from-red-500 to-pink-500 text-white" 
                        : "bg-white text-red-600 border border-red-200 hover:bg-red-50"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                    <span>{likesCount} {isLiked ? "Liked" : "Like"}</span>
                  </button>

                  <button
                    onClick={handleBookmark}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg text-sm ${
                      isBookmarked 
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white" 
                        : "bg-white text-orange-600 border border-orange-200 hover:bg-orange-50"
                    }`}
                  >
                    <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
                    <span>{isBookmarked ? "Saved" : "Save"}</span>
                  </button>

                  {isAuthor && (
                    <button
                      onClick={handleDeleteStory}
                      disabled={deleting}
                      className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 bg-white text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-50 font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                    >
                      <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="hidden sm:inline">{deleting ? "Deleting..." : "Delete Story"}</span>
                      <span className="sm:hidden">Delete</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- COMPACT CHAPTERS SECTION --- */}
        <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Minimal Chapter List Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200/30 p-3 sm:p-4 lg:sticky lg:top-4">
              {/* Compact Chapters Header */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 -mx-3 sm:-mx-4 -mt-3 sm:-mt-4 mb-3 sm:mb-4 px-3 sm:px-4 py-2 sm:py-3 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4" />
                    <span className="hidden sm:inline">Chapters ({chapters.length})</span>
                    <span className="sm:hidden">Ch. ({chapters.length})</span>
                  </h3>
                  {isAuthor && (
                    <Link
                      to={`/story/${storyId}/edit`}
                      className="bg-white/20 hover:bg-white/30 text-white p-1 rounded-md transition-all backdrop-blur-sm border border-white/10"
                      title="Edit Story & Chapters"
                    >
                      <Plus className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Compact Chapters List */}
              <div className="space-y-1.5 max-h-64 sm:max-h-80 overflow-y-auto">
                {chapters.length === 0 ? (
                  <div className="text-center py-6">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                      <BookOpen className="h-5 w-5 text-orange-500" />
                    </div>
                    <p className="text-gray-500 text-xs">No chapters yet</p>
                    {isAuthor && (
                      <Link
                        to={`/story/${storyId}/edit`}
                        className="text-orange-600 text-xs font-medium hover:text-orange-700 mt-1 inline-block"
                      >
                        Add your first chapter
                      </Link>
                    )}
                  </div>
                ) : (
                  chapters.map((chapter, index) => (
                    <div
                      key={chapter._id}
                      className={`group relative p-2.5 rounded-lg cursor-pointer transition-all border ${
                        selectedChapter?._id === chapter._id
                          ? "bg-gradient-to-r from-orange-100 to-amber-100 border-orange-300 shadow-sm"
                          : "bg-white hover:bg-orange-50 border-orange-200/30 hover:border-orange-300 hover:shadow-sm"
                      }`}
                      onClick={() => setSelectedChapter(chapter)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                            selectedChapter?._id === chapter._id
                              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white"
                              : "bg-orange-200 text-orange-700"
                          }`}>
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-xs text-slate-800 truncate leading-tight">
                              {chapter.title}
                            </h4>
                          </div>
                        </div>
                        
                        {isAuthor && (
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              to={`/story/${storyId}/edit`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 text-orange-600 hover:bg-orange-200 rounded-md transition-all"
                              title="Edit"
                            >
                              <Edit className="h-3 w-3" />
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteChapter(chapter._id);
                              }}
                              className="p-1 text-red-600 hover:bg-red-200 rounded-md transition-all"
                              title="Delete"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Compact Chapter Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {selectedChapter ? (
              <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-orange-200/30 overflow-hidden mb-4 lg:mb-6">
                {/* Compact Chapter Header */}
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-1">
                        {selectedChapter.title}
                      </h2>
                      <div className="flex items-center gap-3 text-orange-100 text-xs">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{Math.ceil((selectedChapter.content?.length || 0) / 1000)} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          <span>Chapter {selectedChapter.chapterNumber || chapters.findIndex(ch => ch._id === selectedChapter._id) + 1}</span>
                        </div>
                      </div>
                    </div>
                    {/* Fullscreen Button */}
                    <button
                      onClick={toggleFullscreen}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                      title="Read in fullscreen"
                    >
                      <Maximize className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Chapter Content */}
                <div className="p-3 sm:p-4 lg:p-6">
                  <div
                    className="prose prose-sm sm:prose-base max-w-none story-content"
                    dangerouslySetInnerHTML={{ __html: selectedChapter.content }}
                  />
                </div>

                {/* Compact Chapter Navigation */}
                {chapters.length > 1 && (
                  <div className="border-t border-orange-200/50 px-4 sm:px-6 py-3 sm:py-4 bg-orange-50/50">
                    <div className="flex justify-between items-center gap-3">
                      <button
                        onClick={() => {
                          const currentIndex = chapters.findIndex(ch => ch._id === selectedChapter._id);
                          if (currentIndex > 0) setSelectedChapter(chapters[currentIndex - 1]);
                        }}
                        disabled={chapters.findIndex(ch => ch._id === selectedChapter._id) === 0}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                      >
                        <ArrowLeft className="h-3 w-3" />
                        <span className="hidden sm:inline">Previous</span>
                        <span className="sm:hidden">Prev</span>
                      </button>

                      <div className="text-xs text-slate-600 font-medium">
                        {chapters.findIndex(ch => ch._id === selectedChapter._id) + 1} of {chapters.length}
                      </div>

                      <button
                        onClick={() => {
                          const currentIndex = chapters.findIndex(ch => ch._id === selectedChapter._id);
                          if (currentIndex < chapters.length - 1) setSelectedChapter(chapters[currentIndex + 1]);
                        }}
                        disabled={chapters.findIndex(ch => ch._id === selectedChapter._id) === chapters.length - 1}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white text-orange-600 rounded-lg hover:bg-orange-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <span className="sm:hidden">Next</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-orange-200/30 p-12 mb-10 text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Ready to Begin?</h3>
                <p className="text-slate-600">Select a chapter from the sidebar to start reading this amazing story</p>
              </div>
            )}
          </div>
        </div>

        {/* --- COMPACT COMMENTS SECTION --- */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-orange-200/30 overflow-hidden mt-6 sm:mt-8">
          {/* Compact Comments Header */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Comments ({comments.length})</span>
              <span className="sm:hidden">Comments ({comments.length})</span>
            </h3>
            <p className="text-orange-100 mt-0.5 text-xs sm:text-sm">Share your thoughts</p>
          </div>

          <div className="p-3 sm:p-4 lg:p-6">
            {user && (
              <form onSubmit={handleAddComment} className="mb-4 sm:mb-6">
                <div className="bg-orange-50/50 rounded-lg p-3 sm:p-4 border border-orange-200/30">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full bg-white border border-orange-200/50 rounded-lg p-2.5 sm:p-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all resize-none text-sm"
                        rows="2"
                        placeholder="Share your thoughts..."
                      />
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-2 sm:mt-3 gap-2 sm:gap-0">
                        <span className="text-xs text-slate-500">
                          as <span className="font-medium text-orange-600">{user.username}</span>
                        </span>
                        <button
                          type="submit"
                          disabled={!newComment.trim()}
                          className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs sm:text-sm w-full sm:w-auto justify-center"
                        >
                          <Send className="h-3 w-3" />
                          Post
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {!user && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 sm:p-4 border border-orange-200/30 mb-4 sm:mb-6 text-center">
                <MessageCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <h4 className="font-medium text-slate-800 mb-1 text-sm">Join the Conversation</h4>
                <p className="text-slate-600 mb-3 text-xs sm:text-sm">Login to share your thoughts</p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-sm font-medium text-xs sm:text-sm"
                >
                  Login to Comment
                </Link>
              </div>
            )}

            {/* Comments List */}
            {comments.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="h-5 w-5 text-orange-500" />
                </div>
                <h4 className="text-sm sm:text-base font-medium text-slate-800 mb-1">No Comments Yet</h4>
                <p className="text-slate-600 text-xs sm:text-sm">Be the first to share your thoughts!</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {comments.map((c) => (
                  <div
                    key={c._id}
                    className="bg-gradient-to-r from-white to-orange-50/30 border border-orange-200/30 p-3 sm:p-4 rounded-lg shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {c.user?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1.5 gap-0.5 sm:gap-0">
                          <h5 className="font-medium text-slate-800 text-sm">{c.user?.username || 'Anonymous'}</h5>
                          <time className="text-xs text-slate-500">
                            {new Date(c.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </time>
                        </div>
                        <p className="text-slate-700 leading-relaxed text-sm">{c.text}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- ADD CHAPTER MODAL --- */}
      {showAddChapter && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleAddChapter}
            className="bg-white p-4 sm:p-6 rounded-2xl w-full max-w-lg space-y-4"
          >
            <h3 className="text-lg sm:text-xl font-bold">Add Chapter</h3>
            <input
              type="text"
              placeholder="Chapter Title"
              value={newChapter.title}
              onChange={(e) =>
                setNewChapter({ ...newChapter, title: e.target.value })
              }
              className="w-full border p-3 rounded-lg text-sm sm:text-base"
            />
            <textarea
              rows="6"
              placeholder="Chapter Content"
              value={newChapter.content}
              onChange={(e) =>
                setNewChapter({ ...newChapter, content: e.target.value })
              }
              className="w-full border p-3 rounded-lg text-sm sm:text-base"
            />
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowAddChapter(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm sm:text-base order-1 sm:order-2"
              >
                Add
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- EDIT CHAPTER MODAL --- */}
      {editingChapter && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleUpdateChapter}
            className="bg-white p-4 sm:p-6 rounded-2xl w-full max-w-lg space-y-4"
          >
            <h3 className="text-lg sm:text-xl font-bold">Edit Chapter</h3>
            <input
              type="text"
              placeholder="Chapter Title"
              value={editingChapter.title}
              onChange={(e) =>
                setEditingChapter({ ...editingChapter, title: e.target.value })
              }
              className="w-full border p-3 rounded-lg text-sm sm:text-base"
            />
            <textarea
              rows="6"
              placeholder="Chapter Content"
              value={editingChapter.content}
              onChange={(e) =>
                setEditingChapter({ ...editingChapter, content: e.target.value })
              }
              className="w-full border p-3 rounded-lg text-sm sm:text-base"
            />
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingChapter(null)}
                className="px-4 py-2 bg-gray-200 rounded-lg text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm sm:text-base order-1 sm:order-2"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StoryDetail;