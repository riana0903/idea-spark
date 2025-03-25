// client/src/pages/ideas/CreateIdeaPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ideaService } from '../../services/api';
import { useForm } from '../../hooks/useForm';
import '../../styles/CreateIdeaPage.css';

const CreateIdeaPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  const { values, handleChange, handleSubmit } = useForm({
    title: '',
    category: 'technology', // デフォルト値
    description: '',
    problem: '',
    solution: '',
    targetAudience: '',
    marketPotential: '',
    implementation: '',
    hashTags: '' // 新しいフィールド
  });

  const categories = [
    'technology',
    'business',
    'education',
    'health',
    'environment',
    'other'
  ];

  const onSubmit = async () => {
    // バリデーション
    if (!values.title || !values.description) {
      setError('タイトルと説明は必須です');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      // ハッシュタグを抽出
      const tagsArray = values.hashTags
        .split(' ')
        .filter(tag => tag.trim() !== '')
        .map(tag => tag.startsWith('#') ? tag.substring(1) : tag);
        
      // データを整形
      const ideaData = {
        ...values,
        hashTags: tagsArray
      };
      
      const response = await ideaService.create(ideaData);
      navigate(`/ideas/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'アイデアの作成に失敗しました');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-idea-page">
      <h1>新しいアイデアを作成</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit(onSubmit)} className="idea-form">
        <div className="form-group">
          <label htmlFor="title">タイトル *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={values.title}
            onChange={handleChange}
            placeholder="アイデアのタイトル"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">カテゴリー *</label>
          <select
            id="category"
            name="category"
            value={values.category}
            onChange={handleChange}
            required
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="description">説明 *</label>
          <textarea
            id="description"
            name="description"
            value={values.description}
            onChange={handleChange}
            placeholder="アイデアの概要を説明してください"
            rows="4"
            maxLength={500}
            required
          />
          <div className="character-count">
            {values.description.length}/500
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="problem">解決する問題</label>
          <textarea
            id="problem"
            name="problem"
            value={values.problem}
            onChange={handleChange}
            placeholder="このアイデアはどのような問題を解決しますか？"
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="solution">提案する解決策</label>
          <textarea
            id="solution"
            name="solution"
            value={values.solution}
            onChange={handleChange}
            placeholder="問題をどのように解決しますか？"
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="targetAudience">ターゲットオーディエンス</label>
          <textarea
            id="targetAudience"
            name="targetAudience"
            value={values.targetAudience}
            onChange={handleChange}
            placeholder="誰がこのアイデアから利益を得ますか？"
            rows="2"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="marketPotential">市場の可能性</label>
          <textarea
            id="marketPotential"
            name="marketPotential"
            value={values.marketPotential}
            onChange={handleChange}
            placeholder="市場の可能性や需要についての考えを共有してください"
            rows="2"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="implementation">実装計画</label>
          <textarea
            id="implementation"
            name="implementation"
            value={values.implementation}
            onChange={handleChange}
            placeholder="このアイデアをどのように実装しますか？"
            rows="3"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="hashTags">ハッシュタグ（スペース区切り）</label>
          <input
            id="hashTags"
            name="hashTags"
            type="text"
            value={values.hashTags}
            onChange={handleChange}
            placeholder="例: #テクノロジー #ビジネス #環境"
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/')}
          >
            キャンセル
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? '投稿中...' : 'アイデアを作成'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateIdeaPage;