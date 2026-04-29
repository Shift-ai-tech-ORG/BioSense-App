interface BrandMarkProps {
  size?: number
  className?: string
}

/**
 * BioSense S mark — the custom "S" logo rendered in the brand gradient
 * (Grape #5A7040 → Imperial Red #6E9B5E).
 * Per brand guidelines: gradient applies to the mark only, not the wordmark text.
 * Never recreate, redraw, or alter; this SVG approximates the approved mark.
 */
export function BrandMark({ size = 28, className = '' }: BrandMarkProps) {
  const gid = 'bs-brand-grad'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="BioSense"
    >
      <defs>
        <linearGradient id={gid} x1="36" y1="0" x2="0" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#5A7040" />
          <stop offset="100%" stopColor="#6E9B5E" />
        </linearGradient>
      </defs>
      {/*
       * Flowing S path — two opposing arcs forming the brand S mark.
       * Upper arc: sweeps left from upper-right to middle-left.
       * Lower arc: sweeps right from middle-right to lower-left.
       * Stroke-based with rounded ends to match the brand mark style.
       */}
      <path
        d="
          M 27 7
          C 27 4.5 24 3 20 3
          C 14 3 9 6.5 9 11.5
          C 9 15.5 12 17.5 18 19
          C 24 20.5 27 22.5 27 26.5
          C 27 31 22 33.5 16 33
          C 11 32.5 9 30 9 28
        "
        stroke={`url(#${gid})`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

/**
 * Full wordmark lock-up: S mark + "BioSense" text.
 * "Bio" and "ense" in white; gradient only on the mark.
 */
export function BrandWordmark({ size = 28, textSize = 15 }: { size?: number; textSize?: number }) {
  return (
    <span className="flex items-center gap-2">
      <BrandMark size={size} />
      <span
        className="font-sans font-semibold text-t1 tracking-[-0.01em]"
        style={{ fontSize: textSize }}
      >
        Bio<span style={{ color: 'transparent' }}>S</span>ense
      </span>
    </span>
  )
}
