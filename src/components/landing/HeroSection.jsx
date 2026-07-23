import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import HeroIllustration from './HeroIllustration'
import ConceptGraphWireframe from './ConceptGraphWireframe'
import { fadeUp, staggerContainer } from './motion'

export default function HeroSection() {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  const trustItems = [
    t('landing.hero.trust_1'),
    t('landing.hero.trust_2'),
    t('landing.hero.trust_3'),
  ]

  return (
    <section className="relative flex items-center overflow-x-hidden gradient-mesh-warm min-h-0 lg:min-h-[78vh]">
      {/* Decorative flourishes — desktop only */}
      <span aria-hidden="true" className="deco-num top-[8%] left-[3%] hidden lg:block">
        ✦
      </span>
      <span
        aria-hidden="true"
        className="deco-num deco-num-secondary bottom-[10%] right-[4%] hidden lg:block"
      >
        ✦
      </span>

      {/* Subtle structural grid — clipped to section without clipping content */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.035] pointer-events-none overflow-hidden"
        style={{
          backgroundImage:
            'linear-gradient(rgb(var(--tertiary)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--tertiary)) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 sm:pt-24 sm:pb-16 lg:pt-28 lg:pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          {/* Copy column */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={shouldReduceMotion ? {} : staggerContainer}
            className="lg:col-span-6 text-center lg:text-left space-y-4 sm:space-y-5"
          >
            <motion.div variants={shouldReduceMotion ? {} : fadeUp} className="flex justify-center lg:justify-start">
              <span className="eyebrow">{t('landing.hero.eyebrow')}</span>
            </motion.div>

            <motion.h1
              variants={shouldReduceMotion ? {} : fadeUp}
              className="text-4xl sm:text-6xl md:text-7xl font-bold font-display text-primary leading-[0.96] sm:leading-[0.94] tracking-tighter"
            >
              {t('landing.hero.title_before')}{' '}
              <span className="relative inline-block">
                <span className="relative z-10 italic text-tertiary">{t('landing.hero.title_highlight')}</span>
                <span
                  aria-hidden="true"
                  className="absolute bottom-[0.18em] left-0 right-0 h-[0.18em] bg-tertiary/15 -z-0 rounded-full"
                />
              </span>
              {t('landing.hero.title_after') ? (
                <>
                  <br className="hidden sm:block" />
                  {' '}{t('landing.hero.title_after')}
                </>
              ) : null}
            </motion.h1>

            <motion.p
              variants={shouldReduceMotion ? {} : fadeUp}
              className="max-w-xl mx-auto lg:mx-0 text-base sm:text-lg md:text-xl text-secondary leading-relaxed tracking-wide font-serif-content px-1 sm:px-0"
            >
              {t('landing.hero.subtitle_before')}{' '}
              <em className="font-display not-italic text-tertiary">{t('landing.hero.subtitle_highlight')}</em>{' '}
              {t('landing.hero.subtitle_after')}
            </motion.p>

            <motion.div
              variants={shouldReduceMotion ? {} : fadeUp}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-1"
            >
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="tertiary"
                  className="w-full sm:w-auto px-8 py-6 text-base font-semibold rounded-xl shadow-warm-lg font-label tracking-wide group transition-all duration-300 hover:shadow-warm-xl hover:-translate-y-0.5"
                >
                  {t('landing.hero.cta_primary')}
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/login" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-6 text-base font-semibold rounded-xl border-2 font-label tracking-wide bg-surface/40 backdrop-blur-sm transition-all duration-300 hover:shadow-warm-md hover:-translate-y-0.5"
                >
                  {t('landing.hero.cta_secondary')}
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={shouldReduceMotion ? {} : fadeUp}
              className="flex flex-row flex-wrap items-center justify-center lg:justify-start gap-x-4 sm:gap-x-5 gap-y-1.5 pt-0.5 text-xs sm:text-sm text-secondary font-label"
            >
              {trustItems.map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5 whitespace-nowrap">
                  <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                  {item}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Visual column */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative w-full max-w-md sm:max-w-lg mx-auto lg:max-w-none"
          >
            {/* Wireframe backdrop — soft, non-competing */}
            <div className="absolute inset-0 -z-0 opacity-40 lg:opacity-55 scale-105 pointer-events-none hidden sm:block">
              <ConceptGraphWireframe className="max-w-lg mx-auto" />
            </div>

            <div className="relative z-10">
              <HeroIllustration />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
