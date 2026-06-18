import { cn } from '@/lib/utils'
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useLearningStore } from '../stores/learningStore';
import { getCurriculum, getTopics } from '../api/learning';
import { getQuizHistory } from '../api/quiz';
import { motion } from 'framer-motion';

import GreetingHero from '../components/dashboard/GreetingHero';
import { StatCards } from '../components/data/StatCards';
import RAGASWidget from '../components/data/RAGASWidget';
import { getRagasSummary } from '../api/chat';
import ContinueLearningHero from '../components/dashboard/ContinueLearningHero';
import RecentActivity from '../components/dashboard/RecentActivity';
import FeedbackBanner from '../components/dashboard/FeedbackBanner';
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
  const xp = (completedTopicsCount * 10) + ((streak || 0) * 5);

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
    {
      label: 'Streak Hari',
      value: streak || 0,
      subtext: streak > 0 ? 'Pertahankan!' : 'Mulai hari ini',
      icon: 'Flame',
      color: 'tertiary',
      sparkline: [1, 2, 3, 4, 5, 6, streak || 0].slice(-7),
      trend: streak > 0 ? 12 : null,
    },
    {
      label: 'Topik Selesai',
      value: completedTopicsCount,
      subtext: `dari ${topics.length || 0} total`,
      icon: 'BookOpen',
      color: 'success',
      sparkline: Array.from({ length: 7 }, (_, i) => Math.max(0, completedTopicsCount - (6 - i) * 0.5)),
      trend: completedTopicsCount > 0 ? 8 : null,
    },
    {
      label: 'Waktu Belajar',
      value: `${studyHoursThisWeek}j`,
      subtext: 'minggu ini',
      icon: 'Clock',
      color: 'warning',
      sparkline: [1.2, 1.8, 0.5, 2.4, 1.1, 2.0, studyHoursThisWeek || 0],
      trend: 15,
    },
    {
      label: 'Skor Kuis',
      value: avgQuizScore,
      subtext: `${quizHistory.length} kuis`,
      icon: 'Target',
      color: 'info',
      sparkline: [60, 70, 75, 80, 78, 85, avgQuizScore || 0],
      trend: avgQuizScore > 70 ? 6 : null,
    },
  ], [streak, completedTopicsCount, topics.length, studyHoursThisWeek, avgQuizScore, quizHistory.length]);

  const todayTopic = topics.find(t => t.status === 'active') ||
                      topics.find(t => t.status === 'locked' || !t.status);

  const activities = quizHistory.map(q => {
    const displayScore = q.score > 1 ? q.score : Math.round(q.score * 100);
    return {
      id: q.id,
      type: 'quiz',
      title: `Kuis: ${q.topic_title || 'Topik'}`,
      description: `Skor: ${displayScore} — ${Math.round((q.time_spent_seconds || 0) / 60)} menit`,
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
    
    let title = "Evaluasi Adaptive Learning";
    let message = `Sistem mendeteksi tingkat pemahaman Anda.`;
    
    if (action === "repeat") {
      title = "Pemahaman Perlu Ditingkatkan";
      message = `Skor penguasaan Anda pada materi terakhir adalah ${score}%. Sistem merekomendasikan Anda untuk mengulang materi yang disederhanakan. Silakan klik 'Lanjut Belajar' untuk memulai ulang.`;
    } else if (action === "review") {
      title = "Sesi Review Ditambahkan";
      message = `Skor penguasaan Anda pada materi terakhir adalah ${score}%. Agar pemahaman lebih kuat, sebuah topik Review khusus telah disisipkan ke dalam jadwal Anda.`;
    } else if (action === "accelerate") {
      title = "Anda Sangat Cepat!";
      message = `Skor penguasaan Anda adalah ${score}%. Anda memahami materi dengan sangat baik! Jadwal telah dipercepat untuk menyesuaikan kemampuan Anda.`;
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
      className="max-w-6xl mx-auto space-y-6 relative"
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

      {/* 3. Stats grid — 4 kolom */}
      <motion.div variants={fadeUp}>
        <StatCards stats={stats} />
      </motion.div>

      {/* 3b. RAGAS quality widget (RAG faithfulness + relevancy) */}
      {activeSession?.id && (
        <motion.div variants={fadeUp}>
          <RAGASWidget
            sessionId={activeSession.id}
            // widget fetches via the api directly — see RAGASWidget.jsx
          />
        </motion.div>
      )}

      {/* 4. Recent Activity — full width */}
      <motion.div variants={fadeUp}>
        <RecentActivity activities={activities} />
      </motion.div>
    </motion.div>
  );
}