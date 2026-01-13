import Draft from '../models/Draft.js';

// Save or update a story draft
export const saveDraft = async (req, res) => {
  try {
    const { 
      storyId = null, 
      type = 'story', 
      title, 
      description, 
      category, 
      tags, 
      coverImage, 
      targetAudience, 
      language, 
      status,
      chapters 
    } = req.body;

    // Find existing draft or create new one
    let draft = await Draft.findOne({
      author: req.userId,
      storyId: storyId,
      type: type,
      isActive: true
    });

    if (draft) {
      // Update existing draft
      draft.title = title || draft.title;
      draft.description = description || draft.description;
      draft.category = category || draft.category;
      draft.tags = tags || draft.tags;
      draft.coverImage = coverImage || draft.coverImage;
      draft.targetAudience = targetAudience || draft.targetAudience;
      draft.language = language || draft.language;
      draft.status = status || draft.status;
      draft.chapters = chapters || draft.chapters;
      draft.lastSaved = new Date();
      draft.version += 1;
      draft.updatedAt = new Date();
    } else {
      // Create new draft
      draft = new Draft({
        author: req.userId,
        storyId,
        type,
        title: title || '',
        description: description || '',
        category: category || '',
        tags: tags || [],
        coverImage: coverImage || '',
        targetAudience: targetAudience || '',
        language: language || '',
        status: status || '',
        chapters: chapters || [],
        lastSaved: new Date(),
        version: 1
      });
    }

    await draft.save();

    res.json({ 
      message: 'Draft saved successfully', 
      draft: {
        id: draft._id,
        version: draft.version,
        lastSaved: draft.lastSaved
      }
    });
  } catch (error) {
    console.error('Error saving draft:', error);
    res.status(500).json({ message: 'Failed to save draft' });
  }
};

// Get user's active drafts
export const getDrafts = async (req, res) => {
  try {
    const { type, storyId } = req.query;

    const filter = {
      author: req.userId,
      isActive: true
    };

    if (type) filter.type = type;
    if (storyId) filter.storyId = storyId;

    const drafts = await Draft.find(filter)
      .sort({ lastSaved: -1 })
      .limit(10); // Limit to recent 10 drafts

    res.json(drafts);
  } catch (error) {
    console.error('Error fetching drafts:', error);
    res.status(500).json({ message: 'Failed to fetch drafts' });
  }
};

// Get a specific draft
export const getDraft = async (req, res) => {
  try {
    const { draftId } = req.params;

    const draft = await Draft.findOne({
      _id: draftId,
      author: req.userId,
      isActive: true
    });

    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    res.json(draft);
  } catch (error) {
    console.error('Error fetching draft:', error);
    res.status(500).json({ message: 'Failed to fetch draft' });
  }
};

// Delete a draft
export const deleteDraft = async (req, res) => {
  try {
    const { draftId } = req.params;

    const draft = await Draft.findOne({
      _id: draftId,
      author: req.userId
    });

    if (!draft) {
      return res.status(404).json({ message: 'Draft not found' });
    }

    await Draft.findByIdAndDelete(draftId);

    res.json({ message: 'Draft deleted successfully' });
  } catch (error) {
    console.error('Error deleting draft:', error);
    res.status(500).json({ message: 'Failed to delete draft' });
  }
};

// Mark draft as inactive (when story is published)
export const deactivateDraft = async (req, res) => {
  try {
    const { storyId } = req.params;

    await Draft.updateMany(
      {
        author: req.userId,
        $or: [
          { storyId: storyId },
          { storyId: null, type: 'story' } // For new story drafts
        ]
      },
      { 
        isActive: false,
        updatedAt: new Date()
      }
    );

    res.json({ message: 'Draft deactivated successfully' });
  } catch (error) {
    console.error('Error deactivating draft:', error);
    res.status(500).json({ message: 'Failed to deactivate draft' });
  }
};

// Clean up old drafts (manual trigger, also handled by MongoDB TTL)
export const cleanupDrafts = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Draft.deleteMany({
      author: req.userId,
      isActive: false,
      updatedAt: { $lt: thirtyDaysAgo }
    });

    res.json({ 
      message: 'Cleanup completed', 
      deletedCount: result.deletedCount 
    });
  } catch (error) {
    console.error('Error cleaning up drafts:', error);
    res.status(500).json({ message: 'Failed to cleanup drafts' });
  }
};