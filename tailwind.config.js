/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        yt: {
          bg: '#0f0f0f',
          bg2: '#212121',
          bg3: '#272727',
          hover: '#3f3f3f',
          border: '#3f3f3f',
          red: '#ff0000',
          blue: '#3ea6ff',
          text: '#f1f1f1',
          text2: '#aaaaaa',
          text3: '#717171',
        },
      },
      fontFamily: {
        roboto: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
