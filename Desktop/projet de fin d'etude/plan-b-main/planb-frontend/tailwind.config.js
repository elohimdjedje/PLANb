/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      sans: ['DM Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      heading: ['Syne', 'DM Sans', 'system-ui', 'sans-serif'],
      mono: ['Courier New', 'monospace'],
    },
    fontSize: {
      'xs': ['0.75rem', { lineHeight: '1rem' }],
      'sm': ['0.875rem', { lineHeight: '1.25rem' }],
      'base': ['1rem', { lineHeight: '1.65rem' }],
      'lg': ['1.125rem', { lineHeight: '1.75rem' }],
      'xl': ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1.1' }],
      '6xl': ['3.75rem', { lineHeight: '1.1' }],
      '7xl': ['4.5rem', { lineHeight: '1.1' }],
    },
    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0em',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
    extend: {
      colors: {
        primary: {
          50: '#FFF8F3',
          100: '#FFE8D9',
          200: '#FFD4B8',
          300: '#FFBB88',
          400: '#FF8C42',
          500: '#F4621F', // Orange principal (Landing Page)
          600: '#E54B0E',
          700: '#C84B10',
          800: '#A43A0C',
          900: '#7C2D12',
        },
        accent: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F5A623', // Gold (Landing Page)
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        secondary: {
          50: '#F8F9FA',
          100: '#E9ECEF',
          200: '#DEE2E6',
          300: '#CED4DA',
          400: '#ADB5BD',
          500: '#6B6B6B',
          600: '#495057',
          700: '#343A40',
          800: '#212529',
          900: '#1A1A1A', // Texte foncé (Landing Page)
        },
        success: {
          500: '#25D366', // Vert WhatsApp
          600: '#1EAD52',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            fontSize: '1rem',
            lineHeight: '1.75',
            color: '#3A4556',
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: 'var(--font-heading)',
              fontWeight: '700',
              color: '#1A202C',
              marginTop: '1.5rem',
              marginBottom: '1rem',
              letterSpacing: '-0.5px',
            },
            h1: {
              fontSize: '3.5rem',
              lineHeight: '1.1',
            },
            h2: {
              fontSize: '2.5rem',
              lineHeight: '1.15',
            },
            h3: {
              fontSize: '1.875rem',
            },
            p: {
              marginBottom: '1.25rem',
              lineHeight: '1.75',
            },
            a: {
              color: '#F97316',
              fontWeight: '500',
              '&:hover': {
                color: '#EA580C',
              },
            },
          },
        },
      },
    },
  },
  plugins: [],
}
