import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useLearningStore } from '../stores/learningStore';
import { getSessions, getCurriculum, getTopics } from '../api/learning';
import { getQuizHistory } from '../api/quiz';

import GreetingHero from '../components/dashboard/GreetingHero';
import StatCards from '../components/dashboard/StatCards';
import TodayTopicCard from '../components/dashboard/TodayTopicCard';
import WeekProgress from '../components/dashboard/WeekProgress';
import FeedbackBanner from '../components/dashboard/FeedbackBanner';
import RecentActivity from '../components/dashboard/RecentActivity';
import { Skeleton } from '../components/ui/skeleton';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { activeSession, streak } = useLearningStore();
  
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    curriculum: null,
    topics: [],
    quizHistory: [],
    feedbackMessage: null,
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
            feedbackMessage: activeSession?.feedback_action || null,
          });
        }
      } catch {
        setData({ curriculum: null, topics: [], quizHistory: [], feedbackMessage: null });
      } finally {
        setLoading(false);
      }
    }
    
    loadDashboardData();
  }, [activeSession]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="space-y-8">
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const { curriculum, topics, quizHistory, feedbackMessage } = data;
  
  const completedTopicsCount = topics.filter(t => t.status === 'completed').length;
  let xp = (completedTopicsCount * 10) + (streak * 5);
  
  let totalQuizScore = 0;
  quizHistory.forEach(q => {
    const scoreValue = q.score > 1 ? q.score : q.score * 100;
    totalQuizScore += scoreValue;
    if (scoreValue >= 90) xp += 30;
    else if (scoreValue >= 75) xp += 20;
    else xp += 5;
  });
  
  const avgQuizScore = quizHistory.length > 0
    ? Math.round(quizHistory.reduce((sum, q) => {
      const scoreVal = q.score > 1 ? q.score : q.score * 100;
      return sum + scoreVal;
    }, 0) / quizHistory.length)
    : 0;
  
  const stats = [
    { label: 'Topik Selesai', value: `${completedTopicsCount}/${topics.length || 0}`, subtext: 'Dari total silabus' },
    { label: 'Rata-rata Kuis', value: avgQuizScore, subtext: `${quizHistory.length} kuis diambil` },
    { label: 'Materi Dikurasi', value: topics.length || 0, subtext: 'Disusun oleh Planner' },
    { label: 'Streak Hari', value: streak || 0, subtext: 'Pertahankan!' },
  ];

  const todayTopic = topics.find(t => t.status === 'active') || 
                     topics.find(t => t.status === 'locked' || !t.status);

  const weeks = topics.reduce((acc, topic, i) => {
    const weekIdx = topic.week_number ? topic.week_number - 1 : Math.floor(i / 3);
    if (!acc[weekIdx]) {
      acc[weekIdx] = {
        id: `week-${weekIdx}`,
        title: `Minggu ${weekIdx + 1}`,
        topics: [],
        status: 'not-started',
      };
    }
    acc[weekIdx].topics.push(topic);
    return acc;
  }, []).map(week => {
    const completed = week.topics.filter(t => t.status === 'completed').length;
    const active = week.topics.some(t => t.status === 'active');
    const progress = (completed / week.topics.length) * 100;
    
    return {
      ...week,
      progress,
      status: completed === week.topics.length ? 'completed' : active || completed > 0 ? 'active' : 'not-started'
    };
  });

  const activities = quizHistory.map(q => {
    const displayScore = q.score > 1 ? q.score : Math.round(q.score * 100);
    return {
      id: q.id,
      type: 'quiz',
      title: `Kuis: ${q.topic_title || 'Topik'}`,
      description: `Skor: ${displayScore} - Waktu: ${Math.round(q.time_spent_seconds / 60)} menit`,
      time: new Date(q.created_at || Date.now()).toLocaleDateString('id-ID'),
    };
  }).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <GreetingHero 
        username={user?.username || 'Pelajar'} 
        streak={streak} 
        xp={xp} 
      />
      
      <FeedbackBanner 
        message={feedbackMessage} 
        isVisible={showFeedback && !!feedbackMessage}
        onDismiss={() => setShowFeedback(false)}
      />

      <StatCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8 flex flex-col">
          <div className="flex-1">
            <TodayTopicCard topic={todayTopic} />
          </div>
        </div>

        <div className="space-y-8 flex flex-col">
          <div className="h-[300px]">
            <WeekProgress weeks={weeks} />
          </div>
          <div className="h-[350px]">
            <RecentActivity activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
}
