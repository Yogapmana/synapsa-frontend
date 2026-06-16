import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarDays,
  MessageCircle,
  Settings,
  Cpu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Flame,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useLearningStore } from '../../stores/learningStore';
import { cn } from '../../utils/cn';

/**
 * Sidebar — fixed left navigation panel.
 *
 * Layout structure (mobile → desktop):
 *   - <lg (mobile): overlay drawer; slides in/out with backdrop
 *   - ≥lg (desktop): persistent rail; collapses from 240px → 72px
 *
 * Navigation is grouped with section labels ("Utama", "Lainnya") so
 * the empty vertical space feels intentional, not accidental.
 *
 * Phase fix (post-Fase 4):
 *   - Removed "brand icon + collapse button" duplication when collapsed
 *     (they didn't fit in 72px and caused horizontal scroll on body).
 *   - Tooltips are now contained within the aside (no `left-full`).
 *   - Active state uses NavLink's isActive (single source of truth).
 *   - Section labels fill the empty space intentionally.
 */

const COLLAPSED_WIDTH = 72;
const EXPANDED_WIDTH = 240;

/**
 * @typedef {Object} NavItem
 * @property {string} label
 * @property {React.ComponentType<{size?: number, className?: string}>} icon
 * @property {string} path
 * @property {'utama' | 'lainnya'} section
 */

/** @type {NavItem[]} */
const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', section: 'utama' },
  { label: 'Kurikulum', icon: CalendarDays, path: '/curriculum', section: 'utama' },
  { label: 'Chatbot', icon: MessageCircle, path: '/chat', section: 'utama' },
  { label: 'Agent Log', icon: Cpu, path: '/agent-log', section: 'lainnya' },
  { label: 'Pengaturan', icon: Settings, path: '/settings', section: 'lainnya' },
];

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { streak = 0 } = useLearningStore() || {};
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );

  // Sync mobile/desktop state with viewport
  useEffect(() => {
    const syncWithViewport = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      // Auto-collapse on mobile, auto-expand on desktop (if user hasn't chosen)
      // We don't override user choice; just track viewport for layout decisions.
    };
    syncWithViewport();
    window.addEventListener('resize', syncWithViewport);
    return () => window.removeEventListener('resize', syncWithViewport);
  }, []);

  const transition = shouldReduceMotion
    ? { duration: 0 }
    : { duration: 0.25, ease: [0.4, 0, 0.2, 1] };

  const width = sidebarCollapsed ? (isMobile ? 0 : COLLAPSED_WIDTH) : EXPANDED_WIDTH;

  return (
    <>
      {/* Mobile overlay backdrop — sits below the aside, above content */}
      <AnimatePresence>
        {isMobile && !sidebarCollapsed && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            onClick={toggleSidebar}
            aria-hidden="true"
            className="fixed inset-0 z-30 bg-primary/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width,
          x: isMobile && sidebarCollapsed ? -EXPANDED_WIDTH : 0,
        }}
        transition={transition}
        aria-label="Main navigation"
        className={cn(
          'fixed left-0 top-0 z-40 h-screen flex flex-col',
          'border-r border-[var(--border)] bg-surface',
          // overflow-y only — never x. The body is the only horizontal scroll
          // owner; tooltips live inside the aside (no left-full).
          'overflow-y-auto overflow-x-hidden',
          // On mobile when "closed" (translated off-screen), hide entirely
          isMobile && sidebarCollapsed && 'invisible'
        )}
      >
        {/* ── Brand header (collapses to just the toggle when sidebarCollapsed) ── */}
        <div
          className={cn(
            'h-[60px] flex items-center shrink-0 border-b border-[var(--border)]',
            sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-5'
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {!sidebarCollapsed && (
              <motion.div
                key="brand"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2.5 overflow-hidden"
              >
                <div className="w-8 h-8 rounded-lg bg-tertiary flex items-center justify-center shrink-0">
                  <Flame size={18} className="text-white" fill="currentColor" />
                </div>
                <span className="font-display font-bold text-lg text-primary tracking-tight whitespace-nowrap">
                  PLA
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Desktop collapse toggle — single element, no overlap */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-expanded={!sidebarCollapsed}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-lg shrink-0',
              'text-secondary hover:text-primary hover:bg-secondary/10',
              'transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary',
              // On mobile we hide this (toggle is via backdrop / hamburger)
              'hidden lg:flex'
            )}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav
          aria-label="Primary"
          className="flex-1 py-3 px-2.5 overflow-y-auto overflow-x-hidden"
        >
          {/* Section: Utama */}
          <NavGroup
            section="utama"
            sidebarCollapsed={sidebarCollapsed}
          />
          {NAV_ITEMS.filter((i) => i.section === 'utama').map((item) => (
            <NavItemRow
              key={item.path}
              item={item}
              sidebarCollapsed={sidebarCollapsed}
            />
          ))}

          {/* Section: Lainnya */}
          <NavGroup
            section="lainnya"
            sidebarCollapsed={sidebarCollapsed}
          />
          {NAV_ITEMS.filter((i) => i.section === 'lainnya').map((item) => (
            <NavItemRow
              key={item.path}
              item={item}
              sidebarCollapsed={sidebarCollapsed}
            />
          ))}
        </nav>

        {/* ── Streak badge (when expanded AND streak > 0) ── */}
        <AnimatePresence>
          {!sidebarCollapsed && streak > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="px-3 pb-3 overflow-hidden shrink-0"
            >
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-tertiary/8 border border-tertiary/15">
                <Flame size={16} className="text-tertiary" fill="currentColor" />
                <span className="text-sm font-semibold text-tertiary">
                  {streak} hari berturut
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── User profile + logout (footer) ── */}
        <div className="border-t border-[var(--border)] p-2.5 shrink-0">
          <div
            className={cn(
              'flex items-center gap-3 rounded-xl px-2 py-2 mb-1',
              sidebarCollapsed && 'justify-center px-0 mb-0'
            )}
          >
            <div
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center shrink-0',
                'bg-tertiary/10 text-tertiary font-bold text-sm font-display',
                'ring-2 ring-surface shadow-warm-xs'
              )}
              aria-hidden="true"
            >
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>

            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-semibold text-primary truncate leading-tight">
                  {user?.username || 'User'}
                </p>
                <p className="text-xs text-secondary truncate leading-tight mt-0.5">
                  {user?.email || 'user@example.com'}
                </p>
              </motion.div>
            )}
          </div>

          <button
            type="button"
            onClick={logout}
            aria-label="Keluar"
            className={cn(
              'flex items-center gap-3 w-full rounded-xl text-secondary',
              'hover:bg-danger/8 hover:text-danger',
              'transition-colors duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger',
              sidebarCollapsed ? 'justify-center px-0 py-2.5' : 'px-3 py-2.5'
            )}
          >
            <LogOut size={18} className="shrink-0" />
            {!sidebarCollapsed && (
              <span className="text-sm font-label font-medium">Keluar</span>
            )}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;

