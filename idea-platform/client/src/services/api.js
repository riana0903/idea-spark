// Consolidated API Service
import axios from 'axios';

// Set up API URL with environment variable fallback
const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Support both token header formats
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth services
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
  logout: () => {
    localStorage.removeItem('token');
    return Promise.resolve();
  },
  loginUser: (credentials) => api.post('/users/login', credentials),
  registerUser: (userData) => api.post('/users/register', userData),
  getCurrentUser: () => api.get('/users/me')
};

// User services
export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
  getUser: () => api.get('/users/me'),
  updateUser: (profileData) => api.put('/users/me', profileData),
  getUserIdeas: (userId) => api.get(`/users/${userId}/ideas`),
  getUserOwnIdeas: () => api.get('/users/ideas')
};

// Ideas services
export const ideaService = {
  // Basic CRUD operations
  getAll: (page = 1, limit = 10) => api.get(`/ideas?page=${page}&limit=${limit}`),
  getById: (id) => api.get(`/ideas/${id}`),
  create: (ideaData) => api.post('/ideas', ideaData),
  update: (id, ideaData) => api.put(`/ideas/${id}`, ideaData),
  delete: (id) => api.delete(`/ideas/${id}`),
  
  // Extended features
  like: (ideaId) => api.post(`/ideas/${ideaId}/like`),
  unlike: (ideaId) => api.delete(`/ideas/${ideaId}/like`),
  addComment: (ideaId, commentData) => api.post(`/ideas/${ideaId}/comment`, commentData),
  addCommentNew: (ideaId, commentData) => api.post(`/ideas/${ideaId}/comments`, commentData),
  evaluate: (ideaId, evaluationData) => api.post(`/ideas/${ideaId}/evaluate`, evaluationData),
  createBranch: (ideaId, branchData) => api.post(`/ideas/${ideaId}/branch`, branchData),
  
  // Search related
  search: (query) => api.get(`/ideas/search?query=${encodeURIComponent(query)}`),
  searchByTag: (tag) => api.get(`/ideas/search?tag=${encodeURIComponent(tag)}`),
  searchByCategory: (category) => api.get(`/ideas/search?category=${encodeURIComponent(category)}`),
  searchAdvanced: ({ query, tag }) => {
    let params = {};
    if (query) params.q = query;
    if (tag) params.tag = tag;
    return api.get('/ideas/search', { params });
  },
  getCategories: () => api.get('/categories'),
  getTags: () => api.get('/tags')
};

// Individual methods (kept for backward compatibility)
export const fetchIdeas = (page = 1, limit = 10) => {
  return api.get(`/ideas?page=${page}&limit=${limit}`);
};

export const fetchIdeaById = (ideaId) => {
  return api.get(`/ideas/${ideaId}`);
};

export const createIdea = (ideaData) => {
  return api.post('/ideas', ideaData);
};

export const likeIdea = (ideaId) => {
  return api.post(`/ideas/${ideaId}/like`);
};

export const addComment = (ideaId, commentData) => {
  return api.post(`/ideas/${ideaId}/comment`, commentData);
};

export const evaluateIdea = (ideaId, evaluationData) => {
  return api.post(`/ideas/${ideaId}/evaluate`, evaluationData);
};

export const searchIdeas = (queryOrOptions) => {
  if (typeof queryOrOptions === 'string') {
    return api.get(`/ideas/search?q=${encodeURIComponent(queryOrOptions)}`);
  } else {
    let { query, tag } = queryOrOptions;
    let params = {};
    if (query) params.q = query;
    if (tag) params.tag = tag;
    return api.get('/ideas/search', { params });
  }
};

export const searchByTag = (tag) => {
  return api.get(`/ideas/search?tag=${encodeURIComponent(tag)}`);
};

export const registerUser = (userData) => {
  return api.post('/users/register', userData);
};

export const loginUser = (credentials) => {
  return api.post('/users/login', credentials);
};

export const login = (credentials) => {
  return api.post('/auth/login', credentials);
};

export const register = (userData) => {
  return api.post('/auth/register', userData);
};

export const logout = () => {
  localStorage.removeItem('token');
  return Promise.resolve();
};

export const getCurrentUser = () => {
  return api.get('/users/me');
};

export const getUserProfile = () => {
  return api.get('/users/profile');
};

export const updateProfile = (profileData) => {
  return api.put('/users/me', profileData);
};

export const updateUserProfile = (profileData) => {
  return api.put('/users/profile', profileData);
};

export const getUserIdeas = (userId) => {
  if (userId) {
    return api.get(`/users/${userId}/ideas`);
  } else {
    return api.get('/users/ideas');
  }
};

export default api;