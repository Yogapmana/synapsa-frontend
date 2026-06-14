import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, PlayCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import StatusBadge from '../common/StatusBadge';

export default function ContinueLearningHero({ topic, session, hasSession, completedTopics, totalTopics }) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  if (!hasSession) {
    return (
      <div className="card-base p-8 md:p-10 bg-gradient-to-br from-tertiary/8 via-warning/5 to-transparent border-tertiary/20 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-tertiary/5 blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-36 h-36 rounded-full bg-warning/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <StatusBadge variant="info">Baru</StatusBadge>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-primary leading-tight">
              Mulai perjalanan belajarmu
            </h2>
            <p className="text-secondary max-w-lg leading-relaxed">
              Belum ada sesi aktif. Buat kurikulum pertamamu dan biarkan Planner Agent menyusun jalur belajar yang dipersonalisasi untukmu.
            </p>
            <div className="pt-2">
              <Button
                variant="tertiary"
                size="lg"
                className="gap-2 rounded-xl font-semibold"
                onClick={() => navigate('/learn')}
              >
                <Sparkles className="w-5 h-5" />
                Buat Kurikulum
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <div className="w-28 h-28 rounded-2xl bg-tertiary/10 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-tertiary" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="card-base p-8 md:p-10 bg-gradient-to-br from-tertiary/8 via-warning/5 to-transparent border-tertiary/20 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-tertiary/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <StatusBadge variant="success">Semua selesai</StatusBadge>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-primary leading-tight">
              Semua topik sudah selesai
            </h2>
            <p className="text-secondary max-w-lg leading-relaxed">
              Kamu sudah menyelesaikan semua materi yang tersedia. Waktu yang tepat untuk review atau memulai topik baru.
            </p>
            <div className="pt-2">
              <Button
                variant="tertiary"
                size="lg"
                className="gap-2 rounded-xl font-semibold"
                onClick={() => navigate('/learn')}
              >
                <Sparkles className="w-5 h-5" />
                Mulai Topik Baru
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <div className="w-28 h-28 rounded-2xl bg-success-light flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-success-fg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const progress = topic.progress || 0;
  const topicTitle = topic.title || 'Topik berikutnya';
  const durationMinutes = topic.duration_minutes || 30;

  const hoverProps = shouldReduceMotion ? {} : {
    whileHover: { y: -2 },
  };

  return (
    <motion.div
      {...hoverProps}
      className="card-base card-hover card-interactive p-6 md:p-8 bg-gradient-to-br from-tertiary/8 via-warning/5 to-transparent border-tertiary/20 relative overflow-hidden"
    >
      <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-tertiary/5 blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-warning/5 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge variant="warning">Lanjutkan</StatusBadge>
            {totalTopics > 0 && (
              <span className="text-xs font-label uppercase tracking-wider text-secondary">
                Topik {completedTopics + 1} dari {totalTopics}
              </span>
            )}
          </div>

          <h2 className="text-2xl md:text-3xl font-display font-bold text-primary leading-tight">
            {topicTitle}
          </h2>

          <div className="flex items-center gap-4 text-sm text-secondary">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              {durationMinutes} menit
            </span>
            {progress > 0 && (
              <span className="flex items-center gap-1.5 text-tertiary font-medium">
                {Math.round(progress)}% selesai
              </span>
            )}
          </div>

          {progress > 0 && (
            <div className="space-y-1.5 max-w-md">
              <Progress value={progress} className="h-2.5 bg-secondary/10" indicatorClassName="bg-tertiary" />
            </div>
          )}

          <div className="pt-1">
            <Button
              variant="tertiary"
              size="lg"
              className="gap-2 rounded-xl font-semibold"
              onClick={() => navigate(`/learn/${session?.id}/topic/${topic.id}`)}
            >
              <PlayCircle className="w-5 h-5" />
              {progress > 0 ? 'Lanjutkan Belajar' : 'Mulai Sekarang'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="hidden md:flex items-center justify-center">
          <div className="w-24 h-24 rounded-2xl bg-tertiary/10 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-tertiary" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}