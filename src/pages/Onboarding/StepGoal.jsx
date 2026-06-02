import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { DURATION_OPTIONS, LEVEL_OPTIONS, HOURS_PER_DAY_OPTIONS } from '@/utils/constants'

function PillGroup({ label, options, selected, onSelect }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={cn(
              'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition-all',
              'border border-border hover:border-tertiary/50',
              selected === opt.value
                ? 'bg-tertiary text-white border-tertiary shadow-lg'
                : 'bg-surface text-text-secondary hover:bg-tertiary/5'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function StepGoal({ data, onChange }) {
  const isValid = data.topic.trim() && data.duration_weeks && data.level && data.hours_per_day

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Apa yang ingin kamu pelajari?
        </h2>
        <p className="text-sm text-muted-foreground">
          Tentukan target belajarmu dan PLA akan merancang kurikulum yang sesuai.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="topic" className="text-sm font-medium text-foreground">
            Topik belajar
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              Saya ingin mempelajari
            </span>
            <Input
              id="topic"
              value={data.topic}
              onChange={(e) => onChange({ topic: e.target.value })}
              placeholder="misalnya: Machine Learning, Desain UI/UX, Bahasa Jepang..."
              className="pl-[180px]"
            />
          </div>
        </div>

        <PillGroup
          label="Durasi belajar"
          options={DURATION_OPTIONS}
          selected={data.duration_weeks}
          onSelect={(value) => onChange({ duration_weeks: value })}
        />

        <PillGroup
          label="Level saat ini"
          options={LEVEL_OPTIONS}
          selected={data.level}
          onSelect={(value) => onChange({ level: value })}
        />

        <PillGroup
          label="Waktu belajar per hari"
          options={HOURS_PER_DAY_OPTIONS}
          selected={data.hours_per_day}
          onSelect={(value) => onChange({ hours_per_day: value })}
        />
      </div>

      {isValid && (
        <p className="text-center text-sm text-tertiary font-medium">
          Lanjutkan untuk menambahkan referensi atau langsung mulai belajar!
        </p>
      )}
    </div>
  )
}