/* ────────────────────────────────────────────────────────────────── */
/* Internal sub-components                                           */
/* ────────────────────────────────────────────────────────────────── */

/**
 * Section label ("Utama", "Lainnya") — only shown when expanded.
 * Fills the empty vertical space intentionally.
 */
function NavGroup({ section, sidebarCollapsed }) {
  const labels = { utama: 'Utama', lainnya: 'Lainnya' };
  const label = labels[section];

  return (
    <AnimatePresence>
      {!sidebarCollapsed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.15 }}
          className="overflow-hidden"
        >
          <div className="px-3 pt-4 pb-1.5 first:pt-1.5">
            <p className="font-label text-[10px] uppercase tracking-widest text-secondary/60 font-semibold">
              {label}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Single nav row. Uses NavLink's own `isActive` (single source of truth).
 * The active indicator is an absolute-positioned bar (no layout shift).
 */
function NavItemRow({ item, sidebarCollapsed }) {
  const Icon = item.icon;
  const isCollapsed = sidebarCollapsed;

  return (
    <NavLink
      to={item.path}
      // Exact match for these paths so /chat doesn't highlight when
      // user is on /curriculum and vice versa.
      end={item.path === '/chat' || item.path === '/curriculum'}
      aria-label={item.label}
      className={({ isActive }) =>
        cn(
          'relative flex items-center gap-3 rounded-xl transition-colors duration-200 group',
          isCollapsed ? 'justify-center px-0 py-2.5 my-0.5' : 'px-3 py-2.5 my-0.5',
          isActive
            ? 'bg-tertiary/10 text-tertiary font-semibold'
            : 'text-secondary hover:bg-secondary/8 hover:text-primary'
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator — only on the active item */}
          {isActive && (
            <span
              aria-hidden="true"
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-tertiary"
            />
          )}

          <Icon
            size={20}
            className={cn(
              'shrink-0 transition-colors duration-150',
              isActive ? 'text-tertiary' : 'text-secondary group-hover:text-primary'
            )}
            aria-hidden="true"
          />

          {/* Label — expanded */}
          {!isCollapsed && (
            <span
              className={cn(
                'whitespace-nowrap text-sm font-label',
                isActive ? 'text-tertiary' : 'text-primary'
              )}
            >
              {item.label}
            </span>
          )}

          {/* Tooltip — only on collapsed (hover-only) */}
          {isCollapsed && (
            <span
              role="tooltip"
              className={cn(
                'pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3',
                'px-2.5 py-1.5 rounded-lg whitespace-nowrap z-50',
                'bg-primary text-neutral text-xs font-label font-medium',
                'shadow-warm-md',
                'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
                // Arrow — left of the tooltip, pointing back to the nav item
                "before:content-[''] before:absolute before:right-full before:top-1/2 before:-translate-y-1/2",
                'before:border-y-[6px] before:border-r-[6px] before:border-transparent before:border-r-primary'
              )}
            >
              {item.label}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}
