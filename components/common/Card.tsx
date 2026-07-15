import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  glass?: boolean
}

export function Card({ children, className, glass = false }: CardProps) {
  return (
    <div
      className={cn(
        'rounded',
        glass
          ? 'bg-secondary/40 backdrop-blur-sm border border-accent/20'
          : 'bg-card text-card-foreground border border-border/50 shadow-md hover-glow',
        className
      )}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn('p-6 border-b border-border', className)}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: ReactNode
  className?: string
}

export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h2 className={cn('prose-heading text-2xl', className)}>
      {children}
    </h2>
  )
}

interface CardDescriptionProps {
  children: ReactNode
  className?: string
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return (
    <p className={cn('text-muted-foreground', className)}>
      {children}
    </p>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn('p-6', className)}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('p-6 border-t border-border flex gap-3', className)}>
      {children}
    </div>
  )
}
