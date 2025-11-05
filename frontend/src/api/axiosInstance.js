// frontend/src/api/axiosInstance.js
import axios from 'axios';
import { ensureFreshJwtOrLogout } from './auth';

const baseURL =
    process.env.REACT_APP_API_BASE_URL ||
    (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:8080');

const api = axios.create({ baseURL, withCredentials: true });

api.interceptors.request.use((cfg) => {
    const token = ensureFreshJwtOrLogout(); // removes invalid token
    if (token) (cfg.headers ||= {}).Authorization = `Bearer ${token}`;
    return cfg;
});

export default api;
