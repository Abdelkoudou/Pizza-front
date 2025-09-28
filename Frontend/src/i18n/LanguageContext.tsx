import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Translations, englishTranslations, frenchTranslations } from './translations';

export type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  translations: Translations;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  const translations = language === 'fr' ? frenchTranslations : englishTranslations;

  const toggleLanguage = () => {
    setLanguageState(current => current === 'en' ? 'fr' : 'en');
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const value: LanguageContextType = {
    language,
    translations,
    toggleLanguage,
    setLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslations = () => {
  const { translations } = useLanguage();
  return translations;
};