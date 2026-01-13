import Bookmark from '../models/Bookmark.js';
import Story from '../models/Story.js';

export const toggleBookmark = async (req, res) => {
    try{
        const { storyId } = req.params;

        const existingBookmark = await Bookmark.findOne({
            user: req.userId,
            story: storyId
        });

        if(existingBookmark){
            await Bookmark.findByIdAndDelete(existingBookmark._id);
            res.json({ message: 'Bookmark removed' });
        } else {
            const bookmark = new Bookmark({
                user: req.userId,
                story: storyId
            });
            await bookmark.save();
            res.json({bookmarked: true});
        }
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });


    }
};

export const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.userId })
      .populate({
        path: 'story',
        populate: {
          path: 'author',
          select: 'username profilePicture',
        },
      })
      .sort({ createdAt: -1 });

    // Filter out bookmarks where the story has been deleted (null)
    const validBookmarks = bookmarks.filter(
      (bookmark) => bookmark.story !== null
    );

    // Clean up orphaned bookmarks (where story is null)
    const orphanedBookmarks = bookmarks.filter(
      (bookmark) => bookmark.story === null
    );

    if (orphanedBookmarks.length > 0) {
      const orphanedIds = orphanedBookmarks.map((b) => b._id);
      await Bookmark.deleteMany({ _id: { $in: orphanedIds } });
      console.log(
        `Cleaned up ${orphanedBookmarks.length} orphaned bookmarks`
      );
    }

    // Extract and return just the story objects
    const stories = validBookmarks.map((bookmark) => bookmark.story);

    res.json(stories);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

