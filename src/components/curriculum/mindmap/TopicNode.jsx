import React from 'react'
import { useTranslation } from 'react-i18next';
import { Handle, Position } from '@xyflow/react'
import { Check, Lock, Play, Circle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * TopicNode — a single topic card in the week-detail mind map view.
 *
 * Status theme (matches WeekNode):
 * - completed → success green
 * - active    → terracotta + glow
 * - locked    → neutral (no glow)
 * - review    → info blue
 * - pending   → warning amber (newly-added topics from a replan that
 *               haven't been activated yet)
 *
 * Click navigates to /module/{id} (handled in MindMapView).
 */
const getTheme = (status, t) => {
  const STATUS_THEMES = {
    completed: {
      ring: 'ring-1 ring-success/40 hover:ring-success/70',
      icon: Check,
      iconBg: 'bg-success-light text-success-fg',
      badge: 'bg-success-light text-success-fg',
      label: t('curriculum.completed', 'Selesai'),
      edge: 'bg-success',
    },
    active: {
      ring: 'ring-2 ring-tertiary/50 hover:ring-tertiary shadow-[0_0_0_3px_rgb(var(--tertiary)/0.12)]',
      icon: Play,
      iconBg: 'bg-tertiary text-white',
      badge: 'bg-tertiary text-white',
      label: t('curriculum.start', 'Mulai'),
      edge: 'bg-tertiary',
    },
    locked: {
      ring: 'ring-1 ring-border-subtle hover:ring-secondary/40 opacity-80',
      icon: Lock,
      iconBg: 'bg-surface-1 text-subtle-readable',
      badge: 'bg-surface-1 text-secondary',
      label: t('curriculum.locked', 'Terkunci'),
      edge: 'bg-border-default',
    },
    review: {
      ring: 'ring-1 ring-info/40 hover:ring-info/70',
      icon: Circle,
      iconBg: 'bg-info-light text-info-fg',
      badge: 'bg-info-light text-info-fg',
      label: t('curriculum.review', 'Review'),
      edge: 'bg-info',
    },
    pending: {
      ring: 'ring-1 ring-warning/40 hover:ring-warning/70',
      icon: Clock,
      iconBg: 'bg-warning-light text-warning-fg',
      badge: 'bg-warning-light text-warning-fg',
      label: t('curriculum.pending', 'Tertunda'),
      edge: 'bg-warning',
    },
  }
  return STATUS_THEMES[status] || STATUS_THEMES.locked
}

export function TopicNode({ data, selected }) {
  const { t } = useTranslation();
  const status = data?.status || 'locked'
  // Defensive: any unrecognized status (e.g. a future enum value) falls
  // back to the locked theme instead of throwing.
  const theme = getTheme(status, t)

  const StatusIcon = theme.icon

  return (
    <div
      className={cn(
        'group relative w-[220px] rounded-2xl bg-surface-0 p-3.5',
        'transition-all duration-200 hover:shadow-warm-md hover:-translate-y-0.5',
        (status === 'locked' || status === 'pending') ? 'cursor-not-allowed' : 'cursor-pointer',
        theme.ring,
        selected && 'shadow-warm-lg -translate-y-0.5',
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-transparent !border-0"
        isConnectable={false}
      />

      {/* Top row: status icon + week.day badge */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
            theme.iconBg,
          )}
        >
          <StatusIcon size={14} aria-hidden="true" />
        </div>
        <span className="text-[10px] font-label uppercase tracking-wider text-secondary tabular-nums">
          Topik {data.weekNumber}.{data.dayNumber}
        </span>
      </div>

      {/* Title */}
      <h4 className="font-display font-semibold text-sm text-primary leading-snug line-clamp-2 mb-2 min-h-[2.5em]">
        {data.title}
      </h4>

      {/* Footer: status badge + duration */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-full',
            'text-[10px] font-label font-medium uppercase tracking-wider',
            theme.badge,
          )}
        >
          {theme.label}
        </span>
        <span className="inline-flex items-center gap-0.5 text-[11px] text-secondary font-label tabular-nums">
          <Clock size={10} />
          {data.durationMinutes}m
        </span>
      </div>
    </div>
  )
}
