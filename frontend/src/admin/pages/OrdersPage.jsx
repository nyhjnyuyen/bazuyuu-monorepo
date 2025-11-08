// src/admin/pages/OrdersPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
    getAllOrders,
    getOrderItemsForOrder,
    updateOrderStatus,
} from '../../api/apiAdmin';
import dayjs from 'dayjs';

const STATUSES = ['PENDING','PAID','PACKING','SHIPPED','DELIVERED','CANCELLED'];

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState({});       // { [orderId]: true/false }
    const [itemsByOrder, setItemsByOrder] = useState({}); // { [orderId]: OrderItemResponse[] }
    const [q, setQ] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const load = async () => {
        setLoading(true);
        try {
            const res = await getAllOrders();
            setOrders(res.data ?? []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const toggleExpand = async (id) => {
        const next = !expanded[id];
        setExpanded((m) => ({ ...m, [id]: next }));
        if (next && !itemsByOrder[id]) {
            const res = await getOrderItemsForOrder(id);
            setItemsByOrder((m) => ({ ...m, [id]: res.data ?? [] }));
        }
    };

    const onChangeStatus = async (id, next) => {
        await updateOrderStatus(id, next);
        setOrders((arr) => arr.map(o => (o.id === id ? { ...o, status: next } : o)));
    };

    const filtered = useMemo(() => {
        const needle = q.trim().toLowerCase();
        return orders.filter(o => {
            const hit =
                !needle ||
                String(o.id).includes(needle) ||
                String(o.orderCode ?? '').toLowerCase().includes(needle) ||
                String(o.customerName ?? '').toLowerCase().includes(needle);
            const statusOk = !statusFilter || (o.status ?? '').toUpperCase() === statusFilter;
            return hit && statusOk;
        });
    }, [orders, q, statusFilter]);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Orders</h1>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                    className="border rounded px-3 py-2 w-full sm:w-64"
                    placeholder="Search: code / id / customer"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
                <select
                    className="border rounded px-3 py-2 w-full sm:w-56"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All statuses</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <button
                    onClick={load}
                    className="px-4 py-2 rounded bg-violet-950 text-white hover:bg-violet-800"
                >
                    Refresh
                </button>
            </div>

            {loading ? (
                <p>Loading…</p>
            ) : (
                <div className="overflow-x-auto rounded-lg border">
                    <table className="min-w-[900px] w-full text-left">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-2">#</th>
                            <th className="p-2">Code</th>
                            <th className="p-2">Customer</th>
                            <th className="p-2">Date</th>
                            <th className="p-2">Total</th>
                            <th className="p-2">Status</th>
                            <th className="p-2 text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filtered.map((o) => (
                            <React.Fragment key={o.id}>
                                <tr className="border-t">
                                    <td className="p-2">{o.id}</td>
                                    <td className="p-2 font-mono">{o.orderCode ?? '—'}</td>
                                    <td className="p-2">{o.customerName ?? '—'}</td>
                                    <td className="p-2">{o.orderDate ? dayjs(o.orderDate).format('YYYY-MM-DD HH:mm') : '—'}</td>
                                    <td className="p-2">${(o.totalAmount ?? 0).toLocaleString()}</td>
                                    <td className="p-2">
                                        <select
                                            className="border rounded px-2 py-1"
                                            value={(o.status ?? '').toUpperCase()}
                                            onChange={(e) => onChangeStatus(o.id, e.target.value)}
                                        >
                                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                    <td className="p-2 text-center">
                                        <button
                                            className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                                            onClick={() => toggleExpand(o.id)}
                                        >
                                            {expanded[o.id] ? 'Hide items' : 'View items'}
                                        </button>
                                    </td>
                                </tr>

                                {expanded[o.id] && (
                                    <tr className="bg-gray-50">
                                        <td className="p-3" colSpan={7}>
                                            {itemsByOrder[o.id]?.length ? (
                                                <table className="w-full text-sm">
                                                    <thead>
                                                    <tr className="text-gray-500">
                                                        <th className="p-1 text-left">Item</th>
                                                        <th className="p-1 text-right">Qty</th>
                                                        <th className="p-1 text-right">Unit</th>
                                                        <th className="p-1 text-right">Total</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {itemsByOrder[o.id].map(it => (
                                                        <tr key={it.id} className="border-t">
                                                            <td className="p-1">{it.productName}</td>
                                                            <td className="p-1 text-right">{it.quantity}</td>
                                                            <td className="p-1 text-right">${Number(it.price ?? 0).toLocaleString()}</td>
                                                            <td className="p-1 text-right">${Number(it.totalPrice ?? 0).toLocaleString()}</td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <div className="text-gray-500">No items</div>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                        {!filtered.length && (
                            <tr>
                                <td colSpan={7} className="p-6 text-center text-gray-500">
                                    No orders found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
