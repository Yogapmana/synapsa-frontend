import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Lightbulb, Sparkles, ArrowRight, BookOpen, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * FeaturedStarter — an editorial "featured" card shown above the
 * 2×2 quick-action grid in the Chat empty state.
 *
 * Phase 5.9 addition — gives the empty state a clear "where to
 * start" anchor, breaking the symmetry of the previous
 * capability-badges + grid layout. Like the "Editor's Pick" in a
 * magazine, it's a slightly elevated card that suggests one good
 * way to get started.
 *
 * The prompt text is dynamic (per day of the week) so the page
 * feels alive across visits.
 */

const DAILY_PROMPTS = [
  {
    title: 'Pelajari konsep baru',
    prompt: 'Jelaskan konsep [Machine Learning] untuk pemula, sertakan 3 contoh penerapan di kehidupan sehari-hari',
    icon: Brain,
  },
  {
    title: 'Diskusi & second opinion',
    prompt: 'Saya sedang mempertimbangkan [topik/ide]. Tolong berikan perspektif pro dan kontranya secara seimbang',
    icon: BookOpen,
  },
  {
    title: 'Cari tahu topik terkini',
    prompt: 'Apa tren terbaru di [industri/bidang] tahun ini? Ringkas dalam 5 poin utama',
    icon: Sparkles,
  },
  {
    title: 'Belajar dengan contoh',
    prompt: 'Beri saya studi kasus nyata tentang [topik], lengkap dengan data dan analisisnya',
    icon: Lightbulb,
  },
  {
    title: 'Uji pemahaman',
    prompt: 'Buatkan kuis 5 soal pilihan ganda tentang [topik] yang sudah saya pelajari, beserta pembahasannya',
    icon: Brain,
  },
  {
    title: t('chat.start_from_scratch', 'Mulai dari nol'),
    prompt: 'Saya pemula di [topik]. Buat roadmap belajar 30 hari yang terstruktur dari fundamental hingga mahir',
    icon: BookOpen,
  },
  {
    title: 'Tanya dengan santai',
    prompt: 'Jelaskan [topik] dengan bahasa yang santai dan analogi dari kehidupan sehari-hari, supaya mudah dipahami',
    icon: Sparkles,
  },
]

function getDailyPrompt() {
  const day = new Date().getDay() // 0-6
  return DAILY_PROMPTS[day % DAILY_PROMPTS.length]
}

export default function FeaturedStarter({ onActionClick }) {
  const daily = getDailyPrompt()
  const Icon = daily.icon

  return (
    <motion.button
      type="button"
      onClick={() => onActionClick?.(daily.prompt)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className={cn(
        'group relative w-full max-w-2xl mx-auto text-left',
        'rounded-2xl border border-tertiary/25',
        'bg-gradient-to-br from-tertiary/[0.05] via-surface to-warning/[0.02]',
        'shadow-warm-sm hover:shadow-warm-md hover:border-tertiary/40',
        'transition-all duration-300 overflow-hidden',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary focus-visible:ring-offset-2'
      )}
    >
      {/* Decorative oversized numeral — editorial watermark */}
      <span
        aria-hidden="true"
        className="absolute -top-3 -right-2 font-display text-[5rem] font-black italic text-tertiary/[0.08] leading-none pointer-events-none select-none"
      >
        ✦
      </span>

      {/* Top accent line */}
      <div
        aria-hidden="true"
        className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-tertiary/40 to-transparent"
      />

      <div className="relative p-4 sm:p-5 flex items-center gap-4">
        {/* Icon — circular with glow */}
        <div className="relative shrink-0">
          <div className="absolute inset-0 bg-tertiary/15 blur-md rounded-full" />
          <div className="relative flex size-12 items-center justify-center rounded-2xl bg-tertiary/10 border-2 border-tertiary/25 text-tertiary">
            <Icon className="size-5" strokeWidth={2.2} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="inline-flex items-center gap-1 text-[9px] font-label uppercase tracking-widest text-tertiary font-bold">
              <Sparkles size={9} fill="currentColor" />
              Saran Hari Ini
            </span>
          </div>
          <h3 className="font-display font-semibold text-[15px] text-primary leading-tight mb-0.5">
            {daily.title}
          </h3>
          <p className="text-[12px] text-secondary line-clamp-1 font-serif-content italic">
            "{daily.prompt}"
          </p>
        </div>

        {/* CTA arrow */}
        <div className="flex size-9 items-center justify-center rounded-full bg-tertiary text-white shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-warm-sm">
          <ArrowRight
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-0.5"
          />
        </div>
      </div>
    </motion.button>
  )
}