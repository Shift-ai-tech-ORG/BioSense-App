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
        bg: '#030508',
        s1: '#0c1210',
        s2: '#111a16',
        s3: '#192018',
        s4: '#1e2920',
        t1: '#eff4f0',
        t2: '#90ae9a',
        t3: '#4f6b57',
        t4: '#2c4132',
        accent: '#4dc88c',
        'accent-dim': '#3ba870',
        opt: '#4dc88c',
        near: '#40b0b0',
        attn: '#c89840',
        oor: '#c07040',
        urg: '#c05050',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        mono: ['var(--font-jetbrains)', 'SF Mono', 'monospace'],
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.055)',
        subtle: 'rgba(255,255,255,0.09)',
        medium: 'rgba(255,255,255,0.15)',
        accent: 'rgba(77,200,140,0.2)',
      },
      backgroundColor: {
        'accent-subtle': 'rgba(77,200,140,0.08)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.85)' },
        },
        blink: {
          '0%, 80%, 100%': { opacity: '0.2', transform: 'scale(0.75)' },
          '40%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 380ms cubic-bezier(0.16,1,0.3,1) forwards',
        pulse: 'pulse 2s infinite',
        blink: 'blink 0.9s ease infinite',
      },
    },
  },
  plugins: [],
}
export default config
