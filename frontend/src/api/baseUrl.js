// src/api/baseUrl.js
export function getApiBaseUrl() {
    const envUrl = (process.env.REACT_APP_API_BASE_URL || '').trim().replace(/\/+$/, '');
    if (envUrl) return envUrl;     // dùng đúng cái đã set, ví dụ '/api'

    // Prod (không set env) -> dùng same-origin proxy '/api'
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        return '';
    }
    // Local dev
    return 'http://localhost:8080';
}
