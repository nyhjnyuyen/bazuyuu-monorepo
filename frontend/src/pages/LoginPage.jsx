import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { CustomerContext } from '../components/CustomerContext';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { setCustomer } = useContext(CustomerContext);

    const handleLogin = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1) hit your CustomerController at POST /api/customers/login
            //    and get { accessToken, refreshToken }
            const { data } = await apiClient.post('/customers/login', {
                username,
                password,
            });

            // 2) stash the token and tell axios to send it on all future calls
            localStorage.setItem('jwt', data.accessToken);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;

            // 3) now that the header is set, fetch the user’s profile
            const profile = await apiClient.get('/customers/me');
            console.log('Login success:', profile.data); // confirm customer.id exists
            setCustomer(profile.data);

            // 4) success → home
            navigate('/');
        } catch (err) {
            // if login failed or profile fetch failed:
            setError(
                err.response?.status === 401
                    ? 'Invalid username or password.'
                    : 'Couldn’t fetch your profile. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white font-serif px-6">
            <form
                onSubmit={handleLogin}
                className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-violet-200"
            >
                <h2 className="text-3xl text-center text-violet-950 font-['Instrument_Serif'] mb-6">
                    Customer Login
                </h2>

                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full mb-4 px-4 py-3 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full mb-4 px-4 py-3 border border-violet-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                    required
                />

                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-lg font-bold text-white ${
                        loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-violet-950 hover:bg-violet-800'
                    }`}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>

                <div className="flex justify-between mt-4 text-sm text-violet-700">
                    <Link to="/forgot-password" className="hover:underline">
                        Forgot password?
                    </Link>
                    <button
                        type="button"
                        onClick={() => navigate('/register')}
                        className="hover:underline"
                    >
                        New to Bazuuyu?
                    </button>
                </div>
            </form>
        </div>
    );
}
