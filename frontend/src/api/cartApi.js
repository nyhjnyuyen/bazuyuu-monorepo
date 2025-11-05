import axios from './axiosInstance';
import { addToLocalCart, getLocalCart } from '../lib/localCart';

export async function addToCart({ productId, quantity = 1 }) {
    const token = localStorage.getItem('customer_token');
    if (!token) {                           // guest → local storage
        addToLocalCart(productId, quantity);
        return { ok: true, source: 'local' };
    }
    // logged in → server
    const { data } = await axios.post('/api/cart/items', { productId, quantity });
    return { ok: true, source: 'server', data };
}

export async function getCartItems(customerId) {
    const token = localStorage.getItem('customer_token');
    if (!token) return getLocalCart();      // guest
    const { data } = await axios.get('/api/cart/items'); // your existing endpoint
    return data;
}

export async function mergeCart(items) {  // used right after login
    // items: [{productId, quantity}]
    return axios.post('/api/cart/merge', { items });
}
