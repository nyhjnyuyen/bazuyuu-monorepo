// src/admin/pages/AdminsPage.jsx
import React, { useEffect, useState } from "react";
import { getAllAdmins, createAdmin, deleteAdmin } from "../../api/apiAdmin";
import { useAdminAuth } from "../AdminAuthContext";

export default function AdminsPage() {
    const { isSuperAdmin, adminId } = useAdminAuth();   // ✅ use adminId
    const [admins, setAdmins] = useState([]);
    const [newUsername, setNewUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [role, setRole] = useState("ADMIN");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const loadAdmins = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await getAllAdmins();
            setAdmins(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            console.error(e);
            setError("Failed to load admins.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAdmins();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!isSuperAdmin) return;

        try {
            setLoading(true);
            await createAdmin({
                username: newUsername.trim(),
                password: newPassword,
                role,
            });
            setNewUsername("");
            setNewPassword("");
            await loadAdmins();
        } catch (e) {
            console.error(e);
            alert("Failed to create admin");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!isSuperAdmin) return;
        if (!window.confirm("Delete this admin?")) return;

        if (!adminId) {
            alert("Cannot determine current admin id from token.");
            return;
        }

        try {
            setLoading(true);
            // backend expects ?requesterId=...
            await deleteAdmin(id, adminId);
            await loadAdmins();
        } catch (e) {
            console.error(e);
            alert("Failed to delete admin");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-2xl font-bold mb-4">Admins</h1>

            {error && <p className="text-red-600">{error}</p>}

            {isSuperAdmin && (
                <form
                    onSubmit={handleCreate}
                    className="border rounded-lg p-4 bg-white shadow-sm space-y-3"
                >
                    <h2 className="text-lg font-semibold">Create new admin</h2>
                    <input
                        className="border p-2 rounded w-full"
                        placeholder="Username"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        className="border p-2 rounded w-full"
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
                        className="px-4 py-2 rounded bg-violet-950 text-white disabled:opacity-50"
                    >
                        {loading ? "Working…" : "Create admin"}
                    </button>
                </form>
            )}

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
                    {admins.map((a) => (
                        <tr key={a.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">{a.id}</td>
                            <td className="p-2">{a.username}</td>
                            <td className="p-2">{a.role}</td>
                            <td className="p-2 text-center">
                                {isSuperAdmin ? (
                                    <button
                                        onClick={() => handleDelete(a.id)}
                                        disabled={loading}
                                        className="px-3 py-1 rounded bg-red-500 text-white text-sm disabled:opacity-50"
                                    >
                                        Delete
                                    </button>
                                ) : (
                                    <span className="text-gray-400">—</span>
                                )}
                            </td>
                        </tr>
                    ))}
                    {admins.length === 0 && (
                        <tr>
                            <td
                                colSpan={4}
                                className="p-4 text-center text-gray-500 italic"
                            >
                                No admins found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
