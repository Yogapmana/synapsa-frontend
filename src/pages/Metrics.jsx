import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserMetrics } from '@/api/progress';
import { useLearningStore } from '@/stores/learningStore';
import { BookOpen, Target, Flame, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Metrics() {
  const { activeSession } = useLearningStore();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!activeSession?.id) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const data = await getUserMetrics(activeSession.id);
        setMetrics(data);
      } catch (err) {
        setError('Failed to load metrics dashboard.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeSession?.id]);

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Progres Belajar</h1>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (!activeSession?.id || !metrics) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tight">Progres Belajar</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-muted-foreground">Belum ada data progres untuk sesi ini.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { topic_progress, quiz_metrics, streak_days, estimated_study_hours, weekly_progress } = metrics;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Progres Belajar</h1>
      </div>
      
      {error && <div className="text-red-500 bg-red-50 p-4 rounded-md">{error}</div>}

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Topik Selesai</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {topic_progress?.completed || 0} / {topic_progress?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {topic_progress?.percentage?.toFixed(1) || 0}% dari kurikulum
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Kuis</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(quiz_metrics?.average_score || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Dari {quiz_metrics?.total_quizzes || 0} kuis
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak Belajar</CardTitle>
            <Flame className="h-4 w-4 text-tertiary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{streak_days || 0} Hari</div>
            <p className="text-xs text-muted-foreground">Pertahankan semangatmu!</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estimasi Waktu</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(estimated_study_hours || 0).toFixed(1)} Jam
            </div>
            <p className="text-xs text-muted-foreground">Waktu belajar sejauh ini</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Progres Topik</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm mb-1">
                <span>Penyelesaian Keseluruhan</span>
                <span className="font-medium">{topic_progress?.percentage?.toFixed(1) || 0}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
                <div 
                  className="bg-primary h-4 transition-all duration-500" 
                  style={{ width: `${topic_progress?.percentage || 0}%` }}
                />
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-muted-foreground">Selesai</span>
                  <span className="font-bold">{topic_progress?.by_status?.completed || 0}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-muted-foreground">Sedang Dipelajari</span>
                  <span className="font-bold">{topic_progress?.by_status?.in_progress || 0}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-muted-foreground">Belum Mulai</span>
                  <span className="font-bold">{topic_progress?.by_status?.not_started || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Aktivitas Mingguan</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {weekly_progress && weekly_progress.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly_progress} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip 
                    cursor={{ fill: 'var(--accent)' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="completed" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Topik Selesai" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Belum ada aktivitas minggu ini
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
