import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { cn } from '@/lib/utils'

/**
 * RootNode — the central "course" node of the mind map.
 *
 * Visual: a large circular terracotta node with Fraunces serif typography.
 * Renders 4 source handles (top/right/bottom/left) so children can connect
 * from any direction. Background has a subtle radial gradient + glow.
 */
export function RootNode({ data, selected }) {
  const pct =
    data.totalTopics > 0
      ? Math.round((data.completedTopics / data.totalTopics) * 100)
      : 0

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center',
        'w-44 h-44 rounded-full',
        'bg-gradient-to-br from-tertiary via-tertiary to-tertiary-dark',
        'text-white shadow-warm-lg',
        'ring-4 ring-tertiary/20',
        'transition-all duration-200',
        selected && 'ring-tertiary scale-105',
      )}
    >
      {/* Decorative glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-tertiary opacity-30 blur-xl -z-10"
      />

      {/* 4 source handles for radial connection */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        className="!bg-transparent !border-0"
        isConnectable={false}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!bg-transparent !border-0"
        isConnectable={false}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="!bg-transparent !border-0"
        isConnectable={false}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        className="!bg-transparent !border-0"
        isConnectable={false}
      />

      <p className="text-[10px] font-label uppercase tracking-widest opacity-80 mb-1">
        Kursus
      </p>
      <h2 className="font-display font-bold text-lg leading-tight text-center px-3 line-clamp-2">
        {data.courseTitle}
      </h2>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] font-label tabular-nums opacity-90">
        <span>{data.totalWeeks} minggu</span>
        <span>•</span>
        <span>{pct}%</span>
      </div>
    </div>
  )
}
