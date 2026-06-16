import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { cn } from '@/lib/utils'

/**
 * SubTopicNode — a tiny leaf node representing a specific learning point
 * extracted by the AI, attached to a Topic node.
 */
export function SubTopicNode({ data, selected }) {
  return (
    <div
      className={cn(
        'group relative w-[180px] rounded-xl bg-surface-1/50 border border-border-default px-3 py-2.5',
        'transition-all duration-200 hover:shadow-warm-sm hover:border-tertiary/40 hover:bg-surface-0',
        'cursor-pointer',
        selected && 'shadow-warm-md border-tertiary/60 bg-surface-0'
      )}
      title={data.description} // Browser tooltip for description
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-transparent !border-0"
        isConnectable={false}
      />

      <div className="flex items-start gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-tertiary/40 mt-1.5 shrink-0" />
        <h5 className="font-display font-medium text-xs text-primary leading-tight line-clamp-2">
          {data.label}
        </h5>
      </div>
      
      {data.description && (
        <p className="mt-1.5 text-[10px] text-secondary leading-snug line-clamp-2 pl-3.5">
          {data.description}
        </p>
      )}
    </div>
  )
}
