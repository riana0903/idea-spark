import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import '../styles/CommentList.css';

const CommentList = ({ comments }) => {
  if (!comments || comments.length === 0) {
    return <div className="no-comments">まだコメントはありません。</div>;
  }

  return (
    <div className="comment-list">
      {comments.map(comment => (
        <div key={comment._id} className="comment-item">
          <div className="comment-header">
            <img 
              src={comment.userImage || '/default-avatar.png'} 
              alt={comment.userName} 
              className="comment-avatar"
            />
            <div className="comment-user-info">
              <div className="comment-username">{comment.userName}</div>
              <div className="comment-time">
                {formatDistanceToNow(new Date(comment.createdAt), { 
                  addSuffix: true,
                  locale: ja 
                })}
              </div>
            </div>
          </div>
          <div className="comment-content">{comment.content}</div>
        </div>
      ))}
    </div>
  );
};

export default CommentList;