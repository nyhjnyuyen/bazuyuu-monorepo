import axios from 'axios';
import { getApiBaseUrl } from './baseUrl';

// src/api/apiClient.js (or wherever this file is)
const apiClient = axios.create({
    baseURL: getApiBaseUrl(),
    withCredentials: false,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

if (typeof window !== 'undefined') {
    console.log('[API baseURL]', apiClient.defaults.baseURL);
}


// Attach JWT if present (guard against SSR/build)
apiClient.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('jwt');
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Refresh token once on 401, then retry original request
apiClient.interceptors.response.use(
    (res) => res,
    async (err) => {
        const resp = err?.response;
        const cfg = err?.config || {};
        const is401 = resp?.status === 401;
        const alreadyRetried = cfg._retry;

        if (is401 && !alreadyRetried && typeof window !== 'undefined') {
            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) return Promise.reject(err);

            try {
                cfg._retry = true;
                const r = await axios.post(
                    // call absolute URL for refresh to avoid intercept loop if baseURL changes
                    `${getApiBaseUrl().replace(/\/$/, '')}/auth/refresh`,
                    { refreshToken },
                    { headers: { 'Content-Type': 'application/json' } }
                );

                const newAccess = r?.data?.accessToken;
                if (!newAccess) return Promise.reject(err);

                localStorage.setItem('jwt', newAccess);
                cfg.headers = cfg.headers || {};
                cfg.headers.Authorization = `Bearer ${newAccess}`;
                return apiClient(cfg);
            } catch (e) {
                // wipe tokens on refresh failure
                localStorage.removeItem('jwt');
                localStorage.removeItem('refreshToken');
                return Promise.reject(e);
            }
        }

        return Promise.reject(err);
    }
);

export default apiClient;
