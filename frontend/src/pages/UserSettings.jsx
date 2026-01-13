import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Camera, 
  Save, 
  ArrowLeft, 
  Mail, 
  Lock,
  Bell,
  Globe,
  Shield,
  Trash2,
  Upload,
  X,
  Check,
  Eye,
  EyeOff
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const UserSettings = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    bio: '',
    profilePicture: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    publicProfile: true,
    showReadingActivity: true
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || '',
        profilePicture: user.profilePicture || ''
      });
      
      // Load user preferences
      setPreferences({
        emailNotifications: user.emailNotifications !== undefined ? user.emailNotifications : true,
        pushNotifications: user.pushNotifications !== undefined ? user.pushNotifications : true,
        publicProfile: user.publicProfile !== undefined ? user.publicProfile : true,
        showReadingActivity: user.showReadingActivity !== undefined ? user.showReadingActivity : true
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    
    // Validate bio character limit
    if (name === 'bio' && value.length > 500) {
      toast.error('Bio cannot exceed 500 characters');
      return;
    }
    
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePreferenceChange = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    setUploadingImage(true);
    
    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);

      // Create FormData for upload
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await api.post('/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Use the Cloudinary URL directly (no need to construct local URL)
      const imageUrl = response.data.profilePicture;
      
      setProfileData(prev => ({ ...prev, profilePicture: imageUrl }));
      setPreviewImage(null); // Clear preview since we now have the actual image
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Update user context
      const updatedUser = { ...user, profilePicture: imageUrl };
      login(updatedUser, localStorage.getItem('token'));
      
      toast.success('Profile picture updated successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
      setPreviewImage(null);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeProfilePicture = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) {
      return;
    }
    
    try {
      setUploadingImage(true);
      await api.delete('/users/avatar');
      
      setProfileData(prev => ({ ...prev, profilePicture: '' }));
      setPreviewImage(null);
      
      const updatedUser = { ...user, profilePicture: '' };
      login(updatedUser, localStorage.getItem('token'));
      
      toast.success('Profile picture removed successfully!');
    } catch (error) {
      console.error('Remove error:', error);
      toast.error(error.response?.data?.message || 'Failed to remove profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!profileData.username.trim()) {
      toast.error('Username is required');
      return;
    }
    
    if (!profileData.email.trim()) {
      toast.error('Email is required');
      return;
    }
    
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await api.put('/users/profile', profileData);
      
      // Update user context with the updated profile
      const updatedUser = { 
        ...user, 
        ...response.data.user,
        profilePicture: profileData.profilePicture // Keep current profile picture
      };
      login(updatedUser, localStorage.getItem('token'));
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      await api.put('/users/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Password updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const updatePreferences = async () => {
    setLoading(true);
    
    try {
      const response = await api.put('/users/preferences', preferences);
      
      // Update user context with new preferences
      if (response.data.user) {
        login(response.data.user, localStorage.getItem('token'));
      }
      
      toast.success('Preferences updated successfully!');
    } catch (error) {
      console.error('Preferences update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    const confirmation = window.prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation !== 'DELETE') {
      toast.error('Account deletion cancelled');
      return;
    }
    
    setLoading(true);
    
    try {
      await api.delete('/users/account');
      toast.success('Account deleted successfully');
      localStorage.clear();
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'preferences', label: 'Preferences', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-red-50 to-pink-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Premium Header */}
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-orange-500 via-red-500 to-pink-500 p-8 mb-8 text-white">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <button
                onClick={() => navigate(-1)}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-all duration-200 backdrop-blur-sm"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">Account Settings</h1>
                <p className="text-white/90 mt-1">Manage your profile, security, and preferences</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                {user?.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6" />
                )}
              </div>
              <div className="hidden sm:block">
                <div className="font-medium">{user?.username}</div>
                <div className="text-sm text-white/80">{user?.email}</div>
              </div>
            </div>
          </div>
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white transform translate-x-20 -translate-y-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white transform -translate-x-16 translate-y-16"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Premium Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Settings Menu</h3>
                <p className="text-sm text-gray-600">Customize your experience</p>
              </div>
              <nav className="space-y-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeTab === id
                        ? 'bg-linear-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50 hover:shadow-md'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span className="font-medium">{label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                        Profile Information
                      </h2>
                      <p className="text-gray-600 mt-1">Update your personal details and profile picture</p>
                    </div>
                    <div className="mt-4 sm:mt-0">
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <Check className="h-4 w-4 mr-1" />
                        Verified Account
                      </div>
                    </div>
                  </div>
                  
                  <form onSubmit={updateProfile} className="space-y-8">
                    {/* Premium Profile Picture Section */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                        <div className="relative">
                          <div className="w-28 h-28 bg-linear-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
                            {(previewImage || profileData.profilePicture) ? (
                              <img
                                src={previewImage || profileData.profilePicture}
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover"
                                onError={(e) => {
                                  console.error('Failed to load image:', e.target.src);
                                  e.target.style.display = 'none';
                                  e.target.parentElement.innerHTML = `<span class="text-white text-3xl font-bold">${
                                    profileData.username?.charAt(0)?.toUpperCase() || 
                                    user?.username?.charAt(0)?.toUpperCase() || 
                                    'U'
                                  }</span>`;
                                }}
                              />
                            ) : (
                              <span className="text-white text-3xl font-bold">
                                {profileData.username?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
                              </span>
                            )}
                          </div>
                          {uploadingImage && (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={uploadingImage}
                              className="flex items-center space-x-2 bg-linear-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 shadow-md"
                            >
                              {uploadingImage ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  <span>Uploading...</span>
                                </>
                              ) : (
                                <>
                                  <Camera className="h-4 w-4" />
                                  <span>Change Photo</span>
                                </>
                              )}
                            </button>
                            {(profileData.profilePicture || previewImage) && (
                              <button
                                type="button"
                                onClick={removeProfilePicture}
                                disabled={uploadingImage}
                                className="flex items-center space-x-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                              >
                                <X className="h-4 w-4" />
                                <span>Remove</span>
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-2">
                            <span className="font-medium">Supported formats:</span> JPG, PNG, GIF up to 5MB
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Recommended size: 400x400 pixels for best quality
                          </p>
                          {profileData.profilePicture && (
                            <p className="text-xs text-blue-600 mt-1">
                              Current image: {profileData.profilePicture.split('/').pop()}
                            </p>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Form Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Username */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Username
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            name="username"
                            value={profileData.username}
                            onChange={handleProfileChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
                            placeholder="Enter your username"
                            required
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
                            placeholder="Enter your email"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bio */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={profileData.bio}
                        onChange={handleProfileChange}
                        rows={4}
                        maxLength={500}
                        placeholder="Tell us about yourself, your interests, and what kind of stories you love to read or write..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white resize-none"
                      />
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-sm text-gray-500">
                          Share your story with the community
                        </p>
                        <p className={`text-sm font-medium ${
                          profileData.bio.length > 450 ? 'text-red-500' : 'text-gray-500'
                        }`}>
                          {profileData.bio.length}/500
                        </p>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center space-x-2 bg-linear-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-medium"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5" />
                            <span>Save Profile</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-8 py-3 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                      >
                        <User className="h-5 w-5" />
                        <span>View Profile</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-6 sm:p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Security Settings
                    </h2>
                    <p className="text-gray-600 mt-1">Manage your password and account security</p>
                  </div>
                  
                  {/* Password Update Section */}
                  <div className="bg-gray-50 rounded-xl p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Lock className="h-5 w-5 mr-2 text-orange-500" />
                      Change Password
                    </h3>
                    
                    <form onSubmit={updatePassword} className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type={showPassword.current ? "text" : "password"}
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
                            placeholder="Enter current password"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            New Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type={showPassword.new ? "text" : "password"}
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
                              placeholder="Enter new password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Confirm New Password
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                              type={showPassword.confirm ? "text" : "password"}
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white"
                              placeholder="Confirm new password"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showPassword.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Password Requirements */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li className="flex items-center">
                            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                              passwordData.newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'
                            }`}></div>
                            At least 6 characters long
                          </li>
                          <li className="flex items-center">
                            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                              /[A-Z]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                            }`}></div>
                            Contains uppercase letter
                          </li>
                          <li className="flex items-center">
                            <div className={`w-1.5 h-1.5 rounded-full mr-2 ${
                              /[0-9]/.test(passwordData.newPassword) ? 'bg-green-500' : 'bg-gray-300'
                            }`}></div>
                            Contains number
                          </li>
                        </ul>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center space-x-2 bg-linear-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-medium"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Updating Password...</span>
                          </>
                        ) : (
                          <>
                            <Shield className="h-5 w-5" />
                            <span>Update Password</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>

                  {/* Danger Zone */}
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                          <Trash2 className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-red-800">Danger Zone</h3>
                          <p className="text-sm text-red-600">Irreversible actions for your account</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white border border-red-200 rounded-lg p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                          <h4 className="font-semibold text-red-800">Delete Account</h4>
                          <p className="text-sm text-red-600 mt-1">
                            Permanently delete your account and all associated data. This action cannot be undone.
                          </p>
                          <ul className="text-xs text-red-500 mt-2 space-y-1">
                            <li>• All your stories will be permanently deleted</li>
                            <li>• Your reading progress will be lost</li>
                            <li>• Comments and bookmarks will be removed</li>
                          </ul>
                        </div>
                        <button
                          onClick={deleteAccount}
                          disabled={loading}
                          className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md font-medium shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete Account</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="p-6 sm:p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Notification Preferences
                    </h2>
                    <p className="text-gray-600 mt-1">Choose how you want to be notified about activity</p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Email Notifications */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                          <div className="flex items-center mb-2">
                            <Mail className="h-5 w-5 text-orange-500 mr-2" />
                            <h3 className="font-semibold text-gray-900">Email Notifications</h3>
                          </div>
                          <p className="text-sm text-gray-600">
                            Receive email updates about new stories, comments, and community activity
                          </p>
                        </div>
                        <button
                          onClick={() => handlePreferenceChange('emailNotifications')}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                            preferences.emailNotifications 
                              ? 'bg-linear-to-r from-orange-500 to-red-500' 
                              : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
                              preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Push Notifications */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                          <div className="flex items-center mb-2">
                            <Bell className="h-5 w-5 text-orange-500 mr-2" />
                            <h3 className="font-semibold text-gray-900">Push Notifications</h3>
                          </div>
                          <p className="text-sm text-gray-600">
                            Get instant notifications for likes, comments, follows, and story updates
                          </p>
                        </div>
                        <button
                          onClick={() => handlePreferenceChange('pushNotifications')}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                            preferences.pushNotifications 
                              ? 'bg-linear-to-r from-orange-500 to-red-500' 
                              : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
                              preferences.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4">
                      <button
                        onClick={updatePreferences}
                        disabled={loading}
                        className="flex items-center justify-center space-x-2 bg-linear-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-medium"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving Preferences...</span>
                          </>
                        ) : (
                          <>
                            <Save className="h-5 w-5" />
                            <span>Save Preferences</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="p-6 sm:p-8">
                  <div className="mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold bg-linear-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Privacy Settings
                    </h2>
                    <p className="text-gray-600 mt-1">Control who can see your activity and profile information</p>
                  </div>
                  
                  <div className="space-y-6">
                    {/* Public Profile */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                          <div className="flex items-center mb-2">
                            <Globe className="h-5 w-5 text-orange-500 mr-2" />
                            <h3 className="font-semibold text-gray-900">Public Profile</h3>
                          </div>
                          <p className="text-sm text-gray-600">
                            Allow others to find and view your profile and stories
                          </p>
                        </div>
                        <button
                          onClick={() => handlePreferenceChange('publicProfile')}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                            preferences.publicProfile 
                              ? 'bg-linear-to-r from-orange-500 to-red-500' 
                              : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
                              preferences.publicProfile ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Show Reading Activity */}
                    <div className="bg-gray-50 rounded-xl p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-4 sm:mb-0">
                          <div className="flex items-center mb-2">
                            <Eye className="h-5 w-5 text-orange-500 mr-2" />
                            <h3 className="font-semibold text-gray-900">Show Reading Activity</h3>
                          </div>
                          <p className="text-sm text-gray-600">
                            Display your reading progress and activity to other users
                          </p>
                        </div>
                        <button
                          onClick={() => handlePreferenceChange('showReadingActivity')}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 ${
                            preferences.showReadingActivity 
                              ? 'bg-linear-to-r from-orange-500 to-red-500' 
                              : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out ${
                              preferences.showReadingActivity ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4">
                      <button
                        onClick={updatePreferences}
                        disabled={loading}
                        className="flex items-center justify-center space-x-2 bg-linear-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-medium"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Saving Privacy Settings...</span>
                          </>
                        ) : (
                          <>
                            <Shield className="h-5 w-5" />
                            <span>Save Privacy Settings</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;