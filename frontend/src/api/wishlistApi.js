// src/api/wishlistApi.js
import apiClient from './apiClient';    // ← your axios.create() with the JWT interceptor

const BASE = '/wishlist';

export const addToWishlist = (customerId, productId) =>
    apiClient.post(
        `${BASE}/add`,
        null,
        { params: { customerId, productId } }
    );

export const removeFromWishlist = (customerId, productId) =>
    apiClient.delete(
        `${BASE}/remove`,
        { params: { customerId, productId } }
    );

export const getWishlist = (customerId) =>
    apiClient.get(`${BASE}/${customerId}`).then(res => res.data);
