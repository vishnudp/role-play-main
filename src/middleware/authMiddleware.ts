// src/middleware/authMiddleware.ts

import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";
import { toast } from "sonner";

/* =========================
   Token Helpers
========================= */

function getAuthTokens() {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");
  return { accessToken, refreshToken };
}

function setAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
}

function clearAuthTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

/* =========================
   Axios Instance
========================= */

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/* =========================
   Request Interceptor
========================= */

api.interceptors.request.use(
  (config) => {
    const { accessToken } = getAuthTokens();
    if (accessToken && config.headers) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   Response Interceptor
========================= */

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const backendMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Something went wrong";

    /* =========================
       Handle 401 - Token Expired
    ========================= */
    if (status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;

      const { refreshToken } = getAuthTokens();

      if (!refreshToken) {
        clearAuthTokens();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        } = res.data;

        setAuthTokens(newAccessToken, newRefreshToken);
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearAuthTokens();
        toast.error("Session expired. Please login again.");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    /* =========================
       Handle 403 - Permission Error
    ========================= */
    if (status === 403) {
      toast.error(
        backendMessage ||
          "You don't have permission to perform this action."
      );
      return Promise.reject(error);
    }

    /* =========================
       Handle 500 - Internal Server Error
    ========================= */
    if (status === 500) {
      toast.error(
        backendMessage || "Internal Server Error. Please try again later."
      );
      return Promise.reject(error);
    }

    /* =========================
       Handle Other Errors (400-499)
    ========================= */
    if (status >= 400) {
      toast.error(backendMessage);
    }

    return Promise.reject(error);
  }
);

export { api, getAuthTokens, setAuthTokens, clearAuthTokens };