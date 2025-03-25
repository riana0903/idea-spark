// データを保存するための仮想データベース
let ideas = [];
let comments = {};
let currentIdeaId = null;

// DOMが読み込まれたときに実行される初期化関数
document.addEventListener('DOMContentLoaded', function() {
  // モーダルの初期化
  const modalElems = document.querySelectorAll('.modal');
  M.Modal.init(modalElems);

  // イベントリスナーの設定
  document.getElementById('postBtn').addEventListener('click', postIdea);
  document.getElementById('refreshBtn').addEventListener('click', loadIdeas);
  document.getElementById('postCommentBtn').addEventListener('click', postComment);
  
  // 初期データの読み込み
  loadIdeas();
});

// アイデアを投稿する関数
function postIdea() {
  const username = document.getElementById('username').value.trim();
  const content = document.getElementById('newIdea').value.trim();
  const hashtagsInput = document.getElementById('hashtags').value.trim();
  
  // 入力チェック
  if (!username) {
    M.toast({html: 'ユーザー名を入力してください'});
    return;
  }
  
  if (!content) {
    M.toast({html: 'アイデア内容を入力してください'});
    return;
  }
  
  // ハッシュタグを抽出
  const hashtags = hashtagsInput ? extractHashtags(hashtagsInput) : [];
  
  // 新しいアイデアオブジェクトを作成
  const newIdea = {
    id: Date.now().toString(),
    username: username,
    content: content,
    hashtags: hashtags,
    timestamp: new Date().toISOString(),
    likes: 0,
    comments: []
  };
  
  // アイデアをデータベースに追加（この例では単に配列に追加）
  ideas.unshift(newIdea);
  
  // UIの更新
  renderIdeas();
  
  // 入力フォームをクリア
  document.getElementById('newIdea').value = '';
  document.getElementById('hashtags').value = '';
  
  // 成功メッセージを表示
  M.toast({html: 'アイデアを投稿しました！'});
}

// アイデアを読み込む関数
function loadIdeas() {
  // ローディングスピナーを表示
  document.getElementById('loadingSpinner').style.display = 'block';
  
  // 実際のアプリケーションではここでAPIからデータを取得する
  // この例では既存のデータをただ表示するだけ
  setTimeout(() => {
    renderIdeas();
    document.getElementById('loadingSpinner').style.display = 'none';
  }, 500); // ローディングアニメーションを見せるための遅延
}

