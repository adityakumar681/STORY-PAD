import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { 
    type: String, 
    enum: ['like_story', 'like_chapter', 'comment_story', 'comment_chapter', 'follow', 'new_chapter'],
    required: true 
  },
  story: { type: mongoose.Schema.Types.ObjectId, ref: 'Story' },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
  comment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Notification', notificationSchema);