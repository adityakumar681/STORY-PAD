import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Upload, 
  X, 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft,
  BookOpen,
  Image,
  Tag,
  Settings,
  Eye,
  Clock,
  Heart,
  Users,
  Sparkles,
  FileText,
  Edit3,
  Search,
  Wifi,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import RichTextEditor from '../components/RichTextEditor';
import { useAuth } from '../context/AuthContext';
import { useAutoSave } from '../hooks/useAutoSave';
import api from '../utils/api';

const EditStory = () => {
  const { storyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [story, setStory] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'romance',
    tags: ''
  });
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [chapters, setChapters] = useState([]);

  // Auto-save functionality
  const autoSaveData = {
    title: formData.title,
    description: formData.description,
    category: formData.category,
    tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
    coverImage: coverImagePreview,
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
    storyId: storyId,
    type: 'story',
    enabled: !!story, // Only enable after story is loaded
    onRestore: (restoredData) => {
      if (restoredData.title !== formData.title || 
          restoredData.description !== formData.description ||
          JSON.stringify(restoredData.chapters) !== JSON.stringify(chapters)) {
        
        // Show confirmation for restoring edits
        const shouldRestore = window.confirm(
          'We found unsaved changes for this story. Would you like to restore them?'
        );
        
        if (shouldRestore) {
          setFormData({
            title: restoredData.title || formData.title,
            description: restoredData.description || formData.description,
            category: restoredData.category || formData.category,
            tags: Array.isArray(restoredData.tags) 
              ? restoredData.tags.join(', ') 
              : restoredData.tags || formData.tags
          });

          if (restoredData.coverImage && restoredData.coverImage !== coverImagePreview) {
            setCoverImagePreview(restoredData.coverImage);
          }

          if (restoredData.chapters && restoredData.chapters.length > 0) {
            setChapters(restoredData.chapters);
          }
          
          toast.success('Unsaved changes restored!');
        }
      }
    }
  });

  const categories = [
    { value: 'romance', label: 'Romance', icon: Heart, color: 'from-pink-500 to-rose-500' },
    { value: 'fantasy', label: 'Fantasy', icon: Sparkles, color: 'from-purple-500 to-indigo-500' },
    { value: 'mystery', label: 'Mystery', icon: Search, color: 'from-gray-600 to-slate-700' },
    { value: 'horror', label: 'Horror', icon: X, color: 'from-red-600 to-red-800' },
    { value: 'science fiction', label: 'Science Fiction', icon: Users, color: 'from-blue-500 to-cyan-500' },
    { value: 'adventure', label: 'Adventure', icon: Plus, color: 'from-green-500 to-emerald-600' },
    { value: 'drama', label: 'Drama', icon: Clock, color: 'from-amber-500 to-orange-500' },
    { value: 'comedy', label: 'Comedy', icon: FileText, color: 'from-yellow-400 to-orange-400' },
    { value: 'thriller', label: 'Thriller', icon: ArrowLeft, color: 'from-red-500 to-pink-600' },
    { value: 'young adult', label: 'Young Adult', icon: BookOpen, color: 'from-indigo-400 to-purple-500' },
    { value: 'historical fiction', label: 'Historical Fiction', icon: Settings, color: 'from-amber-600 to-yellow-600' },
    { value: 'poetry', label: 'Poetry', icon: Edit3, color: 'from-pink-400 to-rose-400' },
    { value: 'non-fiction', label: 'Non-Fiction', icon: Eye, color: 'from-slate-600 to-gray-700' },
    { value: 'paranormal', label: 'Paranormal', icon: Upload, color: 'from-indigo-600 to-purple-700' },
    { value: 'contemporary', label: 'Contemporary', icon: Tag, color: 'from-blue-400 to-indigo-500' },
    { value: 'action', label: 'Action', icon: Save, color: 'from-orange-500 to-red-500' }
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchStory();
  }, [storyId, user]);

  const fetchStory = async () => {
    try {
      const storyResponse = await api.get(`/stories/${storyId}`);
      const storyData = storyResponse.data;

      if (storyData.author._id !== user.id) {
        toast.error('You can only edit your own stories');
        navigate(`/story/${storyId}`);
        return;
      }

      setStory(storyData);
      setFormData({
        title: storyData.title,
        description: storyData.description,
        category: storyData.category,
        tags: storyData.tags?.join(', ') || ''
      });
      setCoverImagePreview(storyData.coverImage);

      const chaptersResponse = await api.get(`/chapters/story/${storyId}`);
      setChapters(chaptersResponse.data.map(chapter => ({
        id: chapter._id,
        title: chapter.title,
        content: chapter.content,
        chapterNumber: chapter.chapterNumber
      })));
    } catch (error) {
      console.error('Error fetching story:', error);
      toast.error('Error loading story');
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setCoverImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChapterContentChange = (index, content) => {
    const updatedChapters = [...chapters];
    updatedChapters[index].content = content;
    setChapters(updatedChapters);
  };

  const handleChapterTitleChange = (index, title) => {
    const updatedChapters = [...chapters];
    updatedChapters[index].title = title;
    setChapters(updatedChapters);
  };

  const addNewChapter = () => {
    const newChapter = {
      id: Date.now(),
      title: `Chapter ${chapters.length + 1}`,
      content: '',
      isNew: true
    };
    setChapters([...chapters, newChapter]);
  };

  const removeChapter = (index) => {
    if (chapters.length <= 1) {
      toast.error('A story must have at least one chapter');
      return;
    }
    const updatedChapters = chapters.filter((_, i) => i !== index);
    setChapters(updatedChapters);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please enter a story title');
      return;
    }

    if (chapters.length === 0 || !chapters[0].content.trim()) {
      toast.error('Please add at least one chapter with content');
      return;
    }

    setSaving(true);

    try {
      const storyData = {
        ...formData,
        coverImage: coverImagePreview,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      await api.put(`/stories/${storyId}`, storyData);

      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i];
        if (chapter.isNew) {
          await api.post(`/chapters/story/${storyId}`, {
            title: chapter.title,
            content: chapter.content
          });
        } else {
          await api.put(`/chapters/${chapter.id}`, {
            title: chapter.title,
            content: chapter.content
          });
        }
      }

      // Clear draft after successful save
      clearDraft();
      
      toast.success('Story updated successfully!');
      navigate(`/story/${storyId}`);
    } catch (error) {
      console.error('Error updating story:', error);
      toast.error('Error updating story');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl animate-pulse shadow-xl"></div>
              <div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center">
                <Edit3 className="h-8 w-8 text-orange-600 animate-bounce" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Loading Your Story
              </h3>
              <p className="text-gray-600 font-medium">Preparing your creative workspace...</p>
              <div className="flex justify-center space-x-1 mt-6">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.3}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center max-w-md mx-auto px-6">
            <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-xl">
              <X className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Story Not Found</h3>
            <p className="text-gray-600 mb-6">The story you're looking for doesn't exist or you don't have permission to edit it.</p>
            <button
              onClick={() => navigate('/profile')}
              className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl hover:from-orange-700 hover:to-amber-700 transition-all shadow-lg"
            >
              Go to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100">
      <Navbar />

      <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate(`/story/${storyId}`)}
              className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl hover:bg-white transition-all shadow-md border border-orange-200/50"
            >
              <ArrowLeft className="h-4 w-4 text-orange-600" />
              <span className="text-orange-700 font-medium">Back to Story</span>
            </button>
          </div>
          
          <div className="text-center lg:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <Edit3 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Edit Your Story
              </h1>
            </div>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0">
              Refine your masterpiece and bring your vision to life with our premium editing tools
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Story Details */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Story Details</h2>
                </div>
                
                {/* Auto-save Status */}
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  {autoSaveStatus === 'saving' && (
                    <>
                      <Wifi className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      <span>
                        {lastSaved ? `Saved ${new Date(lastSaved).toLocaleTimeString()}` : 'All changes saved'}
                      </span>
                    </>
                  )}
                  {autoSaveStatus === 'error' && (
                    <>
                      <AlertCircle className="h-4 w-4" />
                      <span>Save failed</span>
                    </>
                  )}
                  {hasUnsavedChanges && (
                    <button
                      type="button"
                      onClick={saveNow}
                      className="ml-2 text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
                    >
                      Save now
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <div className="space-y-8">
                {/* Form Fields */}
                <div className="grid gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                      <FileText className="h-4 w-4 text-orange-600" />
                      Story Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-orange-50/50 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all text-slate-900 font-medium placeholder-slate-400"
                      placeholder="Enter your captivating story title..."
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                      <Eye className="h-4 w-4 text-orange-600" />
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-4 py-4 bg-orange-50/50 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all resize-none text-slate-900 placeholder-slate-400"
                      placeholder="Craft a compelling description that hooks your readers..."
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                        <Settings className="h-4 w-4 text-orange-600" />
                        Category
                      </label>
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                        {categories.map((cat) => {
                          const IconComponent = cat.icon;
                          return (
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                              className={`p-3 rounded-xl border-2 transition-all text-left ${
                                formData.category === cat.value
                                  ? 'border-orange-500 bg-gradient-to-r ' + cat.color + ' text-white shadow-lg'
                                  : 'border-orange-200 bg-white hover:border-orange-300 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <IconComponent className={`h-5 w-5 ${
                                  formData.category === cat.value ? 'text-white' : 'text-orange-600'
                                }`} />
                                <span className="font-medium text-sm">{cat.label}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="max-w-xs mx-auto">
                        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                          <Image className="h-4 w-4 text-orange-600" />
                          Cover Image
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleCoverImageChange}
                            className="hidden"
                            id="coverImage"
                          />
                          <label
                            htmlFor="coverImage"
                            className={`relative block w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all group overflow-hidden ${
                              coverImagePreview
                                ? 'border-orange-300'
                                : 'border-orange-300 hover:border-orange-400 hover:bg-orange-50'
                            }`}
                          >
                            {coverImagePreview ? (
                              <div className="relative w-full h-full">
                                <img
                                  src={coverImagePreview}
                                  alt="Cover preview"
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
                                  <div className="flex items-center gap-2 text-white font-medium text-sm">
                                    <Upload className="h-4 w-4" />
                                    Change Cover
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                  <Upload className="h-5 w-5 text-white" />
                                </div>
                                <h3 className="text-sm font-semibold text-slate-700 mb-1">Upload Cover</h3>
                                <p className="text-slate-500 text-xs leading-relaxed">
                                  Book cover image
                                  <br />
                                  <span className="text-xs">PNG, JPG up to 5MB</span>
                                </p>
                              </div>
                            )}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                      <Tag className="h-4 w-4 text-orange-600" />
                      Tags
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 bg-orange-50/50 border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white transition-all text-slate-900 placeholder-slate-400"
                      placeholder="romance, fantasy, adventure, love triangle..."
                    />
                    <p className="text-xs text-slate-500 mt-2">Separate tags with commas to help readers discover your story</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chapters */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 sm:px-8 py-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Chapters</h2>
                    <p className="text-orange-100 text-sm">Manage your story content</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addNewChapter}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl transition-all backdrop-blur-sm border border-white/10 hover:border-white/20 font-medium"
                >
                  <Plus className="h-4 w-4" />
                  Add Chapter
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              {chapters.map((chapter, index) => (
                <div key={chapter.id} className="bg-gradient-to-br from-orange-50 to-amber-50/50 border border-orange-200 rounded-2xl overflow-hidden shadow-lg">
                  {/* Chapter Header */}
                  <div className="bg-white/90 backdrop-blur-sm px-4 sm:px-6 py-4 border-b border-orange-200/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-amber-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <input
                          type="text"
                          value={chapter.title}
                          onChange={(e) => handleChapterTitleChange(index, e.target.value)}
                          className="text-lg font-bold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-lg px-3 py-2 flex-1 text-slate-800 placeholder-slate-400"
                          placeholder="Chapter Title"
                        />
                      </div>
                      {chapters.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeChapter(index)}
                          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-all border border-red-200/50 hover:border-red-300 font-medium"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Chapter Content */}
                  <div className="p-4 sm:p-6">
                    <div className="bg-white rounded-xl border border-orange-200/50 overflow-hidden shadow-sm">
                      <RichTextEditor
                        value={chapter.content}
                        onChange={(content) => handleChapterContentChange(index, content)}
                        placeholder="Begin crafting your chapter here... Let your imagination flow!"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <button
              type="button"
              onClick={() => navigate(`/story/${storyId}`)}
              className="flex items-center gap-3 px-8 py-4 bg-white border-2 border-orange-300 text-orange-700 rounded-2xl hover:border-orange-400 hover:shadow-md transition-all font-semibold text-lg"
            >
              <Eye className="h-5 w-5" />
              Preview Story
            </button>
            
            <button
              type="submit"
              disabled={saving}
              className="relative flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-orange-600 via-amber-600 to-red-600 text-white rounded-2xl hover:from-orange-700 hover:via-amber-700 hover:to-red-700 transition-all shadow-xl text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 via-amber-400 to-red-400 opacity-0 group-hover:opacity-20 transition-opacity" />
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                  Updating Story...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Update Story
                </>
              )}
            </button>
          </div>

          {/* Story Stats */}
          <div className="mt-12 bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/30">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl flex items-center justify-center mx-auto">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{chapters.length}</div>
                <div className="text-sm text-slate-600 font-medium">Chapters</div>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center mx-auto">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {chapters.reduce((total, chapter) => total + (chapter.content?.length || 0), 0)}
                </div>
                <div className="text-sm text-slate-600 font-medium">Characters</div>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center mx-auto">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-slate-800">
                  {Math.ceil(chapters.reduce((total, chapter) => total + (chapter.content?.split(' ').length || 0), 0) / 200)}
                </div>
                <div className="text-sm text-slate-600 font-medium">Min Read</div>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl flex items-center justify-center mx-auto">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-slate-800">{formData.category}</div>
                <div className="text-sm text-slate-600 font-medium">Genre</div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStory;