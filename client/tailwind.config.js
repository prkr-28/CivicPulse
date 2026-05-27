export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'civic-green': {
          50: '#f0fdf9',
          100: '#dcf9f1',
          200: '#b9f0e6',
          300: '#7dd3c0',
          400: '#40b8a0',
          500: '#1d9e75',
          600: '#1a8c6a',
          700: '#0d5b4a',
          800: '#064e41',
          900: '#043d35',
        },
        'civic-red': '#dc3545',
        'civic-yellow': '#ffc107',
        'civic-success': '#28a745',
        'civic-gray': '#6c757d',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"Roboto"',
          '"Oxygen"',
          '"Ubuntu"',
          '"Cantarell"',
          '"Fira Sans"',
          '"Droid Sans"',
          '"Helvetica Neue"',
          'sans-serif',
        ],
      },
      animation: {
        'spin': 'spin 1s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
