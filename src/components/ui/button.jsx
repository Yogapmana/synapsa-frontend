import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Button — primary UI action primitive.
 *
 * Phase 1.6 guidance:
 * - Always use a `variant`. Avoid `className="bg-tertiary text-white..."`
 *   overrides — that's the old pattern and it diverges from the design system.
 * - The `tertiary` variant (terracotta) is for ONE primary action per view.
 *   Use `outline` or `ghost` for secondary actions.
 *
 * Variants:
 *  - default  → dark surface (login card primary)
 *  - outline  → bordered, transparent (secondary)
 *  - ghost    → text-only (tertiary actions in cards)
 *  - tertiary → brand red CTA (single use per view)
 *  - destructive → error/delete (rare)
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-surface hover:bg-primary/90',
        outline: 'border border-[var(--border)] bg-surface hover:bg-surface hover:text-primary',
        ghost: 'hover:bg-surface hover:text-primary',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        tertiary: 'bg-tertiary text-white hover:bg-tertiary-dark',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
  )
})

Button.displayName = 'Button'

export { Button }
export { buttonVariants }
