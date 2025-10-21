// src/components/CustomerContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';

export const CustomerContext = createContext({
    customer: null,
    setCustomer: (_value) => {},            // <-- accept one arg
    logout: () => {},
    wishlistUpdated: false,
    setWishlistUpdated: (_value) => {},     // <-- accept one arg
});

export const CustomerProvider = ({ children }) => {
    const [customer, setCustomer] = useState(null);
    const [wishlistUpdated, setWishlistUpdated] = useState(false);

    const logout = useCallback(() => {
        localStorage.removeItem('jwt');
        setCustomer(null);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiryMs = payload.exp * 1000;
            if (Number.isFinite(expiryMs)) {
                if (Date.now() >= expiryMs) logout();
                else return () => clearTimeout(setTimeout(logout, expiryMs - Date.now()));
            }
        } catch {
            logout();
        }
    }, [logout]);

    return (
        <CustomerContext.Provider
            value={{ customer, setCustomer, logout, wishlistUpdated, setWishlistUpdated }}
        >
            {children}
        </CustomerContext.Provider>
    );
};
