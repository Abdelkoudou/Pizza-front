import React, { useState } from 'react';
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { 
  AreaChart,
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  ComposedChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const Dashboard: React.FC = () => {
  const [orderTimeframe, setOrderTimeframe] = useState('Weekly');
  const [ingredientsTimeframe, setIngredientsTimeframe] = useState('Weekly');

  // Realtime Users Data
  const realtimeData = [
    { label: 'Realtime users', value: 635, change: '+21.01%', trend: 'up' },
    { label: 'Orders today', value: 124, change: '+5.2%', trend: 'up' },
    { label: 'Revenue', value: '$12,450', change: '+8.3%', trend: 'up' },
    { label: 'Active staff', value: 8, change: '+2', trend: 'up' }
  ];

  // Order Forecasting Data - Weekly
  const weeklyOrderData = [
    { week: 'Week 1', pizza: 45000, bar: 120000, others: 80000 },
    { week: 'Week 2', pizza: 42000, bar: 110000, others: 75000 },
    { week: 'Week 3', pizza: 65000, bar: 140000, others: 95000 },
    { week: 'Week 4', pizza: 58000, bar: 160000, others: 105000 },
    { week: 'Week 5', pizza: 62000, bar: 180000, others: 115000 },
    { week: 'Week 6', pizza: 55000, bar: 150000, others: 90000 },
    { week: 'Week 7', pizza: 48000, bar: 130000, others: 85000 },
    { week: 'Week 8', pizza: 52000, bar: 135000, others: 88000 }
  ];

  // Order Forecasting Data - Daily
  const dailyOrderData = [
    { day: 'Mon', pizza: 12000, bar: 35000, others: 22000 },
    { day: 'Tue', pizza: 11000, bar: 32000, others: 20000 },
    { day: 'Wed', pizza: 13000, bar: 38000, others: 25000 },
    { day: 'Thu', pizza: 14000, bar: 42000, others: 28000 },
    { day: 'Fri', pizza: 18000, bar: 55000, others: 35000 },
    { day: 'Sat', pizza: 22000, bar: 65000, others: 42000 },
    { day: 'Sun', pizza: 19000, bar: 58000, others: 38000 }
  ];

  // Order Forecasting Data - Hourly
  const hourlyOrderData = [
    { hour: '8AM', pizza: 800, bar: 2000, others: 1200 },
    { hour: '10AM', pizza: 1200, bar: 3000, others: 1800 },
    { hour: '12PM', pizza: 2500, bar: 6000, others: 4000 },
    { hour: '2PM', pizza: 1800, bar: 4500, others: 3000 },
    { hour: '4PM', pizza: 1500, bar: 3800, others: 2500 },
    { hour: '6PM', pizza: 3000, bar: 8000, others: 5500 },
    { hour: '8PM', pizza: 4000, bar: 12000, others: 8000 },
    { hour: '10PM', pizza: 2500, bar: 7000, others: 4500 }
  ];

  // Get the appropriate data based on timeframe
  const getOrderData = () => {
    switch (orderTimeframe) {
      case 'Hourly':
        return hourlyOrderData;
      case 'Daily':
        return dailyOrderData;
      case 'Weekly':
        return weeklyOrderData;
      default:
        return weeklyOrderData;
    }
  };

  const orderData = getOrderData();

  // Ingredients/Items Data
  const ingredientsData = [
    { name: 'Tomato Sauce', weekly: 45, daily: 8 },
    { name: 'Mozzarella', weekly: 120, daily: 18 },
    { name: 'Pepperoni', weekly: 85, daily: 12 },
    { name: 'Mushrooms', weekly: 60, daily: 9 },
    { name: 'Onions', weekly: 40, daily: 6 },
    { name: 'Bell Peppers', weekly: 35, daily: 5 },
    { name: 'Olives', weekly: 25, daily: 4 },
    { name: 'Basil', weekly: 15, daily: 2 }
  ];

  // Usage Data for Daily view (same as ingredients page)
  const dailyUsageData = [
    { day: 'Sat', solidOrange: 70, dottedGray: 80 },
    { day: 'Sun', solidOrange: 70, dottedGray: 80 },
    { day: 'Mon', solidOrange: 0, dottedGray: 0, dottedOrange: 110 },
    { day: 'Tue', solidOrange: 0, dottedGray: 0, dottedOrange: 95 },
    { day: 'Wed', solidOrange: 0, dottedGray: 0, dottedOrange: 80 },
    { day: 'Thu', solidOrange: 0, dottedGray: 0, dottedOrange: 60 },
    { day: 'Fri', solidOrange: 0, dottedGray: 0, dottedOrange: 90 }
  ];

  // Usage Data for Weekly view
  const weeklyUsageData = [
    { week: 'Week 1', solidOrange: 85, dottedGray: 90 },
    { week: 'Week 2', solidOrange: 0, dottedGray: 0, dottedOrange: 95 },
    { week: 'Week 3', solidOrange: 0, dottedGray: 0, dottedOrange: 88 },
    { week: 'Week 4', solidOrange: 0, dottedGray: 0, dottedOrange: 92 }
  ];

  const usageData = ingredientsTimeframe === 'Daily' ? dailyUsageData : weeklyUsageData;

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
              <div className="card-subtitle">Statistics</div>
              <h2 className="card-title">Order Forecasting</h2>
            </div>
            <div className="timeframe-tabs">
              <button 
                className={`tab-button ${orderTimeframe === 'Hourly' ? 'active' : ''}`}
                onClick={() => setOrderTimeframe('Hourly')}
              >
                Hourly
              </button>
              <button 
                className={`tab-button ${orderTimeframe === 'Daily' ? 'active' : ''}`}
                onClick={() => setOrderTimeframe('Daily')}
              >
                Daily
              </button>
              <button 
                className={`tab-button ${orderTimeframe === 'Weekly' ? 'active' : ''}`}
                onClick={() => setOrderTimeframe('Weekly')}
              >
                Weekly
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
                  domain={orderTimeframe === 'Hourly' ? [0, 15000] : orderTimeframe === 'Daily' ? [0, 70000] : [0, 200000]} 
                  ticks={orderTimeframe === 'Hourly' ? [0, 5000, 10000, 15000] : orderTimeframe === 'Daily' ? [0, 20000, 40000, 60000, 80000] : [0, 50000, 100000, 150000, 200000]} 
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
            <span className="alert-text">Tomato Sauce High Drop</span>
          </div>
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
                onClick={() => setIngredientsTimeframe('Daily')}
              >
                Daily
              </button>
              <button 
                className={`tab-button ${ingredientsTimeframe === 'Weekly' ? 'active' : ''}`}
                onClick={() => setIngredientsTimeframe('Weekly')}
              >
                Weekly
              </button>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={usageData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey={ingredientsTimeframe === 'Daily' ? 'day' : 'week'} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis axisLine={false} tickLine={false} domain={[0, 125]} ticks={[0, 25, 50, 75, 100, 125]} />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    `${value}`, 
                    name === 'solidOrange' ? 'Past Usage' : name === 'dottedGray' ? 'Historical' : 'Forecast'
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
