import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { DURATION_OPTIONS, LEVEL_OPTIONS, HOURS_PER_DAY_OPTIONS } from '@/utils/constants'
import { Lightbulb, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import StepIllustration from './StepIllustration'

const QUICK_SUGGESTIONS = [
  'Web Development',
  'Data Science',
  'Machine Learning',
  'Mobile Development',
  'UI/UX Design',
  'Cybersecurity',
]

function RadioCardGroup({ label, options, selected, onSelect }) {
  return (
    <div className="space-y-2.5">
      <label className="font-label text-xs uppercase tracking-wider text-secondary">
        {label}
      </label>
      <div className="grid grid-cols-3 gap-2.5">
        {options.map((opt) => {
          const isActive = selected === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={cn(
                'relative flex items-center justify-center rounded-xl border-2 px-3 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'border-tertiary bg-tertiary/[0.06] text-tertiary shadow-warm-xs'
                  : 'border-border bg-surface text-secondary hover:border-tertiary/40 hover:bg-tertiary/[0.03]'
              )}
            >
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-tertiary"
                />
              )}
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function StepGoal({ data, onChange }) {
  const { t, i18n } = useTranslation()

  const isValid =
    data.language && data.topic.trim() && data.duration_weeks && data.level && data.hours_per_day

  const handleLanguageChange = (val) => {
    i18n.changeLanguage(val)
    onChange({ language: val })
  }

  return (
    <div className="space-y-7 relative">
      {/* Header — illustration + eyebrow + title */}
      <div className="space-y-4 text-center">
        <StepIllustration variant="goal" />
        <div className="flex justify-center">
          <span className="eyebrow">{t('onboarding.welcome_title')}</span>
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-primary leading-tight">
          {t('onboarding.welcome_subtitle')}
        </h2>
      </div>

      <div className="space-y-6">
        <RadioCardGroup
          label={t('onboarding.language_label')}
          options={[
            { label: 'Indonesia', value: 'id' },
            { label: 'English', value: 'en' },
          ]}
          selected={data.language}
          onSelect={handleLanguageChange}
        />

        <div className="space-y-2.5">
          <label
            htmlFor="topic"
            className="font-label text-xs uppercase tracking-wider text-secondary"
          >
            {t('onboarding.topic_label')}
          </label>
          <Input
            id="topic"
            value={data.topic}
            onChange={(e) => onChange({ topic: e.target.value })}
            placeholder={t('onboarding.topic_placeholder')}
            className="h-12 rounded-xl border-border bg-surface text-base focus-visible:ring-tertiary"
          />
          <div className="flex flex-wrap items-center gap-2 pt-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-label uppercase tracking-wider text-secondary/70">
              <Lightbulb className="h-3 w-3" />
              Saran:
            </span>
            {QUICK_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onChange({ topic: suggestion })}
                className={cn(
                  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all',
                  data.topic === suggestion
                    ? 'border-tertiary bg-tertiary/10 text-tertiary'
                    : 'border-border bg-surface text-secondary hover:border-tertiary/40 hover:bg-tertiary/5'
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <RadioCardGroup
          label={t('onboarding.level_label')}
          options={LEVEL_OPTIONS}
          selected={data.level}
          onSelect={(value) => onChange({ level: value })}
        />

        <RadioCardGroup
          label={t('onboarding.duration_label')}
          options={DURATION_OPTIONS}
          selected={data.duration_weeks}
          onSelect={(value) => onChange({ duration_weeks: value })}
        />

        <RadioCardGroup
          label={t('onboarding.hours_label')}
          options={HOURS_PER_DAY_OPTIONS}
          selected={data.hours_per_day}
          onSelect={(value) => onChange({ hours_per_day: value })}
        />
      </div>

      {isValid && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center gap-2 text-sm text-tertiary font-medium pt-2"
        >
          <Sparkles className="size-4" />
          <span>Sempurna! Lanjut untuk langkah berikutnya.</span>
        </motion.div>
      )}
    </div>
  )
}