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
        if (!customer?.id) return;
        setLoading(true);
        getWishlist(customer.id)
            .then((res) => {
                const list = Array.isArray(res) ? res : res?.wishlist;
                setItems(Array.isArray(list) ? list : []);
            })
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, [customer?.id]);

    useEffect(() => {
        loadWishlist();
    }, [loadWishlist]);

    const handleAddToCart = async (product) => {
        if (!customer?.id) return;
        try {
            await addToCart(customer.id, product.id, 1);
            console.log('Added to cart:', product.name);
        } catch (e) {
            console.error('Failed to add to cart:', e);
        }
    };

    const handleRemoveFromWishlist = async (product) => {
        if (!customer?.id) return;
        try {
            await removeFromWishlist(customer.id, product.id);
            setItems((prev) => prev.filter((it) => it?.product?.id !== product.id));
        } catch (e) {
            console.error('Failed to remove from wishlist:', e);
        }
    };

    if (!customer) return <p className="p-4">Please login to view your wishlist.</p>;
    if (loading) return <p className="p-4">Loading your wishlist...</p>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            <h2 className="text-2xl font-bold mb-6">Your Wishlist</h2>

            {items.length === 0 ? (
                <p>Your wishlist is empty.</p>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {items.map((it) => {
                        const product = it?.product ?? it;
                        return (
                            <ProductCard
                                key={product?.id}
                                product={product}
                                onAddToCart={handleAddToCart}
                                isInWishlist={true} // 👈 now it forces blue background
                                onToggleWishlist={() => handleRemoveFromWishlist(product)}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
