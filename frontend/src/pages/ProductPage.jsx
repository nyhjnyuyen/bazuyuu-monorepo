// src/pages/ProductPage.jsx
import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProduct, getProductsByCategory } from '../api/productApi';
import { addToCart } from '../api/cartApi';
import Footer from '../components/Footer';
import { CustomerContext } from '../components/CustomerContext';
import useWishlist from '../hook/useWishlist';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

import heart from '../assets/heart.png';
import shoppingCart from '../assets/shopping-cart.svg';

export default function ProductPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [activeImage, setActiveImage] = useState(null);

    const [addingId, setAddingId] = useState(null);
    const [inCartIds, setInCartIds] = useState(() => new Set());

    const { customer } = useContext(CustomerContext);
    const { isInWishlist, toggleWishlist } = useWishlist(customer);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        (async () => {
            try {
                const res = await getProduct(id);
                if (cancelled) return;
                const p = res?.data ?? null;
                setProduct(p);

                const imgs = normalizeImages(p);
                setActiveImage(imgs[0] ?? null);

                if (p?.category) {
                    const arr = await getProductsByCategory(p.category);
                    if (!cancelled) {
                        const list = (arr ?? [])
                            .filter(x => String(x.id) !== String(p.id))
                            .slice(0, 8);
                        setRelated(list);
                    }
                } else {
                    setRelated([]);
                }
            } catch (e) {
                console.error('Failed to load product:', e);
                if (!cancelled) {
                    setProduct(null);
                    setRelated([]);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        window.scrollTo(0, 0);
        return () => {
            cancelled = true;
        };
    }, [id]);

    const images = useMemo(() => normalizeImages(product), [product]);

    const handleAddToCart = async () => {
        if (!product) return;
        try {
            await addToCart({ productId: product.id, quantity: 1 });
            window.dispatchEvent(new Event('cart-updated'));
            alert(` ${product.name} đã được thêm vào giỏ hàng!`);
        } catch (e) {
            console.error('Add to cart failed', e);
            alert('Thêm vào giỏ thất bại. Xin vui lòng thử lại.');
        }
    };

    const handleAddRelatedToCart = async (item) => {
        setAddingId(item.id);
        try {
            await addToCart({ productId: item.id, quantity: 1 });
            setInCartIds(prev => {
                const next = new Set(prev);
                next.add(item.id);
                return next;
            });
            window.dispatchEvent(new Event('cart-updated'));
            alert(` ${item.name} đã được thêm vào giỏ hàng!`);
        } catch (e) {
            console.error('Add to cart failed', e);
            alert('Thêm vào giỏ thất bại. Xin vui lòng thử lại.');
        } finally {
            setAddingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                Loading…
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                    <p className="text-violet-925 text-xl font-heading mb-6">
                        Product not found.
                    </p>
                    <Link to="/shop" className="underline text-violet-925">
                        Back to Shop
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    const wishlisted = isInWishlist(product.id);
    const categoryLink = `/shop?category=${encodeURIComponent(product.category ?? '')}`;
    const priceFormatted = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(Number(product.price ?? 0));

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <main className="flex-grow bg-white">
                {/* ✔ MAX WIDTH LIKE LANDING PAGE / JELLYCAT */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    {/* Breadcrumb */}
                    <nav className="text-sm sm:text-base text-violet-925/70 mb-6">
                        <Link to="/shop" className="hover:underline">
                            Shop
                        </Link>
                        <span className="mx-2">/</span>
                        {product.category && (
                            <>
                                <Link to={categoryLink} className="hover:underline">
                                    {product.category}
                                </Link>
                                <span className="mx-2">/</span>
                            </>
                        )}
                        <span className="text-violet-925 font-heading">
              {product.name}
            </span>
                    </nav>

                    {/* HERO: gallery + details */}
                    <div className="grid gap-8 lg:gap-12 lg:grid-cols-2 items-start">
                        {/* Gallery column */}
                        <div className="w-full">
                            <div className="w-full bg-white">
                                <div className="aspect-square border border-violet-200 rounded-2xl flex items-center justify-center overflow-hidden">
                                    {activeImage ? (
                                        <img
                                            src={activeImage}
                                            alt={product.name}
                                            className="object-contain w-full h-full"
                                        />
                                    ) : (
                                        <div className="text-violet-925/40">No image</div>
                                    )}
                                </div>

                                {images.length > 1 && (
                                    <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-3">
                                        {images.map((src, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setActiveImage(src)}
                                                className={`aspect-square border rounded-xl overflow-hidden ${
                                                    activeImage === src
                                                        ? 'border-violet-900'
                                                        : 'border-violet-200'
                                                }`}
                                            >
                                                <img
                                                    src={src}
                                                    alt={`thumb-${i}`}
                                                    className="object-cover w-full h-full"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Details column */}
                        <div className="flex flex-col">
                            <h1 className="font-heading text-violet-925 text-2xl sm:text-3xl md:text-4xl leading-tight">
                                {product.name}
                            </h1>

                            <p className="mt-3 text-xl sm:text-2xl font-brand text-violet-925 font-semibold">
                                {priceFormatted}
                            </p>

                            {product.category && (
                                <p className="mt-2 text-violet-925/70 font-brand text-sm sm:text-base">
                                    Category: {product.category}
                                </p>
                            )}

                            {product.shortDescription && (
                                <p className="mt-4 text-violet-925/90 font-heading text-sm sm:text-base leading-relaxed">
                                    {product.shortDescription}
                                </p>
                            )}

                            {/* Buttons row – full width on mobile, side-by-side on desktop */}
                            <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <button
                                    onClick={() => toggleWishlist(product.id)}
                                    className={`flex-1 px-6 py-3 rounded-2xl border font-semibold flex items-center justify-center gap-2
                    ${
                                        wishlisted
                                            ? 'border-violet-900 bg-violet-100 text-violet-900'
                                            : 'border-violet-300 text-violet-925'
                                    }`}
                                >
                                    {wishlisted ? '♥ In Wishlist' : '♡ Add to Wishlist'}
                                </button>

                                <button
                                    onClick={handleAddToCart}
                                    className="flex-1 px-6 py-3 bg-violet-950 text-white rounded-2xl font-semibold hover:bg-violet-900"
                                >
                                    Add to Bag
                                </button>
                            </div>

                            {/* Jellycat-style accordions */}
                            <section className="mt-8 border-t border-gray-200 divide-y divide-gray-200">
                                <details className="group py-4">
                                    <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="font-heading text-sm sm:text-base text-violet-950">
                      PRODUCT DETAILS
                    </span>
                                        <span className="text-xl text-gray-500 group-open:rotate-45 transition-transform">
                      +
                    </span>
                                    </summary>
                                    <div className="mt-3 text-sm text-violet-900 font-heading leading-relaxed">
                                        {/* you can replace this with product.productDetails from backend */}
                                        {product.productDetails || product.description || 'No additional details.'}
                                    </div>
                                </details>

                                <details className="group py-4">
                                    <summary className="flex items-center justify-between cursor-pointer list-none">
                    <span className="font-heading text-sm sm:text-base text-violet-950">
                      SAFETY &amp; CARE
                    </span>
                                        <span className="text-xl text-gray-500 group-open:rotate-45 transition-transform">
                      +
                    </span>
                                    </summary>
                                    <div className="mt-3 text-sm text-violet-900 font-heading leading-relaxed">
                                        {/* replace with product.safetyCare if you have it */}
                                        {product.safetyCare ||
                                            'Surface clean only. Suitable for ages 3+. Do not tumble dry, dry clean or iron.'}
                                    </div>
                                </details>
                            </section>
                        </div>
                    </div>

                    {/* RELATED PRODUCTS – responsive like New Arrivals */}
                    <section className="mt-16">
                        <h2 className="mx-auto text-center font-heading text-violet-925 tracking-[0.08em] text-2xl sm:text-3xl md:text-display leading-tight mb-10">
                            RELATED PRODUCTS
                        </h2>

                        {related.length === 0 ? (
                            <p className="text-center text-violet-925/70">
                                No related products found.
                            </p>
                        ) : (
                            <div className="relative w-full">
                                <Swiper
                                    modules={[Navigation]}
                                    navigation
                                    spaceBetween={20}
                                    slidesPerView={1}
                                    breakpoints={{
                                        640: { slidesPerView: 2 },
                                        1024: { slidesPerView: 3 },
                                        1280: { slidesPerView: 4 },
                                    }}
                                >
                                    {related.map((item) => {
                                        const wish = isInWishlist(item.id);
                                        const inCart = inCartIds.has(item.id);
                                        const imgSrc =
                                            item.imageUrls?.[0] || item.imageUrl || item.image;

                                        return (
                                            <SwiperSlide key={item.id} className="!h-auto flex">
                                                <div className="w-full h-full">
                                                    <div
                                                        className="border border-violet-950 rounded-[20px] bg-[#F6F2FF] flex flex-col items-center overflow-hidden h-full cursor-pointer"
                                                        onClick={() => navigate(`/product/${item.id}`)}
                                                    >
                                                        {/* image */}
                                                        <div className="w-full aspect-square bg-white flex items-center justify-center rounded-[20px] overflow-hidden">
                                                            {imgSrc ? (
                                                                <img
                                                                    src={imgSrc}
                                                                    alt={item.name}
                                                                    className="object-contain h-4/5 w-4/5"
                                                                />
                                                            ) : (
                                                                <span className="text-violet-300 text-sm">
                                  No image
                                </span>
                                                            )}
                                                        </div>

                                                        {/* text + actions */}
                                                        <div className="w-full px-4 py-4 flex flex-col flex-1">
                                                            <p
                                                                className="text-left text-base sm:text-lg font-heading text-violet-950 overflow-hidden"
                                                                style={{
                                                                    display: '-webkit-box',
                                                                    WebkitLineClamp: 2,
                                                                    WebkitBoxOrient: 'vertical',
                                                                    lineHeight: '1.6rem',
                                                                    height: '3.2rem',
                                                                }}
                                                            >
                                                                {item.name}
                                                            </p>

                                                            <div className="flex justify-between items-center mt-3 mt-auto">
                                                                <p className="justify-start text-violet-950 text-lg font-bold font-brand">
                                                                    {new Intl.NumberFormat('vi-VN', {
                                                                        style: 'currency',
                                                                        currency: 'VND',
                                                                        maximumFractionDigits: 0,
                                                                    }).format(Number(item.price ?? 0))}
                                                                </p>

                                                                <div className="flex gap-3">
                                                                    {/* Heart */}
                                                                    <button
                                                                        type="button"
                                                                        aria-label={wish ? 'Remove from wishlist' : 'Add to wishlist'}
                                                                        aria-pressed={wish}
                                                                        className={`w-9 h-9 rounded-full border transition flex items-center justify-center ${
                                                                            wish
                                                                                ? 'bg-violet-950 border-violet-950 hover:bg-violet-950'
                                                                                : 'bg-white border-violet-200 hover:bg-violet-100'
                                                                        }`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            e.preventDefault();
                                                                            toggleWishlist(item.id);
                                                                        }}
                                                                    >
                                                                        <img
                                                                            src={heart}
                                                                            alt=""
                                                                            className={`w-5 h-5 ${
                                                                                wish ? 'filter brightness-0 invert' : ''
                                                                            }`}
                                                                        />
                                                                    </button>

                                                                    {/* Cart */}
                                                                    <button
                                                                        type="button"
                                                                        aria-label={inCart ? 'Added to cart' : 'Add to cart'}
                                                                        disabled={addingId === item.id}
                                                                        className={`w-9 h-9 rounded-full border transition flex items-center justify-center ${
                                                                            inCart
                                                                                ? 'bg-violet-950 border-violet-950 hover:bg-violet-950'
                                                                                : 'bg-white border-violet-200 hover:bg-violet-100'
                                                                        } ${
                                                                            addingId === item.id
                                                                                ? 'opacity-50 pointer-events-none'
                                                                                : ''
                                                                        }`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            e.preventDefault();
                                                                            handleAddRelatedToCart(item);
                                                                        }}
                                                                    >
                                                                        <img
                                                                            src={shoppingCart}
                                                                            alt=""
                                                                            className={`w-5 h-5 ${
                                                                                inCart ? 'filter brightness-0 invert' : ''
                                                                            }`}
                                                                        />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </SwiperSlide>
                                        );
                                    })}
                                </Swiper>
                            </div>
                        )}
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}

function normalizeImages(p) {
    if (!p) return [];
    if (Array.isArray(p.imageUrls) && p.imageUrls.length) return p.imageUrls;
    if (Array.isArray(p.images) && p.images.length) return p.images;
    const single = p.imageUrl || p.image;
    return single ? [single] : [];
}
