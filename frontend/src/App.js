// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

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

import NavBar from './components/NavBar';
import ProtectedRoute from './api/ProtectedRoute';
import { CustomerProvider } from './components/CustomerContext';

import { AdminAuthProvider } from './admin/AdminAuthContext';
import AdminLogin from './admin/AdminLoginPage';
import AdminDashboard from './admin/AdminDashboard'; // <-- import it once
import AdminOnlyRoute from './admin/AdminOnlyRoute';

function App() {
    return (
        <AdminAuthProvider>
            <CustomerProvider>
                <Router>
                    <div className="App relative font-serif">
                        <div className="relative z-10">
                            <NavBar />
                        </div>

                        <Routes>
                            <Route path="/" element={<LandingPage />} />
                            <Route path="/new" element={<NewArrivalsPage />} />
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

                            {/* Admin routes */}
                            <Route path="/admin/login" element={<AdminLogin />} />
                            <Route
                                path="/admin"
                                element={
                                    <AdminOnlyRoute>
                                        <AdminDashboard />
                                    </AdminOnlyRoute>
                                }
                            />
                        </Routes>
                    </div>
                </Router>
            </CustomerProvider>
        </AdminAuthProvider>
    );
}

export default App;
