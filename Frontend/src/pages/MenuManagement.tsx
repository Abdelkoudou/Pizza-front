import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import pizzaImage from '../pizza image.png';
import SearchContainer from '../components/SearchContainer';
import PizzaDetail from './PizzaDetail';

interface MenuItem {
  id: number;
  name: string;
  sizes: string[];
  prices: string[];
  image: string;
}

const MenuManagement: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('Pizza');
  const [selectedPizza, setSelectedPizza] = useState<MenuItem | null>(null);

  const categories = [
    'Pizza',
    'Soft Drinks',
    'Hot Drinks',
    'Desserts',
    'Salads',
    'Gelatos',
    'Other Drinks',
    'Bakeries'
  ];

  const menuItems: MenuItem[] = [
    {
      id: 1,
      name: 'Margherita',
      sizes: ['25 cm', '30 cm', '35 cm'],
      prices: ['350da', '450da', '650da'],
      image: pizzaImage
    },
    {
      id: 2,
      name: 'Végétarienne',
      sizes: ['25 cm', '30 cm', '35 cm'],
      prices: ['350da', '450da', '650da'],
      image: pizzaImage
    },
    {
      id: 3,
      name: '3 fromages',
      sizes: ['25 cm', '30 cm', '35 cm'],
      prices: ['350da', '450da', '650da'],
      image: pizzaImage
    },
    {
      id: 4,
      name: 'Margherita',
      sizes: ['25 cm', '30 cm', '35 cm'],
      prices: ['350da', '450da', '650da'],
      image: pizzaImage
    },
    {
      id: 5,
      name: 'Margherita',
      sizes: ['25 cm', '30 cm', '35 cm'],
      prices: ['350da', '450da', '650da'],
      image: pizzaImage
    },
    {
      id: 6,
      name: 'Margherita',
      sizes: ['25 cm', '30 cm', '35 cm'],
      prices: ['350da', '450da', '650da'],
      image: pizzaImage
    }
  ];

  // Show pizza detail page if a pizza is selected
  if (selectedPizza) {
    return (
      <PizzaDetail 
        pizza={selectedPizza} 
        onBack={() => setSelectedPizza(null)} 
      />
    );
  }

  return (
    <div className="menu-management">
      <SearchContainer />
      
      <div className="content-grid">
        <div className="categories-section">
          <h2>Categories</h2>
          <div className="categories-divider"></div>
          <ul className="category-list">
            {categories.map((category) => (
              <li
                key={category}
                className={`category-item ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </li>
            ))}
          </ul>
        </div>

        <div className="menu-section">
          <h2>Classic</h2>
          <div className="menu-grid">
            {menuItems.map((item) => (
              <div key={item.id} className="menu-item" onClick={() => setSelectedPizza(item)}>
                <div className="menu-item-actions">
                  <button className="action-button">
                    <Eye className="nav-icon" />
                  </button>
                </div>
                
                <div className="menu-item-image">
                  <img src={item.image} alt={item.name} />
                </div>
                
                <h3 className="menu-item-name">{item.name}</h3>
                
                <div className="menu-item-sizes">
                  {item.sizes.map((size, index) => (
                    <span key={index} className="size-tag">
                      {size}
                    </span>
                  ))}
                </div>
                
                <div className="menu-item-prices">
                  {item.prices.map((price, index) => (
                    <span key={index} className="price">
                      {price}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
