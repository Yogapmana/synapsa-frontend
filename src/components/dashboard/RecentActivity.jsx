import React from 'react';
import { BookOpen, HelpCircle, MessageSquare, ChevronRight, Inbox, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

/**
 * RecentActivity — full-width activity feed for the dashboard.
 *
 * Phase 5.13 — redesigned for full width (QuickActions removed).
 *  - Wider, more breathable row layout with better visual hierarchy
 *  - Each row: colored icon chip → title + description → score badge → time
 *  - Score badge is a proper pill (not the default info pill)
 *  - Hover state: subtle bg + arrow indicator on the right
 *  - Empty state is more inviting
 *  - Header has an eyebrow label for editorial hierarchy
 */

const TYPE_CONFIG = {
  topic: {
    icon: BookOpen,
    colorClass: 'text-success-fg',
    bgClass: 'bg-success-light',
    defaultLabel: 'Selesai',
    labelKey: 'dashboard.done',
  },
  quiz: {
    icon: HelpCircle,
    colorClass: 'text-info-fg',
    bgClass: 'bg-info-light',
    defaultLabel: 'Kuis',
    labelKey: 'dashboard.quiz',
  },
  chat: {
    icon: MessageSquare,
    colorClass: 'text-warning-fg',
    bgClass: 'bg-warning-light',
    defaultLabel: 'Chat',
    labelKey: 'dashboard.chat',
  },
};

function getScoreConfig(score) {
  if (score >= 90) return { label: 'quiz.excellent', defaultLabel: 'Sangat Baik', class: 'pill-success' };
  if (score >= 75) return { label: 'quiz.good', defaultLabel: 'Baik', class: 'pill-info' };
  if (score >= 60) return { label: 'quiz.fair', defaultLabel: 'Cukup', class: 'pill-warning' };
  return { label: 'quiz.needs_review', defaultLabel: 'Perlu Review', class: 'pill-danger' };
}

export default function RecentActivity({ activities = [] }) {
  const { t } = useTranslation();
  return (
    <div className="card-base overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-5 flex justify-between items-center">
        <div>
          <p className="eyebrow !text-[10px] mb-1">{t('dashboard.history_activity', 'Riwayat · Aktivitas')}</p>
          <h3 className="text-lg font-display font-semibold text-primary">
            {t('dashboard.recent_activity', 'Aktivitas Terakhir')}
          </h3>
        </div>
        {activities.length > 0 && (
          <Link
            to="/progress"
            className="text-sm font-medium text-tertiary hover:text-tertiary-dark transition-colors flex items-center gap-1 group"
          >
            {t('dashboard.view_all', 'Lihat semua')}
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!activities.length ? (
          /* Empty state */
          <div className="p-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-secondary/50" strokeWidth={1.5} />
            </div>
            <h4 className="font-display font-semibold text-primary text-lg mb-1">
              {t('dashboard.no_activity', 'Belum ada aktivitas')}
            </h4>
            <p className="text-sm text-secondary mt-1 max-w-sm mx-auto leading-relaxed">
              {t('dashboard.no_activity_desc', 'Mulai belajar untuk melihat riwayat aktivitasmu di sini. Selesaikan modul atau ambil kuis untuk mulai mengisi riwayat.')}
            </p>
          </div>
        ) : (
          /* Activity list — wider rows with better hierarchy */
          <div className="divide-y divide-[rgba(58,41,22,0.06)]">
            {activities.map((activity, index) => {
              const { type, title, description, time, score, topicId } = activity;
              const config = TYPE_CONFIG[type] || TYPE_CONFIG.quiz;
              const Icon = config.icon;

              const scoreConfig =
                type === 'quiz' && score != null
                  ? getScoreConfig(score)
                  : { label: config.labelKey, defaultLabel: config.defaultLabel, class: 'pill-neutral' };

              const itemHref =
                type === 'quiz' && topicId
                  ? `/progress/topic/${encodeURIComponent(topicId)}`
                  : null;

              const content = (
                <>
                  {/* Icon chip */}
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                      config.bgClass
                    )}
                  >
                    <Icon className={cn('w-5 h-5', config.colorClass)} strokeWidth={2} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-primary truncate">
                        {title}
                      </p>
                      <span className={cn('pill text-[10px] shrink-0', scoreConfig.class)}>
                        {t(scoreConfig.label, scoreConfig.defaultLabel)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs text-secondary truncate">
                        {description}
                      </p>
                      <span className="text-[11px] text-secondary/50 whitespace-nowrap shrink-0 tabular-nums">
                        {time}
                      </span>
                    </div>
                  </div>

                  {/* Arrow indicator — only on hover, signals clickable */}
                  {itemHref && (
                    <ArrowRight
                      className="w-4 h-4 text-tertiary/0 group-hover:text-tertiary transition-all duration-200 shrink-0 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  )}
                </>
              );

              return itemHref ? (
                <Link
                  key={activity.id || index}
                  to={itemHref}
                  className="flex items-center gap-3.5 p-4 hover:bg-secondary/[0.04] transition-colors group"
                >
                  {content}
                </Link>
              ) : (
                <div
                  key={activity.id || index}
                  className="flex items-center gap-3.5 p-4 hover:bg-secondary/[0.04] transition-colors group"
                >
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}