import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Play, Lock, RefreshCw, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { AdaptiveBadge } from './AdaptiveBadge';

export function TopicNode({ topic }) {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  
  const statusStyles = {
    completed: {
      bg: 'bg-[#f0fdf4]',
      border: 'border-green-300',
      text: 'text-green-800',
      iconText: 'text-green-600',
      iconBg: 'bg-tertiary/10',
      icon: Check,
      label: 'Selesai',
      isClickable: true,
    },
    active: {
      bg: 'bg-[#eff6ff]',
      border: 'border-blue-300',
      text: 'text-blue-900',
      iconText: 'text-secondary',
      iconBg: 'bg-secondary/10',
      icon: Play,
      label: 'Sedang berjalan',
      isClickable: true,
    },
    review: {
      bg: 'bg-[#fefce8]',
      border: 'border-amber-300',
      text: 'text-primary',
      iconText: 'text-tertiary',
      iconBg: 'bg-amber-100',
      icon: RefreshCw,
      label: 'Perlu diulang',
      isClickable: true,
    },
    locked: {
      bg: 'bg-neutral opacity-60',
      border: 'border-[var(--border)]',
      text: 'text-secondary',
      iconText: 'text-secondary/70',
      iconBg: 'bg-neutral',
      icon: Lock,
      label: 'Terkunci',
      isClickable: false,
    }
  };

  const styleConfig = statusStyles[topic.status] || statusStyles.locked;
  const IconComponent = styleConfig.icon;

  const handleClick = () => {
    if (styleConfig.isClickable) {
      navigate(`/module/${topic.id}`);
    }
  };

  const hoverProps = shouldReduceMotion || !styleConfig.isClickable ? {} : {
    whileHover: { y: -2, boxShadow: '0 8px 20px rgba(34,197,94,0.2)' },
    whileTap: { scale: 0.98 }
  };

  const NodeContent = (
    <motion.div 
      onClick={handleClick}
      {...hoverProps}
      className={cn(
        "relative flex items-center gap-4 p-4 rounded-xl border transition-colors",
        styleConfig.bg,
        styleConfig.border,
        styleConfig.isClickable ? "cursor-pointer" : "cursor-not-allowed",
        topic.status === 'active' && "shadow-sm ring-1 ring-blue-300 ring-offset-1"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
        styleConfig.iconBg,
        styleConfig.iconText
      )}>
        <IconComponent className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-secondary uppercase tracking-wider">
          <span>Hari {topic.day_number}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {topic.duration_minutes} mnt
          </span>
          <AdaptiveBadge isRevised={topic.is_revised} />
        </div>
        <h4 className={cn("font-semibold text-base truncate", styleConfig.text)}>
          {topic.title}
        </h4>
      </div>

      <div className={cn(
        "hidden sm:flex items-center px-2.5 py-1 text-xs font-medium rounded-full border",
        styleConfig.text,
        styleConfig.border,
        "bg-secondary/10"
      )}>
        {styleConfig.label}
      </div>
    </motion.div>
  );

  if (topic.status === 'locked') {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <div className="w-full">
              {NodeContent}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Selesaikan topik sebelumnya terlebih dahulu</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return NodeContent;
}
