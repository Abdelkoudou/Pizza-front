import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Edit } from 'lucide-react';
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
import { apiService, dataUtils } from '../utils/api';
import { getPizzaByName } from '../utils/pizzaData';
import { calculateIngredientScale } from '../utils/chartUtils';

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
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [ingredientForecasts, setIngredientForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Calculate dynamic scale for the forecast chart
  const forecastScale = calculateIngredientScale(forecastData);

  // Define functions before useEffect to avoid hoisting issues
  const loadForecastData = useCallback(async () => {
    setLoading(true);
    try {
      // Generate sample forecast data based on the selected timeframe
      if (activeTab === 'Daily') {
        const dates = Array.from({length: 7}, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - 2 + i); // 2 days past, 5 days future
          return dataUtils.formatDateForAPI(date);
        });
        
        const sampleContext = [{
          date: dates[0],
          temp_min_c: 18,
          temp_max_c: 28,
          humidity_pct: 60,
          wind_kph: 12,
          precip_mm: 0.2,
          precip_prob: 30
        }];

        const predictions = await apiService.getDailyPredictions(dates, sampleContext);
        
        // Transform to chart data
        const chartData = predictions.map((pred, index) => {
          const date = new Date(pred.date || dates[index]);
          const dayName = date.toLocaleDateString('en', {weekday: 'short'});
          const isPast = index < 2;
          const isFuture = index >= 2;
          
          // Simulate pizza-specific orders (roughly 30% of total orders for this pizza)
          const pizzaOrders = Math.round(pred.predicted_orders * 0.3);
          
          return {
            day: dayName,
            actual: isPast ? pizzaOrders : 0,
            predicted: isFuture ? pizzaOrders : 0,
            past: isPast ? pizzaOrders : 0
          };
        });
        
        setForecastData(chartData);
      } else {
        // Weekly data
        const weeks = Array.from({length: 4}, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + (i * 7));
          return dataUtils.formatDateForAPI(date);
        });
        
        const predictions = await apiService.getWeeklyPredictions(weeks);
        
        const chartData = predictions.map((pred, index) => {
          const weekOrders = Math.round(pred.predicted_orders * 0.3);
          return {
            week: `Week ${index + 1}`,
            actual: index === 0 ? weekOrders : 0,
            predicted: index > 0 ? weekOrders : 0,
            past: index === 0 ? weekOrders : 0
          };
        });
        
        setForecastData(chartData);
      }
    } catch (error) {
      console.error('Failed to load forecast data:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  const loadIngredientForecasts = useCallback(async () => {
    try {
      const dates = [dataUtils.formatDateForAPI(dataUtils.getTomorrowDate())];
      const predictions = await apiService.getDailyIngredientPredictions(dates);
      
      if (predictions.length > 0) {
        const ingredientPredictions = predictions[0].predictions;
        
        // Get the pizza's actual ingredients
        const pizzaData = getPizzaByName(pizza.name);
        const actualIngredients: any[] = [];
        
        if (pizzaData && pizzaData.sizes.length > 0) {
          // Use the medium size (30cm) as default
          const mediumSize = pizzaData.sizes.find(s => s.size === 30) || pizzaData.sizes[1] || pizzaData.sizes[0];
          mediumSize.ingredients.forEach(ingredient => {
            // Try to find matching prediction by ingredient name
            let forecastValue = 0;
            const ingredientName = ingredient.label.toLowerCase();
            
            Object.entries(ingredientPredictions).forEach(([key, value]) => {
              const keyLower = key.toLowerCase();
              // Check for partial matches (ingredient names might not match exactly)
              if (keyLower.includes(ingredientName) || 
                  ingredientName.includes(keyLower.split(' ')[0]) ||
                  (ingredientName.includes('tomato') && keyLower.includes('sauce tomate')) ||
                  (ingredientName.includes('mozzarella') && keyLower.includes('mozzarella')) ||
                  (ingredientName.includes('pepper') && keyLower.includes('pepper'))) {
                forecastValue = Math.max(forecastValue, typeof value === 'number' ? value : 0);
              }
            });
            
            actualIngredients.push({
              name: ingredient.label,
              price: `${Math.round(ingredient.amount * 10)} DA`,
              image: pizzaImage,
              forecast: Math.round(forecastValue)
            });
          });
        } else {
          // Fallback to static toppings if pizza data not found
          actualIngredients.push(
            { name: 'Câpres', price: '20 DA', image: pizzaImage, forecast: Math.round(ingredientPredictions['Capres'] || 18) },
            { name: 'Champignons', price: '170 DA', image: pizzaImage, forecast: Math.round(ingredientPredictions['Champignons'] || 65) },
            { name: 'Gruyère', price: '100 DA', image: pizzaImage, forecast: Math.round(ingredientPredictions['Gruyere'] || 68) },
            { name: 'Herbes italiennes', price: '0 DA', image: pizzaImage, forecast: Math.round(ingredientPredictions['Herbes de Provence'] || 68) },
            { name: 'Huile d\'olive', price: '0 DA', image: pizzaImage, forecast: Math.round(ingredientPredictions['Huile d\'Olive'] || 67) },
            { name: 'Poulet', price: '160 DA', image: pizzaImage, forecast: Math.round(ingredientPredictions['Double Chicken 30\''] || 25) }
          );
        }
        
        setIngredientForecasts(actualIngredients);
      }
    } catch (error) {
      console.error('Failed to load ingredient forecasts:', error);
    }
  }, [pizza.name]);

  // Load forecast data when component mounts or pizza changes
  useEffect(() => {
    const loadData = async () => {
      await loadForecastData();
      await loadIngredientForecasts();
    };
    loadData();
  }, [loadForecastData, loadIngredientForecasts]);

  return (
    <div className="pizza-detail-page">
      {/* Back Button */}
      <div className="back-button-container">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft className="nav-icon" />
          Back to Menu
        </button>
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
              <AreaChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey={activeTab === 'Daily' ? 'day' : 'week'} axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} domain={forecastScale.domain} ticks={forecastScale.ticks} />
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

        {/* Pizza Details Card */}
        <div className="pizza-details-card">
          <div className="pizza-header">
            <img src={pizzaImage} alt={pizza.name} className="pizza-image" />
            <div className="pizza-info">
              <h2 className="pizza-name">{pizza.name}</h2>
              <div className="pizza-sizes">
                {pizza.sizes.map((size, index) => (
                  <span key={size} className="size-badge">
                    {size}
                    {index < pizza.sizes.length - 1 && ', '}
                  </span>
                ))}
              </div>
              <div className="pizza-prices">
                {pizza.prices.map((price, index) => (
                  <span key={price} className="price-badge">
                    {price}
                    {index < pizza.prices.length - 1 && ' | '}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          {/* Ingredient Forecasts */}
          <div className="ingredients-forecast">
            <h3>Tomorrow's Ingredient Forecast</h3>
            {loading ? (
              <div className="loading-text">Loading forecasts...</div>
            ) : (
              <div className="ingredient-grid">
                {ingredientForecasts.map((ingredient, index) => (
                  <div key={index} className="ingredient-item">
                    <img src={ingredient.image} alt={ingredient.name} className="ingredient-image" />
                    <div className="ingredient-info">
                      <div className="ingredient-name">{ingredient.name}</div>
                      <div className="ingredient-price">{ingredient.price}</div>
                      <div className="ingredient-forecast">
                        Forecast: <span className="forecast-value">{ingredient.forecast} units</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PizzaDetail;