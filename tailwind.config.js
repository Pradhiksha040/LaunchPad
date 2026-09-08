/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/features/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        lp: {
          bg: 'var(--lp-background, #FFFFFF)',
          mint: 'var(--lp-mint, #F3F9F5)',
          pistachio: 'var(--lp-pistachio, #DDEEDF)',
          green: 'var(--lp-primary, #3F7659)',
          dark: 'var(--lp-primary-dark, #173C2D)',
          beige: 'var(--lp-accent, #F3EBDD)',
          text: 'var(--lp-text, #173C2D)',
          muted: 'var(--lp-muted, #5A7165)',
          border: 'var(--lp-border, #E2ECE5)',
          card: 'var(--lp-surface, #FFFFFF)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lp: '0.625rem',
      },
      boxShadow: {
        'lp-soft': '0 4px 20px -2px rgba(23, 60, 45, 0.05)',
        'lp-card': '0 1px 3px 0 rgba(23, 60, 45, 0.08), 0 1px 2px 0 rgba(23, 60, 45, 0.04)',
        'lp-hover': '0 10px 25px -5px rgba(63, 118, 89, 0.12)',
      },
    },
  },
  plugins: [],
}
