import { Target, Clock, BarChart3, Timer, FileText, Sparkles } from 'lucide-react'
import { DURATION_OPTIONS, LEVEL_OPTIONS, HOURS_PER_DAY_OPTIONS } from '@/utils/constants'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import StatusBadge from '@/components/common/StatusBadge'
import StepIllustration from './StepIllustration'

function getLabel(options, value) {
  const opt = options.find((o) => o.value === value)
  return opt ? opt.label : value
}

function SummaryRow({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-surface px-4 py-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-tertiary/10">
        <Icon className="h-5 w-5 text-tertiary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-label text-[10px] uppercase tracking-widest text-secondary">
          {label}
        </p>
        <p className="text-sm font-semibold text-primary truncate mt-0.5">
          {value}
        </p>
      </div>
      {accent && <StatusBadge variant="info" size="sm">{accent}</StatusBadge>}
    </div>
  )
}

export default function StepConfirm({ data }) {
  const fileCount = data.files?.length || 0

  return (
    <div className="space-y-7 relative">
      {/* Header */}
      <div className="space-y-4 text-center">
        <StepIllustration variant="confirm" />
        <div className="flex justify-center">
          <span className="eyebrow">Langkah 03 — Konfirmasi</span>
        </div>
        <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-primary leading-tight">
          Siap
          <span className="italic text-tertiary"> mulai?</span>
        </h2>
        <p className="text-secondary max-w-md mx-auto leading-relaxed font-serif-content">
          Periksa kembali pilihanmu sebelum Synapsa mulai merancang
          kurikulum personal.
        </p>
      </div>

      {/* Summary */}
      <div className="space-y-2.5">
        <SummaryRow icon={Target} label="Topik" value={data.topic} />
        <SummaryRow
          icon={BarChart3}
          label="Level"
          value={getLabel(LEVEL_OPTIONS, data.level)}
          accent={getLabel(LEVEL_OPTIONS, data.level)}
        />
        <SummaryRow
          icon={Timer}
          label="Waktu per hari"
          value={`${getLabel(HOURS_PER_DAY_OPTIONS, data.hours_per_day)}`}
        />
        <SummaryRow
          icon={Clock}
          label="Durasi total"
          value={getLabel(DURATION_OPTIONS, data.duration_weeks)}
        />
        {fileCount > 0 && (
          <SummaryRow
            icon={FileText}
            label="Sumber RAG"
            value={`${fileCount} file PDF`}
            accent={fileCount > 0 ? 'Siap' : undefined}
          />
        )}
      </div>

      {/* Reassurance banner */}
      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border border-tertiary/20 bg-tertiary/[0.04] p-4 flex items-start gap-3"
      >
        <Sparkles className="h-4 w-4 text-tertiary shrink-0 mt-0.5" />
        <p className="text-sm text-secondary leading-relaxed">
          Synapsa akan merancang kurikulum yang disesuaikan dengan target
          belajarmu. Proses ini membutuhkan{' '}
          <span className="text-primary font-semibold">1-2 menit</span>.
        </p>
      </motion.div>

      <p className="text-center text-xs text-secondary/70 font-label">
        Kamu bisa ubah preferensi nanti di Settings
      </p>
    </div>
  )
}