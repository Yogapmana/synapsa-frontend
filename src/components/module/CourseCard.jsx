import { Star, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { PLATFORM_COLORS } from '@/utils/constants'
import { motion, useReducedMotion } from 'framer-motion'

const PRICE_VARIANTS = {
  gratis: 'bg-tertiary/10 text-tertiary border-green-200',
  berbayar: 'bg-amber-100 text-tertiary border-amber-200',
  audit: 'bg-secondary/10 text-secondary border-blue-200',
}

function PlatformLogo({ platform }) {
  const color = PLATFORM_COLORS[platform?.toLowerCase()] || '#6b7280'
  return (
    <div
      className="flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white"
      style={{ backgroundColor: color }}
    >
      {platform?.slice(0, 2).toUpperCase() ?? '??'}
    </div>
  )
}

function RatingStars({ rating }) {
  if (rating == null) return null
  const full = Math.floor(rating)
  const hasHalf = rating - full >= 0.5

  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              'size-3.5',
              i < full
                ? 'fill-amber-400 text-amber-400'
                : i === full && hasHalf
                  ? 'fill-amber-400/50 text-amber-400'
                  : 'fill-none text-secondary/50',
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">{rating.toFixed(1)}</span>
    </div>
  )
}

export default function CourseCard({ course }) {
  const platform = course.platform?.toLowerCase() ?? ''
  const platformColor = PLATFORM_COLORS[platform] || '#6b7280'
  const priceClass = PRICE_VARIANTS[course.price_type] || PRICE_VARIANTS.gratis
  const shouldReduceMotion = useReducedMotion()

  const handleOpen = () => {
    if (course.url) {
      window.open(course.url, '_blank', 'noopener,noreferrer')
    }
  }

  const hoverProps = shouldReduceMotion ? {} : {
    whileHover: { y: -2, boxShadow: '0 8px 20px rgba(34,197,94,0.2)' },
    whileTap: { scale: 0.98 }
  }

  return (
    <motion.div
      {...hoverProps}
      className="course-card group relative cursor-pointer"
      style={{ '--platform-color': platformColor }}
      onClick={handleOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleOpen() }}
    >
      <div className="flex items-start gap-3">
        <PlatformLogo platform={course.platform} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">{course.title}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground capitalize">{course.platform}</span>
            {course.rating != null && <RatingStars rating={course.rating} />}
            {course.duration && (
              <span className="text-xs text-muted-foreground">{course.duration}</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge className={cn('text-[10px]', priceClass)}>
              {course.price_type || 'gratis'}
            </Badge>
            {course.section && (
              <Badge variant="outline" className="text-[10px]">
                Relevan: {course.section}
              </Badge>
            )}
          </div>
        </div>
        <ExternalLink className="mt-1 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
      </div>
    </motion.div>
  )
}
