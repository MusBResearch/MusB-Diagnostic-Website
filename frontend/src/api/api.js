import axios from 'axios';

/**
 * Bulletproof API instance for MusB Diagnostic.
 * Handles both Netlify Proxy (/api) and Direct Render URL (via env var).
 */
const getBaseURL = () => {
  // Use the Netlify environment variable (prefixed for React)
  let url = process.env.REACT_APP_API_URL || '';
  
  // Strip trailing slashes to avoid //api/... double-slashing
  return url.replace(/\/$/, '');
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 60000, // 60 second timeout for Render cold boots
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for production debugging
api.interceptors.request.use((config) => {
  console.log(`🌐 [API Request] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMsg = error.response?.data?.error || error.response?.data?.detail || error.message;
    console.error('❌ [API Error]', {
      url: error.config?.url,
      status: error.response?.status,
      message: errorMsg
    });
    return Promise.reject(error);
  }
);

export default api;
