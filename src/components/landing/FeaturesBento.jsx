import { useTranslation } from 'react-i18next'
import { motion, useReducedMotion } from 'framer-motion'
import {
  Brain,
  BookOpen,
  MessageSquare,
  Network,
  PenLine,
  ClipboardCheck,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import ConceptGraphWireframe from './ConceptGraphWireframe'
import { fadeUp, staggerContainer, viewportOnce } from './motion'
import { cn } from '@/lib/utils'

const toneClasses = {
  tertiary: 'bg-tertiary/10 text-tertiary ring-tertiary/15',
  success: 'bg-success-light text-success-fg ring-success/20',
  info: 'bg-info-light text-info-fg ring-info/20',
  warning: 'bg-warning-light text-warning-fg ring-warning/20',
}

function BentoCard({
  icon: Icon,
  title,
  description,
  number,
  accent = 'tertiary',
  className,
  children,
  large = false,
}) {
  const shouldReduceMotion = useReducedMotion()
  return (
    <motion.div
      variants={shouldReduceMotion ? {} : fadeUp}
      className={cn(
        // Only stretch to fill on lg bento; avoid empty vertical space on mobile
        'group h-auto lg:h-full',
        className,
      )}
    >
      <Card
        className={cn(
          'relative h-auto lg:h-full border-none bg-surface shadow-warm-md overflow-hidden',
          'transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-lg',
        )}
      >
        <span
          aria-hidden="true"
          className="absolute top-3 right-4 font-display text-5xl font-black italic text-tertiary/[0.08] leading-none pointer-events-none"
        >
          {number}
        </span>
        <CardContent
          className={cn(
            'relative flex flex-col',
            large ? 'p-6 sm:p-8' : 'p-5 sm:p-7',
          )}
        >
          <div
            className={cn(
              'rounded-2xl ring-2 flex items-center justify-center mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-105',
              large ? 'w-14 h-14' : 'w-12 h-12',
              toneClasses[accent],
            )}
          >
            <Icon className={large ? 'w-6 h-6' : 'w-5 h-5'} />
          </div>
          <h3
            className={cn(
              'font-display font-semibold text-primary leading-snug mb-2',
              large ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl',
            )}
          >
            {title}
          </h3>
          <p className="text-secondary leading-relaxed font-serif-content text-sm sm:text-[0.95rem]">
            {description}
          </p>
          {children && <div className="mt-5 sm:mt-6">{children}</div>}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function FeaturesBento() {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()
  return (
    <section id="fitur" className="py-24 sm:py-32 bg-neutral relative overflow-hidden scroll-mt-20">
      <span
        aria-hidden="true"
        className="deco-num deco-num-secondary top-12 right-[5%] hidden lg:block"
      >
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
            <span className="eyebrow">{t('landing.features_section.eyebrow')}</span>
          </motion.div>
          <motion.h2
            variants={shouldReduceMotion ? {} : fadeUp}
            className="text-4xl sm:text-5xl font-display font-bold text-primary leading-[1.05] tracking-tight"
          >
            {t('landing.features_section.title_before')}
            <br className="hidden sm:block" />{' '}
            <span className="italic text-tertiary">{t('landing.features_section.title_highlight')}</span>
          </motion.h2>
          <motion.p
            variants={shouldReduceMotion ? {} : fadeUp}
            className="mt-5 max-w-2xl mx-auto text-lg text-secondary leading-relaxed font-serif-content"
          >
            {t('landing.features_section.subtitle')}
          </motion.p>
        </motion.div>

        {/* Bento grid — natural row heights on mobile; equal fill only on lg */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={shouldReduceMotion ? {} : staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-start lg:items-stretch lg:auto-rows-fr"
        >
          <BentoCard
            icon={PenLine}
            title={t('landing.features_section.composer_title')}
            description={t('landing.features_section.composer_desc')}
            number="01"
            accent="tertiary"
            large
            className="lg:col-span-2"
          >
            <div className="flex flex-wrap gap-2">
              {['web', 'arXiv', 'Scholar', 'Wikipedia', 'YouTube', 'PDF'].map((src) => (
                <span
                  key={src}
                  className="inline-flex items-center rounded-full bg-tertiary/8 text-tertiary px-2.5 py-1 text-[11px] font-label font-medium uppercase tracking-wider ring-1 ring-tertiary/15 transition-colors duration-300 group-hover:bg-tertiary/12"
                >
                  {src}
                </span>
              ))}
            </div>
          </BentoCard>

          <BentoCard
            icon={Network}
            title={t('landing.features_section.graph_title')}
            description={t('landing.features_section.graph_desc')}
            number="02"
            accent="info"
            className="lg:row-span-2"
          >
            <div className="rounded-xl bg-surface-2/60 ring-1 ring-border-subtle/40 p-2 -mx-0.5 overflow-hidden">
              <ConceptGraphWireframe
                compact
                animated={false}
                className="opacity-90 max-w-[280px] sm:max-w-none mx-auto"
              />
            </div>
          </BentoCard>

          <BentoCard
            icon={ClipboardCheck}
            title={t('landing.features_section.quiz_title')}
            description={t('landing.features_section.quiz_desc')}
            number="03"
            accent="success"
          />

          <BentoCard
            icon={MessageSquare}
            title={t('landing.features_section.tutor_title')}
            description={t('landing.features_section.tutor_desc')}
            number="04"
            accent="warning"
          />
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={shouldReduceMotion ? {} : fadeUp}
          className="mt-4 sm:mt-5"
        >
          <Card className="border-none bg-surface shadow-warm-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-lg group">
            <CardContent className="p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
              <div className="w-12 h-12 shrink-0 rounded-2xl ring-2 bg-tertiary/10 text-tertiary ring-tertiary/15 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <Brain className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg sm:text-xl font-display font-semibold text-primary">
                    {t('landing.features_section.adaptive_title')}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="font-display text-2xl font-black italic text-tertiary/[0.12] leading-none hidden sm:inline"
                  >
                    05
                  </span>
                </div>
                <p className="text-secondary leading-relaxed font-serif-content text-sm sm:text-base">
                  {t('landing.features_section.adaptive_desc')}
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 shrink-0">
                <BookOpen className="w-4 h-4 text-secondary/50" />
                <span className="text-xs font-label uppercase tracking-widest text-secondary/60">
                  {t('landing.features_section.planner_badge')}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
