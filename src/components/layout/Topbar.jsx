import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Menu,
  Flame,
  Moon,
  Sun,
  Search,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useLearningStore } from '../../stores/learningStore';
import { cn } from '../../utils/cn';

const Topbar = () => {
  const { user } = useAuthStore();
  const { toggleSidebar, darkMode, toggleDarkMode } = useUIStore();
  const { streak = 0 } = useLearningStore() || {};
  const location = useLocation();

  const getBreadcrumb = () => {
    const segments = location.pathname.split('/').filter(Boolean);
    const labels = {
      dashboard: 'Dashboard',
      curriculum: 'Kurikulum',
      module: 'Modul',
      chat: 'Chat Tutor',
      quiz: 'Kuis',
      metrics: undefined,
      'agent-log': 'Agent Log',
      settings: 'Pengaturan',
      onboarding: 'Onboarding',
    };
    return segments.map((seg) => labels[seg] || seg.replace(/-/g, ' '));
  };

  const breadcrumbs = getBreadcrumb();

  return (
    <header className="sticky top-0 z-30 flex h-[60px] w-full items-center justify-between border-b border-[var(--border)] bg-surface/80 backdrop-blur-md px-4 lg:px-6">
      {/* Left section */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl text-secondary hover:text-primary hover:bg-secondary/10 transition-colors duration-150"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-sm min-w-0" aria-label="Breadcrumb">
          <span className="font-display font-semibold text-tertiary shrink-0">PLA</span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight size={14} className="text-secondary/40 shrink-0" />
              <span
                className={cn(
                  'truncate',
                  idx === breadcrumbs.length - 1
                    ? 'font-semibold text-primary'
                    : 'text-secondary'
                )}
              >
                {crumb}
              </span>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        {/* Search bar (dummy) */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/8 border border-[var(--border)] text-secondary max-w-[220px] lg:max-w-[280px]">
          <Search size={15} className="shrink-0 opacity-50" />
          <span className="text-sm truncate opacity-60">Cari modul, topik...</span>
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded-md bg-secondary/10 text-[10px] font-label text-secondary/60 ml-auto shrink-0">
            /
          </kbd>
        </div>

        {/* Streak badge */}
        {streak > 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-tertiary/10 border border-tertiary/20"
          >
            <Flame size={16} className="text-tertiary" fill="currentColor" />
            <span className="text-sm font-bold text-tertiary tabular-nums">{streak}</span>
          </motion.div>
        )}

        {/* Notification bell (dummy) */}
        <button
          className="relative p-2 rounded-xl text-secondary hover:text-primary hover:bg-secondary/10 transition-colors duration-150"
          aria-label="Notifikasi"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-tertiary ring-2 ring-surface" />
        </button>

        {/* Dark mode toggle */}
        <button
          aria-label="Toggle dark mode"
          onClick={toggleDarkMode}
          className="p-2 rounded-xl text-secondary hover:text-primary hover:bg-secondary/10 transition-colors duration-150"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Divider */}
        <div className="h-6 w-px bg-[var(--border)] hidden sm:block" />

        {/* Avatar */}
        <div
          className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
            'bg-tertiary/10 text-tertiary font-bold text-sm',
            'ring-2 ring-surface shadow-warm-xs',
            'cursor-default'
          )}
          aria-label={user?.username || 'User'}
        >
          {user?.username?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
};

export default Topbar;