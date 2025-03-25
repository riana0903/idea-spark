// client/src/pages/ideas/IdeaDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ideaService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../utils/formatDate';

const IdeaDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [idea, setIdea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  useEffect(() => {
    const fetchIdea = async () => {
      try {
        const response = await ideaService.getById(id);
        setIdea(response.data);
        setLoading(false);
      } catch (err) {
        setError('アイデアの取得に失敗しました');
        setLoading(false);
      }
    };

    fetchIdea();
  }, [id]);

  const handleDelete = async () => {
    try {
      await ideaService.delete(id);
      navigate('/');
    } catch (err) {
      setError('アイデアの削除に失敗しました');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!idea) return <div className="not-found">アイデアが見つかりませんでした</div>;

  const isOwner = currentUser && idea.user && currentUser.id === idea.user._id;

  return (
    <div className="idea-detail-page">
      <div className="idea-header">
        <h1>{idea.title}</h1>
        
        <div className="idea-meta">
          <span className="category">{idea.category}</span>
          <span className="date">{formatDate(idea.createdAt)}</span>
          {idea.user && (
            <span className="author">By: {idea.user.username}</span>
          )}
        </div>
        
        {isOwner && (
          <div className="idea-actions">
            <Link to={`/ideas/edit/${id}`} className="btn btn-edit">
              編集
            </Link>
            <button 
              className="btn btn-delete"
              onClick={() => setDeleteModalOpen(true)}
            >
              削除
            </button>
          </div>
        )}
      </div>
      
      <div className="idea-content">
        <p className="description">{idea.description}</p>
        
        {idea.problem && (
          <div className="idea-section">
            <h2>解決する問題</h2>
            <p>{idea.problem}</p>
          </div>
        )}
        
        {idea.solution && (
          <div className="idea-section">
            <h2>提案する解決策</h2>
            <p>{idea.solution}</p>
          </div>
        )}
        
        {idea.targetAudience && (
          <div className="idea-section">
            <h2>ターゲットオーディエンス</h2>
            <p>{idea.targetAudience}</p>
          </div>
        )}
        
        {idea.marketPotential && (
          <div className="idea-section">
            <h2>市場の可能性</h2>
            <p>{idea.marketPotential}</p>
          </div>
        )}
        
        {idea.implementation && (
          <div className="idea-section">
            <h2>実装計画</h2>
            <p>{idea.implementation}</p>
          </div>
        )}
      </div>
      
      {/* コメントセクション - 将来的に実装 */}
      
      {/* 削除確認モーダル */}
      {deleteModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>削除の確認</h2>
            <p>このアイデアを削除してもよろしいですか？この操作は取り消せません。</p>
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setDeleteModalOpen(false)}
              >
                キャンセル
              </button>
              <button 
                className="btn btn-danger"
                onClick={handleDelete}
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeaDetailPage;