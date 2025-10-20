// src/pages/ContactPage.jsx
import React from 'react';
import Footer from '../components/Footer';
import octopus from '../assets/octopus.svg';

const contacts = [
    {
        title: 'Official account & e-commerce inquiries',
        note: 'Douyin, Xiaohongshu, Taobao, Tmall, Pinduoduo',
        value: 'Market01@suamoon.cn',
        href: 'mailto:Market01@suamoon.cn',
        type: 'email',
    },
    {
        title: 'Business correspondence',
        note: 'Co-branding, licensing, partnerships',
        value: 'Market01@bazuuyutoy.com',
        href: 'mailto:Market01@bazuuyutoy.com',
        type: 'email',
    },
    {
        title: 'Customer service (public)',
        value: '18038251568',
        href: 'tel:18038251568',
        type: 'phone',
    },
    {
        title: 'Backend request shop number',
        value: '18028263925',
        href: 'tel:18028263925',
        type: 'phone',
    },
];

export default function ContactPage() {
    const copy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            // simple, non-blocking feedback
            console.info('Copied:', text);
        } catch {}
    };

    return (
        <div className="flex flex-col min-h-screen bg-white font-heading">
            {/* Header + Watermark */}
            <section className="relative flex-grow w-full bg-white py-16 px-6 overflow-hidden">
                <img
                    src={octopus}
                    alt=""
                    className="pointer-events-none absolute top-1/2 left-1/2 w-[80%] max-w-[700px] opacity-10 -translate-x-1/2 -translate-y-1/2 z-0"
                />

                <div className="relative z-10 max-w-6xl mx-auto">
                    <h1 className="text-violet-950 text-3xl md:text-4xl font-bold font-brand mb-6">Contact Us</h1>
                    <p className="text-violet-925 font-heading leading-relaxed mb-10">
                        We’re happy to hear from you. Choose the channel that best fits your request, or use the quick message
                        form below.
                    </p>

                    {/* Cards */}
                    <div className="grid gap-6 sm:grid-cols-2">
                        {contacts.map((c) => (
                            <div
                                key={c.value}
                                className="rounded-2xl border border-violet-200/70 bg-white/60 backdrop-blur p-5 shadow-sm hover:shadow transition"
                            >
                                <div className="text-violet-950 font-semibold">{c.title}</div>
                                {c.note && <div className="text-sm text-violet-900/60 mt-0.5">{c.note}</div>}

                                <div className="mt-3 flex items-center gap-3">
                                    <a
                                        href={c.href}
                                        className="text-violet-925 font-heading underline underline-offset-4 decoration-violet-300 hover:decoration-violet-600 break-all"
                                    >
                                        {c.value}
                                    </a>
                                    <button
                                        onClick={() => copy(c.value)}
                                        className="px-2.5 py-1.5 text-sm rounded-full border border-violet-200 hover:border-violet-400 text-violet-900"
                                        aria-label={`Copy ${c.type}`}
                                    >
                                        Copy
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="my-10 border-t border-violet-200" />

                    {/* Quick message (mailto) */}
                    <div className="rounded-2xl border border-violet-200/70 p-5 bg-white/60">
                        <h2 className="text-violet-950 font-semibold font-heading  text-l mb-3">Send us a quick message</h2>
                        <p className="text-m text-violet-900/70 font-brand mb-4">
                            This opens your email app addressed to our business mailbox.
                        </p>
                        <a
                            href={`mailto:Market01@bazuuyutoy.com?subject=${encodeURIComponent(
                                'Inquiry from bazuuyu.com'
                            )}`}
                            className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-violet-950 text-white font-semibold hover:bg-violet-900"
                        >
                            Email Business Team
                        </a>
                        <p className="text-x text-violet-900 mt-3">
                            Typical reply time: 1–2 business days · Mon–Fri
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
