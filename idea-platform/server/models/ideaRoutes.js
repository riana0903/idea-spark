const express = require('express');
const router = express.Router();
const Idea = require('../models/ideaModel');
const { authenticate, isAdmin } = require('../middleware/authenticate');

// GET /api/ideas - アイディア一覧取得（フィルター・ソート可能）
router.get('/ideas', async (req, res) => {
  try {
    // フィルターとソートのパラメータを取得
    const { sort, filter, page = 1, limit = 10 } = req.query;
    
    // データベースからアイディアを取得するロジック
    const ideas = await Idea.find(buildFilter(filter))
      .sort(buildSortOptions(sort))
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'name image');
    
    res.json({
      success: true,
      data: ideas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Idea.countDocuments(buildFilter(filter))
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/ideas/:id - 特定のアイディア詳細取得
router.get('/ideas/:id', async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id)
      .populate('createdBy', 'name image')
      .populate('branches');
    
    if (!idea) {
      return res.status(404).json({ success: false, message: 'アイディアが見つかりません' });
    }
    res.json({ success: true, data: idea });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'アイディアが見つかりません' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ideas - 新規アイディア投稿
router.post('/ideas', authenticate, async (req, res) => {
  try {
    const { title, content, hashTags, category } = req.body;
    
    // タイトルと内容のバリデーション
    if (!title || !content || content.trim() === '') {
      return res.status(400).json({ success: false, message: 'タイトルと内容は必須です' });
    }
    
    // ハッシュタグの自動抽出 - paste.txtの機能を統合
    let tags = hashTags || [];
    if (tags.length === 0) {
      const hashtagRegex = /#(\w+)/g;
      const matches = content.match(hashtagRegex);
      if (matches) {
        tags = matches.map(tag => tag.slice(1));
      }
    }
    
    const newIdea = new Idea({
      title,
      content,
      hashTags: tags,
      category,
      createdBy: req.user._id,
      userName: req.user.name,
      userImage: req.user.image
    });
    
    await newIdea.save();
    res.status(201).json({ success: true, data: newIdea });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/ideas/:id - アイディア更新
router.put('/ideas/:id', authenticate, async (req, res) => {
  try {
    const { title, content, hashTags, category } = req.body;
    
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ success: false, message: 'アイディアが見つかりません' });
    }
    
    // 所有者チェック
    if (idea.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: '更新権限がありません' });
    }
    
    const updatedIdea = await Idea.findByIdAndUpdate(
      req.params.id,
      { title, content, hashTags, category, updatedAt: new Date() },
      { new: true }
    );
    
    res.json({ success: true, data: updatedIdea });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/ideas/:id - アイディア削除
router.delete('/ideas/:id', authenticate, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ success: false, message: 'アイディアが見つかりません' });
    }
    
    // 所有者または管理者チェック
    if (idea.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: '削除権限がありません' });
    }
    
    await Idea.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'アイディアが削除されました' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ideas/:id/like - いいね追加/解除（トグル機能）
router.post('/ideas/:id/like', authenticate, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ success: false, message: 'アイディアが見つかりません' });
    }
    
    // いいねのトグル機能 - paste.txtの機能を統合
    const userLikedIndex = idea.likes.findIndex(userId => 
      userId.toString() === req.user._id.toString()
    );
    
    if (userLikedIndex !== -1) {
      // いいねを解除
      idea.likes.splice(userLikedIndex, 1);
    } else {
      // いいねを追加
      idea.likes.push(req.user._id);
    }
    
    await idea.save();
    
    res.json({ 
      success: true, 
      likesCount: idea.likes.length,
      isLiked: userLikedIndex === -1 // 新しくいいねした場合はtrue
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/ideas/:id/like - いいね解除（明示的削除）
router.delete('/ideas/:id/like', authenticate, async (req, res) => {
  try {
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ success: false, message: 'アイディアが見つかりません' });
    }
    
    // いいねを取り消す
    idea.likes = idea.likes.filter(userId => userId.toString() !== req.user._id.toString());
    await idea.save();
    
    res.json({ success: true, likesCount: idea.likes.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ideas/:id/comment - コメント追加
router.post('/ideas/:id/comment', authenticate, async (req, res) => {
  try {
    const { content, tags } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: 'コメント内容は必須です' });
    }
    
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ success: false, message: 'アイディアが見つかりません' });
    }
    
    const comment = {
      content,
      createdBy: req.user._id,
      userName: req.user.name,
      userImage: req.user.image,
      tags: tags || [],
      createdAt: new Date()
    };
    
    // コメントを先頭に追加（paste.txtの方式を採用）
    idea.comments.unshift(comment);
    await idea.save();
    
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ideas/:id/evaluate - 評価追加・更新
router.post('/ideas/:id/evaluate', authenticate, async (req, res) => {
  try {
    const { scores, feedback } = req.body;
    if (!scores || Object.values(scores).some(score => score < 1 || score > 5)) {
      return res.status(400).json({ success: false, message: '有効な評価（1-5）が必要です' });
    }
    
    const idea = await Idea.findById(req.params.id);
    if (!idea) {
      return res.status(404).json({ success: false, message: 'アイディアが見つかりません' });
    }
    
    // 既存の評価を探す
    const existingEvalIndex = idea.evaluations.findIndex(
      eval => eval.evaluator.toString() === req.user._id.toString()
    );
    
    if (existingEvalIndex > -1) {
      // 更新
      idea.evaluations[existingEvalIndex].scores = scores;
      idea.evaluations[existingEvalIndex].feedback = feedback;
      idea.evaluations[existingEvalIndex].updatedAt = new Date();
    } else {
      // 新規追加
      idea.evaluations.push({
        scores,
        feedback,
        evaluator: req.user._id,
        userName: req.user.name,
        userImage: req.user.image,
        createdAt: new Date()
      });
    }
    
    await idea.save(); // save時に平均評価が自動計算される
    
    // 評価したユーザーの評価を返す（paste.txtの機能を統合）
    const userEvaluation = idea.evaluations.find(
      eval => eval.evaluator.toString() === req.user._id.toString()
    );
    
    res.json({ 
      success: true, 
      averageRating: idea.averageRating, 
      evaluationsCount: idea.evaluations.length,
      userEvaluation
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/ideas/:id/branch - 派生アイディア作成
router.post('/ideas/:id/branch', authenticate, async (req, res) => {
  try {
    const { title, content, changes, hashTags, category } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'タイトルと内容は必須です' });
    }
    
    const parentIdea = await Idea.findById(req.params.id);
    if (!parentIdea) {
      return res.status(404).json({ success: false, message: '親アイディアが見つかりません' });
    }
    
    const branchedIdea = new Idea({
      title,
      content,
      hashTags: hashTags || parentIdea.hashTags,
      category: category || parentIdea.category,
      parentId: parentIdea._id,
      changes,
      createdBy: req.user._id,
      userName: req.user.name,
      userImage: req.user.image,
      createdAt: new Date()
    });
    
    await branchedIdea.save();
    
    // 親アイディアに派生情報を追加
    parentIdea.branches.push(branchedIdea._id);
    await parentIdea.save();
    
    res.status(201).json({ success: true, data: branchedIdea });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/ideas/search - アイディア検索
router.get('/ideas/search', async (req, res) => {
  try {
    const { query, q, tags, tag, category, minRating, sort } = req.query;
    
    // 検索条件の構築
    const searchConditions = {};
    
    // 統合: queryとqのどちらも受け付ける
    if (query || q) {
      searchConditions.$text = { $search: query || q };
    }
    
    // 統合: tagsとtagのどちらも受け付ける
    if (tags) {
      searchConditions.hashTags = { $in: tags.split(',') };
    } else if (tag) {
      searchConditions.hashTags = tag;
    }
    
    if (category) {
      searchConditions.category = category;
    }
    
    if (minRating) {
      searchConditions.averageRating = { $gte: parseFloat(minRating) };
    }
    
    // 検索条件が何もない場合のバリデーション（paste.txtから統合）
    if (Object.keys(searchConditions).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: '検索パラメータ（query/q、tags/tag、category、minRating）のいずれかが必要です' 
      });
    }
    
    // ソートオプション
    const sortOptions = buildSortOptions(sort);
    
    const ideas = await Idea.find(searchConditions)
      .sort(sortOptions)
      .limit(parseInt(req.query.limit) || 20)
      .populate('createdBy', 'name image');
    
    res.json({ success: true, data: ideas });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/categories - カテゴリ一覧取得
router.get('/categories', async (req, res) => {
  try {
    // ユニークなカテゴリの取得
    const categories = await Idea.distinct('category');
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/tags - タグ一覧取得
router.get('/tags', async (req, res) => {
  try {
    // 人気のあるタグの取得（最大100個）
    const tags = await Idea.aggregate([
      { $unwind: '$hashTags' },
      { $group: { _id: '$hashTags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 100 },
      { $project: { _id: 0, tag: '$_id', count: 1 } }
    ]);
    
    res.json({ success: true, data: tags });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ヘルパー関数
function buildFilter(filterParams) {
  const filter = {};
  if (!filterParams) return filter;
  
  // パラメータから検索条件を構築
  if (filterParams.category) filter.category = filterParams.category;
  if (filterParams.tags) filter.hashTags = { $in: filterParams.tags.split(',') };
  if (filterParams.createdBy) filter.createdBy = filterParams.createdBy;
  if (filterParams.minRating) filter.averageRating = { $gte: parseFloat(filterParams.minRating) };
  
  return filter;
}

function buildSortOptions(sortParam) {
  switch (sortParam) {
    case 'newest':
      return { createdAt: -1 };
    case 'mostLiked':
      return { likes: -1 };
    case 'highestRated':
      return { averageRating: -1 };
    case 'mostCommented':
      return { 'comments.length': -1 };
    default:
      return { createdAt: -1 }; // デフォルトは最新順
  }
}

module.exports = router;