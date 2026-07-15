import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'accent'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
  isLoading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  disabled = false,
  className,
  ...props
}: ButtonProps) {
  const baseStyles =
    'font-black rounded transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 uppercase tracking-widest'

  const variants = {
    primary: 'bg-accent text-primary hover:shadow-lg hover:shadow-accent/50 active:scale-95 shadow-md',
    secondary: 'bg-secondary text-foreground hover:bg-secondary/80 border border-accent/50',
    outline: 'border-2 border-accent bg-transparent text-accent hover:bg-accent/10',
    ghost: 'hover:text-accent text-foreground hover:bg-secondary/50',
    accent: 'bg-accent text-primary hover:shadow-lg hover:shadow-accent/50 active:scale-95 shadow-md',
  }

  const sizes = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-3 text-sm',
    lg: 'px-8 py-4 text-base',
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  )
}
