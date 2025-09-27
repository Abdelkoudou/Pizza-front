import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  ComposedChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { apiService, dataUtils, OrderPrediction, IngredientPrediction, WeeklyIngredientPrediction } from '../utils/api';
import { calculateOrderScale, calculateIngredientScale } from '../utils/chartUtils';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [orderTimeframe, setOrderTimeframe] = useState('Weekly');
  const [ingredientsTimeframe, setIngredientsTimeframe] = useState('Weekly');
  const [orderData, setOrderData] = useState<any[]>([]);
  const [ingredientsData, setIngredientsData] = useState<any[]>([]);
  const [mostForecastedIngredient, setMostForecastedIngredient] = useState<{ name: string; value: number }>({ name: '', value: 0 });
  const [loading, setLoading] = useState(false);

  // Calculate dynamic scales
  const orderScale = calculateOrderScale(orderData, orderTimeframe);
  const ingredientScale = calculateIngredientScale(ingredientsData);

  // Realtime Users Data
  const realtimeData = [
    { label: t('realtimeUsers'), value: 635, change: '+21.01%', trend: 'up' },
    { label: t('ordersToday'), value: 124, change: '+5.2%', trend: 'up' },
    { label: t('revenue'), value: '$12,450', change: '+8.3%', trend: 'up' },
    { label: t('activeStaff'), value: 8, change: '+2', trend: 'up' }
  ];

  // Load data from API
  useEffect(() => {
    loadOrderData();
    loadIngredientsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderTimeframe, ingredientsTimeframe]);

  const loadOrderData = async () => {
    setLoading(true);
    try {
      let predictions: OrderPrediction[] = [];
      const sampleContext = [{
        date: "2025-09-28",
        temp_min_c: 18,
        temp_max_c: 28,
        humidity_pct: 60,
        wind_kph: 12,
        precip_mm: 0.2,
        precip_prob: 30
      }];

      if (orderTimeframe === 'Daily') {
        const dates = Array.from({length: 7}, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i);
          return dataUtils.formatDateForAPI(date);
        });
        predictions = await apiService.getDailyPredictions(dates, sampleContext);
      } else if (orderTimeframe === 'Weekly') {
        const weeks = Array.from({length: 8}, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + (i * 7));
          return dataUtils.formatDateForAPI(date);
        });
        predictions = await apiService.getWeeklyPredictions(weeks);
      } else { // Hourly
        const timestamps = Array.from({length: 24}, (_, i) => {
          const date = new Date();
          date.setHours(i);
          return date.toISOString();
        });
        predictions = await apiService.getHourlyPredictions(timestamps, sampleContext);
      }

      // Transform predictions to chart data
      const chartData = predictions.map((pred, index) => {
        let timeLabel = '';
        if (pred.date) {
          const date = new Date(pred.date);
          timeLabel = orderTimeframe === 'Daily' ? date.toLocaleDateString('en', {weekday: 'short'}) : `Week ${index + 1}`;
        } else if (pred.hour) {
          const date = new Date(pred.hour);
          timeLabel = `${date.getHours()}:00`;
        } else if (pred.week) {
          timeLabel = `Week ${index + 1}`;
        }
        
        return {
          [orderTimeframe === 'Daily' ? 'day' : orderTimeframe === 'Weekly' ? 'week' : 'hour']: timeLabel,
          pizza: Math.round(pred.predicted_orders * 0.7), // Assume 70% pizza orders
          bar: Math.round(pred.predicted_orders * 0.2),   // Assume 20% bar orders  
          others: Math.round(pred.predicted_orders * 0.1) // Assume 10% other orders
        };
      });

      setOrderData(chartData);

    } catch (error) {
      console.error('Failed to load order data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadIngredientsData = async () => {
    try {
      let predictions: IngredientPrediction[] | WeeklyIngredientPrediction[] = [];
      
      if (ingredientsTimeframe === 'Daily') {
        const dates = Array.from({length: 7}, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i);
          return dataUtils.formatDateForAPI(date);
        });
        predictions = await apiService.getDailyIngredientPredictions(dates);
      } else {
        const weeks = Array.from({length: 4}, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + (i * 7));
          return dataUtils.formatDateForAPI(date);
        });
        predictions = await apiService.getWeeklyIngredientPredictions(weeks);
      }

      // Transform ingredients data and find most forecasted
      if (predictions.length > 0) {
        const allPredictions = predictions[0].predictions;
        const mostForecasted = dataUtils.getMostForecastedIngredient(allPredictions);
        setMostForecastedIngredient(mostForecasted);

        // Create chart data for ingredients
        const chartData = ingredientsTimeframe === 'Daily' ? 
          Array.from({length: 7}, (_, i) => ({
            day: ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i],
            solidOrange: i < 2 ? 70 : 0,
            dottedGray: i < 2 ? 80 : 0,
            dottedOrange: i >= 2 ? Math.round(mostForecasted.value / 10) : 0
          })) :
          Array.from({length: 4}, (_, i) => ({
            week: `Week ${i + 1}`,
            solidOrange: i === 0 ? 85 : 0,
            dottedGray: i === 0 ? 90 : 0,
            dottedOrange: i > 0 ? Math.round(mostForecasted.value / 5) : 0
          }));

        setIngredientsData(chartData);
      }
    } catch (error) {
      console.error('Failed to load ingredients data:', error);
    }
  };

  // Update order timeframe and reload data
  const handleOrderTimeframeChange = (timeframe: string) => {
    setOrderTimeframe(timeframe);
  };

  // Update ingredients timeframe and reload data
  const handleIngredientsTimeframeChange = (timeframe: string) => {
    setIngredientsTimeframe(timeframe);
  };

  // Most Selling Items Data for Pie Chart
  const mostSellingData = [
    { name: 'Pizza', value: 70, color: '#E23A00' },
    { name: 'Hot Drinks', value: 10, color: '#FF4500' },
    { name: 'Soft Drinks', value: 8, color: '#FF6B35' },
    { name: 'Desserts', value: 7, color: '#FF8C42' },
    { name: 'Salads', value: 5, color: '#FFA500' }
  ];

  return (
    <div className="dashboard">
      {/* Realtime Users Section */}
      <div className="realtime-users">
        {realtimeData.map((item, index) => (
          <div key={index} className="realtime-card">
            <div className="realtime-label">{item.label}</div>
            <div className="realtime-value">{item.value}</div>
            <div className="realtime-change positive">{item.change}</div>
            <div className="realtime-chart">
              <TrendingUp className="chart-icon" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Section */}
      <div className="charts-section">
        {/* Order Forecasting Chart */}
        <div className="order-forecasting-card">
          <div className="card-header">
            <div className="card-title-section">
              <div className="card-subtitle">{t('statistics')}</div>
              <h2 className="card-title">{t('orderForecasting')}</h2>
            </div>
            <div className="timeframe-tabs">
              <button 
                className={`tab-button ${orderTimeframe === 'Hourly' ? 'active' : ''}`}
                onClick={() => handleOrderTimeframeChange('Hourly')}
              >
                {t('hourly')}
              </button>
              <button 
                className={`tab-button ${orderTimeframe === 'Daily' ? 'active' : ''}`}
                onClick={() => handleOrderTimeframeChange('Daily')}
              >
                {t('daily')}
              </button>
              <button 
                className={`tab-button ${orderTimeframe === 'Weekly' ? 'active' : ''}`}
                onClick={() => handleOrderTimeframeChange('Weekly')}
              >
                {t('weekly')}
              </button>
            </div>
          </div>
          
          <div className="chart-legend">
            <div className="legend-item">
              <div className="legend-dot pizza"></div>
              <span>Pizza</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot bar" style={{backgroundColor: '#FF4500'}}></div>
              <span>Bar</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot others" style={{backgroundColor: '#FF6B35'}}></div>
              <span>Others</span>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={orderData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={orderTimeframe === 'Hourly' ? 'hour' : orderTimeframe === 'Daily' ? 'day' : 'week'} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  domain={orderScale.domain} 
                  ticks={orderScale.ticks} 
                />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `${value.toLocaleString()}`, 
                    name === 'pizza' ? 'Pizza' : name === 'bar' ? 'Bar' : 'Others'
                  ]}
                  labelStyle={{ color: '#333' }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e9ecef', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="pizza" 
                  stroke="#E23A00" 
                  fill="url(#pizzaGradient)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="bar" 
                  stroke="#FF4500" 
                  fill="url(#barGradient)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="others" 
                  stroke="#FF6B35" 
                  fill="url(#othersGradient)" 
                  strokeWidth={2}
                />
                <defs>
                  <linearGradient id="pizzaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E23A00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#E23A00" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4500" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF4500" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="othersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts Card */}
        <div className="alerts-card">
          <h3 className="alerts-title">Alerts</h3>
          <div className="alert-item">
            <AlertTriangle className="alert-icon" />
            <span className="alert-text">
              {mostForecastedIngredient.name ? 
                `${mostForecastedIngredient.name} High Forecast (${Math.round(mostForecastedIngredient.value)} units)` : 
                'Tomato Sauce High Drop'
              }
            </span>
          </div>
          {loading && (
            <div className="alert-item">
              <span className="alert-text">Loading forecast data...</span>
            </div>
          )}
        </div>
      </div>

      {/* Ingredients/Items Chart Section */}
      <div className="charts-section">
        {/* Ingredients Usage Chart */}
        <div className="ingredients-chart-card">
          <div className="card-header">
            <div className="card-title-section">
              <div className="card-subtitle">Usage Analytics</div>
              <h2 className="card-title">Ingredients & Items Usage</h2>
            </div>
            <div className="timeframe-tabs">
              <button 
                className={`tab-button ${ingredientsTimeframe === 'Daily' ? 'active' : ''}`}
                onClick={() => handleIngredientsTimeframeChange('Daily')}
              >
                Daily
              </button>
              <button 
                className={`tab-button ${ingredientsTimeframe === 'Weekly' ? 'active' : ''}`}
                onClick={() => handleIngredientsTimeframeChange('Weekly')}
              >
                Weekly
              </button>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={ingredientsData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={ingredientsTimeframe === 'Daily' ? 'day' : 'week'} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis axisLine={false} tickLine={false} domain={ingredientScale.domain} ticks={ingredientScale.ticks} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `${value}`, 
                    name === 'solidOrange' ? 'Past Usage' : name === 'dottedGray' ? 'Historical' : `Forecast: ${mostForecastedIngredient.name}`
                  ]}
                  labelStyle={{ color: '#333' }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e9ecef', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
                {/* Past days: solid orange bar */}
                <Bar dataKey="solidOrange" fill="#E23A00" radius={[0, 0, 0, 0]} maxBarSize={8} />
                {/* Past days: dotted gray bar */}
                <Bar dataKey="dottedGray" fill="url(#dottedGray)" radius={[0, 0, 0, 0]} maxBarSize={8} />
                {/* Future days: dotted orange bar */}
                <Bar dataKey="dottedOrange" fill="url(#dottedOrange)" radius={[0, 0, 0, 0]} maxBarSize={8} />
                
                {/* Define patterns for dotted bars */}
                <defs>
                  <pattern id="dottedGray" patternUnits="userSpaceOnUse" width="4" height="4">
                    <rect width="4" height="4" fill="#E0E0E0"/>
                    <rect width="2" height="4" fill="transparent"/>
                  </pattern>
                  <pattern id="dottedOrange" patternUnits="userSpaceOnUse" width="4" height="4">
                    <rect width="4" height="4" fill="#E23A00"/>
                    <rect width="2" height="4" fill="transparent"/>
                  </pattern>
                </defs>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Selling Items Pie Chart */}
        <div className="most-selling-card">
          <div className="card-header">
            <div className="card-title-section">
              <div className="card-subtitle">Sales Analytics</div>
              <h2 className="card-title">Most Selling Items</h2>
            </div>
          </div>

          <div className="pie-chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={mostSellingData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {mostSellingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, 'Percentage']}
                  labelStyle={{ color: '#333' }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e9ecef', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="pie-legend">
            {mostSellingData.map((item, index) => (
              <div key={index} className="legend-item">
                <div 
                  className="legend-dot" 
                  style={{ backgroundColor: item.color }}
                ></div>
                <span>{item.name}</span>
                <span className="legend-percentage">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
