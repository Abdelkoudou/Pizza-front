import React, { useState } from 'react';
import { ArrowLeft, Edit, Pizza } from 'lucide-react';
import pizzaImage from '../pizza image.png';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  Area,
  AreaChart
} from 'recharts';

interface PizzaDetailProps {
  pizza: {
    id: number;
    name: string;
    sizes: string[];
    prices: string[];
    image: string;
  };
  onBack: () => void;
}

const PizzaDetail: React.FC<PizzaDetailProps> = ({ pizza, onBack }) => {
  const [activeTab, setActiveTab] = useState('Daily');

  // Revenue Chart Data with actual and predicted
  const revenueData = [
    { day: 'Sat', actual: 85, predicted: 0, past: 85 },
    { day: 'Sun', actual: 92, predicted: 0, past: 92 },
    { day: 'Mon', actual: 96, predicted: 0, past: 96 },
    { day: 'Tue', actual: 0, predicted: 88, past: 0 },
    { day: 'Wed', actual: 0, predicted: 80, past: 0 },
    { day: 'Thu', actual: 0, predicted: 75, past: 0 },
    { day: 'Fri', actual: 0, predicted: 90, past: 0 }
  ];

  // Toppings Data
  const toppings = [
    { name: 'Câpres', price: '20 DA', image: pizzaImage },
    { name: 'Champignons', price: '170 DA', image: pizzaImage },
    { name: 'Gruyère', price: '100 DA', image: pizzaImage },
    { name: 'Herbes italiennes', price: '0 DA', image: pizzaImage },
    { name: 'Huile d\'olive', price: '0 DA', image: pizzaImage },
    { name: 'Poulet', price: '160 DA', image: pizzaImage }
  ];

  return (
    <div className="pizza-detail-page">
      {/* Back Button */}
      <div className="back-button-container">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft className="nav-icon" />
          Back to Menu
        </button>
      </div>

      <div className="pizza-detail-content">
        {/* Pizza Info Card */}
        <div className="pizza-info-card">
          <div className="pizza-image-large">
            <img src={pizza.image} alt={pizza.name} />
          </div>
          <div className="pizza-details">
            <h2>{pizza.name}</h2>
            <p>Mozzarella, tomates en dés, Herbes italiennes, Huile d'olive</p>
            <div className="pizza-tag">
              <Pizza className="nav-icon" />
              Pizza
            </div>
          </div>
          <div className="pizza-sizes-prices">
            {pizza.sizes.map((size, index) => (
              <div key={index} className="size-price-row">
                <div className="size-option">
                  <span className="size-text">{size}</span>
                </div>
                <div className="price-text">
                  {pizza.prices[index]}
                </div>
              </div>
            ))}
          </div>
          <button className="edit-button">
            <Edit className="nav-icon" />
          </button>
        </div>

        {/* Main Content Row */}
        <div className="main-content-row">
          {/* Revenue Chart Card */}
          <div className="revenue-card">
            <div className="revenue-header">
              <div className="revenue-info">
                <h3>Net Revenue</h3>
                <div className="revenue-metric">
                  40,000 DZD
                  <span className="metric-change positive">+1.3%</span>
                </div>
              </div>
              <div className="revenue-tabs">
                <button 
                  className={`tab-button ${activeTab === 'Daily' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Daily')}
                >
                  Daily
                </button>
                <button 
                  className={`tab-button ${activeTab === 'Weekly' ? 'active' : ''}`}
                  onClick={() => setActiveTab('Weekly')}
                >
                  Weekly
                </button>
              </div>
            </div>
            <div className="revenue-chart">
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} domain={[0, 125]} ticks={[0, 25, 50, 75, 100, 125]} />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      `${value}`, 
                      name === 'past' ? 'Past' : name === 'actual' ? 'Actual' : 'Predicted'
                    ]}
                    labelStyle={{ color: '#333' }}
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e9ecef', 
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                  />
                  {/* Past data - gray area */}
                  <Area 
                    type="monotone" 
                    dataKey="past" 
                    stroke="#9CA3AF" 
                    fill="url(#pastGradient)" 
                    strokeWidth={2}
                  />
                  {/* Actual data - green area */}
                  <Area 
                    type="monotone" 
                    dataKey="actual" 
                    stroke="#10B981" 
                    fill="url(#actualGradient)" 
                    strokeWidth={2}
                  />
                  {/* Predicted data - orange area */}
                  <Area 
                    type="monotone" 
                    dataKey="predicted" 
                    stroke="#E23A00" 
                    fill="url(#predictedGradient)" 
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="pastGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#9CA3AF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#9CA3AF" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#E23A00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#E23A00" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Toppings Card */}
          <div className="toppings-card">
            <h3>Topping</h3>
            <div className="toppings-grid">
              {toppings.map((topping, index) => (
                <div key={index} className="topping-item">
                  <div className="topping-image">
                    <img src={topping.image} alt={topping.name} />
                  </div>
                  <div className="topping-info">
                    <span className="topping-name">{topping.name}</span>
                    <span className="topping-price">{topping.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PizzaDetail;
