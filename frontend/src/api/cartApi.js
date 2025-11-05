import axios from './axiosInstance';
import { ensureFreshJwtOrLogout, isJwtValidNow } from './auth';
import { addToLocalCart, getLocalCart } from '../lib/localCart';

export async function addToCart({ productId, quantity = 1 }) {
    if (!isJwtValidNow()) {
        addToLocalCart(productId, quantity);
        return { ok: true, source: 'local' };
    }
    try {
        const { data } = await axios.post('/cart/items', { productId, quantity });
        return { ok: true, source: 'server', data };
    } catch (e) {
        // token might be invalid server-side – switch to guest
        ensureFreshJwtOrLogout();
        addToLocalCart(productId, quantity);
        return { ok: true, source: 'local-fallback' };
    }
}

export async function getCartItems() {
    if (!isJwtValidNow()) return getLocalCart();
    try {
        const { data } = await axios.get('/cart/items');
        return data;
    } catch {
        ensureFreshJwtOrLogout();
        return getLocalCart();
    }
}

export async function mergeCart(items) {
    // items: [{productId, quantity}]
    return axios.post('/cart/merge', { items });
}
