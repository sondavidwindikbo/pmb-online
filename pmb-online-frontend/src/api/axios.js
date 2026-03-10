import axios from "axios";

// ─── Instance utama ───────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor: Otomatis sisipkan token di setiap request ───────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor: Handle error global ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Token expired / tidak valid → paksa logout
    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // Forbidden
    if (status === 403) {
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;