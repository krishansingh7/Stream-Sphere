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
    },
  },
  plugins: [],
}
