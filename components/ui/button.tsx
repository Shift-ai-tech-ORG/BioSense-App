import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'subtle'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = 'primary', size = 'md', loading, children, disabled, ...props },
    ref,
  ) => {
    const base =
      'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'

    const variants = {
      primary: 'text-white hover:brightness-110 active:scale-98 font-semibold',
      ghost: 'bg-transparent border border-[var(--b1)] text-t1 hover:bg-s2 hover:border-[var(--b2)]',
      subtle: 'bg-s2 border border-[var(--b0)] text-t2 hover:text-t1 hover:border-[var(--b1)]',
    }

    const sizes = {
      sm: 'text-xs px-3 py-1.5',
      md: 'text-sm px-4 py-2.5',
      lg: 'text-sm px-6 py-3',
    }

    const gradientStyle =
      variant === 'primary'
        ? { background: 'linear-gradient(135deg, #5A7040 0%, #6E9B5E 100%)' }
        : undefined

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        style={gradientStyle}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    )
  },
)
Button.displayName = 'Button'
