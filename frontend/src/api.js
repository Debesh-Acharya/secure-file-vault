import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1/users',
  withCredentials: true, // allows sending cookies (refresh tokens etc.)
});

// ✅ Attach token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error?.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default api;
