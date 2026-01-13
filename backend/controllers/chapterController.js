import Chapter from '../models/Chapter.js';
import Story from '../models/Story.js';
import { createNotification } from './notificationController.js';
import { io } from '../server.js';

export const createChapter = async (req, res) => {
  try {
    const { title, content } = req.body;

    const storyId = req.params.storyId;
    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }

    if (story.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const chapterCount = await Chapter.countDocuments({ story: storyId });
    const chapterNumber = chapterCount + 1;

    const chapter = new Chapter({
      title,
      content,
      story: storyId,
      chapterNumber,
      author: req.userId
    });

    await chapter.save();

    // Update story updatedAt
    story.updatedAt = new Date();
    await story.save();

    // Notify followers about new chapter
    const storyWithAuthor = await Story.findById(storyId).populate('author');

    if (
      storyWithAuthor.author.followers &&
      storyWithAuthor.author.followers.length > 0
    ) {
      storyWithAuthor.author.followers.forEach(followerId => {
        createNotification({
          recipient: followerId,
          sender: req.userId,
          type: 'new_chapter',
          story: storyId,
          chapter: chapter._id,
          message: `${storyWithAuthor.author.username} added a new chapter to "${story.title}"`
        });
      });
    }

    res.status(201).json(chapter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getChapters = async (req, res) => {
  try {
    const chapters = await Chapter.find({ story: req.params.storyId })
      .populate('author', 'username profilePicture')
      .sort({ chapterNumber: 1 });

    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const likeChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    const hasLiked = chapter.likes.includes(req.userId);

    if (hasLiked) {
      chapter.likes = chapter.likes.filter(
        id => id.toString() !== req.userId
      );
    } else {
      chapter.likes.push(req.userId);
    }

    await chapter.save();

    res.json({ liked: !hasLiked, likesCount: chapter.likes.length });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const chapter = await Chapter.findById(req.params.chapterId)
      .populate('author')
      .populate('story', 'title author');

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    chapter.comments.push({
      user: req.userId,
      text
    });

    await chapter.save();
    await chapter.populate('comments.user', 'username profilePicture');

    const newComment = chapter.comments[chapter.comments.length - 1];

    // Create notification for chapter author (if not commenting on own chapter)
    if (chapter.author._id.toString() !== req.userId) {
      await createNotification({
        recipient: chapter.author._id,
        sender: req.userId,
        type: 'comment_chapter',
        story: chapter.story._id,
        chapter: chapter._id,
        message: `Someone commented on your chapter "${chapter.title}"`
      });
    }

    res.json(newComment);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId)
      .populate('author', 'username profilePicture')
      .populate('comments.user', 'username profilePicture')
      .populate('story', 'title author');

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    res.json(chapter);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const updateChapter = async (req, res) => {
  try {
    const { title, content } = req.body;

    const chapter = await Chapter.findById(req.params.chapterId);

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    if (chapter.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    chapter.title = title || chapter.title;
    chapter.content = content || chapter.content;
    chapter.updatedAt = new Date();

    await chapter.save();

    res.json(chapter);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const deleteChapter = async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.chapterId);

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    if (chapter.author.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Chapter.findByIdAndDelete(req.params.chapterId);

    // Reorder remaining chapters
    const remainingChapters = await Chapter.find({ story: chapter.story })
      .sort({ chapterNumber: 1 });

    for (let i = 0; i < remainingChapters.length; i++) {
      if (remainingChapters[i].chapterNumber !== i + 1) {
        remainingChapters[i].chapterNumber = i + 1;
        await remainingChapters[i].save();
      }
    }

    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};
