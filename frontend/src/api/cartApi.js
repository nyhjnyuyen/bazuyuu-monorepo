import axios from './axiosInstance';
import { ensureFreshJwtOrLogout, isJwtValidNow } from './auth';
import { addToLocalCart, getLocalCart } from '../lib/localCart';

const USE_GUEST_SERVER = false;

export async function addToCart({ productId, quantity = 1 }) {
    if (!isJwtValidNow()) {
        addToLocalCart(productId, quantity);
        window.dispatchEvent(new Event('cart-updated'));
        window.dispatchEvent(new Event('open-cart-drawer'));   // 👈 add this
        return { ok: true, source: 'local' };
    }
    try {
        const { data } = await axios.post('/cart/items', { productId, quantity });
        window.dispatchEvent(new Event('cart-updated'));
        window.dispatchEvent(new Event('open-cart-drawer'));   // 👈 add this
        return { ok: true, source: 'server', data };
    } catch (e) {
        ensureFreshJwtOrLogout();
        addToLocalCart(productId, quantity);
        window.dispatchEvent(new Event('cart-updated'));
        window.dispatchEvent(new Event('open-cart-drawer'));   // 👈 add this
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
    // server-only, used immediately after login
    return axios.post('/cart/merge', { items }); // [{productId, quantity}]
}
