import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useActiveSession } from '@/hooks/useLearning'
import { useQuizHistory } from '@/hooks/useQuiz'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import PageHeader from '@/components/common/PageHeader'
import StatusBadge from '@/components/common/StatusBadge'
import {
  Trophy,
  Clock,
  CheckCircle2,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Inbox,
  History as HistoryIcon,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

function getScorePill(percentage) {
  if (percentage == null) return { variant: 'neutral', label: '—' }
  if (percentage >= 90) return { variant: 'success', label: 'Sangat Baik' }
  if (percentage >= 75) return { variant: 'info', label: 'Baik' }
  if (percentage >= 60) return { variant: 'warning', label: 'Cukup' }
  return { variant: 'danger', label: 'Perlu Review' }
}

function getTrend(firstPct, latestPct) {
  if (firstPct == null || latestPct == null) return null
  if (latestPct > firstPct + 5) return { icon: TrendingUp, color: 'text-success', label: 'Membaik' }
  if (latestPct < firstPct - 5) return { icon: TrendingDown, color: 'text-danger', label: 'Menurun' }
  return { icon: Minus, color: 'text-secondary', label: 'Stabil' }
}

function groupByTopic(attempts) {
  const map = new Map()
  for (const a of attempts) {
    const key = a.topic_id || '__no_topic__'
    if (!map.has(key)) {
      map.set(key, {
        topic_id: a.topic_id,
        topic_title: a.topic_title || 'Topik tanpa judul',
        attempts: [],
      })
    }
    map.get(key).attempts.push(a)
  }
  for (const group of map.values()) {
    group.attempts.reverse()
  }
  return Array.from(map.values()).sort((a, b) => {
    const aFirst = a.attempts[0]?.created_at || ''
    const bFirst = b.attempts[0]?.created_at || ''
    return aFirst.localeCompare(bFirst)
  })
}

function formatTimeSpent(seconds) {
  if (seconds == null || seconds <= 0) return null
  const minutes = Math.round(seconds / 60)
  if (minutes < 1) return '< 1 mnt'
  return `${minutes} mnt`
}

function formatDate(iso) {
  if (!iso) return '—'
  try {
    return format(new Date(iso), 'd MMM yyyy, HH:mm', { locale: idLocale })
  } catch {
    return '—'
  }
}

export default function QuizHistory() {
  const { data: session } = useActiveSession()
  const sessionId = session?.id
  const { data: attempts = [], isLoading } = useQuizHistory(sessionId)

  const groups = useMemo(() => groupByTopic(attempts), [attempts])

  const stats = useMemo(() => {
    if (attempts.length === 0) {
      return { total: 0, avg: 0, best: 0, lastDate: null }
    }
    const percentages = attempts.map((a) => a.percentage ?? 0)
    const total = attempts.length
    const avg = Math.round(percentages.reduce((s, p) => s + p, 0) / total)
    const best = Math.max(...percentages)
    const lastDate = attempts[0]?.created_at || null
    return { total, avg, best, lastDate }
  }, [attempts])

  return (
    <div className="max-w-5xl mx-auto">
      <div className="relative rounded-3xl p-6 md:p-8 mb-6 gradient-mesh-warm overflow-hidden">
        <div className="relative z-10">
          <div className="eyebrow mb-4">Bab 03 — Evaluasi</div>

          <PageHeader
            title="Riwayat Kuis"
            subtitle="Semua kuis yang pernah Anda kerjakan, dikelompokkan per topik."
            icon={HistoryIcon}
            breadcrumbs={[
              { label: 'Dashboard', to: '/dashboard' },
              { label: 'Riwayat Kuis' },
            ]}
          />
        </div>

        {!isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <StatTile label="Total Kuis" value={stats.total} icon={HelpCircle} />
            <StatTile label="Rata-rata" value={`${stats.avg}%`} icon={BarChart3} />
            <StatTile label="Skor Terbaik" value={`${stats.best}%`} icon={CheckCircle2} />
            <StatTile
              label="Terakhir"
              value={stats.lastDate ? formatDate(stats.lastDate) : '—'}
              icon={Clock}
              small
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Belum ada riwayat kuis"
          description="Mulai kerjakan kuis pada topik manapun untuk melihat riwayatnya di sini."
        />
      ) : (
        <div className="space-y-4">
          {groups.map((group, idx) => (
            <TopicGroupCard key={group.topic_id} group={group} index={idx} />
          ))}
        </div>
      )}
    </div>
  )
}

