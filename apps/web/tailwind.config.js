/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#F8F4EF',
          100: '#EFE6D8',
          200: '#D9CBB8',
          300: '#A67C52',
          400: '#8B5E3C',
          500: '#6F4E37',
          600: '#5a3f2c',
          700: '#4E342E',
          800: '#3a2722',
          900: '#2F241F',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        executive: '0 10px 30px -5px rgba(78, 52, 46, 0.08), 0 4px 12px -2px rgba(78, 52, 46, 0.04)',
      },
    },
  },
  plugins: [],
};
