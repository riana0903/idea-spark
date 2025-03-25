const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  image: {
    type: String
  },
  bio: {
    type: String
  },
  expertise: [{
    type: String
  }],
  interests: [{
    type: String
  }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  savedIdeas: [{
    type: Schema.Types.ObjectId,
    ref: 'Idea'
  }],
  followers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
});

// インデックス
userSchema.index({ name: 'text' });
userSchema.index({ email: 1 });
userSchema.index({ interests: 1 });
userSchema.index({ expertise: 1 });

// パスワードハッシュ化
userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  user.updatedAt = new Date();
  next();
});

// パスワード検証メソッド
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ユーザープロフィールを返す（パスワードなし）
userSchema.methods.getProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
