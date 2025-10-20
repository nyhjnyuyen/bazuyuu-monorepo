// src/components/ProductCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import heart from '../assets/heart.png';

const FALLBACK_IMG = 'https://via.placeholder.com/600x600?text=Bazuyuu';

function pickImage(p) {
    if (!p) return FALLBACK_IMG;
    if (Array.isArray(p.imageUrls) && p.imageUrls[0]) return p.imageUrls[0];
    if (Array.isArray(p.images) && p.images[0]) return p.images[0];
    return p.imageUrl || p.image || FALLBACK_IMG;
}

export default function ProductCard({
                                        product,
                                        onAddToCart,
                                        isInWishlist,
                                        onToggleWishlist,
                                    }) {
    console.log('[ProductCard] build timestamp:', new Date().toISOString());
    const [imgSrc, setImgSrc] = useState(pickImage(product));
    const [added, setAdded] = useState(false);

    const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
        .format(Number(product?.price ?? 0));

    const handleAddClick = () => {
        if (!added) {
            onAddToCart?.(product);
            setAdded(true);
        }
    };

    return (
        <div className="border border-violet-200 rounded-2xl bg-white hover:shadow-md transition flex flex-col w-full h-full">
            <Link to={`/product/${product?.id}`} className="flex-1 flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-2xl">
                <div className="w-full h-56 overflow-hidden bg-white rounded-t-2xl">
                    <img
                        src={imgSrc}
                        alt={product?.name || 'Product'}
                        onError={() => setImgSrc(FALLBACK_IMG)}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                </div>

                <div className="px-3 pt-3 pb-2">
                    <h3
                        className="font-heading text-violet-925 text-lg font-semibold overflow-hidden"
                        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.6rem', height: '3.2rem' }}
                    >
                        {product?.name}
                    </h3>
                    <div className="mt-1 text-violet-925 font-brand font-bold">{price}</div>
                </div>
            </Link>

            {(onAddToCart || onToggleWishlist) ? (
                <div className="flex items-center gap-2 px-3 pb-3 mt-auto h-12">
                    {onToggleWishlist && (
                        <button
                            type="button"
                            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                            aria-pressed={!!isInWishlist}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleWishlist?.(); }}
                            className={`w-10 h-10 rounded-full border flex items-center justify-center transition ${isInWishlist ? 'bg-violet-925 border-violet-925 hover:bg-violet-925' : 'bg-white border-violet-200 hover:bg-violet-100'}`}
                        >
                            <img src={heart} alt="" className={`w-5 h-5 ${isInWishlist ? 'filter brightness-0 invert' : ''}`} />
                        </button>
                    )}
                    {onAddToCart && (
                        <button
                            onClick={handleAddClick}
                            disabled={added}
                            className={`flex-1 h-10 text-base font-brand rounded-3xl transition ${added ? 'bg-violet-925 text-white cursor-default' : 'bg-white border border-violet-200 text-violet-925 hover:bg-violet-100'}`}
                        >
                            {added ? 'Added to cart' : 'Add to cart'}
                        </button>
                    )}
                </div>
            ) : <div className="h-3" />}
        </div>
    );
}
