// src/api/axios.js
import axios from 'axios';
import { getStoredAuth, clearStoredAuth } from '../utils/authHelpers';

// Smart Base URL: auto-switch between local and production
const baseURL =
  process.env.REACT_APP_API_URL ||         // use .env if available
  (window.location.hostname.includes('localhost')
    ? 'http://localhost:5000/api'          // local dev
    : 'https://scraper-data.onrender.com/api'); // production fallback

console.log('[DEBUG] Axios base URL:', baseURL);

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 15000,
});

// REQUEST INTERCEPTOR: Attach Bearer token
api.interceptors.request.use(
  (config) => {
    const auth = getStoredAuth();
    if (auth?.token) {
      console.log('[DEBUG] Attaching token to headers:', auth.token);
      config.headers.Authorization = `Bearer ${auth.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR: Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const path = window.location.pathname;

    if ((status === 401 || status === 403) && !path.includes('/signin')) {
      console.warn(`[axios] Token possibly expired or rejected.`);

      const isAuthRelated = error.response?.data?.message?.toLowerCase().includes('token') ||
        error.response?.data?.message?.toLowerCase().includes('unauthorized');

      if (isAuthRelated) {
        clearStoredAuth();
        window.location.href = '/signin';
      }
    }

    return Promise.reject(error);
  }
);


export default api;
