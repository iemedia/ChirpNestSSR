// tailwind.config.js
const plugin = require('tailwindcss/plugin')

module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',   // Next.js app dir
    './src/components/**/*.{js,ts,jsx,tsx}',  // components
    './src/hooks/**/*.{js,ts,jsx,tsx}',       // hooks
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',       // vibrant indigo
        primaryDark: '#4338CA',
        accent: '#F472B6',        // playful pink
        background: '#F0F4FF',    // soft background
        surface: '#FFFFFF',
        textPrimary: '#1F2937',
        textSecondary: '#6B7280',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        insetSoft: 'inset 0 0 15px rgba(0, 0, 0, 0.15)', // custom inset shadow
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    plugin(function({ addUtilities }) {
      addUtilities({
        '.shadow-inset-soft': {
          'box-shadow': 'inset 0 0 15px rgba(0, 0, 0, 0.15)',
        },
      })
    }),
  ],
}
