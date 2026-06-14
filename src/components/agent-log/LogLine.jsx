import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Info, AlertTriangle, AlertCircle, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import AgentBadge from './AgentBadge'

const LEVEL_CONFIG = {
  INFO: { icon: Info, color: 'text-info' },
  WARNING: { icon: AlertTriangle, color: 'text-warning' },
  ERROR: { icon: AlertCircle, color: 'text-danger' },
}

function formatTimestamp(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export default function LogLine({ log }) {
  const [expanded, setExpanded] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const level = log.level?.toUpperCase() ?? 'INFO'
  const config = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.INFO
  const LevelIcon = config.icon
  const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
      className={cn(
        'group rounded-lg px-3 py-2 transition-colors cursor-pointer',
        hasMetadata ? 'hover:bg-bg-secondary' : 'hover:bg-bg-secondary'
      )}
      onClick={() => hasMetadata && setExpanded((v) => !v)}
    >
      <div className="flex items-center gap-3">
        <span className="font-mono text-xs text-secondary tabular-nums shrink-0">
          {formatTimestamp(log.timestamp)}
        </span>
        <AgentBadge agent={log.agent} />
        <span className="min-w-0 flex-1 text-sm text-primary truncate">
          {log.message}
        </span>
        <LevelIcon size={14} className={cn('shrink-0', config.color)} />
        {hasMetadata && (
          <ChevronDown
            size={14}
            className={cn(
              'shrink-0 text-secondary transition-transform duration-200',
              expanded && 'rotate-180'
            )}
          />
        )}
      </div>

      <AnimatePresence initial={false}>
        {expanded && hasMetadata && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.15 }}
            className="overflow-hidden"
          >
            <pre className="mt-2 rounded-lg bg-bg-secondary p-3 font-mono text-xs text-secondary overflow-x-auto">
              {JSON.stringify(log.metadata, null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

