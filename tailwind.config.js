const plugin = require('tailwindcss/plugin')')

module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/hooks/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#6366F1',
        primaryDark: '#4338CA',
        accent: '#F472B6',
        background: '#F0F4FF',
        surface: '#FFFFFF',
        textPrimary: '#1F2937',
        textSecondary: '#6B7280',
        'purple-950': '#2e1065',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      boxShadow: {
        insetSoft: 'inset 0 0 15px rgba(0, 0, 0, 0.15)',
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

