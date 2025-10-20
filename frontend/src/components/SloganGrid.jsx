// src/components/SloganGrid.jsx
import React, { useState, useEffect } from "react";

/**
 * items: [{ src, label, desc }]
 */
export default function SloganGrid({ items = [], className = "" }) {
    const [open, setOpen] = useState(false);
    const [index, setIndex] = useState(0);

    const active = items[index];

    // Esc / Arrow keys
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "ArrowRight") setIndex((i) => (i + 1) % items.length);
            if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + items.length) % items.length);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, items.length]);

    // Lock body scroll when modal open
    useEffect(() => {
        const original = document.body.style.overflow;
        if (open) document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = original; };
    }, [open]);

    if (!items.length) return null;

    return (
        <section className={`bg-white py-2 ${className}`}>
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {items.map((it, i) => (
                        <div key={i} className="flex flex-col items-center text-center group">
                            <button
                                type="button"
                                className="relative w-full aspect-square overflow-hidden rounded-xl shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
                                onClick={() => { setIndex(i); setOpen(true); }}
                            >
                                <img
                                    src={it.src}
                                    alt={it.label}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
                                    <div className="text-white text-base font-medium font-heading underline leading-snug">
                                        Click for more information
                                    </div>
                                </div>
                            </button>
                            <p className="mt-4 mb-8 text-violet-950 text-base sm:text-lg font-semibold font-heading">
                                {it.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {open && active && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setOpen(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="slogan-dialog-title"
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Big image */}
                        <div className="relative">
                            <img
                                src={active.src}
                                alt={active.label}
                                className="w-full h-[60vh] md:h-[80vh] object-contain bg-black"
                            />
                            <button
                                className="absolute top-3 right-3 bg-white/90 rounded-full px-3 py-1 text-sm hover:bg-white"
                                onClick={() => setOpen(false)}
                            >
                                Close
                            </button>
                        </div>

                        {/* Side description */}
                        <div className="p-6 md:p-8 flex flex-col">
                            <h3 id="slogan-dialog-title" className="text-2xl font-heading font-semibold text-violet-950">
                                {active.label}
                            </h3>
                            <p className="mt-3 text-violet-900 font-heading leading-relaxed">{active.desc}</p>

                            <div className="mt-auto flex gap-3 pt-6">
                                <button
                                    className="px-4 py-2 rounded-xl font-heading border border-violet-300 hover:bg-violet-50"
                                    onClick={() => setIndex((i) => (i - 1 + items.length) % items.length)}
                                >
                                    ‹ Prev
                                </button>
                                <button
                                    className="px-4 py-2 rounded-xl bg-violet-900 text-white hover:bg-violet-800"
                                    onClick={() => setIndex((i) => (i + 1) % items.length)}
                                >
                                    Next ›
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
