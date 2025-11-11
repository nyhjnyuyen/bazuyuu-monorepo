// src/pages/CheckoutPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../api/axiosInstance';

// Minimal demo data. In real app, load from /vn-locations.json (put in /public).
const DEMO = {
    provinces: [
        { code: '01', name: 'Hà Nội', districts: [
                { code: '0101', name: 'Ba Đình', wards: [{ code:'010101', name:'Phúc Xá' }, { code:'010102', name:'Trúc Bạch' }] },
                { code: '0102', name: 'Hoàn Kiếm', wards: [{ code:'010201', name:'Chương Dương' }] },
            ]},
        { code: '79', name: 'TP. Hồ Chí Minh', districts: [
                { code: '7901', name: 'Quận 1', wards: [{ code:'790101', name:'Bến Nghé' }] },
                { code: '7907', name: 'Quận 7', wards: [{ code:'790701', name:'Tân Phú' }] },
            ]},
    ],
};

export default function CheckoutPage() {
    const [form, setForm] = useState({
        email: '',
        fullName: '',
        phone: '',
        address: '',
        province: '',
        district: '',
        ward: '',
        note: '',
        payment: 'VNPAY_QR', // 'COD' or 'VNPAY_QR'
    });

    // --- locations (replace with fetch to your JSON if you have it) ---
    const [locations, setLocations] = useState({ provinces: [] });

    useEffect(() => {
        // If you have a JSON file: fetch('/vn-locations.json').then(r=>r.json()).then(setLocations);
        setLocations(DEMO);
    }, []);

    const province = useMemo(
        () => locations.provinces.find(p => p.code === form.province) || null,
        [locations, form.province]
    );
    const district = useMemo(
        () => province?.districts.find(d => d.code === form.district) || null,
        [province, form.district]
    );

    const onChange = (e) => {
        const { name, value } = e.target;
        setForm(f => {
            // clear children when parent changes
            if (name === 'province') return { ...f, province: value, district: '', ward: '' };
            if (name === 'district') return { ...f, district: value, ward: '' };
            return { ...f, [name]: value };
        });
    };

    const placeOrder = async () => {
        // 1) Create order on backend
        const { data: order } = await apiClient.post('/orders/checkout', {
            receiverEmail: form.email,
            receiverName: form.fullName,
            receiverPhone: form.phone,
            address: {
                addressLine: form.address,
                provinceCode: form.province,
                districtCode: form.district,
                wardCode: form.ward,
            },
            note: form.note,
        });

        // 2) Normalize whatever your backend returns into a single code string
        const orderCode=
            order?.orderCode ??
            order?.code ??
            order?.id ??
            (typeof order === 'string' ? order : null);

        if (!orderCode) {
            throw new Error('No orderCode returned from /api/orders/checkout');
        }

        // 3) Pay / redirect
        if (form.payment === 'COD') {
            await apiClient.post(`/payments/cod/${orderCode}`);
            alert('Đặt hàng thành công (COD). Cám ơn bạn!');
            // navigate('/thank-you') // if you want
        } else {
            const { data: payUrl } = await apiClient.get(
                `/payments/vnpay/${orderCode}`,
                { params: { channel: 'VNPAY_QR' } }
            );
            window.location.href = payUrl;
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            await placeOrder();
        } catch (err) {
            console.error(err);
            alert('Không thể tạo đơn hàng. Vui lòng thử lại.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* LEFT: Thông tin nhận hàng (spans 2 cols) */}
                    <form onSubmit={onSubmit} className="lg:col-span-2 space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold">Thông tin nhận hàng</h2>
                                <a href="/login" className="text-indigo-600 text-sm hover:underline">Đăng nhập</a>
                            </div>

                            {/* Row 1 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    name="email"
                                    placeholder="Email"
                                    value={form.email}
                                    onChange={onChange}
                                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <input
                                    name="fullName"
                                    placeholder="Họ và tên"
                                    value={form.fullName}
                                    onChange={onChange}
                                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Phone + address */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                                <div className="flex">
                                    <input
                                        name="phone"
                                        placeholder="Số điện thoại"
                                        value={form.phone}
                                        onChange={onChange}
                                        className="flex-1 border rounded-l-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <span className="px-3 border border-l-0 rounded-r-lg text-sm flex items-center bg-gray-50">🇻🇳</span>
                                </div>
                                <input
                                    name="address"
                                    placeholder="Địa chỉ"
                                    value={form.address}
                                    onChange={onChange}
                                    className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* Province / District / Ward */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                                <select
                                    name="province"
                                    value={form.province}
                                    onChange={onChange}
                                    className="border rounded-lg px-3 py-2 bg-white"
                                >
                                    <option value="">Tỉnh thành</option>
                                    {locations.provinces.map(p => (
                                        <option key={p.code} value={p.code}>{p.name}</option>
                                    ))}
                                </select>

                                <select
                                    name="district"
                                    value={form.district}
                                    onChange={onChange}
                                    disabled={!province}
                                    className="border rounded-lg px-3 py-2 bg-white disabled:bg-gray-100"
                                >
                                    <option value="">Quận huyện</option>
                                    {province?.districts.map(d => (
                                        <option key={d.code} value={d.code}>{d.name}</option>
                                    ))}
                                </select>

                                <select
                                    name="ward"
                                    value={form.ward}
                                    onChange={onChange}
                                    disabled={!district}
                                    className="border rounded-lg px-3 py-2 bg-white disabled:bg-gray-100"
                                >
                                    <option value="">Phường xã</option>
                                    {district?.wards.map(w => (
                                        <option key={w.code} value={w.code}>{w.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Note */}
                            <textarea
                                name="note"
                                rows={3}
                                placeholder="Ghi chú (tùy chọn)"
                                value={form.note}
                                onChange={onChange}
                                className="mt-3 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Payment (mobile: keep with form) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h3 className="text-lg font-semibold mb-3">Thanh toán</h3>

                            <div className="space-y-3">
                                <label className={`flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer
                                   ${form.payment === 'VNPAY_QR' ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}`}>
                  <span className="flex items-center gap-3">
                    <input
                        type="radio"
                        name="payment"
                        value="VNPAY_QR"
                        checked={form.payment === 'VNPAY_QR'}
                        onChange={onChange}
                        className="accent-indigo-600"
                    />
                    <span>Thanh toán qua VNPAY-QR</span>
                  </span>
                                    <img src="https://sandbox.vnpayment.vn/paymentv2/images/logo.png" alt="VNPAY"
                                         className="h-5 object-contain" />
                                </label>

                                <label className={`flex items-center justify-between border rounded-lg px-4 py-3 cursor-pointer
                                   ${form.payment === 'COD' ? 'ring-2 ring-indigo-500 border-indigo-500' : ''}`}>
                  <span className="flex items-center gap-3">
                    <input
                        type="radio"
                        name="payment"
                        value="COD"
                        checked={form.payment === 'COD'}
                        onChange={onChange}
                        className="accent-indigo-600"
                    />
                    <span>Thanh toán khi giao hàng (COD)</span>
                  </span>
                                    <span className="text-indigo-600 font-semibold text-sm">💵</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg"
                            >
                                Đặt hàng
                            </button>
                        </div>
                    </form>

                    {/* RIGHT: Vận chuyển + (optionally) order summary */}
                    <aside className="space-y-4">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h3 className="text-lg font-semibold mb-3">Vận chuyển</h3>
                            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3 text-sm text-cyan-800">
                                Vui lòng nhập thông tin giao hàng
                            </div>
                        </div>

                        {/* If you have a cart summary, render it here */}
                        {/* <CartSummary /> */}
                    </aside>
                </div>
            </div>
        </div>
    );
}
