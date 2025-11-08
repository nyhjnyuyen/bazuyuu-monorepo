// src/admin/pages/ProductsControl.jsx
import React, { useEffect, useState } from 'react';
import {
    getAllProducts,
    addProduct,
    deleteProduct,
    updateProduct,
} from '../../api/apiAdmin';
import { useAdminAuth } from '../AdminAuthContext';
import { supabase } from '../../supabaseClient';

export default function ProductsControl() {
    const { isAdmin } = useAdminAuth();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // form state
    const [editingId, setEditingId] = useState(null);
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState(''); // we’ll map this into imageUrls: [imageUrl]
    const [quantity, setQuantity] = useState('');
    const [bestSeller, setBestSeller] = useState(false);
    const [newArrival, setNewArrival] = useState(false);

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setPrice('');
        setCategory('');
        setDescription('');
        setImageUrl('');
        setQuantity('');
        setBestSeller(false);
        setNewArrival(false);
    };


    const loadProducts = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await getAllProducts(); // GET /api/admins/products
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

    const startEdit = (p) => {
        setEditingId(p.id);
        setName(p.name ?? '');
        setPrice(p.price != null ? String(p.price) : '');
        setCategory(p.category ?? '');
        setDescription(p.description ?? '');

        const firstImg = Array.isArray(p.imageUrls) ? p.imageUrls[0] : '';
        setImageUrl(firstImg || '');

        setQuantity(p.quantity != null ? String(p.quantity) : '');
        setBestSeller(Boolean(p.bestSeller ?? p.isBestSeller));   // handle either shape
        setNewArrival(Boolean(p.newArrival ?? p.isNewArrival));
    };


    async function uploadToSupabase(file) {
        const fileName = `${Date.now()}-${file.name}`;
        const { data, error } = await supabase.storage
            .from('product-images') // your bucket name
            .upload(fileName, file);

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(data.path);

        return publicUrlData.publicUrl; // 👈 this is the URL we store
    }

    const handleImageFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setLoading(true);
            const url = await uploadToSupabase(file);
            setImageUrl(url);           // now the form will send this as imageUrls[0]
        } catch (err) {
            console.error('Upload failed', err);
            alert('Image upload failed');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isAdmin) {
            alert('Only admins can create or edit products.');
            return;
        }

        const payload = {
            name: name.trim(),
            price: Number(price || 0),
            category: category.trim() || null,      // must match your Category enum name
            description: description.trim() || null,
            imageUrls: imageUrl ? [imageUrl.trim()] : [],

            quantity: Number(quantity || 0),
            // For your Java fields named `isBestSeller`, `isNewArrival`,
            // Jackson will usually map JSON keys `bestSeller` and `newArrival`.
            bestSeller,
            newArrival,
        };


        try {
            setLoading(true);
            setError('');
            if (editingId) {
                await updateProduct(editingId, payload);   // PUT /api/admins/products/{id}
                alert('Product updated.');
            } else {
                await addProduct(payload);                // POST /api/admins/products
                alert('Product created.');
            }
            resetForm();
            await loadProducts();
        } catch (e) {
            console.error('Save product failed', e);
            setError('Failed to save product.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!isAdmin) {
            alert('Only admins can delete products.');
            return;
        }
        if (!window.confirm('Delete this product?')) return;

        try {
            setLoading(true);
            setError('');
            await deleteProduct(id);  // DELETE /api/admins/products/{id}
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (e) {
            console.error('Delete failed', e);
            setError('Failed to delete product.');
        } finally {
            setLoading(false);
        }
    };

    const isEditing = Boolean(editingId);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Products</h1>

            {error && <p className="mb-4 text-red-600">{error}</p>}

            {isAdmin && (
                <div className="mb-8 border rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">
                            {isEditing ? `Edit Product #${editingId}` : 'Create New Product'}
                        </h2>
                        {isEditing && (
                            <button
                                type="button"
                                className="text-sm text-blue-600 underline"
                                onClick={resetForm}
                            >
                                Cancel edit
                            </button>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
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
                        {/* Manual URL field */}
                        <input
                            className="border p-2 rounded"
                            placeholder="Image URL (or upload below)"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                        />
                        {/* File upload */}
                        <input
                            type="file"
                            accept="image/*"
                            className="border p-2 rounded md:col-span-2"
                            onChange={handleImageFileChange}
                        />
                        <textarea
                            className="border p-2 rounded md:col-span-2"
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <input
                            className="border p-2 rounded"
                            placeholder="Quantity"
                            type="number"
                            min="0"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                        />

                        <div className="flex items-center gap-4 md:col-span-2">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={bestSeller}
                                    onChange={(e) => setBestSeller(e.target.checked)}
                                />
                                Best seller
                            </label>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={newArrival}
                                    onChange={(e) => setNewArrival(e.target.checked)}
                                />
                                New arrival
                            </label>
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3">
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="px-4 py-2 rounded border border-gray-300"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 rounded bg-violet-950 text-white hover:bg-violet-800 disabled:opacity-50"
                            >
                                {loading ? 'Working…' : isEditing ? 'Save changes' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="border-b bg-gray-50">
                        <th className="p-2">ID</th>
                        <th className="p-2">Name</th>
                        <th className="p-2">Category</th>
                        <th className="p-2">Price</th>
                        <th className="p-2">Image</th>
                        <th className="p-2 text-center">Actions</th>
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
                        products.map((p) => {
                            const firstImg =
                                Array.isArray(p.imageUrls) && p.imageUrls.length
                                    ? p.imageUrls[0]
                                    : null;

                            return (
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
                                        {firstImg ? (
                                            <img
                                                src={firstImg}
                                                alt={p.name}
                                                className="w-12 h-12 object-cover rounded"
                                            />
                                        ) : (
                                            '—'
                                        )}
                                    </td>
                                    <td className="p-2 text-center space-x-2">
                                        {isAdmin ? (
                                            <>
                                                <button
                                                    onClick={() => startEdit(p)}
                                                    className="px-3 py-1 rounded border border-blue-500 text-blue-600 hover:bg-blue-50 text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(p.id)}
                                                    disabled={loading}
                                                    className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        ) : (
                                            <span className="text-gray-400 text-sm">View only</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
