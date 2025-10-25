// src/api/cartApi.js
import apiClient from './apiClient';

const API_BASE = '/api/cart';

/**
 * Fetch the *active* cart for a customer,
 * and return its list of CartItems.
 */
export const getCartItems = async () => {
    const { data } = await apiClient.get('/cart/customer'); // no ID param
    return data.items;
};


/** add, remove, update as you already have… */
export const addToCart = async (requestBody) =>
    apiClient.post(`${API_BASE}/items`, requestBody);

export const removeFromCart = async (itemId) =>
    apiClient.delete(`${API_BASE}/items/${itemId}`);
