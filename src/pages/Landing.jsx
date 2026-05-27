import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, BookOpen, Users, Zap, ChevronDown, Sparkles, Clock, Target, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-50 via-white to-emerald-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-200 rounded-full opacity-20 blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="space-y-8"
        >
          <motion.div variants={fadeInUp} className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Personal Learning</span>
            </div>
          </motion.div>

          <motion.h1
            variants={fadeInUp}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-slate-900 leading-tight"
          >
            Belajar Lebih Pintar dengan
            <span className="block text-primary-600">Tim Pengajar Privat AI</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600"
          >
            PLA merancang kurikulum personal, mencari materi terkini dari internet,
            dan menyesuaikan kecepatan belajar Anda secara real-time berdasarkan performa.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/register">
              <Button size="lg" className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-green">
                <span>Mulai Belajar Gratis</span>
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg font-semibold rounded-xl border-2 border-slate-200 hover:border-primary-300">
                Masuk
              </Button>
            </Link>
          </motion.div>

          <motion.div variants={fadeInUp} className="flex items-center justify-center gap-8 pt-8 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Tanpa kartu kredit</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Materi selalu terkini</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>Adaptif & personal</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-16 relative"
        >
          <div className="relative mx-auto max-w-4xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-4 text-sm text-slate-500 font-medium">Dashboard PLA</span>
            </div>
            <div className="bg-slate-50 h-64 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="flex justify-center gap-4">
                  {['Planner', 'Researcher', 'Composer', 'Tutor'].map((agent, i) => (
                    <div
                      key={agent}
                      className="px-4 py-2 rounded-xl text-sm font-medium"
                      style={{
                        backgroundColor: ['#8b5cf6', '#f97316', '#ec4899', '#3b82f6'][i] + '20',
                        color: ['#8b5cf6', '#f97316', '#ec4899', '#3b82f6'][i],
                      }}
                    >
                      {agent}
                    </div>
                  ))}
                </div>
                <p className="text-slate-600 font-medium">5 AI Agent bekerja sama untuk Anda</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="w-6 h-6 text-slate-400" />
      </motion.div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      color: 'bg-violet-100 text-violet-600',
      title: 'Kurikulum Adaptif',
      description: 'Topik dan jadwal disesuaikan berdasarkan performa belajar Anda secara real-time.',
    },
    {
      icon: BookOpen,
      color: 'bg-orange-100 text-orange-600',
      title: 'Materi Terkini',
      description: 'PLA mencari dan menyintesis materi dari internet, academic papers, dan video YouTube.',
    },
    {
      icon: MessageSquare,
      color: 'bg-blue-100 text-blue-600',
      title: 'Tutor AI Interaktif',
      description: 'Tanya apa saja tentang materi yang sedang dipelajari dengan chat RAG berbasis konteks.',
    },
    {
      icon: Target,
      color: 'bg-pink-100 text-pink-600',
      title: 'Kuis Adaptif',
      description: 'Soal pilihan ganda yang disesuaikan level dengan feedback langsung per jawaban.',
    },
    {
      icon: Users,
      color: 'bg-emerald-100 text-emerald-600',
      title: 'Multi-Sumber',
      description: 'Web, arXiv, Semantic Scholar, Wikipedia, YouTube, dan PDF dalam satu platform.',
    },
    {
      icon: Zap,
      color: 'bg-amber-100 text-amber-600',
      title: 'Cepat & Efisien',
      description: 'Generate kurikulum dalam hitungan detik dengan parallel processing agent.',
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.span variants={fadeInUp} className="text-primary-600 font-semibold text-sm uppercase tracking-wider">
            Fitur Unggulan
          </motion.span>
          <motion.h2 variants={fadeInUp} className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900">
            Tudo que você precisa para aprender
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Sistem multi-agent yang bekerja sama layaknya tim pengajar privat yang paham kebutuhan Anda.
          </motion.p>
        </motion.div>

        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <motion.div key={feature.title} variants={fadeInUp}>
              <Card className="h-full border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      title: 'Masukkan Topik & Preferensi',
      description: 'Tulis topik yang ingin dipelajari, tentukan durasi, level, dan jam belajar per hari.',
      icon: Target,
    },
    {
      number: '02',
      title: 'AI Merancang Kurikulum',
      description: 'Planner Agent memecah topik menjadi sub-bab terstruktur dengan jadwal personal.',
      icon: Brain,
    },
    {
      number: '03',
      title: 'Riset Multi-Sumber',
      description: 'Researcher Agent mencari materi dari web, paper akademik, dan video dalam parallel.',
      icon: BookOpen,
    },
    {
      number: '04',
      title: 'Modul Belajar Disusun',
      description: 'Composer Agent menyintesis semua materi menjadi modul terstruktur per hari.',
      icon: Clock,
    },
  ];

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-100px' }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.span variants={fadeInUp} className="text-primary-600 font-semibold text-sm uppercase tracking-wider">
            Cara Kerja
          </motion.span>
          <motion.h2 variants={fadeInUp} className="mt-4 text-3xl sm:text-4xl font-bold text-slate-900">
            Mulai dalam 4 Langkah Mudah
          </motion.h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="relative"
            >
              <Card className="h-full border border-slate-200 bg-white">
                <CardContent className="p-6">
                  <div className="text-5xl font-bold text-primary-100 mb-4">{step.number}</div>
                  <div className={`w-10 h-10 rounded-lg ${['bg-violet-100', 'bg-orange-100', 'bg-pink-100', 'bg-emerald-100'][index]} flex items-center justify-center mb-3`}>
                    <step.icon className={`w-5 h-5 ${['text-violet-600', 'text-orange-600', 'text-pink-600', 'text-emerald-600'][index]}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </CardContent>
              </Card>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                  <ArrowRight className="w-6 h-6 text-slate-300" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-primary-600 to-primary-700">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold text-white">
            Siap Memulai Perjalanan Belajarmu?
          </motion.h2>
          <motion.p variants={fadeInUp} className="mt-4 text-lg text-primary-100">
            Bergabung dengan ribuan pelajar yang telah menggunakan PLA untuk menguasai topik baru.
          </motion.p>
          <motion.div variants={fadeInUp} className="mt-8">
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary-700 hover:bg-primary-50 px-10 py-6 text-lg font-bold rounded-xl shadow-lg">
                Daftar Gratis Sekarang
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary-500 p-2 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">PLA</span>
          </div>
          <p className="text-sm">
            Personal Learning Agent — Skripsi S1 2026
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-primary-500 p-2 rounded-xl">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">PLA</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-slate-600 hover:text-slate-900">
                  Masuk
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-primary-500 hover:bg-primary-600 text-white">
                  Daftar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </div>
  );
}