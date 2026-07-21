import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import HeroSection from '@/components/landing/HeroSection'
import FeaturesBento from '@/components/landing/FeaturesBento'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import SocialProofSection from '@/components/landing/SocialProofSection'
import CTASection from '@/components/landing/CTASection'

function scrollToSection(id) {
  return (e) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

/**
 * Landing — public marketing page.
 * Aesthetic: "Editorial Warmth × Multi-Agent Intelligence"
 * Sections live in components/landing/* for maintainability.
 */
export default function Landing() {
  return (
    <div className="min-h-screen bg-neutral texture-grain">
      <nav
        className="fixed top-0 left-0 right-0 z-50 bg-surface/80 backdrop-blur-md shadow-[0_1px_3px_rgba(58,41,22,0.06),0_1px_0_rgba(58,41,22,0.08)]"
        aria-label="Main"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              to="/"
              className="flex items-center gap-2.5 group"
              aria-label="Synapsa home"
            >
              <div className="bg-tertiary p-2 rounded-xl transition-transform duration-300 group-hover:scale-105">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-display font-bold text-primary tracking-tight">
                Synapsa
              </span>
            </Link>

            <div className="flex items-center gap-1 sm:gap-2">
              <a
                href="#fitur"
                onClick={scrollToSection('fitur')}
                className="hidden md:inline-flex px-3 py-2 text-sm font-label text-secondary hover:text-primary transition-colors duration-200"
              >
                Fitur
              </a>
              <a
                href="#cara-kerja"
                onClick={scrollToSection('cara-kerja')}
                className="hidden md:inline-flex px-3 py-2 text-sm font-label text-secondary hover:text-primary transition-colors duration-200"
              >
                Cara Kerja
              </a>
              <Link to="/login" className="hidden sm:block">
                <Button
                  variant="ghost"
                  className="text-secondary hover:text-primary font-label transition-colors duration-200"
                >
                  Masuk
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="tertiary"
                  className="font-label tracking-wide transition-all duration-300 hover:shadow-warm-md"
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
        <FeaturesBento />
        <HowItWorksSection />
        <SocialProofSection />
        <CTASection />
      </main>

      <footer className="bg-surface text-secondary py-12 border-t border-border-subtle/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3 group">
              <div className="bg-tertiary/10 p-2.5 rounded-xl text-tertiary ring-1 ring-tertiary/20 transition-transform duration-300 group-hover:scale-105">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-2xl font-display font-bold text-primary tracking-tight">
                Synapsa
              </span>
              <span className="text-xs text-secondary/60 font-label font-medium bg-surface-1 px-2 py-1 rounded-md">
                v1.0
              </span>
            </div>
            <p className="text-sm font-label">
              Personal Learning Agent — Skripsi S1 · 2026
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
