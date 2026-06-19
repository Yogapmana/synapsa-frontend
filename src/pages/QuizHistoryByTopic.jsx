import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useActiveSession } from '@/hooks/useLearning'
import { useQuizHistoryByTopic, useQuizAttemptDetail } from '@/hooks/useQuiz'
import { useCompleteTopic } from '@/hooks/useLearning'
import { Skeleton } from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import PageHeader from '@/components/common/PageHeader'
import StatusBadge from '@/components/common/StatusBadge'
import {
  ArrowLeft,
  Trophy,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronRight,
  RotateCcw,
  Calendar,
  Inbox,
  Sparkles,
  X,
  HelpCircle,
  BarChart3,
  Target,
  Zap,
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

function formatTimeSpent(seconds) {
  if (seconds == null || seconds <= 0) return null
  const minutes = Math.round(seconds / 60)
  if (minutes < 1) return '< 1 mnt'
  return `${minutes} mnt`
}

function formatDate(iso, withTime = true) {
  if (!iso) return '—'
  try {
    const pattern = withTime ? 'd MMM yyyy, HH:mm' : 'd MMM yyyy'
    return format(new Date(iso), pattern, { locale: idLocale })
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

export default function QuizHistoryByTopic() {
  const { topicId } = useParams()
  const { data: session } = useActiveSession()
  const sessionId = session?.id
  const decodedTopicId = topicId ? decodeURIComponent(topicId) : null
  const { data, isLoading } = useQuizHistoryByTopic(sessionId, decodedTopicId)
  const completeTopic = useCompleteTopic()

  const [reviewAttempt, setReviewAttempt] = useState(null)

  const attempts = data?.attempts || []
  const topicTitle = data?.topic_title || 'Topik'

  const summary = useMemo(() => {
    if (attempts.length === 0) {
      return { best: 0, latest: 0, first: 0, trend: null, totalTime: 0 }
    }
    const percentages = attempts.map((a) => a.percentage ?? 0)
    const first = percentages[0]
    const latest = percentages[percentages.length - 1]
    const best = Math.max(...percentages)
    const trend = (() => {
      if (latest > first + 5)
        return { icon: TrendingUp, color: 'text-success', label: 'Membaik' }
      if (latest < first - 5)
        return { icon: TrendingDown, color: 'text-danger', label: 'Menurun' }
      return { icon: Minus, color: 'text-secondary', label: 'Stabil' }
    })()
    const totalTime = attempts.reduce(
      (s, a) => s + (a.time_spent_seconds || 0),
      0
    )
    return { best, latest, first, trend, totalTime }
  }, [attempts])

  const handleRetry = async () => {
    if (!decodedTopicId) return
    try {
      await completeTopic.mutateAsync({
        sessionId,
        topicId: decodedTopicId,
      })
    } catch {
      // completeTopic may 409 if topic not completed
    }
    window.location.href = `/quiz/${encodeURIComponent(decodedTopicId)}`
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back link */}
      <Link
        to="/progress"
        className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-primary font-label transition-colors mb-6 group"
      >
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
        Kembali ke Riwayat Kuis
      </Link>

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
            title={topicTitle}
            subtitle={`Riwayat kuis per topik — ${attempts.length} percobaan.`}
            icon={Trophy}
            actions={
              attempts.length > 0 ? (
                <button
                  onClick={handleRetry}
                  className={cn(
                    'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-label font-semibold',
                    'bg-tertiary text-white hover:bg-tertiary-dark',
                    'transition-colors shadow-warm-sm hover:shadow-warm-md'
                  )}
                >
                  <RotateCcw size={14} />
                  Coba Lagi
                </button>
              ) : null
            }
          />
        </div>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl skeleton-shimmer" />
          ))}
        </div>
      ) : attempts.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Belum ada percobaan kuis"
          description="Klik 'Coba Lagi' untuk mengerjakan kuis topik ini."
          actionLabel="Mulai Kuis"
          onAction={handleRetry}
        />
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* ─── Stats Row ─── */}
          <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <SummaryCard
              icon={Trophy}
              label="Skor Terbaik"
              value={`${summary.best}%`}
              tone="success"
            />
            <SummaryCard
              icon={Zap}
              label="Skor Terbaru"
              value={`${summary.latest}%`}
              tone="info"
            />
            <SummaryCard
              icon={BarChart3}
              label="Total Percobaan"
              value={attempts.length}
              tone="tertiary"
            />
            <SummaryCard
              icon={summary.trend?.icon || Minus}
              label={summary.trend?.label || 'Stabil'}
              value={
                summary.trend?.color === 'text-success'
                  ? 'Naik'
                  : summary.trend?.color === 'text-danger'
                    ? 'Turun'
                    : '—'
              }
              tone={
                summary.trend?.color === 'text-success'
                  ? 'success'
                  : summary.trend?.color === 'text-danger'
                    ? 'danger'
                    : 'tertiary'
              }
            />
          </motion.div>

          {/* ─── Score Progression ─── */}
          {attempts.length >= 2 && (
            <motion.div variants={fadeUp}>
              <ScoreProgression attempts={attempts} />
            </motion.div>
          )}

          {/* ─── Attempt List ─── */}
          <motion.div variants={fadeUp} className="card-base overflow-hidden">
            <div className="p-5 flex items-center justify-between border-b border-border-subtle/60">
              <h2 className="font-display font-semibold text-primary">
                Riwayat Percobaan
              </h2>
              <span className="text-xs text-secondary font-label px-2.5 py-1 rounded-lg bg-surface-2/60">
                {attempts.length} entri
              </span>
            </div>
            <ol className="divide-y divide-border-subtle/60">
              {attempts.map((a, idx) => (
                <AttemptRow
                  key={a.id}
                  attempt={a}
                  index={idx}
                  total={attempts.length}
                  onReview={() =>
                    setReviewAttempt({ attempt: a, number: idx + 1 })
                  }
                />
              ))}
            </ol>
          </motion.div>
        </motion.div>
      )}

      {/* Review modal */}
      <AnimatePresence>
        {reviewAttempt && (
          <ReviewModal
            attempt={reviewAttempt.attempt}
            attemptNumber={reviewAttempt.number}
            topicTitle={topicTitle}
            onClose={() => setReviewAttempt(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Summary Card ─── */
function SummaryCard({ icon: Icon, label, value, tone = 'tertiary' }) {
  const toneClasses = {
    tertiary: 'bg-tertiary/8 text-tertiary',
    success: 'bg-success-light text-success-fg',
    info: 'bg-info-light text-info-fg',
    warning: 'bg-warning-light text-warning-fg',
    danger: 'bg-danger-light text-danger-fg',
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

/* ─── Score Progression ─── */
function ScoreProgression({ attempts }) {
  const percentages = attempts.map((a) => a.percentage ?? 0)
  const width = 600
  const height = 80
  const stepX = width / Math.max(percentages.length - 1, 1)
  const points = percentages.map((p, i) => {
    const x = i * stepX
    const y = height - (p / 100) * height
    return { x, y, p }
  })
  const pathD = points
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' ')

  // Create area fill path
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`

  return (
    <div className="card-base p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-primary text-base">
          Progres Skor
        </h3>
        <div className="flex items-center gap-2 text-xs text-secondary font-label">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-2/60">
            {percentages[0]}%
          </span>
          <ChevronRight size={12} className="text-secondary/50" />
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-tertiary/8 text-tertiary font-semibold">
            {percentages[percentages.length - 1]}%
          </span>
        </div>
      </div>
      <svg
        viewBox={`-10 -15 ${width + 20} ${height + 25}`}
        className="w-full h-24"
        preserveAspectRatio="none"
        aria-label="Score progression chart"
      >
        {/* Threshold line at 60% */}
        <line
          x1="0"
          x2={width}
          y1={height * 0.4}
          y2={height * 0.4}
          stroke="rgb(var(--border))"
          strokeDasharray="4 4"
          strokeWidth="0.8"
          opacity="0.5"
        />
        {/* Area fill */}
        <path
          d={areaD}
          fill="rgb(var(--tertiary))"
          opacity="0.06"
        />
        {/* Line */}
        <path
          d={pathD}
          fill="none"
          stroke="rgb(var(--tertiary))"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Points */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r="5"
              fill="rgb(var(--surface-0))"
              stroke="rgb(var(--tertiary))"
              strokeWidth="2.5"
            />
            <text
              x={pt.x}
              y={pt.y - 10}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="rgb(var(--text-secondary))"
            >
              {pt.p}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  )
}

/* ─── Attempt Row ─── */
function AttemptRow({ attempt, index, total, onReview }) {
  const pill = getScorePill(attempt.percentage)
  const time = formatTimeSpent(attempt.time_spent_seconds)
  const isLatest = index === total - 1
  const score = attempt.percentage ?? 0

  return (
    <li
      className={cn(
        'flex items-center gap-4 p-4 md:p-5 transition-colors group hover:bg-surface-2/30',
        isLatest && 'bg-tertiary/[0.02]'
      )}
    >
      {/* Attempt number badge */}
      <div
        className={cn(
          'w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 font-bold tabular-nums transition-all',
          isLatest
            ? 'bg-tertiary text-white shadow-warm-sm'
            : 'bg-surface-1 text-secondary border border-border-subtle group-hover:border-tertiary/20'
        )}
      >
        <span className="text-[9px] uppercase tracking-wider font-label opacity-70">
          Coba
        </span>
        <span className="text-base leading-none">
          {attempt.attempt_number || index + 1}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <p className="text-sm font-semibold text-primary">
            Skor {score}%
          </p>
          <StatusBadge variant={pill.variant}>{pill.label}</StatusBadge>
          {isLatest && (
            <span className="text-[10px] uppercase tracking-wider font-label font-semibold text-tertiary px-1.5 py-0.5 rounded-md bg-tertiary/8">
              Terbaru
            </span>
          )}
        </div>
        <p className="text-xs text-secondary font-label flex items-center gap-2.5 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 size={11} className="text-success" />
            {attempt.correct_answers}/{attempt.total_questions} benar
          </span>
          {time && (
            <span className="inline-flex items-center gap-1">
              <Clock size={11} /> {time}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Calendar size={11} /> {formatDate(attempt.created_at)}
          </span>
        </p>
      </div>

      {/* Mini score bar */}
      <div className="hidden sm:flex flex-col items-end gap-1.5 w-20 shrink-0">
        <span className="text-xs font-label font-semibold text-primary tabular-nums">{score}%</span>
        <div className="w-full h-1.5 rounded-full bg-surface-2 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              score >= 90 ? 'bg-success' :
              score >= 75 ? 'bg-info' :
              score >= 60 ? 'bg-warning' :
              'bg-danger'
            )}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Review button */}
      <button
        onClick={onReview}
        className={cn(
          'inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-label font-semibold shrink-0',
          'text-secondary hover:text-primary bg-surface-1 border border-border-subtle',
          'hover:bg-tertiary hover:text-white hover:border-tertiary',
          'transition-all duration-200'
        )}
      >
        Review
        <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      </button>
    </li>
  )
}

/* ─── Review Modal ─── */
function ReviewModal({ attempt, attemptNumber, topicTitle, onClose }) {
  const {
    data: detail,
    isLoading: detailLoading,
    error: detailError,
  } = useQuizAttemptDetail(attempt?.id)

  const fullAttempt = detail || attempt
  const answers = fullAttempt.answers_detail || []
  const totalQuestions =
    fullAttempt.total_questions ?? attempt.total_questions ?? answers.length
  const correctAnswers =
    fullAttempt.correct_answers ?? attempt.correct_answers ?? 0
  const score = fullAttempt.percentage ?? attempt.percentage ?? 0
  const pill = getScorePill(score)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="bg-surface-0 rounded-2xl shadow-warm-xl border border-border-subtle w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex items-start justify-between gap-3 p-5 border-b border-border-subtle/60">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-label uppercase tracking-wider text-tertiary font-semibold px-2 py-0.5 rounded-md bg-tertiary/8">
                Review Jawaban
              </span>
              <StatusBadge variant={pill.variant}>{pill.label}</StatusBadge>
            </div>
            <h2 className="font-display font-semibold text-lg text-primary leading-tight">
              Percobaan #{attemptNumber}
            </h2>
            <p className="text-xs text-secondary font-label mt-1 flex items-center gap-2 flex-wrap">
              <span>{topicTitle}</span>
              <span className="text-secondary/40">·</span>
              <span>{formatDate(fullAttempt.created_at, false)}</span>
              <span className="text-secondary/40">·</span>
              <span className="font-semibold">{correctAnswers}/{totalQuestions} benar</span>
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup review"
            className="p-2 rounded-xl text-secondary hover:text-primary hover:bg-surface-2/60 transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </header>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {detailLoading ? (
            <ReviewDetailSkeleton />
          ) : detailError ? (
            <ReviewErrorState
              error={detailError}
              topicId={fullAttempt?.topic_id}
            />
          ) : answers.length === 0 ? (
            <EmptyReviewState
              attempt={fullAttempt}
              topicId={fullAttempt?.topic_id}
            />
          ) : (
            answers.map((a) => (
              <div
                key={a.question_index}
                className={cn(
                  'rounded-xl border p-4 transition-colors',
                  a.is_correct
                    ? 'border-success/20 bg-success-light/50 hover:bg-success-light'
                    : 'border-danger/20 bg-danger-light/50 hover:bg-danger-light',
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  {a.is_correct ? (
                    <div className="w-6 h-6 rounded-lg bg-success/10 flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-success-fg" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-danger/10 flex items-center justify-center">
                      <XCircle size={14} className="text-danger-fg" />
                    </div>
                  )}
                  <span className="text-xs font-label font-semibold text-primary">
                    Pertanyaan {a.question_index + 1}
                  </span>
                  <span className={cn(
                    'ml-auto text-[10px] font-label font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md',
                    a.is_correct ? 'bg-success/10 text-success-fg' : 'bg-danger/10 text-danger-fg'
                  )}>
                    {a.is_correct ? 'Benar' : 'Salah'}
                  </span>
                </div>

                {a.question && (
                  <p className="text-sm text-primary mb-2 leading-relaxed font-medium">
                    {a.question}
                  </p>
                )}

                <div className="space-y-1 text-sm">
                  <p className="text-primary">
                    <span className="text-secondary text-xs font-label">Jawaban Anda: </span>
                    <span className={cn('font-semibold', a.is_correct ? 'text-success-fg' : 'text-danger-fg')}>
                      {a.selected || '— tidak dijawab —'}
                    </span>
                  </p>
                  {!a.is_correct && (
                    <p className="text-primary">
                      <span className="text-secondary text-xs font-label">Jawaban benar: </span>
                      <span className="font-semibold text-success-fg">
                        {a.correct}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

function ReviewDetailSkeleton() {
  return (
    <div
      className="space-y-3"
      role="status"
      aria-live="polite"
      aria-label="Memuat detail jawaban"
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-border-subtle p-4 space-y-2.5"
        >
          <div className="flex items-center gap-2">
            <Skeleton className="size-4 rounded-full skeleton-shimmer" />
            <Skeleton className="h-3 w-32 skeleton-shimmer" />
          </div>
          <Skeleton className="h-3 w-full skeleton-shimmer" />
          <Skeleton className="h-3 w-3/4 skeleton-shimmer" />
        </div>
      ))}
    </div>
  )
}

function ReviewErrorState({ error, topicId }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-danger-light text-danger-fg">
        <HelpCircle size={26} />
      </div>
      <h3 className="font-display font-semibold text-base text-primary mb-2">
        Gagal memuat detail
      </h3>
      <p className="text-sm text-secondary max-w-md leading-relaxed mb-5">
        Tidak dapat mengambil detail percobaan ini dari server.
        Coba tutup dan buka kembali modal Review.
      </p>
      {topicId && (
        <Link
          to={`/quiz/${encodeURIComponent(topicId)}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-tertiary text-white text-xs font-label font-semibold hover:bg-tertiary-dark transition-colors"
        >
          <RotateCcw size={12} />
          Coba Lagi untuk Rekam Ulang
        </Link>
      )}
    </div>
  )
}

function EmptyReviewState({ attempt, topicId }) {
  const total = attempt?.total_questions ?? 0
  const correct = attempt?.correct_answers ?? 0
  const isZeroQ = total === 0

  return (
    <div className="flex flex-col items-center justify-center text-center py-10 px-4">
      <div
        className={cn(
          'w-14 h-14 rounded-2xl flex items-center justify-center mb-4',
          isZeroQ ? 'bg-warning-light text-warning-fg' : 'bg-secondary/10 text-secondary'
        )}
      >
        <HelpCircle size={26} />
      </div>

      <h3 className="font-display font-semibold text-base text-primary mb-2">
        {isZeroQ
          ? 'Kuis ini tidak punya detail jawaban'
          : 'Detail jawaban tidak tersedia'}
      </h3>

      <p className="text-sm text-secondary max-w-md leading-relaxed mb-5">
        {isZeroQ ? (
          <>
            Percobaan ini terekam dengan{' '}
            <span className="font-semibold text-primary">
              0 pertanyaan
            </span>{' '}
            ({correct}/{total} benar). Kemungkinan sistem gagal membuat
            soal kuis saat percobaan ini (mis. cache kadaluwarsa atau
            generator LLM tidak mengembalikan format yang valid). Detail
            per-soal tidak bisa ditampilkan karena tidak ada soal yang
            dinilai.
          </>
        ) : (
          <>
            Detail per-soal untuk percobaan ini belum terekam.
            Skor keseluruhan ({correct}/{total}) tetap tersimpan.
          </>
        )}
      </p>

      <div className="flex flex-col items-center gap-2 text-xs text-text-subtle font-label">
        <span className="inline-flex items-center gap-1.5">
          <Calendar size={12} />
          {formatDate(attempt?.created_at, false)}
        </span>
        {topicId && (
          <Link
            to={`/quiz/${encodeURIComponent(topicId)}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-tertiary text-white font-semibold hover:bg-tertiary-dark transition-colors"
          >
            <RotateCcw size={12} />
            Coba Lagi untuk Rekam Ulang
          </Link>
        )}
      </div>
    </div>
  )
}
