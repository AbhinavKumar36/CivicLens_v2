import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en/translation.json';
import orTranslations from './locales/or/translation.json';
import hiTranslations from './locales/hi/translation.json';
import taTranslations from './locales/ta/translation.json';
import bnTranslations from './locales/bn/translation.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: enTranslations },
            or: { translation: orTranslations },
            hi: { translation: hiTranslations },
            ta: { translation: taTranslations },
            bn: { translation: bnTranslations }
        },
        fallbackLng: 'en',
        interpolation: { escapeValue: false }
    });

export default i18n;