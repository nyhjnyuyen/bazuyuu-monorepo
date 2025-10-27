// src/components/NavBar.jsx
import React, { useEffect, useRef, useState, useContext } from 'react';
import { FiMenu, FiX, FiSearch } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/logo-11.png';
import user from '../assets/user.svg';
import heart from '../assets/heart.png';
import shoppingCart from '../assets/shopping-cart.svg';
import search from '../assets/search-normal.svg';
import { CustomerContext } from './CustomerContext';
import { getWishlist } from '../api/wishlistApi';
import { getCartItems } from '../api/cartApi';

export default function Navbar() {
    const containerRef = useRef(null);
    const leftRef = useRef(null);
    const logoRef = useRef(null);
    const rightRef = useRef(null);

    const [compact, setCompact] = useState(false);   // <— force mobile if true
    const [isOpen, setIsOpen] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const { customer, logout, wishlistUpdated } = useContext(CustomerContext);
    const navigate = useNavigate();

    const [wishlistCount, setWishlistCount] = useState(0);
    const [cartCount, setCartCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    useEffect(() => {
        if (!containerRef.current) return;

        const ro = new ResizeObserver(() => {
            const cw = containerRef.current.clientWidth;
            const L = leftRef.current?.offsetWidth ?? 0;
            const C = logoRef.current?.offsetWidth ?? 0;
            const R = rightRef.current?.offsetWidth ?? 0;
            const padding = 32; // header horizontal padding buffer

            setCompact(L + C + R + padding > cw);
        });

        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);

    useEffect(() => {
        if (customer) {
            getWishlist(customer.id)
                .then(wishlist => {
                const uniqueProductIds = new Set(wishlist.map(item => item.product.id));
                setWishlistCount(uniqueProductIds.size);
            })
                .catch(() => setWishlistCount(0));

            getCartItems(customer.id)
                .then(items => {
                    setCartCount(items.length);
                })
                .catch(() => setCartCount(0));
        } else {
            setWishlistCount(0);
            setCartCount(0);
        }
    }, [customer, wishlistUpdated]);

    const goSearch = () => {
        const kw = (searchTerm || '').trim();
        if (!kw) return;
        navigate(`/search?keyword=${encodeURIComponent(kw)}`);
        setIsOpen(false); // optional: close mobile menu after navigating
    };


    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            goSearch();
        }
    };

    return (
        <div className="w-full z-50 relative bg-white shadow-md font-['Instrument_Serif']">
            <div className="text-center py-1 bg-violet-925 text-white text-m font-heading">
                SUMMER SALE: UP TO 70% OFF SELECTED ITEMS
            </div>

            <div ref={containerRef} className="relative grid grid-cols-[auto_1fr_auto] items-center px-4 py-8 md:px-10">
                {/* Left: burger + links */}
                <div ref={leftRef} className="flex items-center gap-4">
                    {/* Burger appears if compact OR <md */}
                    <button
                        className={`text-2xl text-violet-920 ${compact ? '' : 'md:hidden'}`}
                        onClick={() => setIsOpen(o => !o)}
                        aria-label="Toggle menu"
                    >
                        {isOpen ? <FiX /> : <FiMenu />}
                    </button>

                    {/* Desktop links hidden when compact */}
                    <nav className={`${compact ? 'hidden' : 'hidden md:flex'} items-center gap-10 text-violet-925 font-brand lg:text-xl font-bold`}>
                        <Link to="/new" className="hover:underline">NEW</Link>
                        <Link to="/shop" className="hover:underline">SHOP</Link>
                        <Link to="/about" className="hover:underline">OUR STORY</Link>
                        <Link to="/contact" className="hover:underline">CONTACT</Link>
                    </nav>
                </div>

                {/* Center: logo (kept centered by CSS grid) */}
                <div ref={logoRef} className="justify-self-center">
                    <Link to="/">
                        <img src={logo} alt="Bazuuyu" className="h-[5rem] w-auto cursor-pointer" />
                    </Link>
                </div>

                {/* Right: search + icons */}
                <div ref={rightRef} className="flex items-center gap-4 justify-self-end min-w-0">
                    {/* Search hidden when compact to save space (still available in mobile sheet) */}
                    <div className={`${compact ? 'hidden' : 'hidden md:flex'} items-center h-10 rounded-full pl-3 pr-2 bg-gray-100/80 ring-1 ring-black/5 focus-within:ring-[#3d177d]/30 transition`}>
                        <input
                            type="search"
                            aria-label="Search our collection"
                            placeholder="Search our collection"
                            className="bg-transparent text-violet-950 placeholder-violet-950/40 font-heading border-r-0 px-3 leading-5 w-48 lg:w-64 outline-none"
                            value={searchTerm}
                            onChange={(e)=>setSearchTerm(e.target.value)}
                            onKeyDown={(e)=> e.key === 'Enter' && goSearch()}
                        />
                        <img src={search} alt="" className="w-5 h-5 ml-2 shrink-0 opacity-70" onClick={goSearch}/>
                    </div>

                    {/* User */}
                    <div
                        className="relative"
                        onMouseEnter={() => customer && setShowDropdown(true)}
                        onMouseLeave={() => customer && setShowDropdown(false)}
                    >
                        <img
                            src={user}
                            alt="User"
                            className="h-6 w-6 cursor-pointer"
                            onClick={() => navigate(customer ? '/profile' : '/login')}
                        />
                        {showDropdown && customer && (
                            <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow-md w-40 text-sm">
                                <div className="px-4 py-2 border-b">👋 {customer.username}</div>
                                <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">
                                    Profile
                                </Link>
                                <button
                                    onClick={() => { logout(); navigate('/login'); }}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                >
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Wishlist */}
                    <div className="relative cursor-pointer" onClick={() => navigate('/wishlist')}>
                        <img src={heart} alt="Wishlist" className="h-6 w-6" />
                        {wishlistCount > 0 && (
                            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">
                {wishlistCount}
              </span>
                        )}
                    </div>

                    {/* Cart */}
                    <div className="relative cursor-pointer" onClick={() => navigate('/cart')}>
                        <img src={shoppingCart} alt="Cart" className="h-6 w-6" />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">
                {cartCount}
              </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {(compact || isOpen) && (
                <div className="md:hidden flex flex-col bg-white px-6 py-2 space-y-2 text-violet-925">
                    <Link to="/new">NEW</Link>
                    <Link to="/shop">SHOP</Link>
                    <Link to="/about">OUR STORY</Link>
                    <Link to="/contact">CONTACT</Link>
                    <div className="flex items-center h-10 rounded-full pl-3 pr-2 bg-gray-100/80 ring-1 ring-black/5 focus-within:ring-[#3d177d]/30 transition">
                        <input
                            type="search"
                            aria-label="Search our collection"
                            placeholder="Search our collection"
                            className="bg-transparent font-sans placeholder:font-sans placeholder:text-black/40 text-[#3d177d] text-[16px] leading-5 w-full outline-none"
                            value={searchTerm}
                            onChange={(e)=>setSearchTerm(e.target.value)}
                            onKeyDown={(e)=> e.key === 'Enter' && goSearch()}
                        />
                        <FiSearch className="w-5 h-5 ml-2 shrink-0 text-[#3d177d]/70 cursor-pointer" onClick={goSearch}/>
                    </div>
                </div>
            )}
        </div>
    );
}
