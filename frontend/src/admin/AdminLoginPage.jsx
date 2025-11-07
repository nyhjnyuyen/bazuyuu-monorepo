import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../api/apiAdmin';
import { useAdminAuth } from './AdminAuthContext';

export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setToken, setRefreshToken } = useAdminAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await loginAdmin({ username, password });
            // tolerate different API shapes
            const accessToken =
                res?.data?.accessToken || res?.data?.token || res?.data?.access_token;
            const refreshToken =
                res?.data?.refreshToken || res?.data?.refresh_token || null;

            if (!accessToken) throw new Error('No access token returned');

            // store in context (and localStorage via provider)
            setToken(accessToken);
            if (refreshToken) setRefreshToken(refreshToken);

            // also keep a direct key for older code that may read it
            localStorage.setItem('admin_jwt', accessToken);
            localStorage.removeItem('admin_token'); // old key, avoid confusion

            // go straight to Products
            navigate('/admin/products', { replace: true });
        } catch (err) {
            console.error(err);
            setError('Invalid username or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <form
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"
            >
                <h2 className="text-2xl font-bold mb-6 text-center text-violet-950">
                    Admin Login
                </h2>

                <input
                    className="w-full mb-4 p-3 border rounded"
                    placeholder="Username"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    className="w-full mb-4 p-3 border rounded"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                {error && <p className="text-red-500 mb-4">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-violet-950 text-white py-3 rounded hover:bg-violet-800 disabled:opacity-60"
                >
                    {loading ? 'Signing in…' : 'Login'}
                </button>
            </form>
        </div>
    );
}
