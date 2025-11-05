// src/components/CustomerContext.js
import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { getLocalCart, clearLocalCart } from '../lib/localCart';
import { getLocalWishlist, clearLocalWishlist } from '../lib/localWishlist';
import { mergeCart } from '../api/cartApi';
import { mergeWishlist } from '../api/wishlistApi';

export const CustomerContext = createContext({
    customer: null,
    setCustomer: (_value) => {},
    logout: () => {},
    wishlistUpdated: false,
    setWishlistUpdated: (_value) => {},
    completeLogin: async (_token, _profile) => {},
});

export const CustomerProvider = ({ children }) => {
    const [customer, setCustomer] = useState(null);
    const [wishlistUpdated, setWishlistUpdated] = useState(false);
    const hasMergedRef = useRef(false); // ensure we merge only once per session

    const logout = useCallback(() => {
        localStorage.removeItem('jwt');
        setCustomer(null);
        hasMergedRef.current = false;
    }, []);

    // Guest -> Account merge
    const mergeAfterLogin = useCallback(async () => {
        try {
            const cart = getLocalCart(); // [{ productId, quantity }]
            if (cart.length) await mergeCart(cart);

            const wl = getLocalWishlist(); // [productId]
            if (wl.length) await mergeWishlist(wl);

            // clear only after successful merge
            clearLocalCart();
            clearLocalWishlist();
        } catch (e) {
            console.error('Merge after login failed', e);
            // keep local data if merge fails
        } finally {
            // refresh UI badges everywhere
            window.dispatchEvent(new Event('wishlist-updated'));
            window.dispatchEvent(new Event('cart-updated'));
        }
    }, []);

    // Public helper to finish login (call this right after /login returns token + profile)
    const completeLogin = useCallback(
        async (token, profile) => {
            localStorage.setItem('jwt', token);
            setCustomer(profile);
            if (!hasMergedRef.current) {
                hasMergedRef.current = true;
                await mergeAfterLogin();
            }
        },
        [mergeAfterLogin]
    );

    // Token expiry auto-logout
    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiryMs = payload.exp * 1000;
            if (Number.isFinite(expiryMs)) {
                if (Date.now() >= expiryMs) {
                    logout();
                } else {
                    const handle = setTimeout(logout, Math.max(0, expiryMs - Date.now()));
                    return () => clearTimeout(handle);
                }
            }
        } catch {
            logout();
        }
    }, [logout]);

    // Safety net: if app starts with existing JWT and you later set `customer`,
    // run the merge once (covers refresh after login or SSO redirects).
    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (customer && token && !hasMergedRef.current) {
            hasMergedRef.current = true;
            (async () => {
                await mergeAfterLogin();
            })();
        }
    }, [customer, mergeAfterLogin]);

    return (
        <CustomerContext.Provider
            value={{
                customer,
                setCustomer,
                logout,
                wishlistUpdated,
                setWishlistUpdated,
                completeLogin,
            }}
        >
            {children}
        </CustomerContext.Provider>
    );
};
