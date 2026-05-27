import React from 'react';
import { CheckCircle2, Circle, CircleDashed } from 'lucide-react';
import { Progress } from '../ui/progress';

export default function WeekProgress({ weeks = [] }) {
  if (!weeks.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full">
      <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
        Progres Silabus
      </h3>
      
      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {weeks.map((week, index) => {
          const { id, title = `Minggu ${index + 1}`, status, progress = 0 } = week;
          
          let icon;
          let colorClass;
          let indicatorClass;
          let bgClass;
          
          switch (status) {
            case 'completed':
              icon = <CheckCircle2 className="w-5 h-5 text-green-500" />;
              colorClass = 'text-green-700 dark:text-green-400';
              indicatorClass = 'bg-green-500';
              bgClass = 'bg-green-100 dark:bg-green-950/30';
              break;
            case 'active':
            case 'in-progress':
              icon = <CircleDashed className="w-5 h-5 text-blue-500 animate-[spin_4s_linear_infinite]" />;
              colorClass = 'text-blue-700 dark:text-blue-400';
              indicatorClass = 'bg-blue-500';
              bgClass = 'bg-blue-100 dark:bg-blue-950/30';
              break;
            case 'locked':
            case 'not-started':
            default:
              icon = <Circle className="w-5 h-5 text-gray-300 dark:text-gray-600" />;
              colorClass = 'text-gray-500 dark:text-gray-400';
              indicatorClass = 'bg-gray-400';
              bgClass = 'bg-gray-100 dark:bg-gray-800';
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
