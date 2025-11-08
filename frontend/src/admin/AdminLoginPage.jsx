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
            // adapt these names to your backend response
            const accessToken  = res?.data?.accessToken || res?.data?.token;
            const refreshToken = res?.data?.refreshToken || '';

            if (!accessToken) throw new Error('No token returned');

            // update context (what AdminOnlyRoute actually checks)
            setToken(accessToken);
            if (refreshToken) setRefreshToken(refreshToken);

            // optional: also persist under both keys to be safe
            localStorage.setItem('jwt', accessToken);
            localStorage.setItem('admin_jwt', accessToken);
            localStorage.setItem('admin_token', accessToken);
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

            navigate('/admin/products', { replace: true });
        } catch (err) {
            console.error(err);
            setError('Invalid username or password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-violet-950">Admin Login</h2>
                <input
                    className="w-full mb-4 p-3 border rounded"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    className="w-full mb-4 p-3 border rounded"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <button type="submit" className="w-full bg-violet-950 text-white py-3 rounded hover:bg-violet-800">
                    Login
                </button>
            </form>
        </div>
    );
}
