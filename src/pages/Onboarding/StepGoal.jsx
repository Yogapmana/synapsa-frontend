import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { DURATION_OPTIONS, LEVEL_OPTIONS, HOURS_PER_DAY_OPTIONS } from '@/utils/constants'
import { Lightbulb } from 'lucide-react'

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
      <div className="grid grid-cols-3 gap-3">
        {options.map((opt) => {
          const isActive = selected === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelect(opt.value)}
              className={cn(
                'relative flex items-center justify-center rounded-xl border-2 px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'border-tertiary bg-tertiary/5 text-tertiary shadow-warm-xs'
                  : 'border-border bg-surface text-secondary hover:border-tertiary/30 hover:bg-tertiary/5'
              )}
            >
              {isActive && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-tertiary" />
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
  const isValid = data.topic.trim() && data.duration_weeks && data.level && data.hours_per_day

  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-primary">
          Apa yang ingin kamu pelajari?
        </h2>
        <p className="text-secondary max-w-lg mx-auto">
          Beri tahu PLA, dan kami akan rancang kurikulum personal untuk kamu.
        </p>
      </div>

      <div className="space-y-7">
        <div className="space-y-2.5">
          <label htmlFor="topic" className="font-label text-xs uppercase tracking-wider text-secondary">
            Topik utama
          </label>
          <Input
            id="topic"
            value={data.topic}
            onChange={(e) => onChange({ topic: e.target.value })}
            placeholder="misalnya: Machine Learning, Desain UI/UX, Bahasa Jepang..."
            className="h-12 rounded-xl border-border bg-surface text-base focus-visible:ring-tertiary"
          />
          <div className="flex flex-wrap gap-2 pt-1">
            <Lightbulb className="h-3.5 w-3.5 text-secondary/60 mt-0.5 shrink-0" />
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
          label="Level saat ini"
          options={LEVEL_OPTIONS}
          selected={data.level}
          onSelect={(value) => onChange({ level: value })}
        />

        <RadioCardGroup
          label="Durasi belajar"
          options={DURATION_OPTIONS}
          selected={data.duration_weeks}
          onSelect={(value) => onChange({ duration_weeks: value })}
        />

        <RadioCardGroup
          label="Waktu belajar per hari"
          options={HOURS_PER_DAY_OPTIONS}
          selected={data.hours_per_day}
          onSelect={(value) => onChange({ hours_per_day: value })}
        />
      </div>

      {isValid && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-sm text-tertiary font-medium"
        >
          Lanjutkan untuk menambahkan referensi atau langsung mulai belajar!
        </motion.p>
      )}
    </div>
  )
}