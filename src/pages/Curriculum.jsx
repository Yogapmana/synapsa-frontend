import React, { useMemo, useRef, useCallback } from 'react'
import { useActiveSession, useCurriculum, useTopics } from '@/hooks/useLearning'
import { useLearningStore } from '@/stores/learningStore'
import { TopicNode } from '@/components/curriculum/TopicNode'
import WeekCard from '@/components/curriculum/WeekCard'
import JourneyMap from '@/components/curriculum/JourneyMap'
import { ProgressRing } from '@/components/curriculum/ProgressRing'
import {
  BookOpen,
  Sparkles,
  Play,
  Flame,
  Check,
  Clock,
  Calendar,
  Target,
  Trophy,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import PageHeader from '@/components/common/PageHeader'
import StatusBadge from '@/components/common/StatusBadge'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'

/**
 * Curriculum page (Phase polish)
 *
 * Layout (top → bottom):
 *   1. PageHeader — title + course title
 *   2. HeroStats  — big progress ring + streak + total/active counts
 *   3. Today's Focus banner (when there's an active topic)
 *   4. JourneyMap  — horizontal scroll of all weeks as nodes on a path
 *   5. Week Grid  — detailed week cards (3-col on desktop)
 *
 * The page tells a story: "you're here in your journey, this is your
 * next step, this is what's coming". The visual hierarchy reflects
 * that narrative.
 */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
}

