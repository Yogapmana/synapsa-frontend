import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useLearningStore } from '@/stores/learningStore'
import { useAgentLog } from '@/hooks/useAgentLog'
import { useAgentLogStore } from '@/stores/agentLogStore'
import LogLine from '@/components/agent-log/LogLine'
import LogFilter from '@/components/agent-log/LogFilter'
import { FileSearch, Wifi, WifiOff } from 'lucide-react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import PageHeader from '@/components/common/PageHeader'

function groupLogsByDate(logs) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)

  const groups = {}
  const labels = {}

  logs.forEach((log) => {
    const d = new Date(log.timestamp)
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const key = dayStart.toISOString()

    if (!groups[key]) {
      groups[key] = []
      if (dayStart.getTime() === today.getTime()) {
        labels[key] = 'Hari ini'
      } else if (dayStart.getTime() === yesterday.getTime()) {
        labels[key] = 'Kemarin'
      } else {
        const diffDays = Math.floor((today.getTime() - dayStart.getTime()) / 86400000)
        labels[key] = `${diffDays} hari lalu`
      }
    }
    groups[key].push(log)
  })

  const sortedKeys = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a))
  return sortedKeys.map((key) => ({ key, label: labels[key], logs: groups[key] }))
}

export default function AgentLog() {
  const activeSession = useLearningStore((s) => s.activeSession)
  const sessionId = activeSession?.id ?? null
  const { isConnected, logs } = useAgentLog(sessionId)
  const filter = useAgentLogStore((s) => s.filter)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState([])
  const [dateFilter, setDateFilter] = useState('all')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const bottomRef = useRef(null)
  const shouldReduceMotion = useReducedMotion()

  const filteredLogs = useMemo(() => {
    let result = logs

    if (filter.length > 0) {
      result = result.filter((log) => filter.includes(log.agent))
    }

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (log) =>
          log.message?.toLowerCase().includes(q) ||
          log.agent?.toLowerCase().includes(q)
      )
    }

    if (levelFilter.length > 0) {
      result = result.filter((log) => levelFilter.includes(log.level?.toUpperCase()))
    }

    if (dateFilter !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      let cutoff
      if (dateFilter === 'today') {
        cutoff = today
      } else if (dateFilter === 'yesterday') {
        cutoff = new Date(today.getTime() - 86400000)
      } else if (dateFilter === 'week') {
        cutoff = new Date(today.getTime() - 7 * 86400000)
      }
      if (cutoff) {
        result = result.filter((log) => new Date(log.timestamp) >= cutoff)
      }
    }

    return result
  }, [logs, filter, search, levelFilter, dateFilter])

  const groupedLogs = useMemo(() => groupLogsByDate(filteredLogs), [filteredLogs])

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [filteredLogs.length])

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefresh((prev) => !prev)
  }, [])

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Agent Log"
        subtitle="Riwayat aktivitas agent PLA"
        actions={
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium font-label',
              isConnected
                ? 'bg-success-light text-success-fg'
                : 'bg-danger-light text-danger-fg'
            )}
          >
            {isConnected ? <Wifi size={12} /> : <WifiOff size={12} />}
            {isConnected ? 'Terhubung' : 'Terputus'}
          </span>
        }
      />

      <div className="sticky top-0 z-10 -mx-4 px-4 py-3 bg-bg-secondary/95 backdrop-blur-sm border-b border-border">
        <LogFilter
          onSearchChange={setSearch}
          onLevelFilterChange={setLevelFilter}
          onDateFilterChange={setDateFilter}
          autoRefresh={autoRefresh}
          onToggleAutoRefresh={toggleAutoRefresh}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="card-base p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center mb-4">
              <FileSearch size={28} />
            </div>
            <h3 className="font-display font-semibold text-xl text-primary">
              Belum ada log aktivitas
            </h3>
            <p className="text-secondary mt-2 max-w-sm mx-auto">
              Log akan muncul saat agent mulai bekerja. Mulai sesi belajar untuk melihat aktivitas.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {groupedLogs.map((group) => (
                <motion.div
                  key={group.key}
                  initial={shouldReduceMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                >
                  <div className="sticky top-0 z-5 bg-bg-secondary/90 backdrop-blur-sm py-2 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-label text-xs uppercase tracking-wider text-secondary">
                        {group.label}
                      </span>
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-xs text-secondary tabular-nums">
                        {group.logs.length} log
                      </span>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    {group.logs.map((log, i) => (
                      <LogLine key={log.timestamp + i} log={log} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  )
}