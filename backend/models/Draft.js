import mongoose from 'mongoose';

const draftSchema = new mongoose.Schema({
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  storyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Story', 
    default: null  // null for new story drafts
  },
  type: {
    type: String,
    enum: ['story', 'chapter'],
    required: true
  },
  // Story draft data
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  category: { type: String, default: '' },
  tags: [String],
  coverImage: { type: String, default: '' },
  targetAudience: { type: String, default: '' },
  language: { type: String, default: '' },
  status: { type: String, default: '' },
  
  // Chapter draft data
  chapters: [{
    id: Number,
    title: String,
    content: String,
    wordCount: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    published: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Auto-save metadata
  lastSaved: { type: Date, default: Date.now },
  version: { type: Number, default: 1 },
  isActive: { type: Boolean, default: true }, // Mark as inactive when published
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for efficient queries
draftSchema.index({ author: 1, type: 1, isActive: 1 });
draftSchema.index({ author: 1, storyId: 1, type: 1 });
draftSchema.index({ lastSaved: -1 });

// Clean up old inactive drafts (older than 30 days)
draftSchema.index({ 
  isActive: 1, 
  updatedAt: 1 
}, { 
  expireAfterSeconds: 30 * 24 * 60 * 60, // 30 days
  partialFilterExpression: { isActive: false }
});

export default mongoose.model('Draft', draftSchema);