import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { Lightbulb } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

/**
 * ConceptNode — a single concept extracted from a week's topics.
 *
 * Terracotta-tinted pill. Shows the concept label + topic count badge. On
 * hover, a Radix tooltip surfaces the description (if any). Click opens
 * the side panel with the full topic/resource list (handled in
 * ``MindMapView``).
 */
export function ConceptNode({ data, selected }) {
  const description = data?.description
  const topicCount = data?.topicCount ?? 0
  const label = data?.label ?? 'Konsep'

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'group relative w-[180px] h-[72px] rounded-2xl',
              'bg-tertiary/10 text-tertiary',
              'ring-1 ring-tertiary/30 hover:ring-tertiary/70',
              'px-3 py-2 cursor-pointer',
              'flex items-center gap-2',
              'transition-all duration-200',
              'hover:shadow-warm-md hover:-translate-y-0.5',
              selected && 'shadow-warm-md ring-tertiary -translate-y-0.5',
            )}
          >
            <Handle
              type="target"
              position={Position.Left}
              className="!bg-transparent !border-0"
              isConnectable={false}
            />
            <Handle
              type="source"
              position={Position.Right}
              className="!bg-transparent !border-0"
              isConnectable={false}
            />

            <div
              aria-hidden="true"
              className="w-8 h-8 rounded-lg bg-tertiary/15 text-tertiary flex items-center justify-center shrink-0"
            >
              <Lightbulb size={14} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display font-semibold text-sm leading-tight line-clamp-2">
                {label}
              </p>
              <p className="text-[10px] font-label tabular-nums text-tertiary/80 mt-0.5">
                {topicCount} topik
              </p>
            </div>
          </div>
        </TooltipTrigger>
        {description ? (
          <TooltipContent side="top" className="max-w-xs">
            <p className="text-xs leading-relaxed">{description}</p>
          </TooltipContent>
        ) : null}
      </Tooltip>
    </TooltipProvider>
  )
}
