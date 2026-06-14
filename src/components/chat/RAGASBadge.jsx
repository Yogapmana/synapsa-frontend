import { motion } from 'framer-motion'
import { ShieldCheck, Zap, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * RAGASBadge — informational badge showing the two RAGAS metrics for a
 * single chat message.
 *
 * **Not clickable** — this is an info indicator, not a button. The hover
 * shows a detailed tooltip with thresholds, but there's no popover/modal
 * (to avoid scope creep and over-promising UX). The badge communicates
 * "this is what RAGAS said about this response" at a glance.
 *
 * Format: `RAGAS · 20/90` (faithfulness / answer_relevancy as %)
 *   - Both ≥ 70%  → success (green)
 *   - Either < 50% → warning (amber) — likely hallucination or off-topic
 *   - Otherwise    → neutral (gray)
 *
 * Props:
 *  - faithfulness, answer_relevancy: 0-1 scores from backend
 *  - status: 'scoring' (still being evaluated) | 'scored' (have scores) | 'failed' (none)
 */
function RAGASBadge({ faithfulness, answer_relevancy, status = 'scored' }) {
  if (status === 'scoring') {
    return (
      <div
        className="inline-flex items-center gap-1 text-[10px] text-secondary/60 font-label"
        title="RAGAS sedang menilai jawaban ini (latar belakang)"
        aria-label="Sedang menilai kualitas RAG"
      >
        <Loader2 size={9} className="animate-spin" />
        <span>RAGAS menilai…</span>
      </div>
    )
  }

  if (status === 'failed' || (faithfulness == null && answer_relevancy == null)) {
    return null
  }

  const faithPct = Math.round((faithfulness ?? 0) * 100)
  const relevPct = Math.round((answer_relevancy ?? 0) * 100)
  const tone =
    faithPct >= 70 && relevPct >= 70
      ? 'success'
      : faithPct < 50 || relevPct < 50
      ? 'warning'
      : 'neutral'

  // Detailed tooltip explains the two metrics
  const tooltip = [
    'RAGAS — kualitas jawaban Tutor AI',
    '',
    `Faithfulness: ${faithPct}% (klaim sesuai konteks)`,
    `Answer Relevancy: ${relevPct}% (sesuai pertanyaan)`,
    '',
    tone === 'success'
      ? '✓ Kualitas baik'
      : tone === 'warning'
      ? '⚠ Perlu dicek — kemungkinan halusinasi atau melenceng'
      : '○ Kualitas cukup',
  ].join('\n')

  return (
    <span
      title={tooltip}
      aria-label={`Kualitas RAG: faithfulness ${faithPct}%, answer relevancy ${relevPct}%. ${tone === 'warning' ? 'Skor rendah, kemungkinan halusinasi.' : ''}`}
      className={cn(
        'inline-flex items-center gap-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-label font-semibold tabular-nums border',
        tone === 'success' && 'border-success/20 bg-success-light/50 text-success-fg',
        tone === 'warning' && 'border-warning/30 bg-warning-light/50 text-warning-fg',
        tone === 'neutral' && 'border-border bg-bg-secondary text-secondary'
      )}
    >
      {tone === 'warning' ? (
        <AlertTriangle size={9} aria-hidden="true" />
      ) : (
        <ShieldCheck size={9} aria-hidden="true" />
      )}
      <span>RAGAS</span>
      <span className="text-secondary/50">·</span>
      <span>{faithPct}/{relevPct}</span>
    </span>
  )
}

export default RAGASBadge;
