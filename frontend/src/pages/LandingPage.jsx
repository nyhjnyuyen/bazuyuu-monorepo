import React, { useState, useEffect, useContext } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import heart from '../assets/heart.png';
import flashmod from '../assets/activity.jpg';
import wave from '../assets/wave.png';
import slogan1 from '../assets/event1.jpg';
import slogan2 from '../assets/event2.jpg';
import slogan3 from '../assets/event3-1.JPG';
import slogan4 from '../assets/event4.JPG';
import banner1 from '../assets/banner-01.jpg';
import banner2 from '../assets/banner-02.jpg';
import banner3 from '../assets/banner-03.jpg';
import vegecat from '../assets/category1.jpg';
import octopus from '../assets/octopus.svg';
import shoppingCart from '../assets/shopping-cart.svg';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../api/cartApi';
import SloganGrid from "../components/SloganGrid";
import bbqcat from '../assets/BBQcat.JPG';
import hotpotcat from '../assets/Hotpotcat.jpg';
import catAll from '../assets/catall.png';



import Footer from '../components/Footer';
import { CustomerContext } from '../components/CustomerContext';
import useWishlist from '../hook/useWishlist';
import { getLandingNewArrivals } from '../api/productApi';

const categories = [
    { title: 'VEGETABLE', value: 'VEGETABLE', img: vegecat },
    { title: 'HOT POT', value: 'HOTPOT', img: hotpotcat },
    { title: 'BBQ', value: 'BBQ', img: bbqcat},
    { title: 'ALL', value: 'ALL', img: catAll },
];

