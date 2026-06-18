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
import DecoNumerals from '@/components/common/DecoNumerals'
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
      <Link
        to="/progress"
        className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-primary font-label transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Kembali ke Riwayat Kuis
      </Link>

      <div className="relative rounded-3xl p-6 md:p-8 mb-6 gradient-mesh-warm overflow-hidden">
        <DecoNumerals number="03" position="top-right" />
        <DecoNumerals number="03" position="bottom-left" tone="secondary" />

        <div className="relative z-10">
          <div className="eyebrow mb-4">Detail — Per Topik</div>

          <PageHeader
            title={topicTitle}
            subtitle={`Riwayat kuis per topik — ${attempts.length} percobaan.`}
            icon={Trophy}
            breadcrumbs={[
              { label: 'Dashboard', to: '/dashboard' },
              { label: 'Riwayat Kuis', to: '/progress' },
              { label: topicTitle },
            ]}
            action={
              attempts.length > 0 ? (
                <button
                  onClick={handleRetry}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-tertiary text-white text-sm font-label font-semibold hover:bg-tertiary-dark transition-colors shadow-warm-sm"
                >
                  <RotateCcw size={14} />
                  Coba Lagi
                </button>
              ) : null
            }
          />
        </div>
      </div>

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
        <>
          {/* Summary strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <SummaryTile
              label="Skor Terbaik"
              value={`${summary.best}%`}
              icon={Trophy}
              tone="success"
            />
            <SummaryTile
              label="Skor Terbaru"
              value={`${summary.latest}%`}
              icon={Sparkles}
              tone="info"
            />
            <SummaryTile
              label="Total Percobaan"
              value={attempts.length}
              icon={BarChart3}
              tone="neutral"
            />
            <SummaryTile
              label={summary.trend?.label || 'Stabil'}
              value={summary.trend?.icon ? <summary.trend.icon size={20} /> : '—'}
              icon={summary.trend?.icon}
              tone={
                summary.trend?.color === 'text-success'
                  ? 'success'
                  : summary.trend?.color === 'text-danger'
                    ? 'danger'
                    : 'neutral'
              }
            />
          </div>

          {/* Score progression sparkline */}
          <ScoreProgression attempts={attempts} />

          {/* Attempt list */}
          <div className="card-hero overflow-hidden">
            <div className="p-5 border-b border-border-subtle flex items-center justify-between">
              <h2 className="font-display font-semibold text-primary">
                Riwayat Percobaan
              </h2>
              <span className="text-xs text-secondary font-label">
                {attempts.length} entri
              </span>
            </div>
            <ol className="divide-y divide-border-subtle">
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
          </div>
        </>
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

/**
 * SummaryTile — editorial-styled stat card.
 */
