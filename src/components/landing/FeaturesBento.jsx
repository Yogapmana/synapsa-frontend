import { motion } from 'framer-motion'
import {
  Brain,
  BookOpen,
  MessageSquare,
  Network,
  PenLine,
  ClipboardCheck,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import ConceptGraphWireframe from './ConceptGraphWireframe'
import { fadeUp, staggerContainer, viewportOnce } from './motion'
import { cn } from '@/lib/utils'

const toneClasses = {
  tertiary: 'bg-tertiary/10 text-tertiary ring-tertiary/15',
  success: 'bg-success-light text-success-fg ring-success/20',
  info: 'bg-info-light text-info-fg ring-info/20',
  warning: 'bg-warning-light text-warning-fg ring-warning/20',
}

function BentoCard({
  icon: Icon,
  title,
  description,
  number,
  accent = 'tertiary',
  className,
  children,
  large = false,
}) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn(
        // Only stretch to fill on lg bento; avoid empty vertical space on mobile
        'group h-auto lg:h-full',
        className,
      )}
    >
      <Card
        className={cn(
          'relative h-auto lg:h-full border-none bg-surface shadow-warm-md overflow-hidden',
          'transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-lg',
        )}
      >
        <span
          aria-hidden="true"
          className="absolute top-3 right-4 font-display text-5xl font-black italic text-tertiary/[0.08] leading-none pointer-events-none"
        >
          {number}
        </span>
        <CardContent
          className={cn(
            'relative flex flex-col',
            large ? 'p-6 sm:p-8' : 'p-5 sm:p-7',
          )}
        >
          <div
            className={cn(
              'rounded-2xl ring-2 flex items-center justify-center mb-4 sm:mb-5 transition-transform duration-300 group-hover:scale-105',
              large ? 'w-14 h-14' : 'w-12 h-12',
              toneClasses[accent],
            )}
          >
            <Icon className={large ? 'w-6 h-6' : 'w-5 h-5'} />
          </div>
          <h3
            className={cn(
              'font-display font-semibold text-primary leading-snug mb-2',
              large ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl',
            )}
          >
            {title}
          </h3>
          <p className="text-secondary leading-relaxed font-serif-content text-sm sm:text-[0.95rem]">
            {description}
          </p>
          {children && <div className="mt-5 sm:mt-6">{children}</div>}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function FeaturesBento() {
  return (
    <section id="fitur" className="py-24 sm:py-32 bg-neutral relative overflow-hidden scroll-mt-20">
      <span
        aria-hidden="true"
        className="deco-num deco-num-secondary top-12 right-[5%] hidden lg:block"
      >
        ✦
      </span>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={viewportOnce}
          variants={staggerContainer}
          className="text-center mb-16 sm:mb-20"
        >
          <motion.div variants={fadeUp} className="flex justify-center mb-4">
            <span className="eyebrow">Bab 01 — Fitur Utama</span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-4xl sm:text-5xl font-display font-bold text-primary leading-[1.05] tracking-tight"
          >
            Platform yang membuat belajar
            <br className="hidden sm:block" />{' '}
            <span className="italic text-tertiary">terasa cerdas</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-2xl mx-auto text-lg text-secondary leading-relaxed font-serif-content"
          >
            Bukan sekadar chatbot. Multi-agent Synapsa merancang, mencari,
            memetakan, dan menguji — kamu tinggal fokus pada belajarmu.
          </motion.p>
        </motion.div>

        {/* Bento grid — natural row heights on mobile; equal fill only on lg */}
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 items-start lg:items-stretch lg:auto-rows-fr"
        >
          <BentoCard
            icon={PenLine}
            title="Composer Agent"
            description="Researcher & Composer bekerja paralel: mencari dari 7 sumber, lalu menyusun modul terstruktur yang siap dibaca — bukan sekadar daftar tautan."
            number="01"
            accent="tertiary"
            large
            className="lg:col-span-2"
          >
            <div className="flex flex-wrap gap-2">
              {['web', 'arXiv', 'Scholar', 'Wikipedia', 'YouTube', 'PDF'].map((src) => (
                <span
                  key={src}
                  className="inline-flex items-center rounded-full bg-tertiary/8 text-tertiary px-2.5 py-1 text-[11px] font-label font-medium uppercase tracking-wider ring-1 ring-tertiary/15 transition-colors duration-300 group-hover:bg-tertiary/12"
                >
                  {src}
                </span>
              ))}
            </div>
          </BentoCard>

          <BentoCard
            icon={Network}
            title="Concept Graph"
            description="Kurikulummu dipetakan sebagai graf konsep terhubung — lihat relasi antar topik, prasyarat, dan progres secara visual."
            number="02"
            accent="info"
            className="lg:row-span-2"
          >
            <div className="rounded-xl bg-surface-2/60 ring-1 ring-border-subtle/40 p-2 -mx-0.5 overflow-hidden">
              <ConceptGraphWireframe
                compact
                animated={false}
                className="opacity-90 max-w-[280px] sm:max-w-none mx-auto"
              />
            </div>
          </BentoCard>

          <BentoCard
            icon={ClipboardCheck}
            title="Dynamic Quizzes"
            description="Kuis adaptif menyesuaikan tingkat kesulitan dari performamu. Feedback Engine menutup celah pemahaman secara real-time."
            number="03"
            accent="success"
          />

          <BentoCard
            icon={MessageSquare}
            title="Tutor AI Kontekstual"
            description="Tanya apa saja tentang modul yang sedang dipelajari. RAG + HyDE + FlashRank membuat jawaban spesifik — bukan generik."
            number="04"
            accent="warning"
          />
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-4 sm:mt-5"
        >
          <Card className="border-none bg-surface shadow-warm-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-lg group">
            <CardContent className="p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
              <div className="w-12 h-12 shrink-0 rounded-2xl ring-2 bg-tertiary/10 text-tertiary ring-tertiary/15 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <Brain className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg sm:text-xl font-display font-semibold text-primary">
                    Kurikulum yang adaptif
                  </h3>
                  <span
                    aria-hidden="true"
                    className="font-display text-2xl font-black italic text-tertiary/[0.12] leading-none hidden sm:inline"
                  >
                    05
                  </span>
                </div>
                <p className="text-secondary leading-relaxed font-serif-content text-sm sm:text-base">
                  Topik dan jadwal otomatis disesuaikan dengan performamu.
                  Tidak ada kurikulum yang sama untuk semua orang — milikmu dibuat khusus untukmu.
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2 shrink-0">
                <BookOpen className="w-4 h-4 text-secondary/50" />
                <span className="text-xs font-label uppercase tracking-widest text-secondary/60">
                  Planner Agent
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
