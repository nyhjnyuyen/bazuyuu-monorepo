import React, { useState, useEffect, useContext } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import heart from '../assets/heart.png';
import flashmod from '../assets/activity.jpg';
import flashmod_words from '../assets/FLASH MOB ACTIVITY.png';
import wave from '../assets/wave.png';
import slogan1 from '../assets/slogan1.jpg';
import slogan2 from '../assets/slogan2.jpg';
import slogan3 from '../assets/slogan3.jpg';
import slogan4 from '../assets/slogan4.jpg';
import banner1 from '../assets/banner-01.jpg';
import banner2 from '../assets/banner-02.jpg';
import banner3 from '../assets/banner-03.jpg';
import category1 from '../assets/category1.jpg';
import category2 from '../assets/category2.jpg';
import category3 from '../assets/category3.png';
import octopus from '../assets/octopus.svg';
import shoppingCart from '../assets/shopping-cart.svg';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../api/cartApi';
import SloganGrid from "../components/SloganGrid";


import Footer from '../components/Footer';
import { CustomerContext } from '../components/CustomerContext';
import useWishlist from '../hook/useWishlist';
import { getLandingNewArrivals } from '../api/productApi';

const categories = [
    { title: 'VEGETABLE', value: 'VEGETABLE', img: category1 },
    { title: 'HOT POT', value: 'HOTPOT', img: category2 },
    { title: 'BBQ', value: 'BBQ', img: category3 },
];

const sloganItems = [
    {
        src: slogan1,
        label: "IBTE 2024 – International Baby Products & Toys Expo",
        desc:
            "Hành trình với IBTE bắt đầu từ IBTE 2024, khi Bazuuyu lần đầu trưng bày dòng đồ chơi mềm dành cho mẹ & bé và nhận được phản hồi rất tích cực từ khách tham quan. Tiếp nối thành công đó, từ ngày 18–20/12/2025, chúng tôi quay lại IBTE 2025 với bộ sưu tập được nâng cấp: chất liệu mềm mại hơn, thiết kế an toàn hơn và câu chuyện thương hiệu rõ ràng hơn. Bazuuyu tiếp tục mang thông điệp thiết kế sáng tạo, chất lượng cao và sự đồng hành ấm áp đến với các gia đình trên khắp thế giới.",
    },
    {
        src: slogan2,
        label: "Toy Fair New York 2025",
        desc:
            "Từ ngày 1–4/3/2025, Bazuuyu lần đầu tiên xuất hiện tại Toy Fair New York 2025. Gian hàng BBQ và rau củ plush tương tác đã gây ấn tượng mạnh và mang về cho chúng tôi một giải thưởng thiết kế. Chính sự ghi nhận này là bước đệm để Bazuuyu tiếp tục mang bộ sưu tập đi giới thiệu tại các sự kiện quốc tế khác trong năm.",
    },
    {
        src: slogan3,
        label: "Licensing Expo 2025 – Las Vegas",
        desc:
            "Tiếp nối thành công tại New York Toy Fair, Bazuuyu tham dự Licensing Expo 2025 ở Mandalay Bay Convention Center, Las Vegas. Tại đây chúng tôi giới thiệu dòng đồ chơi rau củ, thực phẩm và BBQ plush đến các đối tác cấp phép và bán lẻ toàn cầu, tìm kiếm cơ hội hợp tác để đưa thương hiệu Bazuuyu đến với nhiều gia đình hơn nữa.",
    },
    {
        src: slogan4,
        label: "Brand Licensing Europe 2025 – London",
        desc:
            "Tại Brand Licensing Europe (BLE) 2025, diễn ra từ ngày 7–9/10 tại ExCeL London, Bazuuyu mang không gian chơi nấu ăn và BBQ đầy màu sắc đến với khách tham quan châu Âu. Sự kiện BLE tập trung vào xu hướng “kidult”, tính bền vững và trải nghiệm tương tác tại gian hàng. Bazuuyu tận dụng cơ hội này để kết nối với các nhà bán lẻ, nhà phân phối và đối tác bản quyền mới tại thị trường châu Âu.",
    },

];

