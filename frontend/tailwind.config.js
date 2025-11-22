/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'hsl(215, 100%, 95%)',
          100: 'hsl(215, 100%, 90%)',
          200: 'hsl(215, 100%, 80%)',
          300: 'hsl(215, 100%, 70%)',
          400: 'hsl(215, 100%, 60%)',
          500: 'hsl(215, 100%, 50%)',
          600: 'hsl(215, 100%, 40%)',
          700: 'hsl(215, 100%, 30%)',
          800: 'hsl(215, 100%, 20%)',
          900: 'hsl(215, 100%, 10%)',
        },
      },
    },
  },
  plugins: [],
}

