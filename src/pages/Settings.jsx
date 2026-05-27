import { useCallback, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  Moon,
  SunMedium,
  User,
  Mail,
  Clock3,
  Download,
  RefreshCw,
  Trash2,
  Settings2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import api from '@/api/client'
import { getQuizHistory } from '@/api/quiz'
import { getSession, getTopics } from '@/api/learning'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useLearningStore } from '@/stores/learningStore'
import { useUIStore } from '@/stores/uiStore'

const HOURS_OPTIONS = ['1', '2', '3', '4', '5', '6']

function FieldRow({ icon: Icon, label, value, muted = false }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-background/60 p-4">
      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={cn('truncate text-sm font-medium', muted && 'text-muted-foreground')}>{value}</p>
      </div>
    </div>
  )
}

function ComingSoonButton({ children, className, tooltip = 'Coming Soon', ...props }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex">
          <Button className={className} {...props} disabled>
            {children}
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

export default function Settings() {
  const user = useAuthStore((state) => state.user)
  const darkMode = useUIStore((state) => state.darkMode)
  const toggleDarkMode = useUIStore((state) => state.toggleDarkMode)
  const activeSession = useLearningStore((state) => state.activeSession)
  const [hoursPerDay, setHoursPerDay] = useState('2')
  const [isExporting, setIsExporting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const profileInitial = useMemo(() => (user?.username?.[0] || 'U').toUpperCase(), [user])

  const sessionSummary = useMemo(() => {
    const session = activeSession || {}

    return {
      id: session.id || session.session_id || null,
      topic: session.topic || session.title || session.subject || 'Belum ada sesi aktif',
      duration: session.duration_weeks ? `${session.duration_weeks} minggu` : session.duration || '—',
      level: session.level || '—',
    }
  }, [activeSession])

  const exportProgress = useCallback(async () => {
    setIsExporting(true)
    try {
      const sessionId = sessionSummary.id
      const payload = {
        exported_at: new Date().toISOString(),
        user,
        active_session: activeSession,
      }

      if (sessionId) {
        const [session, topics, quizHistory] = await Promise.all([
          getSession(sessionId),
          getTopics(sessionId),
          getQuizHistory(sessionId),
        ])

        payload.session_details = session
        payload.topics = topics
        payload.quiz_history = quizHistory
      }

      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `pla-progress-${format(new Date(), 'yyyy-MM-dd')}.json`
      link.click()
      URL.revokeObjectURL(url)
    } finally {
      setIsExporting(false)
    }
  }, [activeSession, sessionSummary.id, user])

  const resetSession = useCallback(async () => {
    if (!sessionSummary.id) return
    setIsResetting(true)
    try {
      await api.delete(`/learning/${sessionSummary.id}`)
      window.location.reload()
    } finally {
      setIsResetting(false)
    }
  }, [sessionSummary.id])

  const deleteAccountSoon = useCallback(() => {
    setIsDeleting(false)
  }, [])

  const username = user?.username || 'Pengguna'
  const email = user?.email || '—'

  return (
    <TooltipProvider>
      <div className="mx-auto w-full max-w-[720px] space-y-6 px-4 py-6 sm:px-6 lg:px-0">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Settings2 className="h-3.5 w-3.5" />
            Pengaturan Akun
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Kelola profil, preferensi belajar, tampilan, dan data progresmu.</p>
        </div>

        <Card className="overflow-hidden border-border/70">
          <CardHeader className="pb-4">
            <CardTitle>Profil</CardTitle>
            <CardDescription>Informasi akun yang terhubung dengan profil PLA.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground shadow-sm">
                {profileInitial}
              </div>
              <div className="flex-1 space-y-3">
                <FieldRow icon={User} label="Username" value={username} />
                <FieldRow icon={Mail} label="Email" value={email} />
              </div>
            </div>
            <ComingSoonButton variant="outline" className="w-full sm:w-auto">
              Edit Profil
            </ComingSoonButton>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/70">
          <CardHeader className="pb-4">
            <CardTitle>Learning</CardTitle>
            <CardDescription>Ringkasan sesi belajar aktif dan preferensi durasi harian.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <FieldRow icon={Settings2} label="Topik" value={sessionSummary.topic} muted={!activeSession} />
              <FieldRow icon={Clock3} label="Durasi" value={sessionSummary.duration} muted={!activeSession} />
              <FieldRow icon={User} label="Level" value={sessionSummary.level} muted={!activeSession} />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="hours-per-day">Jam per hari</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Select value={hoursPerDay} onValueChange={setHoursPerDay} disabled>
                      <SelectTrigger id="hours-per-day" className="w-full">
                        <SelectValue placeholder="Coming Soon" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOURS_OPTIONS.map((value) => (
                          <SelectItem key={value} value={value}>
                            {value} jam
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </span>
                </TooltipTrigger>
                <TooltipContent>Coming Soon</TooltipContent>
              </Tooltip>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto">
                  <RefreshCw className="h-4 w-4" />
                  Reset Sesi
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset sesi belajar?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {sessionSummary.id
                      ? 'Tindakan ini akan menghapus sesi aktif dan progres terkait sesi tersebut.'
                      : 'Fitur reset sesi belum tersedia untuk akun ini. Coming Soon.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={sessionSummary.id ? resetSession : undefined} disabled={isResetting}>
                    {sessionSummary.id ? (isResetting ? 'Mereset...' : 'Reset') : 'Coming Soon'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/70">
          <CardHeader className="pb-4">
            <CardTitle>Tampilan</CardTitle>
            <CardDescription>Sesuaikan mode visual antarmuka.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 p-4">
              <div className="space-y-1">
                <Label htmlFor="dark-mode-toggle" className="text-base">
                  Dark mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  Saat ini: <span className="font-medium text-foreground">{darkMode ? 'Dark' : 'Light'}</span>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <SunMedium className="h-4 w-4 text-amber-500" />
                <Switch id="dark-mode-toggle" checked={darkMode} onCheckedChange={toggleDarkMode} />
                <Moon className="h-4 w-4 text-slate-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-border/70">
          <CardHeader className="pb-4">
            <CardTitle>Data</CardTitle>
            <CardDescription>Ekspor progres atau kelola akun.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full sm:w-auto" onClick={exportProgress} disabled={isExporting}>
              <Download className="h-4 w-4" />
              {isExporting ? 'Mengekspor...' : 'Export Progress'}
            </Button>

            <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full sm:w-auto">
                  <Trash2 className="h-4 w-4" />
                  Hapus Akun
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus akun?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Aksi ini tidak bisa dibatalkan. Untuk saat ini fitur penghapusan akun belum tersedia.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteAccountSoon}>Coming Soon</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
