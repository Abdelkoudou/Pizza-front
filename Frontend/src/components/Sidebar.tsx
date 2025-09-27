import React from 'react';
import { 
  LayoutGrid, 
  Pizza, 
  Carrot, 
  Users, 
  Settings, 
  LogOut,
  Calculator
} from 'lucide-react';
import logo from '../logo.png';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onPageChange }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <img src={logo} alt="NEXO PIZZA" className="logo-image" />
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <div className="sidebar-nav-main">
          <button 
            className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => onPageChange('dashboard')}
          >
            <LayoutGrid className="nav-icon" />
            Dashboard
          </button>
          <button 
            className={`nav-item ${activePage === 'menu' ? 'active' : ''}`}
            onClick={() => onPageChange('menu')}
          >
            <Pizza className="nav-icon" />
            Menu
          </button>
          <button 
            className={`nav-item ${activePage === 'ingredients' ? 'active' : ''}`}
            onClick={() => onPageChange('ingredients')}
          >
            <Carrot className="nav-icon" />
            Ingredients
          </button>
          <button 
            className={`nav-item ${activePage === 'staff' ? 'active' : ''}`}
            onClick={() => onPageChange('staff')}
          >
            <Users className="nav-icon" />
            Staff
          </button>
          <button 
            className={`nav-item ${activePage === 'what-if' ? 'active' : ''}`}
            onClick={() => onPageChange('what-if')}
          >
            <Calculator className="nav-icon" />
            What-If Simulator
          </button>
        </div>
        
        <div className="sidebar-nav-footer">
          <button className="nav-item">
            <Settings className="nav-icon" />
            Settings
          </button>
          <button className="nav-item logout">
            <LogOut className="nav-icon" />
            Log Out
          </button>

        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
