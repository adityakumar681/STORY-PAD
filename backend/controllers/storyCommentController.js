import StoryComment from '../models/StoryComment.js';
import Story from '../models/Story.js';
import { createNotification } from './notificationController.js';

export const addStoryComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { storyId } = req.params;
    
    const story = await Story.findById(storyId).populate('author');
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    const comment = new StoryComment({
      story: storyId,
      user: req.userId,
      text
    });
    
    await comment.save();
    await comment.populate('user', 'username profilePicture');
    
    // Create notification for story author (if not commenting on own story)
    if (story.author._id.toString() !== req.userId) {
      await createNotification({
        recipient: story.author._id,
        sender: req.userId,
        type: 'comment_story',
        story: storyId,
        message: `Someone commented on your story "${story.title}"`
      });
    }
    
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const getStoryComments = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const comments = await StoryComment.find({ story: storyId })
      .populate('user', 'username profilePicture')
      .populate('replies.user', 'username profilePicture')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const totalCount = await StoryComment.countDocuments({ story: storyId });
    
    res.json({
      comments,
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

export const likeStoryComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await StoryComment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    const hasLiked = comment.likes.includes(req.userId);
    
    if (hasLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== req.userId);
    } else {
      comment.likes.push(req.userId);
    }
    
    await comment.save();
    res.json({ liked: !hasLiked, likesCount: comment.likes.length });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const addCommentReply = async (req, res) => {
  try {
    const { text } = req.body;
    const { commentId } = req.params;
    
    const comment = await StoryComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    comment.replies.push({
      user: req.userId,
      text
    });
    
    await comment.save();
    await comment.populate('replies.user', 'username profilePicture');
    
    const newReply = comment.replies[comment.replies.length - 1];
    res.json(newReply);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const updateStoryComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { commentId } = req.params;
    
    const comment = await StoryComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    comment.text = text;
    comment.updatedAt = new Date();
    
    await comment.save();
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const deleteStoryComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await StoryComment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    
    if (comment.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await StoryComment.findByIdAndDelete(commentId);
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};