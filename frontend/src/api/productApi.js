// src/api/productApi.js
import apiClient from './apiClient';

// helper: unwrap Spring Page -> array
const unwrap = (data) => (Array.isArray(data) ? data : (data?.content ?? []));

// ----- READ -----
export const getAllProducts = (page = 0, size = 24, extra = {}) =>
    apiClient.get('/api/products', { params: { page, size, ...extra }});

export const getProductById = (id) =>
    apiClient.get(`/api/products/${id}`);

export const getNewArrivals = async (page = 0, size = 24) => {
    const { data } = await apiClient.get('/api/products', {
        params: { page, size, newArrival: true }
    });
    return unwrap(data);
};

export const getLandingNewArrivals = async (size = 16) => {
    const { data } = await apiClient.get('/api/products', {
        params: { page: 0, size, newArrival: true }
    });
    return unwrap(data);
};

export const getBestSellers = async (page = 0, size = 24) => {
    const { data } = await apiClient.get('/api/products', {
        params: { page, size, bestSeller: true }
    });
    return unwrap(data);
};

export const searchProducts = async (keyword, page = 0, size = 24) => {
    const { data } = await apiClient.get('/api/products/search', {
        params: { query: keyword, page, size }
    });
    return unwrap(data);
};

// Sorted products (restored to fix build)
export const getSortedProducts = async (sortBy, page = 0, size = 24) => {
    // If your backend uses /api/products/shop, change the path below accordingly.
    const { data } = await apiClient.get('/api/products', {
        params: { sortBy, page, size }
    });
    return unwrap(data);
};

// ----- WRITE (admin) -----
export const createProduct = (productData) =>
    apiClient.post('/api/products', productData);

export const updateProduct = (id, productData) =>
    apiClient.put(`/api/products/${id}`, productData);

export const deleteProduct = (id) =>
    apiClient.delete(`/api/products/${id}`);

// By category
export const getProductsByCategory = async (category, page = 0, size = 24) => {
    const { data } = await apiClient.get('/api/products', {
        params: { category, page, size }
    });
    return unwrap(data);
};
