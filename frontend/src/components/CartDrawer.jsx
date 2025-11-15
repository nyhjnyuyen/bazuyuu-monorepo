import React, { useEffect, useMemo, useState } from 'react';
import api from '../api/axiosInstance';
import { isJwtValidNow } from '../api/auth';
import { getLocalCart } from '../lib/localCart';
import {useNavigate} from 'react-router-dom';
const money = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,   // thường VND không cần số lẻ, có thể bỏ nếu muốn
});
export default function CartDrawer({ open, onClose }) {
    const authed = isJwtValidNow();
    const [items, setItems] = useState([]);
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false);

    // fetch cart whenever opened or cart changes
    useEffect(() => {
        const load = async () => {
            if (!open) return;
            setLoading(true);
            try {
                if (authed) {
                    const { data } = await api.get('/cart/customer');
                    setItems(Array.isArray(data?.items) ? data.items : []);
                } else {
                    // expand localStorage cart -> product objects (public endpoint)
                    const local = getLocalCart(); // [{productId, quantity}]
                    const expanded = await Promise.all(
                        local.map(async ({ productId, quantity }) => {
                            try {
                                const { data } = await api.get(`/products/${productId}`);
                                return { id: `guest-${productId}`, product: data, productId, quantity, price: data?.price ?? 0 };
                            } catch { return null; }
                        })
                    );
                    setItems(expanded.filter(Boolean));
                }
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [open, authed]);

    useEffect(() => {
        const h = () => { if (open) { /* refresh after add/remove elsewhere */
            (async () => {
                try {
                    if (authed) {
                        const { data } = await api.get('/cart/customer');
                        setItems(Array.isArray(data?.items) ? data.items : []);
                    } else {
                        const local = getLocalCart();
                        const expanded = await Promise.all(
                            local.map(async ({ productId, quantity }) => {
                                try {
                                    const { data } = await api.get(`/products/${productId}`);
                                    return { id: `guest-${productId}`, product: data, productId, quantity, price: data?.price ?? 0 };
                                } catch { return null; }
                            })
                        );
                        setItems(expanded.filter(Boolean));
                    }
                } catch {}
            })();
        }};
        window.addEventListener('cart-updated', h);
        return () => window.removeEventListener('cart-updated', h);
    }, [open, authed]);

    const grouped = useMemo(() => {
        const m = new Map();
        for (const it of items) {
            const pid = it.productId ?? it.product?.id;
            const key = String(pid);
            const name = it.product?.name ?? it.productName ?? 'Item';
            const unit = Number(it.price ?? it.product?.price ?? 0);
            const qty  = Number(it.quantity ?? 0);
            const img  = it.product?.images?.[0]?.url || it.product?.imageUrl;

            if (!m.has(key)) m.set(key, { key, productId: pid, name, unit, qty: 0, img, itemIds: [] });
            const row = m.get(key);
            row.qty += qty;
            row.itemIds.push(it.id);
        }
        return [...m.values()];
    }, [items]);

    const subtotal = useMemo(() => grouped.reduce((s,g) => s + g.unit * g.qty, 0), [grouped]);

    // qty handlers
    const updateQty = async (g, next) => {
        if (authed) {
            if (next <= 0) {
                await Promise.all(g.itemIds.map(id => api.delete(`/cart/items/${id}`)));
                window.dispatchEvent(new Event('cart-updated'));
                setItems(items.filter(x => !g.itemIds.includes(x.id)));
                return;
            }
            const [firstId, ...rest] = g.itemIds;
            await api.put(`/cart/items/${firstId}`, null, { params: { quantity: next } });
            if (rest.length) await Promise.all(rest.map(id => api.delete(`/cart/items/${id}`)));
            window.dispatchEvent(new Event('cart-updated'));
            setItems(prev => prev.map(x => x.id === firstId ? { ...x, quantity: next } : x).filter(x => !rest.includes(x.id)));
        } else {
            const local = getLocalCart();
            const i = local.findIndex(x => String(x.productId) === String(g.productId));
            if (i !== -1) {
                if (next <= 0) local.splice(i,1); else local[i].quantity = next;
                localStorage.setItem('cart', JSON.stringify(local));
                window.dispatchEvent(new Event('cart-updated'));
                // quick UI update
                if (next <= 0) {
                    setItems(prev => prev.filter(x => String(x.productId) !== String(g.productId)));
                } else {
                    setItems(prev => prev.map(x => String(x.productId) === String(g.productId) ? { ...x, quantity: next } : x));
                }
            }
        }
    };

    const removeLine = () => updateQty(arguments[0], 0);

    return (
        <>
            {/* overlay */}
            <div
                onClick={onClose}
                className={`fixed inset-0 bg-black/30 transition-opacity z-40
    ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                aria-hidden="true"
            />

            {/* panel */}
            <aside
                className={`fixed right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-2xl
    transition-transform duration-300 z-50
    ${open ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-label="Giỏ hàng của bạn"
            >
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold">Giỏ hàng của bạn</h2>
                    <button onClick={onClose} className="p-2 rounded hover:bg-gray-100" aria-label="Close">✕</button>
                </div>

                <div className="p-4 overflow-y-auto h-[calc(100%-160px)]">
                    {loading ? <p>Đang tải giỏ hàng…</p> :
                        grouped.length === 0 ? <p>Giỏ hàng của bạn đang trống.</p> :
                            grouped.map(g => (
                                <div key={g.key} className="flex items-start gap-3 py-3 border-b">
                                    <img src={g.img} alt="" className="w-14 h-14 object-cover rounded" />
                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="font-medium">{g.name}</p>
                                                <p className="text-sm text-gray-500">{money.format(g.unit)}</p>
                                            </div>
                                            <button onClick={() => removeLine(g)} className="text-sm underline">Xoá</button>
                                        </div>
                                        <div className="mt-2 inline-flex items-center border rounded">
                                            <button onClick={() => updateQty(g, g.qty - 1)} className="px-2 py-1">−</button>
                                            <span className="px-3">{g.qty}</span>
                                            <button onClick={() => updateQty(g, g.qty + 1)} className="px-2 py-1">+</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                    }
                </div>

                <div className="p-4 border-t">
                    <div className="flex justify-between mb-3">
                        <span>Tổng cộng</span>
                        <span className="font-semibold">{money.format(subtotal)}</span>
                    </div>

                    <button
                        type="button"
                        className="block w-full text-center bg-violet-950 text-white py-3 rounded-xl font-semibold hover:bg-violet-900"
                        onClick={() => {
                            onClose();
                            navigate('/cart');
                        }}
                    >
                        Xem giỏ hàng và thanh toán
                    </button>
                </div>
            </aside>
        </>
    );
}
