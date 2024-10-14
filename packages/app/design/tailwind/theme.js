// @ts-check

/** @type {import('tailwindcss').Config['theme']} */
const theme = {
  extend: {
    colors: {
      shyam: {
        background: '#191919',
        'background-offset': '#202020',
        neutral: '#9B9B9B',
        primary: '#E0E0E0',
        highlight: '#8CB4FF',
      },
      gaur: {
        'background-offset': '#F4DCBB',
        'background': '#FFF4E8',
        neutral: '#6E6E6E',
        primary: '#1A1A1A',
        highlight: '#F09001',
      },
      media: {
        blue: '#1E3264',
        orange: '#BA5D07',
        purple: '#8D67AB',
        green: '#148A08',
        'red-orange': '#D84000',
        'dark-purple': '#503750',
        'dark-green': '#006450',
        red: '#E91429',
        'light-blue': '#537AA1',
        'royal-blue': '#2D46B9',
        gray: '#777777',
      },
      alert: {
        info: '#2563eb',
        success: '#16a34a',
        warning: '#d97706',
        error: 'oklch(65.72% 0.199 27.33)',
      },
    },
  },
}

module.exports = {
  theme,
}
