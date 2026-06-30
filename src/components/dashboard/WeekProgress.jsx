import React from 'react';
import { CheckCircle2, Circle, CircleDashed } from 'lucide-react';
import { Progress } from '../ui/progress';
import { useTranslation } from 'react-i18next';

export default function WeekProgress({ weeks = [] }) {
  const { t } = useTranslation();
  if (!weeks.length) return null;

  return (
    <div className="bg-surface rounded-2xl border border-[var(--border)] p-6 flex flex-col h-full">
      <h3 className="text-lg font-bold text-primary mb-6">
        {t('dashboard.syllabus_progress', 'Progres Silabus')}
      </h3>
      
      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {weeks.map((week, index) => {
          const { id, title = t('dashboard.week_num', { num: index + 1, defaultValue: `Minggu ${index + 1}` }), status, progress = 0 } = week;
          
          let icon;
          let colorClass;
          let indicatorClass;
          let bgClass;
          
          switch (status) {
            case 'completed':
              icon = <CheckCircle2 className="w-5 h-5 text-tertiary" />;
              colorClass = 'text-tertiary';
              indicatorClass = 'bg-tertiary';
              bgClass = 'bg-tertiary/10';
              break;
            case 'active':
            case 'in-progress':
              icon = <CircleDashed className="w-5 h-5 text-tertiary animate-[spin_4s_linear_infinite]" />;
              colorClass = 'text-secondary';
              indicatorClass = 'bg-tertiary/50';
              bgClass = 'bg-secondary/10';
              break;
            case 'locked':
            case 'not-started':
            default:
              icon = <Circle className="w-5 h-5 text-secondary/50" />;
              colorClass = 'text-secondary';
              indicatorClass = 'bg-secondary';
              bgClass = 'bg-neutral';
              break;
          }

          return (
            <div key={id || index} className="group">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  {icon}
                  <span className={`font-semibold text-sm ${colorClass}`}>
                    {title}
                  </span>
                </div>
                <span className={`text-xs font-bold ${colorClass}`}>
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress 
                value={progress} 
                className={`h-2.5 ${bgClass}`} 
                indicatorClassName={indicatorClass} 
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
