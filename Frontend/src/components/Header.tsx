import React from 'react';
import { Bell, Languages } from 'lucide-react';
import { useLanguage } from '../i18n';

interface HeaderProps {
  pageTitle: string;
}

const Header: React.FC<HeaderProps> = ({ pageTitle }) => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="header">
      <div className="header-left">
        <h1>{pageTitle}</h1>
      </div>
      
      <div className="header-right">
        <div className="user-profile">
          <button 
            className="language-toggle-btn"
            onClick={toggleLanguage}
            title={`Switch to ${language === 'en' ? 'French' : 'English'}`}
          >
            <Languages className="nav-icon" />
            <span className="language-code">{language.toUpperCase()}</span>
          </button>
          <Bell className="nav-icon" />
          <div className="user-avatar">AM</div>
          <span>Ahmed Mounir</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
