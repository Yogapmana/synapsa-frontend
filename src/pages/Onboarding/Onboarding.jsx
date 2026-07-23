import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, ArrowRight, Sparkles, Loader2, Play, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { startLearning } from '@/api/learning'
import { useLearningStore } from '@/stores/learningStore'
import { useTranslation } from 'react-i18next'
import StepGoal from './StepGoal'
import StepUpload from './StepUpload'
import StepConfirm from './StepConfirm'
import AgentLoadingScreen from './AgentLoadingScreen'

const STEPS = [
  { id: 'goal', label: 'Target', number: '01' },
  { id: 'upload', label: 'Referensi', number: '02' },
  { id: 'confirm', label: 'Konfirmasi', number: '03' },
]

const INITIAL_DATA = {
  language: 'id',
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
  const { t } = useTranslation()
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
  const location = useLocation()
  
  const isNewRequest = new URLSearchParams(location.search).get('new') === 'true'

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
        language: formData.language,
        files: formData.files,
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

  if (activeSession && !isNewRequest) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md relative">
          {/* Decorative numeral */}
          <span
            aria-hidden="true"
            className="absolute -top-8 -right-2 deco-num deco-num-secondary hidden md:block"
          >
            ✦
          </span>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="card-hero p-8 md:p-10 text-center space-y-6 relative overflow-hidden"
          >
            {/* Decorative inner numeral */}
            <span
              aria-hidden="true"
              className="absolute -top-4 -right-2 font-display text-[7rem] font-black italic text-tertiary/[0.06] leading-none pointer-events-none select-none"
            >
              ✦
            </span>

            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-tertiary/10 border-2 border-tertiary/20">
              <Sparkles className="h-10 w-10 text-tertiary" />
            </div>

            <div className="space-y-2 relative">
              <div className="flex justify-center">
                <span className="eyebrow">Sesi Aktif</span>
              </div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-primary">
                Lanjutkan
                <br />
                <span className="italic text-tertiary">Sesi Belajar</span>
              </h1>
              <p className="text-secondary max-w-sm mx-auto">
                Kamu memiliki sesi belajar yang sedang berlangsung. Mari
                lanjutkan perjalanan belajarmu!
              </p>
            </div>

            <div className="rounded-xl bg-bg-secondary/60 border border-border/60 p-5 space-y-3">
              <div className="space-y-1">
                <p className="font-label text-[10px] uppercase tracking-widest text-secondary">
                  Topik
                </p>
                <h3 className="font-display text-xl font-semibold text-primary leading-snug">
                  {activeSession.topic}
                </h3>
              </div>
              <div className="flex items-center justify-center">
                <span
                  className={cn(
                    'pill font-label',
                    activeSession.status === 'processing'
                      ? 'pill-warning'
                      : 'pill-success'
                  )}
                >
                  {activeSession.status === 'processing'
                    ? 'Sedang Diproses'
                    : 'Siap'}
                </span>
              </div>
            </div>

            <Button
              onClick={handleContinueSession}
              variant="tertiary"
              size="lg"
              className="w-full gap-2 text-base font-semibold rounded-xl font-label shadow-warm-md"
            >
              <Play className="h-5 w-5" />
              Lanjut
            </Button>

            <button
              onClick={() => navigate('/onboarding?new=true')}
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
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-8 relative">
      {/* Decorative numerals in corners */}
      <span
        aria-hidden="true"
        className="absolute top-8 left-4 deco-num deco-num-secondary hidden md:block"
      >
        ✦
      </span>
      <span
        aria-hidden="true"
        className="absolute bottom-8 right-4 deco-num hidden md:block"
      >
        ✦
      </span>

      <div className="w-full max-w-3xl relative">
        {/* Stepper */}
        <nav className="mb-10" aria-label="Progress">
          <ol className="flex items-center justify-center gap-0">
            {STEPS.map((s, i) => (
              <li key={s.id} className="flex items-center">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      'relative flex h-10 w-10 items-center justify-center rounded-full font-display font-bold text-sm transition-all duration-300',
                      i < step && 'bg-success text-white shadow-warm-sm',
                      i === step &&
                        'bg-tertiary text-white shadow-warm-md ring-4 ring-tertiary/20',
                      i > step && 'bg-bg-tertiary/60 text-secondary/70'
                    )}
                    aria-current={i === step ? 'step' : undefined}
                  >
                    {i < step ? (
                      <Check className="h-4 w-4" strokeWidth={3} />
                    ) : (
                      <span className="tabular-nums">{s.number}</span>
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-sm font-label font-medium hidden sm:inline transition-colors tracking-wide',
                      i <= step ? 'text-primary' : 'text-secondary/60'
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="mx-3 sm:mx-5 h-px w-10 sm:w-16 relative overflow-hidden bg-border rounded-full">
                    <motion.div
                      className="absolute inset-y-0 left-0 bg-success"
                      initial={{ width: 0 }}
                      animate={{ width: i < step ? '100%' : '0%' }}
                      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Main Card */}
        <div className="card-hero p-7 md:p-10 relative overflow-hidden">
          {/* Subtle corner deco numeral */}
          <span
            aria-hidden="true"
            className="absolute -top-4 -right-2 font-display text-[8rem] font-black italic text-tertiary/[0.05] leading-none pointer-events-none select-none"
          >
            ✦
          </span>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {step === 0 && (
                <StepGoal data={formData} onChange={updateFormData} />
              )}
              {step === 1 && (
                <StepUpload data={formData} onChange={updateFormData} />
              )}
              {step === 2 && <StepConfirm data={formData} />}
            </motion.div>
          </AnimatePresence>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-xl border border-danger/20 bg-danger/[0.06] p-4 text-center"
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
              className="gap-2 font-label rounded-xl"
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
              size="lg"
              className="gap-2 font-label rounded-xl shadow-warm-md group"
            >
              Lanjut
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          ) : (
            <Button
              onClick={handleStart}
              disabled={loading}
              variant="tertiary"
              size="lg"
              className="gap-2 shadow-warm-md text-base font-semibold rounded-xl font-label px-8 group"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Memulai...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  {t('onboarding.submit')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}