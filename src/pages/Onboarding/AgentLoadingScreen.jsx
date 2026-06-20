import { cn } from '@/lib/utils'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, AlertCircle, Loader2, Sparkles, X, Globe, PenTool } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import StepProgress from '@/components/common/StepProgress'
import { useAuthStore } from '@/stores/authStore'
import { useLearningStore } from '@/stores/learningStore'
import { getSession } from '@/api/learning'
import { AGENT_LABELS, AGENT_COLORS } from '@/utils/constants'

const PIPELINE_STAGES = [
  { key: 'starting', label: 'Menunggu agent…', agent: null, description: 'Membangun koneksi ke pipeline.' },
  { key: 'planner', label: 'Planner sedang merancang kurikulum…', agent: 'planner', description: 'Memecah topik menjadi sub-bab & jadwal personal.' },
  { key: 'researcher', label: 'Researcher mencari materi…', agent: 'researcher', description: 'Mengambil konten dari web, arXiv, Wikipedia, dan lainnya.' },
  { key: 'composer', label: 'Composer menyusun modul…', agent: 'composer', description: 'Menyintesis materi menjadi modul Markdown terstruktur.' },
  { key: 'done', label: 'Selesai!', agent: null, description: 'Mengalihkan ke dashboard.' },
]

const MAX_POLL_TIME = 600000
const WS_MAX_RETRIES = 8
const WS_BASE_RETRY_DELAY = 1000

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
  const reconnectTimerRef = useRef(null)
  const pollRef = useRef(null)
  const timerRef = useRef(null)
  const logsEndRef = useRef(null)
  const seenLogIdsRef = useRef(new Set())

  const addLog = useCallback((message, agent = null, serverId = null) => {
    if (serverId) {
      if (seenLogIdsRef.current.has(serverId)) return
      seenLogIdsRef.current.add(serverId)
    }
    setLogs((prev) => [...prev, { id: serverId || `${Date.now()}-${Math.random()}`, message, agent, timestamp: new Date() }])
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
    let ws = null
    let retryCount = 0
    let manualClose = false

    const connect = () => {
      if (manualClose) return
      const wsUrl = `${wsBase}/ws/agent-log/${sessionId}?token=${token}`
      try {
        ws = new WebSocket(wsUrl)
        wsRef.current = ws
      } catch {
        scheduleReconnect()
        return
      }

      ws.onopen = () => {
        retryCount = 0
        setWsConnected(true)
        addLog('Terhubung ke agent pipeline...')
      }

      ws.onmessage = (event) => {
        let data
        try {
          data = JSON.parse(event.data)
        } catch {
          addLog(String(event.data))
          return
        }

        if (data?.type && data.type !== 'log' && data.type !== 'agent_log') {
          return
        }

        const agentKey = data.agent?.toLowerCase()
        addLog(data.message || 'Memproses...', agentKey, data.id || null)

        if (agentKey === 'planner') setCurrentStage(1)
        else if (agentKey === 'researcher') setCurrentStage(2)
        else if (agentKey === 'composer') setCurrentStage(3)
      }

      ws.onerror = () => {
        setWsConnected(false)
      }

      ws.onclose = () => {
        setWsConnected(false)
        scheduleReconnect()
      }
    }

    const scheduleReconnect = () => {
      if (manualClose) return
      if (retryCount >= WS_MAX_RETRIES) {
        setError('Koneksi ke agent pipeline terputus. Silakan coba lagi.')
        return
      }
      const delay = WS_BASE_RETRY_DELAY * Math.pow(2, retryCount)
      retryCount += 1
      reconnectTimerRef.current = setTimeout(connect, delay)
    }

    connect()

    return () => {
      manualClose = true
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close()
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

  const progressValue = (currentStage / (PIPELINE_STAGES.length - 1)) * 100
  const elapsedSec = Math.floor(elapsedTime / 1000)
  const elapsedLabel = `${Math.floor(elapsedSec / 60)}m ${elapsedSec % 60}s`
  const currentStageData = PIPELINE_STAGES[currentStage] || PIPELINE_STAGES[0]
  const [logsCollapsed, setLogsCollapsed] = useState(false)

  if (error) {
    const handleStartOver = () => {
      // Clear the failed session so the user gets a fresh wizard
      setActiveSession(null)
      navigate('/onboarding', { replace: true })
    }
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card-base p-8 md:p-10 text-center space-y-6"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-danger/10">
              <AlertCircle className="h-10 w-10 text-danger" />
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-primary">Ups, Terjadi Kesalahan</h2>
              <p className="text-secondary max-w-xs mx-auto">{error}</p>
            </div>
            <Button
              onClick={handleStartOver}
              variant="tertiary"
              size="lg"
              className="w-full rounded-xl font-label"
            >
              Mulai Ulang dari Awal
            </Button>
            <p className="text-xs text-secondary">
              Sesi sebelumnya akan dihapus. Anda bisa memasukkan topik baru.
            </p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-7">
        {/* Hero illustration with role-aware icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-5 text-center"
        >
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-6 rounded-full bg-tertiary/10 blur-2xl"
            />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-tertiary shadow-warm-lg ring-4 ring-tertiary/15">
              <motion.div
                animate={currentStageData?.key !== 'done' ? { rotate: [0, 5, -5, 0] } : { scale: [0.9, 1.1, 1] }}
                transition={{ duration: 4, repeat: currentStageData?.key !== 'done' ? Infinity : 0, ease: 'easeInOut' }}
              >
                {currentStageData?.agent === 'planner' && <Brain className="h-12 w-12 text-white" />}
                {currentStageData?.agent === 'researcher' && <Globe className="h-12 w-12 text-white" />}
                {currentStageData?.agent === 'composer' && <PenTool className="h-12 w-12 text-white" />}
                {(!currentStageData?.agent || currentStageData?.key === 'starting' || currentStageData?.key === 'done') && (
                  <Loader2 className="h-12 w-12 text-white animate-spin" />
                )}
              </motion.div>
            </div>
          </div>

          <div className="space-y-2.5">
            <h1 className="font-display text-3xl font-bold tracking-tight text-primary">
              PLA sedang menyiapkan kurikulum kamu
            </h1>
            <p className="text-sm text-secondary max-w-md mx-auto font-serif-content">
              {currentStageData?.description || 'Menghubungkan ke agent pipeline…'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-label text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  wsConnected ? 'bg-success animate-pulse' : 'bg-warning'
                )}
              />
              {wsConnected ? 'Terhubung' : 'Menghubungkan…'}
            </span>
            <span className="text-secondary/40">·</span>
            <span aria-label={`Elapsed ${elapsedLabel}`}>
              Elapsed: <span className="font-mono text-primary">{elapsedLabel}</span>
            </span>
            <span className="text-secondary/40">·</span>
            <span>Estimasi maks 10 menit</span>
          </div>
        </motion.div>

        {/* Stage list with descriptions */}
        <div className="card-base p-6">
          <StepProgress
            steps={PIPELINE_STAGES.map((s) => ({
              key: s.key,
              label: s.label,
              description: s.description,
            }))}
            currentStep={currentStage}
          />
        </div>

        {/* Progress bar with cancel option */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-label text-xs uppercase tracking-wider text-secondary">Progress</span>
            <span
              aria-label={`${Math.round(progressValue)} persen selesai`}
              className="font-display text-sm font-semibold text-tertiary tabular-nums"
            >
              {Math.round(progressValue)}%
            </span>
          </div>
          <Progress
            value={progressValue}
            className="h-2.5 rounded-full bg-secondary/20"
            indicatorClassName="bg-tertiary rounded-full transition-all duration-500"
          />
        </div>

        {/* Log area — collapsible */}
        <div className="card-base overflow-hidden">
          <button
            type="button"
            onClick={() => setLogsCollapsed((v) => !v)}
            aria-expanded={!logsCollapsed}
            aria-controls="agent-log-list"
            className="w-full flex items-center justify-between border-b border-border px-4 py-3 hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <h3 className="font-label text-xs uppercase tracking-wider text-secondary">Agent Log</h3>
              {logs.length > 0 && (
                <span className="text-[10px] font-mono text-secondary/60 tabular-nums">
                  ({logs.length})
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  wsConnected ? 'bg-success animate-pulse' : 'bg-warning'
                )}
              />
              <motion.span
                animate={{ rotate: logsCollapsed ? 180 : 0 }}
                className="text-secondary text-xs"
                aria-hidden="true"
              >
                ▾
              </motion.span>
            </div>
          </button>
          {!logsCollapsed && (
            <div
              id="agent-log-list"
              className="max-h-[300px] overflow-y-auto p-4 font-mono text-xs space-y-1.5"
            >
              {logs.length === 0 && (
                <p className="text-secondary">Menunggu agent…</p>
              )}
              <AnimatePresence initial={false}>
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-2"
                  >
                    <span className="shrink-0 text-secondary/60 tabular-nums">
                      {log.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    {log.agent && (
                      <span
                        className="shrink-0 font-semibold"
                        style={{ color: AGENT_COLORS[log.agent] || '#7B766D' }}
                      >
                        [{AGENT_LABELS[log.agent] || log.agent}]
                      </span>
                    )}
                    <span className="text-primary">{log.message}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}