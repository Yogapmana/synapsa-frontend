import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { Check, Lock, Play, Clock, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * WeekNode — a single week card in the mind map.
 *
 * Two visual sizes:
 * - 'compact' (default, used in radial overview) — ~200x110
 * - 'large'   (used in week-detail view as the root) — ~280x140
 *
 * Status color from design system (no random hues):
 * - isCompleted → success green ring + check icon
 * - isActive    → terracotta ring + play icon + subtle glow
 * - default     → neutral border + lock icon (faded)
 *
 * Click handler is wired in MindMapView via React Flow's onNodeClick.
 */
export function WeekNode({ data, selected }) {
  const isCompleted = data.isCompleted
  const isActive = data.isActive && !isCompleted
  const isDetail = data.isDetail

  // Theme: status-based ring + icon
  const theme = isCompleted
    ? {
        ring: 'ring-2 ring-success/50 hover:ring-success',
        icon: Check,
        iconBg: 'bg-success-light text-success-fg',
        label: 'Selesai',
        labelClass: 'bg-success-light text-success-fg',
      }
    : isActive
      ? {
          ring: 'ring-2 ring-tertiary/60 hover:ring-tertiary',
          icon: Play,
          iconBg: 'bg-tertiary/15 text-tertiary',
          label: 'Aktif',
          labelClass: 'bg-tertiary/15 text-tertiary',
        }
      : {
          ring: 'ring-1 ring-border-subtle hover:ring-secondary/40',
          icon: Lock,
          iconBg: 'bg-surface-1 text-subtle-readable',
          label: 'Terkunci',
          labelClass: 'bg-surface-1 text-secondary',
        }

  const StatusIcon = theme.icon
  const totalHours = (data.totalDurationMinutes / 60).toFixed(1)
  const pct =
    data.topicsCount > 0
      ? Math.round((data.completedCount / data.topicsCount) * 100)
      : 0

  return (
    <div
      className={cn(
        'group relative rounded-2xl bg-surface-0 cursor-pointer',
        'transition-all duration-200 hover:shadow-warm-md hover:-translate-y-0.5',
        theme.ring,
        isDetail ? 'w-[280px] p-4' : 'w-[210px] p-3.5',
        selected && 'shadow-warm-lg -translate-y-0.5',
        isActive && !isDetail && 'shadow-[0_0_0_3px_rgb(var(--tertiary)/0.15)]',
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-transparent !border-0"
        isConnectable={false}
      />
      {!isDetail && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!bg-transparent !border-0"
          isConnectable={false}
        />
      )}

      {/* Header row: week number + status badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div
          className={cn(
            'inline-flex items-center justify-center rounded-xl font-display font-bold tabular-nums',
            isDetail ? 'w-12 h-12 text-2xl' : 'w-9 h-9 text-base',
            theme.iconBg,
          )}
        >
          {data.weekNumber}
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
            'text-[10px] font-label font-medium uppercase tracking-wider',
            theme.labelClass,
          )}
        >
          <StatusIcon size={9} aria-hidden="true" />
          {theme.label}
        </span>
      </div>

      {/* Title */}
      <h3
        className={cn(
          'font-display font-semibold text-primary leading-snug line-clamp-2',
          isDetail ? 'text-base mb-2' : 'text-sm mb-1.5 min-h-[2.5em]',
        )}
      >
        {data.title}
      </h3>

      {/* Stats row */}
      <div
        className={cn(
          'flex items-center gap-3 text-[11px] text-secondary font-label',
          isDetail ? 'mt-2' : 'mt-1',
        )}
      >
        <span className="inline-flex items-center gap-0.5 tabular-nums">
          <Layers size={10} />
          {data.completedCount}/{data.topicsCount}
        </span>
        <span className="inline-flex items-center gap-0.5 tabular-nums">
          <Clock size={10} />
          {totalHours} jam
        </span>
        <span className="ml-auto tabular-nums font-semibold text-primary">
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 w-full rounded-full bg-surface-1 mt-2 overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            isCompleted
              ? 'bg-success'
              : isActive
                ? 'bg-tertiary'
                : 'bg-border-default',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
