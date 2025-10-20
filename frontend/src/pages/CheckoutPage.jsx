// src/pages/CheckoutPage.jsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import Footer from '../components/Footer';

const CHANNELS = [
    { label: 'Cash on Delivery (COD)', value: 'COD' },
    { label: 'VNPAY QR', value: 'VNPAY_QR' },
    { label: 'VNPAY Domestic (ATM)', value: 'VNPAY_DOMESTIC' },
    { label: 'VNPAY International (Visa/Master/JCB)', value: 'VNPAY_INTL' },
];

export default function CheckoutPage() {
    const { state } = useLocation();
    const cartId = state?.cartId;
    const navigate = useNavigate();

    const [address, setAddress] = useState({
        fullName: '',
        phone: '',
        province: '',   // free text is OK
        district: '',
        ward: '',
        addressLine: '',
        note: '',
        country: 'VN',  // default
    });

    const [channel, setChannel] = useState('COD');
    const [placing, setPlacing] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAddress((prev) => ({ ...prev, [name]: value }));
    };

    const placeOrder = async (e) => {
        e.preventDefault();
        if (!cartId) {
            alert('Cart ID missing. Go back to Cart.');
            return;
        }
        setPlacing(true);

        try {
            // STEP 1: checkout cart -> create order (expect orderCode in response)
            // If your current endpoint returns only a string, see backend tweak below.
            const res = await apiClient.post(`/cart/checkout/${cartId}`, {
                shippingAddress: address, // backend can read it if supported
            });

            // Expecting a response like { orderCode: 'ABC123', totalAmount: 123456 }
            const data = res?.data || {};
            const orderCode = data.orderCode || data.code || data.orderId;

            if (!orderCode) {
                alert('Order code not returned by server. Please update checkout API to return orderCode.');
                setPlacing(false);
                return;
            }

            // STEP 2: route to payment
            if (channel === 'COD') {
                await apiClient.post(`/payments/cod/${orderCode}`);
                alert('Order placed with COD. We will contact you for delivery.');
                navigate('/thank-you', { state: { orderCode } });
                return;
            }

            // VNPAY paths: GET the redirect URL string, then redirect
            const urlRes = await apiClient.get(`/payments/vnpay/${orderCode}`, {
                params: { channel }, // VNPAY_QR | VNPAY_DOMESTIC | VNPAY_INTL
            });

            const redirectUrl = typeof urlRes.data === 'string' ? urlRes.data : urlRes.data?.url;
            if (!redirectUrl) {
                alert('Payment URL not received.');
                setPlacing(false);
                return;
            }
            // Send customer to VNPAY
            window.location.href = redirectUrl;

        } catch (err) {
            console.error('Checkout / payment error:', err);
            alert('Checkout failed. Please try again.');
            setPlacing(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-violet-950">
            <div className="max-w-3xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-['Instrument_Serif'] mb-8">Checkout</h1>

                {!cartId ? (
                    <p>No cart found. Please return to your cart.</p>
                ) : (
                    <form onSubmit={placeOrder} className="space-y-8">
                        {/* Shipping address */}
                        <section>
                            <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    className="border rounded-lg px-3 py-2"
                                    name="fullName"
                                    placeholder="Họ và tên"
                                    value={address.fullName}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    className="border rounded-lg px-3 py-2"
                                    name="phone"
                                    placeholder="Số điện thoại"
                                    value={address.phone}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    className="border rounded-lg px-3 py-2"
                                    name="province"
                                    placeholder="Tỉnh/Thành phố"
                                    value={address.province}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    className="border rounded-lg px-3 py-2"
                                    name="district"
                                    placeholder="Quận/Huyện"
                                    value={address.district}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    className="border rounded-lg px-3 py-2 md:col-span-2"
                                    name="ward"
                                    placeholder="Phường/Xã"
                                    value={address.ward}
                                    onChange={handleChange}
                                    required
                                />

                                <input
                                    className="border rounded-lg px-3 py-2 md:col-span-2"
                                    name="addressLine"
                                    placeholder="Số nhà, tên đường…"
                                    value={address.addressLine}
                                    onChange={handleChange}
                                    required
                                />

                                <textarea
                                    className="border rounded-lg px-3 py-2 md:col-span-2"
                                    name="note"
                                    placeholder="Ghi chú giao hàng (tuỳ chọn)"
                                    value={address.note}
                                    onChange={handleChange}
                                    rows={3}
                                />
                            </div>
                        </section>

                        {/* Payment method */}
                        <section>
                            <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
                            <div className="space-y-3">
                                {CHANNELS.map((opt) => (
                                    <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="paymentChannel"
                                            value={opt.value}
                                            checked={channel === opt.value}
                                            onChange={() => setChannel(opt.value)}
                                        />
                                        <span>{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        <button
                            type="submit"
                            disabled={placing}
                            className={`w-full py-3 rounded-xl font-semibold text-white ${placing ? 'bg-violet-300' : 'bg-violet-950 hover:bg-violet-900'}`}
                        >
                            {placing ? 'Processing...' : 'Place Order'}
                        </button>
                    </form>
                )}
            </div>
            <Footer />
        </div>
    );
}
