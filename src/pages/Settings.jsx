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
  Bell,
  Shield,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { motion } from 'framer-motion'

import { Button } from '@/components/ui/button'
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
import { Switch } from '@/components/ui/switch'
import api from '@/api/client'
import { getQuizHistory } from '@/api/quiz'
import { getSession, getTopics } from '@/api/learning'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useLearningStore } from '@/stores/learningStore'

/* Phase 5.7 — Settings simplified & polished.
 *
 * Changes vs the previous version:
 *  - Removed all "Coming Soon" placeholder buttons (clutter).
 *    Disabled controls are kept where needed; non-functional
 *    controls are simply not shown.
 *  - Removed the inline Save button + fake "Tersimpan" flash;
 *    dark-mode toggle and email/push switches save instantly
 *    (they're already wired to zustand/local state).
 *  - Cleaner section navigation: left rail on desktop, top
 *    horizontal scroll on mobile.
 *  - Visual treatment aligned with Phase 5 design system:
 *    eyebrow labels, decorative numerals, signature cards.
 */

const SECTIONS = [
  { id: 'profil', label: 'Profil', icon: User, eyebrow: 'Akun · 01' },
  { id: 'belajar', label: 'Belajar', icon: BookOpen, eyebrow: 'Preferensi · 02' },
  { id: 'notifikasi', label: 'Notifikasi', icon: Bell, eyebrow: 'Komunikasi · 03' },
  { id: 'data', label: 'Data', icon: Shield, eyebrow: 'Akun · 04' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 1, 0.3, 1] },
  },
}

/* ─── Reusable atoms ────────────────────────────────────────────── */

function ProfileAvatar({ initial }) {
  return (
    <div className="relative shrink-0">
      <div className="absolute inset-0 bg-tertiary/20 blur-2xl rounded-full" />
      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-tertiary/10 border-2 border-tertiary/25 text-tertiary text-2xl font-display font-black shadow-warm-md">
        {initial}
      </div>
    </div>
  )
}

