import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'
import { useLearningStore } from '@/stores/learningStore'
import { getSession } from '@/api/learning'
import { AGENT_LABELS, AGENT_COLORS } from '@/utils/constants'

const PIPELINE_STAGES = [
  { key: 'starting', label: 'Menunggu agent...', agent: null },
  { key: 'planner', label: 'Planner sedang merancang kurikulum...', agent: 'planner' },
  { key: 'researcher', label: 'Researcher mencari materi...', agent: 'researcher' },
  { key: 'composer', label: 'Composer menyusun modul...', agent: 'composer' },
  { key: 'done', label: 'Selesai!', agent: null },
]

const MAX_POLL_TIME = 600000 // 10 minutes

export default function AgentLoadingScreen({ sessionId }) {
  const [logs, setLogs] = useState([])
  const [currentStage, setCurrentStage] = useState(0)
  const [wsConnected, setWsConnected] = useState(false)
  const [error, setError] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const setActiveSession = useLearningStore((s) => s.setActiveSession)
  const wsRef = useRef(null)
  const pollRef = useRef(null)
  const timerRef = useRef(null)
  const logsEndRef = useRef(null)

  const addLog = useCallback((message, agent = null) => {
    setLogs((prev) => [...prev, { id: Date.now() + Math.random(), message, agent, timestamp: new Date() }])
  }, [])

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => {
        if (prev + 1000 >= MAX_POLL_TIME) {
          setError('Kurikulum gagal dibuat. Silakan coba lagi.')
          if (pollRef.current) clearInterval(pollRef.current)
          if (timerRef.current) clearInterval(timerRef.current)
          return MAX_POLL_TIME
        }
        return prev + 1000
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!sessionId || !token) return

    const wsBase = import.meta.env.VITE_WS_URL || `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
    const wsUrl = `${wsBase}/ws/agent-log/${sessionId}?token=${token}`

    try {
      const ws = new WebSocket(wsUrl)
      wsRef.current = ws

      ws.onopen = () => {
        setWsConnected(true)
        addLog('Terhubung ke agent pipeline...')
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          const agentKey = data.agent?.toLowerCase()
          const agentLabel = AGENT_LABELS[agentKey] || data.agent || 'System'
          addLog(data.message || 'Memproses...', agentKey)

          if (agentKey === 'planner') setCurrentStage(1)
          else if (agentKey === 'researcher') setCurrentStage(2)
          else if (agentKey === 'composer') setCurrentStage(3)
        } catch {
          addLog(event.data)
        }
      }

      ws.onerror = () => {
        setWsConnected(false)
      }

      ws.onclose = () => {
        setWsConnected(false)
      }
    } catch {
      setWsConnected(false)
    }

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }
      wsRef.current = null
    }
  }, [sessionId, token, addLog])

  useEffect(() => {
    if (!sessionId) return

    const poll = async () => {
      try {
        const session = await getSession(sessionId)
        setActiveSession(session)
        if (session.status && session.status !== 'processing') {
          if (session.status === 'failed') {
            setError('Kurikulum gagal dibuat. Silakan coba lagi.')
            if (pollRef.current) clearInterval(pollRef.current)
            if (timerRef.current) clearInterval(timerRef.current)
            return
          }
          setCurrentStage(4)
          addLog('Kurikulum siap! Mengalihkan ke dashboard...')
          setTimeout(() => navigate('/dashboard'), 1500)
          if (pollRef.current) clearInterval(pollRef.current)
        }
      } catch {
        // Continue polling on error
      }
    }

    pollRef.current = setInterval(poll, 3000)
    poll()

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [sessionId, navigate, setActiveSession, addLog])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const progressValue = ((currentStage + 1) / PIPELINE_STAGES.length) * 100

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 py-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 text-red-500 shadow-sm">
          <AlertCircle className="h-10 w-10" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold text-foreground">Ups, Terjadi Kesalahan</h2>
          <p className="text-muted-foreground max-w-xs mx-auto">{error}</p>
        </div>
        <Button onClick={() => navigate('/onboarding')} size="lg" className="px-8">
          Coba Lagi
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 py-12">
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="flex h-20 w-20 items-center justify-center rounded-2xl bg-tertiary shadow-lg"
      >
        <Leaf className="h-10 w-10 text-white" />
      </motion.div>

      <div className="w-full max-w-md space-y-3">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStage}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-center text-lg font-semibold text-foreground"
          >
            {PIPELINE_STAGES[currentStage]?.label}
          </motion.p>
        </AnimatePresence>

        <Progress value={progressValue} className="h-3" />

        <div className="flex justify-between px-1">
          {PIPELINE_STAGES.map((stage, i) => (
            <div
              key={stage.key}
              className={`flex flex-col items-center gap-1 ${
                i <= currentStage ? 'text-tertiary' : 'text-muted-foreground/40'
              }`}
            >
              <div
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  i <= currentStage ? 'bg-tertiary' : 'bg-muted'
                }`}
              />
              <span className="text-[10px] font-medium">
                {stage.agent ? AGENT_LABELS[stage.agent] : (i === 0 ? 'Mulai' : 'Selesai')}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Agent Log
            </h3>
            <div className={`h-2 w-2 rounded-full ${wsConnected ? 'bg-tertiary animate-pulse' : 'bg-amber-400'}`} />
          </div>
          <div className="h-40 space-y-1.5 overflow-y-auto font-mono text-xs">
            {logs.length === 0 && (
              <p className="text-muted-foreground">Menunggu agent...</p>
            )}
            {logs.map((log) => (
              <div key={log.id} className="flex gap-2">
                <span className="shrink-0 text-muted-foreground">
                  {log.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                {log.agent && (
                  <span
                    className="shrink-0 font-semibold"
                    style={{ color: AGENT_COLORS[log.agent] || '#6b7280' }}
                  >
                    [{AGENT_LABELS[log.agent] || log.agent}]
                  </span>
                )}
                <span className="text-foreground">{log.message}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  )
}