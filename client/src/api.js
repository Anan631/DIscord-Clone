import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');
export const getChannels = () => api.get('/channels');
export const createChannel = (data) => api.post('/channels', data);
export const getMessages = (channelId) => api.get(`/channels/${channelId}/messages`);

export default api;