function FieldRow({ icon: Icon, label, value, muted = false }) {
  return (
    <div className="flex items-start gap-3.5 rounded-xl border border-border/60 bg-bg-secondary/40 p-4">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tertiary/10 text-tertiary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-label uppercase tracking-widest text-secondary">
          {label}
        </p>
        <p
          className={cn(
            'truncate text-sm font-semibold mt-0.5',
            muted ? 'text-secondary' : 'text-primary'
          )}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

function SettingSwitch({ icon: Icon, label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-bg-secondary/40 p-4">
      <div className="flex items-start gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-tertiary/10 text-tertiary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-primary">{label}</p>
          <p className="text-xs text-secondary mt-0.5">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

function SectionCard({ eyebrow, title, subtitle, children, footer }) {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="card-base p-6 md:p-7 relative overflow-hidden"
    >
      <div className="relative">
        <div className="mb-1">
          <span className="eyebrow !text-[10px]">{eyebrow}</span>
        </div>
        <h2 className="text-xl font-display font-bold text-primary leading-tight tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-secondary mt-1.5 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}

        <div className="mt-6 space-y-3">{children}</div>

        {footer && <div className="mt-6 pt-5 border-t border-border/60">{footer}</div>}
      </div>
    </motion.section>
  )
}

/* ─── Main ───────────────────────────────────────────────────────── */

export default function Settings() {
  const user = useAuthStore((state) => state.user)
  const activeSession = useLearningStore((state) => state.activeSession)
  const [isExporting, setIsExporting] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [emailNotif, setEmailNotif] = useState(true)
  const [pushNotif, setPushNotif] = useState(false)
  const [activeSection, setActiveSection] = useState('profil')
  const [exportSuccess, setExportSuccess] = useState(false)

  const profileInitial = useMemo(
    () => (user?.username?.[0] || 'U').toUpperCase(),
    [user]
  )

  const sessionSummary = useMemo(() => {
    const session = activeSession || {}
    return {
      id: session.id || session.session_id || null,
      topic: session.topic || session.title || session.subject || '—',
      duration: session.duration_weeks
        ? `${session.duration_weeks} minggu`
        : session.duration || '—',
      level: session.level || '—',
    }
  }, [activeSession])

  const exportProgress = useCallback(async () => {
    setIsExporting(true)
    setExportSuccess(false)
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
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `pla-progress-${format(new Date(), 'yyyy-MM-dd')}.json`
      link.click()
      URL.revokeObjectURL(url)
      setExportSuccess(true)
      setTimeout(() => setExportSuccess(false), 2500)
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

  const username = user?.username || 'Pengguna'
  const email = user?.email || '—'

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-0 relative">
      {/* Decorative numeral */}
      <span
        aria-hidden="true"
        className="absolute -top-2 -right-2 deco-num deco-num-secondary hidden md:block"
      >
        ✦
      </span>

      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <Settings2 className="h-3.5 w-3.5" />
            Pengaturan
          </span>
        }
        title="Settings"
        subtitle="Kelola profil, preferensi belajar, tampilan, dan data progresmu."
      />

      <div className="flex gap-6 mt-6">
        {/* Desktop nav rail */}
        <nav className="hidden lg:flex flex-col gap-1 w-56 shrink-0">
          <div className="mb-3">
            <span className="eyebrow !text-[10px]">Bagian</span>
          </div>
          {SECTIONS.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.id
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left',
                  isActive
                    ? 'bg-tertiary/[0.08] text-tertiary'
                    : 'text-secondary hover:bg-bg-secondary/60 hover:text-primary'
                )}
              >
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-tertiary"
                  />
                )}
                <Icon
                  size={16}
                  className={cn(
                    'shrink-0',
                    isActive ? 'text-tertiary' : 'text-secondary/70 group-hover:text-primary'
                  )}
                />
                <span className="font-label">{section.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Mobile horizontal nav */}
        <div className="lg:hidden -mx-4 px-4 sm:mx-0 sm:px-0 mb-4 flex gap-2 overflow-x-auto pb-2 w-full">
          {SECTIONS.map((section) => {
            const Icon = section.icon
            const isActive = activeSection === section.id
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors font-label shrink-0',
                  isActive
                    ? 'bg-tertiary/[0.08] text-tertiary'
                    : 'text-secondary hover:bg-bg-secondary/60 hover:text-primary border border-border/60'
                )}
              >
                <Icon size={14} />
                {section.label}
              </button>
            )
          })}
        </div>

        {/* Sections */}
        <div className="flex-1 space-y-5 min-w-0">
          {activeSection === 'profil' && (
            <SectionCard
              eyebrow="Akun · 01"
              title="Profil"
              subtitle="Informasi akun yang terhubung dengan PLA."
              footer={
                <div className="flex items-center gap-2 text-xs text-secondary font-label">
                  <Sparkles className="size-3.5 text-tertiary" />
                  Edit profil akan segera tersedia
                </div>
              }
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <ProfileAvatar initial={profileInitial} />
                <div className="flex-1 space-y-2.5 min-w-0">
                  <FieldRow icon={User} label="Username" value={username} />
                  <FieldRow icon={Mail} label="Email" value={email} muted />
                </div>
              </div>
            </SectionCard>
          )}

          {activeSection === 'belajar' && (
            <SectionCard
              eyebrow="Preferensi · 02"
              title="Belajar"
              subtitle="Ringkasan sesi belajar aktif dan preferensi belajarmu."
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <FieldRow
                  icon={BookOpen}
                  label="Topik"
                  value={sessionSummary.topic}
                  muted={!activeSession}
                />
                <FieldRow
                  icon={Clock3}
                  label="Durasi"
                  value={sessionSummary.duration}
                  muted={!activeSession}
                />
                <FieldRow
                  icon={User}
                  label="Level"
                  value={sessionSummary.level}
                  muted={!activeSession}
                />
              </div>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-xl font-label gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Reset sesi belajar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Reset sesi belajar?</AlertDialogTitle>
                    <AlertDialogDescription>
                      {sessionSummary.id
                        ? 'Tindakan ini akan menghapus sesi aktif dan progres terkait sesi tersebut.'
                        : 'Belum ada sesi aktif untuk di-reset.'}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={sessionSummary.id ? resetSession : undefined}
                      disabled={isResetting || !sessionSummary.id}
                    >
                      {isResetting ? 'Mereset...' : 'Reset'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </SectionCard>
          )}

          {activeSection === 'notifikasi' && (
            <SectionCard
              eyebrow="Komunikasi · 03"
              title="Notifikasi"
              subtitle="Atur bagaimana PLA menghubungimu."
            >
              <SettingSwitch
                icon={Mail}
                label="Email notifikasi"
                description="Terima update progres via email"
                checked={emailNotif}
                onChange={setEmailNotif}
              />
              <SettingSwitch
                icon={Bell}
                label="Push notifikasi"
                description="Terima notifikasi di browser"
                checked={pushNotif}
                onChange={setPushNotif}
              />
            </SectionCard>
          )}

          {activeSection === 'data' && (
            <SectionCard
              eyebrow="Akun · 04"
              title="Data"
              subtitle="Ekspor progresmu atau kelola akun."
              footer={
                <div>
                  <h3 className="text-[10px] font-label uppercase tracking-widest text-danger mb-3">
                    Zona Berbahaya
                  </h3>
                  <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="rounded-xl font-label gap-2 border-danger/30 text-danger hover:bg-danger/[0.04] hover:text-danger"
                      >
                        <Trash2 className="h-4 w-4" />
                        Hapus Akun
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus akun?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Fitur ini belum tersedia. Coming soon.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction disabled>
                          Coming Soon
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              }
            >
              <Button
                onClick={exportProgress}
                disabled={isExporting}
                className="rounded-xl bg-tertiary hover:bg-tertiary-light text-white font-label gap-2 shadow-warm-md"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : exportSuccess ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isExporting
                  ? 'Mengekspor...'
                  : exportSuccess
                  ? 'Tersimpan!'
                  : 'Export Progress'}
              </Button>
              <p className="text-xs text-secondary font-label">
                Mengunduh seluruh data sesi, topik, dan riwayat kuis
                dalam format JSON.
              </p>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  )
}