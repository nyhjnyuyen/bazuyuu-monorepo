import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export const CustomerContext = createContext({
    customer: null,
    logout: () => {},
    wishlistUpdated: false,
    setWishlistUpdated: () => {},
});

export const CustomerProvider = ({ children }) => {
    const [customer, setCustomer] = useState(null);
    const [wishlistUpdated, setWishlistUpdated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('jwt');
        if (!token) return;

        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000;

        if (Date.now() >= expiry) {
            logout(); // clear state and token
        } else {
            const timeout = setTimeout(() => logout(), expiry - Date.now());
            return () => clearTimeout(timeout); // clear if component unmounts
        }
    }, [customer]);


    const logout = () => {
        localStorage.removeItem('jwt');
        setCustomer(null);
    };

    return (
        <CustomerContext.Provider value={{
            customer,
            setCustomer,
            logout,
            wishlistUpdated,
            setWishlistUpdated,
        }}>
        {children}
        </CustomerContext.Provider>
    );
};
