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

        setLoading(true);
        try {
            await apiClient.post('/auth/customer/register', {
                username,
                email,
                password,
                firstName: form.firstName.trim(),
                lastName : form.lastName.trim(),
                phone    : form.phone.trim(),
                address  : (form.address || '').trim(),
            });

            // (Optional) auto-login:
            // const { data } = await apiClient.post('/auth/customer/login', { username, password });
            // localStorage.setItem('jwt', data.accessToken);
            // localStorage.setItem('refreshToken', data.refreshToken);

            navigate('/login'); // or navigate('/') if you auto-login
        } catch (err) {
            const status = err.response?.status;
            const data   = err.response?.data;

            // Try to surface Bean Validation messages if your backend sends a list/map
            const serverMsg =
                (typeof data === 'string' && data) ||
                (Array.isArray(data?.errors) && data.errors.join('\n')) ||
                (data?.message) ||
                '';

            if (status === 409) setError(serverMsg || 'Username or email already exists.');
            else if (status === 400) setError(serverMsg || 'Invalid input. Please check your fields.');
            else setError(serverMsg || 'Registration failed. Please try again later.');
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
                           onChange={handleChange} required
                           className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />

                    <input type="email" name="email" placeholder="Email *" value={form.email}
                           onChange={handleChange} required
                           className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="password" name="password" placeholder="Password *"
                               value={form.password} onChange={handleChange} required
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

                    <input name="phone" placeholder="Phone Number *" value={form.phone}
                           onChange={handleChange} required
                           className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400" />
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

                {error && <p className="text-red-600">{error}</p>}

                <button type="submit" disabled={loading}
                        className={`w-full py-3 rounded-lg font-semibold text-white ${
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
