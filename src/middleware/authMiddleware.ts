// src/middleware/authMiddleware.ts
// Middleware to handle authentication for API requests in React (client-side)

import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

// Get tokens from localStorage
function getAuthTokens() {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  return { accessToken, refreshToken };
}

// Set tokens to localStorage
function setAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

// Remove tokens from localStorage
function clearAuthTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

// Axios instance with interceptors
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor to add access token
api.interceptors.request.use(
  (config) => {
    const { accessToken } = getAuthTokens();
    if (accessToken && config.headers) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const { refreshToken } = getAuthTokens();
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data;
          setAuthTokens(newAccessToken, newRefreshToken);
          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          clearAuthTokens();
          window.location.href = '/login';
        }
      } else {
        clearAuthTokens();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export { api, getAuthTokens, setAuthTokens, clearAuthTokens };
