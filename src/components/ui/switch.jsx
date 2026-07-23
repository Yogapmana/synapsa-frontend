import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

/**
 * Brand-aligned switch.
 * Off: soft warm track + white thumb (clear on cream cards)
 * On:  terracotta track + white thumb
 */
const Switch = React.forwardRef(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'group peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-200',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
      'disabled:cursor-not-allowed disabled:opacity-50',
      // Off — soft warm track, not cream-on-cream
      'data-[state=unchecked]:border-border data-[state=unchecked]:bg-secondary/25',
      // On — brand terracotta
      'data-[state=checked]:border-tertiary data-[state=checked]:bg-tertiary',
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'pointer-events-none block size-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
        'group-data-[state=checked]:translate-x-5 group-data-[state=unchecked]:translate-x-0.5',
      )}
    />
  </SwitchPrimitive.Root>
))

Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch }
