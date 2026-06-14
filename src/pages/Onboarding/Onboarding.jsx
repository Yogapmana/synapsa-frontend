import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Sparkles, Loader2, Play, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { startLearning } from '@/api/learning'
import { useLearningStore } from '@/stores/learningStore'
import StepGoal from './StepGoal'
import StepUpload from './StepUpload'
import StepConfirm from './StepConfirm'
import AgentLoadingScreen from './AgentLoadingScreen'

const STEPS = [
  { id: 'goal', label: 'Target', icon: '🎯' },
  { id: 'upload', label: 'Referensi', icon: '📄' },
  { id: 'confirm', label: 'Konfirmasi', icon: '✓' },
]

const INITIAL_DATA = {
  topic: '',
  duration_weeks: null,
  level: null,
  hours_per_day: null,
  files: [],
}

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
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
      setDirection(1)
      setStep((s) => s + 1)
    }
  }

  const handleBack = () => {
    if (step > 0) {
      setDirection(-1)
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
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card-base p-8 md:p-10 text-center space-y-6"
          >
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-tertiary/10">
              <Sparkles className="h-10 w-10 text-tertiary" />
            </div>
            <div className="space-y-2">
              <h1 className="font-display text-3xl font-bold tracking-tight text-primary">
                Lanjutkan Sesi Belajar
              </h1>
              <p className="text-secondary max-w-sm mx-auto">
                Kamu memiliki sesi belajar yang sedang berlangsung. Mari lanjutkan perjalanan belajarmu!
              </p>
            </div>

            <div className="rounded-xl bg-bg-secondary p-5 space-y-3">
              <div className="space-y-1">
                <p className="font-label text-xs uppercase tracking-wider text-secondary">Topik</p>
                <h3 className="font-display text-xl font-semibold text-primary">
                  {activeSession.topic}
                </h3>
              </div>
              <div className="flex items-center justify-center">
                <span
                  className={cn(
                    'pill',
                    activeSession.status === 'processing' ? 'pill-warning' : 'pill-success'
                  )}
                >
                  {activeSession.status === 'processing' ? 'Sedang Diproses' : 'Siap'}
                </span>
              </div>
            </div>

            <Button
              onClick={handleContinueSession}
              variant="tertiary"
              size="lg"
              className="w-full gap-2 text-base font-semibold rounded-xl font-label"
            >
              <Play className="h-5 w-5" />
              Lanjut
            </Button>

            <button
              onClick={() => setActiveSession(null)}
              className="text-sm font-medium text-secondary hover:text-primary transition-colors font-label"
            >
              Atau mulai sesi baru
            </button>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8">
      <div className="w-full max-w-3xl">
        {/* Stepper */}
        <nav className="mb-10" aria-label="Progress">
          <ol className="flex items-center justify-center gap-0">
            {STEPS.map((s, i) => (
              <li key={s.id} className="flex items-center">
                <div className="flex items-center gap-2.5">
                  <div
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300',
                      i < step && 'bg-success text-white',
                      i === step && 'bg-tertiary text-white ring-4 ring-tertiary/20',
                      i > step && 'bg-secondary/20 text-secondary'
                    )}
                    aria-current={i === step ? 'step' : undefined}
                  >
                    {i < step ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span
                    className={cn(
                      'text-sm font-medium font-label hidden sm:inline transition-colors',
                      i <= step ? 'text-primary' : 'text-secondary'
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'mx-4 h-0.5 w-12 sm:w-20 rounded-full transition-colors duration-500',
                      i < step ? 'bg-success' : 'bg-border'
                    )}
                  />
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Main Card */}
        <div className="card-base p-8 md:p-10 shadow-warm-lg">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {step === 0 && (
                <StepGoal data={formData} onChange={updateFormData} />
              )}
              {step === 1 && (
                <StepUpload data={formData} onChange={updateFormData} />
              )}
              {step === 2 && (
                <StepConfirm data={formData} />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-xl border border-danger/20 bg-danger/10 p-4 text-center"
            >
              <p className="text-sm font-medium text-danger">{error}</p>
            </motion.div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="mt-6 flex items-center justify-between">
          {step > 0 ? (
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={loading}
              className="gap-2 font-label"
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
              variant="tertiary"
              className="gap-2 font-label"
            >
              Lanjut
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleStart}
              disabled={loading}
              variant="tertiary"
              size="lg"
              className="gap-2 shadow-warm-glow-tertiary text-base font-semibold rounded-xl font-label px-8"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Memulai...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Mulai Belajar Sekarang
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}