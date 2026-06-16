import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * ClusterNode — dashed-border container that groups all concept / topic /
 * resource nodes belonging to a single week in the concept-graph view.
 *
 * Acts as a React Flow "parent" node: its children are rendered with
 * ``extent: 'parent'`` and stay visually inside its bounds. Children are
 * positioned by ELK.js with ``hierarchyHandling: 'INCLUDE_CHILDREN'`` so
 * the cluster auto-sizes around them.
 *
 * Visually subdued — the focus should be on concepts/topics, not the
 * cluster chrome. The week label and topic count are the only info.
 */
export function ClusterNode({ data, selected }) {
  return (
    <div
      className={cn(
        'relative w-[260px] h-[60px] rounded-2xl',
        'border-2 border-dashed border-border-subtle',
        'bg-surface-0/40 backdrop-blur-[1px]',
        'flex items-center gap-2 px-3.5',
        'transition-all duration-200',
        selected && 'border-tertiary/40 bg-tertiary/[0.03]',
      )}
    >
      <div
        aria-hidden="true"
        className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0"
      >
        <Layers size={14} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-label uppercase tracking-widest text-subtle-readable">
          Minggu {data.weekNumber}
        </p>
        <p className="font-display font-semibold text-sm text-primary leading-tight line-clamp-1">
          {data.title}
        </p>
      </div>
      <span className="text-[10px] font-label tabular-nums text-secondary shrink-0">
        {data.topicsCount}
      </span>
    </div>
  )
}
