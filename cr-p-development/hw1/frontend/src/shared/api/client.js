import axios from 'axios';

export const authClient = axios.create({ baseURL: '/api/auth' });

export const dataClient = axios.create({ baseURL: '/api/data' });

dataClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
