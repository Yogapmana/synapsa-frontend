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
} from 'lucide-react';
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'

/**
 * QuizHistoryByTopic — per-topic attempt history at /progress/topic/:topicId.
 *
 * Shows every attempt the user has made on a single topic, with:
 *   - Attempt # (1, 2, 3, ...) and the date
 *   - Score with pill (Sangat Baik / Baik / Cukup / Perlu Review)
 *   - Time spent on that attempt
 *   - Trend (improving / declining / flat) vs. the first attempt
 *   - A "Review" button that opens a modal with the question-by-
 *     question breakdown (which Qs were right/wrong)
 *   - A "Coba Lagi" button (re-takes the quiz for this topic)
 *
 * Plus a sparkline-style "score progression" header so the user
 * can see at a glance if they're getting better.
 */

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

  // Holds the full attempt object the user is currently reviewing
  // (including its DB id, so ReviewModal can lazy-fetch the full
  // detail with `answers_detail`).
  // Fix: previously this was a numeric index (`reviewAttemptIdx`) and
  // ReviewModal read `answers_detail` straight from the list payload,
  // but the by-topic list endpoint intentionally omits `answers_detail`
  // (keeps the list payload small). The result was that *every* attempt
  // rendered as an empty state, even ones with valid answer data. The
  // single-attempt endpoint `GET /quiz/attempt/{id}` returns the full
  // detail — we now call it on demand when the modal opens.
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
      // completeTopic may 409 if topic not completed. The user just
      // wants to retake the quiz — fall back to navigating.
    }
    window.location.href = `/quiz/${encodeURIComponent(decodedTopicId)}`
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        to="/progress"
        className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-primary font-label transition-colors"
      >
        <ArrowLeft size={14} />
        Kembali ke Riwayat Kuis
      </Link>

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
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-tertiary text-white text-sm font-label font-semibold hover:bg-tertiary-dark transition-colors shadow-warm-sm"
          >
            <RotateCcw size={14} />
            Coba Lagi
          </button>
        }
      />

      {isLoading ? (
        <Skeleton className="h-64 w-full rounded-2xl skeleton-shimmer" />
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
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
              icon={Calendar}
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

          {/* Attempt list — chronological, oldest first so the
              "improvement over time" story reads top → bottom. */}
          <div className="card-base overflow-hidden">
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
                  // Pass the whole attempt (with its DB id) so the
                  // ReviewModal can lazy-fetch the full detail
                  // containing `answers_detail`.
                  onReview={() =>
                    setReviewAttempt({ attempt: a, number: idx + 1 })
                  }
                />
              ))}
            </ol>
          </div>
        </>
      )}

      {/* Review modal — shows the answers_detail for a single attempt. */}
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
 * SummaryTile — single stat card for the per-topic header.
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
    <div className="card-base p-4 md:p-5 flex items-center gap-3">
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
        <p className="font-display font-bold text-xl text-primary tabular-nums">
          {value}
        </p>
      </div>
    </div>
  )
}

/**
 * ScoreProgression — inline sparkline that visualises the user's
 * score over time. Built from divs (no extra dep). Shows the score
 * trend at a glance.
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
    <div className="card-base p-5">
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
        {/* Grid line at 60% (the "Cukup" threshold) */}
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
  )
}

/**
 * AttemptRow — single attempt in the per-topic list.
 */
function AttemptRow({ attempt, index, total, onReview }) {
  const pill = getScorePill(attempt.percentage)
  const time = formatTimeSpent(attempt.time_spent_seconds)
  const isLatest = index === total - 1

  return (
    <li
      className={cn(
        'flex items-center gap-4 p-4 transition-colors',
        isLatest && 'bg-tertiary/[0.04]'
      )}
    >
      <div
        className={cn(
          'w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold tabular-nums',
          isLatest
            ? 'bg-tertiary text-white'
            : 'bg-surface-1 text-secondary border border-border-subtle'
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
        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-label font-semibold text-secondary hover:text-primary hover:bg-surface-1 border border-border-subtle transition-colors shrink-0"
      >
        Review
        <ChevronRight size={14} />
      </button>
    </li>
  )
}

/**
 * ReviewModal — question-by-question breakdown for a single attempt.
 *
 * The by-topic list endpoint intentionally omits `answers_detail` to
 * keep the list payload small, so we lazy-fetch the full detail on
 * mount via `useQuizAttemptDetail(attempt.id)`. While the detail is
 * loading we render a skeleton; once loaded, we show each question's
 * index, the user's selected answer, and the correct answer with a
 * green/red check. React Query dedupes by attempt id, so re-opening
 * the same review is a cache hit (no extra network roundtrip).
 */
function ReviewModal({ attempt, attemptNumber, topicTitle, onClose }) {
  // Lazy-fetch the full attempt (has answers_detail). `enabled` is
  // implicit in the hook (it only fires when attemptId is truthy).
  const {
    data: detail,
    isLoading: detailLoading,
    error: detailError,
  } = useQuizAttemptDetail(attempt?.id)

  // Merge: prefer the detail payload but fall back to the list-row
  // data so the header (topic title, date, score count) can render
  // immediately without waiting for the detail roundtrip. This keeps
  // the modal from looking "blank" during the ~100ms load.
  const fullAttempt = detail || attempt
  const answers = fullAttempt.answers_detail || []
  // Use the authoritative totals from the detail row (which always
  // match what's in the DB). While loading, the list-row values
  // (`attempt.total_questions` / `attempt.correct_answers`) are
  // accurate too, so the header never shows "0/0".
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
            <h2 className="font-display font-semibold text-lg text-primary truncate">
              Review — Percobaan #{attemptNumber}
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
                  'rounded-xl border p-4',
                  a.is_correct
                    ? 'border-success/30 bg-success-light/40'
                    : 'border-danger/30 bg-danger-light/40'
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

/**
 * ReviewDetailSkeleton — placeholder shown while the single-attempt
 * detail is fetching. Mirrors the real card layout so the modal
 * doesn't jump in size once data lands.
 */
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

/**
 * ReviewErrorState — shown when the detail fetch fails (network blip
 * or 5xx). Gives the user a clear "what now" path: either retry via
 * the API or jump back to the quiz retake flow.
 */
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

/**
 * EmptyReviewState — shown when the attempt has no `answers_detail`
 * (typically because the backend graded the quiz against 0 questions,
 * e.g. the LLM failed to parse the MCQ JSON and `tutor_generate_quiz`
 * returned `[]`, or the cache expired and the fallback `questions_data`
 * was also empty).
 *
 * Instead of a dead-end "details not available" message, we explain
 * WHY + offer a "Coba Lagi" link so the user can re-take the quiz
 * and get a properly recorded attempt.
 */
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
