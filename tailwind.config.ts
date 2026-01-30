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
        // Couleur principale - Brun chaud (sagesse, stabilité, histoire)
        primary: {
          50: '#faf6f3',
          100: '#f3ebe4',
          200: '#e6d5c7',
          300: '#d4b8a3',
          400: '#c19a7f',
          500: '#a67c5b',  // Brun chocolat doux
          600: '#8b6344',
          700: '#6f4e36',
          800: '#3a2a1f',  // Dark mode card bg
          850: '#33251b',  // Dark mode stat card bg
          900: '#2b1f17',  // Dark mode page bg
        },
        // Fond - Beige clair / Parchemin (douceur, confort, manuscrits anciens)
        parchment: {
          50: '#fefdfb',
          100: '#fdf9f3',
          200: '#faf3e8',
          300: '#f5e9d6',
          400: '#eddcc0',
          500: '#e3cca6',
          600: '#d4b88a',
          700: '#c2a06d',
          800: '#a68753',
          900: '#8a6f44',
        },
        // Accent positif - Or doux (valeur, réussite, lumière)
        gold: {
          50: '#fffdf5',
          100: '#fff9e6',
          200: '#fff0c2',
          300: '#ffe599',
          400: '#ffd966',  // Or principal
          500: '#f5c32c',
          600: '#d4a520',
          700: '#b38918',
          800: '#8f6d14',
          900: '#755a12',
        },
        // CTA - Vert olive (confiance, croissance, guidance)
        olive: {
          50: '#f7f9f4',
          100: '#ecf2e5',
          200: '#d9e5cc',
          300: '#bdd1a6',
          400: '#9db87c',
          500: '#7a9a55',  // Vert olive principal
          600: '#5f7b40',
          700: '#4a6133',
          800: '#3d4e2b',
          900: '#344127',
        },
        // Couleurs fonctionnelles
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',  // Vert doux
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        error: {
          50: '#fef7f6',
          100: '#fdecea',
          200: '#fbd5d1',
          300: '#f7b3ac',
          400: '#f08578',
          500: '#e25d4e',  // Rouge désaturé (non agressif)
          600: '#c94535',
          700: '#a83a2c',
          800: '#8b3328',
          900: '#742f27',
        },
        info: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',  // Bleu clair
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Couleurs spéciales pour la gamification
        heart: '#e25d4e',
        xp: '#7a9a55',
        streak: '#f5c32c',
        gem: '#38bdf8',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif'],
      },
      backgroundImage: {
        'parchment-texture': 'linear-gradient(180deg, #fdf9f3 0%, #faf3e8 100%)',
        'gold-gradient': 'linear-gradient(135deg, #ffd966 0%, #f5c32c 100%)',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(166, 124, 91, 0.12)',
        'card': '0 4px 12px rgba(166, 124, 91, 0.08)',
        'elevated': '0 8px 24px rgba(166, 124, 91, 0.15)',
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
