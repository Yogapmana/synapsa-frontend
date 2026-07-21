import { cn } from '@/lib/utils'
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useLearningStore } from '../stores/learningStore';
import { getCurriculum, getTopics } from '../api/learning';
import { getQuizHistory } from '../api/quiz';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import GreetingHero from '../components/dashboard/GreetingHero';
import { StatCards } from '../components/data/StatCards';
import StreakCard from '../components/gamification/StreakCard';
import XpCard from '../components/gamification/XpCard';

import ContinueLearningHero from '../components/dashboard/ContinueLearningHero';
import RecentActivity from '../components/dashboard/RecentActivity';
import FeedbackBanner from '../components/dashboard/FeedbackBanner';
import LearningAnalytics from '../components/dashboard/LearningAnalytics';
import { Skeleton } from '../components/ui/skeleton';

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
};

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { activeSession, streak } = useLearningStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    curriculum: null,
    topics: [],
    quizHistory: [],
  });
  const [showFeedback, setShowFeedback] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        if (activeSession?.id) {
          const [currData, topicsData, quizData] = await Promise.all([
            getCurriculum(activeSession.id).catch(() => null),
            getTopics(activeSession.id).catch(() => []),
            getQuizHistory(activeSession.id).catch(() => []),
          ]);

          setData({
            curriculum: currData || null,
            topics: Array.isArray(topicsData) ? topicsData : (topicsData?.topics || []),
            quizHistory: Array.isArray(quizData) ? quizData : [],
          });
        }
      } catch {
        setData({ curriculum: null, topics: [], quizHistory: [] });
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [activeSession]);

  const { curriculum, topics, quizHistory } = data;

  const completedTopicsCount = topics.filter(t => t.status === 'completed').length;
  // The fake XP formula below (topics*10 + streak*5) was a
  // pre-gamification placeholder. The real XP system lives on
  // the backend (see ``/api/v1/gamification/xp``) and is now
  // displayed in the new <XpCard /> below. We delete the
  // calculation entirely — no one reads it now.
  const xp = 0; // legacy prop, see <XpCard /> for real value

  const avgQuizScore = quizHistory.length > 0
    ? Math.round(quizHistory.reduce((sum, q) => {
        const scoreVal = q.score > 1 ? q.score : q.score * 100;
        return sum + scoreVal;
      }, 0) / quizHistory.length)
    : 0;

  const totalStudyMinutes = topics
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + (t.duration_minutes || 0), 0);
  const studyHoursThisWeek = Math.round((totalStudyMinutes / 60) * 10) / 10;

  const stats = useMemo(() => [
    // Note: "Streak Hari" was removed from this array because
    // it's now shown in the dedicated <StreakCard /> with full
    // 12-week heatmap. Keeping it here too would be redundant.
    {
      label: t('dashboard.stats_completed_topics', 'Topik Selesai'),
      value: completedTopicsCount,
      subtext: t('dashboard.stats_from_total', { total: topics.length || 0, defaultValue: `dari ${topics.length || 0} total` }),
      icon: 'BookOpen',
      color: 'success',
      sparkline: Array.from({ length: 7 }, (_, i) => Math.max(0, completedTopicsCount - (6 - i) * 0.5)),
      trend: completedTopicsCount > 0 ? 8 : null,
    },
    {
      label: t('dashboard.stats_study_time', 'Waktu Belajar'),
      value: `${studyHoursThisWeek}j`,
      subtext: t('dashboard.stats_this_week', 'minggu ini'),
      icon: 'Clock',
      color: 'warning',
      sparkline: [1.2, 1.8, 0.5, 2.4, 1.1, 2.0, studyHoursThisWeek || 0],
      trend: 15,
    },
    {
      label: t('dashboard.stats_quiz_score', 'Skor Kuis'),
      value: avgQuizScore,
      subtext: t('dashboard.stats_quizzes_count', { count: quizHistory.length, defaultValue: `${quizHistory.length} kuis` }),
      icon: 'Target',
      color: 'info',
      sparkline: [60, 70, 75, 80, 78, 85, avgQuizScore || 0],
      trend: avgQuizScore > 70 ? 6 : null,
    },
  ], [completedTopicsCount, topics.length, studyHoursThisWeek, avgQuizScore, quizHistory.length]);

  const todayTopic = topics.find(t => t.status === 'active') ||
                      topics.find(t => t.status === 'locked' || !t.status);

  const activities = quizHistory.map(q => {
    const displayScore = q.score > 1 ? q.score : Math.round(q.score * 100);
    return {
      id: q.id,
      type: 'quiz',
      title: t('dashboard.activity_quiz', { topic: q.topic_title || 'Topik', defaultValue: `Kuis: ${q.topic_title || 'Topik'}` }),
      description: t('dashboard.activity_score_time', { score: displayScore, mins: Math.round((q.time_spent_seconds || 0) / 60), defaultValue: `Skor: ${displayScore} — ${Math.round((q.time_spent_seconds || 0) / 60)} menit` }),
      time: new Date(q.created_at || Date.now()).toLocaleDateString('id-ID'),
      score: displayScore,
      // Used by RecentActivity to link each row to the per-topic
      // history page (`/progress/topic/:topicId`).
      topicId: q.topic_id,
    };
  }).slice(0, 5);

  const latestFeedbackTopic = useMemo(() => {
    return [...topics].reverse().find(t => t.feedback_action && t.feedback_action !== "continue" && t.status === "completed");
  }, [topics]);

  const feedbackData = useMemo(() => {
    if (!latestFeedbackTopic) return null;
    const action = latestFeedbackTopic.feedback_action;
    const score = latestFeedbackTopic.mastery_score ? Math.round(latestFeedbackTopic.mastery_score * 100) : null;
    
    let title = t('dashboard.feedback_eval_title', "Evaluasi Adaptive Learning");
    let message = t('dashboard.feedback_eval_msg', "Sistem mendeteksi tingkat pemahaman Anda.");
    
    if (action === "repeat") {
      title = t('dashboard.feedback_repeat_title', "Pemahaman Perlu Ditingkatkan");
      message = t('dashboard.feedback_repeat_msg', { score, defaultValue: `Skor penguasaan Anda pada materi terakhir adalah ${score}%. Sistem merekomendasikan Anda untuk mengulang materi yang disederhanakan. Silakan klik 'Lanjut Belajar' untuk memulai ulang.` });
    } else if (action === "review") {
      title = t('dashboard.feedback_review_title', "Sesi Review Ditambahkan");
      message = t('dashboard.feedback_review_msg', { score, defaultValue: `Skor penguasaan Anda pada materi terakhir adalah ${score}%. Agar pemahaman lebih kuat, sebuah topik Review khusus telah disisipkan ke dalam jadwal Anda.` });
    } else if (action === "accelerate") {
      title = t('dashboard.feedback_accel_title', "Anda Sangat Cepat!");
      message = t('dashboard.feedback_accel_msg', { score, defaultValue: `Skor penguasaan Anda adalah ${score}%. Anda memahami materi dengan sangat baik! Jadwal telah dipercepat untuk menyesuaikan kemampuan Anda.` });
    }

    return { title, message, action };
  }, [latestFeedbackTopic]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map(i => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-80 rounded-xl" />
          </div>
          <Skeleton className="h-80 rounded-xl" />
        </div>
      </div>
    );
  }

  const hasSession = activeSession?.id;

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="max-w-6xl mx-auto space-y-6 relative pb-8 md:pb-12"
    >
      {/* Decorative oversized serif numeral — the "dashboard page mark" */}
      <span
        aria-hidden="true"
        className="absolute -top-8 -right-2 deco-num deco-num-secondary hidden md:block"
      >
        ✦
      </span>
      {/* 1. Page header — greeting */}
      <motion.div variants={fadeUp}>
        <GreetingHero
          username={user?.username || 'Pelajar'}
          streak={streak}
          xp={xp}
        />
      </motion.div>

      {/* Feedback banner */}
      {showFeedback && feedbackData && (
        <motion.div variants={fadeUp}>
          <FeedbackBanner
            title={feedbackData?.title}
            message={feedbackData?.message}
            action={feedbackData?.action}
            isVisible={showFeedback && !!feedbackData}
            onDismiss={() => setShowFeedback(false)}
            onAction={() => {
              setShowFeedback(false);
              if (feedbackData?.action === 'repeat' && todayTopic) {
                navigate(`/module/${todayTopic.id}`);
              } else {
                navigate('/curriculum');
              }
            }}
          />
        </motion.div>
      )}

      {/* 2. Hero "Continue Learning" card */}
      <motion.div variants={fadeUp}>
        <ContinueLearningHero
          topic={todayTopic}
          session={activeSession}
          hasSession={hasSession}
          completedTopics={completedTopicsCount}
          totalTopics={topics.length}
        />
      </motion.div>

      {/* 3. Stats grid — 3 kolom (Streak dipindah ke StreakCard) */}
      <motion.div variants={fadeUp}>
        <StatCards stats={stats} />
      </motion.div>

      {/* 3a. Gamification — Streak Heatmap + Level/XP. The streak
          card is a richer version of the old "Streak Hari" stat
          (now 12 weeks of history + longest streak). The XP card
          is brand new and shows the user's level progression
          powered by the Mastery Score milestones. Both pull
          live data from /api/v1/gamification/* — no fake client
          computations, no stale values. */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
        <motion.div variants={fadeUp}>
          <StreakCard />
        </motion.div>
        <motion.div variants={fadeUp}>
          <XpCard />
        </motion.div>
      </div>

      {/* Analytics Charts */}
      {topics.length > 0 && (
        <LearningAnalytics topics={topics} quizHistory={quizHistory} sessionId={activeSession?.id} />
      )}

      {/* 4. Recent Activity — full width */}
      <motion.div variants={fadeUp}>
        <RecentActivity activities={activities} />
      </motion.div>
    </motion.div>
  );
}