import React from 'react';
import { BookOpen, HelpCircle, MessageSquare, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const TYPE_CONFIG = {
  topic: {
    icon: BookOpen,
    colorClass: 'text-blue-500',
    bgClass: 'bg-blue-50 dark:bg-blue-500/10',
  },
  quiz: {
    icon: HelpCircle,
    colorClass: 'text-purple-500',
    bgClass: 'bg-purple-50 dark:bg-purple-500/10',
  },
  chat: {
    icon: MessageSquare,
    colorClass: 'text-orange-500',
    bgClass: 'bg-orange-50 dark:bg-orange-500/10',
  },
};

export default function RecentActivity({ activities = [] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
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
          <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
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
                  className="flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors group cursor-default"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.bgClass}`}>
                    <Icon className={`w-5 h-5 ${config.colorClass}`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate">
                        {title}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap shrink-0 mt-0.5">
                        {time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
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
