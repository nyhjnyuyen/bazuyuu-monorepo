// src/admin/AdminNavbar.jsx
import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAdminAuth } from './AdminAuthContext';

export default function AdminNavbar() {
    const nav = useNavigate();
    const { username, isSuperAdmin, logout } = useAdminAuth();

    const base =
        'px-4 py-2 rounded-lg text-sm font-semibold transition';
    const inactive =
        'text-violet-900/80 hover:bg-violet-100';
    const active =
        'bg-violet-900 text-white';

    return (
        <header className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link to="/admin" className="text-xl font-bold text-violet-900">
                        Bazuuyu Admin
                    </Link>

                    <nav className="flex gap-2">
                        <NavLink to="/admin/orders" className={({isActive}) => `${base} ${isActive?active:inactive}`}>Orders</NavLink>
                        <NavLink to="/admin/products" className={({isActive}) => `${base} ${isActive?active:inactive}`}>Products</NavLink>
                        {isSuperAdmin && (
                            <NavLink to="/admin/admins" className={({isActive}) => `${base} ${isActive?active:inactive}`}>Admins</NavLink>
                        )}
                        <a href="/" target="_blank" rel="noreferrer" className={`${base} ${inactive}`}>
                            View Website ↗
                        </a>
                    </nav>
                </div>

                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600"> {username ?? 'Admin'}</span>
                    <button
                        className="px-3 py-1.5 rounded-md border border-violet-900 text-violet-900 hover:bg-violet-50 text-sm"
                        onClick={() => { logout(); nav('/admin/login'); }}
                    >Sign out</button>
                </div>
            </div>
        </header>
    );
}
