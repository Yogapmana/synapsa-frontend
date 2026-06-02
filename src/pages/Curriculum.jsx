import React from 'react';
import { useActiveSession, useCurriculum, useTopics } from '@/hooks/useLearning';
import { CurriculumRoadmap } from '@/components/curriculum/CurriculumRoadmap';
import { Progress } from '@/components/ui/progress';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function Curriculum() {
  const { data: activeSession, isLoading: isLoadingSession } = useActiveSession();
  const sessionId = activeSession?.id;

  const { data: curriculumData, isLoading: isLoadingCurriculum } = useCurriculum(sessionId);
  const { data: topicsData, isLoading: isLoadingTopics } = useTopics(sessionId);

  const isLoading = isLoadingSession || isLoadingCurriculum || isLoadingTopics;

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!activeSession || !curriculumData || !topicsData) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center text-secondary">
        Belum ada kurikulum yang aktif.
      </div>
    );
  }

  const curriculumJson = curriculumData.curriculum_json || {};
  const rawWeeks = curriculumJson.weeks || [];
  const weeks = rawWeeks.map(w => ({
    ...w,
    week_number: w.week_number ?? w.week ?? 1
  }));
  const topics = Array.isArray(topicsData) ? topicsData : (topicsData.topics || []);

  const completedTopics = topics.filter(t => t.status === 'completed').length;
  const totalTopics = topics.length;
  const progressPercentage = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

  const completionDate = curriculumJson.estimated_completion_date 
    ? new Date(curriculumJson.estimated_completion_date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
    : 'Bulan Depan';

  return (
    <div className="container max-w-4xl py-10 px-4 md:px-8">
      <div className="mb-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">
            Kurikulum Pembelajaran
          </h1>
          <p className="text-secondary text-lg">
            {curriculumJson.title || activeSession.topic}
          </p>
        </div>

        <div className="bg-surface p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary mb-1">Total Progres</p>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-primary">{progressPercentage}%</span>
                <span className="text-secondary pb-1">({completedTopics}/{totalTopics} topik)</span>
              </div>
            </div>
            
            <Badge variant="secondary" className="px-3 py-1.5 bg-tertiary/5 text-secondary hover:bg-secondary/10 border-blue-100 font-medium">
              <Calendar className="w-4 h-4 mr-2" />
              Estimasi selesai: {completionDate}
            </Badge>
          </div>
          
          <Progress value={progressPercentage} className="h-3 rounded-full" />
        </div>
      </div>

      <CurriculumRoadmap weeks={weeks} topics={topics} />
    </div>
  );
}
