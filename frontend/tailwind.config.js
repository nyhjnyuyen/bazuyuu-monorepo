module.exports = {
    content: ['./src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {
            fontFamily: {
                brand: ['"Baloo 2"', 'system-ui', 'sans-serif'], // playful headings / logo
                heading: ['"Playfair Display"', 'serif'],        // elegant headings
                jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
            },
            fontSize: {
                // fluid sizes using clamp(min, vw, max)
                'display': ['clamp(28px, 4.5vw, 48px)', { lineHeight: '1.1' }],
                'h1': ['clamp(24px, 3.5vw, 36px)', { lineHeight: '1.15' }],
                'h2': ['clamp(20px, 2.6vw, 28px)', { lineHeight: '1.2' }],
                'h3': ['clamp(18px, 2.2vw, 22px)', { lineHeight: '1.25' }],
                'body-lg': ['18px', { lineHeight: '1.6' }],
                body: ['16px', { lineHeight: '1.65' }],
                'body-sm': ['14px', { lineHeight: '1.6' }],
                caption: ['12px', { lineHeight: '1.4' }],
            },
            colors: {
                'violet-925': '#3d177d',
                brand: {
                    900: '#fffff', // violet-950 vibe
                },
            },
        },
    },
    plugins: [require('@tailwindcss/typography'), require('@tailwindcss/line-clamp')],
};
