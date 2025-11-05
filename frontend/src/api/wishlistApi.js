// frontend/src/api/wishlistApi.js
import axios from './axiosInstance';
import {
    toggleLocalWishlist,
    addToLocalWishlist,
    removeFromLocalWishlist,
    getLocalWishlist,
} from '../lib/localWishlist';

/**
 * Prefer passing customerId when logged in (from context: customer?.id).
 * Falls back between /wishlist/toggle and your current /wishlist/add|remove routes.
 */
export async function toggleWishlistApi(productId, customerId) {
    const token = localStorage.getItem('jwt');
    if (!token) { toggleLocalWishlist(productId); return { ok: true, source: 'local' }; }

    try {
        // If you later add a /wishlist/toggle (body: {productId}) this will work:
        await axios.post('/wishlist/toggle', { productId });
    } catch (e) {
        // Fallback to current backend: try remove first, then add
        try {
            await axios.delete('/wishlist/remove', { params: { customerId, productId } });
        } catch {
            await axios.post('/wishlist/add', null, { params: { customerId, productId } });
        }
    }
    window.dispatchEvent(new Event('wishlist-updated'));
    return { ok: true, source: 'server' };
}

export async function addToWishlist(productId, customerId) {
    const token = localStorage.getItem('jwt');
    if (!token) { addToLocalWishlist(productId); return { ok: true, source: 'local' }; }
    await axios.post('/wishlist/add', null, { params: { customerId, productId } });
    window.dispatchEvent(new Event('wishlist-updated'));
    return { ok: true, source: 'server' };
}

export async function removeFromWishlist(productId, customerId) {
    const token = localStorage.getItem('jwt');
    if (!token) { removeFromLocalWishlist(productId); return { ok: true, source: 'local' }; }
    // Try toggle endpoint first if you add it; otherwise use your current /remove
    try {
        await axios.post('/wishlist/toggle', { productId });
    } catch {
        await axios.delete('/wishlist/remove', { params: { customerId, productId } });
    }
    window.dispatchEvent(new Event('wishlist-updated'));
    return { ok: true, source: 'server' };
}

export async function getWishlist(customerId) {
    const token = localStorage.getItem('jwt');
    if (!token) return getLocalWishlist(); // [productId]
    // Match current backend route signature
    const { data } = await axios.get(`/wishlist/${customerId}`);
    return data;
}

export async function mergeWishlist(productIds) {
    return axios.post('/wishlist/merge', { productIds });
}
