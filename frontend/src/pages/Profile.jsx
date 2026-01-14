import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Heart,
  Users,
  BookOpen,
  Bookmark,
  Plus,
  Settings,
  User,
  Camera,
  Grid3X3,
  Calendar,
  MapPin,
  Globe,
  Edit3,
  UserPlus,
  MessageCircle,
  X,
  Sparkles,
} from "lucide-react";
import Navbar from "../components/Navbar";
import StoryCard from "../components/StoryCard";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import api from "../utils/api";

const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stories, setStories] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("stories");
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [userModal, setUserModal] = useState({
    show: false,
    users: [],
    title: "",
  });
  const { user: currentUser } = useAuth();

  const isOwnProfile = currentUser?.id === userId;

  useEffect(() => {
    fetchProfile();
    fetchUserStories();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      if (!userId) {
        console.error("No userId provided to fetch profile");
        setLoading(false);
        return;
      }

      const response = await api.get(`/users/${userId}`);
      setUser(response.data);
      setIsFollowing(
        response.data.followers?.some(
          (follower) => follower._id === currentUser?.id
        ) || false
      );
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
      setLoading(false);
    }
  };

  const fetchUserStories = async () => {
    try {
      if (!userId) {
        console.error("No userId provided to fetch stories");
        setLoading(false);
        return;
      }

      // Use the new user-specific stories endpoint
      const response = await api.get(`/users/${userId}/stories`);
      const userStories = response.data;

      // Fetch chapter data for each story
      const storiesWithChapters = await Promise.all(
        userStories.map(async (story) => {
          try {
            const chaptersResponse = await api.get(
              `/chapters/story/${story._id}`
            );
            return {
              ...story,
              chapters: chaptersResponse.data || [],
              chapterCount: chaptersResponse.data?.length || 0,
            };
          } catch (error) {
            console.error(
              `Error fetching chapters for story ${story._id}:`,
              error
            );
            return {
              ...story,
              chapters: [],
              chapterCount: 0,
            };
          }
        })
      );

      setStories(storiesWithChapters);
    } catch (error) {
      console.error("Error fetching user stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
        // In a real app, you'd upload this to your server/cloud storage
        toast.success("Avatar updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await api.post(`/users/${userId}/follow`);
      setIsFollowing(response.data.following);

      // Update follower count optimistically
      setUser((prev) => ({
        ...prev,
        followers: response.data.following
          ? [...(prev.followers || []), { _id: currentUser.id }]
          : (prev.followers || []).filter((f) => f._id !== currentUser.id),
      }));

      toast.success(
        response.data.following ? "User followed!" : "User unfollowed!"
      );
    } catch (error) {
      toast.error("Failed to follow user");
    }
  };

  const getUserStats = () => {
    return {
      stories: stories.length,
      followers: user?.followers?.length || 0,
      following: user?.following?.length || 0,
    };
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "stories":
        return (
          <>
            {stories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
                {stories.map((story) => (
                  <div
                    key={story._id}
                    className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 relative"
                    onClick={() => navigate(`/story/${story._id}`)}
                  >
                    {/* Story Cover */}
                    <div className="relative aspect-3/4 overflow-hidden bg-gray-100">
                      {story.coverImage ? (
                        <img
                          src={story.coverImage}
                          alt={story.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-orange-100 via-amber-50 to-red-50 flex items-center justify-center">
                          <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-orange-400" />
                        </div>
                      )}

                      {/* Genre Badge */}
                      {story.category && (
                        <div className="absolute bottom-2 left-2">
                          <span className="bg-black/80 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                            {story.category}
                          </span>
                        </div>
                      )}

                      {/* Edit button for own stories */}
                      {isOwnProfile && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/story/${story._id}/edit`);
                            }}
                            className="p-2.5 bg-orange-500 text-white rounded-xl shadow-lg hover:bg-orange-600 hover:scale-110 transition-all duration-200 backdrop-blur-sm"
                            title="Edit Story"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Story Info */}
                    <div className="p-3">
                      <h3 className="font-bold text-sm text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors">
                        {story.title}
                      </h3>

                      {/* Story Stats */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            <Heart className="h-3 w-3 text-red-400" />
                            <span className="font-medium">
                              {story.likes?.length || 0}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BookOpen className="h-3 w-3 text-orange-400" />
                            <span className="font-medium">
                              {story.chapterCount || 0}ch
                            </span>
                          </div>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">
                          {new Date(story.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16 lg:py-24 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="h-8 w-8 sm:h-10 sm:w-10 text-orange-500" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  {isOwnProfile
                    ? "Start Your Writing Journey"
                    : "No Stories Yet"}
                </h3>
                <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto px-4">
                  {isOwnProfile
                    ? "Share your imagination with the world. Create your first story and connect with readers!"
                    : `${user?.username} hasn't published any stories yet. Check back later for new content!`}
                </p>
                {isOwnProfile && (
                  <Link
                    to="/create-story"
                    className="inline-flex items-center space-x-2 bg-orange-500 text-white px-6 py-3 rounded-xl hover:bg-orange-600 transition-all font-semibold shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Create Your First Story</span>
                  </Link>
                )}
              </div>
            )}
          </>
        );
      default:
        return null;
    }
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase() || "U"
    );
  };

  const showFollowersList = () => {
    setUserModal({
      show: true,
      users: user?.followers || [],
      title: "Followers",
    });
  };

  const showFollowingList = () => {
    setUserModal({
      show: true,
      users: user?.following || [],
      title: "Following",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
          {/* Profile Header Skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 sm:mb-8 animate-pulse">
            {/* Content Skeleton */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-6">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-gray-200"></div>
                <div className="flex-1 text-center sm:text-left">
                  <div className="h-8 sm:h-10 bg-gray-200 rounded-lg w-48 mb-2 mx-auto sm:mx-0"></div>
                  <div className="h-4 sm:h-6 bg-gray-200 rounded w-64 mb-4 mx-auto sm:mx-0"></div>

                  {/* Stats Skeleton */}
                  <div className="flex justify-center sm:justify-start gap-8 mb-6">
                    <div className="text-center">
                      <div className="h-6 w-8 bg-gray-200 rounded-lg mb-1"></div>
                      <div className="h-3 w-12 bg-gray-200 rounded-lg"></div>
                    </div>
                    <div className="text-center">
                      <div className="h-6 w-8 bg-gray-200 rounded-lg mb-1"></div>
                      <div className="h-3 w-16 bg-gray-200 rounded-lg"></div>
                    </div>
                    <div className="text-center">
                      <div className="h-6 w-8 bg-gray-200 rounded-lg mb-1"></div>
                      <div className="h-3 w-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  </div>

                  {/* Bio Skeleton */}
                  <div className="mb-4">
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto sm:mx-0"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Skeleton */}
            <div className="border-t border-gray-200">
              <div className="h-14 bg-gray-100"></div>
            </div>
          </div>

          {/* Stories Grid Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6 animate-pulse">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
              >
                <div className="aspect-3/4 bg-gray-200"></div>
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gray-200 rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
              <User className="h-10 w-10 text-gray-600" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
              User Not Found
            </h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              The profile you're looking for doesn't exist or may have been
              removed.
            </p>
            <button
              onClick={() => navigate("/feed")}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all shadow-lg text-sm sm:text-base"
            >
              Discover Stories
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 sm:mb-8">
          {/* Profile Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Profile Picture and Info Row */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 mb-6">
              {/* Profile Picture */}
              <div className="relative">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-lg">
                  {avatarPreview || user.profilePicture ? (
                    <img
                      src={avatarPreview || user.profilePicture}
                      alt={user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                      <span className="text-xl sm:text-2xl font-bold text-gray-600">
                        {getInitials(user.username)}
                      </span>
                    </div>
                  )}
                </div>
                {isOwnProfile && (
                  <label className="absolute -bottom-2 -right-2 bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg shadow-lg transition-all duration-200 cursor-pointer hover:scale-110">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-3">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                    {user.username}
                  </h1>
                </div>

                <p className="text-gray-600 text-sm sm:text-base mb-6 leading-relaxed flex items-center justify-center sm:justify-start gap-2">
                  <Sparkles className="h-4 w-4 text-orange-500" />
                  <span>Storyteller • Dream Weaver • Word Wizard</span>
                </p>

                {/* Stats Row */}
                <div className="flex items-center justify-center sm:justify-start gap-8 sm:gap-10 mb-6">
                  <div className="text-center group">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">
                      {getUserStats().stories}
                    </div>
                    <div className="text-gray-500 text-sm font-medium">
                      Stories
                    </div>
                  </div>
                  <button
                    onClick={showFollowersList}
                    className="text-center hover:bg-gray-50 rounded-lg px-3 py-2 transition-all duration-200 hover:scale-105 group"
                  >
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {getUserStats().followers}
                    </div>
                    <div className="text-gray-500 text-sm font-medium">
                      Followers
                    </div>
                  </button>
                  <button
                    onClick={showFollowingList}
                    className="text-center hover:bg-gray-50 rounded-lg px-3 py-2 transition-all duration-200 hover:scale-105 group"
                  >
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {getUserStats().following}
                    </div>
                    <div className="text-gray-500 text-sm font-medium">
                      Following
                    </div>
                  </button>
                </div>

                {/* Bio */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                    {user.bio ||
                      (isOwnProfile
                        ? "📚 Share your story with the world... Ready to inspire readers everywhere! ✍️"
                        : "🌟 A mysterious storyteller awaits... Their tales are yet to be discovered.")}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-3 shrink-0 pt-4 justify-center sm:justify-end">
                {!isOwnProfile && (
                  <button
                    onClick={handleFollow}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all text-sm shadow-sm hover:shadow-md ${
                      isFollowing
                        ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        : "bg-orange-500 text-white hover:bg-orange-600"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <Users className="h-4 w-4" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                )}

                {isOwnProfile && (
                  <>
                    <Link
                      to="/create-story"
                      className="flex items-center justify-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-all font-medium shadow-sm hover:shadow-md text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>New Story</span>
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-all font-medium text-sm shadow-sm hover:shadow-md"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-t border-gray-200">
            <nav className="flex">
              <button
                onClick={() => handleTabChange("stories")}
                className={`flex-1 flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 lg:px-6 py-4 sm:py-5 text-sm font-medium transition-all border-b-2 ${
                  activeTab === "stories"
                    ? "text-orange-600 border-orange-500 bg-orange-50/50"
                    : "text-gray-600 border-transparent hover:text-orange-600 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center ${
                    activeTab === "stories"
                      ? "bg-orange-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
                <span className="text-xs sm:text-sm">
                  <span className="hidden sm:inline">
                    {isOwnProfile
                      ? "My Stories"
                      : `${user?.username}'s Stories`}{" "}
                    ({getUserStats().stories})
                  </span>
                  <span className="sm:hidden">
                    Stories ({getUserStats().stories})
                  </span>
                </span>
              </button>
            </nav>
          </div>
        </div>

        {/* Premium Content Section */}
        <div className="mt-6 sm:mt-8">{renderTabContent()}</div>
      </div>

      {/* Followers/Following Modal */}
      {userModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Background Overlay */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setUserModal({ show: false, users: [], title: "" })}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-2xl max-w-md w-full max-h-96 overflow-hidden shadow-xl border border-gray-200 transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                  {userModal.title}
                </h3>
              </div>
              <button
                onClick={() =>
                  setUserModal({ show: false, users: [], title: "" })
                }
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Users List */}
            <div className="overflow-y-auto max-h-80">
              {userModal.users && userModal.users.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {userModal.users.filter(Boolean).map((modalUser) => {
                    // Additional safety check
                    if (!modalUser || !modalUser._id) return null;
                    
                    return (
                    <Link
                      key={modalUser._id}
                      to={`/profile/${modalUser._id}`}
                      className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-all duration-200 group"
                      onClick={() =>
                        setUserModal({ show: false, users: [], title: "" })
                      }
                    >
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm shrink-0">
                        {modalUser?.profilePicture ? (
                          <img
                            src={modalUser.profilePicture}
                            alt={modalUser.username}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          getInitials(modalUser.name || modalUser.username)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors text-sm sm:text-base">
                          {modalUser.name || modalUser.username}
                        </div>
                        {modalUser.bio ? (
                          <div className="text-xs sm:text-sm text-gray-600 truncate mt-0.5">
                            {modalUser.bio}
                          </div>
                        ) : (
                          <div className="text-xs sm:text-sm text-gray-400 italic mt-0.5">
                            Storyteller ✨
                          </div>
                        )}
                      </div>
                      <div className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <User className="h-4 w-4" />
                      </div>
                    </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 sm:p-12 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                    No {userModal.title.toLowerCase()} yet
                  </h4>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    {userModal.title === "Followers"
                      ? "Start sharing amazing stories to gain followers!"
                      : "Follow other storytellers to see their content!"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;