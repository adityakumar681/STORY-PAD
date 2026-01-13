import User from "../models/user.js";
import Story from "../models/Story.js";
import Chapter from "../models/Chapter.js";
import bcrypt from "bcryptjs";
import {
  deleteFromCloudinary,
  extractPublicId
} from "../config/cloudinary.js";

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select("-password")
      .populate("followers", "username profilePicture")
      .populate("following", "username profilePicture");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("following")
      .populate("following", "_id username");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user.following);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.userId);
    const currentUser = await User.findById(req.userId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (userToFollow._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const isFollowing = currentUser.following.includes(userToFollow._id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== userToFollow._id.toString()
      );

      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== currentUser._id.toString()
      );
    } else {
      // Follow
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({ following: !isFollowing });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const { username, email, bio, profilePicture } = req.body;

    // Check if username or email is already taken by another user
    const existingUser = await User.findOne({
      $and: [
        { _id: { $ne: req.userId } },
        { $or: [{ username }, { email }] }
      ]
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already taken" });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.profilePicture = profilePicture || user.profilePicture;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({ user: userResponse });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedNewPassword;

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    console.log("Upload avatar request received");
    console.log("File:", req.file);
    console.log("User ID:", req.userId);

    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({ message: "No file uploaded" });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      console.log("User not found:", req.userId);
      return res.status(404).json({ message: "User not found" });
    }

    // Delete old avatar from Cloudinary if it exists
    if (user.profilePicture) {
      const oldPublicId = extractPublicId(user.profilePicture);

      if (oldPublicId) {
        try {
          console.log("Deleting old avatar:", oldPublicId);
          await deleteFromCloudinary(oldPublicId);
        } catch (error) {
          console.error(
            "Error deleting old avatar from Cloudinary:",
            error
          );
          // Continue with upload even if deletion fails
        }
      }
    }

    // Cloudinary automatically uploads the file and provides the URL
    const avatarUrl = req.file.path; // Cloudinary URL
    console.log("New avatar URL:", avatarUrl);

    user.profilePicture = avatarUrl;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    console.log("Avatar upload successful");

    res.json({
      message: "Avatar uploaded successfully",
      profilePicture: avatarUrl,
      user: userResponse
    });
  } catch (error) {
    console.error("Avatar upload error:", error);
    console.error("Error stack:", error.stack);

    res.status(500).json({
      message: "Failed to upload avatar",
      error: error.message
    });
  }
};
export const removeAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete avatar from Cloudinary if it exists
    if (user.profilePicture) {
      const publicId = extractPublicId(user.profilePicture);

      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (error) {
          console.error("Error deleting avatar from Cloudinary:", error);
          // Continue with removal even if Cloudinary deletion fails
        }
      }
    }

    // Remove avatar from user
    user.profilePicture = "";
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: "Avatar removed successfully",
      user: userResponse
    });
  } catch (error) {
    console.error("Remove avatar error:", error);
    res.status(500).json({ message: "Failed to remove avatar" });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const {
      emailNotifications,
      pushNotifications,
      publicProfile,
      showReadingActivity
    } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update preferences (add these fields to User model if they don't exist)
    if (emailNotifications !== undefined)
      user.emailNotifications = emailNotifications;

    if (pushNotifications !== undefined)
      user.pushNotifications = pushNotifications;

    if (publicProfile !== undefined)
      user.publicProfile = publicProfile;

    if (showReadingActivity !== undefined)
      user.showReadingActivity = showReadingActivity;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      message: "Preferences updated successfully",
      user: userResponse
    });
  } catch (error) {
    console.error("Update preferences error:", error);
    res.status(500).json({ message: "Failed to update preferences" });
  }
};
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete user's avatar from Cloudinary if it exists
    if (user.profilePicture) {
      const publicId = extractPublicId(user.profilePicture);

      if (publicId) {
        try {
          await deleteFromCloudinary(publicId);
        } catch (error) {
          console.error(
            "Error deleting avatar from Cloudinary:",
            error
          );
          // Continue with account deletion even if avatar deletion fails
        }
      }
    }

    // Delete user's stories and chapters
    const stories = await Story.find({ author: req.userId });

    for (const story of stories) {
      await Chapter.deleteMany({ story: story._id });
    }

    await Story.deleteMany({ author: req.userId });

    // Remove user from followers/following lists
    await User.updateMany(
      { followers: req.userId },
      { $pull: { followers: req.userId } }
    );

    await User.updateMany(
      { following: req.userId },
      { $pull: { following: req.userId } }
    );

    // Delete user
    await User.findByIdAndDelete(req.userId);

    res.json({ message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getUserStories = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all published stories by this user
    const stories = await Story.find({
      author: userId,
      isPublished: true
    })
      .populate("author", "username profilePicture")
      .sort({ createdAt: -1 });

    res.json(stories);
  } catch (error) {
    console.error("Error fetching user stories:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || query.trim().length === 0) {
      return res
        .status(400)
        .json({ message: "Search query is required" });
    }

    // Search users by username with case-insensitive regex
    const users = await User.find({
      username: { $regex: query.trim(), $options: "i" }
    })
      .select("username profilePicture bio followers following")
      .populate("followers", "_id")
      .populate("following", "_id")
      .limit(20) // Limit results to prevent overwhelming response
      .sort({ followers: -1 }); // Sort by follower count (most popular first)

    // Add additional computed fields
    const usersWithStats = users.map(user => ({
      ...user.toObject(),
      followersCount: user.followers.length,
      followingCount: user.following.length
    }));

    res.json(usersWithStats);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

