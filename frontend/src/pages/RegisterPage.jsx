// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

export default function RegisterPage() {
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',      // keep address as a single field (optional)
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            await apiClient.post('/api/auth/customer/register', {
                username: form.username,
                email: form.email,
                password: form.password,
                firstName: form.firstName,
                lastName: form.lastName,
                phone: form.phone,
                address: form.address || '',   // optional
            });
            navigate('/login');
        } catch (err) {
            setError('Registration failed. Try a different username or email.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <form
                onSubmit={handleRegister}
                className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl space-y-8"
            >
                <h2 className="text-3xl text-center font-serif font-semibold text-gray-800">
                    Create Account
                </h2>

                {/* Account Information */}
                <section className="space-y-4 border rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-800">Account Information</h3>

                    <input
                        type="text"
                        name="username"
                        placeholder="Username *"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={form.username}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email *"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password *"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm Password *"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </section>

                {/* Personal Information */}
                <section className="space-y-4 border rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            name="firstName"
                            placeholder="First Name *"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={form.firstName}
                            onChange={handleChange}
                            required
                        />
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Last Name *"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            value={form.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number *"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={form.phone}
                        onChange={handleChange}
                        required
                    />
                </section>

                {/* Address (single clean block) */}
                <section className="space-y-3 border rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Address <span className="text-gray-500 text-sm font-normal">(optional)</span>
                    </h3>
                    <textarea
                        name="address"
                        placeholder="Street / Apartment, Ward, District, Province"
                        rows={3}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                        value={form.address}
                        onChange={handleChange}
                    />
                </section>

                {/* Error & Submit */}
                {error && <p className="text-red-600">{error}</p>}

                <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold"
                >
                    Create Account
                </button>

                <p className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={() => navigate('/login')}
                        className="text-indigo-600 hover:underline"
                    >
                        Log in
                    </button>
                </p>
            </form>
        </div>
    );
}
