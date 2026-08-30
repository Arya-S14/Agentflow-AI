import axios from 'axios';

let rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Auto-sanitize URL: ensure it ends with /api if omitted
if (rawApiUrl && !rawApiUrl.endsWith('/api') && !rawApiUrl.endsWith('/api/')) {
  rawApiUrl = `${rawApiUrl.replace(/\/$/, '')}/api`;
}

const API_BASE = rawApiUrl;

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000, // 30s timeout to account for Render free-tier cold starts
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
