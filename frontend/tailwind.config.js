/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        romantic: {
          pink: '#FF6B9D',
          rose: '#C44569',
          honey: '#F8B500',
          blush: '#FFF5F8',
          lavender: '#E8D5FF',
          pearl: '#F8F9FA',
          charcoal: '#2C3E50',
        },
        glass: 'rgba(255, 255, 255, 0.25)',
        'glass-dark': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        'romantic': ['Dancing Script', 'cursive'],
        'modern': ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-romantic': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'heart-beat': 'heartbeat 1.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(1.1)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'romantic': '0 8px 32px 0 rgba(255, 107, 157, 0.2)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
