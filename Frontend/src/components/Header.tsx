import React from 'react';
import { Bell } from 'lucide-react';

interface HeaderProps {
  pageTitle: string;
}

const Header: React.FC<HeaderProps> = ({ pageTitle }) => {
  return (
    <div className="header">
      <div className="header-left">
        <h1>{pageTitle}</h1>
      </div>
      
      <div className="header-right">
        <div className="user-profile">
          <Bell className="nav-icon" />
          <div className="user-avatar">AM</div>
          <span>Ahmed Mounir</span>
        </div>
      </div>
    </div>
  );
};

export default Header;
