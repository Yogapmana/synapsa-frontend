import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * ReadingProgressBar — top-of-page progress indicator.
 *
 * Phase 5.5: subtle, editorial reading progress bar.
 *  - Sits at top of the Module page, fixed position
 *  - Thin terracotta line with subtle glow
 *  - Smooth ease-out animation
 *  - Respects reduced-motion
 *
 * Listens to the parent scroll container's scrollTop / scrollHeight
 * (not window.scrollY) because the AppLayout locks body scroll.
 */
export default function ReadingProgressBar({ scrollContainerRef }) {
  const [progress, setProgress] = useState(0)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const el = scrollContainerRef?.current
    if (!el) return

    const handleScroll = () => {
      const scrollable = el.scrollHeight - el.clientHeight
      if (scrollable <= 0) {
        setProgress(0)
        return
      }
      const pct = Math.min(100, Math.max(0, (el.scrollTop / scrollable) * 100))
      setProgress(pct)
    }

    handleScroll()
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [scrollContainerRef])

  return (
    <div
      className="absolute top-0 left-0 right-0 h-[2px] bg-tertiary/10 z-50 pointer-events-none"
      aria-hidden="true"
    >
      <motion.div
        className="h-full bg-tertiary origin-left"
        style={{
          boxShadow: '0 0 6px rgba(196, 37, 28, 0.4)',
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: progress / 100 }}
        transition={
          shouldReduceMotion
            ? { duration: 0 }
            : { duration: 0.15, ease: 'linear' }
        }
      />
    </div>
  )
}