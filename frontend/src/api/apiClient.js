// src/api/apiClient.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});
// attach JWT to every request if present
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('jwt');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
});

apiClient.interceptors.response.use(
    res => res,
    async (err) => {
        if (err.response.status === 401 && !err.config._retry) {
            err.config._retry = true;
            const res = await apiClient.post('/auth/refresh', {
                refreshToken: localStorage.getItem('refreshToken')
            });
            localStorage.setItem('jwt', res.data.accessToken);
            err.config.headers['Authorization'] = 'Bearer ' + res.data.accessToken;
            return apiClient(err.config);
        }
        return Promise.reject(err);
    }
);


export default apiClient;