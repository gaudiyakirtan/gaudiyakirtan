/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'media', // or 'class' for manual dark mode control
  theme: {
    extend: {
      colors: {
        // Theme colors using CSS variables
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        tertiary: 'var(--tertiary)',
        accent: 'var(--accent)',
        background: 'var(--background)',
        'background-offset': 'var(--background-offset)',
        border: 'var(--border)',
        neutral: 'var(--neutral)',
      },
    },
  },
  plugins: [],
}