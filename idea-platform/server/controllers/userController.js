// server/controllers/userController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

// 既存の認証関連機能
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const user = new User({ username, email, password });
    await user.save();
    
    // Generate token
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1d' });
    
    res.status(201).json({ token, user: { id: user._id, username, email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1d' });
    
    res.json({ token, user: { id: user._id, username: user.username, email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// 新しく追加するユーザープロフィール関連の機能
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ユーザーとそのアイデアを取得する関数
exports.getUserWithIdeas = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .select('-password')
      .populate('ideas');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user with ideas:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ユーザープロフィールの更新
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, profileImage } = req.body;
    const userId = req.user.id; // JWT認証ミドルウェアからのユーザーID
    
    // プロフィール更新（パスワードフィールドは除外）
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        name: name || undefined,
        bio: bio || undefined,
        profileImage: profileImage || undefined
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ユーザーが「いいね」したアイデアの取得
exports.getLikedIdeas = async (req, res) => {
  try {
    const userId = req.params.id || req.user.id;
    const user = await User.findById(userId)
      .select('-password')
      .populate('likedIdeas');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user.likedIdeas);
  } catch (error) {
    console.error('Error fetching liked ideas:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};