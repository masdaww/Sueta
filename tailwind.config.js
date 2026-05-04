/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sueta: {
          50: '#eef4ff',
          100: '#dbe6ff',
          200: '#bfd2ff',
          300: '#94b4ff',
          400: '#6189ff',
          500: '#3a64ff',
          600: '#1f47f5',
          700: '#1a36d6',
          800: '#1d31aa',
          900: '#1f3186',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 12px rgba(20, 32, 64, 0.08)',
      },
    },
  },
  plugins: [],
}
