import React, { useEffect, useState, useContext, useCallback } from 'react';
import { CustomerContext } from '../components/CustomerContext';
import { getWishlist, removeFromWishlist } from '../api/wishlistApi';
import { addToCart } from '../api/cartApi';
import ProductCard from '../components/ProductCard';

export default function WishlistPage() {
    const { customer } = useContext(CustomerContext);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadWishlist = useCallback(() => {
        setLoading(true);
        getWishlist(customer?.id)
            .then((products) => setItems(Array.isArray(products) ? products : []))
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [customer?.id]);

    useEffect(() => { loadWishlist(); }, [loadWishlist]);
    useEffect(() => {
        const h = () => loadWishlist();
        window.addEventListener('wishlist-updated', h);
        return () => window.removeEventListener('wishlist-updated', h);
    }, [loadWishlist]);

    const handleAddToCart = async (product) => {
        try { await addToCart({ productId: product.id, quantity: 1 }); }
        catch (e) { console.error(e); }
    };

    const handleRemoveFromWishlist = async (product) => {
        try {
            await removeFromWishlist(product.id, customer?.id);
            setItems(prev => prev.filter(p => p.id !== product.id));
        } catch (e) { console.error(e); }
    };

    if (loading) return <p className="p-4">Loading your wishlist...</p>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <h2 className="text-2xl font-bold mb-6">Your Wishlist</h2>
            {items.length === 0 ? (
                <p>Your wishlist is empty.</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {items.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            isInWishlist={true}
                            onAddToCart={handleAddToCart}
                            onToggleWishlist={() => handleRemoveFromWishlist(product)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
