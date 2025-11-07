// src/admin/AdminLoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../api/apiAdmin';
import { useAdminAuth } from './AdminAuthContext';

export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { setToken, setRefreshToken } = useAdminAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await loginAdmin({ username, password });
            // adapt to your payload shape:
            const access = res.data?.accessToken ?? res.data?.token ?? res.data;
            const refresh = res.data?.refreshToken ?? '';
            setToken(access);
            if (refresh) setRefreshToken(refresh);
            navigate('/admin'); // default to admin home (orders)
        } catch (err) {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-violet-950">Admin Login</h2>
                <input className="w-full mb-4 p-3 border rounded" placeholder="Username"
                       value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type="password" className="w-full mb-4 p-3 border rounded" placeholder="Password"
                       value={password} onChange={(e) => setPassword(e.target.value)} />
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <button type="submit" className="w-full bg-violet-950 text-white py-3 rounded hover:bg-violet-800">
                    Login
                </button>
            </form>
        </div>
    );
}
