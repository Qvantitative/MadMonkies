/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./componentsX/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        customGray: '#222222', // Replace with your custom color code
        customGreen: '#d9fd93', // Replace with your custom color code
      },
      fontFamily: {
        'joystix_monospace': ['Joystix Monospace', 'monospace'],
        'upheavtt': ['Upheavtt', 'sans'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
