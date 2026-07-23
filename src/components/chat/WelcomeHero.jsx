import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * WelcomeHero — calm empty-state for general chat.
 * Typography only: greeting + short helper line.
 */
export default function WelcomeHero({ username }) {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className="text-center max-w-lg mx-auto px-4"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
    >
      <h1 className="font-display text-2xl sm:text-[1.75rem] font-semibold tracking-tight text-primary leading-snug">
        {username
          ? t('chat.empty_title_named', 'Hi {{name}}, what shall we explore?', {
              name: username,
            })
          : t('chat.empty_title', 'What would you like to explore?')}
      </h1>
      <motion.p
        className="mt-3 text-sm text-secondary leading-relaxed"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.05 }}
      >
        {t(
          'chat.empty_subtitle',
          'Ask anything, upload a document, or pick a starter below — answers can use your materials and the web.'
        )}
      </motion.p>
    </motion.div>
  )
}
