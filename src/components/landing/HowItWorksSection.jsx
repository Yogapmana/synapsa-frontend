import { motion } from 'framer-motion'
import { Target, Brain, BookOpen, GraduationCap } from 'lucide-react'
import { fadeUp, staggerContainer, viewportOnce } from './motion'

const steps = [
  {
    number: '01',
    title: 'Tentukan topik & target',
    description: 'Tulis topik, pilih level, durasi, dan jam belajar per hari.',
    icon: Target,
  },
  {
    number: '02',
    title: 'Planner merancang kurikulum',
    description: 'AI memecah topik menjadi sub-bab terstruktur dengan jadwal personal.',
    icon: Brain,
  },
  {
    number: '03',
    title: 'Riset & sintesis paralel',
    description: 'Researcher & Composer mencari materi dan menyusunnya menjadi modul.',
    icon: BookOpen,
  },
  {
    number: '04',
    title: 'Belajar, tanya, kuis',
    description: 'Baca modul, tanya Tutor AI kontekstual, dan uji pemahamanmu.',
    icon: GraduationCap,
  },
]

export default function HowItWorksSection() {
  return (
    <section id="cara-kerja" className="py-24 sm:py-32 bg-surface relative overflow-hidden scroll-mt-20">
      <span aria-hidden="true" className="deco-num bottom-12 left-[3%] hidden lg:block">
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
            <span className="eyebrow">Bab 02 — Cara Kerja</span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-4xl sm:text-5xl font-display font-bold text-primary leading-[1.05] tracking-tight"
          >
            Dari ide ke kurikulum
            <br className="hidden sm:block" />{' '}
            dalam <span className="italic text-tertiary">4 langkah</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mt-5 max-w-2xl mx-auto text-lg text-secondary leading-relaxed font-serif-content"
          >
            Pipeline multi-agent yang bekerja di belakang layar — transparan,
            terstruktur, dan siap dipakai dalam hitungan menit.
          </motion.p>
        </motion.div>

        <div className="relative">
          {/* Horizontal connector line on desktop */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-transparent via-tertiary/30 to-transparent"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.number}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="relative group"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-5">
                      <div className="flex size-24 items-center justify-center rounded-2xl bg-neutral shadow-warm-md ring-1 ring-border-subtle/40 transition-all duration-300 group-hover:shadow-warm-lg group-hover:-translate-y-1">
                        <Icon className="w-10 h-10 text-tertiary transition-transform duration-300 group-hover:scale-105" />
                      </div>
                      <div className="absolute -top-2 -right-2 flex size-9 items-center justify-center rounded-full bg-tertiary text-white font-display font-bold text-sm shadow-warm-md ring-4 ring-surface">
                        {step.number}
                      </div>
                    </div>
                    <h3 className="text-lg font-display font-semibold text-primary mb-2 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-sm text-secondary leading-relaxed font-serif-content max-w-[220px]">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
