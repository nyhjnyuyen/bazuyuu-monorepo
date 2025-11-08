// src/admin/pages/ProductsControl.jsx
import React, { useEffect, useState } from 'react';
import {
    getAllProducts,
    addProduct,
    deleteProduct,
} from '../../api/apiAdmin';
import { useAdminAuth } from '../AdminAuthContext';

export default function ProductsControl() {
    const { isSuperAdmin } = useAdminAuth();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // form state for creating a product
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await getAllProducts();           // GET /api/admins/products
            const list = Array.isArray(res.data) ? res.data : [];
            setProducts(list);
        } catch (e) {
            console.error('Failed to load products', e);
            setError('Failed to load products.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!isSuperAdmin) {
            alert('Only SUPER_ADMIN can create products.');
            return;
        }
        try {
            setLoading(true);
            setError('');

            const payload = {
                name: name.trim(),
                price: Number(price || 0),
                category: category.trim() || null,
                description: description.trim() || null,
                imageUrl: imageUrl.trim() || null,
            };

            await addProduct(payload);                    // POST /api/admins/products
            setName('');
            setPrice('');
            setCategory('');
            setDescription('');
            setImageUrl('');
            await loadProducts();
            alert('Product created.');
        } catch (e) {
            console.error('Create product failed', e);
            setError('Failed to create product.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        try {
            setLoading(true);
            setError('');
            await deleteProduct(id);                      // DELETE /api/admins/products/{id}
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (e) {
            console.error('Delete failed', e);
            setError('Failed to delete product.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Products</h1>

            {error && (
                <p className="mb-4 text-red-600">
                    {error}
                </p>
            )}

            {/* Create product (SUPER_ADMIN only) */}
            {isSuperAdmin && (
                <div className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
                    <h2 className="text-xl font-semibold mb-4">Create New Product</h2>
                    <form onSubmit={handleCreate} className="grid gap-3 md:grid-cols-2">
                        <input
                            className="border p-2 rounded"
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <input
                            className="border p-2 rounded"
                            placeholder="Price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                        <input
                            className="border p-2 rounded"
                            placeholder="Category (e.g. HOTPOT)"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                        <input
                            className="border p-2 rounded"
                            placeholder="Image URL"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                        />
                        <textarea
                            className="border p-2 rounded md:col-span-2"
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 rounded bg-violet-950 text-white hover:bg-violet-800 disabled:opacity-50"
                            >
                                {loading ? 'Working…' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Products table */}
            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="border-b bg-gray-50">
                        <th className="p-2">ID</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Category</th>
                        <th className="p-2">Price</th>
                        <th className="p-2">Image</th>
                        <th className="p-2 text-center">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {products.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="p-4 text-center text-gray-500">
                                {loading ? 'Loading…' : 'No products found.'}
                            </td>
                        </tr>
                    ) : (
                        products.map((p) => (
                            <tr key={p.id} className="border-b hover:bg-gray-50">
                                <td className="p-2">{p.id}</td>
                                <td className="p-2">{p.name}</td>
                                <td className="p-2">{p.category || '—'}</td>
                                <td className="p-2">
                                    {Number(p.price ?? 0).toLocaleString('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    })}
                                </td>
                                <td className="p-2">
                                    {p.imageUrl ? (
                                        <img
                                            src={p.imageUrl}
                                            alt={p.name}
                                            className="w-12 h-12 object-cover rounded"
                                        />
                                    ) : (
                                        '—'
                                    )}
                                </td>
                                <td className="p-2 text-center">
                                    <button
                                        onClick={() => handleDelete(p.id)}
                                        disabled={loading}
                                        className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
