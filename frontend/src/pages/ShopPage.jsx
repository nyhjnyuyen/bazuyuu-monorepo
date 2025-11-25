// src/pages/ShopPage.jsx
import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { addToCart } from '../api/cartApi';
import { CustomerContext } from '../components/CustomerContext';
import useWishlist from '../hook/useWishlist';
import xiaogui1 from '../assets/xiaogui_01.png';
import xiaogui2 from '../assets/xiaogui_02.png';
import xiaogui3 from '../assets/xiaogui_03.png';
import xiaogui4 from '../assets/xiaogui_04.png';
import xiaogui5 from '../assets/xiaogui_05.png';
import xiaogui6 from '../assets/xiaogui_06.png';
import xiaogui7 from '../assets/xiaogui_07.png';
import xiaogui8 from '../assets/xiaogui_08.png';
import xiaogui9 from '../assets/xiaogui_09.png';
import xiaogui10 from '../assets/xiaogui_10.png';
import xiaogui11 from '../assets/xiaogui_11.png';
const PAGE_SIZE = 24;

// ALL = “haven’t chosen family yet”
const CATEGORIES = ['ALL', '', 'XIAO_KOU', 'VEGETABLE'];

const FAMILY_DEFS = [
    {
        id: 'CRUX',
        title: "Gia Đình U U",
        images: [
            "/story/vegetable/1.jpg",
            "/story/vegetable/2.jpg",
            "/story/vegetable/3.jpg",
        ]
    },
    {
        id: 'XIAO_KOU',
        title: "Xiao Kou",
        images: [
            xiaogui1, xiaogui2, xiaogui3,xiaogui4, xiaogui5, xiaogui6,xiaogui7, xiaogui8, xiaogui9,xiaogui10, xiaogui11
        ]
    },
    {
        id: 'KINGKONG',
        title: "KingKong",
        images: [

        ]
    }
];

