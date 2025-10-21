// src/api/baseUrl.js
export function getApiBaseUrl() {
    // Vite (Netlify supports this if you're using Vite)
    const vite = typeof import.meta !== 'undefined' && import.meta.env
        ? import.meta.env.VITE_API_BASE_URL
        : undefined;

    // CRA / Webpack
    const cra = typeof process !== 'undefined' && process.env
        ? process.env.REACT_APP_API_BASE_URL
        : undefined;

    return vite || cra || 'http://localhost:8080';
}

