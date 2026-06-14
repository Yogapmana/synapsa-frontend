import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Zap, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getRagasSummary } from '@/api/chat'

/**
 * RAGASWidget — dashboard widget showing the average RAGAS quality
 * of all Tutor AI responses in the current session.
 *
 * Shows:
 *  - Average faithfulness & answer relevancy (with bar visualization)
 *  - p95 (worst-case) for both metrics
 *  - Count of flagged messages (any score < 50%)
 *  - Empty state when no messages scored yet
 *
 * The widget is self-contained — it only needs `summary` prop.
 * If `summary` is undefined or has 0 scored_messages, shows a
 * friendly "waiting for first response" state.
 */
function RAGASWidget({ sessionId, isLoading: isLoadingProp }) {
  // Fetch RAGAS summary for this session
  const [summary, setSummary] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    setIsLoading(true)
    getRagasSummary(sessionId)
      .then((data) => { if (!cancelled) { setSummary(data); setIsLoading(false) } })
      .catch((err) => { if (!cancelled) { setSummary(null); setIsLoading(false) } })
    return () => { cancelled = true }
  }, [sessionId])

  const finalIsLoading = isLoadingProp ?? isLoading
  if (finalIsLoading) {
    return (
      <div className="card-base p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center">
            <ShieldCheck size={18} aria-hidden="true" />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="h-3 w-32 bg-bg-tertiary rounded animate-pulse" />
            <div className="h-2.5 w-20 bg-bg-tertiary rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 bg-bg-secondary/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  const scored = summary?.scored_messages ?? 0
  const total = summary?.total_messages ?? 0
  const avgFaith = summary?.avg_faithfulness
  const avgRelev = summary?.avg_answer_relevancy
  const flagged = summary?.flagged_messages ?? 0

  // Empty / no data state
  if (scored === 0) {
    return (
      <div className="card-base p-5">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-9 h-9 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center">
            <ShieldCheck size={18} aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-primary">Kualitas RAG</h3>
            <p className="text-xs text-secondary">RAGAS — otomatis per pesan</p>
          </div>
        </div>
        <div className="rounded-xl border border-dashed border-border bg-bg-secondary/30 p-4 text-center">
          <p className="text-sm text-secondary">
            {total === 0
              ? 'Belum ada pesan ke Tutor AI.'
              : 'Menunggu penilaian RAGAS…'}
          </p>
          <p className="text-xs text-secondary/60 mt-1">
            Skor akan muncul otomatis setiap kali Tutor AI menjawab.
          </p>
        </div>
      </div>
    )
  }

  const faithPct = avgFaith != null ? Math.round(avgFaith * 100) : null
  const relevPct = avgRelev != null ? Math.round(avgRelev * 100) : null
  const overallTone =
    (faithPct ?? 0) >= 70 && (relevPct ?? 0) >= 70
      ? 'success'
      : (faithPct ?? 100) < 50 || (relevPct ?? 100) < 50
      ? 'warning'
      : 'neutral'

  return (
    <div className="card-base p-5 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-tertiary/[0.05] blur-2xl"
      />
      <div className="relative">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center">
            <ShieldCheck size={18} aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-primary">Kualitas RAG</h3>
            <p className="text-xs text-secondary">
              {scored} dari {total} pesan dinilai · RAGAS otomatis
            </p>
          </div>
          {flagged > 0 && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-warning-light text-warning-fg text-[10px] font-label font-semibold border border-warning/20"
              title={`${flagged} pesan memiliki skor di bawah 50%`}
            >
              <AlertTriangle size={10} />
              {flagged} perlu dicek
            </span>
          )}
        </div>

        <div className="space-y-3">
          <RAGBar
            label="Faithfulness"
            value={faithPct}
            tone={overallTone}
            tooltip="Seberapa konsisten jawaban Tutor dengan konteks yang di-retrieve"
          />
          <RAGBar
            label="Answer Relevancy"
            value={relevPct}
            tone={overallTone}
            tooltip="Seberapa relevan jawaban Tutor dengan pertanyaan user"
          />
        </div>

        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-secondary font-label">
          <span className="inline-flex items-center gap-1">
            <Zap size={11} className="text-tertiary" />
            <span>Rata-rata sesi ini</span>
          </span>
          <span className="tabular-nums">
            p95 {summary?.p95_faithfulness != null ? Math.round(summary.p95_faithfulness * 100) : '—'}/
            {summary?.p95_answer_relevancy != null ? Math.round(summary.p95_answer_relevancy * 100) : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

function RAGBar({ label, value, tone, tooltip }) {
  if (value == null) {
    return (
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-secondary font-label">{label}</span>
          <span className="text-xs text-secondary/50 font-mono">—</span>
        </div>
        <div className="h-2 rounded-full bg-bg-tertiary" />
      </div>
    )
  }
  const fillColor =
    tone === 'success' ? 'bg-success' : tone === 'warning' ? 'bg-warning' : 'bg-tertiary'
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-primary font-label font-medium" title={tooltip}>
          {label}
        </span>
        <span className="text-xs text-primary font-mono font-semibold tabular-nums">
          {value}%
        </span>
      </div>
      <div className="h-2 rounded-full bg-bg-tertiary overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', fillColor)}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </div>
  )
}

export default RAGASWidget;
