import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Plus, 
  X, 
  ImageIcon, 
  BookOpen, 
  Feather,
  Target,
  Clock,
  Eye,
  Zap,
  Sparkles,
  PenTool,
  FileText,
  Settings,
  Palette,
  Globe,
  Users,
  Heart,
  ChevronLeft,
  ChevronRight,
  Menu,
  Layers,
  BarChart3,
  Calendar,
  Bookmark,
  Share2,
  Download,
  Moon,
  Sun,
  // Genre icons
  Crown,
  Rocket,
  Search,
  Ghost,
  Swords,
  Drama,
  Smile,
  Shield,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Navbar from '../components/Navbar';
import RichTextEditor from '../components/RichTextEditor';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useAutoSave } from '../hooks/useAutoSave';
import api from '../utils/api';
import '../styles/animations.css';

const CreateStory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [writingGoal, setWritingGoal] = useState(500);
  const [writingStats, setWritingStats] = useState({
    sessionsToday: 0,
    wordsToday: 0,
    streak: 0
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Romance',
    tags: '',
    targetAudience: 'Young Adult',
    language: 'English',
    status: 'Ongoing'
  });

  const [chapters, setChapters] = useState([
    { 
      id: 1, 
      title: 'Chapter 1: The Beginning', 
      content: '', 
      wordCount: 0,
      notes: '',
      published: false,
      createdAt: new Date().toISOString()
    }
  ]);

  // Auto-save functionality
  const autoSaveData = {
    title: formData.title,
    description: formData.description,
    category: formData.category,
    tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
    coverImage: formData.coverImage,
    targetAudience: formData.targetAudience,
    language: formData.language,
    status: formData.status,
    chapters: chapters
  };

  const {
    autoSaveStatus,
    lastSaved,
    hasUnsavedChanges,
    saveNow,
    clearDraft
  } = useAutoSave(autoSaveData, {
    delay: 3000,
    storyId: null, // null for new story
    type: 'story',
    enabled: true,
    onRestore: (restoredData) => {
      // Restore form data
      setFormData({
        title: restoredData.title || '',
        description: restoredData.description || '',
        category: restoredData.category || 'Romance',
        tags: Array.isArray(restoredData.tags) 
          ? restoredData.tags.join(', ') 
          : restoredData.tags || '',
        targetAudience: restoredData.targetAudience || 'Young Adult',
        language: restoredData.language || 'English',
        status: restoredData.status || 'Ongoing',
        coverImage: restoredData.coverImage || ''
      });

      // Restore cover image preview
      if (restoredData.coverImage) {
        setCoverImagePreview(restoredData.coverImage);
      }

      // Restore chapters
      if (restoredData.chapters && restoredData.chapters.length > 0) {
        setChapters(restoredData.chapters);
      }
    }
  });

  const categories = [
    { id: 'romance', label: 'Romance', icon: Heart, color: 'from-pink-500 to-rose-500' },
    { id: 'fantasy', label: 'Fantasy', icon: Crown, color: 'from-purple-500 to-indigo-500' },
    { id: 'sci-fi', label: 'Science Fiction', icon: Rocket, color: 'from-blue-500 to-cyan-500' },
    { id: 'mystery', label: 'Mystery', icon: Search, color: 'from-gray-600 to-gray-800' },
    { id: 'horror', label: 'Horror', icon: Ghost, color: 'from-red-600 to-red-800' },
    { id: 'adventure', label: 'Adventure', icon: Swords, color: 'from-green-500 to-emerald-500' },
    { id: 'drama', label: 'Drama', icon: Drama, color: 'from-amber-500 to-orange-500' },
    { id: 'comedy', label: 'Comedy', icon: Smile, color: 'from-yellow-400 to-yellow-600' },
    { id: 'thriller', label: 'Thriller', icon: Zap, color: 'from-red-500 to-pink-500' },
    { id: 'young-adult', label: 'Young Adult', icon: Users, color: 'from-teal-500 to-cyan-500' },
    { id: 'historical-fiction', label: 'Historical Fiction', icon: Shield, color: 'from-amber-600 to-yellow-700' },
    { id: 'poetry', label: 'Poetry', icon: Feather, color: 'from-violet-500 to-purple-600' },
    { id: 'non-fiction', label: 'Non-Fiction', icon: BookOpen, color: 'from-slate-600 to-gray-700' },
    { id: 'paranormal', label: 'Paranormal', icon: Eye, color: 'from-indigo-600 to-purple-700' },
    { id: 'contemporary', label: 'Contemporary', icon: Globe, color: 'from-emerald-500 to-green-600' },
    { id: 'action', label: 'Action', icon: Zap, color: 'from-orange-500 to-red-600' }
  ];



  // Calculate total word count
  useEffect(() => {
    const totalWords = chapters.reduce((total, chapter) => {
      const text = chapter.content.replace(/<[^>]*>/g, '');
      const words = text.trim().split(/\\s+/).filter(word => word.length > 0);
      return total + words.length;
    }, 0);
    setWordCount(totalWords);
  }, [chapters]);

  const getCurrentChapter = () => chapters[currentChapterIndex] || chapters[0];
  const progressPercentage = Math.min((wordCount / writingGoal) * 100, 100);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    console.log('File selected:', file);
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target.result;
        console.log('Image data loaded:', imageData ? 'Success' : 'Failed');
        setCoverImagePreview(imageData);
        console.log('Cover preview set');
        // Also save to formData so it gets sent to backend
        setFormData(prev => ({
          ...prev,
          coverImage: imageData
        }));
        console.log('Form data updated');
      };
      reader.readAsDataURL(file);
    }
  };

  const addChapter = () => {
    const newChapter = {
      id: chapters.length + 1,
      title: `Chapter ${chapters.length + 1}: New Chapter`,
      content: '',
      wordCount: 0,
      notes: '',
      published: false,
      createdAt: new Date().toISOString()
    };
    setChapters([...chapters, newChapter]);
    setCurrentChapterIndex(chapters.length);
  };

  const updateChapter = (id, field, value) => {
    setChapters(chapters.map(chapter => {
      if (chapter.id === id) {
        const updated = { ...chapter, [field]: value };
        if (field === 'content') {
          const text = value.replace(/<[^>]*>/g, '');
          const words = text.trim().split(/\\s+/).filter(word => word.length > 0);
          updated.wordCount = words.length;
        }
        return updated;
      }
      return chapter;
    }));
  };

  const handlePublish = async () => {
    if (!formData.title.trim()) {
      toast.error('Please add a title');
      return;
    }
    
    if (chapters.every(ch => !ch.content.trim())) {
      toast.error('Please add content to at least one chapter');
      return;
    }

    setLoading(true);
    try {
      const storyData = {
        ...formData,
        chapters: chapters.filter(ch => ch.content.trim()),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      await api.post('/stories', storyData);
      
      // Clear draft after successful publish
      clearDraft();
      
      toast.success('Story published successfully!');
      navigate('/feed');
    } catch (error) {
      console.error('Error publishing story:', error);
      toast.error(error.response?.data?.message || 'Error publishing story');
    } finally {
      setLoading(false);
    }
  };

  const WritingSidebar = () => (
    <div className={`${sidebarOpen ? 'w-80' : 'w-0'} lg:transition-all lg:duration-300 overflow-hidden ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-r flex flex-col h-full`}>
      {/* Sidebar Header */}
      <div className={`p-4 lg:p-6 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`font-bold text-lg lg:text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>My Story</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
        
        {/* Writing Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className={`text-center p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-orange-50'}`}>
            <div className="text-lg font-bold text-orange-500">{wordCount}</div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Words</div>
          </div>
          <div className={`text-center p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-red-50'}`}>
            <div className="text-lg font-bold text-red-500">{chapters.length}</div>
            <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Chapters</div>
          </div>
        </div>

        {/* Auto-save Status */}
        <div className={`flex items-center justify-between p-3 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center space-x-2">
            {autoSaveStatus === 'saving' && (
              <>
                <Wifi className="h-4 w-4 text-blue-500 animate-spin" />
                <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Saving...</span>
              </>
            )}
            {autoSaveStatus === 'saved' && (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {lastSaved ? `Saved ${new Date(lastSaved).toLocaleTimeString()}` : 'All changes saved'}
                </span>
              </>
            )}
            {autoSaveStatus === 'error' && (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Auto-save failed</span>
              </>
            )}
          </div>
          {hasUnsavedChanges && (
            <button
              onClick={saveNow}
              className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
            >
              Save now
            </button>
          )}
        </div>
      </div>

      {/* Chapter Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold text-sm lg:text-base ${darkMode ? 'text-white' : 'text-gray-900'}`}>Chapters</h3>
            <button
              onClick={addChapter}
              className="p-1.5 gradient-hero text-white rounded-lg hover:shadow-lg transition-all"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          <div className="space-y-2">
            {chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className={`group rounded-xl transition-all ${
                  currentChapterIndex === index
                    ? 'gradient-hero text-white shadow-lg'
                    : darkMode 
                      ? 'hover:bg-gray-800 text-gray-300' 
                      : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div 
                  onClick={() => setCurrentChapterIndex(index)}
                  className="p-3 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{chapter.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs opacity-75">{chapter.wordCount} words</p>
                        {chapter.published && (
                          <Eye className="h-3 w-3 opacity-60" />
                        )}
                      </div>
                    </div>
                    <div className={`flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                      currentChapterIndex === index ? 'opacity-100' : ''
                    }`}>
                      {chapters.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Delete this chapter?')) {
                              const newChapters = chapters.filter(ch => ch.id !== chapter.id);
                              setChapters(newChapters);
                              if (currentChapterIndex >= newChapters.length) {
                                setCurrentChapterIndex(newChapters.length - 1);
                              }
                            }
                          }}
                          className={`p-1 rounded hover:bg-red-500/20 transition-colors ${
                            currentChapterIndex === index ? 'text-white/80 hover:text-white' : 'text-red-500'
                          }`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (activeStep === 1) {
    return (
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Navbar />
        
        {/* Premium Hero Section */}
        <div className={`relative ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b overflow-hidden`}>
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, #f97316 0%, transparent 50%), 
                               radial-gradient(circle at 75% 75%, #ef4444 0%, transparent 50%)`
            }}></div>
          </div>
          
          <div className="relative max-w-4xl mx-auto px-4 py-12 lg:py-16">
            <div className="text-center">
              {/* Premium Icon Group */}
              <div className="flex items-center justify-center mb-8">
                <div className="relative flex items-center space-x-4">
                  <div className={`p-4 rounded-2xl ${darkMode ? 'bg-orange-500/20 border border-orange-500/30' : 'bg-orange-100 border border-orange-200'} backdrop-blur-sm`}>
                    <Feather className={`h-8 w-8 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  </div>
                  <div className={`p-3 rounded-xl ${darkMode ? 'bg-red-500/20 border border-red-500/30' : 'bg-red-100 border border-red-200'} backdrop-blur-sm`}>
                    <Sparkles className={`h-6 w-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                  </div>
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-pink-500/20 border border-pink-500/30' : 'bg-pink-100 border border-pink-200'} backdrop-blur-sm`}>
                    <Heart className={`h-5 w-5 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`} />
                  </div>
                </div>
              </div>
              
              <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Craft Your Literary
                <span className="block bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Masterpiece
                </span>
              </h1>
              

              
              {/* Premium Feature Icons */}
              <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                <div className="flex flex-col items-center space-y-2 group">
                  <div className={`p-3 rounded-xl transition-all group-hover:scale-110 ${darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
                    <PenTool className={`h-6 w-6 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} />
                  </div>
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Rich Editor</span>
                </div>
                
                <div className="flex flex-col items-center space-y-2 group">
                  <div className={`p-3 rounded-xl transition-all group-hover:scale-110 ${darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
                    <Users className={`h-6 w-6 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                  </div>
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Global Reach</span>
                </div>
                
                <div className="flex flex-col items-center space-y-2 group">
                  <div className={`p-3 rounded-xl transition-all group-hover:scale-110 ${darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
                    <BookOpen className={`h-6 w-6 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`} />
                  </div>
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Easy Publishing</span>
                </div>
                
                <div className="flex flex-col items-center space-y-2 group">
                  <div className={`p-3 rounded-xl transition-all group-hover:scale-110 ${darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50 border border-gray-200'}`}>
                    <Zap className={`h-6 w-6 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
                  </div>
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Instant Feedback</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <button
              onClick={() => navigate('/feed')}
              className={`flex items-center space-x-2 ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-all hover:scale-105`}
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Feed</span>
            </button>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile menu toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`sm:hidden p-2 rounded-lg transition-all hover:scale-105 ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-600 shadow-sm'}`}
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg transition-all hover:scale-105 ${darkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-600 shadow-sm'}`}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Story Setup Form */}
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-3xl border shadow-2xl overflow-hidden backdrop-blur-sm`}>
            <div className="relative gradient-hero p-6 sm:p-8">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-white">
                        Story Details
                      </h2>
                      <p className="text-white/80 text-sm sm:text-base">
                        Craft the foundation of your masterpiece
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center space-x-2">
                    <Sparkles className="h-5 w-5 text-white/60" />
                    <span className="text-white/60 text-sm font-medium">Premium Editor</span>
                  </div>
                </div>
                
                {/* Progress indicator */}
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                    <div className="w-2 h-2 bg-white/40 rounded-full"></div>
                  </div>
                  <span className="text-white/80 text-xs font-medium">Step 1 of 3</span>
                </div>
              </div>
            </div>
            
            <div className="p-6 sm:p-8 lg:p-10 space-y-8 sm:space-y-10">
              {/* Cover Image Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Upload Section */}
                <div>
                  <div className="flex items-center space-x-3 mb-6">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-orange-500/20' : 'bg-orange-100'}`}>
                      <ImageIcon className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Cover Image
                      </h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Make a great first impression
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div 
                      className={`w-full aspect-[2/3] max-w-64 mx-auto border-2 border-dashed rounded-3xl flex items-center justify-center cursor-pointer transition-all group relative overflow-hidden ${
                        coverImagePreview 
                          ? 'border-orange-500 border-solid shadow-2xl ring-4 ring-orange-500/20' 
                          : darkMode 
                            ? 'border-gray-600 hover:border-orange-400 hover:bg-gray-700/50 hover:shadow-xl' 
                            : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50/50 hover:shadow-xl'
                      }`}
                      style={{
                        backgroundImage: coverImagePreview ? `url(${coverImagePreview})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {!coverImagePreview ? (
                        <div className="text-center p-8">
                          <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-xl">
                            <ImageIcon className="h-10 w-10 text-white" />
                          </div>
                          <span className={`text-lg font-bold block mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                            Upload Cover
                          </span>
                          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            JPG, PNG, WebP • Max 10MB
                          </p>
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-all bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
                            <Upload className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                    </div>
                    
                    {coverImagePreview && (
                      <button
                        onClick={() => {
                          setCoverImagePreview(null);
                          setFormData(prev => ({
                            ...prev,
                            coverImage: null
                          }));
                        }}
                        className="absolute -top-3 -right-3 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all shadow-lg hover:shadow-xl"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Tips */}
                <div className={`p-6 rounded-3xl ${darkMode ? 'bg-gray-700/30' : 'bg-orange-50'} border ${darkMode ? 'border-gray-600' : 'border-orange-200'}`}>
                  <div className="flex items-center space-x-2 mb-4">
                    <Sparkles className="h-6 w-6 text-orange-500" />
                    <h4 className={`font-bold text-xl ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Cover Tips
                    </h4>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Use <strong>2:3 aspect ratio</strong> (400×600px) for best results
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Make your <strong>title clearly readable</strong>
                      </span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Choose colors that <strong>match your genre</strong>
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Title and Description */}
              <div className="space-y-8">
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-blue-500/20' : 'bg-blue-100'}`}>
                      <PenTool className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <label className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Story Title *
                      </label>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Choose a title that captures attention
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter a captivating title..."
                      className={`w-full px-4 sm:px-6 py-4 sm:py-5 border-2 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-lg sm:text-xl font-medium shadow-sm ${
                        darkMode 
                          ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-700' 
                          : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
                      }`}
                    />
                    <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {formData.title.length}/100
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
                      <FileText className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <label className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Story Description
                      </label>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Hook your readers with a compelling summary
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      placeholder="What's your story about? What makes it unique? Draw readers in with an engaging description..."
                      className={`w-full px-4 sm:px-6 py-4 sm:py-5 border-2 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none text-base sm:text-lg shadow-sm ${
                        darkMode 
                          ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-700' 
                          : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
                      }`}
                    />
                    <div className={`absolute right-4 bottom-4 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {formData.description.length}/500
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-green-500/20' : 'bg-green-100'}`}>
                    <Layers className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Story Category
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Help readers discover your story
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: category.label }))}
                      className={`group relative p-4 sm:p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                        formData.category === category.label
                          ? 'border-orange-500 shadow-xl ring-4 ring-orange-500/20'
                          : darkMode
                            ? 'border-gray-600 bg-gray-700/50 hover:bg-gray-700 hover:border-gray-500 shadow-lg'
                            : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 shadow-lg hover:shadow-xl'
                      }`}
                    >
                      <div className="text-center">
                        <div className={`mb-3 flex justify-center p-3 rounded-xl ${
                          formData.category === category.label
                            ? 'bg-orange-500 shadow-lg'
                            : `bg-gradient-to-br ${category.color} shadow-md group-hover:shadow-lg`
                        }`}>
                          <category.icon className={`h-6 w-6 sm:h-7 sm:w-7 text-white`} />
                        </div>
                        <span className={`text-sm sm:text-base font-semibold block ${
                          formData.category === category.label 
                            ? 'text-orange-600' 
                            : darkMode 
                              ? 'text-white' 
                              : 'text-gray-900'
                        }`}>
                          {category.label}
                        </span>
                        <div className={`w-full h-1 mt-3 rounded-full transition-all ${
                          formData.category === category.label
                            ? 'bg-orange-500'
                            : 'bg-gray-200 group-hover:bg-gray-300'
                        }`}></div>
                      </div>
                      
                      {formData.category === category.label && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Settings */}
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-indigo-500/20' : 'bg-indigo-100'}`}>
                    <Settings className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Story Settings
                    </h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Configure your story preferences
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center space-x-2 mb-4">
                      <Users className="h-5 w-5 text-blue-500" />
                      <label className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Target Audience
                      </label>
                    </div>
                    <select
                      name="targetAudience"
                      value={formData.targetAudience}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-base ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    >
                      {['General', 'Young Adult', 'New Adult', 'Adult'].map(audience => (
                        <option key={audience} value={audience}>{audience}</option>
                      ))}
                    </select>
                  </div>

                  <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center space-x-2 mb-4">
                      <Globe className="h-5 w-5 text-green-500" />
                      <label className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Language
                      </label>
                    </div>
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-base ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    >
                      {['English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese'].map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>

                  <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center space-x-2 mb-4">
                      <BarChart3 className="h-5 w-5 text-purple-500" />
                      <label className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        Publication Status
                      </label>
                    </div>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-base ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-200 text-gray-900'
                      }`}
                    >
                      {['Ongoing', 'Completed', 'Hiatus'].map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`p-2 rounded-lg ${darkMode ? 'bg-pink-500/20' : 'bg-pink-100'}`}>
                    <Bookmark className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <label className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Story Tags
                    </label>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Add keywords to help readers find your story
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    placeholder="e.g., romance, fantasy, adventure, enemies-to-lovers (separate with commas)"
                    className={`w-full px-4 sm:px-6 py-4 sm:py-5 border-2 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-base sm:text-lg shadow-sm ${
                      darkMode 
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-700' 
                        : 'bg-white border-gray-200 text-gray-900 hover:border-gray-300'
                    }`}
                  />
                  <div className={`absolute right-4 bottom-4 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {formData.tags.split(',').filter(tag => tag.trim()).length} tags
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <div className="relative">
                <div className={`flex flex-col sm:flex-row justify-end gap-4 p-6 rounded-2xl border transition-all ${
                  darkMode 
                    ? 'border-gray-600 bg-gray-700/30' 
                    : 'border-orange-200 bg-gradient-to-r from-orange-50/50 to-red-50/50'
                }`}>
                  <div className="flex-1 text-center sm:text-left">
                    <h4 className={`text-lg font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Ready to Begin?
                    </h4>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      Start crafting your story with our advanced editor
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveStep(2)}
                    className="group relative w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-lg rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all flex items-center justify-center space-x-3 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative z-10">Start Writing</span>
                    <Feather className="relative z-10 h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Writing Interface (Step 2)
  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Navbar />
      
      {/* Writing Interface */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Menu Overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/50 animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
        
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          fixed lg:relative z-50 lg:z-0 w-80 h-full 
          transition-transform duration-300 ease-in-out lg:transition-none
          ${sidebarOpen ? 'lg:w-80' : 'lg:w-0'} lg:transition-all lg:duration-300 overflow-hidden`}>
          <WritingSidebar />
        </div>
        
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`lg:hidden fixed top-20 left-4 z-30 p-3 rounded-full shadow-lg transition-all ${
            darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'
          }`}
        >
          <Menu className="h-5 w-5" />
        </button>
        
        {/* Desktop Sidebar Toggle */}
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className={`hidden lg:block fixed left-4 top-1/2 transform -translate-y-1/2 z-10 p-3 rounded-full shadow-lg transition-all ${
              darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'
            }`}
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}

        {/* Main Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile-Optimized Editor Header */}
          <div className={`p-4 sm:p-6 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
                {/* Back Button */}
                <button
                  onClick={() => setActiveStep(1)}
                  className={`p-2 rounded-lg transition-colors hover:scale-105 ${
                    darkMode 
                      ? 'hover:bg-gray-700 text-gray-300 hover:text-white' 
                      : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                  }`}
                  title="Back to Story Details"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setCurrentChapterIndex(Math.max(0, currentChapterIndex - 1))}
                  disabled={currentChapterIndex === 0}
                  className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                    currentChapterIndex === 0 
                      ? 'opacity-50 cursor-not-allowed' 
                      : darkMode 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
                
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={getCurrentChapter().title}
                    onChange={(e) => updateChapter(getCurrentChapter().id, 'title', e.target.value)}
                    className={`text-base sm:text-lg font-semibold bg-transparent border-none focus:outline-none w-full ${darkMode ? 'text-white' : 'text-gray-900'}`}
                    placeholder="Chapter title..."
                  />
                  <div className={`flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span>Ch. {currentChapterIndex + 1}/{chapters.length}</span>
                    <span className="hidden xs:inline">•</span>
                    <span className="hidden xs:inline">{getCurrentChapter().wordCount}w</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{Math.ceil(getCurrentChapter().wordCount / 200)} min read</span>
                  </div>
                </div>
                
                <button
                  onClick={() => setCurrentChapterIndex(Math.min(chapters.length - 1, currentChapterIndex + 1))}
                  disabled={currentChapterIndex === chapters.length - 1}
                  className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                    currentChapterIndex === chapters.length - 1 
                      ? 'opacity-50 cursor-not-allowed' 
                      : darkMode 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* Mobile: Essential controls only */}
                <div className="flex items-center space-x-1 sm:hidden">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'
                    }`}
                    title="Toggle Dark Mode"
                  >
                    {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {/* Desktop: Full controls */}
                <div className="hidden sm:flex items-center space-x-2">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'
                    }`}
                    title="Toggle Dark Mode"
                  >
                    {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                  
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                    title="Toggle Sidebar"
                  >
                    <Menu className="h-4 w-4" />
                  </button>
                </div>

                {/* Auto-save Status */}
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
                    autoSaveStatus === 'saved' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <span className={`text-xs sm:text-sm hidden xs:block ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {autoSaveStatus === 'saved' ? 'Saved' : 'Saving...'}
                  </span>
                </div>

                {/* Publish Button */}
                <button
                  onClick={handlePublish}
                  disabled={loading}
                  className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center space-x-1 sm:space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  )}
                  <span className="hidden sm:inline text-sm">{loading ? 'Publishing...' : 'Publish'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="flex-1 flex flex-col min-h-0">
            <RichTextEditor
              value={getCurrentChapter().content}
              onChange={(content) => updateChapter(getCurrentChapter().id, 'content', content)}
              placeholder="Begin your chapter..."
              className="flex-1 flex flex-col"
              minHeight="400px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStory;