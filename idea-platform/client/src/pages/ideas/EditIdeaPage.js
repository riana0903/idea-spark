import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditIdeaPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [idea, setIdea] = useState({
    title: '',
    description: '',
    category: '',
    status: 'draft'
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchIdea = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/ideas/${id}`);
        setIdea(response.data);
        setError(null);
      } catch (err) {
        setError('アイデアの取得中にエラーが発生しました。');
        console.error('Error fetching idea:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchIdea();
  }, [id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setIdea(prevIdea => ({
      ...prevIdea,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.put(`/api/ideas/${id}`, idea);
      navigate(`/ideas/${id}`);
    } catch (err) {
      setError('アイデアの更新中にエラーが発生しました。');
      console.error('Error updating idea:', err);
    }
  };
  
  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }
  
  if (error) {
    return <div className="error">{error}</div>;
  }
  
  return (
    <div className="edit-idea-container">
      <h1>アイデアを編集</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">タイトル</label>
          <input
            type="text"
            id="title"
            name="title"
            value={idea.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">詳細</label>
          <textarea
            id="description"
            name="description"
            value={idea.description}
            onChange={handleChange}
            rows="5"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">カテゴリー</label>
          <select
            id="category"
            name="category"
            value={idea.category}
            onChange={handleChange}
            required
          >
            <option value="">カテゴリーを選択</option>
            <option value="business">ビジネス</option>
            <option value="technology">テクノロジー</option>
            <option value="education">教育</option>
            <option value="health">健康</option>
            <option value="other">その他</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="status">ステータス</label>
          <select
            id="status"
            name="status"
            value={idea.status}
            onChange={handleChange}
            required
          >
            <option value="draft">下書き</option>
            <option value="published">公開</option>
            <option value="archived">アーカイブ</option>
          </select>
        </div>
        
        <div className="button-group">
          <button type="button" className="cancel-button" onClick={() => navigate(`/ideas/${id}`)}>
            キャンセル
          </button>
          <button type="submit" className="save-button">
            保存
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditIdeaPage;