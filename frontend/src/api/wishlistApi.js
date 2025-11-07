import axios from './axiosInstance';
import { ensureFreshJwtOrLogout, isJwtValidNow } from './auth';
import {
    toggleLocalWishlist,
    addToLocalWishlist,
    removeFromLocalWishlist,
    getLocalWishlist,
} from '../lib/localWishlist';

// stay on local for guests
const USE_GUEST_SERVER = false;

export async function addToWishlist(productId, customerId) {
    if (!isJwtValidNow()) {
        addToLocalWishlist(productId);
        window.dispatchEvent(new Event('wishlist-updated'));
        return { ok: true, source: 'local' };
    }
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
    if (!isJwtValidNow()) {
        removeFromLocalWishlist(productId);
        window.dispatchEvent(new Event('wishlist-updated'));
        return { ok: true, source: 'local' };
    }
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
    if (!isJwtValidNow()) {
        toggleLocalWishlist(productId);
        window.dispatchEvent(new Event('wishlist-updated'));
        return { ok: true, source: 'local' };
    }
    // emulate toggle on server with remove→add
    try {
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
    // called right after login; server-only
    return axios.post('/wishlist/merge', { productIds });
}
