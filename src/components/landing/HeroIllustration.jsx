import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Sparkles, Brain, MessageSquare, Search, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * HeroIllustration — signature visual for Synapsa marketing.
 * Desktop: floating orbit chips around the book (inward positions, roomy stage).
 * Mobile: book centered + compact 2×2 chip grid (no overflow/clipping).
 */
export default function HeroIllustration({ className }) {
  const { t } = useTranslation()
  const shouldReduceMotion = useReducedMotion()

  // Desktop orbit positions — kept well inside the stage
  const fragments = [
    {
      icon: Search,
      label: t('landing.hero.chip_research'),
      sublabel: t('landing.hero.chip_research_sub'),
      x: '6%',
      y: '8%',
      tone: 'tertiary',
      delay: 0,
      float: 'float-slow',
    },
    {
      icon: Brain,
      label: t('landing.hero.chip_planner'),
      sublabel: t('landing.hero.chip_planner_sub'),
      x: '56%',
      y: '6%',
      tone: 'success',
      delay: 0.4,
      float: 'float-slower',
    },
    {
      icon: FileText,
      label: t('landing.hero.chip_module'),
      sublabel: t('landing.hero.chip_module_sub'),
      x: '4%',
      y: '54%',
      tone: 'info',
      delay: 0.8,
      float: 'float-slow',
    },
    {
      icon: MessageSquare,
      label: t('landing.hero.chip_tutor'),
      sublabel: t('landing.hero.chip_tutor_sub'),
      x: '52%',
      y: '52%',
      tone: 'warning',
      delay: 1.2,
      float: 'float-slower',
    },
  ]

  const toneClasses = {
    tertiary: 'bg-tertiary/10 text-tertiary border-tertiary/30',
    success: 'bg-success-light text-success-fg border-success/30',
    info: 'bg-info-light text-info-fg border-info/30',
    warning: 'bg-warning-light text-warning-fg border-warning/30',
  }

  return (
    <div className={cn('relative w-full', className)} aria-hidden="true">
      <span className="deco-num top-[-1rem] left-0 hidden xl:block opacity-60">
        M·01
      </span>
      <span className="deco-num deco-num-secondary bottom-[-1rem] right-0 hidden xl:block opacity-60">
        ✦
      </span>

      {/* ── Mobile layout: book + chip grid (no absolute overflow) ── */}
      <div className="md:hidden flex flex-col items-center gap-5 px-1">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <div className="absolute -inset-6 bg-tertiary/[0.08] blur-2xl rounded-full" />
          <BookStack className="relative scale-90" />
        </motion.div>

        <div className="grid grid-cols-2 gap-2.5 w-full max-w-sm">
          {fragments.map((frag) => {
            const Icon = frag.icon
            return (
              <motion.div
                key={frag.label}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.9 + frag.delay * 0.3,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <div
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-2.5 py-2 shadow-warm-sm bg-surface',
                    toneClasses[frag.tone],
                  )}
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-surface shadow-warm-xs">
                    <Icon className="size-3.5" />
                  </div>
                  <div className="text-left min-w-0">
                    <div className="font-display text-xs font-bold leading-tight truncate">
                      {frag.label}
                    </div>
                    <div className="font-label text-[9px] uppercase tracking-wider opacity-70 truncate">
                      {frag.sublabel}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0 }}
          animate={shouldReduceMotion ? {} : { opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="flex items-center justify-center gap-2 text-[10px] font-label text-secondary/60"
        >
          <span className="inline-block w-6 h-px bg-tertiary/30" />
          <span className="uppercase tracking-[0.16em]">{t('landing.hero.caption')}</span>
          <span className="inline-block w-6 h-px bg-tertiary/30" />
        </motion.div>
      </div>

      {/* ── Desktop / tablet: roomy orbit stage ── */}
      <div className="hidden md:block relative mx-auto h-[380px] lg:h-[420px] max-w-3xl">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-tertiary/[0.07] blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {fragments.map((frag) => {
          const Icon = frag.icon
          return (
            <motion.div
              key={frag.label}
              initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.6 }}
              animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.4 + frag.delay, ease: [0.16, 1, 0.3, 1] }}
              style={{ left: frag.x, top: frag.y }}
              className="absolute z-10"
            >
              <div className={cn(!shouldReduceMotion && frag.float)}>
                <div
                  className={cn(
                    'flex items-center gap-2.5 rounded-2xl border-2 px-3.5 py-2.5 shadow-warm-md bg-surface',
                    'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-warm-lg',
                    toneClasses[frag.tone],
                  )}
                >
                  <div className="flex size-8 items-center justify-center rounded-xl bg-surface shadow-warm-xs">
                    <Icon className="size-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-display text-sm font-bold leading-tight">
                      {frag.label}
                    </div>
                    <div className="font-label text-[10px] uppercase tracking-wider opacity-70">
                      {frag.sublabel}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
        >
          <div className="relative">
            <div className="absolute -inset-6 bg-tertiary/[0.08] blur-2xl rounded-full" />
            <BookStack />
          </div>
        </motion.div>

        {!shouldReduceMotion && (
          <>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.0, duration: 0.4 }}
              className="absolute top-[22%] left-[28%] text-tertiary z-0"
            >
              <Sparkles className="size-4 float-slow" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.2, duration: 0.4 }}
              className="absolute bottom-[26%] right-[28%] text-tertiary z-0"
            >
              <Sparkles className="size-3 float-slower" />
            </motion.div>
          </>
        )}
      </div>

      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0 }}
        animate={shouldReduceMotion ? {} : { opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.6 }}
        className="mt-3 hidden md:flex items-center justify-center gap-3 text-xs font-label text-secondary/60"
      >
        <span className="inline-block w-8 h-px bg-tertiary/30" />
        <span className="uppercase tracking-[0.18em]">{t('landing.hero.caption')}</span>
        <span className="inline-block w-8 h-px bg-tertiary/30" />
      </motion.div>
    </div>
  )
}

