const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth'); // JWT認証ミドルウェア（既存の認証ミドルウェアを想定）

// 認証関連のルート
router.post('/register', userController.register);
router.post('/login', userController.login);

// プロフィール関連のルート
router.get('/profile/:id', userController.getUserProfile);
router.get('/:id/with-ideas', userController.getUserWithIdeas);
router.put('/profile', auth, userController.updateProfile); // 認証必須
router.get('/liked-ideas', auth, userController.getLikedIdeas); // 認証必須
router.get('/:id/liked-ideas', userController.getLikedIdeas); // 公開プロフィール用

module.exports = router;