import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Play, Lock, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * WeekCard (Compact Grid Redesign)
 */
function WeekCard({ week, topics, weekIndex, isActive, onClick }) {
  const shouldReduceMotion = useReducedMotion();
  
  const completedCount = topics.filter((t) => t.status === 'completed').length;
  const totalCount = topics.length;
  const allCompleted = totalCount > 0 && completedCount === totalCount;
  const allLocked = topics.length > 0 && topics.every((t) => t.status === 'locked');
  const isHero = isActive;

  const weekNumber = week.week_number ?? week.week ?? weekIndex + 1;
  const weekTitle = week.title ?? `Minggu ${weekNumber}`;
  const totalDurationMinutes = topics.reduce((sum, t) => sum + (t.duration_minutes || 0), 0);
  const totalDurationHours = (totalDurationMinutes / 60).toFixed(1);

  // Styling logic based on state
  const stateColorClass = isHero
    ? 'border-tertiary/40 bg-gradient-to-br from-tertiary/[0.02] to-transparent shadow-warm-md'
    : allCompleted
    ? 'border-success/30 bg-success/[0.02]'
    : 'border-info/30 bg-surface';

  const numberColorClass = isHero
    ? 'text-tertiary'
    : allCompleted
    ? 'text-success'
    : 'text-primary';

  // Make the entire card clickable if it's not locked
  const handleClick = () => {
    if (allLocked) return;
    if (onClick) onClick(week);
  };

  return (
    <motion.article
      variants={
        shouldReduceMotion
          ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
          : {
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0 },
            }
      }
      id={`week-${weekNumber}`}
      onClick={handleClick}
      className={cn(
        'relative rounded-[20px] p-5 border transition-all duration-300 flex flex-col',
        !allLocked && topics.length > 0 && 'cursor-pointer hover:-translate-y-1 hover:shadow-warm-lg',
        allLocked && 'cursor-not-allowed opacity-80',
        stateColorClass,
        isHero && 'ring-1 ring-tertiary/20 scale-[1.02]'
      )}
      style={{ minHeight: '160px' }}
    >
      {/* Header: Number and Status */}
      <div className="flex items-start justify-between mb-4">
        <span className={cn("font-display text-2xl font-bold leading-none", numberColorClass)}>
          {weekNumber}
        </span>
        
        <div className="flex items-center gap-1.5 uppercase font-label font-bold text-[9px] tracking-wider">
          {isHero ? (
            <span className="flex items-center gap-1 text-tertiary">
              <Play size={10} fill="currentColor" /> AKTIF
            </span>
          ) : allCompleted ? (
            <span className="flex items-center gap-1 text-success">
              <Check size={10} strokeWidth={3} /> SELESAI
            </span>
          ) : (
            <span className="flex items-center gap-1 text-secondary">
              <Lock size={10} /> TERKUNCI
            </span>
          )}
        </div>
      </div>

      {/* Middle: Title and decorative line */}
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="font-display font-bold text-primary text-base leading-snug line-clamp-2 mb-2">
          {weekTitle}
        </h3>
        
        {/* Progress decorative line */}
        <div className="w-10 h-1.5 rounded-full bg-border/40 overflow-hidden mb-2">
          <motion.div
            className={cn(
              "h-full rounded-full",
              isHero ? "bg-tertiary" : allCompleted ? "bg-success" : "bg-transparent"
            )}
            initial={{ width: 0 }}
            animate={{ width: isHero ? '50%' : allCompleted ? '100%' : '0%' }}
            transition={{ duration: 0.6 }}
          />
        </div>
      </div>

      {/* Footer: Topics count and Duration */}
      <div className="mt-4 flex items-center justify-between text-[11px] font-label text-secondary">
        <span>{completedCount}/{totalCount} topik</span>
        {totalCount > 0 && totalDurationHours > 0 && (
          <span className="flex items-center gap-1">
            <Clock size={11} aria-hidden="true" />
            <span>{totalDurationHours} jam</span>
          </span>
        )}
      </div>
    </motion.article>
  );
}

export default WeekCard;
