import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import NewArrivalsPage from './pages/NewArrivalsPage';
import AboutUsPage from './pages/AboutUsPage';
import NavBar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import CartPage from './pages/CartPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from "./pages/ResetPasswordPage";
import RequestResetPage from './pages/RequestResetPage';
import CustomerProfile from "./pages/CustomerProfile";
import { CustomerProvider } from './components/CustomerContext';
import ProtectedRoute from "./api/ProtectedRoute";
import WishlistPage from './pages/WishlistPage';
import ShopPage from './pages/Shop';
import ContactPage from './pages/Contact';
import CheckoutPage from './pages/CheckoutPage';
import SearchPage from './pages/SearchPage';
import ProductPage from './pages/ProductPage';
function App() {
    return (
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
                        <Route path="/cart" element={<CartPage />} />
                        <Route path="/checkout" element={<CheckoutPage />} />
                        <Route path="/thank-you" element={<div className="p-8">Thank you! Your order has been placed.</div>} />
                        <Route path="/shop" element={<ShopPage />} />
                        <Route path="/product/:id" element={<ProductPage />} />
                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="/forgot-password" element={<RequestResetPage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <CustomerProfile />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </div>
            </Router>
        </CustomerProvider>
    );
}


export default App;
