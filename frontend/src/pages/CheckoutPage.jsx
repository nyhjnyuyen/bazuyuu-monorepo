// src/pages/CheckoutPage.jsx
import React, { useEffect, useState } from 'react';
import apiClient from '../api/axiosInstance';

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

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    useEffect(() => {
        const loadProvinces = async () => {
            try {
                const res = await apiClient.get('/vn/provinces');
                console.log('VN provinces raw:', res.data);   // 👈 add this
                const data = res.data;

                let items = [];
                if (Array.isArray(data)) {
                    items = data;
                } else if (data && Array.isArray(data.data)) {
                    // in case ViettelPost wraps it like { status, error, message, data: [...] }
                    items = data.data;
                } else if (data && Array.isArray(data.result)) {
                    // just in case some gateway wraps it as { result: [...] }
                    items = data.result;
                }

                console.log('VN provinces parsed:', items);
                setProvinces(items);
            } catch (e) {
                console.error('Error loading provinces', e);
            }
        };
        loadProvinces();
    }, []);


    useEffect(() => {
        if (!form.province) {
            setDistricts([]);
            setWards([]);
            return;
        }
        const loadDistricts = async () => {
            try {
                const res = await apiClient.get('/vn/districts', {
                    params: { provinceId: form.province },
                });
                const data = res.data;
                const items = Array.isArray(data) ? data : data.data || [];
                setDistricts(items);
                setWards([]);
            } catch (e) {
                console.error('Error loading districts', e);
            }
        };
        loadDistricts();
    }, [form.province]);

    useEffect(() => {
        if (!form.district) {
            setWards([]);
            return;
        }
        const loadWards = async () => {
            try {
                const res = await apiClient.get('/vn/wards', {
                    params: { districtId: form.district },
                });
                const data = res.data;
                const items = Array.isArray(data) ? data : data.data || [];
                setWards(items);
            } catch (e) {
                console.error('Error loading wards', e);
            }
        };
        loadWards();
    }, [form.district]);


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
        const payload = {
            fullName: form.fullName,
            phone: form.phone,
            province: form.province,
            district: form.district,
            ward: form.ward,
            addressLine: form.address,
            note: form.note,
            country: 'VN',
        };
        console.log('Checkout payload:', payload);
        const { data: order } = await apiClient.post('/orders/checkout', payload);

        const orderCode =
            order?.orderCode ??
            order?.code ??
            order?.id ??
            (typeof order === 'string' ? order : null);

        if (!orderCode) throw new Error('No orderCode returned from /orders/checkout');

        if (form.payment === 'COD') {
            await apiClient.post(`/payments/cod/${orderCode}`);
            alert('Đặt hàng thành công (COD). Cám ơn bạn!');
        } else {
            const { data: payUrl } = await apiClient.get(`/payments/vnpay/${orderCode}`, {
                params: { channel: 'VNPAY_QR' },
            });
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
                                    {provinces.map(p => (
                                        <option
                                            key={p.PROVINCE_ID}
                                            value={p.PROVINCE_ID} // dùng ID để gọi tiếp district
                                        >
                                            {p.PROVINCE_NAME}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    name="district"
                                    value={form.district}
                                    onChange={onChange}
                                    disabled={!form.province}
                                    className="border rounded-lg px-3 py-2 bg-white disabled:bg-gray-100"
                                >
                                    <option value="">Quận huyện</option>
                                    {districts.map(d => (
                                        <option key={d.DISTRICT_ID} value={d.DISTRICT_ID}>
                                            {d.DISTRICT_NAME}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    name="ward"
                                    value={form.ward}
                                    onChange={onChange}
                                    disabled={!form.district}
                                    className="border rounded-lg px-3 py-2 bg-white disabled:bg-gray-100"
                                >
                                    <option value="">Phường xã</option>
                                    {wards.map(w => (
                                        <option key={w.WARDS_ID} value={w.WARDS_ID}>
                                            {w.WARDS_NAME}
                                        </option>
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
