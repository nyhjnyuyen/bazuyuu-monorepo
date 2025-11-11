// src/pages/AboutUsPage.jsx
import React from 'react';
import Footer from '../components/Footer';
import octopus from '../assets/octopus.svg';
import creativityIcon from '../assets/creative-idea.png';
import qualityIcon from '../assets/badge.png';
import accompanyIcon from '../assets/group.png';
import diversityIcon from '../assets/diversity.png';

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
                    Trình duyệt của bạn không hỗ trợ video.
                </video>

                <div className="relative z-10">
                    <h1 className="text-4xl text-white font-heading font-bold drop-shadow-md">
                        ABOUT US
                    </h1>
                </div>
            </section>

            {/* 📄 About Content Section with Octopus Background */}
            <section className="relative flex-grow w-full bg-white py-16 px-6 text-center overflow-hidden">
                <img
                    src={octopus}
                    alt="Octopus Watermark"
                    className="absolute top-1/2 left-1/2 w-[80%] max-w-[700px] opacity-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"
                />

                <div className="relative z-10 max-w-5xl mx-auto">
                    <p className="max-w-6xl mx-auto text-violet-950 text-2xl font-normal font-heading leading-relaxed tracking-normal text-center">
                        Thành lập năm 2018, Bazuuyu là thương hiệu theo đuổi các xu hướng
                        đồ chơi thú vị và khác biệt. Những IP chính gồm A Niang Niang Hotpot,
                        Gia Đình Rau Củ, Free/Rich Flower, Youyou Family và Ghost.
                        <br />
                        <br />
                        Công ty tích hợp nghiên cứu – phát triển và sản xuất sản phẩm plush,
                        vận hành &amp; cấp phép IP, triển lãm chủ đề và pop-up store.
                        <br />
                        <br />
                        Trong tương lai, Bazuuyu sẽ tiếp tục khám phá và sáng tạo các dòng
                        sản phẩm xoay quanh IP, hướng tới trở thành “siêu thị đồ plush”,
                        lan toả niềm vui và lối sống trẻ trung.
                    </p>

                    <div className="mt-12 border-t border-violet-200 pt-8">
                        <p className="text-xl text-violet-900 font-semibold font-heading">
                            “Chúng tôi tin vào niềm vui, sự sáng tạo và những câu chuyện mềm mại.”
                        </p>
                    </div>
                </div>
            </section>

            {/* 🌟 Vietnamese Values Section */}
            <section className="relative w-full bg-violet-50 py-14 px-6">
                <div className="max-w-6xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-extrabold font-heading text-violet-900 tracking-wide">
                        TẠO XU HƯỚNG LAN TỎA CÁI ĐẸP
                    </h2>
                    <p className="mt-2 text-violet-700 text-xl uppercase tracking-wider">
                        BAZUUYU CÙNG CÁC GIÁ TRỊ CỐT LỖI
                    </p>

                    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 ">
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-violet-100 items-center">
                            <img
                                src={creativityIcon}
                                alt="Thiết kế độc đáo sáng tạo"
                                className="w-8 h-8 object-contain mb-3"
                            />
                            <h3 className="font-heading font-bold text-violet-900">
                                THIẾT KẾ ĐỘC ĐÁO
                            </h3>
                            <p className="mt-2 text-sm text-violet-800/80">
                                Các sản phẩm sáng tạo vui nhộn lấy cảm hứng từ các  loài động vật và hình khối nhân hoá, đáp ứng nhiều gu thẩm mỹ khác nhau.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-violet-100 items-center">
                            <img
                                src={qualityIcon}
                                alt="chất lượng và an toàn"
                                className="w-8 h-8 object-containmb-3"
                            />
                            <h3 className="font-heading font-bold text-violet-900">
                                CHẤT LƯỢNG và AN TOÀN
                            </h3>
                            <p className="mt-2 text-sm text-violet-800/80">
                                Đáp ứng các tiêu chuẩn quốc tế, mang đến đồ chơi mềm mại, bền bỉ, an toàn cho mọi lứa tuổi.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-violet-100 items-center">
                            <img
                                src={accompanyIcon}
                                alt="đồng hành ấm áp"
                                className="w-8 h-8 object-contain mb-3"
                            />
                            <h3 className="font-heading font-bold text-violet-900">
                                SỰ ĐỒNG HÀNH ẤM ÁP
                            </h3>
                            <p className="mt-2 text-sm text-violet-800/80">
                                Đồ chơi nhồi bông êm ái – bạn đồng hành cảm xúc cho cả trẻ em và người lớn.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-violet-100 items-center">
                            <img
                                src={diversityIcon}
                                alt="đa văn hoá"
                                className="w-8 h-8 object-contain mb-3"
                            />
                            <h3 className="font-heading font-bold text-violet-900">
                                CẢM HỨNG ĐA VĂN HOÁ
                            </h3>
                            <p className="mt-2 text-sm text-violet-800/80">
                                Thiết kế mang sức hút toàn cầu, lý tưởng làm quà tặng kết nối cảm xúc xuyên văn hoá.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
