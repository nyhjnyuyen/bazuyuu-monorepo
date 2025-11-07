import apiClient from '../api/axiosInstance';

// Admin login
export const loginAdmin = (credentials) =>
    apiClient.post('/admins/login', credentials);

// Create new admin (SUPER_ADMIN only)
export const createAdmin = (payload) =>
    apiClient.post('/admins/create', payload);

// Get all admins
export const getAllAdmins = () =>
    apiClient.get('/admins/all');

// Delete admin by ID
export const deleteAdmin = (id, requesterId) =>
    apiClient.delete(`/admins/delete/${id}`, { params: { requesterId } });

// Add product (SUPER_ADMIN only)
export const addProduct = (product) =>
    apiClient.post('/admins/products', product);

// Get all products
export const getAllProducts = () =>
    apiClient.get('/admins/products');

// Delete product
export const deleteProduct = (id) =>
    apiClient.delete(`/admins/products/${id}`);

// Upload product image
export const uploadProductImage = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/admins/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
};
