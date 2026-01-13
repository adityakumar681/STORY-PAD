import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  Bell, 
  Heart, 
  UserPlus, 
  MessageCircle, 
  BookOpen, 
  CheckCheck, 
  Trash2, 
  Filter,
  BellRing,
  Sparkles,
  Users,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';
import api from '../utils/api';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread'
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      setupSocketConnection();
    }
  }, [user, filter]);

  // Mark all notifications as read when component mounts
  useEffect(() => {
    if (user && notifications.length > 0) {
      const unreadNotifications = notifications.filter(notif => !notif.read);
      if (unreadNotifications.length > 0) {
        // Mark all as read after a short delay to improve user experience
        const timer = setTimeout(() => {
          markAllAsRead();
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [notifications, user]);

  const fetchNotifications = async (pageNum = 1, reset = true) => {
    try {
      const response = await api.get(`/notifications?page=${pageNum}&filter=${filter}&limit=20`);
      
      if (reset) {
        setNotifications(response.data.notifications);
      } else {
        setNotifications(prev => [...prev, ...response.data.notifications]);
      }
      
      setHasMore(response.data.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const setupSocketConnection = () => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001');
    
    socket.emit('join-user', user.id);
    
    socket.on('newNotification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      toast.info(`New ${notification.type}: ${notification.message}`);
    });

    return () => socket.disconnect();
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      
      // Trigger notification update event
      window.dispatchEvent(new Event('notificationUpdate'));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
      
      // Trigger notification update event
      window.dispatchEvent(new Event('notificationUpdate'));
      
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/notifications/${notificationId}`);
      setNotifications(prev => 
        prev.filter(notif => notif._id !== notificationId)
      );
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    const iconClass = "h-5 w-5 sm:h-6 sm:w-6";
    switch (type) {
      case 'like':
        return <Heart className={`${iconClass} text-white fill-current`} />;
      case 'follow':
        return <UserPlus className={`${iconClass} text-white`} />;
      case 'comment':
        return <MessageCircle className={`${iconClass} text-white`} />;
      case 'story':
        return <BookOpen className={`${iconClass} text-white`} />;
      case 'chapter':
        return <BookOpen className={`${iconClass} text-white`} />;
      default:
        return <Bell className={`${iconClass} text-white`} />;
    }
  };

  const getNotificationMessage = (notification) => {
    const { type, sender, story, chapter } = notification;
    
    switch (type) {
      case 'like':
        return `${sender?.username} liked your story "${story?.title}"`;
      case 'follow':
        return `${sender?.username} started following you`;
      case 'comment':
        return `${sender?.username} commented on your story "${story?.title}"`;
      case 'story':
        return `${sender?.username} published a new story "${story?.title}"`;
      case 'chapter':
        return `${sender?.username} added a new chapter "${chapter?.title}" to "${story?.title}"`;
      default:
        return notification.message || 'New notification';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return time.toLocaleDateString();
  };

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
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8">
                <div className="h-8 bg-gray-200 rounded-full w-32"></div>
                <div className="h-8 bg-gray-200 rounded-full w-24"></div>
                <div className="h-8 bg-gray-200 rounded-full w-28"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 lg:py-8">
          {/* Controls Skeleton */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 animate-pulse">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
                </div>
                <div className="h-10 bg-gray-200 rounded-xl w-32"></div>
              </div>
            </div>
          </div>
          
          {/* Notifications Skeleton */}
          <div className="space-y-3 sm:space-y-4 animate-pulse">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                <div className="flex items-start space-x-3 sm:space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 rounded-full shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                    <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
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
              <div className="w-16 h-16 bg-linear-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                <BellRing className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
              Updates & Activity
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-8 px-4">
              Stay connected with your favorite authors and never miss a story update
            </p>
            
            {/* Premium Stats */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-gray-600">
              <div className="flex items-center space-x-2 bg-orange-50 px-4 py-2 rounded-full">
                <Bell className="h-5 w-5 text-orange-500" />
                <span className="font-semibold">{notifications.filter(n => !n.read).length} New Updates</span>
              </div>
              <div className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className="font-medium">{notifications.length} Total</span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Community</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 lg:py-8">
        {/* Premium Controls */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="flex items-center space-x-2 text-gray-700">
                  <Filter className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-semibold">Filter:</span>
                </div>
                <div className="flex bg-gray-100 rounded-xl p-1 w-full sm:w-auto">
                  {['all', 'unread'].map((filterType) => (
                    <button
                      key={filterType}
                      onClick={() => setFilter(filterType)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex-1 sm:flex-none ${
                        filter === filterType
                          ? 'bg-orange-500 text-white shadow-md'
                          : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                      }`}
                    >
                      {filterType === 'all' ? 'All' : 'Unread'}
                    </button>
                  ))}
                </div>
              </div>
              
              {notifications.some(n => !n.read) && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors shadow-sm text-sm font-medium w-full sm:w-auto"
                >
                  <CheckCheck className="h-4 w-4" />
                  <span>Mark All Read</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Premium Notifications List */}
        <div className="space-y-3 sm:space-y-4">
          {notifications.map(notification => (
            <div
              key={notification._id}
              className={`group bg-white rounded-2xl shadow-sm border transition-all hover:shadow-md ${
                notification.read
                  ? 'border-gray-100'
                  : 'border-orange-200 bg-orange-50/30'
              }`}
            >
              <div className="flex items-start space-x-3 sm:space-x-4 p-4 sm:p-6">
                <div className="relative shrink-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                    notification.read ? 'bg-gray-100' : 'bg-orange-500'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  {!notification.read && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm sm:text-base leading-relaxed ${
                        notification.read ? 'text-gray-700' : 'text-gray-900 font-medium'
                      }`}>
                        {getNotificationMessage(notification)}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="text-xs sm:text-sm text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </span>
                        {!notification.read && (
                          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                            New
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons - Always visible on mobile, hover on desktop */}
                    <div className="flex items-center space-x-1 sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity shrink-0">
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all"
                          title="Mark as read"
                        >
                          <CheckCheck className="h-4 w-4" />
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteNotification(notification._id)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Premium Load More Button */}
        {hasMore && notifications.length > 0 && (
          <div className="text-center mt-6 sm:mt-8">
            <button
              onClick={() => fetchNotifications(page + 1, false)}
              className="bg-orange-500 text-white px-6 sm:px-8 py-3 rounded-xl hover:bg-orange-600 transition-all shadow-sm hover:shadow-md font-medium text-sm sm:text-base w-full sm:w-auto"
            >
              Load More Updates
            </button>
          </div>
        )}

        {/* Premium Empty State */}
        {notifications.length === 0 && !loading && (
          <div className="text-center py-12 sm:py-16 lg:py-24 bg-white rounded-2xl border border-gray-100 shadow-sm mx-3 sm:mx-0">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bell className="h-8 w-8 sm:h-10 sm:w-10 text-orange-500" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">
              No updates yet
            </h3>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-md mx-auto leading-relaxed px-4">
              When readers interact with your stories or follow you, their updates will appear here.
            </p>
            <div className="mt-6 sm:mt-8">
              <Link 
                to="/feed"
                className="inline-flex items-center space-x-2 bg-orange-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl hover:bg-orange-600 transition-all shadow-sm font-medium text-sm sm:text-base"
              >
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Explore Stories</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;