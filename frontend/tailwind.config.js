/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',   // class-based dark mode → controlled by ThemeContext
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Dark theme surface scale
        surface: {
          950: '#04070f',
          900: '#070c18',
          800: '#0a0f1e',
          700: '#111827',
          600: '#1f2937',
        },
        // Accent — indigo/violet
        accent: {
          DEFAULT: '#6366f1',
          dim:     'rgba(99,102,241,0.2)',
          glow:    'rgba(99,102,241,0.35)',
          400:     '#818cf8',
          500:     '#6366f1',
          600:     '#4f46e5',
        },
      },
      backdropBlur: { xl: '20px' },
      animation: {
        'fade-up':   'fadeUp 0.4s ease both',
        'fade-in':   'fadeIn 0.25s ease both',
        'shimmer':   'shimmer 1.6s infinite',
        'pulse-slow':'pulse 3s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        fadeUp:  { from: { opacity: 0, transform: 'translateY(16px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        shimmer: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
