import User from '../models/User.js';
import ScrapedData from '../models/ScrapedData.js'; // 🔁 Add at top of file if not already
import bcrypt from 'bcryptjs';

// 🔄 Create user (admin only)
export const createUserByAdmin = async (req, res) => {
  const { username, email, password, role, fullName } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      fullName,
      password: hashedPassword,
      role: ['admin', 'user'].includes(role) ? role : 'user',
    });

    res.status(201).json({
      message: 'User created successfully by admin',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error('Admin create user error:', err.message);
    res.status(500).json({ message: 'Error creating user' });
  }
};

// 👤 Get all users (admin)
export const getAllUsers = async (_req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error('Error getting users:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// 👤 Get single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Get user by ID error:', err.message);
    res.status(500).json({ message: 'Server error fetching user' });
  }
};

// ✏️ Update user (admin)
export const updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.password) delete updates.password;

    const updated = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!updated) return res.status(404).json({ message: 'User not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Error updating user' });
  }
};

// ❌ Delete user
export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};

// 👤 Get profile (token-based)
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ CORRECT
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get profile' });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // ✅ CORRECT
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { username, email, bio, fullName, description, gender } = req.body;

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ message: 'Email already in use' });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.fullName = fullName || user.fullName;
    user.bio = bio || user.bio;
    user.description = description || user.description;
    user.gender = gender || user.gender;
    if (req.file) user.avatar = `/uploads/${req.file.filename}`;

    await user.save();

    res.json(user); // ✅ Keep return shape consistent
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};


// 🔐 Change password (logged-in user)
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Current password incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to change password' });
  }
};

// 🔐 Forgot password handler (stub for future email flow)
export const resetForgottenPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ message: 'Required fields missing' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset password' });
  }
};

// 📊 Get user dashboard summary (scrape count for logged-in user)
export const getUserSummary = async (req, res, next) => {
  try {
    const myScrapes = await ScrapedData.countDocuments({ userId: req.user.id });
    res.json({ myScrapes });
  } catch (err) {
    next(err);
  }
};

// 📋 Admin-only: Get all users with full details (without password)
export const getAllUsersFullForAdmin = async (_req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    console.error("Error getting users:", error.message);
    res.status(500).json({ message: "Server error fetching full user list" });
  }
};