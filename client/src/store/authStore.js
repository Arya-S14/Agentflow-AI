import { create } from 'zustand';
import api from '../services/api';

export const useAuthStore = create((set) => ({
  user: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('agentflow_user') || 'null') : null,
  token: typeof window !== 'undefined' ? localStorage.getItem('agentflow_token') || null : null,
  isAuthenticated: typeof window !== 'undefined' ? Boolean(localStorage.getItem('agentflow_token')) : false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('agentflow_token', token);
        localStorage.setItem('agentflow_user', JSON.stringify(user));
      }
      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Login failed';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  register: async (name, email, password, role) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      const { user, token } = res.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('agentflow_token', token);
        localStorage.setItem('agentflow_user', JSON.stringify(user));
      }
      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Registration failed';
      set({ error: msg, isLoading: false });
      return { success: false, error: msg };
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('agentflow_token');
      localStorage.removeItem('agentflow_user');
    }
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  fetchMe: async () => {
    try {
      const res = await api.get('/auth/me');
      const { user } = res.data;
      if (typeof window !== 'undefined') {
        localStorage.setItem('agentflow_user', JSON.stringify(user));
      }
      set({ user, isAuthenticated: true });
    } catch (err) {
      // Keep session if dev fallback
    }
  },
}));
