import type { Config } from 'tailwindcss';

export default {
    content: ['./app/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            keyframes: {
                'slide-up-fade': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                'slide-up-fade': 'slide-up-fade 0.6s ease-out both',
            },
        },
    },
    plugins: [],
} satisfies Config;
