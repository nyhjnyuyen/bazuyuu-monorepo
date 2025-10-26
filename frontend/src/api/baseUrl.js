// src/api/baseUrl.js
export function getApiBaseUrl() {
    const vite =
        typeof import.meta !== 'undefined' && import.meta.env
            ? import.meta.env.VITE_API_BASE_URL
            : undefined;

    const cra =
        typeof process !== 'undefined' && process.env
            ? process.env.REACT_APP_API_BASE_URL
            : undefined;

    const envUrl = (vite || cra || '').replace(/\/+$/, '');

    // If an env var exists, use it
    if (envUrl) return envUrl;

    // In production (Netlify, not localhost), use site-relative base.
    // Then every request to /api/... is proxied by your netlify.toml.
    if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
        return '/';
    }

    // Local dev fallback
    return 'http://localhost:8080';
}
