import mongoose from 'mongoose';

const readingProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  story: { type: mongoose.Schema.Types.ObjectId, ref: 'Story', required: true },
  lastReadChapter: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' },
  lastReadChapterNumber: { type: Number, default: 1 },
  readingPosition: { type: Number, default: 0 }, // scroll position or paragraph
  lastReadAt: { type: Date, default: Date.now },
  totalTimeRead: { type: Number, default: 0 }, // in minutes
  chaptersRead: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Chapter' }]
});

// Ensure one progress record per user per story
readingProgressSchema.index({ user: 1, story: 1 }, { unique: true });

export default mongoose.model('ReadingProgress', readingProgressSchema);