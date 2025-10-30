// src/pages/NewArrivalsPage.jsx
import React, { useEffect, useState, useContext } from 'react';
import NewArrivalsBanner from '../assets/bannernewarrival.png';
import Footer from '../components/Footer';

import { CustomerContext } from '../components/CustomerContext';
import useWishlist from '../hook/useWishlist';
import ProductCard from '../components/ProductCard';

import { getNewArrivals, getBestSellers, getSortedProducts } from '../api/productApi';
import { addToCart } from '../api/cartApi';

const SORT_OPTIONS = [
    { value: 'new',            label: 'New Arrivals' },   // default
    { value: 'bestseller',     label: 'Best Sellers' },
    { value: 'latest',         label: 'Latest' },
    { value: 'priceLowToHigh', label: 'Price: Low to High' },
    { value: 'priceHighToLow', label: 'Price: High to Low' },
];

const PAGE_SIZE = 16;

export default function NewArrivalsPage() {
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState('new'); // default = New Arrivals

    const { customer } = useContext(CustomerContext);
    const { isInWishlist, toggleWishlist } = useWishlist(customer);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            try {
                let res;

                // Map UI sort values to the right API calls
                switch (sort) {
                    case 'new':
                        res = await getNewArrivals();
                        break;
                    case 'bestseller':
                        res = await getBestSellers();
                        break;
                    case 'latest':
                        // If you have a real “latest” on backend use it; otherwise fall back to new arrivals
                        res = await getSortedProducts('latest').catch(() => getNewArrivals());
                        break;
                    case 'priceLowToHigh':
                    case 'priceHighToLow':
                        res = await getSortedProducts(sort);
                        break;
                    default:
                        res = await getNewArrivals();
                }

                setProducts(res);
                console.log('new-arrivals length =', Array.isArray(res) ? res.length : -1);
                setPage(1); // reset pagination when sort changes
            } catch (e) {
                console.error('Failed to fetch products:', e);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetch();
    }, [sort]);

    const visible = products.slice(0, page * PAGE_SIZE);
    const hasMore = visible.length < products.length;
    const progress = products.length ? (visible.length / products.length) * 100 : 0;

    const handleAddToCart = async (product) => {
        try {
            await addToCart({ productId: product.id, quantity: 1 });
            alert(`🛒 ${product.name} added to cart!`);
        } catch (e) {
            console.error('Add to cart failed:', e);
            alert('Failed to add to cart. Please try again.');
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <main className="flex-grow">
                {/* Banner */}
                <img
                    src={NewArrivalsBanner}
                    alt="new-arrivals-banner"
                    className="w-full h-auto max-h-[60vh] object-cover rounded-xl mb-10"
                />

                {/* Filter + Sort bar */}
                <div className="w-full bg-violet-950/10 px-4 sm:px-6 py-4">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
            <span className="text-violet-925 text-base sm:text-lg font-brand font-semibold">
              {products.length} items
            </span>

                        <label className="flex items-center gap-3">
                            <span className="text-violet-925 text-lg font-semibold font-brand">Sort by</span>
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="bg-white border border-violet-300 rounded-xl px-3 py-2 min-w-[180px]
                           text-violet-925 font-brand focus:outline-none focus:ring-2 focus:ring-violet-400"
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <p className="text-center">Loading...</p>
                ) : (
                    <>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                            {visible.map((p) => (
                                <ProductCard
                                    key={p.id}
                                    product={p}
                                    onAddToCart={handleAddToCart}
                                    isInWishlist={isInWishlist(p.id)}
                                    onToggleWishlist={() => toggleWishlist(p.id)}
                                />
                            ))}
                        </div>

                        {/* Pagination footer */}
                        <div className="w-full flex flex-col items-center mt-12 space-y-4 mb-12">
                            <p className="text-violet-950 text-center text-lg font-heading">
                                Showing {visible.length} of {products.length} total
                            </p>

                            <div className="w-80 h-2 bg-violet-950/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-violet-950 rounded-full"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>

                            {hasMore && (
                                <button
                                    onClick={() => setPage((p) => p + 1)}
                                    className="mt-2 px-6 py-2 border border-violet-950 text-violet-950 text-lg font-jakarta
                             rounded-full hover:bg-violet-100 transition"
                                >
                                    Show More
                                </button>
                            )}
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </div>
    );
}
