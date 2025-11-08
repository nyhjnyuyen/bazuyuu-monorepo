// src/admin/AdminLogout.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

export default function AdminLogout() {
    const { logout } = useAdminAuth();
    const navigate = useNavigate();
    useEffect(() => {
        logout();
        navigate('/admin/login', { replace: true });
    }, [logout, navigate]);
    return null;
}
