import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ProfileRedirect from './components/ProfileRedirect';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import CreateStory from './pages/CreateStory';
import EditStory from './pages/EditStory';
import StoryDetail from './pages/StoryDetail';
import Bookmarks from './pages/Bookmarks';
import Notifications from './pages/Notifications';
import UserSettings from './pages/UserSettings';
import ChapterReader from './pages/ChapterReader';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <div className="min-h-screen bg-white">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfileRedirect /></ProtectedRoute>} />
            <Route path="/profile/:userId" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/create-story" element={<ProtectedRoute><CreateStory /></ProtectedRoute>} />
            <Route path="/story/:storyId/edit" element={<ProtectedRoute><EditStory /></ProtectedRoute>} />
            <Route path="/story/:storyId" element={<ProtectedRoute><StoryDetail /></ProtectedRoute>} />
            <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />
            <Route path="/story/:storyId/chapter/:chapterNumber" element={<ProtectedRoute><ChapterReader /></ProtectedRoute>} />
          </Routes>
          <ToastContainer position="top-right" />
          <ScrollToTopButton />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;