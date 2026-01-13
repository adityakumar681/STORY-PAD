import Story from '../models/Story.js';
import Chapter from '../models/Chapter.js';
import Draft from '../models/Draft.js';
import { createNotification } from './notificationController.js';
import { io } from '../server.js';

// Simple in-memory cache for stories (5 minutes TTL)
const storiesCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (page, limit) => `stories_${page}_${limit}`;

const getCachedStories = (page, limit) => {
  const key = getCacheKey(page, limit);
  const cached = storiesCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  return null;
};

const setCachedStories = (page, limit, data) => {
  const key = getCacheKey(page, limit);
  storiesCache.set(key, {
    data,
    timestamp: Date.now()
  });
  
  // Clean old cache entries to prevent memory leaks
  if (storiesCache.size > 50) {
    const entries = Array.from(storiesCache.entries());
    entries.slice(0, 10).forEach(([key]) => storiesCache.delete(key));
  }
};

const clearStoriesCache = () => {
  storiesCache.clear();
};

export const createStory = async (req, res) => {
  try {
    const { title, description, category, tags, coverImage, chapters, targetAudience, language, status } = req.body;
    
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    if (!chapters || !chapters.length) {
      return res.status(400).json({ message: 'At least one chapter is required' });
    }
    
    const story = new Story({
      title: title.trim(),
      description: description?.trim() || '',
      category,
      tags: Array.isArray(tags) ? tags : [],
      coverImage,
      targetAudience,
      language,
      status,
      author: req.userId
    });
    
    await story.save();
    
    // Create chapters
    const createdChapters = [];
    for (let i = 0; i < chapters.length; i++) {
      const chapterData = chapters[i];
      const chapter = new Chapter({
        title: chapterData.title || `Chapter ${i + 1}`,
        content: chapterData.content,
        story: story._id,
        chapterNumber: i + 1,
        author: req.userId,
        notes: chapterData.notes || ''
      });
      
      await chapter.save();
      createdChapters.push(chapter);
    }
    
    await story.populate('author', 'username profilePicture');
    
    // Deactivate any drafts for this story
    await Draft.updateMany(
      {
        author: req.userId,
        $or: [
          { storyId: null, type: 'story' }, // New story drafts
          { storyId: story._id }
        ]
      },
      { 
        isActive: false,
        updatedAt: new Date()
      }
    );
    
    // Clear cache since we added a new story
    clearStoriesCache();
    
    // Emit realtime update
    io.to('feed').emit('newStory', story);
    
    res.status(201).json({ story, chapters: createdChapters });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({ message: error.message || 'Something went wrong' });
  }
};

