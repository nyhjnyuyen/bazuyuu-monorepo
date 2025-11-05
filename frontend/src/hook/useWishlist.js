import { useEffect, useState } from 'react';
import { toggleWishlistApi } from '../api/wishlistApi';
import { getLocalWishlist, isInLocalWishlist } from '../lib/localWishlist';

export default function useWishlist(customer) {
    const [localSet, setLocalSet] = useState(new Set(getLocalWishlist()));

    useEffect(() => {
        const onUpdate = () => setLocalSet(new Set(getLocalWishlist()));
        window.addEventListener('wishlist-updated', onUpdate);
        return () => window.removeEventListener('wishlist-updated', onUpdate);
    }, []);

    const isInWishlist = (productId) => {
        if (!customer) return isInLocalWishlist(productId);
        // For logged-in pages you likely pre-fetched; otherwise add a remote check if needed
        return isInLocalWishlist(productId); // optional: also sync to local for instant UI
    };

    const toggleWishlist = async (productId) => {
        await toggleWishlistApi(productId); // api switches local/server
    };

    return { isInWishlist, toggleWishlist };
}
