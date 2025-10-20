// src/pages/ProductPage.jsx
import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct, getProductsByCategory } from '../api/productApi';
import { addToCart } from '../api/cartApi';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { CustomerContext } from '../components/CustomerContext';
import useWishlist from '../hook/useWishlist';

export default function ProductPage() {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [activeImage, setActiveImage] = useState(null);

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

                // choose main image
                const imgs = normalizeImages(p);
                setActiveImage(imgs[0] ?? null);

                // fetch related by category
                if (p?.category) {
                    const rr = await getProductsByCategory(p.category);
                    if (!cancelled) {
                        const list = (rr?.data ?? [])
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

    const handleAddToCart = async () => {
        if (!product) return;
        try {
            await addToCart({ productId: product.id, quantity: 1 });
            alert(`🛒 ${product.name} added to cart!`);
        } catch (e) {
            console.error('Add to cart failed', e);
            alert('Failed to add to cart. Please try again.');
        }
    };

    const images = useMemo(() => normalizeImages(product), [product]);

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
                <main className="flex-grow max-w-5xl mx-auto px-6 py-16 text-center">
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
    const price = Number(product.price ?? 0).toFixed(2);
    const categoryLink = `/shop?category=${encodeURIComponent(product.category ?? '')}`;

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <main className="flex-grow max-w-7xl mx-auto px-4 lg:px-6 py-10">
                {/* Breadcrumb */}
                <nav className="text-l text-violet-925/70 mb-6">
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
                    <span className="text-violet-925 text-heading">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Gallery */}
                    <div>
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
                            <div className="mt-4 grid grid-cols-5 gap-3">
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
                        <h1 className="font-heading text-violet-925 text-2xl md:text-4xl leading-tight">
                            {product.name}
                        </h1>
                        {product.category && (
                            <p className="mt-2 text-violet-925/70 font-brand">
                                Category: {product.category}
                            </p>
                        )}
                        <p className="mt-4 text-2xl font-brand text-violet-925 font-semibold">
                            ${price}
                        </p>

                        {product.description && (
                            <p className="mt-6 text-violet-925/90 font-heading leading-relaxed">
                                {product.description}
                            </p>
                        )}

                        <div className="mt-8 flex gap-3">
                            <button
                                onClick={handleAddToCart}
                                className="px-6 py-3 bg-violet-950 text-white rounded-2xl font-semibold hover:bg-violet-900"
                            >
                                Add to cart
                            </button>
                            <button
                                onClick={() => toggleWishlist(product.id)}
                                className={`px-6 py-3 rounded-2xl border font-semibold ${
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

                {/* Related products */}
                <section className="mt-16">
                    <h2 className="text-center font-heading text-violet-925 tracking-[0.06em] text-h2 leading-tight mb-8">
                        Related Products
                    </h2>

                    {related.length === 0 ? (
                        <p className="text-center text-violet-925/70">
                            No related products found.
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                            {related.map(p => (
                                <ProductCard
                                    key={p.id}
                                    product={p}
                                    onAddToCart={() => addToCart({ productId: p.id, quantity: 1 })}
                                />
                            ))}
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
    if (Array.isArray(p.images) && p.images.length) return p.images;
    const single = p?.imageUrl || p?.image;
    return single ? [single] : [];
}