function BookStack({ className }) {
  return (
    <svg
      width="180"
      height="200"
      viewBox="0 0 180 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('drop-shadow-[0_18px_24px_rgba(58,41,22,0.18)]', className)}
    >
      <rect x="30" y="135" width="120" height="50" rx="3" fill="#9A1E16" />
      <rect x="30" y="135" width="120" height="50" rx="3" fill="url(#book-bottom-grad)" />
      <line x1="40" y1="148" x2="140" y2="148" stroke="#FCD9D3" strokeWidth="1.5" opacity="0.5" />
      <line x1="40" y1="158" x2="140" y2="158" stroke="#FCD9D3" strokeWidth="1" opacity="0.4" />
      <line x1="40" y1="168" x2="140" y2="168" stroke="#FCD9D3" strokeWidth="1" opacity="0.4" />
      <rect x="148" y="135" width="3" height="50" fill="#FFFBEF" opacity="0.6" />

      <path
        d="M 30 130 L 30 70 Q 30 65 35 64 L 88 60 L 90 125 L 32 130 Z"
        fill="#FFFBEF"
        stroke="#C4BEB1"
        strokeWidth="1"
      />
      <path
        d="M 150 130 L 150 70 Q 150 65 145 64 L 92 60 L 90 125 L 148 130 Z"
        fill="#FFFBEF"
        stroke="#C4BEB1"
        strokeWidth="1"
      />
      <line x1="90" y1="60" x2="90" y2="125" stroke="#C4BEB1" strokeWidth="1.2" />

      <line x1="42" y1="78" x2="80" y2="76" stroke="#7B766D" strokeWidth="1.2" opacity="0.5" />
      <line x1="42" y1="86" x2="82" y2="84" stroke="#7B766D" strokeWidth="1" opacity="0.4" />
      <line x1="42" y1="93" x2="78" y2="91" stroke="#7B766D" strokeWidth="1" opacity="0.4" />
      <line x1="42" y1="100" x2="80" y2="98" stroke="#7B766D" strokeWidth="1" opacity="0.4" />
      <line x1="42" y1="107" x2="75" y2="105" stroke="#7B766D" strokeWidth="1" opacity="0.4" />
      <line x1="42" y1="114" x2="82" y2="112" stroke="#7B766D" strokeWidth="1" opacity="0.4" />

      <line x1="100" y1="76" x2="138" y2="78" stroke="#7B766D" strokeWidth="1.2" opacity="0.5" />
      <line x1="100" y1="84" x2="140" y2="86" stroke="#7B766D" strokeWidth="1" opacity="0.4" />
      <line x1="100" y1="91" x2="135" y2="93" stroke="#7B766D" strokeWidth="1" opacity="0.4" />
      <line x1="100" y1="98" x2="138" y2="100" stroke="#7B766D" strokeWidth="1" opacity="0.4" />
      <line x1="100" y1="105" x2="132" y2="107" stroke="#7B766D" strokeWidth="1" opacity="0.4" />
      <line x1="100" y1="112" x2="140" y2="114" stroke="#7B766D" strokeWidth="1" opacity="0.4" />

      <rect x="42" y="93" width="38" height="2.5" fill="#C4251C" opacity="0.7" />
      <rect x="42" y="100" width="38" height="2.5" fill="#C4251C" opacity="0.7" />

      <path d="M 110 125 L 110 145 L 113 141 L 116 145 L 116 125 Z" fill="#C4251C" />

      <path
        d="M 45 70 L 46 73 L 49 73 L 47 75 L 48 78 L 45 76 L 42 78 L 43 75 L 41 73 L 44 73 Z"
        fill="#C4251C"
        opacity="0.4"
      />

      <defs>
        <linearGradient id="book-bottom-grad" x1="30" y1="135" x2="150" y2="185" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9A1E16" />
          <stop offset="1" stopColor="#7A1812" />
        </linearGradient>
      </defs>
    </svg>
  )
}
