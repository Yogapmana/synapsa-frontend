import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import translationEN from './locales/en/translation.json'
import translationID from './locales/id/translation.json'

const resources = {
  en: {
    translation: translationEN,
  },
  id: {
    translation: translationID,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'id',
    supportedLngs: ['id', 'en'],
    nonExplicitSupportedLngs: true,
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    // Persist guest language across Landing → Login → Register
    // before the user is authenticated.
    detection: {
      order: ['localStorage', 'cookie', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
      lookupLocalStorage: 'i18nextLng',
      lookupCookie: 'i18next',
    },
  })

const syncDocumentLang = (lng) => {
  if (typeof document === 'undefined') return
  document.documentElement.lang = (lng || 'id').split('-')[0]
}

syncDocumentLang(i18n.language)
i18n.on('languageChanged', syncDocumentLang)

export default i18n
