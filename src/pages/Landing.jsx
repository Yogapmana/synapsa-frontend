import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  Brain,
  BookOpen,
  ChevronDown,
  Sparkles,
  Target,
  MessageSquare,
  CheckCircle2,
  GraduationCap,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import StatusBadge from '../components/common/StatusBadge';
import HeroIllustration from '../components/landing/HeroIllustration';

/* Phase 5.2 — Landing hero redesigned.
 * Aesthetic: "Editorial Warmth × Multi-Agent Intelligence"
 *   - Hero: signature book illustration with floating knowledge
 *     fragments replacing the literal agent-network diagram
 *   - Gradient mesh background, oversized italic serif numerals
 *     as background flourishes
 *   - 3 deep features (not 6 generic) with descriptive copy
 *   - Visual timeline for "How it works"
 *   - Social proof band (fictional for skripsi, marked as sample data)
 */

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.12 },
  },
};

function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden gradient-mesh-warm">
      {/* Decorative oversized serif numerals — background flourish */}
      <span aria-hidden="true" className="deco-num top-[8%] left-[3%] hidden md:block">
        ✦
      </span>
      <span aria-hidden="true" className="deco-num deco-num-secondary bottom-[5%] right-[5%] hidden md:block">
        ✦
      </span>

      {/* Background grid — subtle structure */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgb(var(--tertiary)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--tertiary)) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-20 pb-12">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-7"
        >
          {/* Eyebrow — the small editorial label above the headline */}
          <motion.div variants={fadeUp} className="flex justify-center">
            <span className="eyebrow">
              Personal Learning Agent
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold font-display text-primary leading-[0.92] tracking-tighter"
          >
            Belajar lebih
            <br />
            <span className="relative inline-block">
              <span className="relative z-10 italic text-tertiary">pintar,</span>
              <span
                aria-hidden="true"
                className="absolute bottom-[0.18em] left-0 right-0 h-[0.18em] bg-tertiary/15 -z-0 rounded-full"
              />
            </span>
            {' '}bukan
            <br />
            lebih keras.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="max-w-2xl mx-auto text-lg sm:text-xl text-secondary leading-relaxed font-serif-content"
          >
            PLA merancang kurikulum personal, mencari materi terkini
            dari internet, dan menyesuaikan kecepatan belajarmu secara
            <em className="font-display not-italic text-tertiary"> real-time </em>
            berdasarkan performamu.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link to="/register">
              <Button
                size="lg"
                variant="tertiary"
                className="px-8 py-6 text-base font-semibold rounded-xl shadow-warm-lg font-label tracking-wide group"
              >
                Mulai Belajar Gratis
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-base font-semibold rounded-xl border-2 font-label tracking-wide bg-surface/40 backdrop-blur-sm"
              >
                Sudah punya akun? Masuk
              </Button>
            </Link>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-2 text-sm text-secondary font-label"
          >
            {['Tanpa kartu kredit', 'Materi selalu terkini', 'Adaptif & personal'].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                {item}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Signature illustration */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 sm:mt-16 relative"
        >
          <HeroIllustration />
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        aria-hidden="true"
      >
        <ChevronDown className="w-5 h-5 text-secondary" />
      </motion.div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: 'Kurikulum yang adaptif',
      description:
        'Topik dan jadwalmu otomatis disesuaikan dengan performamu. Tidak ada kurikulum yang sama untuk semua orang — milikmu dibuat khusus untukmu.',
      accent: 'tertiary',
      number: '01',
    },
    {
      icon: BookOpen,
      title: 'Materi dari 7 sumber',
      description:
        'PLA mencari dari web, arXiv, Semantic Scholar, Wikipedia, YouTube, dan PDF. Modul belajar disusun dari sumber terbaik yang tersedia.',
      accent: 'success',
      number: '02',
    },
    {
      icon: MessageSquare,
      title: 'Tutor AI yang kontekstual',
      description:
        'Tanya apa saja tentang materi yang sedang kamu pelajari. Dengan RAG + HyDE + FlashRank, jawabannya spesifik ke modulmu — bukan generic.',
      accent: 'info',
      number: '03',
    },
  ];

  return (
    <section className="py-24 sm:py-32 bg-neutral relative overflow-hidden">
      {/* Decorative numerals — anchor the section */}
      <span aria-hidden="true" className="deco-num deco-num-secondary top-12 right-[5%] hidden lg:block">
        ✦
      </span>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUp} className="flex justify-center mb-4">
            <span className="eyebrow">Bab 01 — Fitur Utama</span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-4xl sm:text-5xl font-display font-bold text-primary leading-[1.05] tracking-tight"
          >
            Tiga hal yang membuat PLA
            <br className="hidden sm:block" />
            {' '}<span className="italic text-tertiary">berbeda</span>
          </motion.h2>
          <motion.p variants={fadeUp} className="mt-4 max-w-2xl mx-auto text-secondary">
            Bukan sekadar chatbot. PLA merancang, mencari, dan
            menyesuaikan — kamu tinggal fokus pada belajarmu.
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature) => {
            const Icon = feature.icon;
            const toneClasses = {
              tertiary: 'bg-tertiary/10 text-tertiary ring-tertiary/15',
              success: 'bg-success-light text-success-fg ring-success/20',
              info: 'bg-info-light text-info-fg ring-info/20',
            };
            return (
              <motion.div key={feature.title} variants={fadeUp} className="group">
                <Card className="relative h-full border border-[var(--border)] bg-surface shadow-warm-sm hover:shadow-warm-md transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  {/* Number watermark — top right of card */}
                  <span
                    aria-hidden="true"
                    className="absolute top-3 right-4 font-display text-5xl font-black italic text-tertiary/[0.08] leading-none"
                  >
                    {feature.number}
                  </span>
                  <CardContent className="relative p-7">
                    <div
                      className={`w-14 h-14 rounded-2xl ring-2 flex items-center justify-center mb-5 ${
                        toneClasses[feature.accent]
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-display font-semibold text-primary mb-3 leading-snug">
                      {feature.title}
                    </h3>
                    <p className="text-secondary leading-relaxed font-serif-content">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
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
  ];

  return (
    <section className="py-24 sm:py-32 bg-surface relative overflow-hidden">
      {/* Decorative numerals */}
      <span aria-hidden="true" className="deco-num bottom-12 left-[3%] hidden lg:block">
        ✦
      </span>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUp} className="flex justify-center mb-4">
            <span className="eyebrow">Bab 02 — Cara Kerja</span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-4xl sm:text-5xl font-display font-bold text-primary leading-[1.05] tracking-tight"
          >
            Dari ide ke kurikulum
            <br className="hidden sm:block" />
            {' '}dalam <span className="italic text-tertiary">4 langkah</span>
          </motion.h2>
        </motion.div>

        <div className="relative">
          {/* Horizontal connector line on desktop */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-transparent via-tertiary/30 to-transparent"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  variants={fadeUp}
                  className="relative"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-5">
                      <div className="flex size-24 items-center justify-center rounded-2xl bg-surface border-2 border-tertiary/20 shadow-warm-sm group-hover:border-tertiary/40 transition-colors">
                        <Icon className="w-10 h-10 text-tertiary" />
                      </div>
                      <div className="absolute -top-2 -right-2 flex size-9 items-center justify-center rounded-full bg-tertiary text-white font-display font-bold text-sm shadow-warm-md ring-4 ring-surface">
                        {step.number}
                      </div>
                    </div>
                    <h3 className="text-lg font-display font-semibold text-primary mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-secondary leading-relaxed font-serif-content">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialProofSection() {
  return (
    <section className="py-20 sm:py-24 bg-neutral border-y border-[var(--border)] relative overflow-hidden">
      {/* Signature rule decoration */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-xs font-label uppercase tracking-widest text-secondary mb-3">
          Bukti konsep
        </p>
        <p className="text-2xl sm:text-3xl font-display font-medium text-primary leading-snug max-w-3xl mx-auto">
          “PLA dirancang untuk skripsi S1. Pengujian internal menunjukkan
          <span className="text-tertiary italic"> 87% </span>
          kepuasan pengguna pada kuis adaptif.”
        </p>
        <p className="mt-4 text-sm text-secondary font-label">— Sample data, skripsi 2026</p>

        <div className="mt-10 signature-rule">
          <span>Quality you can feel</span>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 sm:py-32 bg-tertiary relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/5 blur-3xl"
      />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <h2 className="text-4xl sm:text-5xl font-display font-bold text-white leading-tight tracking-tight">
            Siap belajar lebih
            <span className="italic"> pintar</span>?
          </h2>
          <p className="mt-5 text-lg text-white/80 font-serif-content leading-relaxed">
            Buat akun gratis dan biarkan Planner Agent menyusun
            jalur belajar yang dipersonalisasi untukmu.
          </p>
          <div className="mt-8">
            <Link to="/register">
              <Button
                size="lg"
                className="px-10 py-6 text-base font-semibold rounded-xl shadow-warm-xl bg-white text-tertiary hover:bg-white/90 font-label tracking-wide"
              >
                Daftar Gratis Sekarang
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-primary text-secondary py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-tertiary p-2 rounded-xl">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-display font-bold text-white tracking-tight">PLA</span>
            <span className="text-xs text-secondary/60 font-label">v1.0</span>
          </div>
          <p className="text-sm font-label">
            Personal Learning Agent — Skripsi S1 · 2026
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-neutral texture-grain">
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md border-b border-[var(--border)]"
        aria-label="Main"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2.5 group" aria-label="PLA home">
              <div className="bg-tertiary p-2 rounded-xl transition-transform group-hover:scale-105">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-primary tracking-tight">
                PLA
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/login" className="hidden sm:block">
                <Button variant="ghost" className="text-secondary hover:text-primary font-label">
                  Masuk
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="tertiary"
                  className="font-label tracking-wide"
                >
                  Daftar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <SocialProofSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
