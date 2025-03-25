import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/dateFormatter';
import { StarRating, CategorySelect, TagInput } from './UnifiedComponents';

/**
 * 統合されたアイデア関連コンポーネント
 * - IdeaPostForm
 * - IdeaCard
 * - IdeaEvaluationForm
 * をモジュール化してバグフィックス
 */

/**
 * IdeaPostForm Component
 * アイデア投稿フォーム
 */
export const IdeaPostForm = () => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [hashTags, setHashTags] = useState([]);
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // カテゴリーリスト
  const categories = [
    { id: 'technology', name: 'Technology' },
    { id: 'business', name: 'Business' },
    { id: 'education', name: 'Education' },
    { id: 'health', name: 'Health' },
    { id: 'environment', name: 'Environment' },
    { id: 'other', name: 'Other' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('アイディア内容を入力してください');
      return;
    }
    if (!category) {
      setError('カテゴリーを選択してください');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/ideas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          content,
          hashTags,
          category
        })
      });

      if (!response.ok) {
        throw new Error('アイディアの投稿に失敗しました');
      }

      // 投稿成功時の処理
      setContent('');
      setHashTags([]);
      setCategory('');
      // 成功メッセージなど
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTagsChange = (newTags) => {
    setHashTags(newTags);
  };

  return (
    <div className="idea-post-form">
      <h2>新しいアイディアを投稿</h2>
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="content">アイディア内容</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="あなたのアイディアを詳しく説明してください"
            rows={5}
            required
          />
        </div>

        <div className="form-group">
          <label>ハッシュタグ</label>
          <TagInput 
            initialTags={hashTags} 
            onChange={handleTagsChange} 
            maxTags={10}
            placeholder="タグを追加..."
          />
        </div>

        <div className="form-group">
          <label>カテゴリー</label>
          <CategorySelect 
            categories={categories}
            selected={category}
            onChange={(newCategory) => setCategory(newCategory)}
            placeholder="カテゴリーを選択..."
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '投稿中...' : '投稿する'}
        </button>
      </form>
    </div>
  );
};

/**
 * IdeaCard Component
 * アイデアカード表示
 */
