import { useState, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Eye, EyeOff, CheckCircle2, Lock } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { resetPassword } from '@/api/auth'
import LanguageToggle from '@/components/common/LanguageToggle'

export default function ResetPassword() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const schema = useMemo(
    () =>
      z.object({
        password: z.string().min(8, t('auth.password_min')),
        confirmPassword: z.string(),
      }).refine((data) => data.password === data.confirmPassword, {
        message: t('auth.password_mismatch'),
        path: ['confirmPassword'],
      }),
    [t],
  )

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: (values, context, options) =>
      zodResolver(schema)(values, context, options),
    defaultValues: { password: '', confirmPassword: '' },
  })

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral texture-grain p-6">
        <div className="bg-surface rounded-[2rem] p-10 shadow-warm-xl ring-1 ring-border-subtle/50 text-center max-w-md w-full">
          <h2 className="text-2xl font-display font-bold text-primary mb-2">{t('auth.reset_invalid')}</h2>
          <p className="text-secondary mb-6">{t('auth.reset_invalid_desc')}</p>
          <Link
            to="/forgot-password"
            className="inline-block bg-tertiary text-white rounded-xl px-6 py-3 font-semibold hover:bg-tertiary-light transition-all duration-150 font-label tracking-wide"
          >
            {t('auth.forgot_submit')}
          </Link>
        </div>
      </div>
    )
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
          <h2 className="text-2xl font-display font-bold text-primary mb-2">{t('auth.reset_success')}</h2>
          <p className="text-secondary mb-6">{t('auth.reset_success_desc')}</p>
          <Link
            to="/login"
            className="inline-block bg-tertiary text-white rounded-xl px-6 py-3 font-semibold hover:bg-tertiary-light transition-all duration-150 font-label tracking-wide"
          >
            {t('auth.go_login')}
          </Link>
        </motion.div>
      </div>
    )
  }

  const onSubmit = async (data) => {
    setError(null)
    try {
      await resetPassword(token, data.password)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.detail || t('auth.reset_failed'))
    }
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
              <Lock className="h-7 w-7 text-tertiary" />
            </div>
            <h2 className="text-2xl font-display font-bold text-primary tracking-tight">
              {t('auth.reset_title')}
            </h2>
            <p className="text-sm text-secondary mt-1.5">{t('auth.reset_subtitle')}</p>
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-label text-primary" htmlFor="password">{t('auth.new_password')}</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  aria-invalid={!!errors.password}
                  className={cn(
                    'w-full rounded-xl border-none ring-1 ring-border-subtle bg-surface-1 px-4 py-3 pr-10 text-sm text-primary placeholder:text-secondary/50 focus:ring-2 focus:ring-tertiary/30 focus:outline-none transition-shadow shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]',
                    errors.password && 'ring-2 ring-danger/40 focus:ring-danger/40'
                  )}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/70 hover:text-secondary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p role="alert" className="text-danger text-sm">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-label text-primary" htmlFor="confirmPassword">{t('auth.confirm_password')}</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  className={cn(
                    'w-full rounded-xl border-none ring-1 ring-border-subtle bg-surface-1 px-4 py-3 pr-10 text-sm text-primary placeholder:text-secondary/50 focus:ring-2 focus:ring-tertiary/30 focus:outline-none transition-shadow shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]',
                    errors.confirmPassword && 'ring-2 ring-danger/40 focus:ring-danger/40'
                  )}
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/70 hover:text-secondary transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p role="alert" className="text-danger text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-tertiary text-white rounded-xl px-6 py-3 font-semibold hover:bg-tertiary-light active:bg-tertiary-dark transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-label tracking-wide shadow-warm-sm hover:shadow-warm-md"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? t('auth.reset_submitting') : t('auth.reset_submit')}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
