import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import heart from '../assets/heart.png';
import shoppingCart from '../assets/shopping-cart.svg';

const FALLBACK_IMG = 'https://via.placeholder.com/600x600?text=Bazuuyu';

// ---------- helpers ----------
function getDisplayPrice(product) {
    if (!product) return 0;

    // If product has variants → show min variant price
    if (Array.isArray(product.variants) && product.variants.length > 0) {
        const prices = product.variants
            .map(v => Number(v.price ?? 0))
            .filter(p => !Number.isNaN(p));

        if (prices.length > 0) {
            return Math.min(...prices);
        }
    }

    // fallback to product.price
    return Number(product.price ?? 0);
}

function pickImage(p) {
    if (!p) return FALLBACK_IMG;

    // 1. Variant image (default variant first)
    let variantImg = null;
    if (Array.isArray(p.variants) && p.variants.length > 0) {
        const def = p.variants.find(v => v.isDefault) || p.variants[0];
        variantImg = def?.imageUrl || null;
    }

    // 2. main_image_url column
    const main = variantImg || p.mainImageUrl;

    // 3. any gallery image from jsonb columns
    const gallery = [];
    if (Array.isArray(p.imageUrls)) gallery.push(...p.imageUrls);
    if (Array.isArray(p.storyImageUrls)) gallery.push(...p.storyImageUrls);
    if (Array.isArray(p.images)) gallery.push(...p.images);
    const firstGallery = gallery.find(Boolean);

    // 4. single image fields
    const single = p.imageUrl || p.image;

    return main || firstGallery || single || FALLBACK_IMG;
}

export default function ProductCard({
                                        product,
                                        onAddToCart,
                                        isInWishlist,
                                        onToggleWishlist,
                                    }) {
    const [imgSrc, setImgSrc] = useState(pickImage(product));
    const [added, setAdded] = useState(false);

    const priceNumber = getDisplayPrice(product);
    const price = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,
    }).format(priceNumber);

    const handleAddClick = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!added) {
            onAddToCart?.(product);
            setAdded(true);
        }
    };

    const handleToggleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleWishlist?.();
    };

    return (
        <div className="h-full w-full">
            <div className="border border-violet-950 rounded-[20px] bg-[#F6F2FF] flex flex-col items-center overflow-hidden h-full">
                {/* Click → product detail */}
                <Link
                    to={`/product/${product?.id}`}
                    className="flex-1 flex flex-col w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-[20px]"
                >
                    {/* Square image */}
                    <div
                        className="relative w-full bg-white rounded-[20px] overflow-hidden"
                        style={{ paddingTop: '100%' }}
                    >
                        <img
                            src={imgSrc}
                            alt={product?.name || 'Product'}
                            onError={() => setImgSrc(FALLBACK_IMG)}
                            className="absolute inset-0 w-full h-full object-contain"
                        />
                    </div>

                    {/* Name */}
                    <div className="w-full px-4 pt-4 pb-2 flex flex-col">
                        <p
                            className="text-left text-xl font-heading text-violet-950 overflow-hidden"
                            style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                lineHeight: '1.6rem',
                                height: '3.2rem',
                            }}
                        >
                            {product?.name}
                        </p>
                    </div>
                </Link>

                {/* Price + heart + cart */}
                <div className="w-full px-4 pb-4 flex items-center justify-between mt-auto">
                    <p className="justify-start text-violet-950 text-xl font-bold font-brand">
                        {price}
                    </p>

                    <div className="flex gap-3">
                        {onToggleWishlist && (
                            <button
                                type="button"
                                aria-label={
                                    isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'
                                }
                                aria-pressed={!!isInWishlist}
                                className={`w-9 h-9 rounded-full border transition flex items-center justify-center ${
                                    isInWishlist
                                        ? 'bg-violet-950 border-violet-950 hover:bg-violet-950'
                                        : 'bg-white border-violet-200 hover:bg-violet-100'
                                }`}
                                onClick={handleToggleWishlist}
                            >
                                <img
                                    src={heart}
                                    alt=""
                                    className={`w-5 h-5 ${
                                        isInWishlist ? 'filter brightness-0 invert' : ''
                                    }`}
                                />
                            </button>
                        )}

                        {onAddToCart && (
                            <button
                                type="button"
                                aria-label={added ? 'Added to cart' : 'Add to cart'}
                                disabled={added}
                                className={`w-9 h-9 rounded-full border transition flex items-center justify-center ${
                                    added
                                        ? 'bg-violet-950 border-violet-950 hover:bg-violet-950'
                                        : 'bg-white border-violet-200 hover:bg-violet-100'
                                } ${added ? 'opacity-80 cursor-default' : ''}`}
                                onClick={handleAddClick}
                            >
                                <img
                                    src={shoppingCart}
                                    alt=""
                                    className={`w-5 h-5 ${
                                        added ? 'filter brightness-0 invert' : ''
                                    }`}
                                />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
