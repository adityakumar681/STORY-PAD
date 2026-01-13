import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  BookOpen,
  MessageCircle,
  Bookmark,
  Edit,
  Trash2,
  MoreVertical
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const StoryCard = ({ story, onDelete }) => {
  const [isLiked, setIsLiked] = useState(story.likes?.includes(story._id) || false);
  const [likesCount, setLikesCount] = useState(story.likes?.length || 0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const isAuthor = user && story.author._id === user.id;

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to like stories");
      return;
    }

    try {
      const response = await api.post(`/stories/${story._id}/like`);
      setIsLiked(response.data.liked);
      setLikesCount(response.data.likesCount);
    } catch (error) {
      console.error("Error liking story:", error);
    }
  };

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please login to bookmark stories");
      return;
    }

    try {
      const response = await api.post(`/bookmarks/${story._id}`);
      setIsBookmarked(response.data.bookmarked);
      toast.success(
        response.data.bookmarked
          ? "Story bookmarked!"
          : "Story removed from bookmarks"
      );
    } catch (error) {
      console.error("Error bookmarking story:", error);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/story/${story._id}/edit`);
  };
};
const handleDelete = async (e) => {
  e.preventDefault();
  e.stopPropagation();

  if (
    !window.confirm(
      "Are you sure you want to delete this story? This action cannot be undone."
    )
  ) {
    return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-pink-100">
      <div className="p-6">
        <div className="flex space-x-4">
          {/* Cover Image */}
          <Link to={`/story/${story._id}`} className="shrink-0">
            <div className="w-24 h-32 bg-linear-to-br from-pink-100 to-pink-200 rounded-lg flex items-center justify-center overflow-hidden">
              {story.coverImage ? (
                <img
                  src={story.coverImage}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BookOpen className="h-8 w-8 text-pink-400" />
              )}
            </div>
          </Link>

          {/* Story Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-2">
              <Link to={`/story/${story._id}`} className="flex-1">
                <h3 className="text-xl font-display font-bold text-gray-900 hover:text-pink-600 transition-colors">
                  {story.title}
                </h3>
              </Link>
              
              {isAuthor && (
                <div className="relative ml-2">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowMenu(!showMenu);
                    }}
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  
                  {showMenu && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border z-10">
                      <div className="py-1">
                        <button
                          onClick={handleEdit}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Edit className="h-4 w-4" />
                          Edit Story
                        </button>
                        <button
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          {isDeleting ? 'Deleting...' : 'Delete Story'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {story.description}
            </p>

            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
              <Link 
                to={`/profile/${story.author._id}`}
                className="font-medium text-pink-600 hover:text-pink-700"
              >
                {story.author.username}
              </Link>
              <span>•</span>
              <span>{new Date(story.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span className="capitalize">{story.category}</span>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 transition-colors ${
                    isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm">{likesCount}</span>
                </button>
                
                <div className="flex items-center space-x-1 text-gray-500">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">0</span>
                </div>
                
                <div className="flex items-center space-x-1 text-gray-500">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm">{story.reads || 0}</span>
                </div>
              </div>

              <button
                onClick={handleBookmark}
                className={`p-2 rounded-full transition-colors ${
                  isBookmarked 
                    ? 'text-pink-500 bg-pink-50' 
                    : 'text-gray-400 hover:text-pink-500 hover:bg-pink-50'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Tags */}
            {story.tags && story.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {story.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
  }

  setIsDeleting(true);

  try {
    await api.delete(`/stories/${story._id}`);
    toast.success("Story deleted successfully");

    if (onDelete) {
      onDelete(story._id);
    }
  } catch (error) {
    console.error("Error deleting story:", error);
    toast.error("Failed to delete story");
  } finally {
    setIsDeleting(false);
    setShowMenu(false);
  }
};

export default StoryCard;
