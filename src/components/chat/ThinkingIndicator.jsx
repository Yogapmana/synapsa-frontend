import React from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Avatar from '@/components/common/Avatar'

const ThinkingIndicator = ({ message }) => {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="mb-5 flex items-start gap-3">
      <div className="mt-0.5 shrink-0">
        <Avatar role="tutor" variant="soft" size="sm" />
      </div>
      <div className="flex min-w-[140px] flex-col gap-2 rounded-2xl rounded-tl-md border border-border-subtle bg-surface px-4 py-3 shadow-warm-xs">
        {message && (
          <span className="text-xs font-medium text-secondary animate-pulse">{message}</span>
        )}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="size-2 rounded-full bg-tertiary/55"
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      y: [0, -5, 0],
                      opacity: [0.35, 1, 0.35],
                    }
              }
              transition={
                shouldReduceMotion
                  ? undefined
                  : {
                      duration: 1.1,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.16,
                    }
              }
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ThinkingIndicator
