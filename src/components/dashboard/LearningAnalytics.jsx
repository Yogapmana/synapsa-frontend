import React, { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export default function LearningAnalytics({ topics, quizHistory }) {
  const { t } = useTranslation();

  // 1. Prepare Daily Study Time Data (Bar Chart)
  // Combines reading duration from completed topics and time spent from quizzes
  const studyTimeData = useMemo(() => {
    const dailyMap = {};

    // Process completed topics
    topics.forEach(topic => {
      if (topic.status === 'completed' && topic.completed_at) {
        try {
          const dateStr = format(parseISO(topic.completed_at), 'yyyy-MM-dd');
          if (!dailyMap[dateStr]) dailyMap[dateStr] = 0;
          dailyMap[dateStr] += topic.duration_minutes || 0;
        } catch (e) { /* ignore invalid dates */ }
      }
    });

    // Process quiz attempts
    quizHistory.forEach(quiz => {
      if (quiz.created_at) {
        try {
          const dateStr = format(parseISO(quiz.created_at), 'yyyy-MM-dd');
          if (!dailyMap[dateStr]) dailyMap[dateStr] = 0;
          dailyMap[dateStr] += Math.round((quiz.time_spent_seconds || 0) / 60);
        } catch (e) { /* ignore */ }
      }
    });

    // Sort by date and format for Recharts
    return Object.keys(dailyMap)
      .sort()
      .map(dateStr => {
        const dateObj = parseISO(dateStr);
        return {
          fullDate: dateStr,
          label: format(dateObj, 'd MMM', { locale: id }), // e.g. "12 Jun"
          minutes: dailyMap[dateStr],
        };
      })
      .slice(-7); // only show the last 7 active days
  }, [topics, quizHistory]);


  // 2. Prepare Mastery Progress Data (Line/Area Chart)
  const masteryData = useMemo(() => {
    // We only want completed topics that have a mastery_score
    const completedTopics = topics
      .filter(t => t.status === 'completed' && t.completed_at)
      .sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at));

    let masteryHistory = [];
    
    completedTopics.forEach(topic => {
      // Use short title for X-Axis (e.g. max 15 chars)
      let shortTitle = topic.title.length > 15 
        ? topic.title.substring(0, 15) + '...' 
        : topic.title;

      masteryHistory.push({
        name: shortTitle,
        fullTitle: topic.title,
        mastery: topic.mastery_score ? Math.round(topic.mastery_score * 100) : 0,
        quizScore: topic.quiz_score ? Math.round(topic.quiz_score * 100) : 0,
      });
    });

    // To prevent clutter, limit to last 10 topics
    return masteryHistory.slice(-10);
  }, [topics]);

  if (studyTimeData.length === 0 && masteryData.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      
      {/* Chart 1: Daily Study Time */}
      <div className="card-base p-6 flex flex-col h-full">
        <h3 className="text-lg font-bold text-primary mb-1">
          {t('analytics.study_time_title', 'Waktu Belajar Harian')}
        </h3>
        <p className="text-sm text-secondary mb-6">
          {t('analytics.study_time_desc', 'Durasi membaca modul dan pengerjaan kuis (7 hari terakhir)')}
        </p>
        
        <div className="flex-1 w-full min-h-[250px]">
          {studyTimeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyTimeData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6B7280' }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6B7280' }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`${value} menit`, 'Durasi']}
                  labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Bar 
                  dataKey="minutes" 
                  fill="#3B82F6" 
                  radius={[4, 4, 0, 0]} 
                  barSize={32}
                  name="Durasi"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Belum ada data belajar
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Mastery Progress */}
      <div className="card-base p-6 flex flex-col h-full">
        <h3 className="text-lg font-bold text-primary mb-1">
          {t('analytics.mastery_progress_title', 'Perkembangan Pemahaman')}
        </h3>
        <p className="text-sm text-secondary mb-6">
          {t('analytics.mastery_progress_desc', 'Tren skor mastery dan hasil kuis (10 topik terakhir)')}
        </p>
        
        <div className="flex-1 w-full min-h-[250px]">
          {masteryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={masteryData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#6B7280' }} 
                  dy={10} 
                />
                <YAxis 
                  domain={[0, 100]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#6B7280' }} 
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value, name) => [`${value}%`, name === 'mastery' ? 'Mastery' : 'Kuis']}
                  labelFormatter={(_, payload) => payload[0]?.payload.fullTitle || ''}
                  labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px', maxWidth: '200px', whiteSpace: 'normal' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line 
                  type="monotone" 
                  dataKey="mastery" 
                  name="Skor Mastery" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6 }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="quizScore" 
                  name="Skor Kuis" 
                  stroke="#8B5CF6" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-sm">
              Belum ada skor topik
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
