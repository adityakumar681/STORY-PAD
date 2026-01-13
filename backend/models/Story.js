import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tags: [String],
  category: { type: String, required: true },
  targetAudience: { type: String, default: 'General' },
  language: { type: String, default: 'English' },
  status: { type: String, default: 'Ongoing', enum: ['Ongoing', 'Completed', 'Hiatus'] },
  isPublished: { type: Boolean, default: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reads: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Add indexes for better query performance
storySchema.index({ isPublished: 1, createdAt: -1 }); // Main query for getStories
storySchema.index({ author: 1, createdAt: -1 }); // For author-specific queries
storySchema.index({ category: 1, isPublished: 1 }); // For category filtering
storySchema.index({ tags: 1, isPublished: 1 }); // For tag-based searches
storySchema.index({ reads: -1, isPublished: 1 }); // For popularity sorting

export default mongoose.model('Story', storySchema);