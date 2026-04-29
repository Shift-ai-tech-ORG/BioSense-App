import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: boolean
}

export function Card({ className, accent, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-s1 border rounded-[11px] p-5',
        'border-[var(--b0)]',
        accent && 'border-[var(--a-ring)] bg-gradient-to-br from-[rgba(110,155,94,0.04)] to-s1',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardLabel({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'text-[10px] font-bold tracking-[0.09em] uppercase text-t3 mb-3',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
