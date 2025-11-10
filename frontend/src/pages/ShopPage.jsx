// src/pages/ShopPage.jsx
import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { addToCart } from '../api/cartApi';
import { CustomerContext } from '../components/CustomerContext';
import useWishlist from '../hook/useWishlist';

const PAGE_SIZE = 24;
const CATEGORIES = ['ALL', 'HOTPOT', 'BBQ', 'VEGETABLE'];

export default function ShopPage() {
    const location = useLocation();
    const navigate = useNavigate();
    // initialize from URL on first render
    const initialCategory = (() => {
        const q = new URLSearchParams(location.search).get('category');
        const val = (q || 'ALL').toUpperCase();
        return CATEGORIES.includes(val) ? val : 'ALL';
    })();
    const [category, setCategory] = useState(initialCategory);
    const [page, setPage] = useState(0);
    const [products, setProducts] = useState([]);
    const [totalElements, setTotalElements] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Wishlist context
    const { customer } = useContext(CustomerContext);
    const { isInWishlist, toggleWishlist } = useWishlist(customer);
    // reflect category → URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const current = (params.get('category') || 'ALL').toUpperCase();
        if (current !== category) {
            if (category === 'ALL') params.delete('category');
            else params.set('category', category);
            navigate(
                { pathname: '/shop', search: params.toString() ? `?${params}` : '' },
                { replace: true }
            );
        }
    }, [category, location.search, navigate]);

    // react to URL → category (Back/Forward or direct link)
    useEffect(() => {
        const q = new URLSearchParams(location.search).get('category');
        const next = (q || 'ALL').toUpperCase();
        if (CATEGORIES.includes(next) && next !== category) {
            setCategory(next);
            setPage(0);
            setProducts([]);
        }
    }, [location.search]);
    const url = useMemo(() => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('size', String(PAGE_SIZE));
        if (category && category !== 'ALL') params.set('category', category);
        return `/api/products?${params.toString()}`;
    }, [category, page]);

    useEffect(() => {
        const ac = new AbortController();

        (async () => {
            setLoading(true);
            try {
                const res = await fetch(url, { signal: ac.signal });

                if (!res.ok) {
                    console.error('Shop fetch failed: HTTP', res.status);
                    if (!ac.signal.aborted) {
                        setError(`Could not load products (HTTP ${res.status}).`);
                        if (page === 0) { setProducts([]); setTotalElements(0); setTotalPages(0); }
                    }
                    return;
                }

                const ct = res.headers.get('content-type') || '';
                if (!ct.includes('application/json')) {
                    console.error('Shop fetch failed: Expected JSON, got', ct);
                    if (!ac.signal.aborted) {
                        setError('Could not load products (bad content type).');
                        if (page === 0) { setProducts([]); setTotalElements(0); setTotalPages(0); }
                    }
                    return;
                }

                const json = await res.json();
                if (ac.signal.aborted) return;

                const newContent = json.content ?? [];
                const size = Number(json.size ?? PAGE_SIZE) || PAGE_SIZE;
                const elements = Number(json.totalElements ?? 0);
                const pages = Number.isFinite(json.totalPages)
                    ? json.totalPages
                    : Math.ceil(elements / size);

                setTotalElements(elements);
                setTotalPages(pages);
                setProducts(prev => (page === 0 ? newContent : [...prev, ...newContent]));
                setError('');
            } catch (e) {
                console.error('Shop fetch failed:', e);
                if (!ac.signal.aborted) {
                    setError('Could not load products.');
                    if (page === 0) {
                        setProducts([]);
                        setTotalElements(0);
                        setTotalPages(0);
                    }
                }
            } finally {
                if (!ac.signal.aborted) setLoading(false);
            }
        })();

        return () => ac.abort();
    }, [url]); // <- only url; it already encodes category + page


    const onSelectCategory = (cat) => {
        if (cat === category) return;
        setCategory(cat);
        setPage(0);
        setProducts([]);
        setTotalElements(0);
        setTotalPages(0);
        window.scrollTo(0, 0);
    };

    const hasMore = page + 1 < totalPages;
    const progress = totalElements ? (products.length / totalElements) * 100 : 0;

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
                {/* Header */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                    <h1 className="text-2xl md:text-3xl font-bold text-violet-925 mb-6">Shop</h1>

                    {/* Category bar */}
                    <div className="w-full bg-violet-950/10 rounded-xl px-4 sm:px-6 py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <span className="text-violet-925 text-base sm:text-lg font-brand font-semibold">
                {totalElements} items
              </span>

                            <div className="flex flex-wrap gap-3">
                                {CATEGORIES.map(cat => {
                                    const active = (cat === 'ALL' && category === 'ALL') || category === cat;
                                    return (
                                        <button
                                            key={cat}
                                            onClick={() => onSelectCategory(cat)}
                                            className={`px-4 py-2 rounded-full border transition ${
                                                active
                                                    ? 'bg-violet-950 text-white border-violet-950'
                                                    : 'bg-white text-violet-925 border-violet-300 hover:border-violet-600'
                                            }`}
                                        >
                                            {cat === 'ALL' ? 'All' : cat}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                {loading && products.length === 0 ? (
                    <p className="text-center">Loading...</p>
                ) : error && products.length === 0 ? (
                    <p className="text-center text-red-600">{error}</p>
                ) : products.length === 0 ? (
                    <p className="text-center text-violet-925/70">No products found.</p>
                ) : (
                    <>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 items-stretch auto-rows-[430px]">
                                {visible.map((p) => (
                                    <div key={p.id} className="h-full min-w-0">
                                        <ProductCard
                                            product={p}
                                            onAddToCart={handleAddToCart}
                                            isInWishlist={isInWishlist(p.id)}
                                            onToggleWishlist={() => toggleWishlist(p.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer with Show More */}
                        <div className="w-full flex flex-col items-center mt-12 space-y-4 mb-12">
                            <p className="text-violet-950 text-center text-lg font-heading">
                                Showing {products.length} of {totalElements} total
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
                                    disabled={loading}
                                    className="mt-2 px-6 py-2 border border-violet-950 text-violet-950 text-lg font-jakarta rounded-full
                             hover:bg-violet-100 transition disabled:opacity-50"
                                >
                                    {loading ? 'Loading…' : 'Show More'}
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
