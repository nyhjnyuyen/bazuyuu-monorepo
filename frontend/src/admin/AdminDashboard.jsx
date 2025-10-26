// frontend/src/admin/AdminDashboard.jsx
import React, { useEffect, useState } from 'react';
import { getAllAdmins, createAdmin, deleteAdmin } from '../api/apiAdmin';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function AdminDashboard() {
    const [admins, setAdmins] = useState([]);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [role, setRole] = useState('ADMIN');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Support either key; keep this consistent with your login code
    const token =
        localStorage.getItem('admin_token') || localStorage.getItem('admin_jwt');

    const decoded = token ? jwtDecode(token) : null;

    // pull possible shapes from your JWT
    const requesterId =
        decoded?.id ?? decoded?.userId ?? decoded?.adminId ?? decoded?.sub ?? null;

    const isSuperAdmin =
        decoded?.role === 'SUPER_ADMIN' ||
        (Array.isArray(decoded?.authorities) &&
            decoded.authorities.includes('SUPER_ADMIN'));

    useEffect(() => {
        if (!token) {
            navigate('/admin/login');
            return;
        }
        (async () => {
            try {
                setLoading(true);
                const res = await getAllAdmins();
                setAdmins(res.data ?? []);
                setError('');
            } catch (e) {
                console.error(e);
                setError('Failed to load admins.');
            } finally {
                setLoading(false);
            }
        })();
    }, [token, navigate]);

    const fetchAdmins = async () => {
        const res = await getAllAdmins();
        setAdmins(res.data ?? []);
    };

    const handleCreate = async () => {
        if (!isSuperAdmin) {
            alert('Only SUPER_ADMIN can create admins.');
            return;
        }
        try {
            setLoading(true);
            await createAdmin({
                username: newUsername.trim(),
                password: newPassword,
                role,
            });
            setNewUsername('');
            setNewPassword('');
            await fetchAdmins(); // ✅ refresh list
            alert('Admin created successfully');
        } catch (err) {
            console.error(err);
            alert('Failed to create admin');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!isSuperAdmin) {
            alert('Only SUPER_ADMIN can delete admins.');
            return;
        }
        if (!window.confirm('Are you sure you want to delete this admin?')) return;
        try {
            setLoading(true);
            await deleteAdmin(id, requesterId); // backend expects requesterId as query param
            await fetchAdmins(); // ✅ refresh list
        } catch (err) {
            console.error(err);
            alert('Failed to delete admin');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold text-violet-950 mb-6">Admin Dashboard</h1>

                {/* Create Admin (only for SUPER_ADMIN) */}
                {isSuperAdmin && (
                    <div className="mb-8 border-b pb-6">
                        <h2 className="text-xl font-semibold mb-4">Create New Admin</h2>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input
                                placeholder="Username"
                                value={newUsername}
                                onChange={(e) => setNewUsername(e.target.value)}
                                className="border p-2 rounded flex-1"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="border p-2 rounded flex-1"
                            />
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="border p-2 rounded"
                            >
                                <option value="ADMIN">ADMIN</option>
                                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                            </select>
                            <button
                                onClick={handleCreate}
                                disabled={loading}
                                className="bg-violet-950 text-white px-4 py-2 rounded hover:bg-violet-800 disabled:opacity-50"
                            >
                                {loading ? 'Working…' : 'Create'}
                            </button>
                        </div>
                    </div>
                )}

                {error && <p className="text-red-600 mb-4">{error}</p>}

                <h2 className="text-xl font-semibold mb-4">Existing Admins</h2>
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="border-b">
                        <th className="p-2">ID</th>
                        <th className="p-2">Username</th>
                        <th className="p-2">Role</th>
                        <th className="p-2 text-center">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {admins.map((a) => (
                        <tr key={a.id} className="border-b hover:bg-gray-100">
                            <td className="p-2">{a.id}</td>
                            <td className="p-2">{a.username}</td>
                            <td className="p-2">{a.role}</td>
                            <td className="p-2 text-center">
                                {isSuperAdmin ? (
                                    <button
                                        onClick={() => handleDelete(a.id)}
                                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                        disabled={loading}
                                    >
                                        Delete
                                    </button>
                                ) : (
                                    <span className="text-gray-400">—</span>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
