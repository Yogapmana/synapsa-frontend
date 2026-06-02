import React from 'react';
import { BookOpen, HelpCircle, MessageSquare, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const TYPE_CONFIG = {
  topic: {
    icon: BookOpen,
    colorClass: 'text-tertiary',
    bgClass: 'bg-tertiary/5/10',
  },
  quiz: {
    icon: HelpCircle,
    colorClass: 'text-tertiary',
    bgClass: 'bg-secondary/10',
  },
  chat: {
    icon: MessageSquare,
    colorClass: 'text-tertiary',
    bgClass: 'bg-tertiary/10/10',
  },
};

export default function RecentActivity({ activities = [] }) {
  return (
    <div className="bg-surface rounded-2xl border border-[var(--border)] overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
        <h3 className="text-lg font-bold text-primary">
          Aktivitas Terakhir
        </h3>
        <Link 
          to="/progress" 
          className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
        >
          Lihat semua
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="p-2 flex-1 overflow-y-auto custom-scrollbar">
        {!activities.length ? (
          <div className="p-4 text-center text-sm text-secondary mt-4">
            Belum ada aktivitas.
          </div>
        ) : (
          <div className="flex flex-col">
            {activities.map((activity, index) => {
              const { type, title, description, time, id } = activity;
              const config = TYPE_CONFIG[type] || TYPE_CONFIG.topic;
              const Icon = config.icon;

              return (
                <div 
                  key={id || index}
                  className="flex items-start gap-4 p-4 hover:bg-surface rounded-xl transition-colors group cursor-default"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.bgClass}`}>
                    <Icon className={`w-5 h-5 ${config.colorClass}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p className="text-sm font-bold text-primary truncate">
                        {title}
                      </p>
                      <span className="text-xs text-secondary whitespace-nowrap shrink-0 mt-0.5">
                        {time}
                      </span>
                    </div>
                    <p className="text-sm text-secondary line-clamp-2">
                      {description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
