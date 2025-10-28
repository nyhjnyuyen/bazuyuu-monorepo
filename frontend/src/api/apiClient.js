// src/api/apiClient.js
import axios from 'axios';
import { getApiBaseUrl } from './baseUrl';

const apiClient = axios.create({
    baseURL: getApiBaseUrl(),           // => '/api' trên Netlify, 'http://localhost:8080' khi dev
    withCredentials: false,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

if (typeof window !== 'undefined') {
    console.log('[API baseURL]', apiClient.defaults.baseURL);
}

// Gắn JWT vào mọi request
apiClient.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('jwt');
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Tự refresh 1 lần khi 401
apiClient.interceptors.response.use(
    (res) => res,
    async (err) => {
        const resp = err?.response;
        const cfg  = err?.config || {};
        const is401 = resp?.status === 401;
        const alreadyRetried = cfg._retry;

        if (is401 && !alreadyRetried && typeof window !== 'undefined') {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) return Promise.reject(err);

            try {
                cfg._retry = true;

                // 🔧 Tạo URL refresh đúng, không /api/api
                const base = (getApiBaseUrl() || '').replace(/\/+$/, ''); // '' | '/api' | 'http://localhost:8080'
                const refreshUrl = base ? `${base}/api/auth/refresh` : '/api/auth/refresh';

                const r = await axios.post(
                    refreshUrl,
                    { refreshToken },
                    { headers: { 'Content-Type': 'application/json' } }
                );

                const newAccess = r?.data?.accessToken;
                if (!newAccess) return Promise.reject(err);

                localStorage.setItem('jwt', newAccess);
                cfg.headers = cfg.headers || {};
                cfg.headers.Authorization = `Bearer ${newAccess}`;
                return apiClient(cfg); // gọi lại request cũ
            } catch (e) {
                localStorage.removeItem('jwt');
                localStorage.removeItem('refreshToken');
                return Promise.reject(e);
            }
        }

        return Promise.reject(err);
    }
);

export default apiClient;
