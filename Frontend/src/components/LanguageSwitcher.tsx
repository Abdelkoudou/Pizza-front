import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'fr' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  return (
    <button 
      className="language-switcher" 
      onClick={toggleLanguage}
      title={t('language')}
    >
      <Globe className="nav-icon" />
      <span className="language-text">
        {i18n.language === 'en' ? 'FR' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageSwitcher;