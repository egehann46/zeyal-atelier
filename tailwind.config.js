/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
          fontFamily: {
            poppins: ['var(--font-poppins)', 'sans-serif'],
            dancing: ['var(--font-dancing)', 'cursive'],
          },
          colors: {
            'logo': '#969B38',
            'header': '#FAF6F1',
            'menu': '#363636',
          }
        }
      },
      
    plugins: [],
  }
  