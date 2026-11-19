/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#0B132B',
          800: '#1C2541',
          700: '#3A506B',
          600: '#4F6D7A',
        },
        gold: {
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        premium: '0 10px 30px -5px rgba(11, 19, 43, 0.08), 0 4px 6px -2px rgba(11, 19, 43, 0.04)',
        'premium-hover': '0 20px 35px -5px rgba(11, 19, 43, 0.15), 0 8px 10px -4px rgba(11, 19, 43, 0.08)',
      },
    },
  },
  plugins: [],
};