export default function Curriculum() {
  const navigate = useNavigate()
  const { data: activeSession, isLoading: isLoadingSession } = useActiveSession()
  const sessionId = activeSession?.id
  const streak = useLearningStore((s) => s.streak)
  const weekRefs = useRef({})
  const shouldReduceMotion = useReducedMotion()

  const { data: curriculumData, isLoading: isLoadingCurriculum } = useCurriculum(sessionId)
  const { data: topicsData, isLoading: isLoadingTopics } = useTopics(sessionId)
  const isLoading = isLoadingSession || isLoadingCurriculum || isLoadingTopics

  // Derive all stats in a single pass
  const { weeks, topics, completedTopics, totalTopics, progressPercentage, journeyWeeks } =
    useMemo(() => {
      if (!curriculumData || !topicsData) {
        return {
          weeks: [],
          topics: [],
          completedTopics: 0,
          totalTopics: 0,
          progressPercentage: 0,
          journeyWeeks: [],
        }
      }
      const curriculumJson = curriculumData.curriculum_json || {}
      const rawWeeks = curriculumJson.weeks || []
      const mappedWeeks = rawWeeks.map((w, i) => ({
        ...w,
        week_number: w.week_number ?? w.week ?? i + 1,
      }))
      const allTopics = Array.isArray(topicsData) ? topicsData : topicsData.topics || []
      const completed = allTopics.filter((t) => t.status === 'completed').length
      const total = allTopics.length
      const pct = total === 0 ? 0 : (completed / total) * 100

      // For journey map: derive each week's status from its topics
      const topicsByWeekForJourney = allTopics.reduce((acc, t) => {
        const wk = t.week_number ?? 1
        if (!acc[wk]) acc[wk] = []
        acc[wk].push(t)
        return acc
      }, {})
      const journey = mappedWeeks.map((w) => {
        const wkTopics = topicsByWeekForJourney[w.week_number] || []
        let status = 'locked'
        if (wkTopics.some((t) => t.status === 'active')) status = 'active'
        else if (wkTopics.length > 0 && wkTopics.every((t) => t.status === 'completed')) status = 'completed'
        return { week_number: w.week_number, title: w.title, status }
      })

      return {
        weeks: mappedWeeks,
        topics: allTopics,
        completedTopics: completed,
        totalTopics: total,
        progressPercentage: pct,
        journeyWeeks: journey,
      }
    }, [curriculumData, topicsData])

  const topicsByWeek = useMemo(() => {
    const grouped = {}
    topics.forEach((topic) => {
      const wk = topic.week_number ?? 1
      if (!grouped[wk]) grouped[wk] = []
      grouped[wk].push(topic)
    })
    Object.values(grouped).forEach((arr) =>
      arr.sort((a, b) => (a.day_number ?? 0) - (b.day_number ?? 0))
    )
    return grouped
  }, [topics])

  const courseTitle = useMemo(() => {
    if (!curriculumData) return ''
    const json = curriculumData.curriculum_json || {}
    return json.title || activeSession?.topic || ''
  }, [curriculumData, activeSession])

  // Find the active topic (for "Today's Focus" banner)
  const activeTopic = topics.find((t) => t.status === 'active')
  const activeWeekNumber = activeTopic?.week_number

  // Journey map → click to scroll a specific week card into view
  const handleSelectWeek = useCallback((week) => {
    const el = weekRefs.current[week.week_number]
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  // ─── Loading state ───
  if (isLoading) {
    return (
      <div className="container max-w-5xl py-10 px-4 md:px-8 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  // ─── Empty state ───
  if (!activeSession || !curriculumData || !topicsData) {
    return (
      <div className="container max-w-5xl py-10 px-4 md:px-8">
        <div className="card-base p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center mb-4">
            <BookOpen size={28} />
          </div>
          <h3 className="font-display font-semibold text-xl text-primary">
            Belum ada kurikulum
          </h3>
          <p className="text-secondary mt-2 max-w-sm mx-auto">
            Mulai perjalanan belajarmu dengan membuat kurikulum baru melalui onboarding.
          </p>
          <Button
            onClick={() => navigate('/onboarding')}
            variant="tertiary"
            className="mt-5 rounded-xl font-label"
          >
            Mulai Onboarding
          </Button>
        </div>
      </div>
    )
  }

  const progressValue = progressPercentage / 100
  const allDone = totalTopics > 0 && completedTopics === totalTopics

  return (
    <div className="container max-w-5xl py-8 md:py-10 px-4 md:px-8 space-y-7">
      <PageHeader
        title="Kurikulum"
        subtitle={courseTitle}
        actions={
          streak > 0 && (
            <StatusBadge variant="accent" icon={Flame} size="lg">
              {streak} hari berturut
            </StatusBadge>
          )
        }
      />

      {/* ─── Hero progress section ─── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="card-base p-6 md:p-8 relative overflow-hidden"
      >
        {/* Decorative background */}
        <div
          aria-hidden="true"
          className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-tertiary/[0.04] blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-warning/[0.06] blur-3xl pointer-events-none"
        />

        <div className="relative flex flex-col md:flex-row items-center gap-8 md:gap-10">
          {/* Big progress ring */}
          <motion.div variants={fadeUp} className="shrink-0">
            <ProgressRing
              value={progressValue}
              size={180}
              strokeWidth={12}
              label={`${Math.round(progressPercentage)}%`}
              sublabel="Selesai"
              tone={allDone ? 'success' : 'tertiary'}
            />
          </motion.div>

          {/* Stat cards */}
          <motion.div variants={fadeUp} className="flex-1 grid grid-cols-2 md:grid-cols-2 gap-3 w-full">
            <HeroStat
              icon={Check}
              value={completedTopics}
              label="Topik Selesai"
              tone="success"
            />
            <HeroStat
              icon={Target}
              value={totalTopics - completedTopics}
              label="Topik Tersisa"
              tone="tertiary"
            />
            <HeroStat
              icon={Calendar}
              value={weeks.length}
              label="Minggu Total"
              tone="info"
            />
            <HeroStat
              icon={Trophy}
              value={allDone ? '✓' : Math.round(progressPercentage) + '%'}
              label={allDone ? 'Lulus' : 'Progres'}
              tone={allDone ? 'success' : 'warning'}
            />
          </motion.div>
        </div>
      </motion.div>

      {/* ─── Today's Focus banner ─── */}
      {activeTopic && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
          className="card-base card-hover card-interactive p-5 md:p-6 bg-gradient-to-br from-tertiary/8 via-warning/5 to-transparent border-tertiary/20 relative overflow-hidden"
        >
          <div
            aria-hidden="true"
            className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-tertiary/8 blur-2xl"
          />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge variant="accent" size="sm" icon={Sparkles}>
                  Fokus Hari Ini
                </StatusBadge>
                {activeTopic.duration_minutes && (
                  <span className="inline-flex items-center gap-1 text-xs text-secondary font-label">
                    <Clock size={11} />
                    <span className="tabular-nums">{activeTopic.duration_minutes} menit</span>
                  </span>
                )}
              </div>
              <h3 className="font-display text-2xl font-bold text-primary leading-tight">
                {activeTopic.title}
              </h3>
              {activeWeekNumber && (
                <p className="text-xs text-secondary font-label">
                  Minggu {activeWeekNumber} dari kurikulum
                </p>
              )}
            </div>
            <Button
              variant="tertiary"
              size="lg"
              onClick={() => navigate(`/module/${activeTopic.id}`)}
              className="shrink-0 rounded-xl font-label tracking-wide"
            >
              <Play size={16} fill="currentColor" />
              Mulai Belajar
            </Button>
          </div>
        </motion.div>
      )}

      {/* ─── Journey Map ─── */}
      {journeyWeeks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <JourneyMap weeks={journeyWeeks} onSelectWeek={handleSelectWeek} />
        </motion.div>
      )}

      {/* ─── Week Grid ─── */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={shouldReduceMotion ? { hidden: {}, visible: {} } : stagger}
        initial="hidden"
        animate="visible"
      >
        {weeks.map((week, i) => (
          <div
            key={week.week_number ?? i}
            ref={(el) => {
              if (el) weekRefs.current[week.week_number ?? i] = el
            }}
            className="scroll-mt-24"
          >
            <WeekCard
              week={week}
              topics={topicsByWeek[week.week_number] || []}
              weekIndex={i}
              isActive={week.week_number === activeWeekNumber}
            />
          </div>
        ))}
      </motion.div>

      {/* Empty state when no weeks */}
      {weeks.length === 0 && (
        <div className="card-base p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-tertiary/10 text-tertiary flex items-center justify-center mb-4">
            <Calendar size={28} />
          </div>
          <h3 className="font-display font-semibold text-xl text-primary">
            Kurikulum kosong
          </h3>
          <p className="text-secondary mt-2 max-w-sm mx-auto">
            Kurikulum ini belum memiliki minggu/topik. Coba mulai ulang onboarding.
          </p>
        </div>
      )}
    </div>
  )
}

/**
 * Single hero stat card (compact) — used in the hero progress row.
 */
function HeroStat({ icon: Icon, value, label, tone = 'tertiary' }) {
  const toneClass = {
    tertiary: 'bg-tertiary/10 text-tertiary',
    success: 'bg-success-light text-success-fg',
    info: 'bg-info-light text-info-fg',
    warning: 'bg-warning-light text-warning-fg',
  }[tone];

  return (
    <div className="card-base p-4 hover:shadow-warm-sm transition-shadow duration-200">
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
            toneClass
          )}
        >
          <Icon size={18} aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-label uppercase tracking-wider text-secondary">
            {label}
          </div>
          <div className="font-display text-xl font-bold text-primary tabular-nums leading-none mt-1">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}
