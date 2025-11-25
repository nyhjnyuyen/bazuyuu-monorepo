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
                <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center">
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
            <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-5 lg:px-6 py-8 sm:py-10">
                {/* Breadcrumb */}
                <nav className="text-sm sm:text-base text-violet-925/70 mb-4 sm:mb-6">
                    <Link to="/shop" className="hover:underline">
                        Shop
                    </Link>
                    <span className="mx-1 sm:mx-2">/</span>
                    {product.category && (
                        <>
                            <Link to={categoryLink} className="hover:underline">
                                {product.category}
                            </Link>
                            <span className="mx-1 sm:mx-2">/</span>
                        </>
                    )}
                    <span className="text-violet-925 font-heading">{product.name}</span>
                </nav>

                {/* Main content */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
                    {/* Gallery */}
                    <div>
                        <div className="w-full aspect-[3/4] sm:aspect-[4/5] lg:aspect-square border border-violet-200 rounded-2xl flex items-center justify-center overflow-hidden">
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
                                            activeImage === src ? 'border-violet-900' : 'border-violet-200'
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

                    {/* Details */}
                    <div className="flex flex-col">
                        <h1 className="font-heading text-violet-925 text-2xl sm:text-3xl md:text-4xl leading-tight">
                            {product.name}
                        </h1>

                        {product.category && (
                            <p className="mt-2 text-sm sm:text-base text-violet-925/70 font-brand">
                                Category: {product.category}
                            </p>
                        )}

                        <p className="mt-4 text-2xl sm:text-3xl font-brand text-violet-925 font-semibold">
                            {priceFormatted}
                        </p>

                        {product.description && (
                            <p className="mt-5 sm:mt-6 text-sm sm:text-base md:text-lg text-violet-925/90 font-heading leading-relaxed">
                                {product.description}
                            </p>
                        )}

                        <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
                            <button
                                onClick={handleAddToCart}
                                className="px-5 sm:px-6 py-3 bg-violet-950 text-white rounded-2xl font-semibold hover:bg-violet-900 text-sm sm:text-base"
                            >
                                Add to cart
                            </button>
                            <button
                                onClick={() => toggleWishlist(product.id)}
                                className={`px-5 sm:px-6 py-3 rounded-2xl border font-semibold text-sm sm:text-base ${
                                    wishlisted
                                        ? 'border-violet-900 bg-violet-100 text-violet-900'
                                        : 'border-violet-300 text-violet-925'
                                }`}
                            >
                                {wishlisted ? '♥ In Wishlist' : '♡ Add to Wishlist'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Related products – same style vibe as NEW ARRIVALS */}
                <section className="mt-14 sm:mt-16">
                    <h2 className="mx-auto text-center font-heading text-violet-925 tracking-[0.08em] text-2xl sm:text-3xl md:text-display leading-tight mb-8 sm:mb-12">
                        RELATED PRODUCTS
                    </h2>

                    {related.length === 0 ? (
                        <p className="text-center text-violet-925/70">
                            No related products found.
                        </p>
                    ) : (
                        <div className="relative w-full max-w-7xl mx-auto px-0 sm:px-1 pb-6">
                            <Swiper
                                modules={[Navigation]}
                                navigation
                                spaceBetween={16}
                                slidesPerView={1.1}
                                breakpoints={{
                                    480: { slidesPerView: 1.4, spaceBetween: 16 },
                                    640: { slidesPerView: 2,   spaceBetween: 18 },
                                    1024:{ slidesPerView: 3,   spaceBetween: 20 },
                                    1280:{ slidesPerView: 4,   spaceBetween: 24 },
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
                                                    className="border border-violet-950 rounded-[18px] sm:rounded-[20px] bg-[#F6F2FF]
                                                               flex flex-col items-center overflow-hidden h-full cursor-pointer"
                                                    onClick={() => navigate(`/product/${item.id}`)}
                                                >
                                                    {/* image */}
                                                    <div className="w-full aspect-[3/4] sm:aspect-square bg-white flex items-center justify-center rounded-[18px] sm:rounded-[20px] overflow-hidden">
                                                        {imgSrc ? (
                                                            <img
                                                                src={imgSrc}
                                                                alt={item.name}
                                                                className="object-contain h-4/5 w-4/5"
                                                            />
                                                        ) : (
                                                            <span className="text-violet-300 text-xs sm:text-sm">
                                                                No image
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* text + actions */}
                                                    <div className="w-full px-3 sm:px-4 py-3 sm:py-4 flex flex-col flex-1">
                                                        <p
                                                            className="text-left text-sm sm:text-base md:text-lg font-heading text-violet-950 overflow-hidden"
                                                            style={{
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                lineHeight: '1.4rem',
                                                                height: '2.8rem',
                                                            }}
                                                        >
                                                            {item.name}
                                                        </p>

                                                        <div className="flex justify-between items-center mt-2 sm:mt-3 mt-auto">
                                                            <p className="text-violet-950 text-base sm:text-lg md:text-xl font-bold font-brand">
                                                                {new Intl.NumberFormat('vi-VN', {
                                                                    style: 'currency',
                                                                    currency: 'VND',
                                                                    maximumFractionDigits: 0,
                                                                }).format(Number(item.price ?? 0))}
                                                            </p>

                                                            <div className="flex gap-2 sm:gap-3">
                                                                {/* Heart */}
                                                                <button
                                                                    type="button"
                                                                    aria-label={wish ? 'Remove from wishlist' : 'Add to wishlist'}
                                                                    aria-pressed={wish}
                                                                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border transition flex items-center justify-center ${
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
                                                                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                                                            wish ? 'filter brightness-0 invert' : ''
                                                                        }`}
                                                                    />
                                                                </button>

                                                                {/* Cart */}
                                                                <button
                                                                    type="button"
                                                                    aria-label={inCart ? 'Added to cart' : 'Add to cart'}
                                                                    disabled={addingId === item.id}
                                                                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border transition flex items-center justify-center ${
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
                                                                        className={`w-4 h-4 sm:w-5 sm:h-5 ${
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
