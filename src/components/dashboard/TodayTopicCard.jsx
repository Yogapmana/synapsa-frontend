import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { BookOpen, Clock, PlayCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

export default function TodayTopicCard({ topic }) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  if (!topic) {
    return (
      <div className="bg-surface rounded-2xl border border-dashed border-[var(--border)] p-8 flex flex-col items-center justify-center text-center h-full">
        <div className="w-16 h-16 bg-neutral/50 rounded-full flex items-center justify-center mb-4 text-secondary/70">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-primary mb-1">
          Tidak ada topik hari ini
        </h3>
        <p className="text-sm text-secondary max-w-sm">
          Kamu sudah menyelesaikan semua materi untuk hari ini. Waktu yang tepat untuk beristirahat!
        </p>
      </div>
    );
  }

  const { id, title, duration_minutes = 30, progress = 0 } = topic;

  const hoverProps = shouldReduceMotion ? {} : {
    whileHover: { y: -2, boxShadow: '0 8px 20px rgba(34,197,94,0.2)' },
  };

  return (
    <motion.div 
      {...hoverProps}
      className="bg-tertiary/5/10/5 rounded-2xl border border-tertiary/20 p-6 flex flex-col h-full relative overflow-hidden"
    >
      <div className=" rounded-full pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
          Topik Hari Ini
        </span>
      </div>
      
      <h3 className="text-2xl font-bold text-primary mb-2 leading-tight">
        {title}
      </h3>
      
      <div className="flex items-center gap-4 text-sm text-secondary mb-6 font-medium">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>~{duration_minutes} menit</span>
        </div>
      </div>
      
      <div className="mt-auto space-y-4">
        {progress > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-secondary">
              <span>Progress materi</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-secondary/10" indicatorClassName="bg-tertiary" />
          </div>
        )}
        
        <Button 
          onClick={() => navigate(`/module/${id}`)}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-6 text-base font-semibold shadow-sm transition-transform active:scale-[0.98]"
        >
          <PlayCircle className="w-5 h-5" />
          {progress > 0 ? 'Lanjutkan Belajar' : 'Mulai Belajar'}
        </Button>
      </div>
    </motion.div>
  );
}
