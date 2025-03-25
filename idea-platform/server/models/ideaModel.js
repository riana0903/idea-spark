const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  content: {
    type: String,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  tags: [{
    type: String,
    trim: true
  }]
});

const evaluationSchema = new Schema({
  evaluator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  scores: {
    实現可能性: { type: Number, min: 1, max: 5 },
    革新性: { type: Number, min: 1, max: 5 },
    有用性: { type: Number, min: 1, max: 5 },
    市場性: { type: Number, min: 1, max: 5 },
    コスト効率: { type: Number, min: 1, max: 5 },
    社会的インパクト: { type: Number, min: 1, max: 5 }
  },
  feedback: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

const ideaSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  hashTags: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userImage: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  evaluations: [evaluationSchema],
  averageRating: {
    type: Number,
    default: 0
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: 'Idea'
  },
  branches: [{
    type: Schema.Types.ObjectId,
    ref: 'Idea'
  }],
  changes: {
    type: String
  }
});

// インデックスの設定
ideaSchema.index({ title: 'text', content: 'text' });
ideaSchema.index({ hashTags: 1 });
ideaSchema.index({ category: 1 });
ideaSchema.index({ createdAt: -1 });
ideaSchema.index({ createdBy: 1 });
ideaSchema.index({ averageRating: -1 });

// 平均評価計算メソッド
ideaSchema.methods.calculateAverageRating = function() {
  if (!this.evaluations || this.evaluations.length === 0) {
    this.averageRating = 0;
    return;
  }
  
  let sum = 0;
  let count = 0;
  
  this.evaluations.forEach(eval => {
    const scores = eval.scores;
    for (const key in scores) {
      if (scores[key]) {
        sum += scores[key];
        count++;
      }
    }
  });
  
  this.averageRating = count > 0 ? sum / count : 0;
};

// 保存前の処理
ideaSchema.pre('save', function(next) {
  if (this.isModified('evaluations')) {
    this.calculateAverageRating();
  }
  this.updatedAt = new Date();
  next();
});

const Idea = mongoose.model('Idea', ideaSchema);

module.exports = Idea;
