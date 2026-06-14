import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Play, Lock, Clock } from 'lucide-react';
import { TopicNode } from './TopicNode';
import { cn } from '@/lib/utils';

/**
 * WeekCard (Phase polish — Curriculum page redesign)
 *
 * Visual hierarchy: the active week is the visual "hero" — bigger, with
 * a prominent accent border + glow. Completed weeks feel done (subtle
 * "completed" treatment), and locked weeks fade back. This creates a
 * clear narrative: "you're here, you've done these, these are coming".
 *
 * Three states:
 *  - hasActiveTopic (hero)    — ring + gradient + bigger header
 *  - allCompleted             — subtle "done" treatment
 *  - allLocked                — opacity reduced, subtle pattern
 */
function WeekCard({ week, topics, weekIndex, isActive, isHero }) {
  const shouldReduceMotion = useReducedMotion();
  const completedCount = topics.filter((t) => t.status === 'completed').length;
  const totalCount = topics.length;
  const progressPct = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;
  const allCompleted = totalCount > 0 && completedCount === totalCount;
  const allLocked = topics.length > 0 && topics.every((t) => t.status === 'locked');

  const weekLabel = `Minggu ${week.week_number ?? week.week ?? weekIndex + 1}`;
  const weekTitle = week.title ?? weekLabel;

  // State-based ring color
  const ringColor = isHero
    ? 'ring-tertiary/30 border-tertiary/30 shadow-warm-lg bg-gradient-to-br from-tertiary/5 to-transparent'
    : allCompleted
    ? 'border-success/20 bg-success/[0.02]'
    : allLocked
    ? 'border-border bg-bg-secondary/30 opacity-75'
    : 'border-border bg-surface';

  return (
    <motion.article
      variants={
        shouldReduceMotion
          ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
          : {
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0 },
            }
      }
      id={`week-${week.week_number ?? weekIndex}`}
      aria-label={`${weekLabel}: ${weekTitle}, ${completedCount} dari ${totalCount} topik selesai`}
      className={cn(
        'relative card-base p-5 ring-1 transition-all duration-300',
        ringColor,
        isHero && 'lg:scale-[1.02]'
      )}
    >
      {/* Locked pattern overlay */}
      {allLocked && (
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-[14px] opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, rgb(var(--text-primary)) 0, rgb(var(--text-primary)) 1px, transparent 1px, transparent 12px)',
          }}
        />
      )}

      {/* Header: label + title + status badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'font-label text-xs uppercase tracking-wider font-semibold',
                isHero ? 'text-tertiary' : 'text-secondary'
              )}
            >
              {weekLabel}
            </span>
            {isHero && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-tertiary text-white text-[9px] font-label font-bold uppercase tracking-wider">
                <Play size={8} fill="currentColor" />
                Aktif
              </span>
            )}
            {allCompleted && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-success text-white text-[9px] font-label font-bold uppercase tracking-wider">
                <Check size={8} />
                Selesai
              </span>
            )}
          </div>
          <h3
            className={cn(
              'font-display font-bold leading-snug mt-1',
              isHero ? 'text-2xl text-primary' : 'text-lg text-primary',
              allLocked && 'text-secondary'
            )}
          >
            {weekTitle}
          </h3>
        </div>
        {/* Per-week ring mini badge */}
        <MiniRing percent={progressPct} state={isHero ? 'active' : allCompleted ? 'done' : allLocked ? 'locked' : 'default'} />
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-bg-tertiary mb-4 overflow-hidden">
        <motion.div
          className={cn(
            'h-full rounded-full',
            allCompleted ? 'bg-success' : 'bg-tertiary'
          )}
          initial={shouldReduceMotion ? { width: `${progressPct}%` } : { width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: 0.1 + weekIndex * 0.05 }}
        />
      </div>

      {/* Topics list */}
      <div className="space-y-1">
        {topics.map((topic) => (
          <TopicNode key={topic.id} topic={topic} />
        ))}
      </div>

      {/* Empty state */}
      {topics.length === 0 && (
        <div className="py-6 text-center text-xs text-secondary italic">
          Topik untuk minggu ini belum tersedia
        </div>
      )}

      {/* Footer meta */}
      {totalCount > 0 && (
        <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-secondary">
          <span className="font-label tabular-nums">
            {completedCount}/{totalCount} selesai
          </span>
          {totalCount > 0 && topics[0]?.duration_minutes && (
            <span className="inline-flex items-center gap-1">
              <Clock size={11} aria-hidden="true" />
              <span className="tabular-nums">
                {topics.reduce((sum, t) => sum + (t.duration_minutes || 0), 0)} min
              </span>
            </span>
          )}
        </div>
      )}
    </motion.article>
  );
}

/**
 * Tiny circular progress indicator (top-right of each week card).
 * Uses a single ring that fills based on percent.
 */
function MiniRing({ percent, state }) {
  const size = 36;
  const stroke = 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(1, percent / 100)));

  const colorClass =
    state === 'done' ? 'stroke-success' : state === 'locked' ? 'stroke-border' : 'stroke-tertiary';

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgb(var(--border))"
          strokeWidth={stroke}
          opacity={0.3}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          className={colorClass}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 600ms ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-label font-bold text-primary tabular-nums">
        {percent}%
      </div>
    </div>
  );
}

export default WeekCard;
