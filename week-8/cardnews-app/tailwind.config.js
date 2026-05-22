/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Optimistic VF는 Meta 전용 — 폴백: Montserrat / Helvetica.
        // 한글은 Pretendard Variable 유지.
        display: ['Montserrat', 'Helvetica', 'Arial', '"Pretendard Variable"', 'system-ui', 'sans-serif'],
        sans: ['"Pretendard Variable"', 'Pretendard', 'Montserrat', 'system-ui', 'sans-serif'],
        archivo: ['"Archivo Narrow"', 'sans-serif'],
      },
      colors: {
        // 카드 콘텐츠는 브랜드 자산 유지(cn-*), 앱 chrome은 Meta 토큰(meta-*).
        cn: {
          black: '#000000',
          white: '#FFFFFF',
          neon: '#AAFF00',
          lemon: '#FFFABA',
        },
        meta: {
          canvas: '#ffffff',
          surface: '#f1f4f7',
          ink: '#1c1e21',
          'ink-deep': '#0a1317',
          charcoal: '#444950',
          slate: '#4b4c4f',
          steel: '#5d6c7b',
          stone: '#8595a4',
          hairline: '#ced0d4',
          'hairline-soft': '#dee3e9',
          primary: '#0064e0',
          'primary-deep': '#0457cb',
          'primary-soft': '#0091ff',
          'fb-blue': '#1876f2',
          success: '#31a24c',
          warning: '#f2a918',
          critical: '#e41e3f',
        },
      },
      borderRadius: {
        pill: '100px',
        feature: '40px',
        xxxl: '32px',
      },
      letterSpacing: {
        kr: '-0.04em',
        krt: '-0.045em',
        snug: '-0.16px',
      },
      boxShadow: {
        'meta-card': '0 1px 4px 0 rgba(20, 22, 26, 0.08)',
        'meta-sticky': '0 1px 4px 0 rgba(20, 22, 26, 0.3)',
      },
    },
  },
  plugins: [],
};
