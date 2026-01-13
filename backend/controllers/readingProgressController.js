import ReadingProgress from '../models/ReadingProgress.js';
import Story from '../models/Story.js';
import Chapter from '../models/Chapter.js';

export const updateReadingProgress = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { chapterId, chapterNumber, readingPosition = 0, timeSpent = 0 } = req.body;
    
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    let progress = await ReadingProgress.findOne({
      user: req.userId,
      story: storyId
    });
    
    if (!progress) {
      progress = new ReadingProgress({
        user: req.userId,
        story: storyId,
        lastReadChapter: chapterId,
        lastReadChapterNumber: chapterNumber || 1,
        readingPosition,
        totalTimeRead: timeSpent,
        chaptersRead: chapterId ? [chapterId] : []
      });
    } else {
      progress.lastReadChapter = chapterId || progress.lastReadChapter;
      progress.lastReadChapterNumber = chapterNumber || progress.lastReadChapterNumber;
      progress.readingPosition = readingPosition;
      progress.totalTimeRead += timeSpent;
      progress.lastReadAt = new Date();
      
      // Add chapter to read chapters if not already present
      if (chapterId && !progress.chaptersRead.includes(chapterId)) {
        progress.chaptersRead.push(chapterId);
      }
    }
    
    await progress.save();
    
    // Populate the progress with story and chapter details
    await progress.populate('story', 'title')
      .populate('lastReadChapter', 'title chapterNumber');
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getReadingProgress = async (req, res) => {
  try {
    const { storyId } = req.params;
    
    const progress = await ReadingProgress.findOne({
      user: req.userId,
      story: storyId
    })
      .populate('story', 'title')
      .populate('lastReadChapter', 'title chapterNumber')
      .populate('chaptersRead', 'title chapterNumber');
    
    if (!progress) {
      return res.json({
        user: req.userId,
        story: storyId,
        lastReadChapterNumber: 1,
        readingPosition: 0,
        totalTimeRead: 0,
        chaptersRead: []
      });
    }
    
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getUserReadingProgress = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const progressList = await ReadingProgress.find({ user: req.userId })
      .populate('story', 'title author coverImage')
      .populate('lastReadChapter', 'title chapterNumber')
      .sort({ lastReadAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    // Also populate story author
    for (let progress of progressList) {
      await progress.populate('story.author', 'username');
    }
    
    const totalCount = await ReadingProgress.countDocuments({ user: req.userId });
    
    res.json({
      progress: progressList,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getReadingStats = async (req, res) => {
  try {
    const stats = await ReadingProgress.aggregate([
      { $match: { user: req.userId } },
      {
        $group: {
          _id: null,
          totalStoriesRead: { $sum: 1 },
          totalTimeRead: { $sum: '$totalTimeRead' },
          totalChaptersRead: { $sum: { $size: '$chaptersRead' } }
        }
      }
    ]);
    
    const result = stats[0] || {
      totalStoriesRead: 0,
      totalTimeRead: 0,
      totalChaptersRead: 0
    };
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};