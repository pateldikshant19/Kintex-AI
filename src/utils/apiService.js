import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
    config.headers['x-auth-token'] = token;
  }
  return config;
}, (error) => Promise.reject(error));

export const apiService = {
  // Generic HTTP methods
  get: (url, config) => apiClient.get(url, config),
  post: (url, data, config) => apiClient.post(url, data, config),
  put: (url, data, config) => apiClient.put(url, data, config),
  patch: (url, data, config) => apiClient.patch(url, data, config),
  delete: (url, config) => apiClient.delete(url, config),

  // Players
  getPlayers: () => apiClient.get('/players'),
  getPlayer: (id) => apiClient.get(`/players/${id}`),
  createPlayer: (data) => apiClient.post('/players', data),
  updatePlayer: (id, data) => apiClient.put(`/players/${id}`, data),
  deletePlayer: (id) => apiClient.delete(`/players/${id}`),

  // Analytics
  getAnalytics: () => apiClient.get('/analytics'),
  getPlayerStats: (id) => apiClient.get(`/analytics/player/${id}`),
  getTeamStats: () => apiClient.get('/analytics/team'),

  // Dashboard
  getDashboardData: () => apiClient.get('/dashboard'),

  // Public
  getLiveMatches: () => apiClient.get('/public/matches'),
};

export default apiService;