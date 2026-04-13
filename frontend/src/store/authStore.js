import { create } from 'zustand';
import apiClient from '../api/client';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    const { user, accessToken, refreshToken } = response.data.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, isAuthenticated: true });
    
    return user;
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    const { user, accessToken, refreshToken } = response.data.data;
    
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, isAuthenticated: true });
    
    return user;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      await apiClient.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const response = await apiClient.get('/me');
      set({ user: response.data.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

export default useAuthStore;
