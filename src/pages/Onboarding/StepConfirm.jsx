import { Clock, BarChart3, Timer, Target } from 'lucide-react'
import { DURATION_OPTIONS, LEVEL_OPTIONS, HOURS_PER_DAY_OPTIONS } from '@/utils/constants'
import { Card, CardContent } from '@/components/ui/card'

function SummaryItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-tertiary/5 px-4 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tertiary/10">
        <Icon className="h-5 w-5 text-tertiary" />
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  )
}

function getLabel(options, value) {
  const opt = options.find((o) => o.value === value)
  return opt ? opt.label : value
}

export default function StepConfirm({ data }) {
  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Konfirmasi target belajar
        </h2>
        <p className="text-sm text-muted-foreground">
          Periksa kembali pilihanmu sebelum PLA mulai merancang kurikulum.
        </p>
      </div>

      <Card className="border-primary-200 bg-surface shadow-md">
        <CardContent className="space-y-3 p-6">
          <SummaryItem
            icon={Target}
            label="Topik"
            value={data.topic}
          />
          <SummaryItem
            icon={Clock}
            label="Durasi"
            value={getLabel(DURATION_OPTIONS, data.duration_weeks)}
          />
          <SummaryItem
            icon={BarChart3}
            label="Level"
            value={getLabel(LEVEL_OPTIONS, data.level)}
          />
          <SummaryItem
            icon={Timer}
            label="Waktu per hari"
            value={getLabel(HOURS_PER_DAY_OPTIONS, data.hours_per_day)}
          />
        </CardContent>
      </Card>

      <div className="rounded-xl border border-primary-200 bg-tertiary/5 p-4 text-center">
        <p className="text-sm text-tertiary">
          PLA akan merancang kurikulum yang disesuaikan dengan target belajarmu. Proses ini membutuhkan beberapa menit.
        </p>
      </div>
    </div>
  )
}