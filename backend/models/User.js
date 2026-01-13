import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: '' },
  bio: { type: String, default: '' },
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  joinedDate: { type: Date, default: Date.now },
  emailNotifications: { type: Boolean, default: true },
  pushNotifications: { type: Boolean, default: true },
  publicProfile: { type: Boolean, default: true },
  showReadingActivity: { type: Boolean, default: true }
});

// ✅ Fix OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;