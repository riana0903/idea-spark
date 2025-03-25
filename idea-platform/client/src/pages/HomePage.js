// client/src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import { ideaService } from '../services/api';
import './HomePage.css'; // CSSファイルをインポート

const HomePage = () => {
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const response = await ideaService.getAll();
        setIdeas(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch ideas:", error);
        setLoading(false);
      }
    };

    fetchIdeas();
  }, []);

  if (loading) return <div className="loading">Loading...</div>; // loadingクラスを追加

  return (
    <div className="home-page">
      <h1>Ideas Platform</h1>
      <div className="ideas-container"> {/* ideas-listからideas-containerに変更 */}
        {ideas.length === 0 ? (
          <p>No ideas found. Create your first idea!</p>
        ) : (
          ideas.map(idea => (
            <div key={idea._id} className="idea-card">
              <h2>{idea.title}</h2>
              <p>{idea.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HomePage;