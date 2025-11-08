// src/api/axiosInstance.js
import axios from 'axios';

const isProd = process.env.NODE_ENV === 'production';
const baseURL =
    process.env.REACT_APP_API_BASE_URL ||
    (isProd ? '/api' : 'http://localhost:8080/api');

const apiClient = axios.create({ baseURL, withCredentials: true });

// Decide which token to send based on the request path
function pickToken(url) {
    const u = typeof url === 'string' ? url : url?.url || '';
    // All admin APIs live under /admins -> use admin token
    if (u.startsWith('/admins')) {
        return (
            localStorage.getItem('admin_jwt') ||
            localStorage.getItem('admin_token') ||
            null
        );
    }
    // Everything else (customer/protected user APIs)
    return (
        localStorage.getItem('jwt') ||
        localStorage.getItem('customer_jwt') ||
        localStorage.getItem('token') ||
        null
    );
}

apiClient.interceptors.request.use((cfg) => {
    const token = pickToken(cfg.url);
    if (token) {
        cfg.headers = cfg.headers || {};
        cfg.headers.Authorization = `Bearer ${token}`;
    } else if (cfg.url?.startsWith('/admins') && cfg.headers?.Authorization) {
        // Never leak a customer token to admin endpoints
        delete cfg.headers.Authorization;
    }
    return cfg;
});

// Keep response handling simple unless you really have a refresh endpoint
apiClient.interceptors.response.use(
    (res) => res,
    (err) => Promise.reject(err)
);

export default apiClient;
