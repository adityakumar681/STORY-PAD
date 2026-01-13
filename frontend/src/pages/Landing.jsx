import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, BookOpen, Users, Star, Sparkles, Feather, ArrowRight, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated, redirect to feed
    if (!loading && user) {
      navigate('/feed');
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Only show landing page if user is not authenticated
  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">

      {/* Clean Navigation */}
      <nav className="relative z-20 px-4 sm:px-6 py-4 sm:py-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 sm:px-6 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                  <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="currentColor" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl sm:text-2xl font-bold text-orange-600">StoryPad</span>
                  <div className="text-xs text-gray-600 font-medium">Where Stories Begin</div>
                </div>
                <div className="block sm:hidden">
                  <span className="text-xl font-bold text-orange-600">StoryPad</span>
                </div>
              </Link>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                <Link 
                  to="/login" 
                  className="hidden sm:flex items-center gap-2 text-gray-700 hover:text-orange-600 font-medium transition-all px-6 py-3 rounded-lg hover:bg-gray-50"
                >
                  <span>Sign In</span>
                </Link>
                <Link 
                  to="/register" 
                  className="group flex items-center gap-2 bg-orange-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-orange-600 transition-all shadow-lg font-medium text-sm sm:text-base"
                >
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Join</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Responsive Hero Section */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
        <div className="text-center">
          {/* Badge */}
          <div className="mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 sm:gap-3 bg-orange-50 px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-orange-100 shadow-sm">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full"></div>
              <span className="text-orange-700 font-medium text-sm sm:text-base">Experience Premium Storytelling</span>
              <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
            </div>
          </div>
          
          {/* Main Heading */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 mb-4 leading-tight tracking-tight">
              Your Stories,
            </h1>
            <div className="relative inline-block">
              <span className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black text-orange-600 leading-tight tracking-tight">
                Unlimited
              </span>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
            Immerse yourself in captivating narratives, craft your own literary masterpieces, and join a vibrant community of 
            <span className="font-semibold text-orange-600"> creative minds</span> sharing their passion for storytelling.
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-12 sm:mb-16">
            <Link 
              to="/register" 
              className="group bg-orange-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl font-medium text-base sm:text-lg flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
              <span>Start Your Journey</span>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            
            <Link 
              to="/register" 
              className="group bg-white border-2 border-orange-200 text-orange-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-orange-50 transition-all shadow-sm font-medium text-base sm:text-lg flex items-center gap-3 w-full sm:w-auto justify-center"
            >
              <Feather className="h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-12 transition-transform" />
              <span>Create & Publish</span>
            </Link>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
            <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Unlimited Reading</h3>
              <p className="text-gray-600 leading-relaxed text-sm">Access thousands of stories across every genre without any limits</p>
            </div>
            
            <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Feather className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Easy Publishing</h3>
              <p className="text-gray-600 leading-relaxed text-sm">Share your stories with our intuitive writing and publishing tools</p>
            </div>
            
            <div className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 sm:col-span-2 lg:col-span-1">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Users className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Creative Community</h3>
              <p className="text-gray-600 leading-relaxed text-sm">Connect with fellow writers and readers who share your passion</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Features Section */}
      <div className="relative z-10 py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16 sm:mb-20">
            <div className="inline-flex items-center gap-3 bg-orange-50 px-6 py-3 rounded-full border border-orange-100 shadow-sm mb-8">
              <Sparkles className="h-5 w-5 text-orange-500" />
              <span className="text-orange-700 font-semibold">Premium Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-6 leading-tight">
              Everything You Need to 
              <span className="block text-orange-600">Create & Discover</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Join a thriving ecosystem where creativity meets community, innovation sparks imagination, 
              and every story finds its perfect audience in our vibrant storytelling universe.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            <div className="group bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-orange-500/10 to-orange-600/5 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="bg-orange-500 w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl">
                  <BookOpen className="h-8 w-8 sm:h-9 sm:w-9 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 text-center">Unlimited Reading</h3>
                <p className="text-gray-600 text-center leading-relaxed text-base font-medium mb-6">
                  Dive into thousands of captivating stories across every genre imaginable. From heart-pounding thrillers 
                  to enchanting romances, discover your next favorite read.
                </p>
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 text-orange-600 font-semibold text-sm">
                    <span>Explore Stories</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="group bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-orange-500/10 to-orange-600/5 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="bg-orange-500 w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl">
                  <Users className="h-8 w-8 sm:h-9 sm:w-9 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 text-center">Vibrant Community</h3>
                <p className="text-gray-600 text-center leading-relaxed text-base font-medium mb-6">
                  Connect with passionate readers and writers worldwide. Share feedback, collaborate on projects, 
                  and build lasting friendships through the power of storytelling.
                </p>
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 text-orange-600 font-semibold text-sm">
                    <span>Join Community</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="group bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-orange-500/10 to-orange-600/5 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <div className="bg-orange-500 w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-xl">
                  <Feather className="h-8 w-8 sm:h-9 sm:w-9 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 text-center">Powerful Creation Tools</h3>
                <p className="text-gray-600 text-center leading-relaxed text-base font-medium mb-6">
                  Write, edit, and publish your stories with our intuitive editor. Rich formatting, 
                  auto-save, and publishing tools help bring your imagination to life effortlessly.
                </p>
                <div className="flex justify-center">
                  <div className="inline-flex items-center gap-2 text-orange-600 font-semibold text-sm">
                    <span>Start Writing</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Call to Action */}
          <div className="mt-16 sm:mt-20">
            <div className="relative overflow-hidden bg-linear-to-r from-orange-500 via-orange-600 to-red-500 rounded-3xl p-10 sm:p-16 shadow-2xl">
              {/* Background Decoration */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white transform translate-x-32 -translate-y-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white transform -translate-x-24 translate-y-24"></div>
              </div>
              
              <div className="relative z-10 text-center max-w-4xl mx-auto">
                <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full border border-white/30 shadow-sm mb-8">
                  <Sparkles className="h-5 w-5 text-white" />
                  <span className="text-white font-semibold">Join 50,000+ Storytellers</span>
                </div>
                
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight">
                  Your Story Starts Here,
                  <span className="block text-orange-100">Your Audience Awaits</span>
                </h3>
                
                <p className="text-orange-50 text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                  Transform your ideas into captivating stories. Connect with readers who can't wait for your next chapter. 
                  Build your legacy in the world of storytelling.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <Link 
                    to="/register" 
                    className="group inline-flex items-center gap-3 bg-white text-orange-600 px-8 py-4 rounded-xl hover:bg-orange-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-2 font-bold text-lg"
                  >
                    <Feather className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                    <span>Start Writing Today</span>
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <Link 
                    to="/register" 
                    className="group inline-flex items-center gap-3 bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-xl hover:bg-white/30 transition-all font-bold text-lg"
                  >
                    <BookOpen className="h-6 w-6 group-hover:scale-110 transition-transform" />
                    <span>Explore Stories</span>
                  </Link>
                </div>
                
                <div className="mt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-2">50K+</div>
                    <div className="text-orange-100 text-sm font-medium">Active Writers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-2">1M+</div>
                    <div className="text-orange-100 text-sm font-medium">Stories Published</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-2">5M+</div>
                    <div className="text-orange-100 text-sm font-medium">Readers Worldwide</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="relative z-10 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-20">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
            {/* Brand Section */}
            <div className="lg:col-span-2">
              <Link to="/" className="flex items-center space-x-4 mb-8 group">
                <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                  <Heart className="h-10 w-10 text-white" fill="currentColor" />
                </div>
                <div>
                  <span className="text-3xl font-bold text-orange-600">StoryPad</span>
                  <div className="text-gray-600 text-sm font-medium">Where Stories Begin</div>
                </div>
              </Link>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed max-w-md font-medium">
                Empowering storytellers worldwide to share their creativity, connect with readers, 
                and build lasting communities through the transformative power of narrative.
              </p>
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-white border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-500 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-sm hover:shadow-lg group">
                  <Heart className="h-6 w-6 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <div className="w-12 h-12 bg-white border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-500 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-sm hover:shadow-lg group">
                  <BookOpen className="h-6 w-6 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <div className="w-12 h-12 bg-white border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-500 rounded-xl flex items-center justify-center cursor-pointer transition-all shadow-sm hover:shadow-lg group">
                  <Users className="h-6 w-6 text-gray-600 group-hover:text-white transition-colors" />
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-6">Explore</h4>
              <ul className="space-y-4">
                <li><Link to="/stories" className="text-gray-600 hover:text-orange-600 transition-all flex items-center gap-3 group hover:translate-x-1 font-medium">
                  <div className="w-2 h-2 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span>Trending Stories</span>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link></li>
                <li><Link to="/genres" className="text-gray-600 hover:text-orange-600 transition-all flex items-center gap-3 group hover:translate-x-1 font-medium">
                  <div className="w-2 h-2 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span>All Genres</span>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link></li>
                <li><Link to="/writers" className="text-gray-600 hover:text-orange-600 transition-all flex items-center gap-3 group hover:translate-x-1 font-medium">
                  <div className="w-2 h-2 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span>Featured Writers</span>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link></li>
              </ul>
            </div>

            {/* Get Started */}
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-6">Get Started</h4>
              <ul className="space-y-4">
                <li><Link to="/register" className="text-gray-600 hover:text-orange-600 transition-all flex items-center gap-3 group hover:translate-x-1 font-medium">
                  <div className="w-2 h-2 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link></li>
                <li><Link to="/write" className="text-gray-600 hover:text-orange-600 transition-all flex items-center gap-3 group hover:translate-x-1 font-medium">
                  <div className="w-2 h-2 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span>Start Writing</span>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link></li>
                <li><Link to="/community" className="text-gray-600 hover:text-orange-600 transition-all flex items-center gap-3 group hover:translate-x-1 font-medium">
                  <div className="w-2 h-2 bg-orange-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span>Join Community</span>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link></li>
              </ul>
            </div>
          </div>

          {/* Enhanced Bottom Section */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="text-center lg:text-left">
                <p className="text-gray-600 font-medium">
                  ©️ 2025 StoryPad. Crafted with 
                  <Heart className="inline h-4 w-4 text-orange-500 mx-1" fill="currentColor" />
                  for storytellers everywhere.
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Empowering creativity, one story at a time.
                </p>
              </div>
              <div className="flex items-center gap-8">
                <Link to="/privacy" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">Privacy Policy</Link>
                <Link to="/terms" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">Terms of Service</Link>
                <Link to="/support" className="text-gray-600 hover:text-orange-600 transition-colors font-medium">Support</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;