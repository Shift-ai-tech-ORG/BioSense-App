import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand backgrounds — Night (#0A0A0A) and surface levels
        bg:  '#0A0A0A',
        s1:  '#111111',
        s2:  '#1A1A1A',
        s3:  '#222222',
        s4:  '#2C2C2C',
        // Text — Seasalt (#F7F7F7) hierarchy
        t1:  '#F7F7F7',
        t2:  '#A3A3A3',
        t3:  '#666666',
        t4:  '#3A3A3A',
        // Brand accent — Imperial Red
        accent:      '#F04D4D',
        'accent-dim':'#C73D3D',
        // Brand secondary — Grape
        grape:       '#7625B0',
        'grape-dim': '#5C1D8C',
        // Semantic health colours (not brand colours)
        opt:  '#22C55E',
        near: '#3B82F6',
        attn: '#F59E0B',
        oor:  '#EF4444',
        urg:  '#DC2626',
      },
      fontFamily: {
        sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        mono:  ['var(--font-jetbrains)', 'SF Mono', 'monospace'],
      },
      borderColor: {
        DEFAULT: 'rgba(247,247,247,0.06)',
        subtle:  'rgba(247,247,247,0.10)',
        medium:  'rgba(247,247,247,0.16)',
        accent:  'rgba(240,77,77,0.25)',
        grape:   'rgba(118,37,176,0.25)',
      },
      backgroundColor: {
        'accent-subtle': 'rgba(240,77,77,0.08)',
        'grape-subtle':  'rgba(118,37,176,0.08)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1',   transform: 'scale(1)' },
          '50%':      { opacity: '0.5', transform: 'scale(0.85)' },
        },
        blink: {
          '0%, 80%, 100%': { opacity: '0.2', transform: 'scale(0.75)' },
          '40%':           { opacity: '1',   transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 380ms cubic-bezier(0.16,1,0.3,1) forwards',
        pulse:     'pulse 2s infinite',
        blink:     'blink 0.9s ease infinite',
      },
    },
  },
  plugins: [],
}
export default config
