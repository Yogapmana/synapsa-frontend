import { useEffect, useRef, useMemo } from 'react'
import { useLearningStore } from '@/stores/learningStore'
import { useAgentLog } from '@/hooks/useAgentLog'
import LogLine from '@/components/agent-log/LogLine'
import LogFilter from '@/components/agent-log/LogFilter'
import EmptyState from '@/components/common/EmptyState'
import { Cpu } from 'lucide-react'

export default function AgentLog() {
  const activeSession = useLearningStore((s) => s.activeSession)
  const sessionId = activeSession?.id ?? null
  const { isConnected, logs, filter } = useAgentLog(sessionId)
  const bottomRef = useRef(null)

  const filteredLogs = useMemo(() => {
    if (filter.length === 0) return logs
    return logs.filter((log) => filter.includes(log.agent))
  }, [logs, filter])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [filteredLogs.length])

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center gap-3">
        <span
          className={`inline-block size-3 shrink-0 rounded-full ${
            isConnected ? 'bg-tertiary' : 'bg-secondary'
          }`}
        />
        <h1 className="text-xl font-bold">
          {isConnected ? 'Semua agent aktif' : 'Tidak ada sesi aktif'}
        </h1>
      </div>

      <LogFilter />

      <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border bg-background">
        {filteredLogs.length === 0 ? (
          <div className="flex h-full items-center justify-center p-8">
            <EmptyState
              icon={Cpu}
              title="Tidak ada aktivitas agent"
              description="Mulai sesi belajar untuk melihat log."
            />
          </div>
        ) : (
          <div className="divide-y">
            {filteredLogs.map((log, i) => (
              <LogLine key={log.timestamp + i} log={log} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  )
}