function StatTile({ label, value, icon: Icon, small = false }) {
  return (
    <div className="relative card-hero p-4 md:p-5 flex items-center gap-3 overflow-hidden">
      <div className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-secondary font-label">{label}</p>
        <p
          className={cn(
            'font-display font-bold tabular-nums truncate',
            small ? 'text-base' : 'text-2xl',
            typeof value === 'string' && value.includes('%')
              ? 'text-gradient-tertiary'
              : 'text-primary'
          )}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

function TopicGroupCard({ group, index }) {
  const latest = group.attempts[group.attempts.length - 1]
  const first = group.attempts[0]
  const best = group.attempts.reduce(
    (max, a) => Math.max(max, a.percentage ?? 0),
    0
  )
  const trend = getTrend(first?.percentage, latest?.percentage)
  const TrendIcon = trend?.icon
  const latestPill = getScorePill(latest?.percentage)
  const num = String(index + 1).padStart(2, '0')

  return (
    <article className="relative card-hero overflow-hidden">
      <header className="relative z-10 p-5 border-b border-border-subtle flex flex-wrap items-start gap-3 justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-7 h-7 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center font-display font-bold text-xs tabular-nums">
              {num}
            </span>
            <h2 className="font-display font-semibold text-lg text-primary leading-tight">
              {group.topic_title}
            </h2>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-secondary font-label">
            <span className="inline-flex items-center gap-1">
              <HelpCircle size={12} />
              {group.attempts.length} percobaan
            </span>
            {best > 0 && (
              <span className="inline-flex items-center gap-1">
                <Trophy size={12} />
                Terbaik: {best}%
              </span>
            )}
            {trend && TrendIcon && (
              <span
                className={cn(
                  'inline-flex items-center gap-1',
                  trend.color
                )}
              >
                <TrendIcon size={12} />
                {trend.label}
              </span>
            )}
            {latest && (
              <span className="inline-flex items-center gap-1">
                <Clock size={12} />
                {formatDate(latest.created_at)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge variant={latestPill.variant}>{latestPill.label}</StatusBadge>
          <Link
            to={`/progress/topic/${encodeURIComponent(group.topic_id)}`}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-tertiary text-white text-sm font-label font-semibold hover:bg-tertiary-dark transition-colors"
          >
            Lihat detail
            <ChevronRight size={14} />
          </Link>
        </div>
      </header>

      <ul className="relative z-10 divide-y divide-border-subtle">
        {[...group.attempts].reverse().map((a) => (
          <AttemptRow key={a.id} attempt={a} />
        ))}
      </ul>
    </article>
  )
}

function AttemptRow({ attempt }) {
  const pill = getScorePill(attempt.percentage)
  const correctCount = attempt.correct_answers ?? 0
  const totalCount = attempt.total_questions ?? 0
  const time = formatTimeSpent(attempt.time_spent_seconds)

  return (
    <li className="flex items-center gap-4 p-4 hover:bg-tertiary/[0.03] transition-colors group">
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
          pill.variant === 'success' || pill.variant === 'info'
            ? 'bg-tertiary/10 text-tertiary group-hover:bg-tertiary/15'
            : pill.variant === 'danger'
              ? 'bg-danger-light text-danger-fg'
              : 'bg-surface-1 text-secondary border border-border-subtle'
        )}
      >
        <Trophy size={18} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-primary">
            Skor {attempt.percentage ?? 0}%
          </p>
          <StatusBadge variant={pill.variant}>{pill.label}</StatusBadge>
        </div>
        <p className="text-xs text-secondary font-label flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1">
            {correctCount}/{totalCount} benar
          </span>
          {time && (
            <span className="inline-flex items-center gap-1">
              <Clock size={11} /> {time}
            </span>
          )}
          {attempt.attempt_number && (
            <span>Percobaan #{attempt.attempt_number}</span>
          )}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-xs text-secondary font-label">
          {formatDate(attempt.created_at)}
        </p>
      </div>
    </li>
  )
}
