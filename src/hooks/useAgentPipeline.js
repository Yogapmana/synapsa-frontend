import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { useLearningStore } from '@/stores/learningStore'
import { getSession, getAgentLogs } from '@/api/learning'

const MAX_POLL_TIME = 600000
const WS_MAX_RETRIES = 8
const WS_BASE_RETRY_DELAY = 1000

const AGENT_STAGE = {
  planner: 1,
  researcher: 2,
  composer: 3,
  feedback: 3,
}

export const PIPELINE_STAGES = [
  {
    key: 'starting',
    label: 'Menunggu agent...',
    agent: null,
    description: 'Membangun koneksi ke pipeline.',
  },
  {
    key: 'planner',
    label: 'Planner sedang merancang kurikulum...',
    agent: 'planner',
    description: 'Memecah topik menjadi sub-bab & jadwal personal.',
  },
  {
    key: 'researcher',
    label: 'Researcher mencari materi...',
    agent: 'researcher',
    description: 'Mengambil konten dari web, arXiv, Wikipedia, dan lainnya.',
  },
  {
    key: 'composer',
    label: 'Composer menyusun modul...',
    agent: 'composer',
    description: 'Menyintesis materi menjadi modul Markdown terstruktur.',
  },
  {
    key: 'done',
    label: 'Selesai!',
    agent: null,
    description: 'Mengalihkan ke dashboard.',
  },
]

function stageFromAgent(agent) {
  if (!agent) return 0
  return AGENT_STAGE[String(agent).toLowerCase()] ?? 0
}

