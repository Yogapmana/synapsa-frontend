import { motion } from 'framer-motion'
import { fadeUp, staggerContainer, viewportOnce } from './motion'

const metrics = [
  { value: '87%', label: 'Kepuasan kuis adaptif' },
  { value: '7', label: 'Sumber materi' },
  { value: '5', label: 'Agent kolaboratif' },
]

export default function SocialProofSection() {
  return (
    <section className="py-24 sm:py-28 bg-neutral relative overflow-hidden shadow-[inset_0_1px_3px_rgba(58,41,22,0.04),inset_0_-1px_3px_rgba(58,41,22,0.04)]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-label uppercase tracking-widest text-secondary mb-4"
          >
            Bukti konsep
          </motion.p>
          <motion.p
            variants={fadeUp}
            className="text-2xl sm:text-3xl md:text-4xl font-display font-medium text-primary leading-snug tracking-tight max-w-3xl mx-auto"
          >
            “Synapsa dirancang untuk skripsi S1. Pengujian internal menunjukkan
            <span className="text-tertiary italic"> 87% </span>
            kepuasan pengguna pada kuis adaptif.”
          </motion.p>
          <motion.p
            variants={fadeUp}
            className="mt-5 text-sm text-secondary font-label"
          >
            — Sample data, skripsi 2026
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5"
          >
            {metrics.map((m) => (
              <div
                key={m.label}
                className="rounded-2xl bg-surface px-6 py-5 shadow-warm-sm ring-1 ring-border-subtle/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-warm-md"
              >
                <div className="font-display text-3xl sm:text-4xl font-bold text-tertiary tracking-tight">
                  {m.value}
                </div>
                <div className="mt-1.5 text-sm font-label text-secondary tracking-wide">
                  {m.label}
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="mt-12 signature-rule">
            <span>Quality you can feel</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
