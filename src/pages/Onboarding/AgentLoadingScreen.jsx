import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Brain, AlertCircle, Loader2, Globe, PenTool } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import StepProgress from '@/components/common/StepProgress'
import { AGENT_LABELS, AGENT_COLORS } from '@/utils/constants'
import { useAgentPipeline, PIPELINE_STAGES } from '@/hooks/useAgentPipeline'

export default function AgentLoadingScreen({ sessionId }) {
  const {
    logs,
    currentStage,
    currentStageData,
    wsConnected,
    error,
    elapsedLabel,
    progressValue,
    logsEndRef,
    startOver,
  } = useAgentPipeline(sessionId)
  const [logsCollapsed, setLogsCollapsed] = useState(false)

  if (error) {
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
              <h2 className="font-display text-2xl font-bold text-primary">
                Ups, Terjadi Kesalahan
              </h2>
              <p className="text-secondary max-w-xs mx-auto">{error}</p>
            </div>
            <Button
              onClick={startOver}
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
                animate={
                  currentStageData?.key !== 'done'
                    ? { rotate: [0, 5, -5, 0] }
                    : { scale: [0.9, 1.1, 1] }
                }
                transition={{
                  duration: 4,
                  repeat: currentStageData?.key !== 'done' ? Infinity : 0,
                  ease: 'easeInOut',
                }}
              >
                {currentStageData?.agent === 'planner' && (
                  <Brain className="h-12 w-12 text-white" />
                )}
                {currentStageData?.agent === 'researcher' && (
                  <Globe className="h-12 w-12 text-white" />
                )}
                {currentStageData?.agent === 'composer' && (
                  <PenTool className="h-12 w-12 text-white" />
                )}
                {(!currentStageData?.agent ||
                  currentStageData?.key === 'starting' ||
                  currentStageData?.key === 'done') && (
                  <Loader2 className="h-12 w-12 text-white animate-spin" />
                )}
              </motion.div>
            </div>
          </div>

          <div className="space-y-2.5">
            <h1 className="font-display text-3xl font-bold tracking-tight text-primary">
              Synapsa sedang menyiapkan kurikulum kamu
            </h1>
            <p className="text-sm text-secondary max-w-md mx-auto font-serif-content">
              {currentStageData?.description || 'Menghubungkan ke agent pipeline...'}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-label text-secondary">
            <span className="inline-flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  wsConnected ? 'bg-success animate-pulse' : 'bg-warning',
                )}
              />
              {wsConnected ? 'Terhubung' : 'Menghubungkan...'}
            </span>
            <span className="text-secondary/40">·</span>
            <span aria-label={`Elapsed ${elapsedLabel}`}>
              Elapsed: <span className="font-mono text-primary">{elapsedLabel}</span>
            </span>
            <span className="text-secondary/40">·</span>
            <span>Estimasi maks 10 menit</span>
          </div>
        </motion.div>

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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-label text-xs uppercase tracking-wider text-secondary">
              Progress
            </span>
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

        <div className="card-base overflow-hidden">
          <button
            type="button"
            onClick={() => setLogsCollapsed((v) => !v)}
            aria-expanded={!logsCollapsed}
            aria-controls="agent-log-list"
            className="w-full flex items-center justify-between border-b border-border px-4 py-3 hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <h3 className="font-label text-xs uppercase tracking-wider text-secondary">
                Agent Log
              </h3>
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
                  wsConnected ? 'bg-success animate-pulse' : 'bg-warning',
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
              {logs.length === 0 && <p className="text-secondary">Menunggu agent...</p>}
              <AnimatePresence initial={false}>
                {logs.map((log) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex gap-2"
                  >
                    <span className="shrink-0 text-secondary/60 tabular-nums">
                      {log.timestamp.toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
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
