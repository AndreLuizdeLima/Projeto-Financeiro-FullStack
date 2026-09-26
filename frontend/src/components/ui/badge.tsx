import { cva, type VariantProps } from 'class-variance-authority'
import { type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-none border-2 border-border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        secondary: 'bg-secondary text-secondary-foreground',
        positive: 'bg-positive text-positive-foreground',
        warning: 'bg-warning text-warning-foreground',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'bg-background text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

type BadgeProps = ComponentProps<'span'> & VariantProps<typeof badgeVariants>

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
