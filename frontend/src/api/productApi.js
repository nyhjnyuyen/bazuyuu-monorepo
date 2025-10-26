// src/api/productApi.js
import apiClient from './apiClient';

// Helper: unwrap Spring Page -> array
const unwrap = (data) => (Array.isArray(data) ? data : (data?.content ?? []));

// All products (paged)
export const getAllProducts = (page = 0, size = 24, extra = {}) =>
    apiClient.get('/api/products', { params: { page, size, ...extra }});

// One product by ID
export const getProductById = (id) =>
    apiClient.get(`/api/products/${id}`);

// New arrivals (paged or array depending on your backend)
export const getNewArrivals = async (page = 0, size = 24) => {
    const { data } = await apiClient.get('/api/products', {
        params: { page, size, newArrival: true }
    });
    return unwrap(data);
};

// Landing page new arrivals (want exactly N items)
export const getLandingNewArrivals = async (size = 16) => {
    // if you have a dedicated endpoint, keep it; otherwise reuse /api/products
    const { data } = await apiClient.get('/api/products', {
        params: { page: 0, size, newArrival: true }
    });
    return unwrap(data);
};

// Best sellers
export const getBestSellers = async (page = 0, size = 24) => {
    const { data } = await apiClient.get('/api/products', {
        params: { page, size, bestSeller: true }
    });
    return unwrap(data);
};

// Search
export const searchProducts = async (keyword, page = 0, size = 24) => {
    const { data } = await apiClient.get('/api/products/search', {
        params: { query: keyword, page, size }
    });
    return unwrap(data);
};

// Admin: create / update / delete
export const createProduct = (productData) =>
    apiClient.post('/api/products', productData);

export const updateProduct = (id, productData) =>
    apiClient.put(`/api/products/${id}`, productData);

export const deleteProduct = (id) =>
    apiClient.delete(`/api/products/${id}`);

// Get products by category
export const getProductsByCategory = async (category, page = 0, size = 24) => {
    const { data } = await apiClient.get('/api/products', {
        params: { category, page, size }
    });
    return unwrap(data);
};
