import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/**
 * WelcomeHero — animated greeting shown in the Chat page's empty state.
 *
 * Phase 5.10 — simplified.
 *  - Single, large focal point (the sparkles icon) with a soft
 *    tertiary-colored glow.
 *  - Clean headline without editorial eyebrow or underline.
 *  - Standard chatbot greeting pattern.
 */
export default function WelcomeHero({ username }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="text-center max-w-xl mx-auto"
    >
      {/* Animated icon — single focal point with soft glow */}
      <div className="relative inline-flex items-center justify-center mb-5">
        <motion.div
          aria-hidden="true"
          animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.08, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-tertiary to-tertiary-light blur-xl"
        />
        <motion.div
          animate={{ scale: [1, 1.04, 1], rotate: [0, 2, -2, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-tertiary via-tertiary to-tertiary-dark flex items-center justify-center shadow-warm-md"
        >
          <Sparkles className="w-8 h-8 text-white" strokeWidth={2} />
        </motion.div>
      </div>

      {/* Greeting — clean headline */}
      <h1 className="font-display font-bold text-2xl md:text-3xl text-primary mb-2 tracking-tight leading-tight">
        Halo! Saya PLA Chatbot 👋
      </h1>

      {username && (
        <p className="text-secondary text-sm md:text-base mb-1.5">
          Senang bertemu dengan Anda,{' '}
          <span className="font-semibold text-primary">{username}</span>!
        </p>
      )}

      <p className="text-secondary text-sm md:text-base max-w-md mx-auto leading-relaxed">
        Tanyakan apa saja — saya bisa mencari info terbaru dari internet,
        merangkum dokumen, atau sekadar berdiskusi.
      </p>
    </motion.div>
  );
}