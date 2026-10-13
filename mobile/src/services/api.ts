/**
 * AI INTERVIEW COACH - MOBILE AXIOS API CLIENT
 * Supports dynamic backend URL configuration (LAN IP / Emulator / Hosted),
 * SecureStore JWT auth token interceptor, and typed responses.
 */
import axios, { AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

// Set default fallback to relative /api or custom process.env
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';

const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 45000, // 45s to accommodate AI question generation & answer evaluation
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer Token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('user_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn('Unable to read token from SecureStore:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Graceful Error Handling & Token Expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await SecureStore.deleteItemAsync('user_token');
    }
    return Promise.reject(error);
  }
);

export default api;