// アイデアをDOMにレンダリングする関数
function renderIdeas() {
  const container = document.getElementById('ideasContainer');
  container.innerHTML = '';
  
  // すべてのハッシュタグを収集
  const allHashtags = new Set();
  ideas.forEach(idea => {
    idea.hashtags.forEach(tag => allHashtags.add(tag));
  });
  
  // ハッシュタグフィルタを表示
  renderHashtagFilter(Array.from(allHashtags));
  
  // 各アイデアをレンダリング
  ideas.forEach(idea => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-content">
        <span class="card-title">${escapeHtml(idea.username)}</span>
        <p>${escapeHtml(idea.content)}</p>
        <div class="chip-container">
          ${idea.hashtags.map(tag => `<div class="chip">${escapeHtml(tag)}</div>`).join('')}
        </div>
        <div class="idea-meta">
          ${formatDate(idea.timestamp)}
        </div>
      </div>
      <div class="card-action">
        <div class="idea-actions">
          <a href="#" class="like-btn" data-id="${idea.id}">
            <i class="material-icons">thumb_up</i> ${idea.likes}
          </a>
          <a href="#" class="comment-btn" data-id="${idea.id}">
            <i class="material-icons">comment</i> ${idea.comments.length}
          </a>
        </div>
      </div>
    `;
    
    container.appendChild(card);
    
    // いいねボタンのイベントリスナー
    card.querySelector('.like-btn').addEventListener('click', function(e) {
      e.preventDefault();
      likeIdea(idea.id);
    });
    
    // コメントボタンのイベントリスナー
    card.querySelector('.comment-btn').addEventListener('click', function(e) {
      e.preventDefault();
      openCommentModal(idea.id);
    });
  });
}

// ハッシュタグフィルタをレンダリングする関数
function renderHashtagFilter(hashtags) {
  const container = document.getElementById('hashtagsFilter');
  container.innerHTML = '';
  
  hashtags.forEach(tag => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.textContent = tag;
    chip.addEventListener('click', () => filterIdeasByHashtag(tag));
    container.appendChild(chip);
  });
}

function filterIdeasByHashtag(tag) {
  document.getElementById('loadingSpinner').style.display = 'block';
  
  setTimeout(() => {
    const filteredIdeas = ideas.filter(idea => idea.hashtags.includes(tag));
    const container = document.getElementById('ideasContainer');
    container.innerHTML = '';
    
    filteredIdeas.forEach(idea => {
      // ここにrenderIdeas関数内のアイデアレンダリングコードと同様のコードを実装
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-content">
          <span class="card-title">${escapeHtml(idea.username)}</span>
          <p>${escapeHtml(idea.content)}</p>
          <div class="chip-container">
            ${idea.hashtags.map(tag => `<div class="chip">${escapeHtml(tag)}</div>`).join('')}
          </div>
          <div class="idea-meta">
            ${formatDate(idea.timestamp)}
          </div>
        </div>
        <div class="card-action">
          <div class="idea-actions">
            <a href="#" class="like-btn" data-id="${idea.id}">
              <i class="material-icons">thumb_up</i> ${idea.likes}
            </a>
            <a href="#" class="comment-btn" data-id="${idea.id}">
              <i class="material-icons">comment</i> ${idea.comments.length}
            </a>
          </div>
        </div>
      `;
      
      container.appendChild(card);
      
      // いいねボタンのイベントリスナー
      card.querySelector('.like-btn').addEventListener('click', function(e) {
        e.preventDefault();
        likeIdea(idea.id);
      });
      
      // コメントボタンのイベントリスナー
      card.querySelector('.comment-btn').addEventListener('click', function(e) {
        e.preventDefault();
        openCommentModal(idea.id);
      });
    });
    
    document.getElementById('loadingSpinner').style.display = 'none';
  }, 300);
}

// いいねを追加する関数
function likeIdea(ideaId) {
  const idea = ideas.find(i => i.id === ideaId);
  if (idea) {
    idea.likes++;
    renderIdeas();
  }
}

// コメントモーダルを開く関数
function openCommentModal(ideaId) {
  currentIdeaId = ideaId;
  
  // 現在のアイデアに関連するコメントを表示
  const idea = ideas.find(i => i.id === ideaId);
  if (idea) {
    renderComments(idea.comments);
    
    // モーダルを開く
    const commentModal = M.Modal.getInstance(document.getElementById('commentModal'));
    commentModal.open();
  }
}

// コメントを表示する関数
function renderComments(comments) {
  const container = document.getElementById('commentsList');
  container.innerHTML = '';
  
  if (comments.length === 0) {
    container.innerHTML = '<p>まだコメントはありません。</p>';
    return;
  }
  
  comments.forEach(comment => {
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.innerHTML = `
      <strong>${escapeHtml(comment.username)}</strong>
      <p>${escapeHtml(comment.content)}</p>
      <small>${formatDate(comment.timestamp)}</small>
    `;
    container.appendChild(commentElement);
  });
}

// コメントを投稿する関数
function postComment() {
  const username = document.getElementById('commentUsername').value.trim();
  const content = document.getElementById('newComment').value.trim();
  
  // 入力チェック
  if (!username) {
    M.toast({html: 'ユーザー名を入力してください'});
    return;
  }
  
  if (!content) {
    M.toast({html: 'コメント内容を入力してください'});
    return;
  }
  
  // 新しいコメントオブジェクトを作成
  const newComment = {
    id: Date.now().toString(),
    username: username,
    content: content,
    timestamp: new Date().toISOString()
  };
  
  // 現在のアイデアにコメントを追加
  const idea = ideas.find(i => i.id === currentIdeaId);
  if (idea) {
    idea.comments.push(newComment);
    
    // コメント一覧を更新
    renderComments(idea.comments);
    
    // 入力フォームをクリア
    document.getElementById('newComment').value = '';
    
    // 成功メッセージを表示
    M.toast({html: 'コメントを投稿しました！'});
  }
}

// ユーティリティ関数
function extractHashtags(text) {
  const regex = /#[\w-]+/g;
  const matches = text.match(regex) || [];
  return matches;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('ja-JP');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
