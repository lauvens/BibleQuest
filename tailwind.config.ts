import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Couleur principale - Bleu foncé (presque noir)
        primary: {
          50: '#e6eef5',
          100: '#ccdcea',
          200: '#99b9d5',
          300: '#6697c0',
          400: '#3374ab',
          500: '#025a96',  // Version intermédiaire
          600: '#014a7a',
          700: '#013a5e',
          800: '#012a45',
          850: '#011f35',
          900: '#011627',  // Bleu très foncé (presque noir) - fond dark mode
        },
        // Fond clair - Blanc cassé
        parchment: {
          50: '#FDFFFC',   // Blanc cassé principal
          100: '#f8faf7',
          200: '#f3f5f2',
          300: '#eaece9',
          400: '#dfe1de',
          500: '#d4d6d3',
          600: '#b8bab7',
          700: '#9c9e9b',
          800: '#80827f',
          900: '#646663',
        },
        // Accent - Bleu clair
        accent: {
          50: '#e7f6ff',
          100: '#d0edff',
          200: '#a1dbff',
          300: '#72c9ff',
          400: '#38B6FF',  // Bleu clair principal
          500: '#2da3e6',
          600: '#2390cc',
          700: '#1a7db3',
          800: '#116a99',
          900: '#085780',
        },
        // Gold remplacé par Orange (warning/attention)
        gold: {
          50: '#fff8ed',
          100: '#fff0db',
          200: '#ffe1b8',
          300: '#ffd294',
          400: '#FF9F1C',  // Orange principal
          500: '#e68c19',
          600: '#cc7916',
          700: '#b36613',
          800: '#995310',
          900: '#80400d',
        },
        // Olive remplacé par Accent (bleu clair) pour CTA
        olive: {
          50: '#e7f6ff',
          100: '#d0edff',
          200: '#a1dbff',
          300: '#72c9ff',
          400: '#38B6FF',  // Même que accent
          500: '#2da3e6',
          600: '#2390cc',
          700: '#1a7db3',
          800: '#116a99',
          900: '#085780',
        },
        // Couleurs fonctionnelles
        success: {
          50: '#e7f6ff',
          100: '#d0edff',
          200: '#a1dbff',
          300: '#72c9ff',
          400: '#38B6FF',
          500: '#2da3e6',
          600: '#2390cc',
          700: '#1a7db3',
          800: '#116a99',
          900: '#085780',
        },
        error: {
          50: '#fef2f3',
          100: '#fde6e8',
          200: '#fbc1c6',
          300: '#f89ca4',
          400: '#f25260',
          500: '#E71D36',  // Rouge principal
          600: '#c91830',
          700: '#ab1429',
          800: '#8d1022',
          900: '#6f0c1b',
        },
        warning: {
          50: '#fff8ed',
          100: '#fff0db',
          200: '#ffe1b8',
          300: '#ffd294',
          400: '#FF9F1C',  // Orange principal
          500: '#e68c19',
          600: '#cc7916',
          700: '#b36613',
          800: '#995310',
          900: '#80400d',
        },
        info: {
          50: '#e7f6ff',
          100: '#d0edff',
          200: '#a1dbff',
          300: '#72c9ff',
          400: '#38B6FF',  // Bleu clair principal
          500: '#2da3e6',
          600: '#2390cc',
          700: '#1a7db3',
          800: '#116a99',
          900: '#085780',
        },
        // Couleurs spéciales pour la gamification
        heart: '#E71D36',      // Rouge
        xp: '#38B6FF',         // Bleu clair
        streak: '#FF9F1C',     // Orange
        gem: '#38B6FF',        // Bleu clair
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif'],
      },
      backgroundImage: {
        'parchment-texture': 'linear-gradient(180deg, #FDFFFC 0%, #f8faf7 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FF9F1C 0%, #e68c19 100%)',
        'accent-gradient': 'linear-gradient(135deg, #38B6FF 0%, #2da3e6 100%)',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(1, 22, 39, 0.08)',
        'card': '0 4px 12px rgba(1, 22, 39, 0.06)',
        'elevated': '0 8px 24px rgba(1, 22, 39, 0.12)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [],
};

export default config;