const sloganItems = [
    {
        src: slogan1,
        label: "IBTE 2024 – International Baby Products & Toys Expo",
        desc: `IBTE 2024 là cột mốc đầu tiên đánh dấu sự xuất hiện của Bazuuyu tại Việt Nam
            dành cho mẹ và bé. Tại triển lãm, chúng tôi mang đến dòng đồ chơi
            mềm lấy cảm hứng từ ẩm thực gia đình – an toàn, êm ái và giàu tính tương tác.
            Gian hàng của Bazuuyu nhận được nhiều phản hồi tích cực từ các bậc phụ huynh,
            nhà phân phối và khách tham quan, khẳng định định hướng thiết kế sáng tạo,
            chất lượng cao và sự đồng hành ấm áp cùng trẻ nhỏ trong từng khoảnh khắc chơi đùa.`,
    },
    {
        src: slogan2,
        label: "Toy Fair New York 2025",
        desc: `Từ ngày 1–4/3/2025, Bazuuyu có màn ra mắt ấn tượng tại Toy Fair New York 2025. 
Gian hàng chủ đề BBQ và rau củ plush tương tác đã thu hút đông đảo khách tham quan 
và vinh dự nhận giải thưởng “Powerfully Playful Award Winner 2025”. 
Thành công tại New York trở thành bước đệm quan trọng để Bazuuyu tự tin mang 
bộ sưu tập đi giới thiệu tại nhiều sân chơi quốc tế trong năm 2025.`,
    },
    {
        src: slogan3,
        label: "Licensing Expo 2025 – Las Vegas",
        desc: `Tiếp nối dấu ấn tại Toy Fair New York, Bazuuyu tham dự Licensing Expo 2025 
tại Mandalay Bay Convention Center, Las Vegas. 
Ngoài việc trưng bày dòng đồ chơi rau củ, thực phẩm và BBQ plush, 
chúng tôi còn tổ chức trò chơi “vòng quay may mắn”, 
cho phép khách tham quan có cơ hội nhận được móc khóa vegetable plush toy 
đáng yêu để mang về nhà. 
Đây cũng là dịp để Bazuuyu kết nối với các đối tác cấp phép, 
nhà bán lẻ và nhà sản xuất đến từ khắp nơi trên thế giới.`,
    },
    {
        src: slogan4,
        label: "Brand Licensing Europe 2025 – London",
        desc: `Tại Brand Licensing Europe (BLE) 2025, diễn ra từ ngày 7–9/10 tại ExCeL
London, Bazuuyu mang tới một góc bếp BBQ đầy màu sắc, nơi trẻ em và người
lớn đều có thể cùng “nấu nướng” bằng đồ chơi plush. BLE nhấn mạnh các xu
hướng như “kidult”, tính bền vững và trải nghiệm tương tác tại gian hàng –
những giá trị rất phù hợp với triết lý thiết kế của Bazuuyu. Sự kiện là cơ
hội để chúng tôi kết nối với các nhà bán lẻ, nhà phân phối và đối tác bản
quyền mới tại thị trường châu Âu.`,
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
                <section className="relative pt-40 pb-20 bg-white-950/10 rounded-t-[60px]">
                    <h2 className=" mx-auto text-center font-heading text-violet-925 tracking-[0.08em] text-display leading-tight -mt-24 mb-12 md:mb-16 lg:mb-16">
                        BAZUUYU'S  FAMILIES
                    </h2>

                    <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
                        {categories.map((cat, index) => (
                            <div
                                key={index}
                                className="relative group flex flex-col items-center cursor-pointer"
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                    if (cat.value === 'ALL') {
                                        navigate('/shop');
                                    } else {
                                        navigate(`/shop?category=${encodeURIComponent(cat.value)}`);
                                    }
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        if (cat.value === 'ALL') {
                                            navigate('/shop');
                                        } else {
                                            navigate(`/shop?category=${encodeURIComponent(cat.value)}`);
                                        }
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

                    <div className="relative mt-16 mb-12">
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
                    <div className="relative  max-w-7xl mx-auto px-4 pb-20">
                                {loading ? (
                                    <p className="text-center">Đang tải sản phẩm mới...</p>
                                ) : newArrivals.length === 0 ? (
                                    <p className="text-center">Hiện chưa có sản phẩm mới.</p>
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
                                        <SwiperSlide key={item.id} className="!h-auto flex">
                                            {/* wrapper để card luôn đầy chiều cao slide */}
                                            <div className="w-full h-full">
                                                <div className="border border-violet-950 rounded-[20px] bg-[#F6F2FF] flex flex-col items-center overflow-hidden h-full">
                                                    {/* hình */}
                                                    <div className="w-full aspect-square bg-white flex items-center justify-center rounded-[20px] overflow-hidden">
                                                        <img
                                                            src={item.imageUrl || item.image}
                                                            alt={item.name}
                                                            className="object-contain h-4/5 w-4/5"
                                                        />
                                                    </div>

                                                    {/* text + actions */}
                                                    <div className="w-full px-4 py-4 flex flex-col flex-1">
                                                        {/* tên sản phẩm: cố định 2 dòng, chiều cao bằng nhau */}
                                                        <p
                                                            className="text-left text-xl font-heading text-violet-950 overflow-hidden"
                                                            style={{
                                                                display: '-webkit-box',
                                                                WebkitLineClamp: 2,
                                                                WebkitBoxOrient: 'vertical',
                                                                lineHeight: '1.6rem',
                                                                height: '3.2rem', // ~ 2 dòng
                                                            }}
                                                        >
                                                            {item.name}
                                                        </p>

                                                        {/* hàng giá + nút dính đáy card */}
                                                        <div className="flex justify-between items-center mt-3 mt-auto">
                                                            <p className="justify-start text-violet-950 text-xl font-bold font-brand">
                                                                {new Intl.NumberFormat('vi-VN', {
                                                                    style: 'currency',
                                                                    currency: 'VND',
                                                                    maximumFractionDigits: 0,
                                                                }).format(Number(item.price ?? 0))}
                                                            </p>

                                                            {/* ACTIONS */}
                                                            <div className="flex gap-3">
                                                                {/* Heart button */}
                                                                <button
                                                                    type="button"
                                                                    aria-label={wish ? 'Remove from wishlist' : 'Add to wishlist'}
                                                                    aria-pressed={wish}
                                                                    className={`w-9 h-9 rounded-full border transition flex items-center justify-center
                      ${
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
                                                                        className={`w-5 h-5 ${wish ? 'filter brightness-0 invert' : ''}`}
                                                                    />
                                                                </button>

                                                                {/* Add to cart button */}
                                                                <button
                                                                    type="button"
                                                                    aria-label={inCart ? 'Added to cart' : 'Add to cart'}
                                                                    disabled={addingId === item.id}
                                                                    className={`w-9 h-9 rounded-full border transition flex items-center justify-center
                      ${
                                                                        inCart
                                                                            ? 'bg-violet-950 border-violet-950 hover:bg-violet-950'
                                                                            : 'bg-white border-violet-200 hover:bg-violet-100'
                                                                    }
                      ${addingId === item.id ? 'opacity-50 pointer-events-none' : ''}`}
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
                                            </div>
                                        </SwiperSlide>
                                    );
                                })}
                            </Swiper>
                        )}
                    </div>
                </section>

                {/* Slogan Section */}
                <section className="py-12 bg-white">
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

                {/* Flashmod / Upcoming IBTE */}
                <section
                    className="relative h-[360px] bg-cover bg-center text-white"
                    style={{ backgroundImage: `url(${flashmod})` }}
                >
                    {/* Lớp tối nền phía sau chữ */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Khối chữ ở GIỮA chiều cao */}
                    <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
                        {/* U P C O M I N G – màu trắng */}
                        <p className="text-xs sm:text-sm tracking-[0.3em] uppercase text-white mb-3">
                            Upcoming
                        </p>

                        {/* Tiêu đề IBTE */}
                        <p className="max-w-4xl text-xl sm:text-2xl md:text-3xl font-heading font-semibold leading-snug">
                            IBTE 2025 – International Baby Products & Toys Expo
                        </p>

                        {/* Dòng ngày + địa điểm */}
                        <p className="mt-2 text-sm sm:text-base text-white/90 font-heading">
                            18–20.12.2025 · SECC quận 7, Hồ Chí Minh.
                        </p>

                        {/* Nút mở popup */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.preventDefault();
                                setFlashOpen(true);
                            }}
                            className="mt-4 inline-block text-base sm:text-lg underline font-light font-jakarta"
                        >
                            Nhấn để xem chi tiết
                        </button>
                    </div>


                    {/* 🔍 IBTE popup – giữ nguyên như bạn đang có */}
                    {flashOpen && (
                        <div
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                            onClick={() => setFlashOpen(false)}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="ibte-dialog-title"
                        >
                            <div
                                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 md:p-10"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3
                                    id="ibte-dialog-title"
                                    className="text-2xl md:text-3xl font-heading font-semibold text-violet-950 mb-4 text-center"
                                >
                                    IBTE 2025 – International Baby Products & Toys Expo
                                </h3>

                                <p className="text-violet-900 font-heading leading-relaxed text-left text-base md:text-lg">
                                    Sau khi nhận giải thưởng tại Toy Fair New York 2025, Bazuuyu tiếp tục
                                    mang bộ sưu tập đồ chơi BBQ và rau củ plush tới Licensing Expo 2025 ở
                                    Las Vegas, mở ra thêm nhiều cơ hội hợp tác quốc tế.
                                    <br />
                                    <br />
                                    Trước đó, hành trình với IBTE đã bắt đầu từ IBTE 2024, khi Bazuuyu lần
                                    đầu giới thiệu dòng sản phẩm dành cho mẹ và bé và nhận được sự ủng hộ
                                    nồng nhiệt từ khách tham quan. IBTE 2025 đánh dấu một bước tiến mới:
                                    chúng tôi trưng bày phiên bản nâng cấp với thiết kế an toàn hơn, chất
                                    liệu cao cấp hơn và trải nghiệm chơi giàu tính giáo dục, giúp trẻ khám
                                    phá thế giới qua những món ăn quen thuộc mỗi ngày.
                                </p>

                                <div className="mt-8 flex justify-center">
                                    <button
                                        className="px-6 py-2 rounded-xl bg-violet-900 text-white hover:bg-violet-800 font-heading"
                                        onClick={() => setFlashOpen(false)}
                                    >
                                        Đóng
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </main>
            <Footer />
        </div>
    );
}
