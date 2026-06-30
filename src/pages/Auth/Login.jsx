import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Sparkles, Loader2, Eye, EyeOff, CheckCircle2, Brain, BookOpen, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { login as loginApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { useQueryClient } from '@tanstack/react-query'

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
})

export default function Login() {
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const login = useAuthStore((state) => state.login)

  const registeredNotice = location.state?.registered
  const prefilledEmail = location.state?.email || ''

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: prefilledEmail,
      password: '',
    },
  })

  const onSubmit = async (data) => {
    setError(null)
    try {
      const response = await loginApi(data.email, data.password)
      useAuthStore.getState().logout()
      queryClient.clear()
      // Pass the response.streak payload through to the auth store
      // — when `is_new_day` is true, the store queues a
      // StreakCelebration modal that AppLayout will render.
      login(response.access_token, response.user, response.streak)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login gagal. Silakan periksa email dan password Anda.')
    }
  }

  return (
    <div className="min-h-screen flex bg-neutral texture-grain">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-surface via-neutral to-tertiary/5 items-center justify-center">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, rgb(var(--tertiary)) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-tertiary/[0.06] blur-3xl"
        />

        <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-md">
          <div className="w-20 h-20 rounded-2xl bg-tertiary flex items-center justify-center mb-6 shadow-warm-lg ring-4 ring-tertiary/15">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl font-display font-bold text-primary tracking-tighter leading-none">
            Synapsa
          </h1>
          <p className="text-lg text-secondary mt-3 font-serif-content leading-relaxed">
            Personal Learning Agent — kurikulum adaptif yang
            <span className="text-tertiary italic"> belajar </span>
            dari cara kamu belajar.
          </p>

          <div className="mt-12 w-full space-y-3 text-left">
            {[
              { icon: Brain, label: 'Planner Agent rancang kurikulum personal' },
              { icon: BookOpen, label: 'Modul dari 7 sumber terpercaya' },
              { icon: MessageSquare, label: 'Tutor AI kontekstual 24/7' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-tertiary/10 text-tertiary shrink-0">
                  <item.icon className="h-4 w-4" />
                </div>
                <span className="text-sm text-primary font-label">{item.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-transparent p-6 sm:p-8">
        <motion.div
          className="w-full max-w-[440px]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        >
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-8">
            <div className="bg-tertiary p-2 rounded-xl">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight text-primary">Synapsa</span>
          </div>

          <div className="bg-surface rounded-[2rem] p-8 md:p-10 shadow-warm-xl ring-1 ring-border-subtle/50">
            <div className="mb-6">
              <h2 className="text-2xl font-display font-bold text-primary tracking-tight">
                Selamat datang kembali
              </h2>
              <p className="text-sm text-secondary mt-1.5">Masuk untuk lanjutkan perjalanan belajar kamu</p>
            </div>

            {registeredNotice && (
              <div className="flex items-start gap-2.5 p-3.5 text-sm text-success-fg bg-success-light rounded-xl border border-success/20 mb-5">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Akun berhasil dibuat. Silakan masuk dengan kredensial Anda.</span>
              </div>
            )}

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
                <label className="text-sm font-label text-primary" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={cn(
                    'w-full rounded-xl border-none ring-1 ring-border-subtle bg-surface-1 px-4 py-3 text-sm text-primary placeholder:text-secondary/50 focus:ring-2 focus:ring-tertiary/30 focus:outline-none transition-shadow shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]',
                    errors.email && 'ring-2 ring-danger/40 focus:ring-danger/40'
                  )}
                  {...register('email')}
                />
                {errors.email && (
                  <p id="email-error" role="alert" className="text-danger text-sm">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-label text-primary" htmlFor="password">Password</label>
                  <Link to="#" className="text-xs text-tertiary hover:text-tertiary-light transition-colors">
                    Lupa password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? "password-error" : undefined}
                    className={cn(
                      'w-full rounded-xl border-none ring-1 ring-border-subtle bg-surface-1 px-4 py-3 pr-10 text-sm text-primary placeholder:text-secondary/50 focus:ring-2 focus:ring-tertiary/30 focus:outline-none transition-shadow shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]',
                      errors.password && 'ring-2 ring-danger/40 focus:ring-danger/40'
                    )}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/70 hover:text-secondary transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p id="password-error" role="alert" className="text-danger text-sm">{errors.password.message}</p>
                )}
              </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-tertiary text-white rounded-xl px-6 py-3 font-semibold hover:bg-tertiary-light active:bg-tertiary-dark transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-label tracking-wide shadow-warm-sm hover:shadow-warm-md"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Memproses...' : 'Masuk'}
            </button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-surface px-3 text-secondary">atau</span>
              </div>
            </div>

            <button
              type="button"
              disabled
              title="Coming Soon"
              className="w-full bg-surface shadow-warm-sm ring-1 ring-border-subtle text-primary rounded-xl px-6 py-3 font-semibold hover:shadow-warm-md hover:ring-tertiary/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Masuk dengan Google
            </button>

            <p className="text-sm text-center text-secondary mt-6">
              Belum punya akun?{' '}
              <Link to="/register" className="text-tertiary hover:text-tertiary-light font-semibold transition-colors">
                Daftar
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}