import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-[10.5px] font-bold tracking-[0.08em] uppercase text-t3 mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full px-3.5 py-2.5 bg-s1 border border-[var(--b1)] rounded-lg',
            'text-t1 text-sm placeholder:text-t4 outline-none',
            'transition-colors duration-150',
            'focus:border-[var(--a-ring)]',
            error && 'border-urg/50',
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-urg">{error}</p>}
      </div>
    )
  },
)
Input.displayName = 'Input'
