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

                <div className="max-w-4xl mx-auto px-6 py-8 bg-white/80 border border-violet-200 rounded-3xl shadow-sm">
                    <p className="text-violet-950 text-xl md:text-2xl font-normal font-brand leading-relaxed tracking-normal text-justify">
                        Thành lập năm 2018, Bazuuyu là thương hiệu đồ chơi plush theo đuổi những xu hướng độc đáo và thú vị trên thị trường.
                        Các IP chủ lực của Bazuuyu bao gồm A Niang Hotpot, Gia đình Rau Củ, Casual Flowers, Youyou Family và Ghost, với phong cách thiết kế vui nhộn, hiện đại và giàu cá tính.
                        <br /><br />
                        Bazuuyu không chỉ phát triển và sản xuất các dòng thú bông mà còn vận hành hệ sinh thái IP trọn vẹn: từ phát triển nội dung, cấp phép thương mại cho đến triển lãm chủ đề và các cửa hàng pop-up trải nghiệm.
                        Trong tương lai, Bazuuyu sẽ tiếp tục mở rộng các sản phẩm xoay quanh IP, hướng tới trở thành thế giới thú bông nơi hội tụ những thiết kế sáng tạo, lan tỏa niềm vui và phản chiếu phong cách sống năng động của thế hệ trẻ.
                    </p>
                    <div className="mt-12 border-t border-violet-200 pt-8">
                        <p className="text-2xl text-violet-900 font-semibold font-heading">
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
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-violet-100 flex flex-col items-center text-center">
                            <img
                                src={creativityIcon}
                                alt="Thiết kế độc đáo sáng tạo"
                                className="w-8 h-8 object-contain mb-3"
                            />
                            <h3 className="font-heading font-bold text-violet-900">
                                THIẾT KẾ ĐỘC ĐÁO
                            </h3>
                            <p className="mt-2 text-sm font-brand text-violet-800/80">
                                Các sản phẩm độc đáo lấy cảm hứng từ các loài động vật và hình khối nhân hoá, đáp ứng nhiều gu thẩm mỹ khác nhau.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-violet-100 flex flex-col items-center text-center">
                            <img
                                src={qualityIcon}
                                alt="chất lượng và an toàn"
                                className="w-8 h-8 object-containmb-3"
                            />
                            <h3 className="font-heading font-bold text-violet-900">
                                CHẤT LƯỢNG AN TOÀN
                            </h3>
                            <p className="mt-2 text-sm text-violet-800/80">
                                Đáp ứng các tiêu chuẩn quốc tế, mang đến đồ chơi mềm mại, bền bỉ, an toàn cho mọi lứa tuổi.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-violet-100 flex flex-col items-center text-center">
                            <img
                                src={accompanyIcon}
                                alt="đồng hành ấm áp"
                                className="w-8 h-8 object-contain mb-3"
                            />
                            <h3 className="font-heading font-bold text-violet-900">
                                SỰ ĐỒNG HÀNH
                            </h3>
                            <p className="mt-2 text-sm text-violet-800/80">
                                Đồ chơi nhồi bông êm ái – bạn đồng hành cảm xúc cho trẻ em và người lớn.
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-violet-100 flex flex-col items-center text-center">
                            <img
                                src={diversityIcon}
                                alt="đa văn hoá"
                                className="w-8 h-8 object-contain mb-3"
                            />
                            <h3 className="font-heading font-bold text-violet-900">
                                ĐA VĂN HOÁ
                            </h3>
                            <p className="mt-2 text-sm text-violet-800/80">
                                Thiết kế mang sức hút toàn cầu, lý tưởng làm quà tặng kết nối cảm xúc xuyên ranh giới văn hoá.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
