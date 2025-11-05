// src/pages/RegisterPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/axiosInstance';

export default function RegisterPage() {
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
    });
    const [error, setError]   = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((s) => ({ ...s, [name]: value }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        const username = form.username.trim();
        const email    = form.email.trim().toLowerCase();
        const password = form.password;
        const confirm  = form.confirmPassword;

        if (password !== confirm) {
            setError('Passwords do not match.');
            return;
        }

        // ✅ Strip non-digits from phone (allows users to enter (123) 456-7890)
        const phoneDigits = form.phone.replace(/\D/g, '');

        // ✅ Validate phone has 10-15 digits
        if (phoneDigits.length < 10 || phoneDigits.length > 15) {
            setError('Phone number must be 10-15 digits.');
            return;
        }

        setLoading(true);
        try {
            await apiClient.post('/customers/register', {
                username,
                email,
                password,
                firstName: form.firstName.trim(),
                lastName : form.lastName.trim(),
                phone    : phoneDigits, // ✅ Send only digits
                address  : form.address.trim() || '', // ✅ Empty string if blank
                paymentInfo: '', // ✅ Include required field (optional but expected)
            });

            // Success! Navigate to login
            navigate('/login');
        } catch (err) {
            const status = err.response?.status;
            const data   = err.response?.data;

            // Try to surface Bean Validation messages if your backend sends a list/map
            const serverMsg =
                (typeof data === 'string' && data) ||
                (Array.isArray(data?.errors) && data.errors.join('\n')) ||
                (data?.message) ||
                '';

            if (status === 409) {
                setError(serverMsg || 'Username or email already exists.');
            } else if (status === 400) {
                setError(serverMsg || 'Invalid input. Please check your fields.');
            } else {
                setError(serverMsg || 'Registration failed. Please try again later.');
            }

            console.error('Registration error:', err.response || err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <form onSubmit={handleRegister}
                  className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-2xl space-y-8">
                <h2 className="text-3xl text-center font-serif font-semibold text-gray-800">
                    Create Account
                </h2>

                <section className="space-y-4 border rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-800">Account Information</h3>

                    <input name="username" placeholder="Username *" value={form.username}
                           onChange={handleChange} required minLength={3} maxLength={30}
                           className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />

                    <input type="email" name="email" placeholder="Email *" value={form.email}
                           onChange={handleChange} required
                           className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="password" name="password" placeholder="Password *"
                               value={form.password} onChange={handleChange} required minLength={6}
                               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                        <input type="password" name="confirmPassword" placeholder="Confirm Password *"
                               value={form.confirmPassword} onChange={handleChange} required
                               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>
                </section>

                <section className="space-y-4 border rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="firstName" placeholder="First Name *" value={form.firstName}
                               onChange={handleChange} required
                               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                        <input name="lastName" placeholder="Last Name *" value={form.lastName}
                               onChange={handleChange} required
                               className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    </div>

                    <input name="phone" placeholder="Phone Number * (10-15 digits)" value={form.phone}
                           onChange={handleChange} required
                           className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                    <p className="text-xs text-gray-500">Format: 1234567890 or (123) 456-7890</p>
                </section>

                <section className="space-y-3 border rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-gray-800">
                        Address <span className="text-gray-500 text-sm font-normal">(optional)</span>
                    </h3>
                    <textarea name="address" rows={3}
                              placeholder="Street / Apartment, Ward, District, Province"
                              value={form.address} onChange={handleChange}
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                </section>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                <button type="submit" disabled={loading}
                        className={`w-full py-3 rounded-lg font-semibold text-white transition-colors ${
                            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}>
                    {loading ? 'Creating...' : 'Create Account'}
                </button>

                <p className="text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <button type="button" onClick={() => navigate('/login')}
                            className="text-indigo-600 hover:underline">
                        Log in
                    </button>
                </p>
            </form>
        </div>
    );
}