import React, { useState } from 'react';
import apiClient from '../api/axiosInstance';


export default function RequestResetPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRequest = async () => {
        if (!email.trim()) {
            setMessage("Please enter your email.");
            return;
        }

        try {
            setLoading(true);
            const res = await apiClient.post('/password/send-reset-token', { email });
            setMessage(" " + res.data);
        } catch (err) {
            setMessage("" + (err.response?.data || "Lỗi"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f9f5ff] px-4 font-serif">
            <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full">
                <h1 className="text-2xl font-bold text-center text-violet-950 mb-4">Forgot Password</h1>
                <p className="text-sm text-gray-600 mb-6 text-center">Xin vui lòng nhập email để nhận link khôi phục mât khẩu</p>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-violet-300 mb-4 focus:outline-none focus:ring-2 focus:ring-violet-400"
                />

                <button
                    onClick={handleRequest}
                    disabled={loading}
                    className={`w-full text-white font-semibold py-3 rounded-xl transition ${
                        loading ? "bg-gray-400" : "bg-violet-950 hover:bg-violet-800"
                    }`}
                >
                    {loading ? "Đang gửi..." : "Gửi đường link khôi phục"}
                </button>

                {message && <p className="mt-4 text-center text-sm text-red-500">{message}</p>}
            </div>
        </div>
    );
}
