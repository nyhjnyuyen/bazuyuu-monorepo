// src/api/productApi.js
import apiClient from './apiClient';

// helper: unwrap Spring Page -> array
const unwrap = (data) => (Array.isArray(data) ? data : (data?.content ?? []));

// ---------- READ ----------
export const getAllProducts = async (page = 0, size = 24, extra = {}) => {
    const { data } = await apiClient.get('/products', {
        params: { page, size, ...extra }
    });
    return unwrap(data); // <-- returns an array of products
};

export const getProductById = (id) =>
    apiClient.get(`/products/${id}`);

// alias for older imports
export const getProduct = (id) => getProductById(id);

export const getNewArrivals = async (page = 0, size = 24) => {
    const { data } = await apiClient.get('/products', {
        params: { page, size, newArrival: true }
    });
    return unwrap(data);
};

export const getLandingNewArrivals = async (size = 16) => {
    const { data } = await apiClient.get('/products', {
        params: { page: 0, size, newArrival: true }
    });
    return unwrap(data);
};

export const getBestSellers = async (page = 0, size = 24) => {
    const { data } = await apiClient.get('/products', {
        params: { page, size, bestSeller: true }
    });
    return unwrap(data);
};

export const searchProducts = async (keyword, page = 0, size = 24) => {
    const { data } = await apiClient.get('/products/search', {
        params: { query: keyword, page, size }
    });
    return unwrap(data);
};

// keep this — your build previously failed without it
export const getSortedProducts = async (sortBy, page = 0, size = 24) => {
    const { data } = await apiClient.get('/products', {
        params: { sortBy, page, size }
    });
    return unwrap(data);
};

// ---------- WRITE (admin) ----------
export const createProduct = (productData) =>
    apiClient.post('/products', productData);

export const updateProduct = (id, productData) =>
    apiClient.put(`/products/${id}`, productData);

export const deleteProduct = (id) =>
    apiClient.delete(`/products/${id}`);

// by category
export const getProductsByCategory = (category, page = 0, size = 24) =>
    getAllProducts(page, size, { category });

