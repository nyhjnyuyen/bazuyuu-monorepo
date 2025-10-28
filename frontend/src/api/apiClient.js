// src/api/apiClient.js
import axios from 'axios';
import { getApiBaseUrl } from './baseUrl';

const BASE = getApiBaseUrl();               // "/api" in prod, "http://localhost:8080" dev

const apiClient = axios.create({
    baseURL: BASE,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

apiClient.interceptors.request.use((cfg) => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('jwt') : null;
    if (t) (cfg.headers ||= {}).Authorization = `Bearer ${t}`;
    return cfg;
});

apiClient.interceptors.response.use(
    (res) => res,
    async (err) => {
        const cfg = err.config || {};
        if (err.response?.status !== 401 || cfg._retry || (cfg.url || '').includes('/api/auth/refresh')) {
            return Promise.reject(err);
        }
        const rt = localStorage.getItem('refreshToken');
        if (!rt) return Promise.reject(err);

        cfg._retry = true;
        const { data } = await axios.post(`${BASE}/api/auth/refresh`, { refreshToken: rt });
        const newAccess = data?.accessToken;
        if (!newAccess) return Promise.reject(err);

        localStorage.setItem('jwt', newAccess);
        (cfg.headers ||= {}).Authorization = `Bearer ${newAccess}`;
        return apiClient(cfg);
    }
);

export default apiClient;
