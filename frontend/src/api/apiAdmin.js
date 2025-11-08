// src/api/apiAdmin.js
import apiClient from './axiosInstance'; // same folder

/** ───── AUTH ───── **/

// Admin login
export const loginAdmin = (credentials) =>
    apiClient.post('/admins/login', credentials);

// Create new admin (SUPER_ADMIN only)
export const createAdmin = (payload) =>
    apiClient.post('/admins/create', payload);

// Get all admins
export const getAllAdmins = () =>
    apiClient.get('/admins/all');

// Delete admin by ID (SUPER_ADMIN only)
export const deleteAdmin = (id, requesterId) =>
    apiClient.delete(`/admins/delete/${id}`, { params: { requesterId } });


/** ───── PRODUCTS (ADMIN + SUPER_ADMIN) ───── **/

// Create product
export const addProduct = (product) =>
    apiClient.post('/admins/products', product);

// Update product
export const updateProduct = (id, product) =>
    apiClient.put(`/admins/products/${id}`, product);

// Get all products
export const getAllProducts = () =>
    apiClient.get('/admins/products');

// Delete product
export const deleteProduct = (id) =>
    apiClient.delete(`/admins/products/${id}`);

// Upload product image via backend (optional if you’re using Supabase directly)
export const uploadProductImage = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/admins/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};


/** ───── ORDERS (ADMIN + SUPER_ADMIN) ───── **/

// List all orders (admin-only endpoint)
export const getAllOrders = () =>
    apiClient.get('/admins/orders');

// Get items for a specific order (uses /api/order-items controller)
export const getOrderItemsForOrder = (orderId) =>
    apiClient.get(`/order-items/order/${orderId}`);

// Update order status (?status=PAID, etc.)
export const updateOrderStatus = (orderId, status) =>
    apiClient.patch(`/admins/orders/${orderId}/status`, null, {
        params: { status },
    });
