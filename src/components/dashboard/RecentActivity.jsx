import React from 'react';
import { BookOpen, HelpCircle, MessageSquare, ChevronRight, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

const TYPE_CONFIG = {
  topic: {
    icon: BookOpen,
    colorClass: 'text-success-fg',
    bgClass: 'bg-success-light',
    pillClass: 'pill-success',
    defaultLabel: 'Selesai',
  },
  quiz: {
    icon: HelpCircle,
    colorClass: 'text-info-fg',
    bgClass: 'bg-info-light',
    pillClass: 'pill-info',
    defaultLabel: 'Kuis',
  },
  chat: {
    icon: MessageSquare,
    colorClass: 'text-warning-fg',
    bgClass: 'bg-warning-light',
    pillClass: 'pill-warning',
    defaultLabel: 'Chat',
  },
};

function getPillForScore(score) {
  if (score >= 90) return 'pill-success';
  if (score >= 75) return 'pill-info';
  if (score >= 60) return 'pill-warning';
  return 'pill-danger';
}

function getScoreLabel(score) {
  if (score >= 90) return 'Sangat Baik';
  if (score >= 75) return 'Baik';
  if (score >= 60) return 'Cukup';
  return 'Perlu Review';
}

export default function RecentActivity({ activities = [] }) {
  return (
    <div className="card-base overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-[var(--border)] flex justify-between items-center">
        <h3 className="text-lg font-display font-semibold text-primary">
          Aktivitas Terakhir
        </h3>
        {activities.length > 0 && (
          <Link
            to="/progress"
            className="text-sm font-medium text-tertiary hover:text-tertiary-dark transition-colors flex items-center gap-1"
          >
            Lihat semua
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {!activities.length ? (
          <div className="p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
              <Inbox className="w-6 h-6 text-secondary/60" />
            </div>
            <h4 className="font-display font-semibold text-primary text-lg">
              Belum ada aktivitas
            </h4>
            <p className="text-sm text-secondary mt-1.5 max-w-xs mx-auto">
              Mulai belajar untuk melihat riwayat aktivitasmu di sini.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {activities.map((activity, index) => {
              const { type, title, description, time, score } = activity;
              const config = TYPE_CONFIG[type] || TYPE_CONFIG.quiz;
              const Icon = config.icon;

              const pillClass = type === 'quiz' && score != null
                ? getPillForScore(score)
                : config.pillClass;
              const pillLabel = type === 'quiz' && score != null
                ? getScoreLabel(score)
                : config.defaultLabel;

              return (
                <div
                  key={activity.id || index}
                  className="flex items-start gap-3.5 p-4 hover:bg-surface/60 transition-colors group"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${config.bgClass}`}>
                    <Icon className={`w-4.5 h-4.5 ${config.colorClass}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-sm font-semibold text-primary truncate">
                        {title}
                      </p>
                      <span className="pill pill-info text-[10px] shrink-0">
                        {pillLabel}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-secondary truncate">
                        {description}
                      </p>
                      <span className="text-[11px] text-secondary/60 whitespace-nowrap shrink-0">
                        {time}
                      </span>
                    </div>
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