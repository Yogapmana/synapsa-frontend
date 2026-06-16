import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { Video, Globe, BookOpen, FileText, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * ResourceNode — compact card for an external resource (video / paper /
 * course / source URL) attached to a topic.
 *
 * Click handler opens the resource URL in a new tab (wired in MindMapView).
 * The icon varies by ``link_type`` so users can scan the graph quickly.
 */
const ICON_BY_LINK_TYPE = {
  video: Video,
  paper: BookOpen,
  course: Globe,
  source: FileText,
}

export function ResourceNode({ data, selected }) {
  const linkType = data?.linkType || 'source'
  const title = data?.title || 'Sumber'
  const url = data?.url
  const Icon = ICON_BY_LINK_TYPE[linkType] || FileText

  return (
    <div
      className={cn(
        'group relative w-[150px] h-[44px] rounded-xl',
        'bg-surface-1 text-primary ring-1 ring-border-subtle',
        'hover:ring-info/60 hover:shadow-warm-sm',
        'px-2.5 py-1.5 cursor-pointer',
        'flex items-center gap-2',
        'transition-all duration-200',
        selected && 'ring-info shadow-warm-sm',
      )}
      title={url ? `Buka: ${url}` : title}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-transparent !border-0"
        isConnectable={false}
      />

      <div
        aria-hidden="true"
        className="w-6 h-6 rounded-md bg-info/10 text-info flex items-center justify-center shrink-0"
      >
        <Icon size={12} />
      </div>
      <p className="text-[11px] font-label font-medium leading-tight line-clamp-1 flex-1 min-w-0">
        {title}
      </p>
      <ExternalLink
        size={10}
        className="text-subtle-readable group-hover:text-info shrink-0"
      />
    </div>
  )
}
