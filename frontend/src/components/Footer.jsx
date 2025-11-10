import React, { useState } from 'react';
import footerlogo from '../assets/logo white 1.png';
import footerfacebook from '../assets/facebook.svg';
import footerinstagram from '../assets/instagram.svg';
import footertiktok from '../assets/tik_tok.svg';
import backgroundwithOctopus from "../assets/backgoundwithoctopus.jpg";
import {Link} from "react-router-dom";

export default function Footer() {
    const [email, setEmail] = useState('');
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');
    const handleSubscribe = async () => {
        setMsg('');
        const trimmed = email.trim();
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
        if (!ok) { setMsg('Please enter a valid email.'); return; }

        setBusy(true);
        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: trimmed })
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setMsg('Thanks! You’re subscribed.');
            setEmail('');
        } catch (e) {
            console.error(e);
            setMsg('Something went wrong. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="flex flex-col">
            {/* ✉️ Newsletter */}
            <section
                className="relative w-full h-[24rem] bg-cover bg-left-bottom"
                style={{ backgroundImage: `url(${backgroundwithOctopus})`, transform: 'scaleX(-1)' }}
            >
                <div className="absolute inset-0 bg-violet-950/10 scale-x-[-1]" />
                <div className="absolute inset-0 px-6 scale-x-[-1] flex flex-col items-center justify-center text-center text-violet-925">
                    <h2 className="text-3xl md:text-4xl font-heading mb-4 text-violet-925">
                        Sign up for joy delivered to your inbox
                    </h2>
                    <p className="max-w-3xl text-base md:text-lg font-heading mb-6">
                        Hãy đăng ký bản tin email của chúng tôi để nhận tin tức mới nhất, bao gồm các đợt ra mắt nhân vật mới, sự kiện và nhiều cập nhật thú vị khác.
                    </p>
                    <div className="w-full max-w-md sm:max-w-2xl flex flex-col sm:flex-row items-stretch gap-3 sm:gap-0">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Nhập email vào đây"
                            className="h-12 flex-1 min-w-0
                   rounded-full sm:rounded-l-[1.5rem] sm:rounded-r-none
                   px-4 text-violet-925 placeholder-violet-925/40
                   bg-white border border-violet-200 sm:border-r-0"
                            disabled={busy}
                        />
                        <button
                            onClick={handleSubscribe}
                            disabled={busy}
                            className="h-12 w-full sm:w-[130px]
                   bg-violet-925 text-white font-brand font-bold lg:text-xl text-base
                   rounded-full sm:rounded-l-none sm:rounded-r-[1.5rem]
                   disabled:opacity-60"
                        >
                            {busy ? 'Joining…' : 'Join now'}
                        </button>
                    </div>
                    {msg && <p className="mt-3 text-sm">{msg}</p>}
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-violet-925 text-white py-12 px-4 mt-auto">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-start space-y-8 md:space-y-0">

                    {/* Logo */}
                    <div className="flex flex-col items-center md:items-start">
                        <img src={footerlogo} alt="Bazuuyu Logo" className="w-40 h-auto mb-4" />
                    </div>

                    {/* Links */}
                    <div className="flex flex-col md:flex-row md:space-x-16 text-center md:text-left text-xl font-brand font-semibold">
                        <ul className="space-y-4">
                            <li><Link to="/" className="hover:underline">Home</Link></li>
                            <li><Link to="/new" className="hover:underline">New Arrivals</Link></li>
                            <li><Link to="/shop" className="hover:underline">Shop</Link></li>
                        </ul>
                        <ul className="space-y-4 mt-6 md:mt-0">
                            <li><Link to="/about" className="hover:underline">About Us</Link></li>
                            <li><Link to="/contact" className="hover:underline">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div className="flex flex-col items-center text-xl md:items-start text-base font-brand">
                        <p className="mb-4">Follow Us</p>
                        <div className="flex space-x-4 mb-4">
                            <img src={footerfacebook} alt="Facebook" className="w-12 h-12 rounded-full p-2" />
                            <img src={footerinstagram} alt="Instagram" className="w-12 h-12 rounded-full p-2" />
                            <img src={footertiktok} alt="TikTok" className="w-12 h-12 rounded-full p-2" />
                        </div>
                        <div className="w-[11rem] h-px bg-white mb-2" />
                        <div className="w-[11rem] h-px bg-white" />
                    </div>
                </div>

                {/* Copyright */}
                <p className="text-center mt-10 text-xl font-normal font-brand">
                    Bazuuyu Toy 2025 ©
                </p>
            </footer>
        </div>
    );
}
