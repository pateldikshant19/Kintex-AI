import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
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
};

export default apiService;