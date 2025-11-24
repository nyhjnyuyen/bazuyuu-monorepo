// src/App.js
import React from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    useLocation,
    Navigate,
} from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import NewArrivalsPage from './pages/NewArrivalsPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactPage from './pages/Contact';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import RequestResetPage from './pages/RequestResetPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import WishlistPage from './pages/WishlistPage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CustomerProfile from './pages/CustomerProfile';
import SearchPage from './pages/SearchPage';

import NavBar from './components/NavBar';
import ProtectedRoute from './api/ProtectedRoute';
import { CustomerProvider } from './components/CustomerContext';

import { AdminAuthProvider } from './admin/AdminAuthContext';
import AdminLayout from './admin/AdminLayout';
import AdminOnlyRoute from './admin/AdminOnlyRoute';
import AdminLoginPage from './admin/AdminLoginPage';
import OrdersPage from './admin/pages/OrdersPage';
import ProductsControl from './admin/pages/ProductsControl';
import AdminsPage from './admin/pages/AdminsPage';
import AdminLogout from './admin/AdminLogout';
// Shell to hide the customer NavBar inside /admin/*
function AppShell() {
    const { pathname } = useLocation();
    const inAdmin = pathname.startsWith('/admin');

    return (
        <div className="App relative font-serif overflow-x-hidden">
            {!inAdmin && (
                <div className="relative z-10">
                    <NavBar />
                </div>
            )}

            <Routes>
                {/* Customer site */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/new" element={<NewArrivalsPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/about" element={<AboutUsPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/forgot-password" element={<RequestResetPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <CustomerProfile />
                        </ProtectedRoute>
                    }
                />

                {/* Admin auth */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin/logout" element={<AdminLogout />} />

                {/* Legacy redirect if anything tries /admin/dashboard */}
                <Route
                    path="/admin/dashboard"
                    element={<Navigate to="/admin/products" replace />}
                />

                {/* Admin area */}
                <Route
                    path="/admin"
                    element={
                        <AdminOnlyRoute>
                            <AdminLayout />
                        </AdminOnlyRoute>
                    }
                >
                    <Route index element={<OrdersPage />} />
                    <Route path="orders" element={<OrdersPage />} />
                    <Route path="products" element={<ProductsControl />} />
                    <Route path="admins" element={<AdminsPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default function App() {
    return (
        <AdminAuthProvider>
            <CustomerProvider>
                <Router>
                    <AppShell />
                </Router>
            </CustomerProvider>
        </AdminAuthProvider>
    );
}