// src/services/api.js
import axios from "axios";

const rawBackendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL;
const baseURL = (rawBackendUrl && rawBackendUrl.trim() !== "")
  ? rawBackendUrl.trim().replace(/\/+$/, "")
  : "http://localhost:8080";

const savedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: savedToken ? { Authorization: `Bearer ${savedToken}` } : {},
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token && !config.headers["Authorization"]) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/refresh")
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token) {
              originalRequest.headers["Authorization"] = "Bearer " + token;
            }
            return api(originalRequest);
          })
          .catch(Promise.reject);
      }

      isRefreshing = true;

      try {
        const res = await api.post("/api/user/refresh");
        const { token } = res.data;

        setAuth(token);
        processQueue(null, token);

        originalRequest.headers["Authorization"] = "Bearer " + token;
        return api(originalRequest);
      } catch (err) {
        console.error("🔁 Refresh token failed:", err?.response?.status, err?.response?.data);
        processQueue(err, null);
        clearAuth();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export function setAuth(token = null) {
  if (token) {
    if (typeof window !== "undefined") {
      localStorage.setItem("token", token);
    }
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    delete api.defaults.headers.common["Authorization"];
  }
}

export function clearAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("username");
  }
  delete api.defaults.headers.common["Authorization"];
}

export default api;
