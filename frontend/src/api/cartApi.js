// frontend/src/api/cartApi.js
import axios from './axiosInstance';
import { addToLocalCart, getLocalCart } from '../lib/localCart';

export async function addToCart({ productId, quantity = 1 }) {
    const token = localStorage.getItem('jwt');
    if (!token) {
        addToLocalCart(productId, quantity);
        return { ok: true, source: 'local' };
    }
    const { data } = await axios.post('/cart/items', { productId, quantity });
    return { ok: true, source: 'server', data };
}

export async function getCartItems(/* customerId */) {
    const token = localStorage.getItem('jwt');
    if (!token) return getLocalCart();
    const { data } = await axios.get('/cart/items');
    return data;
}

export async function mergeCart(items) {
    return axios.post('/cart/merge', { items });
}
