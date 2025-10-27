// src/api/baseUrl.js
export function getApiBaseUrl() {
    const cra =
        typeof process !== 'undefined' && process.env
            ? process.env.REACT_APP_API_BASE_URL
            : undefined;

    const envUrl = (vite || cra || '').replace(/\/+$/, '');

    // If an env var exists, use it
    if (envUrl) return envUrl;

    // In production (Netlify, not localhost), use site-relative base.
    // Then every request to /api/... is proxied by your netlify.toml.
    return window?.location?.hostname !== 'localhost' ? '' : 'http://localhost:8080';
}
