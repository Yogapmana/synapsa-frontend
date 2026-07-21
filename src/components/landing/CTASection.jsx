import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fadeUp, staggerContainer } from './motion'

export default function CTASection() {
  return (
    <section className="py-24 sm:py-32 bg-surface relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgb(var(--tertiary)) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="bg-surface rounded-[2.5rem] p-10 sm:p-14 md:p-20 shadow-warm-xl relative overflow-hidden ring-1 ring-border-subtle/50"
        >
          {/* Soft tertiary glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-tertiary/10 blur-[80px] rounded-full pointer-events-none" />

          <motion.div variants={fadeUp} className="relative z-10 flex justify-center mb-5">
            <span className="eyebrow">Mulai sekarang</span>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-primary leading-[1.08] tracking-tight relative z-10"
          >
            Siap belajar dengan cara yang
            <br className="hidden sm:block" />{' '}
            <span className="italic text-tertiary">lebih pintar?</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mt-5 text-lg sm:text-xl text-secondary font-serif-content leading-relaxed relative z-10 max-w-2xl mx-auto"
          >
            Buat akun gratis, tentukan topikmu, dan biarkan multi-agent Synapsa
            merancang kurikulum personal dalam hitungan menit.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col sm:flex-row gap-3 justify-center relative z-10"
          >
            <Link to="/register">
              <Button
                size="lg"
                variant="tertiary"
                className="w-full sm:w-auto px-8 py-6 text-base font-semibold rounded-xl shadow-warm-lg font-label tracking-wide group transition-all duration-300 hover:shadow-warm-xl hover:-translate-y-0.5"
              >
                Mulai Belajar Gratis
                <ArrowRight className="ml-2 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto px-8 py-6 text-base font-semibold rounded-xl border-2 font-label tracking-wide bg-surface/60 transition-all duration-300 hover:shadow-warm-md hover:-translate-y-0.5"
              >
                Sudah punya akun? Masuk
              </Button>
            </Link>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="mt-10 text-sm sm:text-base text-secondary/80 font-serif-content italic relative z-10 max-w-xl mx-auto"
          >
            “Belajar bukanlah tentang menghafal fakta, melainkan melatih pikiran
            untuk berpikir.” — Albert Einstein
          </motion.p>
        </motion.div>
      </div>
    </section>
  )
}
