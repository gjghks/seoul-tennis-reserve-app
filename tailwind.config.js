/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      /* ─── Design Tokens ─── */
      colors: {
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
        },
      },

      /* ─── Spacing (standardised 4px grid) ─── */
      spacing: {
        4.5: '18px',
        13: '52px',
        15: '60px',
      },

      /* ─── Animation duration tokens ─── */
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },

      /* ─── Animation tokens ─── */
      animation: {
        'press': 'press 150ms ease-out',
        'pop-in': 'pop-in 400ms cubic-bezier(0.22,1,0.36,1)',
        'stagger-fade': 'stagger-fade 400ms cubic-bezier(0.22,1,0.36,1) both',
        'pulse-live': 'pulse-live 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'shake': 'shake 400ms ease-out',
        'slide-up': 'slide-up 300ms cubic-bezier(0.22,1,0.36,1)',
      },
      keyframes: {
        press: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.95)' },
          '100%': { transform: 'scale(1)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0)' },
          '70%': { transform: 'scale(1.15)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'stagger-fade': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-live': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '50%': { transform: 'translateX(4px)' },
          '75%': { transform: 'translateX(-4px)' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)' },
          to: { transform: 'translateY(0)' },
        },
      },

      borderRadius: {
        nb: '5px',
      },
      boxShadow: {
        nb: '4px 4px 0px 0px #000',
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
        nb: '2px',
        'nb-thick': '3px',
      },
    },
  },
  plugins: [],
}
