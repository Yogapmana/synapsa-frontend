import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useUIStore } from '../../stores/uiStore';
import { cn } from '../../utils/cn';

const AppLayout = ({ children }) => {
  const { sidebarCollapsed } = useUIStore();
  const location = useLocation();

  const getMaxWidthClass = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'lg:max-w-[1280px]';
    if (path.includes('/modules')) return 'lg:max-w-[720px]';
    if (path.includes('/chat')) return 'lg:max-w-[900px]';
    return 'lg:max-w-[1024px]';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      
      <div 
        className={cn(
          "transition-all duration-250 ease-in-out min-h-screen flex flex-col",
           sidebarCollapsed ? "pl-0 lg:pl-16" : "pl-0 lg:pl-[240px]"
        )}
      >
        <Topbar />
        
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className={cn("mx-auto w-full", getMaxWidthClass())}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
