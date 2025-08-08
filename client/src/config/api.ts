// API Configuration for different environments
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? window.location.origin 
  : 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/auth/login`,
  REGISTER: `${API_BASE_URL}/api/auth/register`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  ME: `${API_BASE_URL}/api/auth/me`,
  REFRESH: `${API_BASE_URL}/api/auth/refresh`,
  PROFILE: `${API_BASE_URL}/api/auth/profile`,
  
  // Posts endpoints
  POSTS: `${API_BASE_URL}/api/posts`,
  POST_BY_ID: (id: string) => `${API_BASE_URL}/api/posts/${id}`,
  POST_LIKE: (id: string) => `${API_BASE_URL}/api/posts/${id}/like`,
  POST_COMMENTS: (id: string) => `${API_BASE_URL}/api/posts/${id}/comments`,
  USER_POSTS: (username: string) => `${API_BASE_URL}/api/posts/user/${username}`,
  
  // Notifications endpoints
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,
  NOTIFICATION_READ: (id: string) => `${API_BASE_URL}/api/notifications/${id}/read`,
  NOTIFICATION_DELETE: (id: string) => `${API_BASE_URL}/api/notifications/${id}`,
  MARK_ALL_READ: `${API_BASE_URL}/api/notifications/mark-all-read`,
  
  // Upload endpoints
  UPLOAD: `${API_BASE_URL}/api/upload`,
  UPLOAD_DELETE: `${API_BASE_URL}/api/upload/delete`,
  
  // Health check
  HEALTH: `${API_BASE_URL}/api/health`,
};

export default API_BASE_URL;
