import React, { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarDays,
  BookOpen,
  MessageCircle,
  BarChart2,
  Settings,
  Cpu,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../utils/cn';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Kurikulum', icon: CalendarDays, path: '/curriculum' },
  { label: 'Modul Belajar', icon: BookOpen, path: '/modules' },
  { label: 'Chat Tutor', icon: MessageCircle, path: '/chat' },
  { label: 'Metrik', icon: BarChart2, path: '/metrics' },
  { type: 'separator' },
  { label: 'Agent Log', icon: Cpu, path: '/agent-log' },
  { label: 'Pengaturan', icon: Settings, path: '/settings' },
];

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const location = useLocation();
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && !sidebarCollapsed) toggleSidebar();
      if (window.innerWidth >= 1024 && sidebarCollapsed) toggleSidebar();
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarCollapsed, toggleSidebar]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '[' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  return (
    <>
      <AnimatePresence>
        {isMobile && !sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSidebar}
            className="fixed inset-0 z-30 bg-primary/20 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          width: sidebarCollapsed ? (isMobile ? 0 : 64) : 240,
          x: (isMobile && sidebarCollapsed) ? -240 : 0 
        }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          "fixed left-0 top-0 z-40 h-screen border-r border-[var(--border)] bg-surface flex flex-col",
          isMobile && sidebarCollapsed ? "invisible" : "visible"
        )}
      >
        <div className={cn(
          "h-14 flex items-center px-4 border-b border-secondary/30",
          sidebarCollapsed ? "justify-center" : "justify-between"
        )}>
          {!sidebarCollapsed && (
            <span className="font-bold text-xl text-primary tracking-tight">PLA System</span>
          )}
          <button
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "p-1.5 rounded-lg hover:bg-secondary/10 text-secondary transition-colors flex-shrink-0",
              sidebarCollapsed && "mx-auto"
            )}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-hide">
        {NAV_ITEMS.map((item, idx) => {
          if (item.type === 'separator') {
            return <div key={`sep-${idx}`} className="my-4 border-t border-secondary/30" />;
          }

          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-tertiary/10 text-tertiary font-medium" 
                  : "text-secondary hover:bg-secondary/10 hover:text-primary"
              )}
            >
              <Icon size={20} className={cn(isActive ? "text-tertiary" : "text-secondary group-hover:text-primary")} />
        {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
        {sidebarCollapsed && (
                <div className="absolute left-14 scale-0 group-hover:scale-100 transition-transform origin-left bg-primary text-neutral text-xs px-2 py-1 rounded-md whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-secondary/30 space-y-1">
        <div className={cn(
          "flex items-center gap-3 px-2 py-2 rounded-xl transition-all",
                sidebarCollapsed ? "justify-center" : ""
        )}>
          <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
            {user?.username?.charAt(0) || 'U'}
          </div>
            {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">{user?.username || 'User'}</p>
              <p className="text-xs text-secondary truncate">{user?.email || 'user@example.com'}</p>
            </div>
          )}
        </div>
        
        <button
          onClick={logout}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-xl text-secondary hover:bg-tertiary/10 hover:text-tertiary transition-all duration-200",
                sidebarCollapsed ? "justify-center" : ""
          )}
        >
          <LogOut size={20} />
            {!sidebarCollapsed && <span className="text-sm font-medium">Keluar</span>}
        </button>
      </div>
    </motion.aside>
  </>
  );
};

export default Sidebar;
