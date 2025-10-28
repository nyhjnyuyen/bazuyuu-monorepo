// src/api/baseUrl.js
export function getApiBaseUrl() {
    const env = (process.env.REACT_APP_API_BASE_URL || '').trim().replace(/\/+$/, '');
    if (env) return env;                       // Netlify => "/api"
    // local dev only:
    return window?.location?.hostname === 'localhost'
        ? 'http://localhost:8080'
        : '/api';
}
