import React from 'react';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onPageChange: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onPageChange }) => {
  const { t } = useTranslation();
  
  const getPageTitle = (page: string) => {
    switch (page) {
      case 'dashboard':
        return t('dashboard');
      case 'menu':
        return t('menuManagement');
      case 'staff':
        return t('staffManagement');
      case 'ingredients':
        return t('ingredientManagement');
      case 'what-if':
        return t('whatIfSimulator');
      default:
        return t('dashboard');
    }
  };

  return (
    <div className="layout">
      <Sidebar activePage={activePage} onPageChange={onPageChange} />
      <div className="main-content">
        <Header pageTitle={getPageTitle(activePage)} />
        <div className="content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
