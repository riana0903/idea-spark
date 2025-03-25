const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const authenticate = async (req, res, next) => {
  try {
    // ヘッダーからトークンを取得
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: '認証が必要です' });
    }
    
    // トークンを検証
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ユーザーを検索
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'ユーザーが見つかりません' });
    }
    
    // リクエストにユーザー情報を添付
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: '認証に失敗しました' });
  }
};

// 管理者権限確認ミドルウェア
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: '管理者権限が必要です' });
  }
};

module.exports = { authenticate, isAdmin };