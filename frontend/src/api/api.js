import axios from 'axios';

/**
 * Central API configuration for the MusB Diagnostic website.
 * Uses the RELATIVE proxy /api during development (configured in package.json/netlify.toml)
 * and can be overridden by REACT_APP_API_URL in production (Netlify UI).
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for better error handling globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log errors for debugging
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
