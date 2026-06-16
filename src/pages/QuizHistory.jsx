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
  XCircle,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Inbox,
  History as HistoryIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

/**
 * QuizHistory — full quiz history page at /progress.
 *
 * Groups every quiz attempt by topic and shows:
 *   - Topic title
 *   - Best score / latest score / attempt count
 *   - Trend (improving / declining / flat vs. the user's first attempt)
 *   - Last attempt timestamp
 *   - → click into the per-topic history to see all attempts
 *
 * Matches the same aesthetic as the rest of the app:
 *   - card-based layout, warm-ivory palette
 *   - score pill colors map to design system: success / info / warning / danger
 *   - the "Lihat detail" link routes to the per-topic page
 *     (/progress/topic/:topicId) where the user can review each attempt.
 */

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
  // attempts come in newest-first from the backend. We group by
  // topic_id, then reverse each group so the per-topic list is
  // oldest-first (matches the per-topic page).
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
    group.attempts.reverse() // oldest → newest
  }
  return Array.from(map.values())
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
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Riwayat Kuis"
        subtitle="Semua kuis yang pernah Anda kerjakan, dikelompokkan per topik."
        icon={HistoryIcon}
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Riwayat Kuis' },
        ]}
      />

      {/* Stat strip — totals, average, best, last activity */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatTile label="Total Kuis" value={stats.total} icon={HelpCircle} />
        <StatTile label="Rata-rata" value={`${stats.avg}%`} icon={Trophy} />
        <StatTile label="Skor Terbaik" value={`${stats.best}%`} icon={CheckCircle2} />
        <StatTile
          label="Terakhir"
          value={stats.lastDate ? formatDate(stats.lastDate) : '—'}
          icon={Clock}
          small
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl skeleton-shimmer" />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Belum ada riwayat kuis"
          description="Mulai kerjakan kuis pada topik manapun untuk melihat riwayatnya di sini."
        />
      ) : (
        <div className="space-y-4">
          {groups.map((group) => (
            <TopicGroupCard key={group.topic_id} group={group} />
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * StatTile — single metric card for the summary strip.
 */
function StatTile({ label, value, icon: Icon, small = false }) {
  return (
    <div className="card-base p-4 md:p-5 flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-secondary font-label">{label}</p>
        <p
          className={cn(
            'font-display font-bold text-primary tabular-nums truncate',
            small ? 'text-base' : 'text-2xl'
          )}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

/**
 * TopicGroupCard — one card per topic, showing aggregate stats and
 * the list of attempts (newest first, but with the most recent at
 * the top of the card for the "latest" highlight).
 */
function TopicGroupCard({ group }) {
  const latest = group.attempts[group.attempts.length - 1]
  const first = group.attempts[0]
  const best = group.attempts.reduce(
    (max, a) => Math.max(max, a.percentage ?? 0),
    0
  )
  const trend = getTrend(first?.percentage, latest?.percentage)
  const TrendIcon = trend?.icon
  const latestPill = getScorePill(latest?.percentage)

  return (
    <article className="card-base overflow-hidden">
      {/* Header — topic title + summary chips */}
      <header className="p-5 border-b border-border-subtle flex flex-wrap items-start gap-3 justify-between">
        <div className="min-w-0 flex-1">
          <h2 className="font-display font-semibold text-lg text-primary leading-tight">
            {group.topic_title}
          </h2>
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

      {/* Attempts list — newest at top */}
      <ul className="divide-y divide-border-subtle">
        {[...group.attempts].reverse().map((a) => (
          <AttemptRow key={a.id} attempt={a} />
        ))}
      </ul>
    </article>
  )
}

/**
 * AttemptRow — one row per attempt inside a TopicGroupCard.
 */
function AttemptRow({ attempt }) {
  const pill = getScorePill(attempt.percentage)
  const isCorrect = (a) => (a.is_correct ? '✓' : '✗')
  const correctCount = attempt.correct_answers ?? 0
  const totalCount = attempt.total_questions ?? 0
  const time = formatTimeSpent(attempt.time_spent_seconds)

  return (
    <li className="flex items-center gap-4 p-4 hover:bg-surface-1/40 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
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
