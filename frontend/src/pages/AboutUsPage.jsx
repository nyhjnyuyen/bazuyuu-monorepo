import React from 'react';
import Footer from '../components/Footer';
import octopus from '../assets/octopus.svg';

export default function AboutUsPage() {
    return (
        <div className="flex flex-col min-h-screen bg-white">

            {/* 🎥 Hero Section with Video Background */}
            <section className="relative w-full aspect-video sm:h-[60vh] md:h-[70vh] lg:h-[80vh] overflow-hidden flex items-center justify-center">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover z-0"
                >
                    <source src="/bannervideo.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>

                <div className="relative z-10">
                    <h1 className="text-4xl text-white font-heading font-bold drop-shadow-md">
                        ABOUT US
                    </h1>
                </div>
            </section>

            {/* 📄 About Content Section with Octopus Background */}
            <section className="relative flex-grow w-full bg-white py-16 px-6 text-center overflow-hidden">
                {/* 🐙 Octopus Watermark */}
                <img
                    src={octopus}
                    alt="Octopus Watermark"
                    className="absolute top-1/2 left-1/2 w-[80%] max-w-[700px] opacity-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
                />

                {/* ✅ Content Layer */}
                <div className="relative z-10 max-w-5xl mx-auto">

                    <p className="max-w-6xl mx-auto text-violet-950 text-2xl font-normal font-heading leading-relaxed tracking-normal text-center">
                        Established in 2018, Bazuuyu is a brand dedicated to capturing quirky and interesting trends in the toy market. Its main IPs include Aniang Niang Hotpot, Vegetable Family, Casual Flowers, Youyou Family, and Ghost.

                        The company integrates the development and production of plush merchandise, IP operation, licensing, themed exhibitions, and pop-up stores.

                        In the future, Bazuuyu will continue to explore and create various IP-related products, aiming to become a supermarket for plush items while spreading joy and embodying the lifestyle of the younger generation.
                    </p>


                    <div className="mt-12 border-t border-violet-200 pt-8">
                        <p className="text-xl text-violet-900 font-semibold font-heading">
                            "We believe in joy, creativity, and cuddly storytelling."
                        </p>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
