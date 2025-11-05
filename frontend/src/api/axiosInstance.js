// frontend/src/api/axiosInstance.js
import axios from 'axios';

const baseURL =
    process.env.REACT_APP_API_BASE_URL
    // In Netlify prod, use the redirect /api -> Cloud Run (see your netlify.toml)
    || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8080');

const api = axios.create({
    baseURL,
    withCredentials: true, // so cookies/credentials flow if you need them
});

// Attach JWT automatically when present
api.interceptors.request.use((cfg) => {
    const token = localStorage.getItem('jwt');
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

export default api;
