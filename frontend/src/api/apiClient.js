// src/api/apiClient.js
import axios from 'axios';
import { getApiBaseUrl } from './baseUrl';

// Resolve base once. In Netlify prod this should be "/api" (proxy).
// In local dev, make getApiBaseUrl() return "http://localhost:8080".
const BASE = (getApiBaseUrl() || '/api').replace(/\/+$/, '');

const apiClient = axios.create({
    baseURL: BASE,               // "/api" or "http://localhost:8080"
    withCredentials: false,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

if (typeof window !== 'undefined') {
    console.log('[API baseURL]', apiClient.defaults.baseURL);
}

// Attach JWT
apiClient.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('jwt');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// One-time refresh on 401
apiClient.interceptors.response.use(
    (res) => res,
    async (err) => {
        const resp = err?.response;
        const cfg  = err?.config || {};
        const is401 = resp?.status === 401;

        // avoid looping refresh requests themselves
        const isRefreshCall = (cfg?.url || '').includes('/api/auth/refresh');
        if (!is401 || cfg._retry || isRefreshCall || typeof window === 'undefined') {
            return Promise.reject(err);
        }

        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) return Promise.reject(err);

        try {
            cfg._retry = true;

            // Build correct absolute or relative refresh URL
            const refreshUrl = `${BASE}/api/auth/refresh`.replace(/\/{2,}/g, '/').replace(':/', '://');

            const r = await axios.post(
                refreshUrl,
                { refreshToken },
                { headers: { 'Content-Type': 'application/json' } }
            );

            const newAccess = r?.data?.accessToken;
            if (!newAccess) return Promise.reject(err);

            localStorage.setItem('jwt', newAccess);

            // replay the original request with new token
            cfg.headers = cfg.headers || {};
            cfg.headers.Authorization = `Bearer ${newAccess}`;
            return apiClient(cfg);
        } catch (e) {
            localStorage.removeItem('jwt');
            localStorage.removeItem('refreshToken');
            return Promise.reject(e);
        }
    }
);

export default apiClient;
