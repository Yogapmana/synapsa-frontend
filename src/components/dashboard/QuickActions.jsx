import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { HelpCircle, MessageSquare, BookOpen, Sparkles } from 'lucide-react';

const ACTIONS = [
  {
    id: 'quiz',
    label: 'Mulai Kuis',
    description: 'Uji pemahamanmu',
    icon: HelpCircle,
    bgClass: 'bg-info-light',
    iconClass: 'text-info-fg',
    path: '/learn',
    requiresSession: true,
  },
  {
    id: 'tutor',
    label: 'Tanya Tutor',
    description: 'Diskusi dengan AI',
    icon: MessageSquare,
    bgClass: 'bg-warning-light',
    iconClass: 'text-warning-fg',
    path: '/chat',
    requiresSession: true,
  },
  {
    id: 'curriculum',
    label: 'Lihat Kurikulum',
    description: 'Jadwal & silabus',
    icon: BookOpen,
    bgClass: 'bg-success-light',
    iconClass: 'text-success-fg',
    path: '/learn',
    requiresSession: true,
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function QuickActions({ hasSession }) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  const visibleActions = hasSession
    ? ACTIONS
    : ACTIONS.filter(a => !a.requiresSession);

  if (!visibleActions.length) return null;

  return (
    <div className="card-base overflow-hidden h-full flex flex-col">
      <div className="p-5 border-b border-[var(--border)]">
        <h3 className="text-lg font-display font-semibold text-primary">
          Aksi Cepat
        </h3>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="flex-1 p-3 space-y-2"
      >
        {!hasSession && (
          <motion.div variants={item} className="p-3 mb-2">
            <button
              onClick={() => navigate('/learn')}
              className="w-full card-base card-hover card-interactive p-4 flex items-center gap-3.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-tertiary" />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-primary group-hover:text-tertiary transition-colors">
                  Buat Kurikulum
                </div>
                <div className="text-xs text-secondary">
                  Mulai sesi belajar baru
                </div>
              </div>
            </button>
          </motion.div>
        )}

        {visibleActions.map((action) => {
          const Icon = action.icon;
          const hoverProps = shouldReduceMotion ? {} : {
            whileHover: { y: -2, transition: { type: 'spring', stiffness: 400, damping: 20 } },
          };
          const tapProps = shouldReduceMotion ? {} : {
            whileTap: { scale: 0.98 },
          };

          return (
            <motion.div key={action.id} variants={item} {...hoverProps} {...tapProps}>
              <button
                onClick={() => navigate(action.path)}
                className="w-full card-base card-hover card-interactive p-3.5 flex items-center gap-3 group text-left"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${action.bgClass}`}>
                  <Icon className={`w-4.5 h-4.5 ${action.iconClass}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-primary group-hover:text-tertiary transition-colors">
                    {action.label}
                  </div>
                  <div className="text-xs text-secondary truncate">
                    {action.description}
                  </div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}