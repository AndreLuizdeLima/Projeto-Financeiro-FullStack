import { type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-10 w-full rounded-none border-2 border-input bg-background px-3 py-2 text-sm font-medium outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
