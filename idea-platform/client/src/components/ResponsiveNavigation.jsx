import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/images/logo.svg';

/**
 * ResponsiveNavigation Component
 * 
 * 統合されたナビゲーションシステム：
 * - デスクトップ：ヘッダー + サイドバー
 * - タブレット：ヘッダーのみ（折りたたみメニュー付き）
 * - モバイル：モバイルナビゲーション（下部）
 */
const ResponsiveNavigation = () => {
  const { isAuthenticated, logout, currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  // 画面サイズの変更を監視
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // アクティブリンクの確認
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <>
      {/* ヘッダー (デスクトップとタブレット用) */}
      {!isMobile && (
        <header className="app-header">
          <div className="container">
            <div className="header-content">
              <div className="logo">
                <Link to="/">
                  <img src={logo} alt="Idea Platform" className="logo-image" />
                  <span className="logo-text">Idea Platform</span>
                </Link>
              </div>

              {/* タブレット用メニュートグル */}
              {isTablet && (
                <button 
                  className="menu-toggle"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <span className="menu-icon">☰</span>
                </button>
              )}

              {/* デスクトップ用ナビゲーション */}
              {!isTablet && (
                <nav className="main-nav">
                  <ul>
                    <li><Link to="/">Home</Link></li>
                    {isAuthenticated ? (
                      <>
                        <li><Link to="/ideas/create">Create Idea</Link></li>
                        <li><Link to="/profile">Profile</Link></li>
                        <li><button onClick={handleLogout}>Logout</button></li>
                        <li className="user-greeting">Welcome, {currentUser?.username}</li>
                      </>
                    ) : (
                      <>
                        <li><Link to="/login">Login</Link></li>
                        <li><Link to="/register">Register</Link></li>
                      </>
                    )}
                  </ul>
                </nav>
              )}
            </div>
          </div>
        </header>
      )}

      {/* サイドバー (デスクトップ用、またはタブレットで開いている場合) */}
      {(!isMobile && !isTablet) || (isTablet && sidebarOpen) ? (
        <aside className={`sidebar ${isTablet && sidebarOpen ? 'sidebar-open' : ''}`}>
          {isTablet && (
            <button 
              className="close-sidebar"
              onClick={() => setSidebarOpen(false)}
            >
              ×
            </button>
          )}
          
          {isAuthenticated && (
            <div className="user-info">
              <div className="avatar">
                <span>{currentUser?.username?.charAt(0).toUpperCase()}</span>
              </div>
              <h3>{currentUser?.username}</h3>
            </div>
          )}
          
          <nav className="sidebar-nav">
            <h3>Navigation</h3>
            <ul>
              <li className={isActive('/')}>
                <Link to="/">Dashboard</Link>
              </li>
              
              {isAuthenticated ? (
                <>
                  <li className={isActive('/ideas/create')}>
                    <Link to="/ideas/create">Create New Idea</Link>
                  </li>
                  <li className={isActive('/profile')}>
                    <Link to="/profile">My Profile</Link>
                  </li>
                  <li className={isActive('/my-ideas')}>
                    <Link to="/my-ideas">My Ideas</Link>
                  </li>
                  <li className={isActive('/bookmarks')}>
                    <Link to="/bookmarks">Bookmarked Ideas</Link>
                  </li>
                  <li>
                    <button onClick={handleLogout}>Logout</button>
                  </li>
                </>
              ) : (
                <>
                  <li className={isActive('/login')}>
                    <Link to="/login">Login</Link>
                  </li>
                  <li className={isActive('/register')}>
                    <Link to="/register">Register</Link>
                  </li>
                </>
              )}
            </ul>
          </nav>
          
          <div className="sidebar-section">
            <h3>Categories</h3>
            <ul className="category-list">
              <li><Link to="/category/technology">Technology</Link></li>
              <li><Link to="/category/business">Business</Link></li>
              <li><Link to="/category/education">Education</Link></li>
              <li><Link to="/category/health">Health</Link></li>
              <li><Link to="/category/environment">Environment</Link></li>
              <li><Link to="/category/other">Other</Link></li>
            </ul>
          </div>
          
          <div className="sidebar-footer">
            <p>© {currentYear} Idea Platform</p>
          </div>
        </aside>
      ) : null}

      {/* モバイルナビゲーション (下部) */}
      {isMobile && (
        <nav className="navbar">
          <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
            <i className="nav-icon">🏠</i>
            <span>ホーム</span>
          </Link>
          <Link to="/search" className={location.pathname === '/search' ? 'active' : ''}>
            <i className="nav-icon">🔍</i>
            <span>検索</span>
          </Link>
          <Link to="/ideas/create" className={location.pathname === '/ideas/create' ? 'active' : ''}>
            <i className="nav-icon">➕</i>
            <span>投稿</span>
          </Link>
          <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>
            <i className="nav-icon">👤</i>
            <span>プロフィール</span>
          </Link>
        </nav>
      )}

      {/* フッター (すべてのサイズ) */}
      <footer className="app-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>Idea Platform</h3>
              <p>Share and discover innovative ideas with our community.</p>
            </div>
            
            <div className="footer-section">
              <h3>Links</h3>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Connect</h3>
              <div className="social-links">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {currentYear} Idea Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default ResponsiveNavigation;
