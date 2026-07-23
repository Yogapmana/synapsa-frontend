import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { Loader2, CheckCircle2, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { verifyEmail, resendVerification } from '@/api/auth'
import LanguageToggle from '@/components/common/LanguageToggle'

export default function VerifyEmail() {
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const email = location.state?.email || ''

  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef([])

  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true })
    }
  }, [email, navigate])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)
    setError(null)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted) {
      const newCode = pasted.split('').concat(Array(6 - pasted.length).fill(''))
      setCode(newCode)
      inputRefs.current[Math.min(pasted.length, 5)]?.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fullCode = code.join('')
    if (fullCode.length !== 6) {
      setError(t('auth.verify_code_incomplete'))
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await verifyEmail(email, fullCode)
      setSuccess(true)
      setTimeout(() => navigate('/login', { replace: true, state: { verified: true, email } }), 2000)
    } catch (err) {
      setError(err.response?.data?.detail || t('auth.verify_failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return
    setError(null)
    try {
      await resendVerification(email)
      setResendCooldown(60)
    } catch (err) {
      setError(err.response?.data?.detail || t('auth.resend_failed'))
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral texture-grain p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface rounded-[2rem] p-10 shadow-warm-xl ring-1 ring-border-subtle/50 text-center max-w-md w-full"
        >
          <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-primary mb-2">{t('auth.verify_success')}</h2>
          <p className="text-secondary">{t('auth.verify_redirecting')}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral texture-grain p-6">
      <div className="absolute left-4 top-4 z-20 sm:left-6 sm:top-5">
        <Link to="/" className="block">
          <img src="/horizontal-logo.png" alt="Synapsa Logo" className="h-16 sm:h-24 w-auto object-contain transition-transform hover:scale-105" />
        </Link>
      </div>
      <div className="absolute right-4 top-4 z-20 sm:right-6 sm:top-5">
        <LanguageToggle className="bg-surface/80 backdrop-blur-sm shadow-warm-xs ring-1 ring-border/50" />
      </div>

      <motion.div
        className="w-full max-w-[440px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
      >
        <div className="bg-surface rounded-[2rem] p-8 md:p-10 shadow-warm-xl ring-1 ring-border-subtle/50 mt-12 lg:mt-0">
          <div className="mb-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-tertiary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-7 w-7 text-tertiary" />
            </div>
            <h2 className="text-2xl font-display font-bold text-primary tracking-tight">
              {t('auth.verify_title')}
            </h2>
            <p className="text-sm text-secondary mt-1.5">
              {t('auth.verify_subtitle')} <span className="font-medium text-primary">{email}</span>
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="p-3.5 text-sm text-danger-fg bg-danger-light rounded-xl border border-danger/20 mb-5"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex justify-center gap-3">
              {code.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  className={cn(
                    'w-12 h-14 text-center text-xl font-bold rounded-xl border-none ring-1 ring-border-subtle bg-surface-1 text-primary focus:ring-2 focus:ring-tertiary/30 focus:outline-none transition-shadow',
                    error && 'ring-2 ring-danger/40'
                  )}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting || code.some((d) => !d)}
              className="w-full bg-tertiary text-white rounded-xl px-6 py-3 font-semibold hover:bg-tertiary-light active:bg-tertiary-dark transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-label tracking-wide shadow-warm-sm hover:shadow-warm-md"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? t('auth.verify_submitting') : t('auth.verify_submit')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-secondary">
              {t('auth.verify_no_code')}{' '}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className={cn(
                  'font-semibold transition-colors',
                  resendCooldown > 0
                    ? 'text-secondary/50 cursor-not-allowed'
                    : 'text-tertiary hover:text-tertiary-light'
                )}
              >
                {resendCooldown > 0
                  ? `${t('auth.verify_resend_in')} ${resendCooldown}s`
                  : t('auth.verify_resend')}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
