// src/api/productApi.js
import apiClient from './apiClient';

// Get all products
export const getAllProducts = () => {
    return apiClient.get('/products');
};

// Get a single product by ID
export const getProductById = (id) => {
    return apiClient.get(`/products/${id}`);
};

// Get new arrivals
export const getNewArrivals = () => {
    return apiClient.get('/products/new-arrivals');
};
export const getLandingNewArrivals = () => {
    return apiClient.get('/products/landing-new-arrivals');
};

// Get best sellers
export const getBestSellers = () => {
    return apiClient.get('/products/best-sellers');
};

// Search products by keyword
export const searchProducts = (keyword) => {
    return apiClient.get(`/products/search?query=${encodeURIComponent(keyword)}`);
};

// Create a new product (admin only)
export const createProduct = (productData) => {
    return apiClient.post('/products', productData);
};

// Update an existing product by ID (admin only)
export const updateProduct = (id, productData) => {
    return apiClient.put(`/products/${id}`, productData);
};

// Delete a product by ID (admin only)
export const deleteProduct = (id) => {
    return apiClient.delete(`/products/${id}`);
};

export const getSortedProducts = (sortBy) => {
    return apiClient.get(`/products/shop?sortBy=${sortBy}`);
};
// Get one product by id
export const getProduct = (id) =>
    apiClient.get(`/products/${id}`);

// Get products by category (backend filter preferred)
export const getProductsByCategory = (category) =>
    apiClient.get('/products', { params: { category } });
