import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import {
  Heart,
  Home,
  Search,
  Bell,
  User,
  PlusCircle,
  Bookmark,
  LogOut,
  Menu,
  X,
  Settings,
  BookOpen,
  Feather,
  Library,
  ChevronDown
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { getUnreadNotificationCount } from '../utils/api';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user) {
        try {
          const count = await getUnreadNotificationCount();
          setUnreadCount(count);
        } catch (error) {
          console.error(
            'Error fetching unread notification count:',
            error
          );
        }
      }
    };

    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  // Reset unread count when visiting notifications page
  useEffect(() => {
    if (location.pathname === '/notifications') {
      const timer = setTimeout(() => {
        setUnreadCount(0);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  useEffect(() => {
    const handleNotificationUpdate = () => {
      if (user) {
        getUnreadNotificationCount()
          .then((count) => {
            setUnreadCount(count);
          })
          .catch(console.error);
      }
    };

    window.addEventListener(
      'notificationUpdate',
      handleNotificationUpdate
    );

    return () =>
      window.removeEventListener(
        'notificationUpdate',
        handleNotificationUpdate
      );
  }, [user]);

  const navItems = [
    { path: '/feed', icon: Home, label: 'Home' },
    { path: '/create-story', icon: Feather, label: 'Write' },
    { path: '/bookmarks', icon: Library, label: 'Library' },
    { path: '/notifications', icon: Bell, label: 'Updates' }
  ];
  return (
    <nav className={`bg-white/95 backdrop-blur-md border-b sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'shadow-xl border-gray-200/50' : 'shadow-sm border-gray-100'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link to="/feed" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-linear-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                <BookOpen className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl lg:text-2xl font-bold text-gray-900">
                StoryPad
              </span>
              <span className="text-xs text-gray-500 -mt-1 hidden sm:block">Where stories come alive</span>
            </div>
          </Link>

          {/* Navigation Items - Desktop */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {navItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`relative flex items-center space-x-2 px-3 lg:px-4 py-2 lg:py-2.5 rounded-full text-sm font-medium transition-all ${
                  isActive(path)
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                }`}
                title={label}
              >
                <div className="relative">
                  <Icon className="h-4 w-4 lg:h-5 lg:w-5" />
                  {/* Notification Badge */}
                  {path === '/notifications' && unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-lg animate-pulse">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </div>
                  )}
                </div>
                <span className="hidden lg:inline">{label}</span>
              </Link>
            ))}

            {/* User Menu */}
            <div className="relative ml-2 lg:ml-4">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 lg:space-x-3 p-2 rounded-full hover:bg-gray-50 transition-all group"
              >
                <div className="relative">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 bg-linear-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {user?.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt={user.username}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      user?.username?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                </div>
                <div className="hidden xl:block text-left">
                  <p className="font-semibold text-gray-900 text-sm">{user?.username}</p>
                  <p className="text-xs text-gray-500">Writer</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </button>

              {/* User Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  {/* User Info Header */}
                  <div className="p-6 bg-linear-to-r from-orange-500 to-red-500 text-white">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-lg font-bold">
                        {user?.profilePicture ? (
                          <img 
                            src={user.profilePicture} 
                            alt={user.username}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          user?.username?.charAt(0)?.toUpperCase() || 'U'
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-lg">{user?.username}</p>
                        <p className="text-orange-100 text-sm">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="flex items-center px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors group"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="h-5 w-5 mr-4 text-gray-400 group-hover:text-orange-500" />
                      <div>
                        <p className="font-medium">Your Profile</p>
                        <p className="text-xs text-gray-500">View and edit profile</p>
                      </div>
                    </Link>
                    
                    <Link
                      to="/bookmarks"
                      className="flex items-center px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors group"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Bookmark className="h-5 w-5 mr-4 text-gray-400 group-hover:text-orange-500" />
                      <div>
                        <p className="font-medium">My Library</p>
                        <p className="text-xs text-gray-500">Bookmarked stories</p>
                      </div>
                    </Link>

                    <Link
                      to="/settings"
                      className="flex items-center px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors group"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-5 w-5 mr-4 text-gray-400 group-hover:text-orange-500" />
                      <div>
                        <p className="font-medium">Settings</p>
                        <p className="text-xs text-gray-500">Account preferences</p>
                      </div>
                    </Link>
                    
                    <div className="border-t border-gray-100 my-2"></div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-6 py-4 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors group"
                    >
                      <LogOut className="h-5 w-5 mr-4 text-gray-400 group-hover:text-red-500" />
                      <div className="text-left">
                        <p className="font-medium">Sign Out</p>
                        <p className="text-xs text-gray-500">Come back soon!</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white">
            {/* Mobile Search */}
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stories, authors..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-gray-50"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="pb-4 space-y-1">
              {navItems.map(({ path, icon: Icon, label }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-4 px-6 py-4 text-base font-medium transition-colors ${
                    isActive(path)
                      ? 'bg-orange-50 text-orange-600 border-r-4 border-orange-500'
                      : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {/* Mobile Notification Badge */}
                    {path === '/notifications' && unreadCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-lg animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between flex-1">
                    <span>{label}</span>
                    {/* Alternative badge position for mobile */}
                    {path === '/notifications' && unreadCount > 0 && (
                      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full px-2 py-1 shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    )}
                  </div>
                </Link>
              ))}

              {/* Mobile User Section */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="flex items-center space-x-4 px-6 py-3 bg-gray-50 rounded-lg mx-4 mb-4">
                  <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user?.profilePicture ? (
                      <img 
                        src={user.profilePicture} 
                        alt={user.username}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      user?.username?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user?.username}</p>
                    <p className="text-sm text-gray-500">Writer</p>
                  </div>
                </div>

                <Link
                  to="/profile"
                  className="flex items-center space-x-4 px-6 py-3 text-base font-medium text-gray-600 hover:text-orange-600 hover:bg-gray-50"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-4 px-6 py-3 text-base font-medium text-gray-600 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </nav>
  );

  
};

export default Navbar