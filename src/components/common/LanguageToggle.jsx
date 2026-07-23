import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

/**
 * Minimal public-page language toggle.
 * Persists via i18next LanguageDetector (localStorage + cookie).
 */
export default function LanguageToggle({ className, compact = false }) {
  const { i18n, t } = useTranslation()
  const currentLang = (i18n.language || 'id').split('-')[0]
  const nextLang = currentLang === 'id' ? 'en' : 'id'

  const handleToggle = () => {
    i18n.changeLanguage(nextLang)
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={
        currentLang === 'id'
          ? t('common.switch_to_en', 'Switch to English')
          : t('common.switch_to_id', 'Ganti ke Bahasa Indonesia')
      }
      title={currentLang === 'id' ? 'English' : 'Bahasa Indonesia'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg font-label font-medium',
        'text-secondary transition-colors duration-200',
        'hover:bg-secondary/10 hover:text-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/40',
        compact ? 'px-2 py-1.5 text-xs' : 'px-2.5 py-1.5 text-sm',
        className,
      )}
    >
      <Globe size={compact ? 14 : 15} className="shrink-0" />
      <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide">
        <span className={currentLang === 'id' ? 'text-tertiary' : 'text-secondary/70'}>ID</span>
        <span className="text-secondary/40" aria-hidden="true">/</span>
        <span className={currentLang === 'en' ? 'text-tertiary' : 'text-secondary/70'}>EN</span>
      </span>
    </button>
  )
}
