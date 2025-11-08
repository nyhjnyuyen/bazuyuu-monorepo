// src/admin/pages/AdminsPage.jsx
import React, { useEffect, useState } from 'react';
import { getAllAdmins, createAdmin, deleteAdmin } from '../../api/apiAdmin';
import { useAdminAuth } from '../AdminAuthContext';

export default function AdminsPage() {
    const { isSuperAdmin, token } = useAdminAuth();

    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [role, setRole] = useState('ADMIN');

    // decode JWT to get requesterId for deleteAdmin(requesterId)
    const decodeJwt = (t) => {
        try {
            const parts = String(t).split('.');
            if (parts.length < 2) return null;
            const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
            return JSON.parse(json);
        } catch {
            return null;
        }
    };

    const claims = token ? decodeJwt(token) : null;
    const requesterId =
        claims?.id ?? claims?.adminId ?? claims?.userId ?? claims?.sub ?? null;

    const loadAdmins = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await getAllAdmins();           // GET /api/admins/all
            setAdmins(res.data ?? []);
        } catch (e) {
            console.error('Failed to load admins', e);
            setError('Failed to load admins.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdmins();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!isSuperAdmin) {
            alert('Only SUPER_ADMIN can create admins.');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await createAdmin({
                username: newUsername.trim(),
                password: newPassword,
                role,
            });                                         // POST /api/admins/create

            setNewUsername('');
            setNewPassword('');
            setRole('ADMIN');
            await loadAdmins();
            alert('Admin created.');
        } catch (e) {
            console.error('Create admin failed', e);
            setError('Failed to create admin.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!isSuperAdmin) {
            alert('Only SUPER_ADMIN can delete admins.');
            return;
        }
        if (!window.confirm('Delete this admin?')) return;
        if (!requesterId) {
            alert('Your admin id was not found in the token.');
            return;
        }
        try {
            setLoading(true);
            setError('');
            await deleteAdmin(id, requesterId);         // DELETE /api/admins/delete/{id}?requesterId=...
            await loadAdmins();
        } catch (e) {
            console.error('Delete admin failed', e);
            setError('Failed to delete admin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Admins</h1>

            {error && (
                <p className="mb-4 text-red-600">
                    {error}
                </p>
            )}

            {/* Create admin form (SUPER_ADMIN only) */}
            {isSuperAdmin && (
                <div className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Create New Admin</h2>
                    <form
                        onSubmit={handleCreate}
                        className="flex flex-col sm:flex-row gap-3 items-stretch"
                    >
                        <input
                            className="border p-2 rounded flex-1"
                            placeholder="Username"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            className="border p-2 rounded flex-1"
                            placeholder="Password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <select
                            className="border p-2 rounded"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="ADMIN">ADMIN</option>
                            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        </select>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded bg-violet-950 text-white hover:bg-violet-800 disabled:opacity-50"
                        >
                            {loading ? 'Working…' : 'Create'}
                        </button>
                    </form>
                </div>
            )}

            {/* Admins table */}
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="border-b bg-gray-50">
                        <th className="p-2">ID</th>
                        <th className="p-2">Username</th>
                        <th className="p-2">Role</th>
                        <th className="p-2 text-center">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {admins.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="p-4 text-center text-gray-500">
                                {loading ? 'Loading…' : 'No admins found.'}
                            </td>
                        </tr>
                    ) : (
                        admins.map((a) => (
                            <tr key={a.id} className="border-b hover:bg-gray-50">
                                <td className="p-2">{a.id}</td>
                                <td className="p-2">{a.username}</td>
                                <td className="p-2">{a.role}</td>
                                <td className="p-2 text-center">
                                    {isSuperAdmin ? (
                                        <button
                                            onClick={() => handleDelete(a.id)}
                                            disabled={loading}
                                            className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                                        >
                                            Delete
                                        </button>
                                    ) : (
                                        <span className="text-gray-400">—</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
