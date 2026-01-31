/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Neo-Brutalism Design Tokens
      colors: {
        // Neo-Brutalism palette
        nb: {
          main: '#88aaee',
          'main-accent': '#4d80e6',
          bg: '#dfe5f2',
          text: '#000000',
          border: '#000000',
          yellow: '#facc15',
          lime: '#a3e635',
          cyan: '#22d3ee',
          pink: '#f472b6',
          orange: '#fb923c',
        }
      },
      borderRadius: {
        'nb': '5px',
      },
      boxShadow: {
        'nb': '4px 4px 0px 0px #000',
        'nb-sm': '2px 2px 0px 0px #000',
        'nb-lg': '6px 6px 0px 0px #000',
        'nb-hover': '0px 0px 0px 0px #000',
      },
      translate: {
        'nb-x': '4px',
        'nb-y': '4px',
      },
      fontWeight: {
        'nb-base': '500',
        'nb-heading': '700',
      },
      borderWidth: {
        'nb': '2px',
        'nb-thick': '3px',
      },
    },
  },
  plugins: [],
}
