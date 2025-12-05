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

    // forms
    const [personal, setPersonal] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });
    const [address, setAddress] = useState({ address: '' });
    const [payment, setPayment] = useState({ paymentInfo: '' });
    const [prefs, setPrefs] = useState({ promotionsSubscribed: false });
    const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '' });

    // loading / saving
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState({
        personal: false,
        password: false,
        address: false,
        payment: false,
        prefs: false,
    });

    const [msg, setMsg] = useState({ type: 'success', text: '' });
    const flash = (text, type = 'success') => {
        setMsg({ type, text });
        setTimeout(() => setMsg({ type, text: '' }), 3500);
    };

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const [cRes, oRes] = await Promise.all([
                    apiClient.get('/customers/me'),
                    apiClient.get('/orders/my'),
                ]);
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
            } catch (err) {
                if (!cancelled) {
                    setCustomer(null);
                    flash('Unable to load profile. Please try again later.', 'error');
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    if (loading) return <div className="p-6">Loading profile...</div>;
    if (!customer) return <div className="p-6">No profile found.</div>;

    // --- submit handlers ---

    const handlePersonalSubmit = async (e) => {
        e.preventDefault();
        setSaving((s) => ({ ...s, personal: true }));
        try {
            const payload = {
                firstName: personal.firstName,
                lastName: personal.lastName,
                phone: personal.phone,
            };
            // Adjust endpoint / payload to your backend
            const res = await apiClient.put('/customers/me', payload);
            setCustomer(res.data);
            flash('Personal information updated.');
        } catch (err) {
            flash('Failed to update personal information.', 'error');
        } finally {
            setSaving((s) => ({ ...s, personal: false }));
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (!pwd.currentPassword || !pwd.newPassword) {
            flash('Please fill in both password fields.', 'error');
            return;
        }
        setSaving((s) => ({ ...s, password: true }));
        try {
            // Example endpoint; change if your API is different
            await apiClient.post('/auth/change-password', {
                currentPassword: pwd.currentPassword,
                newPassword: pwd.newPassword,
            });
            setPwd({ currentPassword: '', newPassword: '' });
            flash('Password changed successfully.');
        } catch (err) {
            flash('Failed to change password. Please check your current password.', 'error');
        } finally {
            setSaving((s) => ({ ...s, password: false }));
        }
    };

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setSaving((s) => ({ ...s, address: true }));
        try {
            // Example endpoint
            const res = await apiClient.put('/customers/me/address', {
                address: address.address,
            });
            setCustomer(res.data);
            flash('Address updated.');
        } catch (err) {
            flash('Failed to update address.', 'error');
        } finally {
            setSaving((s) => ({ ...s, address: false }));
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setSaving((s) => ({ ...s, payment: true }));
        try {
            // Example endpoint
            const res = await apiClient.put('/customers/me/payment-info', {
                paymentInfo: payment.paymentInfo,
            });
            setCustomer(res.data);
            flash('Payment information updated.');
        } catch (err) {
            flash('Failed to update payment information.', 'error');
        } finally {
            setSaving((s) => ({ ...s, payment: false }));
        }
    };

    const handlePrefsSubmit = async (e) => {
        e.preventDefault();
        setSaving((s) => ({ ...s, prefs: true }));
        try {
            // Example endpoint
            const res = await apiClient.put('/customers/me/preferences', {
                promotionsSubscribed: prefs.promotionsSubscribed,
            });
            setCustomer(res.data);
            flash('Preferences updated.');
        } catch (err) {
            flash('Failed to update preferences.', 'error');
        } finally {
            setSaving((s) => ({ ...s, prefs: false }));
        }
    };

    const buttonBase =
        'inline-flex items-center px-4 py-2 rounded-md text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed';

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-semibold text-violet-900 mb-2">My Profile</h2>
            {msg.text && <Alert type={msg.type}>{msg.text}</Alert>}

            <div className="mb-8">
                <p className="text-violet-900 text-lg font-medium">
                    Xin chào, {customer.username || `${customer.firstName || ''}`.trim() || 'Customer'}!
                </p>
                <p className="text-violet-700">{customer.email}</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Personal Info */}
                <div className="border rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 font-medium">Thông Tin Cá Nhân</div>
                    <form onSubmit={handlePersonalSubmit} className="p-4 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Tên</label>
                                <input
                                    className="w-full border rounded-md px-3 py-2"
                                    value={personal.firstName}
                                    onChange={(e) =>
                                        setPersonal({ ...personal, firstName: e.target.value })
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">Họ</label>
                                <input
                                    className="w-full border rounded-md px-3 py-2"
                                    value={personal.lastName}
                                    onChange={(e) =>
                                        setPersonal({ ...personal, lastName: e.target.value })
                                    }
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
                            <label className="block text-sm text-gray-600 mb-1">Số Điện Thoại</label>
                            <input
                                className="w-full border rounded-md px-3 py-2"
                                value={personal.phone}
                                onChange={(e) =>
                                    setPersonal({ ...personal, phone: e.target.value })
                                }
                            />
                        </div>

                        <button
                            type="submit"
                            className={`${buttonBase} bg-violet-900 text-white hover:bg-violet-800`}
                            disabled={saving.personal}
                        >
                            {saving.personal ? 'Saving…' : 'Cập nhật thông tin'}
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                <div className="border rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 font-medium">Đổi Mật Khẩu</div>
                    <form onSubmit={handlePasswordSubmit} className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">
                                Mật khẩu hiện tại
                            </label>
                            <input
                                type="password"
                                className="w-full border rounded-md px-3 py-2"
                                value={pwd.currentPassword}
                                onChange={(e) =>
                                    setPwd({ ...pwd, currentPassword: e.target.value })
                                }
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Mật khẩu mới</label>
                            <input
                                type="password"
                                className="w-full border rounded-md px-3 py-2"
                                value={pwd.newPassword}
                                onChange={(e) =>
                                    setPwd({ ...pwd, newPassword: e.target.value })
                                }
                            />
                        </div>
                        <button
                            type="submit"
                            className={`${buttonBase} bg-violet-900 text-white hover:bg-violet-800`}
                            disabled={saving.password}
                        >
                            {saving.password ? 'Saving…' : 'Đổi mật khẩu'}
                        </button>
                    </form>
                </div>

                {/* Address */}
                <div className="border rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 font-medium">Địa Chỉ Nhận Hàng</div>
                    <form onSubmit={handleAddressSubmit} className="p-4 space-y-4">
                        <div>
                            <label className="block text-sm text-gray-600 mb-1">Địa chỉ</label>
                            <textarea
                                rows={3}
                                className="w-full border rounded-md px-3 py-2"
                                value={address.address}
                                onChange={(e) => setAddress({ address: e.target.value })}
                            />
                        </div>
                        <button
                            type="submit"
                            className={`${buttonBase} bg-violet-900 text-white hover:bg-violet-800`}
                            disabled={saving.address}
                        >
                            {saving.address ? 'Saving…' : 'Cập nhật địa chỉ'}
                        </button>
                    </form>
                </div>

                {/* Order History */}
                <div className="border rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 font-medium flex items-center gap-2">
                        <span className="inline-block">Lịch Sử Đơn Hàng</span>
                    </div>

                    <div className="p-4">
                        {orders.length === 0 ? (
                            <div className="text-center text-gray-500 py-10">
                                <div className="text-3xl mb-2">🛍️</div>
                                <h5 className="font-medium mb-1">Hiện tại chưa có hơn hàng</h5>
                                <p className="text-sm mb-4">
                                    Bạn chưa đặt đơn hàng nào. Bắt đầu mua sắm và xem lịch sử lại đây!
                                </p>
                                <a
                                    href="/"
                                    className="inline-block bg-violet-900 text-white px-4 py-2 rounded-md hover:bg-violet-800"
                                >
                                    Mua sắm
                                </a>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="bg-gray-50 border border-gray-200 rounded-lg p-4"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-2">
                                            <div>
                                                <div className="text-violet-900 font-semibold">
                                                    #{order.id}
                                                </div>
                                                <div className="text-gray-500 text-sm">
                                                    {order.orderDate
                                                        ? new Date(
                                                            order.orderDate
                                                        ).toLocaleString()
                                                        : ''}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-green-700 font-semibold">
                                                    $
                                                    {Number(
                                                        order.totalAmount ?? 0
                                                    ).toFixed(2)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Total
                                                </div>
                                            </div>
                                        </div>

                                        {!!order.items?.length && (
                                            <div className="mt-3 space-y-2">
                                                <div className="text-sm font-medium">
                                                    Items Ordered:
                                                </div>
                                                {order.items.map((it) => (
                                                    <div
                                                        key={it.id}
                                                        className="flex items-center justify-between border-b last:border-b-0 py-2"
                                                    >
                                                        <div className="min-w-0">
                                                            <div className="font-medium truncate">
                                                                {it.productName ||
                                                                    'Item'}
                                                            </div>
                                                        </div>
                                                        <div className="text-right text-sm">
                                                            <div>
                                                                Qty: {it.quantity}
                                                            </div>
                                                            <div className="text-gray-500">
                                                                $
                                                                {Number(
                                                                    it.price ?? 0
                                                                ).toFixed(2)}{' '}
                                                                each
                                                                {typeof it.totalPrice ===
                                                                'number'
                                                                    ? ` • $${Number(
                                                                        it.totalPrice
                                                                    ).toFixed(
                                                                        2
                                                                    )} total`
                                                                    : ''}
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
