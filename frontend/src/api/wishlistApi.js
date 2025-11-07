// src/api/wishlistApi.js
import axios from './axiosInstance';
import { ensureFreshJwtOrLogout, isJwtValidNow } from './auth';
import {
    toggleLocalWishlist,
    addToLocalWishlist,
    removeFromLocalWishlist,
    getLocalWishlist,
} from '../lib/localWishlist';

// -------- READ ----------
export async function getWishlist(customerId) {
    // GUEST: expand product IDs -> product objects
    if (!isJwtValidNow()) {
        const ids = getLocalWishlist();               // [productId]
        const products = await Promise.all(
            ids.map(async (id) => {
                try {
                    const { data } = await axios.get(`/products/${id}`); // public GET
                    return data;                                         // product object
                } catch {
                    return null;
                }
            })
        );
        return products.filter(Boolean);               // => product[]
    }

    // AUTHED: server returns [{id, product}] or {wishlist:[...]}
    try {
        const { data } = await axios.get(`/wishlist/${customerId}`);
        if (Array.isArray(data)) return data.map(w => w.product);
        if (Array.isArray(data?.wishlist)) return data.wishlist.map(w => w.product);
        return [];
    } catch {
        ensureFreshJwtOrLogout();
        return [];
    }
}

// -------- WRITE (unchanged behaviors) ----------
export async function addToWishlist(productId, customerId) {
    if (!isJwtValidNow()) { addToLocalWishlist(productId); window.dispatchEvent(new Event('wishlist-updated')); return { ok: true, source: 'local' }; }
    try {
        await axios.post('/wishlist/add', null, { params: { customerId, productId } });
        window.dispatchEvent(new Event('wishlist-updated'));
        return { ok: true, source: 'server' };
    } catch {
        ensureFreshJwtOrLogout();
        addToLocalWishlist(productId);
        window.dispatchEvent(new Event('wishlist-updated'));
        return { ok: true, source: 'local-fallback' };
    }
}

export async function removeFromWishlist(productId, customerId) {
    if (!isJwtValidNow()) { removeFromLocalWishlist(productId); window.dispatchEvent(new Event('wishlist-updated')); return { ok: true, source: 'local' }; }
    try {
        await axios.delete('/wishlist/remove', { params: { customerId, productId } });
        window.dispatchEvent(new Event('wishlist-updated'));
        return { ok: true, source: 'server' };
    } catch {
        ensureFreshJwtOrLogout();
        removeFromLocalWishlist(productId);
        window.dispatchEvent(new Event('wishlist-updated'));
        return { ok: true, source: 'local-fallback' };
    }
}

export async function toggleWishlistApi(productId, customerId) {
    if (!isJwtValidNow()) { toggleLocalWishlist(productId); window.dispatchEvent(new Event('wishlist-updated')); return { ok: true, source: 'local' }; }
    try { await removeFromWishlist(productId, customerId); }
    catch { await addToWishlist(productId, customerId); }
    return { ok: true };
}

export async function mergeWishlist(productIds) {
    return axios.post('/wishlist/merge', { productIds });
}
