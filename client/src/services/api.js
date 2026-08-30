import axios from 'axios';

let rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').trim();

// Strip trailing slashes
rawApiUrl = rawApiUrl.replace(/\/+$/, '');

// If user accidentally included /auth or /auth/ at the end, strip it
if (rawApiUrl.endsWith('/auth')) {
  rawApiUrl = rawApiUrl.slice(0, -5);
}

// Ensure base URL ends with /api
if (!rawApiUrl.endsWith('/api')) {
  rawApiUrl = `${rawApiUrl}/api`;
}

const API_BASE = rawApiUrl;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000, // 60s timeout to account for Render free-tier cold starts
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('agentflow_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('agentflow_token');
        localStorage.removeItem('agentflow_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
