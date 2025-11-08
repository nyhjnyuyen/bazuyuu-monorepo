// src/admin/AdminNavbar.jsx
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

export default function AdminNavbar() {
    const { logout } = useAdminAuth();
    const navigate = useNavigate();

    return (
        <header className="flex items-center justify-between p-4 border-b bg-white">
            <nav className="flex gap-4">
                <NavLink to="/admin/orders">Orders</NavLink>
                <NavLink to="/admin/products">Products</NavLink>
                <NavLink to="/admin/admins">Admins</NavLink>
                <a href="/" target="_blank" rel="noreferrer">View site</a>
            </nav>
            <button onClick={() => navigate('/admin/logout')}>Logout</button>
</header>
    );
}
