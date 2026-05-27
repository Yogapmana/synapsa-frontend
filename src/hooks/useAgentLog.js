import { useEffect, useRef, useCallback } from 'react'
import { useAgentLogStore } from '../stores/agentLogStore'
import { useAuthStore } from '../stores/authStore'

const MAX_RETRIES = 4
const BASE_DELAY = 1000

export function useAgentLog(sessionId) {
  const addLog = useAgentLogStore((s) => s.addLog)
  const setConnected = useAgentLogStore((s) => s.setConnected)
  const clearLogs = useAgentLogStore((s) => s.clearLogs)
  const { token } = useAuthStore()
  const wsRef = useRef(null)
  const retryCountRef = useRef(0)
  const retryTimerRef = useRef(null)
  const mountedRef = useRef(true)

  const safeClose = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close()
    }
    wsRef.current = null
  }, [])

  const attemptReconnect = useCallback(() => {
    if (retryCountRef.current >= MAX_RETRIES) return

    const delay = BASE_DELAY * Math.pow(2, retryCountRef.current)
    retryCountRef.current += 1

    retryTimerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        connect()
      }
    }, delay)
  }, [])

  const connect = useCallback(() => {
    if (!sessionId || !token) return

    const wsUrl = `${import.meta.env.VITE_WS_URL}/ws/agent-log/${sessionId}?token=${token}`
    const ws = new WebSocket(wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      if (!mountedRef.current) return
      retryCountRef.current = 0
      setConnected(true)
    }

    ws.onmessage = (event) => {
      if (!mountedRef.current) return
      try {
        const log = JSON.parse(event.data)
        addLog(log)
      } catch {
        // ignore malformed messages
      }
    }

    ws.onclose = () => {
      if (!mountedRef.current) return
      setConnected(false)
      attemptReconnect()
    }

    ws.onerror = () => {
      if (!mountedRef.current) return
      setConnected(false)
    }
  }, [sessionId, token, addLog, setConnected])

  const reconnect = useCallback(() => {
    retryCountRef.current = 0
    safeClose()
    connect()
  }, [connect, safeClose])

  useEffect(() => {
    mountedRef.current = true
    connect()

    return () => {
      mountedRef.current = false
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current)
      }
      safeClose()
    }
  }, [connect, safeClose])

  const logs = useAgentLogStore((s) => s.logs)
  const isConnected = useAgentLogStore((s) => s.isConnected)
  const filter = useAgentLogStore((s) => s.filter)

  return { isConnected, logs, filter, reconnect, clearLogs }
}