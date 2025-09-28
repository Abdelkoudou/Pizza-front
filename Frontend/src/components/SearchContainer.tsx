import React from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { useTranslations } from '../i18n';

const SearchContainer: React.FC = () => {
  const t = useTranslations();
  
  return (
    <div className="search-container-wrapper">
      <div className="search-section">
        <div className="search-input-group">
          <Filter className="nav-icon" />
          <Search className="nav-icon" />
          <input type="text" placeholder={t.search} />
        </div>
        <button className="add-button">
          <Plus className="nav-icon" />
          {t.addNewItemsPlus}
        </button>
      </div>
    </div>
  );
};

export default SearchContainer;


