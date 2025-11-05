// src/api/authApi.js
import apiClient from '../api/axiosInstance';

export async function login(username, password) {
    const { data } = await apiClient.post('/auth/customer/login', { username, password });
    localStorage.setItem('jwt', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data;
}
