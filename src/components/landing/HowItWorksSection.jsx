import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'
import { Target, Brain, BookOpen, GraduationCap } from 'lucide-react'
import { fadeUp, staggerContainer, viewportOnce } from './motion'

const stepMeta = [
  { number: '01', icon: Target, titleKey: 'step1_title', descKey: 'step1_desc' },
  { number: '02', icon: Brain, titleKey: 'step2_title', descKey: 'step2_desc' },
  { number: '03', icon: BookOpen, titleKey: 'step3_title', descKey: 'step3_desc' },
  { number: '04', icon: GraduationCap, titleKey: 'step4_title', descKey: 'step4_desc' },
]

export default function HowItWorksSection() {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  return (
    <section id="cara-kerja" className="py-24 sm:py-32 bg-surface relative overflow-hidden scroll-mt-20">
      <span aria-hidden="true" className="deco-num bottom-12 left-[3%] hidden lg:block">
        ✦
      </span>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={viewportOnce}
          variants={shouldReduceMotion ? {} : staggerContainer}
          className="text-center mb-16 sm:mb-20"
        >
          <motion.div variants={shouldReduceMotion ? {} : fadeUp} className="flex justify-center mb-4">
            <span className="eyebrow">{t('landing.how.eyebrow')}</span>
          </motion.div>
          <motion.h2
            variants={shouldReduceMotion ? {} : fadeUp}
            className="text-4xl sm:text-5xl font-display font-bold text-primary leading-[1.05] tracking-tight"
          >
            {t('landing.how.title_before')}
            <br className="hidden sm:block" />{' '}
            {t('landing.how.title_mid')}{' '}
            <span className="italic text-tertiary">{t('landing.how.title_highlight')}</span>
          </motion.h2>
          <motion.p
            variants={shouldReduceMotion ? {} : fadeUp}
            className="mt-5 max-w-2xl mx-auto text-lg text-secondary leading-relaxed font-serif-content"
          >
            {t('landing.how.subtitle')}
          </motion.p>
        </motion.div>

        <div className="relative">
          {/* Horizontal connector line on desktop */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-transparent via-tertiary/30 to-transparent"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {stepMeta.map((step) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  variants={shouldReduceMotion ? {} : fadeUp}
                  className="relative group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-5">
                      <div className="flex size-24 items-center justify-center rounded-2xl bg-neutral shadow-warm-md ring-1 ring-border-subtle/40 transition-all duration-300 group-hover:shadow-warm-lg group-hover:-translate-y-1">
                        <Icon className="w-10 h-10 text-tertiary transition-transform duration-300 group-hover:scale-105" />
                      </div>
                      <div className="absolute -top-2 -right-2 flex size-9 items-center justify-center rounded-full bg-tertiary text-white font-display font-bold text-sm shadow-warm-md ring-4 ring-surface">
                        {step.number}
                      </div>
                    </div>
                    <h3 className="text-lg font-display font-semibold text-primary mb-2 leading-snug">
                      {t(`landing.how.${step.titleKey}`)}
                    </h3>
                    <p className="text-sm text-secondary leading-relaxed font-serif-content max-w-[220px]">
                      {t(`landing.how.${step.descKey}`)}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
