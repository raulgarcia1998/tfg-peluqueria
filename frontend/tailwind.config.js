// CC-BY-SA 4.0 — TFG Peluquería

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        // Colores de tema respaldados por variables CSS (ver :root en styles.css).
        // El formato rgb(var() / <alpha-value>) permite usar opacidad: bg-accent/50.
        accent:  'rgb(var(--accent-rgb) / <alpha-value>)',
        accent2: 'rgb(var(--accent-2-rgb) / <alpha-value>)',
        surface: 'rgb(var(--bg-rgb) / <alpha-value>)',
        panel:   'rgb(var(--bg-alt-rgb) / <alpha-value>)',
        // `brand` apunta ahora al acento para neutralizar usos previos de indigo.
        brand: {
          50:  '#f3f4f6',
          100: '#e5e7eb',
          200: '#d1d5db',
          300: '#9ca3af',
          400: '#4b5563',
          500: '#1f2937',
          600: '#111827',
          700: '#0f1115',
          800: '#0a0a0a',
          900: '#000000',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};
