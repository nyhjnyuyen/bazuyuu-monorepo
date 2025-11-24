// src/api/productApi.js
import apiClient from '../api/axiosInstance';

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

export const getNewArrivals = async () => {
    const res = await apiClient.get('/products', {
        params: { page: 0, size: 100, newArrival: true },
    });
    return res.data.content || [];
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


// keep this — your build previously failed without it
export const getSortedProducts = async (sortBy, page = 0, size = 24) => {
    const { data } = await apiClient.get('/products', {
        params: { sortBy, page, size }
    });
    return unwrap(data);
};

export async function searchProducts({ keyword = '', category = '', page = 0, size = 24 }) {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (category) params.set('category', category);
    params.set('page', page);
    params.set('size', size);

    const res = await fetch(`/search?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to search products');
    return res.json(); // this is Spring's Page<ProductResponse>
}


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