function parseTimestamp(value) {
  if (!value) return null
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function normalizeLogEntry(entry) {
  if (!entry) return null
  const id = entry.id || `${entry.timestamp || Date.now()}-${entry.message || ''}`
  const timestamp = parseTimestamp(entry.timestamp || entry.created_at) || new Date()
  return {
    id: String(id),
    message: entry.message || 'Memproses...',
    agent: entry.agent ? String(entry.agent).toLowerCase() : null,
    timestamp,
  }
}

function stageFromLogs(logList) {
  let stage = 0
  for (const log of logList) {
    stage = Math.max(stage, stageFromAgent(log.agent))
  }
  return stage
}

/**
 * Bootstrap + WS agent-log stream + status poll for onboarding pipeline.
 */
export function useAgentPipeline(sessionId) {
  const [logs, setLogs] = useState([])
  const [currentStage, setCurrentStage] = useState(0)
  const [wsConnected, setWsConnected] = useState(false)
  const [error, setError] = useState(null)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [historyReady, setHistoryReady] = useState(false)
  const navigate = useNavigate()
  const token = useAuthStore((s) => s.token)
  const setActiveSession = useLearningStore((s) => s.setActiveSession)

  const wsRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const pollRef = useRef(null)
  const timerRef = useRef(null)
  const logsEndRef = useRef(null)
  const seenLogIdsRef = useRef(new Set())
  const sessionStartedAtRef = useRef(null)
  const connectedNoticeRef = useRef(false)
  const finishedRef = useRef(false)

  const advanceStage = useCallback((agent) => {
    const next = stageFromAgent(agent)
    if (next > 0) {
      setCurrentStage((prev) => Math.max(prev, next))
    }
  }, [])

  const ingestLogs = useCallback((entries, { replace = false } = {}) => {
    const list = (Array.isArray(entries) ? entries : [entries])
      .map(normalizeLogEntry)
      .filter(Boolean)

    if (list.length === 0) return

    setLogs((prev) => {
      const base = replace ? [] : prev
      if (replace) {
        seenLogIdsRef.current = new Set()
      }
      const merged = [...base]
      for (const entry of list) {
        if (seenLogIdsRef.current.has(entry.id)) continue
        seenLogIdsRef.current.add(entry.id)
        merged.push(entry)
      }
      return merged
    })

    const highest = stageFromLogs(list)
    if (highest > 0) {
      setCurrentStage((prev) => Math.max(prev, highest))
    }
  }, [])

  const failWithTimeout = useCallback(() => {
    setError('Kurikulum gagal dibuat. Silakan coba lagi.')
    if (pollRef.current) clearInterval(pollRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
  }, [])

  const markReadyAndRedirect = useCallback(
    (logId) => {
      if (finishedRef.current) return
      finishedRef.current = true
      setCurrentStage(4)
      ingestLogs([
        {
          id: logId,
          message: 'Kurikulum siap! Mengalihkan ke dashboard...',
          agent: null,
          timestamp: new Date().toISOString(),
        },
      ])
      setTimeout(() => navigate('/dashboard'), 1500)
    },
    [ingestLogs, navigate],
  )

  // Bootstrap: session + history
  useEffect(() => {
    if (!sessionId) return
    let cancelled = false

    const bootstrap = async () => {
      try {
        const [session, history] = await Promise.all([
          getSession(sessionId),
          getAgentLogs(sessionId).catch(() => []),
        ])
        if (cancelled) return

        setActiveSession(session)

        const startedAt = parseTimestamp(session?.created_at) || new Date()
        sessionStartedAtRef.current = startedAt
        setElapsedTime(
          Math.min(Math.max(0, Date.now() - startedAt.getTime()), MAX_POLL_TIME),
        )

        if (Array.isArray(history) && history.length > 0) {
          ingestLogs(history, { replace: true })
        }

        if (session?.status && session.status !== 'processing') {
          if (session.status === 'failed') {
            setError('Kurikulum gagal dibuat. Silakan coba lagi.')
          } else {
            markReadyAndRedirect('done-bootstrap')
          }
        }
      } catch {
        // WS + poll still try
      } finally {
        if (!cancelled) setHistoryReady(true)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [sessionId, setActiveSession, ingestLogs, markReadyAndRedirect])

  // Elapsed timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const started = sessionStartedAtRef.current
      if (started) {
        const next = Math.min(
          Math.max(0, Date.now() - started.getTime()),
          MAX_POLL_TIME,
        )
        setElapsedTime(next)
        if (next >= MAX_POLL_TIME) failWithTimeout()
        return
      }
      setElapsedTime((prev) => {
        if (prev + 1000 >= MAX_POLL_TIME) {
          failWithTimeout()
          return MAX_POLL_TIME
        }
        return prev + 1000
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [failWithTimeout])

  // WebSocket stream
  useEffect(() => {
    if (!sessionId || !token || !historyReady) return

    const wsBase =
      import.meta.env.VITE_WS_URL ||
      `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}`
    let ws = null
    let retryCount = 0
    let manualClose = false

    const scheduleReconnect = () => {
      if (manualClose || finishedRef.current) return
      if (retryCount >= WS_MAX_RETRIES) return
      const delay = WS_BASE_RETRY_DELAY * Math.pow(2, retryCount)
      retryCount += 1
      reconnectTimerRef.current = setTimeout(connect, delay)
    }

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
        if (!connectedNoticeRef.current) {
          connectedNoticeRef.current = true
          ingestLogs([
            {
              id: 'local-connected',
              message: 'Terhubung ke agent pipeline...',
              agent: null,
              timestamp: new Date().toISOString(),
            },
          ])
        }
      }

      ws.onmessage = (event) => {
        let data
        try {
          data = JSON.parse(event.data)
        } catch {
          ingestLogs([
            { message: String(event.data), timestamp: new Date().toISOString() },
          ])
          return
        }

        if (data?.type === 'connected') return

        if (data?.type === 'history' && Array.isArray(data.logs)) {
          ingestLogs(data.logs)
          return
        }

        if (data?.type && data.type !== 'log' && data.type !== 'agent_log') return

        const agentKey = data.agent?.toLowerCase() || null
        ingestLogs([
          {
            id: data.id || null,
            message: data.message || 'Memproses...',
            agent: agentKey,
            timestamp: data.timestamp || new Date().toISOString(),
          },
        ])
        if (agentKey) advanceStage(agentKey)
      }

      ws.onerror = () => setWsConnected(false)
      ws.onclose = () => {
        setWsConnected(false)
        scheduleReconnect()
      }
    }

    connect()

    return () => {
      manualClose = true
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
      if (
        ws &&
        (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)
      ) {
        ws.close()
      }
      wsRef.current = null
    }
  }, [sessionId, token, historyReady, ingestLogs, advanceStage])

  // Poll session status
  useEffect(() => {
    if (!sessionId) return

    const poll = async () => {
      try {
        const session = await getSession(sessionId)
        setActiveSession(session)

        if (!sessionStartedAtRef.current && session?.created_at) {
          const startedAt = parseTimestamp(session.created_at)
          if (startedAt) {
            sessionStartedAtRef.current = startedAt
            setElapsedTime(
              Math.min(
                Math.max(0, Date.now() - startedAt.getTime()),
                MAX_POLL_TIME,
              ),
            )
          }
        }

        if (session.status && session.status !== 'processing') {
          if (session.status === 'failed') {
            setError('Kurikulum gagal dibuat. Silakan coba lagi.')
            if (pollRef.current) clearInterval(pollRef.current)
            if (timerRef.current) clearInterval(timerRef.current)
            return
          }
          markReadyAndRedirect('done-poll')
          if (pollRef.current) clearInterval(pollRef.current)
        }
      } catch {
        // keep polling
      }
    }

    pollRef.current = setInterval(poll, 3000)
    poll()

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [sessionId, setActiveSession, markReadyAndRedirect])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const startOver = useCallback(() => {
    setActiveSession(null)
    navigate('/onboarding?new=true', { replace: true })
  }, [setActiveSession, navigate])

  const progressValue = (currentStage / (PIPELINE_STAGES.length - 1)) * 100
  const elapsedSec = Math.floor(elapsedTime / 1000)
  const elapsedLabel = `${Math.floor(elapsedSec / 60)}m ${elapsedSec % 60}s`
  const currentStageData = PIPELINE_STAGES[currentStage] || PIPELINE_STAGES[0]

  return {
    logs,
    currentStage,
    currentStageData,
    wsConnected,
    error,
    elapsedLabel,
    progressValue,
    logsEndRef,
    startOver,
    PIPELINE_STAGES,
  }
}