export default function ShopPage() {
    const location = useLocation();
    const navigate = useNavigate();

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

    // react to URL → category
    useEffect(() => {
        const q = new URLSearchParams(location.search).get('category');
        const next = (q || 'ALL').toUpperCase();
        if (CATEGORIES.includes(next) && next !== category) {
            setCategory(next);
            setPage(0);
            setProducts([]);
            setTotalElements(0);
            setTotalPages(0);
        }
    }, [location.search]);

    // only build URL when a family is chosen
    const url = useMemo(() => {
        if (!category || category === 'ALL') return null;
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('size', String(PAGE_SIZE));
        params.set('category', category);
        return `/api/products?${params.toString()}`;
    }, [category, page]);

    // fetch products for chosen family
    useEffect(() => {
        if (!url) return; // chưa chọn gia đình → không fetch

        const ac = new AbortController();

        (async () => {
            setLoading(true);
            try {
                const res = await fetch(url, { signal: ac.signal });

                if (!res.ok) {
                    console.error('Shop fetch failed: HTTP', res.status);
                    if (!ac.signal.aborted) {
                        setError(`Could not load products (HTTP ${res.status}).`);
                        if (page === 0) {
                            setProducts([]);
                            setTotalElements(0);
                            setTotalPages(0);
                        }
                    }
                    return;
                }

                const ct = res.headers.get('content-type') || '';
                if (!ct.includes('application/json')) {
                    console.error('Shop fetch failed: Expected JSON, got', ct);
                    if (!ac.signal.aborted) {
                        setError('Could not load products (bad content type).');
                        if (page === 0) {
                            setProducts([]);
                            setTotalElements(0);
                            setTotalPages(0);
                        }
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
                setProducts(prev =>
                    page === 0 ? newContent : [...prev, ...newContent]
                );
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
    }, [url, page]);

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
            alert(` ${product.name} added to cart!`);
        } catch (e) {
            console.error('Add to cart failed:', e);
            alert('Failed to add to cart. Please try again.');
        }
    };

    const currentFamilyStory =
        category !== 'ALL'
            ? FAMILY_DEFS.find((f) => f.id === category)
            : null;

    // ─────────────────────────────
    // 1️⃣ SCREEN: CHỌN GIA ĐÌNH
    // ─────────────────────────────
    if (category === 'ALL') {
        return (
            <div className="flex flex-col min-h-screen bg-white">
                <main className="flex-grow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                        <h1 className="text-3xl md:text-4xl font-heading text-violet-925 text-center mb-6">
                            Chọn gia đình BAZUUYU bạn muốn khám phá
                        </h1>
                        <p className="text-center text-violet-925/80 max-w-2xl mx-auto mb-10 font-heading">
                            Mỗi “gia đình” là một thế giới câu chuyện riêng: concept, không khí,
                            style thiết kế và một bộ sản phẩm đi kèm. Hãy chọn gia đình mà bạn muốn
                            xem câu chuyện và sản phẩm nhé.
                        </p>

                        <div className="grid gap-6 md:grid-cols-3">
                            {FAMILY_DEFS.map((fam) => (
                                <button
                                    key={fam.id}
                                    type="button"
                                    onClick={() => onSelectCategory(fam.id)}
                                    className={`group text-left rounded-3xl border border-violet-200 bg-gradient-to-br ${fam.bg} p-5 md:p-6 shadow-sm hover:shadow-md hover:border-violet-500 transition flex flex-col h-full`}
                                >
                                    <span className="inline-flex items-center text-xs font-semibold uppercase tracking-[0.18em] text-violet-700 mb-3">
                                        {fam.badge}
                                    </span>
                                    <h2 className="text-xl md:text-2xl font-heading text-violet-950 mb-2">
                                        {fam.title}
                                    </h2>
                                    <p className="text-sm md:text-base font-heading text-violet-900 mb-4">
                                        {fam.tagline}
                                    </p>
                                    <p className="text-sm text-violet-900/80 flex-1">
                                        {fam.description}
                                    </p>
                                    <span className="mt-4 inline-flex items-center text-sm font-semibold text-violet-950 group-hover:underline">
                                        Xem câu chuyện &amp; sản phẩm →
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    // ─────────────────────────────
    // 2️⃣ SCREEN: STORY + PRODUCT LIST CỦA GIA ĐÌNH
    // ─────────────────────────────
    return (
        <div className="flex flex-col min-h-screen bg-white">
            <main className="flex-grow">
                {/* Header */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                    <button
                        type="button"
                        onClick={() => onSelectCategory('ALL')}
                        className="text-sm text-violet-700 mb-4 hover:underline"
                    >
                        ← Quay lại chọn gia đình
                    </button>

                    <h1 className="text-2xl md:text-3xl font-bold text-violet-925 mb-4">
                        {currentFamilyStory?.title || 'Gia đình BAZUUYU'}
                    </h1>
                    <p className="text-violet-925/80 font-heading max-w-2xl">
                        {currentFamilyStory?.description}
                    </p>
                </div>

                {/* Story highlight block */}
                {currentFamilyStory && (
                    <section className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div
                            className={`rounded-3xl border border-violet-100 bg-gradient-to-br ${currentFamilyStory.bg} p-6 md:p-8 mb-10`}
                        >
                            <p className="text-xs uppercase tracking-[0.22em] text-violet-800 mb-3">
                                Family Story
                            </p>
                            <h2 className="text-xl md:text-2xl font-heading text-violet-950 mb-2">
                                {currentFamilyStory.tagline}
                            </h2>
                            <p className="text-sm md:text-base text-violet-900 max-w-3xl">
                                {currentFamilyStory.description}
                            </p>
                        </div>
                    </section>
                )}

                {/* Product Grid */}
                {loading && products.length === 0 ? (
                    <p className="text-center">Loading...</p>
                ) : error && products.length === 0 ? (
                    <p className="text-center text-red-600">{error}</p>
                ) : products.length === 0 ? (
                    <p className="text-center text-violet-925/70">
                        No products found.
                    </p>
                ) : (
                    <>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-2">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 items-stretch">
                                {products.map((p) => (
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
                                Showing {products.length} of {totalElements} items in this
                                family
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
