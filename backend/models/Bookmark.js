import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  story: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Bookmark', bookmarkSchema);