export default function LandingPage() {
    const { customer } = useContext(CustomerContext);

    //  Use shared hook for wishlist
    const { isInWishlist, toggleWishlist } = useWishlist(customer);

    const [newArrivals, setNewArrivals] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [addingId, setAddingId] = useState(null);
    const [flashOpen, setFlashOpen] = useState(false);
    const [inCartIds, setInCartIds] = useState(() => new Set());

    const handleAddToCart = async (product) => {
        setAddingId(product.id);
        try {
            const res = await addToCart({ productId: product.id, quantity: 1 });
            setInCartIds(prev => new Set(prev).add(product.id));
            alert(`🛒 ${product.name} added to cart!`);
        } catch (err) {
            console.error('Add to cart failed:', err);
            alert('Failed to add to cart. Please try again.');
        } finally {
            setAddingId(null);
        }
    };

    //  Fetch new arrivals (limit to 16)
    useEffect(() => {
        (async () => {
            try {
                const items = await getLandingNewArrivals(16); // already unwrapped
                setNewArrivals(items);
            } catch (e) {
                console.error('Failed to fetch new arrivals', e);
                setNewArrivals([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);


    return (
        <div className="flex flex-col min-h-screen bg-white text-center">
            <main className="flex-grow">
                {/*  Banner */}
                <section className="relative bg-white">
                    <Swiper
                        modules={[Autoplay, Pagination]}
                        autoplay={{ delay: 4000, disableOnInteraction: false }}
                        pagination={{ clickable: true }}
                        loop
                        className="w-full"
                    >
                        {[banner1, banner2, banner3].map((img, index) => (
                            <SwiperSlide key={index}>
                                <div className="relative w-full">
                                    <img
                                        src={img}
                                        alt={`banner-${index}`}
                                        className="w-full h-auto max-h-[100vh] object-cover"
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <img
                        src={octopus}
                        alt="Octopus BG"
                        className="absolute top-[70%] left-1/2 -translate-x-1/2 w-[70%] opacity-10 z-0 pointer-events-none"
                        style={{ transform: 'translateX(-50%) translateY(-50%)' }}
                    />
                </section>

                {/* Categories & New Arrivals */}
                <section className="relative z-20 pt-40 pb-20 bg-white-950/10 rounded-t-[60px]">
                    <h2 className=" mx-auto text-center font-heading text-violet-925 tracking-[0.08em] text-display leading-tight -mt-24 mb-12 md:mb-16 lg:mb-16">
                        BAZUUYU'S  FAMILIES
                    </h2>

                    <div className="relative z-20 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10 max-w-7xl mx-auto px-4">
                        {categories.map((cat, index) => (
                            <div
                                key={index}
                                className="relative group flex flex-col items-center cursor-pointer"
                                role="button"
                                tabIndex={0}
                                onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.value)}`)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        navigate(`/shop?category=${encodeURIComponent(cat.value)}`);
                                    }
                                }}
                            >
                                <div className="w-full aspect-[1/1] rounded-[20px] overflow-hidden">
                                    <img src={cat.img} alt={cat.title} className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-b from-transparent to-white/80 rounded-b-[20px]" />
                                <p className="absolute bottom-2 text-center text-violet-925 text-sm sm:text-base md:text-lg lg:text-l font-bold font-heading">
                                    {cat.title}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="relative z-20 mt-16 mb-12">
                        <h2 className=" mx-auto text-center font-heading text-violet-925 tracking-[0.08em] text-display leading-tight  mb-12 md:mb-16 lg:mb-20">
                            NEW <span className="italic">A</span>RRIV<span className="italic">A</span>LS
                        </h2>
                    </div>
                    <img
                        src={wave}
                        alt="Wave Behind New Arrivals"
                        className="absolute top-[300px] left-0 w-full h-auto z-0 pointer-events-none"
                    />

                    {/* Swiper for New Arrivals */}
                    <div className="relative z-20 max-w-7xl mx-auto px-4 pb-20">
                        {loading ? (
                            <p className="text-center">Loading new arrivals...</p>
                        ) : newArrivals.length === 0 ? (
                            <p className="text-center">No new arrivals yet.</p>
                        ) : (
                            <Swiper
                                modules={[Navigation]}
                                navigation
                                spaceBetween={20}
                                slidesPerView={1}
                                breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }}
                            >
                                {newArrivals.map((item) => {
                                    const wish = isInWishlist(item.id);
                                    const inCart = inCartIds.has(item.id);

                                    return (
                                        <SwiperSlide key={item.id}>
                                            <div className="border border-violet-950 rounded-[20px] bg-[#F6F2FF] flex flex-col items-center overflow-hidden">
                                                <div className="w-full aspect-square bg-white flex items-center justify-center rounded-[20px] overflow-hidden">
                                                    <img
                                                        src={item.imageUrl || item.image}
                                                        alt={item.name}
                                                        className="object-contain h-4/5 w-4/5"
                                                    />
                                                </div>
                                                <div className="w-full px-4 py-4">
                                                    <p className="text-left text-xl font-heading text-violet-950">
                                                        {item.name}
                                                    </p>
                                                    <div className="flex justify-between items-center mt-2">
                                                        <p className="justify-start text-violet-950 text-xl font-bold font-brand">
                                                            {new Intl.NumberFormat('vi-VN', {
                                                                style: 'currency',
                                                                currency: 'VND',
                                                                maximumFractionDigits: 0,
                                                            }).format(Number(item.price ?? 0))}
                                                        </p>

                                                        {/* ACTIONS */}
                                                        <div className="flex gap-3">
                                                            {/* Heart button with color state */}
                                                            <button
                                                                type="button"
                                                                aria-label={wish ? 'Remove from wishlist' : 'Add to wishlist'}
                                                                aria-pressed={wish}
                                                                className={`w-9 h-9 rounded-full border transition flex items-center justify-center
                                ${wish
                                                                    ? 'bg-violet-950 border-violet-950 hover:bg-violet-950'
                                                                    : 'bg-white border-violet-200 hover:bg-violet-100'}
                              `}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    e.preventDefault();
                                                                    toggleWishlist(item.id);
                                                                }}
                                                            >
                                                                <img
                                                                    src={heart}
                                                                    alt=""
                                                                    className={`w-5 h-5 ${wish ? 'filter brightness-0 invert' : ''}`}
                                                                />
                                                            </button>

                                                            {/* Add to cart button with color state */}
                                                            <button
                                                                type="button"
                                                                aria-label={inCart ? 'Added to cart' : 'Add to cart'}
                                                                disabled={addingId === item.id}
                                                                className={`w-9 h-9 rounded-full border transition flex items-center justify-center
                                ${inCart
                                                                    ? 'bg-violet-950 border-violet-950 hover:bg-violet-950'
                                                                    : 'bg-white border-violet-200 hover:bg-violet-100'}
                                ${addingId === item.id ? 'opacity-50 pointer-events-none' : ''}
                              `}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    e.preventDefault();
                                                                    handleAddToCart(item);
                                                                }}
                                                            >
                                                                <img
                                                                    src={shoppingCart}
                                                                    alt=""
                                                                    className={`w-5 h-5 ${inCart ? 'filter brightness-0 invert' : ''}`}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>
                        )}
                    </div>
                </section>

                {/* Slogan Section */}
                <section className="py-20 bg-white">
                    <div className="mt-12">
                        <h2 className=" mx-auto text-center font-heading text-violet-925 tracking-[0.08em] text-display leading-tight  mb-12 md:mb-16 lg:mb-8">
                            CREATE TRENDS SHARE BEAUTY
                        </h2>
                        <h2 className=" mx-auto text-center font-heading text-violet-925 tracking-[0.08em] text-h2 leading-tight  ">
                            BAZUUYU with innovative design
                        </h2>
                        <h2 className=" mx-auto text-center font-heading text-violet-925 tracking-[0.08em] text-h2 ">
                            High quality, safety, and warm companionship as its core.
                        </h2>
                    </div>
                </section>

                {/* Slogan Images */}
                <section className="bg-white py-2">
                    <SloganGrid items={sloganItems} />
                </section>

                {/* Flashmod */}
                <section
                    className="relative h-[360px] bg-cover bg-center text-white"
                    style={{ backgroundImage: `url(${flashmod})` }}
                >
                    <div className="absolute inset-0 bg-black/5" />
                    <div className="relative z-10 flex flex-col items-center justify-start h-full text-center px-4 pt-12 sm:pt-12">
                        <p className="text-l sm:text-xl font-light font-['Instrument_Serif'] mb-2 w-[50%] max-w-[600px] mx-auto leading-tight">
                            IBTE 2025 – International Baby Products & Toys Expo
                        </p>
                    </div>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
                        <a href="#" className="text-m sm:text-l text-white underline text-base font-light font-jakarta">
                            Click to view
                        </a>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
