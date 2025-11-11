// src/pages/ContactPage.jsx
import React from 'react';
import Footer from '../components/Footer';
import octopus from '../assets/octopus.svg';

const contacts = [
    {
        title: 'Email cho tất cả kênh truyền thông',
        note: 'Website, Douyin, Xiaohongshu, Taobao, Tmall, Pinduoduo',
        value: 'Market01@suamoon.cn',
        href: 'mailto:Market01@suamoon.cn',
        type: 'email',
    },
    {
        title: 'Email liên hệ hợp tác kinh doanh',
        note: 'Đồng thương hiệu, cấp phép, hợp tác',
        value: 'Market01@bazuuyutoy.com',
        href: 'mailto:Market01@bazuuyutoy.com',
        type: 'email',
    },
    {
        title: 'Dịch vụ chăm sóc khách hàng',
        value: '18038251568',
        href: 'tel:18038251568',
        type: 'phone',
    },
    {
        title: 'Số điện thoại để đăng ký/ mở gian hàng',
        value: '18028263925',
        href: 'tel:18028263925',
        type: 'phone',
    },
];

export default function ContactPage() {
    const copy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            console.info('Copied:', text);
        } catch {
            // im lặng nếu browser không hỗ trợ
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white font-heading">
            {/* Header + Watermark */}
            <section className="relative flex-grow w-full bg-white py-16 px-6 overflow-hidden">
                {/* Watermark bạch tuộc */}
                <img
                    src={octopus}
                    alt=""
                    className="pointer-events-none absolute top-1/2 left-1/2 w-[80%] max-w-[700px] opacity-10 -translate-x-1/2 -translate-y-1/2 z-0"
                />

                <div className="relative z-10 max-w-6xl mx-auto">
                    {/* Hero text */}
                    <div className="max-w-3xl mx-auto text-center mb-12">
                        <h1 className="text-violet-950 text-3xl md:text-4xl font-bold font-brand tracking-wide mb-4 uppercase">
                            CẦN HỖ TRỢ? LIÊN HỆ VỚI BAZUUYU!
                        </h1>
                        <p className="text-violet-925 text-xl font-brand leading-relaxed mb-3">
                            Bazuuyu chuyên thiết kế và sản xuất các dòng đồ chơi plush lấy cảm hứng
                            từ ẩm thực và đời sống hằng ngày – với nhiều kích thước, chất liệu và
                            phong cách khác nhau.
                        </p>
                        <p className="text-violet-925 text-xl font-brand leading-relaxed">
                            Nếu bạn đang tìm đối tác cho dự án cấp phép, đồng thương hiệu, mở kênh
                            bán lẻ mới hoặc chỉ đơn giản là có câu hỏi về sản phẩm, đừng ngần ngại
                            liên hệ với chúng tôi. Đội ngũ Bazuuyu luôn sẵn sàng đồng hành cùng bạn.
                        </p>
                    </div>

                    {/* Nội dung chính: thẻ liên hệ + email nhanh */}
                    <div className="space-y-10">
                        {/* Cards */}
                        <div>
                            <h2 className="text-violet-950 text-2xl font-heading font-semibold mb-2">
                                Thông tin liên hệ trực tiếp
                            </h2>
                            <p className="text-violet-925/80  text-xl mb-5">
                                Chọn kênh phù hợp với nhu cầu của bạn – thương mại điện tử, hợp tác
                                kinh doanh, và chăm sóc khách hàng.
                            </p>

                            <div className="grid gap-6 sm:grid-cols-2">
                                {contacts.map((c) => (
                                    <div
                                        key={c.value}
                                        className="rounded-2xl border border-violet-200/70 bg-white/60 backdrop-blur p-5 shadow-sm hover:shadow transition"
                                    >
                                        <div className="text-violet-950 text-xl font-heading font-semibold">{c.title}</div>
                                        {c.note && (
                                            <div className=" text-violet-900/60 font-heading text-l mt-0.5">{c.note}</div>
                                        )}

                                        <div className="mt-3 flex items-center gap-3">
                                            <a
                                                href={c.href}
                                                className="text-violet-925 text-l underline underline-offset-4 decoration-violet-300 hover:decoration-violet-600 break-all"
                                            >
                                                {c.value}
                                            </a>
                                            <button
                                                onClick={() => copy(c.value)}
                                                className="px-2.5 py-1.5 text-l rounded-full border border-violet-200 hover:border-violet-400 text-violet-900"
                                                aria-label={`Copy ${c.type}`}
                                            >
                                                Sao chép
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-violet-200" />

                        {/* Quick message (mailto) */}
                        <div className="rounded-2xl border border-violet-200/70 p-5 bg-white/60">
                            <h2 className="text-violet-950 font-semibold font-heading text-2xl mb-3">
                                Gửi tin nhắn nhanh
                            </h2>
                            <p className=" md:text-base text-violet-900/80 font-heading text-l mb-4">
                                Nhấn nút bên dưới để mở ứng dụng email trên thiết bị của bạn.
                                <br/>
                                Địa chỉ
                                nhận sẽ được điền sẵn, bạn chỉ cần viết nội dung mong muốn.
                            </p>
                            <a
                                href={`mailto:Market01@bazuuyutoy.com?subject=${encodeURIComponent(
                                    'Liên hệ từ bazuuyu.com'
                                )}`}
                                className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-violet-950 text-white font-semibold hover:bg-violet-900"
                            >
                                Gửi email cho bộ phận kinh doanh
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
