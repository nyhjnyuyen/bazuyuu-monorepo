import axios from './axiosInstance';
import { toggleLocalWishlist, getLocalWishlist } from '../lib/localWishlist';

export async function toggleWishlistApi(productId) {
    const token = localStorage.getItem('customer_token');
    if (!token) { toggleLocalWishlist(productId); return { ok: true, source: 'local' }; }
    const { data } = await axios.post('/api/wishlist/toggle', { productId });
    return { ok: true, source: 'server', data };
}

export async function getWishlist(customerId) {
    const token = localStorage.getItem('customer_token');
    if (!token) return getLocalWishlist(); // array of productIds
    const { data } = await axios.get('/api/wishlist'); // your existing endpoint
    return data;
}

export async function mergeWishlist(productIds) {
    return axios.post('/api/wishlist/merge', { productIds });
}
