import apiClient from '../api/axiosInstance';

// Admin login
export const loginAdmin = (credentials) =>
    apiClient.post('/api/admins/login', credentials);

// Create new admin (SUPER_ADMIN only)
export const createAdmin = (payload) =>
    apiClient.post('/api/admins/create', payload);

// Get all admins
export const getAllAdmins = () =>
    apiClient.get('/api/admins/all');

// Delete admin by ID
export const deleteAdmin = (id, requesterId) =>
    apiClient.delete(`/api/admins/delete/${id}`, { params: { requesterId } });

// Add product (SUPER_ADMIN only)
export const addProduct = (product) =>
    apiClient.post('/api/admins/products', product);

// Get all products
export const getAllProducts = () =>
    apiClient.get('/api/admins/products');

// Delete product
export const deleteProduct = (id) =>
    apiClient.delete(`/api/admins/products/${id}`);

// Upload product image
export const uploadProductImage = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/api/admins/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
