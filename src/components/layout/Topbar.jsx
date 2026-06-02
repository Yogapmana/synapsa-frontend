import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Flame, Moon, Sun, Search } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { useLearningStore } from '../../stores/learningStore';
import { cn } from '../../utils/cn';

const Topbar = () => {
  const { user } = useAuthStore();
  const { toggleSidebar } = useUIStore();
  const { streak = 0 } = useLearningStore() || {};
  const location = useLocation();

  const getBreadcrumb = () => {
    const path = location.pathname.split('/').filter(Boolean)[0] || 'dashboard';
    return path.charAt(0).toUpperCase() + path.slice(1).replace('-', ' ');
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[var(--border)] bg-surface/80 px-4 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-2 rounded-lg hover:bg-secondary/10 text-secondary transition-colors"
        >
          <Menu size={20} />
        </button>
        
        <div className="flex items-center gap-2 text-sm font-medium text-secondary">
          <span className="text-secondary/70">PLA</span>
          <span className="text-secondary/50">/</span>
          <span className="text-primary">{getBreadcrumb()}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-tertiary/10 text-tertiary border border-tertiary/20">
          <Flame size={16} fill="currentColor" />
          <span className="text-sm font-bold">{streak}</span>
        </div>

        <div className="h-8 w-[1px] bg-secondary/30 mx-1 hidden sm:block" />

        <button aria-label="Toggle dark mode" className="p-2 rounded-lg hover:bg-secondary/10 text-secondary transition-colors">
          <Moon size={20} />
        </button>

        <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-primary font-bold text-xs ring-2 ring-surface shadow-sm">
          {user?.username?.charAt(0) || 'U'}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
