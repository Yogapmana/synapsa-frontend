import React, { useRef, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Lock, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * JourneyMap (Phase polish — Curriculum page redesign)
 *
 * Horizontal "path" visualization showing all weeks of the curriculum
 * as nodes on a journey. Completed weeks are filled circles with a
 * checkmark, the active week is a larger pulsing star, and locked
 * weeks are dimmed circles with a padlock. A connecting "road" line
 * runs through them.
 *
 * The whole thing is horizontally scrollable on narrow viewports.
 * The active node auto-scrolls into view on mount.
 *
 * Props:
 *  - weeks: array of { week_number, title, status: 'completed'|'active'|'locked' }
 *  - onSelectWeek(week): callback when a node is clicked
 */
function JourneyMap({ weeks = [], onSelectWeek }) {
  const shouldReduceMotion = useReducedMotion();
  const scrollRef = useRef(null);
  const activeRef = useRef(null);

  // Auto-scroll active node into view on mount / when active changes
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const node = activeRef.current;
      const container = scrollRef.current;
      const nodeLeft = node.offsetLeft;
      const nodeWidth = node.offsetWidth;
      const containerWidth = container.clientWidth;
      // Center the active node
      container.scrollTo({
        left: nodeLeft - containerWidth / 2 + nodeWidth / 2,
        behavior: 'smooth',
      });
    }
  }, [weeks]);

  if (!weeks.length) return null;

  const completedCount = weeks.filter((w) => w.status === 'completed').length;
  const activeIndex = weeks.findIndex((w) => w.status === 'active');
  const activeWeekNumber = activeIndex >= 0 ? weeks[activeIndex].week_number : -1;
  const totalCount = weeks.length;
  const progressPct = totalCount === 0 ? 0 : (completedCount / totalCount) * 100;

  return (
    <div
      className="card-base p-5 md:p-6"
      role="region"
      aria-label="Peta perjalanan kurikulum"
    >
      <div className="flex items-baseline justify-between gap-3 mb-4">
        <h2 className="font-label text-xs uppercase tracking-widest text-secondary font-semibold">
          Peta Perjalanan
        </h2>
        <span className="text-xs text-secondary font-mono tabular-nums">
          {completedCount}/{totalCount} minggu
        </span>
      </div>

      {/* Horizontal scrollable track */}
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-hidden -mx-2 px-2 pb-2 scrollbar-hide"
      >
        <div className="relative inline-flex items-center min-w-full py-3">
          {/* Connecting road line */}
          <div
            aria-hidden="true"
            className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-border/60 rounded-full"
          />
          {/* Filled progress overlay (from start to active node) */}
          <div
            aria-hidden="true"
            className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-tertiary rounded-full transition-all duration-700"
            style={{
              width: `calc(${progressPct}% - 0px)`,
              maxWidth: 'calc(100% - 3rem)',
            }}
          />

          {/* Week nodes */}
          <ol className="relative flex items-center gap-0 z-10">
            {weeks.map((week) => (
              <JourneyNode
                key={week.week_number}
                week={week}
                isActive={week.week_number === activeWeekNumber}
                nodeRef={week.week_number === activeWeekNumber ? activeRef : null}
                onSelect={onSelectWeek}
                shouldReduceMotion={shouldReduceMotion}
              />
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

/**
 * Single week node on the journey map.
 * - Completed: filled terracotta circle with white check
 * - Active: larger pulsing circle with star icon, glow
 * - Locked: outlined gray circle with padlock
 */
function JourneyNode({ week, isActive, nodeRef, onSelect, shouldReduceMotion }) {
  const isCompleted = week.status === 'completed';
  const isLocked = week.status === 'locked';

  // Node size: active is bigger, others standard
  const sizeClass = isActive ? 'size-14' : 'size-11';
  const iconSize = isActive ? 22 : 16;

  const Icon = isCompleted ? Check : isActive ? Play : Lock;

  const node = (
    <button
      ref={nodeRef}
      type="button"
      onClick={() => onSelect?.(week)}
      aria-label={`${week.title}. Status: ${week.status}`}
      aria-current={isActive ? 'step' : undefined}
      className={cn(
        'group flex flex-col items-center gap-2 px-3 transition-transform duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary rounded-full',
        !shouldReduceMotion && isActive && 'hover:scale-110',
        !isActive && 'hover:scale-105 cursor-pointer'
      )}
    >
      <span
        className={cn(
          'flex items-center justify-center rounded-full transition-all duration-300',
          sizeClass,
          isCompleted && 'bg-tertiary text-white shadow-warm-sm',
          isActive && 'bg-tertiary text-white shadow-warm-lg ring-4 ring-tertiary/25',
          isLocked && 'bg-surface text-secondary border-2 border-border',
        )}
      >
        <Icon size={iconSize} aria-hidden="true" />
      </span>
      <span
        className={cn(
          'text-[10px] font-label font-semibold tabular-nums',
          isActive ? 'text-tertiary' : isCompleted ? 'text-primary' : 'text-secondary/60'
        )}
      >
        {week.week_number}
      </span>
    </button>
  );

  // Pulse ring around active node
  if (isActive && !shouldReduceMotion) {
    return (
      <span className="relative">
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 m-auto size-14 rounded-full bg-tertiary/20"
          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
        {node}
      </span>
    );
  }

  return node;
}

export default JourneyMap;
