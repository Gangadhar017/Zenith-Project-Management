/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--bg-color)',
        foreground: 'var(--text-color)',
        primary: {
          DEFAULT: '#3b82f6', // Premium Sapphire Blue
          hover: '#2563eb',
        },
        secondary: {
          DEFAULT: '#6366f1', // Royal Indigo
          hover: '#4f46e5',
        },
        card: {
          DEFAULT: 'var(--card-bg)',
          border: 'var(--border-color)',
        },
        zinc: {
          950: '#09090b', // Sleek Slate-Black
          900: '#18181b', // Carbon Gray
          800: '#27272a',
          700: '#3f3f46',
          600: '#52525b',
          400: '#a1a1aa',
          200: '#e4e4e7',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'zenith-glow': 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', // Sapphire to Indigo
        'zenith-dark': 'linear-gradient(180deg, #09090b 0%, #18181b 100%)', // Sleek deep zinc-black background
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 8px 32px 0 rgba(59, 130, 246, 0.15)',
      }
    },
  },
  plugins: [],
}
