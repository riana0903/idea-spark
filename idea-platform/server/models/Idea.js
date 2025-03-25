const mongoose = require('mongoose');

const ideaSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  userName: { type: String, required: true },
  userImage: { type: String },
  content: { type: String, required: true },
  hashTags: [{ type: String }],
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'
  }],
  comments: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    userName: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    tags: [{ type: String }] // フィードバックタグ
  }],
  evaluations: [{
    userId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    userName: { type: String, required: true },
    scores: {
      実現可能性: { type: Number, min: 1, max: 5 },
      革新性: { type: Number, min: 1, max: 5 },
      有用性: { type: Number, min: 1, max: 5 },
      市場性: { type: Number, min: 1, max: 5 },
      コスト効率: { type: Number, min: 1, max: 5 },
      社会的インパクト: { type: Number, min: 1, max: 5 }
    },
    createdAt: { type: Date, default: Date.now }
  }],
  branches: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Idea' 
  }] // 派生アイディアIDリスト
});

// インデックスを追加してクエリパフォーマンスを向上
ideaSchema.index({ userId: 1 });
ideaSchema.index({ category: 1 });
ideaSchema.index({ hashTags: 1 });
ideaSchema.index({ createdAt: -1 });

const Idea = mongoose.model('Idea', ideaSchema);

module.exports = Idea;