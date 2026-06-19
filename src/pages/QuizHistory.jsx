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
  Target,
  Sparkles,
  Flame,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { motion } from 'framer-motion'

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

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

export default function QuizHistory() {
  const { data: session } = useActiveSession()
  const sessionId = session?.id
  const { data: attempts = [], isLoading } = useQuizHistory(sessionId)

  const groups = useMemo(() => groupByTopic(attempts), [attempts])

  const stats = useMemo(() => {
    if (attempts.length === 0) {
      return { total: 0, avg: 0, best: 0, lastDate: null, topicCount: 0 }
    }
    const percentages = attempts.map((a) => a.percentage ?? 0)
    const total = attempts.length
    const avg = Math.round(percentages.reduce((s, p) => s + p, 0) / total)
    const best = Math.max(...percentages)
    const lastDate = attempts[0]?.created_at || null
    const topicCount = new Set(attempts.map((a) => a.topic_id)).size
    return { total, avg, best, lastDate, topicCount }
  }, [attempts])

  return (
    <div className="max-w-5xl mx-auto">
      {/* ─── Hero Section ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
        className="relative rounded-3xl p-6 md:p-8 mb-8 overflow-hidden bg-gradient-to-br from-surface-1 via-surface-0 to-surface-1 border border-border-subtle"
      >
        {/* Decorative blobs */}
        <div aria-hidden="true" className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-tertiary/[0.04] blur-3xl pointer-events-none" />
        <div aria-hidden="true" className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-warning/[0.05] blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <PageHeader
            title="Riwayat Kuis"
            subtitle="Semua kuis yang pernah Anda kerjakan, dikelompokkan per topik."
            icon={HistoryIcon}
          />
        </div>

        {!isLoading && stats.total > 0 && (
          <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            <StatCard
              icon={HelpCircle}
              label="Total Kuis"
              value={stats.total}
              tone="tertiary"
            />
            <StatCard
              icon={BarChart3}
              label="Rata-rata"
              value={`${stats.avg}%`}
              tone="info"
            />
            <StatCard
              icon={Trophy}
              label="Skor Terbaik"
              value={`${stats.best}%`}
              tone="success"
            />
            <StatCard
              icon={Target}
              label="Topik Dikerjakan"
              value={stats.topicCount}
              tone="warning"
            />
          </div>
        )}
      </motion.div>

      {/* ─── Topic List ─── */}
      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Belum ada riwayat kuis"
          description="Mulai kerjakan kuis pada topik manapun untuk melihat riwayatnya di sini."
        />
      ) : (
        <motion.div
          className="space-y-4"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {groups.map((group, idx) => (
            <motion.div key={group.topic_id} variants={fadeUp}>
              <TopicGroupCard group={group} index={idx} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}

/* ─── Stat Card ─── */
function StatCard({ icon: Icon, label, value, tone = 'tertiary' }) {
  const toneClasses = {
    tertiary: 'bg-tertiary/8 text-tertiary',
    success: 'bg-success-light text-success-fg',
    info: 'bg-info-light text-info-fg',
    warning: 'bg-warning-light text-warning-fg',
  }

  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-surface-0/60 backdrop-blur-sm border border-border-subtle/60 hover:border-border-subtle transition-colors">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', toneClasses[tone])}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-secondary font-label uppercase tracking-wider">{label}</p>
        <p className="font-display font-bold text-xl text-primary tabular-nums leading-tight mt-0.5">
          {value}
        </p>
      </div>
    </div>
  )
}

/* ─── Topic Group Card ─── */
function TopicGroupCard({ group, index }) {
  const latest = group.attempts[group.attempts.length - 1]
  const first = group.attempts[0]
  const best = group.attempts.reduce(
    (max, a) => Math.max(max, a.percentage ?? 0),
    0
  )
  const trend = getTrend(first?.percentage, latest?.percentage)
  const TrendIcon = trend?.icon
  const latestPill = getScorePill(best)
  const num = String(index + 1).padStart(2, '0')
  const latestDate = latest?.created_at

  return (
    <article className="group relative card-base overflow-hidden hover:shadow-warm-sm transition-all duration-300">
      <div className="flex items-center gap-4 p-5">
        {/* Number badge */}
        <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-tertiary/10 to-tertiary/5 flex items-center justify-center shrink-0 border border-tertiary/10">
          <span className="font-display font-bold text-lg text-tertiary tabular-nums">{num}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-semibold text-base text-primary leading-tight truncate">
            {group.topic_title}
          </h2>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary font-label">
            <span className="inline-flex items-center gap-1">
              <Sparkles size={11} className="text-tertiary" />
              {group.attempts.length} percobaan
            </span>
            <span className="inline-flex items-center gap-1">
              <Trophy size={11} />
              Terbaik: {best}%
            </span>
            {trend && TrendIcon && (
              <span className={cn('inline-flex items-center gap-1', trend.color)}>
                <TrendIcon size={11} />
                {trend.label}
              </span>
            )}
            {latestDate && (
              <span className="inline-flex items-center gap-1 text-secondary/70">
                <Clock size={11} />
                {formatDate(latestDate)}
              </span>
            )}
          </div>
        </div>

        {/* Right side — badge + link */}
        <div className="flex items-center gap-2.5 shrink-0">
          <StatusBadge variant={latestPill.variant}>{latestPill.label}</StatusBadge>
          <Link
            to={`/progress/topic/${encodeURIComponent(group.topic_id)}`}
            className={cn(
              'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-label font-semibold',
              'bg-surface-1 text-primary border border-border-subtle',
              'hover:bg-tertiary hover:text-white hover:border-tertiary',
              'transition-all duration-200 shadow-warm-xs group-hover:shadow-warm-sm'
            )}
          >
            Lihat detail
            <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      {/* Score bar visualization */}
      <div className="px-5 pb-4">
        <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              best >= 90 ? 'bg-success' :
              best >= 75 ? 'bg-info' :
              best >= 60 ? 'bg-warning' :
              'bg-danger'
            )}
            style={{ width: `${best}%` }}
          />
        </div>
      </div>
    </article>
  )
}
