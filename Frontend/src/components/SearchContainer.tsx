import React from 'react';
import { Search, Filter, Plus } from 'lucide-react';

const SearchContainer: React.FC = () => {
  return (
    <div className="search-container-wrapper">
      <div className="search-section">
        <div className="search-input-group">
          <Filter className="nav-icon" />
          <Search className="nav-icon" />
          <input type="text" placeholder="Search" />
        </div>
        <button className="add-button">
          <Plus className="nav-icon" />
          Add New Items +
        </button>
      </div>
    </div>
  );
};

export default SearchContainer;


