import { Target, Clock, BarChart3, Timer, FileText, Sparkles } from 'lucide-react'
import { DURATION_OPTIONS, LEVEL_OPTIONS, HOURS_PER_DAY_OPTIONS } from '@/utils/constants'
import { cn } from '@/lib/utils'
import StatusBadge from '@/components/common/StatusBadge'

function getLabel(options, value) {
  const opt = options.find((o) => o.value === value)
  return opt ? opt.label : value
}

function SummaryRow({ icon: Icon, label, value, pill }) {
  return (
    <div className="flex items-center gap-4 rounded-xl bg-bg-secondary px-4 py-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tertiary/10">
        <Icon className="h-5 w-5 text-tertiary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-label text-xs uppercase tracking-wider text-secondary">{label}</p>
        {pill ? (
          <StatusBadge variant="info" className="mt-0.5">{value}</StatusBadge>
        ) : (
          <p className="text-sm font-semibold text-primary">{value}</p>
        )}
      </div>
    </div>
  )
}

export default function StepConfirm({ data }) {
  const fileCount = data.files?.length || 0

  return (
    <div className="space-y-8">
      <div className="space-y-3 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-primary">
          Siap mulai? ✨
        </h2>
        <p className="text-secondary max-w-lg mx-auto">
          Periksa kembali pilihanmu sebelum PLA mulai merancang kurikulum personal.
        </p>
      </div>

      <div className="space-y-3">
        <SummaryRow
          icon={Target}
          label="Topik"
          value={data.topic}
        />
        <SummaryRow
          icon={BarChart3}
          label="Level"
          value={getLabel(LEVEL_OPTIONS, data.level)}
          pill
        />
        <SummaryRow
          icon={Timer}
          label="Waktu belajar"
          value={`${getLabel(HOURS_PER_DAY_OPTIONS, data.hours_per_day)} per hari`}
        />
        <SummaryRow
          icon={Clock}
          label="Durasi"
          value={getLabel(DURATION_OPTIONS, data.duration_weeks)}
        />
        {fileCount > 0 && (
          <SummaryRow
            icon={FileText}
            label="Sumber RAG"
            value={`${fileCount} file`}
          />
        )}
      </div>

      <div className="rounded-xl border border-tertiary/20 bg-tertiary/5 p-4 text-center">
        <p className="text-sm text-primary">
          PLA akan merancang kurikulum yang disesuaikan dengan target belajarmu. Proses ini membutuhkan 1-2 menit.
        </p>
      </div>

      <p className="text-center text-xs text-secondary">
        Kamu bisa ubah preferensi nanti di Settings
      </p>
    </div>
  )
}