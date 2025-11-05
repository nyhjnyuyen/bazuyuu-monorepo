import React, { useEffect, useState } from 'react';
import apiClient from '../api/axiosInstance';

// Small helper
function Alert({ type = 'success', children }) {
    const base = 'rounded-md px-4 py-3 text-sm mb-4';
    const styles =
        type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200';
    return <div className={`${base} ${styles}`}>{children}</div>;
}

export default function CustomerProfile() {
    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);

    // forms (still shown, but submit disabled until backend endpoints exist)
    const [personal, setPersonal] = useState({ firstName: '', lastName: '', email: '', phone: '' });
    const [address, setAddress] = useState({ address: '' });
    const [payment, setPayment] = useState({ paymentInfo: '' });
    const [prefs, setPrefs] = useState({ promotionsSubscribed: false });
    const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' });

    const [msg, setMsg] = useState({ type: 'success', text: '' });
    const flash = (text, type = 'success') => {
        setMsg({ type, text });
        setTimeout(() => setMsg({ type, text: '' }), 3000);
    };

    useEffect(() => {
        let cancelled = false;
        Promise.all([
            apiClient.get('/customers/me'),
            apiClient.get('/orders/my'),
        ])
            .then(([cRes, oRes]) => {
                if (cancelled) return;
                const c = cRes.data || {};
                setCustomer(c);
                setOrders(Array.isArray(oRes.data) ? oRes.data : []);
                setPersonal({
                    firstName: c.firstName || '',
                    lastName: c.lastName || '',
                    email: c.email || '',
                    phone: c.phone || '',
                });
                setAddress({ address: c.address || '' });
                setPayment({ paymentInfo: c.paymentInfo || '' });
                setPrefs({ promotionsSubscribed: !!c.promotionsSubscribed });
            })
            .catch(() => {
                if (!cancelled) setCustomer(null);
            });
        return () => { cancelled = true; };
    }, []);

    if (!customer) return <div className="p-6">Loading profile...</div>;

    // --- Temporarily stubbed submit handlers (no matching backend routes yet) ---
    const notImplemented = (label) => (e) => {
        e.preventDefault();
        flash(`${label} isn't enabled yet on the server.`, 'error');
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-semibold text-violet-900 mb-2">My Profile</h2>
            {msg.text && <Alert type={msg.type}>{msg.text}</Alert>}

            <div className="mb-8">
                <p className="text-violet-900 text-lg font-medium">
                    Welcome, {customer.username || `${customer.firstName || ''}`.trim() || 'Customer'}!
                </p>
                <p className="text-violet-700">{customer.email}</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Personal Info */}
                <div className="border rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 font-medium">Personal Information</div>
                    <form onSubmit={notImplemented('Updating personal info')} className="p-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">First Name</label>
                                <input
                                    className="w-full border rounded-md px-3 py-2"
                                    value={personal.firstName}
                                    onChange={(e) => setPersonal({ ...personal, firstName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Last Name</label>
                                <input
                                    className="w-full border rounded-md px-3 py-2"
                                    value={personal.lastName}
                                    onChange={(e) => setPersonal({ ...personal, lastName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Email</label>
                            <input
                                className="w-full border rounded-md px-3 py-2 bg-gray-100 cursor-not-allowed"
                                value={personal.email}
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Phone Number</label>
                            <input
                                className="w-full border rounded-md px-3 py-2"
                                value={personal.phone}
                                onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                            />
                        </div>

                        <button type="submit" className="inline-flex items-center bg-gray-300 text-gray-700 px-4 py-2 rounded-md cursor-not-allowed">
                            Update Personal Info (coming soon)
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                <div className="border rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 font-medium">Change Password</div>
                    <form onSubmit={notImplemented('Changing password')} className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Current Password</label>
                            <input
                                type="password"
                                className="w-full border rounded-md px-3 py-2"
                                value={pwd.currentPassword}
                                onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">New Password</label>
                            <input
                                type="password"
                                className="w-full border rounded-md px-3 py-2"
                                value={pwd.newPassword}
                                onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="inline-flex items-center bg-gray-300 text-gray-700 px-4 py-2 rounded-md cursor-not-allowed">
                            Change Password (coming soon)
                        </button>
                    </form>
                </div>

                {/* Address */}
                <div className="border rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 font-medium">Address Information</div>
                    <form onSubmit={notImplemented('Updating address')} className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Address</label>
                            <textarea
                                rows={3}
                                className="w-full border rounded-md px-3 py-2"
                                value={address.address}
                                onChange={(e) => setAddress({ address: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="inline-flex items-center bg-gray-300 text-gray-700 px-4 py-2 rounded-md cursor-not-allowed">
                            Update Address (coming soon)
                        </button>
                    </form>
                </div>

                {/* Payment */}
                <div className="border rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 font-medium">Payment Information</div>
                    <form onSubmit={notImplemented('Updating payment info')} className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Payment Details</label>
                            <textarea
                                rows={3}
                                className="w-full border rounded-md px-3 py-2"
                                placeholder="Card ending 1234, PayPal, etc."
                                value={payment.paymentInfo}
                                onChange={(e) => setPayment({ paymentInfo: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="inline-flex items-center bg-gray-300 text-gray-700 px-4 py-2 rounded-md cursor-not-allowed">
                            Update Payment Info (coming soon)
                        </button>
                    </form>
                </div>

                {/* Promotions */}
                <div className="border rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 font-medium">Promotions & Offers</div>
                    <form onSubmit={notImplemented('Updating preferences')} className="p-4 space-y-2">
                        <label className="inline-flex items-center gap-3">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300"
                                checked={prefs.promotionsSubscribed}
                                onChange={(e) => setPrefs({ promotionsSubscribed: e.target.checked })}
                            />
                            <span className="text-sm"><strong>Sign up for promotions and special offers via email</strong></span>
                        </label>
                        <p className="text-xs text-gray-500">Receive exclusive deals, promo codes, and new product announcements.</p>
                        <button type="submit" className="inline-flex items-center bg-gray-300 text-gray-700 px-4 py-2 rounded-md cursor-not-allowed mt-2">
                            Update Preferences (coming soon)
                        </button>
                    </form>
                </div>

                {/* Order History (matches your DTO fields) */}
                <div className="border rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 font-medium flex items-center gap-2">
                        <span className="inline-block">Order History</span>
                    </div>

                    <div className="p-4">
                        {orders.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">
                                <div className="text-3xl mb-2">🛍️</div>
                                <h5 className="font-medium mb-1">No Orders Yet</h5>
                                <p className="text-sm mb-4">You haven't placed any orders yet. Start shopping to see your order history here!</p>
                                <a href="/" className="inline-block bg-violet-900 text-white px-4 py-2 rounded-md hover:bg-violet-800">Start Shopping</a>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div key={order.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-2">
                                            <div>
                                                <div className="text-violet-900 font-semibold">#{order.id}</div>
                                                <div className="text-gray-500 text-sm">
                                                    {order.orderDate ? new Date(order.orderDate).toLocaleString() : ''}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-green-700 font-semibold">
                                                    ${Number(order.totalAmount ?? 0).toFixed(2)}
                                                </div>
                                                <div className="text-xs text-gray-500">Total</div>
                                            </div>
                                        </div>

                                        {!!order.items?.length && (
                                            <div className="mt-3 space-y-2">
                                                <div className="text-sm font-medium">Items Ordered:</div>
                                                {order.items.map((it) => (
                                                    <div key={it.id} className="flex items-center justify-between border-b last:border-b-0 py-2">
                                                        <div className="min-w-0">
                                                            <div className="font-medium truncate">{it.productName || 'Item'}</div>
                                                        </div>
                                                        <div className="text-right text-sm">
                                                            <div>Qty: {it.quantity}</div>
                                                            <div className="text-gray-500">
                                                                ${Number(it.price ?? 0).toFixed(2)} each
                                                                {typeof it.totalPrice === 'number' ? ` • $${Number(it.totalPrice).toFixed(2)} total` : ''}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
