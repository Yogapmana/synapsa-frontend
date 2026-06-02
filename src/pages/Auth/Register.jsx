import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Leaf, Loader2, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { register as registerApi } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username minimal 3 karakter')
    .max(50, 'Username maksimal 50 karakter'),
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Password tidak cocok",
  path: ["confirmPassword"],
})

export default function Register() {
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const login = useAuthStore((state) => state.login)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data) => {
    setError(null)
    try {
      const response = await registerApi({
        username: data.username,
        email: data.email,
        password: data.password,
      })

      login(response.access_token, response.user)
      queryClient.clear()
      console.log('[REGISTER] User registered and logged in:', response.user.email)
      navigate('/onboarding')
    } catch (err) {
      console.error('[REGISTER] Error:', err)
      setError(err.response?.data?.detail || 'Pendaftaran gagal. Silakan coba lagi nanti.')
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral p-4">
      <div className="w-full max-w-[420px] space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="flex items-center gap-2">
            <div className="bg-tertiary p-2 rounded-xl">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-primary font-display">PLA</span>
          </div>
          <p className="text-sm text-secondary font-medium">Personal Learning Agent</p>
        </div>

        <Card className="border border-[var(--border)] shadow-lg bg-surface">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Daftar Akun</CardTitle>
            <CardDescription className="text-center">
              Lengkapi formulir di bawah ini untuk membuat akun baru
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-tertiary bg-red-50 rounded-md border border-red-100">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary font-label" htmlFor="username">
                  Username
                </label>
                <Input
                  id="username"
                  autoComplete="username"
                  placeholder="johndoe"
                  className={cn(errors.username && "border-tertiary focus-visible:ring-tertiary")}
                  {...register('username')}
                />
                {errors.username && (
                  <p className="text-xs text-tertiary">{errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary font-label" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  className={cn(errors.email && "border-tertiary focus-visible:ring-tertiary")}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-tertiary">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary font-label" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className={cn(errors.password && "border-tertiary focus-visible:ring-tertiary", "pr-10")}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/70 hover:text-secondary"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-tertiary">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary font-label" htmlFor="confirmPassword">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    className={cn(errors.confirmPassword && "border-tertiary focus-visible:ring-tertiary", "pr-10")}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/70 hover:text-secondary"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-tertiary">{errors.confirmPassword.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-tertiary hover:bg-tertiary/90 text-white font-bold h-11"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Daftar'
                )}
              </Button>
              <div className="text-sm text-center text-secondary">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-tertiary hover:underline font-semibold">
                  Masuk
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
