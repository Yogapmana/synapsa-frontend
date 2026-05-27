import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Sparkles, Loader2, Play } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { startLearning } from '@/api/learning'
import { useLearningStore } from '@/stores/learningStore'
import StepGoal from './StepGoal'
import StepUpload from './StepUpload'
import StepConfirm from './StepConfirm'
import AgentLoadingScreen from './AgentLoadingScreen'

const STEPS = [
  { id: 'goal', label: 'Target' },
  { id: 'upload', label: 'Referensi' },
  { id: 'confirm', label: 'Konfirmasi' },
]

const INITIAL_DATA = {
  topic: '',
  duration_weeks: null,
  level: null,
  hours_per_day: null,
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState(INITIAL_DATA)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [showAgentLoading, setShowAgentLoading] = useState(false)
  const activeSession = useLearningStore((s) => s.activeSession)
  const setActiveSession = useLearningStore((s) => s.setActiveSession)

  const isStep1Valid = formData.topic.trim() && formData.duration_weeks && formData.level && formData.hours_per_day

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1)
    }
  }

  const handleContinueSession = () => {
    if (!activeSession) return

    if (activeSession.status === 'processing') {
      setSessionId(activeSession.id)
      setShowAgentLoading(true)
    } else if (activeSession.status === 'ready' || activeSession.status === 'active') {
      navigate('/dashboard')
    }
  }

  const handleStart = async () => {
    setError(null)
    setLoading(true)

    try {
      const session = await startLearning({
        topic: formData.topic.trim(),
        duration_weeks: formData.duration_weeks,
        level: formData.level,
        hours_per_day: formData.hours_per_day,
        language: 'id',
      })

      setActiveSession(session)
      setSessionId(session.id)
      setShowAgentLoading(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Gagal memulai sesi belajar. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (updates) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  if (showAgentLoading && sessionId) {
    return <AgentLoadingScreen sessionId={sessionId} />
  }

  if (activeSession) {
    return (
      <div className="flex flex-col items-center justify-center space-y-8 py-12 text-center">
        <div className="space-y-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-100 text-primary-600">
            <Sparkles className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Lanjutkan Sesi Belajar
          </h1>
          <p className="mx-auto max-w-md text-lg text-muted-foreground">
            Kamu memiliki sesi belajar yang sedang berlangsung. Mari lanjutkan perjalanan belajarmu!
          </p>
        </div>

        <div className="w-full max-w-md overflow-hidden rounded-2xl border bg-card p-6 shadow-sm">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Topik</p>
              <h3 className="text-xl font-semibold text-foreground">
                {activeSession.topic}
              </h3>
            </div>

            <div className="flex items-center justify-center gap-2">
              <span className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                activeSession.status === 'processing' ? "bg-amber-100 text-amber-800" : "bg-green-100 text-green-800"
              )}>
                {activeSession.status === 'processing' ? 'Sedang Diproses' : 'Siap'}
              </span>
            </div>

            <Button
              onClick={handleContinueSession}
              className="w-full gap-2 bg-primary-500 hover:bg-primary-600 text-white h-12 text-lg font-semibold rounded-xl"
            >
              <Play className="h-5 w-5" />
              Lanjut
            </Button>
          </div>
        </div>

        <button
          onClick={() => setActiveSession(null)}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Atau mulai sesi baru
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-3">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all',
                i < step && 'bg-primary-500 text-white',
                i === step && 'bg-primary-500 text-white ring-4 ring-primary-100',
                i > step && 'bg-muted text-muted-foreground'
              )}
            >
              {i < step ? '✓' : i + 1}
            </div>
            <span
              className={cn(
                'text-sm font-medium hidden sm:inline',
                i <= step ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-8 sm:w-12 rounded-full transition-colors',
                  i < step ? 'bg-primary-500' : 'bg-border'
                )}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === 0 && (
            <StepGoal data={formData} onChange={updateFormData} />
          )}
          {step === 1 && (
            <StepUpload />
          )}
          {step === 2 && (
            <StepConfirm data={formData} />
          )}
        </motion.div>
      </AnimatePresence>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4">
        {step > 0 ? (
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={loading}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        ) : (
          <div />
        )}

        {step < STEPS.length - 1 ? (
          <Button
            onClick={handleNext}
            disabled={step === 0 && !isStep1Valid}
            className="gap-2"
          >
            Lanjut
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleStart}
            disabled={loading}
            className="gap-2 bg-primary-500 hover:bg-primary-600 text-white shadow-green h-14 px-8 text-lg font-semibold rounded-xl"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Memulai...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Mulai Belajar!
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  )
}