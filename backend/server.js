import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import storyRoutes from './routes/stories.js';
import chapterRoutes from './routes/chapters.js';
import bookmarkRoutes from './routes/bookmarks.js';
import notificationRoutes from './routes/notifications.js';
import storyCommentRoutes from './routes/storyComments.js';
import readingProgressRoutes from './routes/readingProgress.js';
import draftRoutes from './routes/drafts.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [
          process.env.CLIENT_URL,
          "https://story-pad-26tm.vercel.app",
          /.*\.vercel\.app$/
        ]
      : [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://localhost:5175",
          "http://localhost:5176",
          "http://localhost:3000"
        ],
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.CLIENT_URL,
        "https://story-pad-26tm.vercel.app",
        /.*\.vercel\.app$/  // Allow any Vercel preview deployments
      ]
    : [
        "http://localhost:5173",
        "http://localhost:5174", 
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:3000"
      ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files (avatars)
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/story-comments', storyCommentRoutes);
app.use('/api/reading-progress', readingProgressRoutes);
app.use('/api/drafts', draftRoutes);

// Socket.io for realtime
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('join-feed', (userId) => {
    socket.join('feed');
    if (userId) {
      socket.join(`user_${userId}`);
    }
  });
  
  socket.on('join-story', (storyId) => {
    socket.join(`story_${storyId}`);
  });
  
  socket.on('leave-story', (storyId) => {
    socket.leave(`story_${storyId}`);
  });
  
  socket.on('join-user', (userId) => {
    socket.join(`user_${userId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wattpad-clone')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { io };