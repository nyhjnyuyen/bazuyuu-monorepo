// src/admin/AdminOnlyRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

export default function AdminOnlyRoute({ children }) {
    const { isAuthenticated, isAdmin } = useAdminAuth();
    if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />; // or show 403 page
    return children;
}
