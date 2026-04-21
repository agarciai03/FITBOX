import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Apuntando exactamente a tu ruta: src/locales/...
import esTranslations from './locales/es.json';
import enTranslations from './locales/en.json';

// Leemos el idioma guardado en el navegador, si no hay, usamos 'ES' por defecto
const savedLanguage = localStorage.getItem('lang') || 'ES';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            ES: { translation: esTranslations },
            EN: { translation: enTranslations }
        },
        lng: savedLanguage,
        fallbackLng: 'ES', // Idioma de seguridad si falla algo
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;