export const IdeaCard = ({ idea, onLike, onComment }) => {
  const { user } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [feedbackTags, setFeedbackTags] = useState([]);
  const [isLiked, setIsLiked] = useState(idea.likes?.includes(user?.id) || false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  
  const handleLike = async () => {
    try {
      await onLike(idea._id);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('いいねの処理に失敗しました', error);
    }
  };
  
  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    try {
      await onComment(idea._id, commentText, feedbackTags);
      setCommentText('');
      setFeedbackTags([]);
      setShowCommentForm(false);
    } catch (error) {
      console.error('コメントの投稿に失敗しました', error);
    }
  };
  
  const calculateAverageScore = (evaluations, scoreType) => {
    if (!evaluations || evaluations.length === 0) return 0;
    const sum = evaluations.reduce((acc, evaluation) => acc + (eval.scores?.[scoreType] || 0), 0);
    return (sum / evaluations.length).toFixed(1);
  };
  
  return (
    <div className="idea-card">
      <div className="idea-header">
        <div className="user-info">
          <img src={idea.userImage || '/default-avatar.png'} alt={idea.userName} className="avatar" />
          <span className="username">{idea.userName}</span>
        </div>
        <span className="date">{formatDate(idea.createdAt)}</span>
      </div>
      
      <div className="idea-content">
        <p>{idea.content}</p>
      </div>
      
      <div className="idea-meta">
        <div className="tags">
          {idea.hashTags?.map((tag, index) => (
            <span key={index} className="hashtag">#{tag}</span>
          ))}
        </div>
        <div className="category">{idea.category}</div>
      </div>
      
      <div className="idea-stats">
        <div className="engagement">
          <button 
            className={`like-button ${isLiked ? 'liked' : ''}`} 
            onClick={handleLike}
          >
            <i className="icon-heart"></i>
            <span>{idea.likes?.length || 0}</span>
          </button>
          <button 
            className="comment-button"
            onClick={() => setShowCommentForm(!showCommentForm)}
          >
            <i className="icon-comment"></i>
            <span>{idea.comments?.length || 0}</span>
          </button>
        </div>
        
        <div className="evaluation-summary">
          <div className="score">
            <span className="label">実現可能性</span>
            <span className="value">{calculateAverageScore(idea.evaluations, '実現可能性')}</span>
          </div>
          <div className="score">
            <span className="label">革新性</span>
            <span className="value">{calculateAverageScore(idea.evaluations, '革新性')}</span>
          </div>
          <div className="score">
            <span className="label">有用性</span>
            <span className="value">{calculateAverageScore(idea.evaluations, '有用性')}</span>
          </div>
        </div>
      </div>
      
      {showCommentForm && (
        <form className="comment-form" onSubmit={handleComment}>
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="コメントを入力..."
            required
          />
          <div className="feedback-tags">
            <TagInput
              initialTags={feedbackTags}
              onChange={setFeedbackTags}
              maxTags={5}
              placeholder="フィードバックタグ..."
            />
          </div>
          <button type="submit">コメントする</button>
        </form>
      )}
      
      <div className="comments-section">
        {idea.comments?.length > 0 && (
          <>
            <h3>コメント ({idea.comments.length})</h3>
            <ul className="comments-list">
              {idea.comments.map((comment) => (
                <li key={comment._id} className="comment-item">
                  <div className="comment-header">
                    <div className="user-info">
                      <img src={comment.userImage || '/default-avatar.png'} alt={comment.userName} className="avatar-small" />
                      <span className="username">{comment.userName}</span>
                    </div>
                    <span className="date">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                  {comment.tags?.length > 0 && (
                    <div className="comment-tags">
                      {comment.tags.map((tag, idx) => (
                        <span key={idx} className="feedback-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      
      <div className="idea-actions">
        <Link to={`/ideas/${idea._id}`} className="view-details">
          詳細を見る
        </Link>
        <Link to={`/ideas/${idea._id}/evaluate`} className="evaluate-button">
          評価する
        </Link>
      </div>
    </div>
  );
};

/**
 * IdeaEvaluationForm Component
 * アイデア評価フォーム
 */
export const IdeaEvaluationForm = ({ ideaId, onSubmit }) => {
  const [scores, setScores] = useState({
    実現可能性: 0,
    革新性: 0,
    有用性: 0
  });
  const [comment, setComment] = useState('');
  const [feedbackTags, setFeedbackTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleRatingChange = (category, value) => {
    setScores(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // すべてのカテゴリに評価があるか確認
    const hasAllRatings = Object.values(scores).every(score => score > 0);
    if (!hasAllRatings) {
      setError('すべての評価カテゴリに点数をつけてください');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({
        ideaId,
        scores,
        comment,
        feedbackTags
      });
      
      // 送信成功時の処理
      setScores({
        実現可能性: 0,
        革新性: 0,
        有用性: 0
      });
      setComment('');
      setFeedbackTags([]);
      
    } catch (err) {
      setError(err.message || 'エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="evaluation-form">
      <h2>アイデア評価フォーム</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="rating-section">
          <div className="rating-item">
            <label>実現可能性</label>
            <StarRating
              initialRating={scores.実現可能性}
              onChange={(value) => handleRatingChange('実現可能性', value)}
            />
          </div>
          
          <div className="rating-item">
            <label>革新性</label>
            <StarRating
              initialRating={scores.革新性}
              onChange={(value) => handleRatingChange('革新性', value)}
            />
          </div>
          
          <div className="rating-item">
            <label>有用性</label>
            <StarRating
              initialRating={scores.有用性}
              onChange={(value) => handleRatingChange('有用性', value)}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="comment">コメント（任意）</label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="このアイデアについてのフィードバック..."
            rows={4}
          />
        </div>
        
        <div className="form-group">
          <label>フィードバックタグ（任意）</label>
          <TagInput
            initialTags={feedbackTags}
            onChange={setFeedbackTags}
            maxTags={5}
            placeholder="改善点、良い点などのタグを追加..."
          />
        </div>
        
        <button type="submit" className="submit-button" disabled={isSubmitting}>
          {isSubmitting ? '送信中...' : '評価を送信'}
        </button>
      </form>
    </div>
  );
};