// src/admin/AdminOnlyRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

export default function AdminOnlyRoute({ children }) {
    const { isAuthenticated } = useAdminAuth();
    const loc = useLocation();
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace state={{ from: loc }} />;
    }
    // Let backend enforce roles per-endpoint
    return children;
}
