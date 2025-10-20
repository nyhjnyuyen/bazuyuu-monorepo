import { useEffect, useState } from 'react';
import { addToWishlist, removeFromWishlist, getWishlist } from '../api/wishlistApi';

export default function useWishlist(customer) {
    const [wishlist, setWishlist] = useState([]);
    const [busyIds, setBusyIds] = useState(new Set()); // prevent double-click spam

    // normalize: your API may return full product objects or just ids
    const getId = (item) => (typeof item === 'object' ? (item.id ?? item.productId) : item);

    useEffect(() => {
        if (!customer?.id) {
            setWishlist([]);
            return;
        }
        getWishlist(customer.id)
            .then((data) => setWishlist(Array.isArray(data) ? data : []))
            .catch((err) => {
                console.error('Failed to fetch wishlist', err);
                setWishlist([]);
            });
    }, [customer?.id]);

    const isInWishlist = (productId) =>
        Array.isArray(wishlist) && wishlist.some((w) => getId(w) === productId);

    const toggleWishlist = async (productId) => {
        if (!customer?.id) {
            alert('Please login to use the wishlist.');
            return;
        }
        if (busyIds.has(productId)) return;
        setBusyIds((s) => new Set(s).add(productId));

        try {
            if (isInWishlist(productId)) {
                // optimistic remove
                setWishlist((prev) => prev.filter((w) => getId(w) !== productId));
                await removeFromWishlist(customer.id, productId);
            } else {
                // optimistic add (store minimal object so isInWishlist works)
                setWishlist((prev) => [...prev, { id: productId }]);
                await addToWishlist(customer.id, productId);
            }
        } catch (e) {
            console.error('Toggle wishlist failed:', e);
            // optional: refetch to heal state
            try {
                const data = await getWishlist(customer.id);
                setWishlist(Array.isArray(data) ? data : []);
            } catch {}
        } finally {
            setBusyIds((s) => {
                const ns = new Set(s);
                ns.delete(productId);
                return ns;
            });
        }
    };

    return { wishlist, isInWishlist, toggleWishlist };
}
