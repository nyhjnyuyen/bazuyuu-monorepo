import React, { useEffect, useMemo, useState } from 'react';
import Footer from '../components/Footer';
import apiClient from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { isJwtValidNow } from '../api/auth';
import { getLocalCart } from '../lib/localCart'; // [{productId, quantity}]

const VND = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export default function CartPage() {
    const [rawItems, setRawItems] = useState([]); // unified: server items OR guest-expanded items
    const [cartId, setCartId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const navigate = useNavigate();
    const authed = isJwtValidNow();

    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                if (authed) {
                    // --- AUTH PATH (server) ---
                    const res = await apiClient.get('/cart/customer');
                    if (cancelled) return;
                    const data = res.data || {};
                    setCartId(data.id ?? data.cartId ?? null);
                    setRawItems(Array.isArray(data.items) ? data.items : []);
                } else {
                    // --- GUEST PATH (localStorage + public product fetch) ---
                    const local = getLocalCart(); // [{productId, quantity}]
                    // fetch product details (public GET /products/{id})
                    const details = await Promise.all(
                        local.map(async ({ productId, quantity }) => {
                            try {
                                const { data } = await apiClient.get(`/products/${productId}`);
                                return {
                                    // shape compatible with server items
                                    id: `guest-${productId}`,              // pseudo id
                                    product: data,                         // {id, name, price, ...}
                                    productId,
                                    productName: data?.name,
                                    price: data?.price ?? 0,
                                    quantity,
                                };
                            } catch {
                                return null;
                            }
                        })
                    );
                    if (cancelled) return;
                    setRawItems(details.filter(Boolean));
                    setCartId(null);
                }
            } catch {
                if (!cancelled) setRawItems([]);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [authed]);

    // Group by product
    const grouped = useMemo(() => {
        const map = new Map();
        for (const it of rawItems) {
            const productId = it.productId ?? it.product?.id ?? it.productName;
            const key = String(productId);
            const name = it.productName || it.product?.name || 'Item';
            const unitPrice = Number(it.price ?? it.product?.price ?? 0);
            const qty = Number(it.quantity ?? 0);

            if (!map.has(key)) {
                map.set(key, { key, productId, name, unitPrice, qtyTotal: 0, itemIds: [] });
            }
            const row = map.get(key);
            row.qtyTotal += qty;
            row.itemIds.push(it.id);
        }
        return Array.from(map.values());
    }, [rawItems]);

    const cartTotal = useMemo(
        () => grouped.reduce((s, g) => s + g.unitPrice * g.qtyTotal, 0),
        [grouped]
    );

    // -------- quantity sync (auth vs guest) ----------
    const syncQuantity = async (group, newQty) => {
        if (authed) {
            // Server: keep first item, update qty, delete the rest
            if (newQty <= 0) {
                await Promise.all(group.itemIds.map(id => apiClient.delete(`/cart/items/${id}`)));
                setRawItems(items => items.filter(x => !group.itemIds.includes(x.id)));
                return;
            }
            const [firstId, ...restIds] = group.itemIds;
            await apiClient.put(`/cart/items/${firstId}`, null, { params: { quantity: newQty } });
            if (restIds.length) await Promise.all(restIds.map(id => apiClient.delete(`/cart/items/${id}`)));
            setRawItems(items => {
                const kept = items.find(x => x.id === firstId);
                const others = items.filter(x => x.id !== firstId && !restIds.includes(x.id));
                if (kept) kept.quantity = newQty;
                return kept ? [kept, ...others] : others;
            });
        } else {
            // Guest: update localStorage cart
            const local = getLocalCart(); // [{productId, quantity}]
            const idx = local.findIndex(x => String(x.productId) === String(group.productId));
            if (idx === -1) return;
            if (newQty <= 0) local.splice(idx, 1);
            else local[idx].quantity = newQty;
            localStorage.setItem('cart', JSON.stringify(local));
            // reflect in UI
            setRawItems(items =>
                newQty <= 0
                    ? items.filter(x => String(x.productId) !== String(group.productId))
                    : items.map(x =>
                        String(x.productId) === String(group.productId) ? { ...x, quantity: newQty } : x
                    )
            );
            window.dispatchEvent(new Event('cart-updated'));
        }
    };

    const inc = async (g) => { if (!busy) { setBusy(true); try { await syncQuantity(g, g.qtyTotal + 1); } finally { setBusy(false); } } };
    const dec = async (g) => { if (!busy) { setBusy(true); try { await syncQuantity(g, g.qtyTotal - 1); } finally { setBusy(false); } } };
    const onChangeDirect = async (g, value) => {
        const n = Number(value);
        if (!Number.isNaN(n) && !busy) { setBusy(true); try { await syncQuantity(g, Math.max(0, Math.floor(n))); } finally { setBusy(false); } }
    };

    const goToCheckout = () => {
        if (authed && !cartId) {
            alert('Cart chưa sẵn sàng, vui lòng tải lại trang.');
            return;
        }

        // Ai cũng được chuyển sang /checkout,
        // user login thì truyền cartId, guest thì không cần
        navigate('/checkout', {
            state: authed && cartId ? { cartId } : undefined,
        });
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
                                                <button onClick={() => dec(g)} disabled={busy} className="w-8 h-8 rounded-md border border-violet-200 hover:bg-violet-50" aria-label="Decrease quantity">−</button>
                                                <input type="number" min={0} value={g.qtyTotal} onChange={(e) => onChangeDirect(g, e.target.value)} className="w-16 text-center border rounded-md py-1" />
                                                <button onClick={() => inc(g)} disabled={busy} className="w-8 h-8 rounded-md border border-violet-200 hover:bg-violet-50" aria-label="Increase quantity">+</button>
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
