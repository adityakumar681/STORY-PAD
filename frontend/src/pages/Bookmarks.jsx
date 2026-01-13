import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Bookmark, BookOpen, Heart, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const response = await api.get('/bookmarks');
      console.log('Bookmarks response:', response.data); // Debug log
      // Ensure we have valid story data
      const validBookmarks = (response.data || []).filter(story => story && story._id);
      setBookmarks(validBookmarks);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      setBookmarks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBookmark = async (storyId) => {
    try {
      await api.post(`/bookmarks/${storyId}`); // Toggle bookmark (remove it)
      setBookmarks(prev => prev.filter(story => story._id !== storyId));
    } catch (error) {
      console.error('Error removing bookmark:', error);
      // Optionally show an error message to user
    }
  };

  const filteredBookmarks = bookmarks.filter(story =>
    story.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    story.author?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        {/* Premium Header Skeleton */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 lg:py-12">
            <div className="text-center animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-6"></div>
              <div className="h-8 sm:h-10 bg-gray-200 rounded-lg w-48 sm:w-64 mx-auto mb-4"></div>
              <div className="h-4 sm:h-6 bg-gray-200 rounded w-72 sm:w-96 mx-auto mb-8"></div>
              <div className="flex justify-center space-x-8">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 lg:py-8">
          {/* Search Skeleton */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 animate-pulse">
              <div className="h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
          
          {/* Premium Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="aspect-[3/4] bg-gray-200"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Premium Hero Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Bookmark className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              My Library
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 px-4">
              Your curated collection of favorite stories, ready to continue reading
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-gray-600">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-orange-500" />
                <span className="font-medium">{bookmarks.length} Bookmarked Stories</span>
              </div>
              {user && (
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span className="font-medium">@{user.username}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 lg:py-8">
        {/* Premium Search Section */}
        {bookmarks.length > 0 && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search your library..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 sm:py-4 border border-gray-200 rounded-full focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50 focus:bg-white transition-all text-sm sm:text-base"
                />
              </div>
              {searchTerm && (
                <div className="mt-4 text-sm text-gray-600 text-center">
                  Found {filteredBookmarks.length} of {bookmarks.length} stories
                </div>
              )}
            </div>
          </div>
        )}

        {/* Premium Stories Grid */}
        {filteredBookmarks.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
            {filteredBookmarks.map(story => (
              <div 
                key={story._id} 
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-orange-200"
                onClick={() => navigate(`/story/${story._id}`)}
              >
                {/* Story Cover */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                  {story.coverImage ? (
                    <img
                      src={story.coverImage}
                      alt={story.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 via-amber-50 to-red-50 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-orange-400" />
                    </div>
                  )}
                  
                  {/* Remove Bookmark Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBookmark(story._id);
                    }}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-110 hover:bg-red-600"
                  >
                    <Bookmark className="h-4 w-4 fill-current" />
                  </button>

                  {/* Genre Badge */}
                  {story.category && (
                    <div className="absolute bottom-2 left-2">
                      <span className="bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                        {story.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Story Info */}
                <div className="p-3">
                  <h3 className="font-bold text-sm text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                    {story.title}
                  </h3>

                  {/* Author & Reading Progress */}
                  <div className="flex items-center justify-between">
                    <div 
                      className="flex items-center space-x-2 group/author cursor-pointer flex-1 min-w-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/profile/${story.author._id}`);
                      }}
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                        {story.author.profilePicture ? (
                          <img 
                            src={story.author.profilePicture} 
                            alt={story.author.username}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          story.author.username?.[0]?.toUpperCase()
                        )}
                      </div>
                      <p className="font-medium text-xs text-gray-700 truncate group-hover/author:text-orange-600 transition-colors">
                        {story.author.username}
                      </p>
                    </div>

                    {/* Continue Reading Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/story/${story._id}`);
                      }}
                      className="flex items-center space-x-1 p-1 rounded-full transition-all hover:scale-110 shrink-0 bg-orange-50 text-orange-600 hover:bg-orange-100"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span className="text-xs font-medium">Read</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <div className="inline-flex p-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-full">
                  <Bookmark className="h-16 w-16 text-orange-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Start Building Your Library
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Discover amazing stories and bookmark your favorites to create your personal reading list. 
                Your bookmarked stories will appear here for easy access anytime.
              </p>
              <div className="space-y-4">
                <a 
                  href="/feed" 
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all transform hover:scale-105 shadow-lg font-semibold"
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Explore Stories
                </a>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="max-w-md mx-auto">
              <Search className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No stories match your search
              </h3>
              <p className="text-gray-600">
                Try adjusting your search terms or browse all your bookmarks
              </p>
              <button
                onClick={() => setSearchTerm('')}
                className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Clear Search
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;