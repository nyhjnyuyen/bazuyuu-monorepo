// src/pages/CartPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import Footer from '../components/Footer';
import apiClient from '../api/apiClient';
import { useNavigate } from 'react-router-dom';

const VND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export default function CartPage() {
    const [rawItems, setRawItems] = useState([]);   // dữ liệu thô từ API
    const [cartId, setCartId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const navigate = useNavigate();

    // Tải giỏ hàng
    useEffect(() => {
        let cancelled = false;

        apiClient.get('/cart/customer')
            .then((res) => {
                if (cancelled) return;
                const data = res.data || {};
                setCartId(data.id ?? data.cartId ?? null);
                setRawItems(Array.isArray(data.items) ? data.items : []);
            })
            .catch(async () => {
                // fallback
                try {
                    const res2 = await apiClient.get('/cart/items');
                    if (cancelled) return;
                    setRawItems(Array.isArray(res2.data) ? res2.data : []);
                } catch {
                    if (!cancelled) setRawItems([]);
                }
            })
            .finally(() => !cancelled && setLoading(false));

        return () => { cancelled = true; };
    }, []);

    // Gộp các item trùng sản phẩm
    const grouped = useMemo(() => {
        const map = new Map();
        for (const it of rawItems) {
            // cố gắng lấy khóa ổn định
            const productId = it.productId ?? it.product?.id ?? it.product?.productId ?? it.productName;
            const key = String(productId);

            const name = it.productName || it.product?.name || 'Item';
            const unitPrice = Number(it.price ?? it.product?.price ?? 0);
            const qty = Number(it.quantity ?? 0);

            if (!map.has(key)) {
                map.set(key, {
                    key,
                    name,
                    unitPrice,
                    qtyTotal: 0,
                    itemIds: [], // lưu lại các id để PUT/DELETE
                });
            }
            const row = map.get(key);
            row.qtyTotal += qty;
            row.itemIds.push(it.id);
            // nếu đơn giá khác nhau (hiếm) vẫn lấy theo item đầu
        }
        return Array.from(map.values());
    }, [rawItems]);

    const cartTotal = useMemo(() => {
        return grouped.reduce((sum, g) => sum + g.unitPrice * g.qtyTotal, 0);
    }, [grouped]);

    // Cập nhật server: hợp nhất về 1 item (id đầu), set số lượng = newQty, xoá phần dư
    const syncQuantity = async (group, newQty) => {
        // newQty <= 0: xoá tất cả
        if (newQty <= 0) {
            await Promise.all(group.itemIds.map(id => apiClient.delete(`/cart/items/${id}`)));
            // cập nhật local
            setRawItems(items => items.filter(x => !group.itemIds.includes(x.id)));
            return;
        }

        const [firstId, ...restIds] = group.itemIds;

        // 1) update số lượng trên item đầu
        await apiClient.put(`/cart/items/${firstId}`, null, { params: { quantity: newQty } });

        // 2) xóa các item dư
        if (restIds.length) {
            await Promise.all(restIds.map(id => apiClient.delete(`/cart/items/${id}`)));
        }

        // 3) cập nhật local state (optimistic)
        setRawItems(items => {
            // giữ lại item đầu, quantity = newQty; các item dư bị loại
            const kept = items.find(x => x.id === firstId);
            const others = items.filter(x => x.id !== firstId && !restIds.includes(x.id));
            if (kept) kept.quantity = newQty;
            return kept ? [kept, ...others] : others;
        });
    };

    const inc = async (g) => {
        if (busy) return;
        try {
            setBusy(true);
            await syncQuantity(g, g.qtyTotal + 1);
        } finally {
            setBusy(false);
        }
    };

    const dec = async (g) => {
        if (busy) return;
        try {
            setBusy(true);
            await syncQuantity(g, g.qtyTotal - 1);
        } finally {
            setBusy(false);
        }
    };

    const onChangeDirect = async (g, value) => {
        const n = Number(value);
        if (Number.isNaN(n)) return;
        if (busy) return;
        try {
            setBusy(true);
            await syncQuantity(g, Math.max(0, Math.floor(n)));
        } finally {
            setBusy(false);
        }
    };

    const goToCheckout = () => {
        if (!cartId) {
            alert('Cart ID not found yet. Please refresh and try again.');
            return;
        }
        navigate('/checkout', { state: { cartId } });
    };

    return (
        <div className="min-h-screen bg-white text-violet-950">
            <div className="max-w-5xl mx-auto px-6 py-12">
                <h1 className="text-3xl font-['Instrument_Serif'] mb-8">Your Cart</h1>

                {loading ? (
                    <p>Loading...</p>
                ) : grouped.length === 0 ? (
                    <p>Your cart is empty.</p>
                ) : (
                    <>
                        <ul className="space-y-6 mb-8">
                            {grouped.map((g) => (
                                <li key={g.key} className="border-b pb-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold text-lg">{g.name}</h3>

                                            <div className="mt-2 flex items-center gap-3">
                                                <button
                                                    onClick={() => dec(g)}
                                                    disabled={busy}
                                                    className="w-8 h-8 rounded-md border border-violet-200 hover:bg-violet-50"
                                                    aria-label="Decrease quantity"
                                                >−</button>

                                                <input
                                                    type="number"
                                                    min={0}
                                                    value={g.qtyTotal}
                                                    onChange={(e) => onChangeDirect(g, e.target.value)}
                                                    className="w-16 text-center border rounded-md py-1"
                                                />

                                                <button
                                                    onClick={() => inc(g)}
                                                    disabled={busy}
                                                    className="w-8 h-8 rounded-md border border-violet-200 hover:bg-violet-50"
                                                    aria-label="Increase quantity"
                                                >+</button>
                                            </div>

                                            <p className="text-sm text-gray-500 mt-1">
                                                ({VND.format(g.unitPrice)} / sản phẩm)
                                            </p>
                                        </div>

                                        <p className="text-lg font-jakarta">
                                            {VND.format(g.unitPrice * g.qtyTotal)}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>

                        <div className="flex justify-between items-center mb-6">
                            <span className="font-semibold">Total</span>
                            <span className="text-lg font-jakarta">{VND.format(cartTotal)}</span>
                        </div>

                        <button
                            onClick={goToCheckout}
                            disabled={busy}
                            className="w-full bg-violet-950 text-white py-3 rounded-xl font-semibold hover:bg-violet-900 disabled:opacity-60"
                        >
                            Check Out
                        </button>
                    </>
                )}
            </div>
            <Footer />
        </div>
    );
}
