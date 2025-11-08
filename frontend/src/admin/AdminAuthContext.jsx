// src/admin/AdminAuthContext.js
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AdminAuthContext = createContext(null);
export const useAdminAuth = () => useContext(AdminAuthContext);

function decodeJwt(token) {
    try {
        const [_, payload] = String(token).split('.');
        return payload ? JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))) : null;
    } catch {
        return null;
    }
}

export function AdminAuthProvider({ children }) {
    // read either key so a previous session still works
    const initialToken =
        localStorage.getItem('admin_jwt') || localStorage.getItem('admin_token') || '';

    const [token, setToken] = useState(initialToken);
    const [refreshToken, setRefreshToken] = useState(localStorage.getItem('admin_refresh') || '');

    const claims = useMemo(() => (token ? decodeJwt(token) : null), [token]);
    const role =
        (claims && typeof claims.role === 'string' && claims.role) ||
        (claims && Array.isArray(claims.authorities) && String(claims.authorities[0])) ||
        null;

    const isAuthenticated = Boolean(token);
    const isSuperAdmin = role === 'SUPER_ADMIN';
    const isAdmin = isSuperAdmin || role === 'ADMIN';

    useEffect(() => {
        if (token) {
            localStorage.setItem('admin_jwt', token);
            localStorage.setItem('admin_token', token);
        } else {
            localStorage.removeItem('admin_jwt');
            localStorage.removeItem('admin_token');
        }
    }, [token]);

    useEffect(() => {
        if (refreshToken) localStorage.setItem('admin_refresh', refreshToken);
        else localStorage.removeItem('admin_refresh');
    }, [refreshToken]);

    const logout = () => {
        setToken('');
        setRefreshToken('');
    };

    return (
        <AdminAuthContext.Provider
            value={{ token, setToken, refreshToken, setRefreshToken, isAuthenticated, isAdmin, isSuperAdmin, logout }}
        >
            {children}
        </AdminAuthContext.Provider>
    );
}
