import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, getUserIdeas, userService } from '../services/api';
import IdeaCard from '../components/IdeaCard';
import { useForm } from '../hooks/useForm';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const { currentUser, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [userIdeas, setUserIdeas] = useState([]);
  const [activeTab, setActiveTab] = useState('ideas');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const { values, handleChange, handleSubmit, setValues } = useForm({
    username: '',
    email: '',
    bio: '',
    location: '',
    website: ''
  });

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        const profileResponse = await getUserProfile();
        setProfile(profileResponse.data);
        
        const ideasResponse = await getUserIdeas();
        setUserIdeas(ideasResponse.data);
        
        // 編集フォーム用の値をセット
        setValues({
          username: profileResponse.data.name || '',
          email: profileResponse.data.email || '',
          bio: profileResponse.data.bio || '',
          location: profileResponse.data.location || '',
          website: profileResponse.data.website || ''
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
        setMessage({
          text: 'プロフィールの取得に失敗しました',
          type: 'error'
        });
        setLoading(false);
      }
    };

    loadProfileData();
  }, [setValues]);

  const toggleEdit = () => {
    setIsEditing(!isEditing);
    setMessage({ text: '', type: '' });
  };

  const onSubmit = async () => {
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });
    
    try {
      const response = await userService.updateProfile(values);
      login(localStorage.getItem('token'), response.data); // Update user in context
      
      // プロフィール情報を更新
      const updatedProfile = {
        ...profile,
        name: values.username,
        bio: values.bio,
        email: values.email,
        location: values.location,
        website: values.website
      };
      
      setProfile(updatedProfile);
      setIsEditing(false);
      setMessage({
        text: 'プロフィールが更新されました',
        type: 'success'
      });
    } catch (error) {
      setMessage({
        text: error.response?.data?.message || 'プロフィールの更新に失敗しました',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!profile) {
    return <div className="error">プロフィールの読み込みに失敗しました。</div>;
  }

  return (
    <div className="profile-page">
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
      
      {!isEditing ? (
        <>
          <div className="profile-header">
            <img 
              src={profile.image || '/default-avatar.png'} 
              alt={profile.name} 
              className="profile-avatar"
            />
            <div className="profile-info">
              <h2>{profile.name}</h2>
              <p className="bio">{profile.bio || 'プロフィールがまだ設定されていません。'}</p>
              
              {profile.location && (
                <p className="location">{profile.location}</p>
              )}
              
              {profile.website && (
                <p className="website">
                  <a href={profile.website} target="_blank" rel="noopener noreferrer">
                    {profile.website}
                  </a>
                </p>
              )}
              
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-value">{profile.ideasCount}</span>
                  <span className="stat-label">投稿</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{profile.likesReceived}</span>
                  <span className="stat-label">いいね</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{profile.evaluationsCount}</span>
                  <span className="stat-label">評価</span>
                </div>
              </div>
            </div>
            <button onClick={toggleEdit} className="edit-profile-button">
              編集
            </button>
          </div>
          
          <div className="profile-tabs">
            <button 
              className={activeTab === 'ideas' ? 'active' : ''} 
              onClick={() => setActiveTab('ideas')}
            >
              投稿したアイディア
            </button>
            <button 
              className={activeTab === 'liked' ? 'active' : ''} 
              onClick={() => setActiveTab('liked')}
            >
              いいねしたアイディア
            </button>
            <button 
              className={activeTab === 'evaluated' ? 'active' : ''} 
              onClick={() => setActiveTab('evaluated')}
            >
              評価したアイディア
            </button>
          </div>
          
          <div className="profile-content">
            {activeTab === 'ideas' && (
              <div className="ideas-container">
                {userIdeas.length > 0 ? (
                  userIdeas.map(idea => (
                    <IdeaCard key={idea._id} idea={idea} />
                  ))
                ) : (
                  <div className="no-items-message">投稿したアイディアはまだありません。</div>
                )}
              </div>
            )}
            
            {activeTab === 'liked' && (
              <div className="ideas-container">
                {profile.likedIdeas && profile.likedIdeas.length > 0 ? (
                  profile.likedIdeas.map(idea => (
                    <IdeaCard key={idea._id} idea={idea} />
                  ))
                ) : (
                  <div className="no-items-message">いいねしたアイディアはまだありません。</div>
                )}
              </div>
            )}
            
            {activeTab === 'evaluated' && (
              <div className="ideas-container">
                {profile.evaluatedIdeas && profile.evaluatedIdeas.length > 0 ? (
                  profile.evaluatedIdeas.map(idea => (
                    <IdeaCard key={idea._id} idea={idea} />
                  ))
                ) : (
                  <div className="no-items-message">評価したアイディアはまだありません。</div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="profile-edit">
          <div className="profile-header">
            <h1>プロフィール編集</h1>
            <button 
              className="btn btn-secondary"
              onClick={toggleEdit}
            >
              キャンセル
            </button>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="username">ユーザー名</label>
              <input
                type="text"
                id="username"
                name="username"
                value={values.username}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">メールアドレス</label>
              <input
                type="email"
                id="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                disabled // Email can't be changed for security reasons
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="bio">自己紹介</label>
              <textarea
                id="bio"
                name="bio"
                value={values.bio}
                onChange={handleChange}
                rows="4"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="location">場所</label>
              <input
                type="text"
                id="location"
                name="location"
                value={values.location}
                onChange={handleChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="website">ウェブサイト</label>
              <input
                type="url"
                id="website"
                name="website"
                value={values.website}
                onChange={handleChange}
              />
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? '更新中...' : '更新する'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;