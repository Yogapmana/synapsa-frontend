import { useCallback, useMemo, useState } from 'react'
import { format } from 'date-fns'
import {
  User,
  Mail,
  Clock3,
  Download,
  RefreshCw,
  Trash2,
  Settings2,
  BookOpen,
  Sun,
  Bell,
  Shield,
  CheckCircle2,
  Loader2,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import PageHeader from '@/components/common/PageHeader'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Switch } from '@/components/ui/switch'
import api from '@/api/client'
import { getQuizHistory } from '@/api/quiz'
import { getSession, getTopics } from '@/api/learning'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useLearningStore } from '@/stores/learningStore'

const HOURS_OPTIONS = ['1', '2', '3', '4', '5', '6']

const SECTIONS = [
  { id: 'profil', label: 'Profil', icon: User },
  { id: 'belajar', label: 'Preferensi Belajar', icon: BookOpen },
  { id: 'tampilan', label: 'Tampilan', icon: Sun },
  { id: 'notifikasi', label: 'Notifikasi', icon: Bell },
  { id: 'akun', label: 'Akun', icon: Shield },
]

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
}

function FieldRow({ icon: Icon, label, value, muted = false }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-bg-secondary/40 p-4">
      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-tertiary/10 text-tertiary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-label uppercase tracking-wide text-secondary">{label}</p>
        <p className={cn('truncate text-sm font-medium', muted ? 'text-secondary' : 'text-primary')}>{value}</p>
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
  const activeSession = useLearningStore((state) => state.activeSession)
  const [hoursPerDay, setHoursPerDay] = useState('2')
  const [isExporting, setIsExporting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [darkMode, setDarkMode] = useState(false)
  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeSection, setActiveSection] = useState('profil')

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

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const username = user?.username || 'Pengguna'
  const email = user?.email || '—'

  return (
    <TooltipProvider>
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-0">
        <PageHeader
          eyebrow={
            <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-bg-primary px-3 py-1 text-xs font-medium text-secondary">
              <Settings2 className="h-3.5 w-3.5" />
              Pengaturan
            </span>
          }
          title="Settings"
          subtitle="Kelola profil, preferensi belajar, tampilan, dan data progresmu."
        />

        <div className="flex gap-6 mt-6">
          <nav className="hidden lg:flex flex-col gap-1 w-56 shrink-0">
            {SECTIONS.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-left',
                    activeSection === section.id
                      ? 'bg-tertiary/10 text-tertiary'
                      : 'text-secondary hover:bg-bg-secondary hover:text-primary'
                  )}
                >
                  <Icon size={16} />
                  {section.label}
                </button>
              )
            })}
          </nav>

          <div className="flex-1 space-y-6 min-w-0">
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              {SECTIONS.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors',
                      activeSection === section.id
                        ? 'bg-tertiary/10 text-tertiary'
                        : 'text-secondary hover:bg-bg-secondary hover:text-primary border border-border/60'
                    )}
                  >
                    <Icon size={14} />
                    {section.label}
                  </button>
                )
              })}
            </div>

            {(activeSection === 'profil' || typeof window !== 'undefined') && (
              <section id="profil" className={cn(activeSection !== 'profil' && 'hidden lg:block')}>
                <div className="card-base p-6">
                  <h2 className="text-xl font-display font-semibold text-primary mb-1">Profil</h2>
                  <p className="text-sm text-secondary mb-5">Informasi akun yang terhubung dengan profil PLA.</p>

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-tertiary/10 text-tertiary text-xl font-display font-bold shrink-0">
                      {profileInitial}
                    </div>
                    <div className="flex-1 space-y-3">
                      <FieldRow icon={User} label="Username" value={username} />
                      <FieldRow icon={Mail} label="Email" value={email} muted />
                    </div>
                  </div>

                  <div className="mt-5">
                    <ComingSoonButton variant="outline" className="rounded-xl">
                      Edit Profil
                    </ComingSoonButton>
                  </div>
                </div>
              </section>
            )}

            {(activeSection === 'belajar') && (
              <section id="belajar">
                <div className="card-base p-6">
                  <h2 className="text-xl font-display font-semibold text-primary mb-1">Preferensi Belajar</h2>
                  <p className="text-sm text-secondary mb-5">Ringkasan sesi belajar aktif dan preferensi durasi harian.</p>

                  <div className="grid gap-3 sm:grid-cols-3 mb-5">
                    <FieldRow icon={BookOpen} label="Topik" value={sessionSummary.topic} muted={!activeSession} />
                    <FieldRow icon={Clock3} label="Durasi" value={sessionSummary.duration} muted={!activeSession} />
                    <FieldRow icon={User} label="Level" value={sessionSummary.level} muted={!activeSession} />
                  </div>

                  <div className="grid gap-2 mb-5">
                    <label htmlFor="hours-per-day" className="text-sm font-label text-secondary">Jam per hari</label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          <Select value={hoursPerDay} onValueChange={setHoursPerDay} disabled>
                            <SelectTrigger id="hours-per-day" className="w-full rounded-xl">
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
                      <Button variant="outline" className="rounded-xl">
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
                </div>
              </section>
            )}

            {(activeSection === 'tampilan') && (
              <section id="tampilan">
                <div className="card-base p-6">
                  <h2 className="text-xl font-display font-semibold text-primary mb-1">Tampilan</h2>
                  <p className="text-sm text-secondary mb-5">Sesuaikan tampilan dan bahasa aplikasi.</p>

                  <div className="space-y-5">
                    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-bg-secondary/40 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center">
                          <Sun size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-primary">Dark Mode</p>
                          <p className="text-xs text-secondary">Ganti tampilan ke mode gelap</p>
                        </div>
                      </div>
                      <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-bg-secondary/40 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center">
                          <Settings2 size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-primary">Bahasa</p>
                          <p className="text-xs text-secondary">Pilih bahasa tampilan</p>
                        </div>
                      </div>
                      <ComingSoonButton variant="outline" size="sm" className="rounded-xl" tooltip="Coming Soon">
                        Indonesia
                      </ComingSoonButton>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {(activeSection === 'notifikasi') && (
              <section id="notifikasi">
                <div className="card-base p-6">
                  <h2 className="text-xl font-display font-semibold text-primary mb-1">Notifikasi</h2>
                  <p className="text-sm text-secondary mb-5">Atur preferensi notifikasi kamu.</p>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-bg-secondary/40 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center">
                          <Mail size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-primary">Email Notifikasi</p>
                          <p className="text-xs text-secondary">Terima update progres via email</p>
                        </div>
                      </div>
                      <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-border/60 bg-bg-secondary/40 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center">
                          <Bell size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-primary">Push Notifikasi</p>
                          <p className="text-xs text-secondary">Terima notifikasi di browser</p>
                        </div>
                      </div>
                      <Switch checked={pushNotif} onCheckedChange={setPushNotif} />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {(activeSection === 'akun') && (
              <section id="akun">
                <div className="card-base p-6">
                  <h2 className="text-xl font-display font-semibold text-primary mb-1">Akun & Data</h2>
                  <p className="text-sm text-secondary mb-5">Ekspor progres atau kelola akun.</p>

                  <div className="space-y-4">
                    <Button className="rounded-xl bg-tertiary hover:bg-tertiary-light text-white" onClick={exportProgress} disabled={isExporting}>
                      {isExporting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4" />}
                      {isExporting ? 'Mengekspor...' : 'Export Progress'}
                    </Button>

                    <div className="border-t border-border/60 pt-4">
                      <h3 className="text-sm font-label uppercase tracking-wide text-danger mb-3">Zona Berbahaya</h3>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <ComingSoonButton variant="outline" className="rounded-xl" tooltip="Coming Soon">
                          <Shield className="h-4 w-4" />
                          Ganti Password
                        </ComingSoonButton>

                        <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="rounded-xl">
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
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={handleSave}
            className={cn(
              'rounded-xl px-6 py-3 font-semibold transition-all shadow-warm-md',
              saved
                ? 'bg-success text-white hover:bg-success'
                : 'bg-tertiary text-white hover:bg-tertiary-light'
            )}
          >
            {saved ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Tersimpan
              </>
            ) : (
              'Simpan Perubahan'
            )}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  )
}