import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

type Language = 'en' | 'ar';
type Translations = { [key: string]: any };

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
      const savedLang = localStorage.getItem('language');
      return (savedLang === 'en' || savedLang === 'ar') ? savedLang : 'ar';
  });
  const [translations, setTranslations] = useState<Translations | null>(null);

  useEffect(() => {
    const loadTranslations = async () => {
        try {
            const [arResponse, enResponse] = await Promise.all([
                fetch('/locales/ar.json'),
                fetch('/locales/en.json')
            ]);
            
            if (!arResponse.ok || !enResponse.ok) {
                throw new Error('Failed to fetch translation files');
            }
            
            const arData = await arResponse.json();
            const enData = await enResponse.json();
            
            setTranslations({ en: enData, ar: arData });
        } catch (error) {
            console.error("Failed to load translation files", error);
            setTranslations({}); // Set empty object on error to prevent app crash
        }
    };
    loadTranslations();
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = useCallback((key: string): string => {
    if (!translations || !translations[language] || !translations[language][key]) {
      return key; // Return key if translation not found or not loaded yet
    }
    return translations[language][key];
  }, [language, translations]);

  // Prevent rendering children until translations are loaded to avoid flickering
  if (!translations) {
      return null; // Or a loading spinner
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};