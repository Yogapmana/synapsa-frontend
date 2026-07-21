import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Menu,
  Flame,
  Search,
  Bell,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useLearningStore } from '../../stores/learningStore';
import { cn } from '../../utils/cn';
import { NotificationDropdown } from './NotificationDropdown';

/**
 * Topbar — global navigation bar.
 *
 * Phase 5.12 — softer, more integrated.
 *  - Removed solid `border-b`; replaced with a very subtle 1px
 *    bottom shadow (`shadow-[0_1px_0_rgba(58,41,22,0.05)]`) that
 *    reads as "ambient separation" rather than a hard line.
 *  - Background is `bg-neutral/60` (warmer cream wash) with
 *    `backdrop-blur-xl` for a true frosted-glass feel — picks up
 *    the page grain texture through the blur.
 *  - Search bar is now a frosted pill (no solid border) with
 *    `bg-white/40 backdrop-blur-sm border border-white/60` for
 *    that "soft ice" look common in modern design tools.
 *  - Avatar is more refined — drop the ring (replaced with subtle
 *    gradient bg) so it doesn't compete with the rest.
 *  - The vertical divider in the right cluster (`<div className=
 *    "h-6 w-px bg-[var(--border)]" />`) is replaced with a more
 *    subtle dot separator.
 */
const Topbar = () => {
  const { user } = useAuthStore();
  const { toggleSidebar } = useUIStore();
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
      settings: 'Pengaturan',
      onboarding: 'Onboarding',
    };
    return segments.map((seg) => labels[seg] || seg.replace(/-/g, ' '));
  };

  const breadcrumbs = getBreadcrumb();

  return (
    <header className="sticky top-0 z-30 flex h-[60px] w-full items-center justify-between bg-surface/90 backdrop-blur-xl px-4 lg:px-6 shadow-[0_1px_3px_rgba(58,41,22,0.06),0_1px_0_rgba(58,41,22,0.08)]">
      {/* Left section */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-xl text-secondary hover:text-primary hover:bg-secondary/10 transition-colors duration-200"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Breadcrumb — thinner, more elegant */}
        <nav
          className="flex items-center gap-1.5 text-sm min-w-0"
          aria-label="Breadcrumb"
        >
          <span className="font-display font-semibold text-tertiary shrink-0 tracking-tight">
            Synapsa
          </span>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {/* Slash separator — thinner than ChevronRight, more editorial */}
              <span
                className="text-secondary/30 shrink-0 text-xs select-none"
                aria-hidden="true"
              >
                /
              </span>
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
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Search bar — frosted glass pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/40 backdrop-blur-sm border border-white/60 text-secondary max-w-[220px] lg:max-w-[280px] transition-colors duration-200 hover:bg-white/60 focus-within:bg-white/70 focus-within:border-tertiary/30">
          <Search size={15} className="shrink-0 opacity-60" />
          <span className="text-sm truncate opacity-70">Cari modul, topik...</span>
          <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 rounded-md bg-primary/10 text-[10px] font-label text-secondary/70 ml-auto shrink-0 font-semibold">
            /
          </kbd>
        </div>

        {/* Streak badge */}
        {streak > 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-tertiary/10 border border-tertiary/15"
          >
            <Flame size={15} className="text-tertiary" fill="currentColor" />
            <span className="text-sm font-bold text-tertiary tabular-nums">
              {streak}
            </span>
          </motion.div>
        )}

        {/* Notification Dropdown */}
        <NotificationDropdown />

        {/* Subtle dot separator — softer than the previous solid line */}
        <span
          aria-hidden="true"
          className="h-1 w-1 rounded-full bg-secondary/30 hidden sm:inline-block mx-0.5"
        />

        {/* Avatar — refined with gradient + soft shadow, no ring */}
        <div
          className={cn(
            'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
            'bg-gradient-to-br from-tertiary/20 to-tertiary/5',
            'text-tertiary font-bold text-sm font-display',
            'shadow-warm-xs cursor-default',
            'ring-1 ring-tertiary/15'
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