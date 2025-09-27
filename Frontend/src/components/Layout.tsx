import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  activePage: string;
  onPageChange: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onPageChange }) => {
  const getPageTitle = (page: string) => {
    switch (page) {
      case 'dashboard':
        return 'Dashboard';
      case 'menu':
        return 'Menu Management';
      case 'staff':
        return 'Staff Management';
      case 'ingredients':
        return 'Ingredient Management';
      case 'what-if':
        return 'What-If Simulator';
      default:
        return 'Dashboard';
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
