import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AdminAuthContext = createContext(null);
export const useAdminAuth = () => useContext(AdminAuthContext);

// Decode a JWT payload safely
function decodeJwt(token) {
    try {
        const parts = String(token).split('.');
        if (parts.length < 2) return null;
        const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function AdminAuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem('admin_jwt') || '');
    const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem('admin_refresh') || '');

    const claims = useMemo(() => (token ? decodeJwt(token) : null), [token]);

    // role extraction with guards
    const role =
        (claims && typeof claims.role === 'string' && claims.role) ||
        (claims && Array.isArray(claims.authorities) && String(claims.authorities[0])) ||
        null;

    const username =
        (claims && (claims.sub || claims.username)) || null;

    const isAuthenticated = Boolean(token);
    const isSuperAdmin = role === 'SUPER_ADMIN';
    const isAdmin = isSuperAdmin || role === 'ADMIN';

    // persist tokens (coerce to string to satisfy strict linters)
    useEffect(() => {
        if (token) localStorage.setItem('admin_jwt', String(token));
        else localStorage.removeItem('admin_jwt');
    }, [token]);

    useEffect(() => {
        if (refreshToken) localStorage.setItem('admin_refresh', String(refreshToken));
        else localStorage.removeItem('admin_refresh');
    }, [refreshToken]);

    const value = {
        token, setToken,
        refreshToken, setRefreshToken,
        role, username,
        isAuthenticated, isAdmin, isSuperAdmin,
        logout: () => { setToken(''); setRefreshToken(''); },
    };

    return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}