export const getStories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const sort = req.query.sort || 'recent';
    
    // Build filter object
    const filter = { isPublished: true };
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    // Build sort object
    let sortOptions = {};
    switch (sort) {
      case 'popular':
        sortOptions = { 'likes': -1, 'reads': -1, 'createdAt': -1 };
        break;
      case 'recent':
        sortOptions = { 'createdAt': -1 };
        break;
      case 'trending':
        // For trending, we'll sort by recent likes and reads
        sortOptions = { 'reads': -1, 'likes': -1, 'updatedAt': -1 };
        break;
      default:
        sortOptions = { 'createdAt': -1 };
    }
    
    // Create cache key that includes filter and sort parameters
    const cacheKey = `stories_${page}_${limit}_${category || 'all'}_${sort}`;
    const cachedData = storiesCache.get(cacheKey);
    
    if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
      return res.json(cachedData.data);
    }
    
    // Only select necessary fields to reduce payload
    const stories = await Story.find(filter)
      .select('title description coverImage author tags category targetAudience status likes reads createdAt updatedAt')
      .populate('author', 'username profilePicture')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance as we don't need Mongoose document methods
    
    // Get total count for pagination info with the same filter
    const total = await Story.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    
    const responseData = {
      stories,
      total,
      pagination: {
        currentPage: page,
        totalPages,
        totalStories: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
    
    // Cache the response with the new cache key
    storiesCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });
    
    // Clean old cache entries to prevent memory leaks
    if (storiesCache.size > 100) {
      const entries = Array.from(storiesCache.entries());
      entries.slice(0, 20).forEach(([key]) => storiesCache.delete(key));
    }
    
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId)
      .populate('author', 'username profilePicture')
      .populate('likes', 'username profilePicture');
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    // Increment read count
    story.reads += 1;
    await story.save();
    
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const likeStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId).populate('author');
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    const hasLiked = story.likes.includes(req.userId);
    
    if (hasLiked) {
      story.likes = story.likes.filter(id => id.toString() !== req.userId);
    } else {
      story.likes.push(req.userId);
      
      // Create notification for story author (if not liking own story)
      if (story.author._id.toString() !== req.userId) {
        await createNotification({
          recipient: story.author._id,
          sender: req.userId,
          type: 'like_story',
          story: story._id,
          message: `Someone liked your story "${story.title}"`
        });
      }
    }
    
    await story.save();
    
    // Clear cache since engagement changed
    clearStoriesCache();
    
    res.json({ liked: !hasLiked, likesCount: story.likes.length });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const updateStory = async (req, res) => {
  try {
    const { title, description, category, tags, coverImage } = req.body;
    const story = await Story.findById(req.params.storyId);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    if (story.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    story.title = title || story.title;
    story.description = description || story.description;
    story.category = category || story.category;
    story.tags = tags || story.tags;
    story.coverImage = coverImage || story.coverImage;
    story.updatedAt = new Date();
    
    await story.save();
    await story.populate('author', 'username profilePicture');
    
    // Clear cache since story was updated
    clearStoriesCache();
    
    res.json(story);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const deleteStory = async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    if (story.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Delete all chapters associated with this story
    await Chapter.deleteMany({ story: story._id });
    
    // Delete the story
    await Story.findByIdAndDelete(req.params.storyId);
    
    // Clear cache since story was deleted
    clearStoriesCache();
    
    res.json({ message: 'Story and all its chapters deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const incrementReads = async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    story.reads += 1;
    await story.save();
    
    // Clear cache since engagement changed
    clearStoriesCache();
    
    res.json({ reads: story.reads });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getMustWatchStories = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    // Check cache first
    const cacheKey = `mustwatch_${limit}`;
    const cached = storiesCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return res.json(cached.data);
    }
    
    // Get stories with engagement metrics
    const stories = await Story.aggregate([
      { $match: { isPublished: true } },
      {
        $lookup: {
          from: 'storycomments',
          localField: '_id',
          foreignField: 'story',
          as: 'comments'
        }
      },
      {
        $addFields: {
          likesCount: { $size: '$likes' },
          commentsCount: { $size: '$comments' },
          // Engagement score calculation:
          // Likes (weight: 3) + Views/10 (weight: 1) + Comments (weight: 5)
          engagementScore: {
            $add: [
              { $multiply: [{ $size: '$likes' }, 3] },           // Likes * 3
              { $divide: ['$reads', 10] },                       // Views / 10
              { $multiply: [{ $size: '$comments' }, 5] }         // Comments * 5
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $unwind: '$author'
      },
      {
        $project: {
          title: 1,
          description: 1,
          coverImage: 1,
          tags: 1,
          category: 1,
          targetAudience: 1,
          status: 1,
          likes: 1,
          reads: 1,
          createdAt: 1,
          updatedAt: 1,
          likesCount: 1,
          commentsCount: 1,
          engagementScore: 1,
          'author.username': 1,
          'author.profilePicture': 1,
          'author._id': 1
        }
      },
      { $sort: { engagementScore: -1, createdAt: -1 } }, // Sort by engagement, then recency
      { $limit: limit }
    ]);
    
    const responseData = { stories };
    
    // Cache the response
    storiesCache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now()
    });
    
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching must watch stories:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const searchStories = async (req, res) => {
  try {
    const { q, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({ message: 'Search query must be at least 2 characters long' });
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const searchTerm = q.trim();
    
    // Create a case-insensitive search filter
    const searchFilter = {
      isPublished: true,
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { category: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } }
      ]
    };
    
    // Execute search with pagination
    const stories = await Story.find(searchFilter)
      .select('title description coverImage author tags category targetAudience status likes reads createdAt updatedAt')
      .populate('author', 'username profilePicture')
      .sort({ 
        // Sort by popularity first
        reads: -1, 
        likes: -1, 
        createdAt: -1 
      })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    // Get total count for pagination
    const total = await Story.countDocuments(searchFilter);
    const totalPages = Math.ceil(total / parseInt(limit));
    
    const responseData = {
      stories,
      total,
      searchQuery: searchTerm,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalStories: total,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    };
    
    res.json(responseData);
  } catch (error) {
    console.error('Error searching stories:', error);
    res.status(500).json({ message: 'Something went wrong during search' });
  }
};