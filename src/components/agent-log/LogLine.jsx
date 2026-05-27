import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import AgentBadge from './AgentBadge'

const LEVEL_DOT = {
  INFO: null,
  WARNING: 'bg-amber-400',
  ERROR: 'bg-red-500',
}

const logLineVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
}

function formatTimestamp(ts) {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export default function LogLine({ log }) {
  const [expanded, setExpanded] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const level = log.level?.toUpperCase() ?? 'INFO'
  const dotClass = LEVEL_DOT[level] ?? null

  return (
    <motion.div
      variants={shouldReduceMotion ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } } : logLineVariants}
      initial="initial"
      animate="animate"
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
      className="group flex flex-col gap-1 rounded-md px-3 py-2 text-sm hover:bg-muted/50 cursor-pointer"
      onClick={() => log.metadata && setExpanded((v) => !v)}
    >
      <div className="flex items-center gap-2">
        {dotClass && (
          <span className={`inline-block size-2 shrink-0 rounded-full ${dotClass}`} />
        )}
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {formatTimestamp(log.timestamp)}
        </span>
        <AgentBadge agent={log.agent} />
        <span className="min-w-0 flex-1 truncate">{log.message}</span>
      </div>

      {log.metadata && (
        <motion.pre
          initial={false}
          animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.15 }}
          className="overflow-hidden rounded bg-muted px-3 py-2 font-mono text-xs text-muted-foreground"
        >
          {JSON.stringify(log.metadata, null, 2)}
        </motion.pre>
      )}
    </motion.div>
  )
}