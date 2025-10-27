// src/api/baseUrl.js  (CRA only)
export function getApiBaseUrl() {
    // Lấy từ env của CRA (đặt trên Netlify)
    const envUrl = (process.env.REACT_APP_API_BASE_URL || '')
        .trim()
        .replace(/\/+$/, '');

    if (envUrl) return envUrl;          // dùng Cloud Run URL khi có env

    // Production không có env → dùng same-origin (cần proxy /api/* trên Netlify)
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        return '';                        // same-origin
    }

    // Local dev
    return 'http://localhost:8080';
}
