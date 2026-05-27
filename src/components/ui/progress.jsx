import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef(({ className, value, indicatorClassName, ...props }, ref) => {
  const shouldReduceMotion = useReducedMotion()
  const translateX = `-${100 - (value || 0)}%`

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}>
      <ProgressPrimitive.Indicator asChild>
        <motion.div
          className={cn("h-full w-full flex-1 bg-primary", indicatorClassName)}
          initial={{ x: "-100%" }}
          animate={{ x: translateX }}
          transition={shouldReduceMotion ? { duration: 0 } : { 
            duration: 0.8, 
            ease: [0.4, 0, 0.2, 1], 
            delay: 0.2 
          }}
        />
      </ProgressPrimitive.Indicator>
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
