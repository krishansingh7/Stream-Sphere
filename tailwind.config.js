/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        yt: {
          bg: 'var(--yt-bg)',
          bg2: 'var(--yt-bg2)',
          bg3: 'var(--yt-bg3)',
          hover: 'var(--yt-hover)',
          border: 'var(--yt-border)',
          red: 'var(--yt-red)',
          blue: 'var(--yt-blue)',
          text: 'var(--yt-text)',
          text2: 'var(--yt-text2)',
          text3: 'var(--yt-text3)',
        },
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'scale(0.97)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.15s ease-out forwards',
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        // Completely hides the scrollbar (keeps scroll working)
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
        // Slim 3px scrollbar that matches the app theme
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': 'var(--yt-bg3) transparent',
          '&::-webkit-scrollbar': {
            height: '3px',
            width: '3px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: 'var(--yt-bg3)',
            'border-radius': '9999px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: 'var(--yt-text3)',
          },
        },
      })
    },
  ],
}
