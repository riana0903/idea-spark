import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import IdeaCard from '../components/IdeaCard';
import SearchHeader from '../components/SearchHeader';
import { searchIdeas } from '../services/api';
import '../styles/SearchPage.css';

const SearchPage = () => {
  const location = useLocation();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTag, setSearchTag] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const query = queryParams.get('q');
    const tag = queryParams.get('tag');
    
    setSearchQuery(query || '');
    setSearchTag(tag || '');
    
    const performSearch = async () => {
      setLoading(true);
      
      try {
        const response = await searchIdeas({ query, tag });
        setSearchResults(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Search failed:', error);
        setLoading(false);
      }
    };

    if (query || tag) {
      performSearch();
    } else {
      setLoading(false);
    }
  }, [location.search]);

  return (
    <div className="search-page">
      <SearchHeader initialQuery={searchQuery || searchTag} />
      
      <div className="search-results-header">
        {searchQuery && <h2>検索結果: "{searchQuery}"</h2>}
        {searchTag && <h2>ハッシュタグ: #{searchTag}</h2>}
      </div>
      
      {loading ? (
        <div className="loading">検索中...</div>
      ) : (
        <div className="search-results">
          {searchResults.length > 0 ? (
            searchResults.map(idea => (
              <IdeaCard key={idea._id} idea={idea} />
            ))
          ) : (
            <div className="no-results">
              {searchQuery || searchTag ? (
                <p>検索条件に一致するアイディアが見つかりませんでした。</p>
              ) : (
                <p>検索キーワードまたはハッシュタグを入力してください。</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;