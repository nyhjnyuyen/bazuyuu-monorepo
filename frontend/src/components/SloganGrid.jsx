// src/components/SloganGrid.jsx
import React from 'react';

export default function SloganGrid({ items, onItemClick }) {
    return (
        <div className="max-w-6xl mx-auto px-4 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {items.map((item, idx) => (
                <button
                    key={idx}
                    type="button"
                    className="group relative rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                    onClick={() => onItemClick && onItemClick(item)}
                >
                    {/* Ảnh */}
                    <div className="aspect-[4/5] w-full overflow-hidden">
                        <img
                            src={item.src}
                            alt={item.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    </div>

                    {/* Overlay text phía dưới ảnh */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4">
                        <p className="text-sm font-heading text-white font-semibold line-clamp-2">
                            {item.label}
                        </p>

                    </div>
                </button>
            ))}
        </div>
    );
}
