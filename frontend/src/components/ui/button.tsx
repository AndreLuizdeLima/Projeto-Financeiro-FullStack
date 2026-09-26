import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-none border-2 border-border px-4 text-sm font-bold whitespace-nowrap transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow-[4px_4px_0_var(--shadow-color)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--shadow-color)]',
        destructive:
          'bg-destructive text-destructive-foreground shadow-[4px_4px_0_var(--shadow-color)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_var(--shadow-color)]',
        outline: 'bg-background text-foreground hover:bg-accent',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-accent',
        ghost: 'border-transparent bg-transparent text-foreground hover:bg-accent',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-6 text-base',
        icon: 'size-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
