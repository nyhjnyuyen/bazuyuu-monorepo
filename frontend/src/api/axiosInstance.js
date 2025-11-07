import axios from 'axios';

const baseURL = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8080');

const api = axios.create({ baseURL, withCredentials: true });

api.interceptors.request.use((cfg) => {
    const t = localStorage.getItem('jwt');     // single source of truth
    if (t) (cfg.headers ||= {}).Authorization = `Bearer ${t}`;
    return cfg;
});

api.interceptors.response.use(
    (res) => res,
    async (err) => {
        const cfg = err.config || {};
        const status = err.response?.status;

        // refresh only once
        if ((status !== 401 && status !== 403) || cfg._retry) {
            return Promise.reject(err);
        }

        cfg._retry = true;
        const rt = localStorage.getItem('refreshToken');
        if (!rt) {
            localStorage.removeItem('jwt');
            return Promise.reject(err);
        }

        try {
            const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken: rt });
            const newAccess = data?.accessToken;
            if (!newAccess) throw new Error('no token');
            localStorage.setItem('jwt', newAccess);
            (cfg.headers ||= {}).Authorization = `Bearer ${newAccess}`;
            return api(cfg);
        } catch (e) {
            localStorage.removeItem('jwt'); // force guest mode
            return Promise.reject(err);
        }
    }
);

export default api;
