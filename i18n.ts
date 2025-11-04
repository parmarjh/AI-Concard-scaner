import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  // i18next-http-backend: loads translations from your server
  .use(Backend)
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next
  .use(initReactI18next)
  // init i18next
  .init({
    fallbackLng: 'en', // Use English if detected language is not available
    debug: true, // Set to false in production
    interpolation: {
      escapeValue: false // React already escapes from XSS
    },
    react: {
      useSuspense: true // Use suspense for loading translations
    },
    backend: {
      // Path where resources get loaded from
      loadPath: './locales/{{lng}}.json',
    }
  });

export default i18n;