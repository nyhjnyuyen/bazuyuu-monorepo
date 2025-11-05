import axios from './axiosInstance';
import { ensureFreshJwtOrLogout, isJwtValidNow } from './auth';
import {
    toggleLocalWishlist,
    addToLocalWishlist,
    removeFromLocalWishlist,
    getLocalWishlist,
} from '../lib/localWishlist';

export async function addToWishlist(productId, customerId) {
    if (!isJwtValidNow()) { addToLocalWishlist(productId); return { ok: true, source: 'local' }; }
    try {
        await axios.post('/wishlist/add', null, { params: { customerId, productId } });
        window.dispatchEvent(new Event('wishlist-updated'));
        return { ok: true, source: 'server' };
    } catch {
        ensureFreshJwtOrLogout();
        addToLocalWishlist(productId);
        return { ok: true, source: 'local-fallback' };
    }
}

export async function removeFromWishlist(productId, customerId) {
    if (!isJwtValidNow()) { removeFromLocalWishlist(productId); return { ok: true, source: 'local' }; }
    try {
        await axios.delete('/wishlist/remove', { params: { customerId, productId } });
        window.dispatchEvent(new Event('wishlist-updated'));
        return { ok: true, source: 'server' };
    } catch {
        ensureFreshJwtOrLogout();
        removeFromLocalWishlist(productId);
        return { ok: true, source: 'local-fallback' };
    }
}

export async function toggleWishlistApi(productId, customerId) {
    // purely client toggle for guests; server = add/remove pair
    if (!isJwtValidNow()) { toggleLocalWishlist(productId); return { ok: true, source: 'local' }; }
    try {
        // If you’ve NOT implemented /wishlist/toggle on backend, just try remove then add:
        await removeFromWishlist(productId, customerId);
    } catch {
        await addToWishlist(productId, customerId);
    }
    return { ok: true };
}

export async function getWishlist(customerId) {
    if (!isJwtValidNow()) return getLocalWishlist();
    try {
        const { data } = await axios.get(`/wishlist/${customerId}`);
        return data;
    } catch {
        ensureFreshJwtOrLogout();
        return getLocalWishlist();
    }
}

export async function mergeWishlist(productIds) {
    return axios.post('/wishlist/merge', { productIds });
}
