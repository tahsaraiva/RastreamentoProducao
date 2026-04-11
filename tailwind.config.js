/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        'primary-blue':   '#1A5F7A',
        'secondary-blue': '#2D8FAD',
        'accent-teal':    '#00B4D8',
        'success-green':  '#2E7D32',
        'warning-yellow': '#F9A825',
        'warning-orange': '#F57C00',
        'error-red':      '#C62828',
        'amazon-green':   '#1B5E20',
        'dark-bg':        '#0F172A',
        'dark-card':      '#1E293B',
        'dark-surface':   '#334155',
        'dark-border':    '#475569',
        'text-primary':   '#F1F5F9',
        'text-secondary': '#CBD5E1',
        'text-muted':     '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in':  'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'float':    'float 3s ease-in-out infinite',
        'shimmer':  'shimmer 3s infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float:   { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-5px)' } },
        shimmer: { '0%': { transform: 'translateX(-100%) translateY(-100%)' }, '100%': { transform: 'translateX(100%) translateY(100%)' } },
      },
    },
  },
  plugins: [],
};
