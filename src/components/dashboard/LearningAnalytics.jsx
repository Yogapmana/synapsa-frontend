import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { getDailyStudyTime } from '../../api/progress';

export default function LearningAnalytics({ topics, quizHistory, sessionId }) {
  const { t } = useTranslation();

  // 1. Fetch actual daily study time from backend
  const { data: rawStudyTime = [] } = useQuery({
    queryKey: ['daily-study-time', sessionId],
    queryFn: () => getDailyStudyTime(sessionId, 30),
    enabled: !!sessionId,
    staleTime: 60_000,
  });

  // Format for chart — last 7 active days
  const studyTimeData = useMemo(() => {
    return rawStudyTime
      .map(entry => {
        const dateObj = parseISO(entry.date);
        return {
          fullDate: entry.date,
          label: format(dateObj, 'd MMM', { locale: idLocale }),
          reading: entry.reading_minutes,
          quiz: entry.quiz_minutes,
          total: entry.total_minutes,
        };
      })
      .slice(-7);
  }, [rawStudyTime]);


  // 2. Prepare Mastery Progress Data (Line Chart)
  const masteryData = useMemo(() => {
    const completedTopics = topics
      .filter(t => t.status === 'completed' && t.completed_at)
      .sort((a, b) => new Date(a.completed_at) - new Date(b.completed_at));

    let masteryHistory = [];
    
    completedTopics.forEach(topic => {
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

    return masteryHistory.slice(-10);
  }, [topics]);

  if (studyTimeData.length === 0 && masteryData.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
      
      {/* Chart 1: Daily Study Time (stacked bar: reading + quiz) */}
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
                  label={{ value: 'menit', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9CA3AF' } }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value, name) => {
                    const label = name === 'reading' ? 'Membaca Modul' : 'Mengerjakan Kuis';
                    return [`${value} menit`, label];
                  }}
                  labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Legend 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                  formatter={(value) => value === 'reading' ? 'Membaca Modul' : 'Kuis'}
                />
                <Bar 
                  dataKey="reading" 
                  stackId="study"
                  fill="#3B82F6" 
                  radius={[0, 0, 0, 0]} 
                  barSize={32}
                  name="reading"
                />
                <Bar 
                  dataKey="quiz" 
                  stackId="study"
                  fill="#8B5CF6" 
                  radius={[4, 4, 0, 0]} 
                  barSize={32}
                  name="quiz"
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
