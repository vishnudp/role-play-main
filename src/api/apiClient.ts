// src/api/apiClient.ts
// Centralized API CRUD handler using the authentication middleware

import { api } from '../middleware/authMiddleware';

// Generic CRUD operations
export const apiClient = {
  get: (url: string, config = {}) => api.get(url, config),
  post: (url: string, data: any, config = {}) => api.post(url, data, config),
  put: (url: string, data: any, config = {}) => api.put(url, data, config),
  patch: (url: string, data: any, config = {}) => api.patch(url, data, config),
  delete: (url: string, config = {}) => api.delete(url, config),
};

// Example: login function
export async function login(email: string, password: string) {
  const response = await api.post('/auth/login', { email, password });
  const { access_token, refresh_token, user } = response.data.data || {};
  if (access_token && refresh_token) {
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('refreshToken', refresh_token);
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }
  return response.data;
}

// Example: logout function
export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}
