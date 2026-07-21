/** Shared Framer Motion variants for landing sections. */
export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
}

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.12 },
  },
}

export const viewportOnce = { once: true, margin: '-100px' }
