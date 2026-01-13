import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Eye, EyeOff, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    const response = await api.post('/auth/login', formData);
    const { user, token } = response.data;

    login(user, token);
    toast.success('Welcome back!');
    navigate('/feed');
  } catch (error) {
    toast.error(error.response?.data?.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 sm:py-12 px-4">

      <div className="max-w-md w-full">
        {/* Logo Section */}
        <div className="text-center mb-8 sm:mb-10">
          <Link to="/" className="inline-flex items-center space-x-3 group mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
              <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-white" fill="currentColor" />
            </div>
            <div>
              <span className="text-3xl sm:text-4xl font-bold text-orange-600">StoryPad</span>
              <div className="text-xs sm:text-sm text-gray-600 font-medium">Where Stories Begin</div>
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3">Welcome Back!</h2>
          <p className="text-gray-600 text-base sm:text-lg">Continue your storytelling journey</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-gray-100">
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-900 placeholder-gray-400"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-900 placeholder-gray-400 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium text-lg shadow-lg flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <BookOpen className="h-5 w-5" />
                  <span>Sign in to StoryPad</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>

                    <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                Create one now
              </Link>
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Sparkles className="h-4 w-4 text-orange-500" />
              <span>Join thousands of storytellers worldwide</span>
              <Sparkles className="h-4 w-4 text-orange-500" />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
