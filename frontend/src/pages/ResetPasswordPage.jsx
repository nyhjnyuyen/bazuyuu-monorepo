import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setMessage("Invalid or missing reset token.");
        }
    }, [token]);

    const handleReset = async () => {
        if (!newPassword.trim() || !confirmPassword.trim()) {
            return setMessage("Please fill in all fields.");
        }
        if (newPassword !== confirmPassword) {
            return setMessage("Passwords do not match.");
        }

        try {
            setLoading(true);
            const response = await axios.post("http://localhost:8081/api/password/reset", null, {
                params: {
                    token,
                    newPassword
                }
            });
            setMessage("✅ " + response.data);
        } catch (err) {
            setMessage("❌ " + (err.response?.data || "Something went wrong."));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#f9f5ff] px-4 font-['Instrument_Serif']">
            <div className="bg-white p-8 rounded-2xl shadow-md max-w-md w-full">
                <h1 className="text-3xl font-bold text-violet-950 mb-4 text-center">
                    Reset Your Password
                </h1>

                <p className="text-sm text-gray-600 mb-6 text-center">
                    Enter your new password below.
                </p>

                <input
                    type="password"
                    placeholder="New Password"
                    className="w-full px-4 py-3 rounded-xl border border-violet-300 mb-4 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="w-full px-4 py-3 rounded-xl border border-violet-300 mb-4 focus:outline-none focus:ring-2 focus:ring-violet-400"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <button
                    onClick={handleReset}
                    disabled={loading || !token}
                    className={`w-full text-white font-semibold py-3 rounded-xl transition ${
                        loading || !token
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-violet-950 hover:bg-violet-800"
                    }`}
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </button>

                {message && (
                    <p className="mt-4 text-center text-sm text-red-500 whitespace-pre-wrap">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}
