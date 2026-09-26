import { type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card"
      className={cn(
        'rounded-none border-2 border-border bg-card text-card-foreground shadow-[6px_6px_0_var(--shadow-color)]',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-header" className={cn('p-6', className)} {...props} />
}

function CardTitle({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-title" className={cn('font-bold', className)} {...props} />
}

function CardDescription({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm font-medium text-muted-foreground', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-content" className={cn('p-6', className)} {...props} />
}

function CardFooter({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="card-footer" className={cn('flex items-center p-6', className)} {...props} />
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