function SummaryTile({ label, value, icon: Icon, tone = 'neutral' }) {
  const toneClass = {
    success: 'bg-success-light text-success-fg',
    info: 'bg-info-light text-info-fg',
    danger: 'bg-danger-light text-danger-fg',
    warning: 'bg-warning-light text-warning-fg',
    neutral: 'bg-tertiary/10 text-tertiary',
  }[tone]
  return (
    <div className="relative card-hero p-4 md:p-5 flex items-center gap-3 overflow-hidden">
      <DecoNumerals number="03" position="top-right" className="!opacity-[0.03] scale-75" />
      <div
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          toneClass
        )}
      >
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-secondary font-label">{label}</p>
        <p
          className={cn(
            'font-display font-bold text-xl tabular-nums',
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

/**
 * ScoreProgression — inline sparkline with editorial card.
 */
function ScoreProgression({ attempts }) {
  if (attempts.length < 2) return null
  const percentages = attempts.map((a) => a.percentage ?? 0)
  const max = 100
  const min = 0
  const width = 600
  const height = 80
  const stepX = width / Math.max(percentages.length - 1, 1)
  const points = percentages.map((p, i) => {
    const x = i * stepX
    const y = height - ((p - min) / (max - min)) * height
    return { x, y, p }
  })
  const pathD = points
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
    .join(' ')

  return (
    <div className="relative card-hero p-5 mb-6 overflow-hidden">
      <DecoNumerals number="03" position="top-right" className="!opacity-[0.03] scale-75" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-primary text-base">
            Progression Skor
          </h3>
          <span className="text-xs text-secondary font-label">
            {percentages[0]}% → {percentages[percentages.length - 1]}%
          </span>
        </div>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-20"
          preserveAspectRatio="none"
          aria-label="Score progression chart"
        >
          <line
            x1="0"
            x2={width}
            y1={height - ((60 - min) / (max - min)) * height}
            y2={height - ((60 - min) / (max - min)) * height}
            stroke="rgb(var(--border))"
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <path
            d={pathD}
            fill="none"
            stroke="rgb(var(--tertiary))"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((pt, i) => (
            <g key={i}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4"
                fill="rgb(var(--tertiary))"
                stroke="rgb(var(--bg-primary))"
                strokeWidth="2"
              />
              <text
                x={pt.x}
                y={pt.y - 8}
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
    </div>
  )
}

/**
 * AttemptRow — single attempt with editorial styling.
 */
function AttemptRow({ attempt, index, total, onReview }) {
  const pill = getScorePill(attempt.percentage)
  const time = formatTimeSpent(attempt.time_spent_seconds)
  const isLatest = index === total - 1

  return (
    <li
      className={cn(
        'flex items-center gap-4 p-4 transition-colors group',
        isLatest && 'bg-tertiary/[0.03]'
      )}
    >
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold tabular-nums transition-colors',
          isLatest
            ? 'bg-tertiary text-white'
            : 'bg-surface-1 text-secondary border border-border-subtle group-hover:border-tertiary/30'
        )}
      >
        <span className="text-[10px] uppercase tracking-wider font-label opacity-80">
          Coba
        </span>
        <span className="text-base leading-none">
          {attempt.attempt_number || index + 1}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <p className="text-sm font-semibold text-primary">
            Skor {attempt.percentage ?? 0}%
          </p>
          <StatusBadge variant={pill.variant}>{pill.label}</StatusBadge>
          {isLatest && (
            <span className="text-[10px] uppercase tracking-wider font-label font-semibold text-tertiary">
              Terbaru
            </span>
          )}
        </div>
        <p className="text-xs text-secondary font-label flex items-center gap-2 flex-wrap">
          <span>
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

      <button
        onClick={onReview}
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-label font-semibold text-secondary hover:text-primary hover:bg-surface-1 border border-border-subtle hover:border-tertiary/30 transition-colors shrink-0"
      >
        Review
        <ChevronRight size={14} />
      </button>
    </li>
  )
}

/**
 * ReviewModal — question-by-question breakdown with editorial card style.
 */
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
        className="bg-surface-1 rounded-2xl shadow-warm-xl border border-border-subtle w-full max-w-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between gap-3 p-5 border-b border-border-subtle">
          <div className="min-w-0">
            <div className="eyebrow !text-[10px] mb-1">Review Jawaban</div>
            <h2 className="font-display font-semibold text-lg text-primary truncate">
              Percobaan #{attemptNumber}
            </h2>
            <p className="text-xs text-secondary font-label truncate">
              {topicTitle} • {formatDate(fullAttempt.created_at, false)} •{' '}
              {correctAnswers}/{totalQuestions} benar
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup review"
            className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-surface-2/60 transition-colors"
          >
            <X size={18} />
          </button>
        </header>

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
                  'rounded-xl border border-l-4 p-4',
                  a.is_correct
                    ? 'border-success/20 border-l-success bg-success-light'
                    : 'border-danger/20 border-l-danger bg-danger-light',
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {a.is_correct ? (
                    <CheckCircle2
                      size={16}
                      className="text-success-fg shrink-0"
                    />
                  ) : (
                    <XCircle size={16} className="text-danger-fg shrink-0" />
                  )}
                  <span className="text-xs font-label font-semibold text-primary">
                    Pertanyaan {a.question_index + 1}
                  </span>
                </div>
                <p className="text-sm text-primary">
                  <span className="text-secondary">Jawaban Anda: </span>
                  <span className="font-semibold">
                    {a.selected || '— tidak dijawab —'}
                  </span>
                </p>
                {!a.is_correct && (
                  <p className="text-sm text-primary mt-0.5">
                    <span className="text-secondary">Jawaban benar: </span>
                    <span className="font-semibold text-success-fg">
                      {a.correct}
                    </span>
                  </p>
                )}
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
