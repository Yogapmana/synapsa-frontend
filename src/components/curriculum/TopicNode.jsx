import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, Play, Lock, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  completed: {
    icon: Check,
    pillClass: 'pill pill-success',
    label: 'Selesai',
    isClickable: true,
  },
  active: {
    icon: Play,
    pillClass: 'pill pill-info',
    label: 'Aktif',
    isClickable: true,
  },
  review: {
    icon: RefreshCw,
    pillClass: 'pill pill-warning',
    label: 'Perlu diulang',
    isClickable: true,
  },
  locked: {
    icon: Lock,
    pillClass: 'pill pill-danger',
    label: 'Terkunci',
    isClickable: false,
  },
}

export function TopicNode({ topic }) {
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()
  const config = STATUS_CONFIG[topic.status] ?? STATUS_CONFIG.locked
  const IconComponent = config.icon
  const isActive = topic.status === 'active'

  const handleClick = () => {
    if (config.isClickable) {
      navigate(`/module/${topic.id}`)
    }
  }

  const hoverProps =
    shouldReduceMotion || !config.isClickable
      ? {}
      : {
          whileHover: { y: -1 },
          whileTap: { scale: 0.98 },
        }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      onKeyDown={(e) => {
        // Enter is handled by button natively; handle Space for keyboard parity
        if (e.key === ' ' && config.isClickable) {
          e.preventDefault();
          handleClick();
        }
      }}
      disabled={!config.isClickable}
      aria-disabled={!config.isClickable}
      aria-label={
        config.isClickable
          ? `${config.label}: ${topic.title}. Buka modul.`
          : `${config.label}: ${topic.title}. Topik terkunci.`
      }
      title={topic.title}
      {...hoverProps}
      className={cn(
        'w-full text-left flex items-start gap-2.5 rounded-xl px-3 py-2.5 transition-colors',
        isActive && 'bg-tertiary/5 border-l-4 border-tertiary',
        !isActive && 'border-l-4 border-transparent',
        config.isClickable
          ? 'cursor-pointer hover:bg-bg-secondary focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2 focus-visible:outline-none'
          : 'cursor-not-allowed opacity-60'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center mt-0.5',
          topic.status === 'completed' && 'bg-success-light text-success',
          topic.status === 'active' && 'bg-info-light text-info',
          topic.status === 'review' && 'bg-warning-light text-warning',
          topic.status === 'locked' && 'bg-neutral text-secondary'
        )}
      >
        <IconComponent size={15} aria-hidden="true" />
      </div>

      <div className="flex-1 min-w-0">
        <h4
          className={cn(
            'text-sm font-semibold leading-snug',
            'line-clamp-2',
            topic.status === 'locked' ? 'text-secondary' : 'text-primary'
          )}
        >
          {topic.title}
        </h4>
        {topic.description && (
          <p
            title={topic.description}
            className="text-[11px] text-secondary mt-0.5 truncate"
          >
            {topic.description}
          </p>
        )}
      </div>

      <span className={cn('pill shrink-0 mt-0.5', config.pillClass)}>{config.label}</span>
    </motion.button>
  );
}