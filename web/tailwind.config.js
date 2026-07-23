/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'media', // or 'class' for manual dark mode control
  theme: {
    extend: {
      // Define specific color mappings for better Tailwind compatibility
      backgroundColor: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        tertiary: 'var(--tertiary)',
        accent: 'var(--accent)',
        highlight: 'var(--highlight)',
        background: 'var(--background)',
        'background-offset': 'var(--background-offset)',
        border: 'var(--border)',
        neutral: 'var(--neutral)',
      },
      textColor: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        tertiary: 'var(--tertiary)',
        accent: 'var(--accent)',
        highlight: 'var(--highlight)',
        neutral: 'var(--neutral)',
      },
      borderColor: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        accent: 'var(--accent)',
        border: 'var(--border)',
        neutral: 'var(--neutral)',
      },
      colors: {
        // Theme colors using CSS variables
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        tertiary: 'var(--tertiary)',
        accent: 'var(--accent)',
        highlight: 'var(--highlight)',
        background: 'var(--background)',
        'background-offset': 'var(--background-offset)',
        border: 'var(--border)',
        neutral: 'var(--neutral)',
      },
    },
  },
  // Make sure these classes are generated even if not used in content
  safelist: [
    'bg-primary',
    'bg-secondary',
    'bg-tertiary',
    'bg-accent',
    'bg-highlight',
    'bg-background',
    'bg-background-offset',
    'bg-border',
    'bg-neutral',
    'text-primary',
    'text-secondary',
    'text-tertiary',
    'text-accent',
    'text-highlight',
    'text-neutral',
    'border-primary',
    'border-secondary',
    'border-accent',
    'border-border',
    'border-neutral',
  ],
  plugins: [],
}