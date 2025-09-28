import React, { useState, useEffect, useRef } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  Users,
  Clock,
  Target,
  AlertTriangle
} from 'lucide-react';
import { 
  // LineChart,
  // Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area
} from 'recharts';
import { useTranslations } from '../i18n';

const WhatIfSimulator: React.FC = () => {
  const t = useTranslations();
  const [scenario, setScenario] = useState({
    priceChange: 0,
    marketingBudget: 0,
    selectedEvent: '',
    selectedWeather: ''
  });

  const [results, setResults] = useState<any>(null);
  

  // Predefined events with their impact levels
  const predefinedEvents = [
    { name: t.none, value: '', impact: 0, description: t.noSpecialEvents },
    { name: t.localFestival, value: 'festival', impact: 2, description: t.communityFestivalIncreasesFootTraffic },
    { name: t.sportsGame, value: 'sports', impact: 1.5, description: t.bigGameDayBringsCrowds },
    { name: t.concert, value: 'concert', impact: 1.8, description: t.musicEventNearby },
    { name: t.holiday, value: 'holiday', impact: 1.3, description: t.publicHolidayCelebration },
    { name: t.wedding, value: 'wedding', impact: 0.8, description: t.privateEventNearby }
  ];

  // Predefined weather states with their impact levels
  const predefinedWeather = [
    { name: t.normal, value: '', impact: 0, description: t.typicalWeatherConditions },
    { name: t.sunnyHot, value: 'sunny', impact: 1.2, description: t.greatWeatherIncreasesOutdoorDining },
    { name: t.rainy, value: 'rainy', impact: 0.7, description: t.rainReducesFootTraffic },
    { name: t.stormy, value: 'stormy', impact: 0.5, description: t.severeWeatherLimitsCustomers },
    { name: t.cold, value: 'cold', impact: 0.8, description: t.coldWeatherAffectsOutdoorSeating },
    { name: t.perfect, value: 'perfect', impact: 1.4, description: t.idealWeatherForDiningOut }
  ];

  const generateForecastData = (baseOrders: number, scenario: any) => {
    const data = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Base daily variation (weekends are busier)
      let dailyMultiplier = 1;
      if (dayName === 'Sat' || dayName === 'Sun') {
        dailyMultiplier = 1.3;
      } else if (dayName === 'Fri') {
        dailyMultiplier = 1.1;
      }
      
      // Apply scenario effects
      const marketingEffect = 1 + (scenario.marketingBudget * 0.0001);
      const priceEffect = 1 - (scenario.priceChange * 0.01);
      
      // Get event and weather impact
      const selectedEventData = predefinedEvents.find(e => e.value === scenario.selectedEvent);
      const selectedWeatherData = predefinedWeather.find(w => w.value === scenario.selectedWeather);
      
      const eventsEffect = selectedEventData ? selectedEventData.impact : 1;
      const weatherEffect = selectedWeatherData ? selectedWeatherData.impact : 1;
      
      const forecastOrders = Math.round(baseOrders * dailyMultiplier * marketingEffect * priceEffect * eventsEffect * weatherEffect);
      
      data.push({
        day: dayName,
        date: date.toISOString().split('T')[0],
        orders: forecastOrders,
        baseOrders: Math.round(baseOrders * dailyMultiplier)
      });
    }
    
    return data;
  };

  const calculateScenario = () => {
    // Simulate calculations based on scenario inputs
    const baseRevenue = 12500;
    const baseOrders = 340;
    const baseStaff = 8;

    // Get event and weather impact
    const selectedEventData = predefinedEvents.find(e => e.value === scenario.selectedEvent);
    const selectedWeatherData = predefinedWeather.find(w => w.value === scenario.selectedWeather);
    
    const eventRevenueImpact = selectedEventData ? selectedEventData.impact * 100 : 0;
    const weatherRevenueImpact = selectedWeatherData ? selectedWeatherData.impact * 50 : 0;
    const eventOrderImpact = selectedEventData ? (selectedEventData.impact - 1) * 50 : 0;
    const weatherOrderImpact = selectedWeatherData ? (selectedWeatherData.impact - 1) * 30 : 0;

    const newRevenue = baseRevenue + (scenario.priceChange * 50) + (scenario.marketingBudget * 2) + eventRevenueImpact + weatherRevenueImpact;
    const newOrders = baseOrders + (scenario.marketingBudget * 0.5) + eventOrderImpact + weatherOrderImpact;

    const revenueChange = ((newRevenue - baseRevenue) / baseRevenue * 100);
    const ordersChange = ((newOrders - baseOrders) / baseOrders * 100);

    const forecastData = generateForecastData(newOrders, scenario);

    setResults({
      revenue: newRevenue,
      orders: Math.round(newOrders),
      staff: baseStaff, // Keep staff constant
      revenueChange,
      ordersChange,
      efficiency: newOrders / baseStaff,
      forecastData
    });
  };

  const scenarios = [
    {
      name: t.festivalWeekend,
      description: t.localFestivalEventPerfectWeather,
      values: { selectedEvent: 'festival', selectedWeather: 'perfect', marketingBudget: 800, priceChange: 0 }
    },
    {
      name: t.stormyDay,
      description: t.stormyWeatherNoEvents,
      values: { selectedEvent: '', selectedWeather: 'stormy', priceChange: -10, marketingBudget: 300 }
    },
    {
      name: t.bigGameDay,
      description: t.bigGameDaySunnyWeather,
      values: { selectedEvent: 'sports', selectedWeather: 'sunny', marketingBudget: 600, priceChange: 0 }
    }
  ];

  const applyScenario = (scenarioValues: any) => {
    setScenario(scenarioValues);
  };

  // Recalculate results automatically whenever the scenario changes.
  // Debounce to avoid too many recalculations while the user is typing.
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set a short debounce (250ms) then calculate
    debounceTimer.current = window.setTimeout(() => {
      calculateScenario();
    }, 250);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    };
  }, [scenario]);

  return (
    <div className="what-if-simulator">
      {/* Search and Action Bar */}
      <div className="search-filter-bar">
        <div className="search-filter-left">
          <button className="control-button">
            <Clock className="nav-icon" />
            {t.today}
          </button>
          <button className="control-button">
            <Target className="nav-icon" />
          </button>
          <div className="search-input-group">
            <Calculator className="nav-icon" />
            <input type="text" placeholder={t.scenarioSearch} />
          </div>
        </div>
        <button className="add-button" onClick={calculateScenario}>
          <Calculator className="nav-icon" />
          {t.calculateScenario}
        </button>
      </div>

      {/* Main Content */}
      <div className="simulator-content">
        {/* Input Parameters Card */}
        <div className="simulator-card">
          <div className="card-header">
            <div className="card-title-section">
              <div className="card-subtitle">{t.simulationParameters}</div>
              <h2 className="card-title">{t.whatIfScenarios}</h2>
            </div>
          </div>
          
          <div className="card-body">
            <div className="parameter-grid">
              <div className="parameter-item">
                <label className="parameter-label">
                  <DollarSign className="parameter-icon" />
                  {t.priceChange}
                </label>
                <input 
                  type="number" 
                  className="parameter-input"
                  value={scenario.priceChange}
                  onChange={(e) => setScenario({...scenario, priceChange: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
                <span className="parameter-unit">%</span>
              </div>

              <div className="parameter-item">
                <label className="parameter-label">
                  <TrendingUp className="parameter-icon" />
                  {t.marketingBudget}
                </label>
                <input 
                  type="number" 
                  className="parameter-input"
                  value={scenario.marketingBudget}
                  onChange={(e) => setScenario({...scenario, marketingBudget: parseInt(e.target.value) || 0})}
                  placeholder="0"
                />
                <span className="parameter-unit">$</span>
              </div>

              <div className="parameter-item">
                <label className="parameter-label">
                  <Target className="parameter-icon" />
                  {t.eventType}
                </label>
                <select 
                  className="parameter-input"
                  value={scenario.selectedEvent}
                  onChange={(e) => setScenario({...scenario, selectedEvent: e.target.value})}
                >
                  {predefinedEvents.map((event, index) => (
                    <option key={index} value={event.value}>{event.name}</option>
                  ))}
                </select>
              </div>

              <div className="parameter-item">
                <label className="parameter-label">
                  <TrendingDown className="parameter-icon" />
                  {t.weatherConditions}
                </label>
                <select 
                  className="parameter-input"
                  value={scenario.selectedWeather}
                  onChange={(e) => setScenario({...scenario, selectedWeather: e.target.value})}
                >
                  {predefinedWeather.map((weather, index) => (
                    <option key={index} value={weather.value}>{weather.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Scenarios Card */}
        <div className="simulator-card">
          <div className="card-header">
            <div className="card-title-section">
              <div className="card-subtitle">{t.quickScenarios}</div>
              <h2 className="card-title">{t.predefinedScenarios}</h2>
            </div>
          </div>
          
          <div className="card-body">
            <div className="scenarios-grid">
              {scenarios.map((scenario, index) => (
                <div key={index} className="scenario-item">
                  <h3 className="scenario-name">{scenario.name}</h3>
                  <p className="scenario-description">{scenario.description}</p>
                  <button 
                    className="scenario-button"
                    onClick={() => applyScenario(scenario.values)}
                  >
                    {t.applyScenario}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Card */}
        {results && (
          <div className="simulator-card results-card">
            <div className="card-header">
              <div className="card-title-section">
                <div className="card-subtitle">Simulation Results</div>
                <h2 className="card-title">Projected Outcomes</h2>
              </div>
            </div>
            
            <div className="card-body">
              <div className="results-grid">
                <div className="result-item">
                  <div className="result-icon">
                    <DollarSign className="result-icon-svg" />
                  </div>
                  <div className="result-content">
                    <div className="result-label">Revenue</div>
                    <div className="result-value">${results.revenue.toLocaleString()}</div>
                    <div className={`result-change ${results.revenueChange >= 0 ? 'positive' : 'negative'}`}>
                      {results.revenueChange >= 0 ? '+' : ''}{results.revenueChange.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="result-item">
                  <div className="result-icon">
                    <TrendingUp className="result-icon-svg" />
                  </div>
                  <div className="result-content">
                    <div className="result-label">Orders</div>
                    <div className="result-value">{results.orders}</div>
                    <div className={`result-change ${results.ordersChange >= 0 ? 'positive' : 'negative'}`}>
                      {results.ordersChange >= 0 ? '+' : ''}{results.ordersChange.toFixed(1)}%
                    </div>
                  </div>
                </div>

                <div className="result-item">
                  <div className="result-icon">
                    <Users className="result-icon-svg" />
                  </div>
                  <div className="result-content">
                    <div className="result-label">Staff</div>
                    <div className="result-value">{results.staff}</div>
                    <div className="result-change neutral">
                      Fixed at 8 people
                    </div>
                  </div>
        </div>

                <div className="result-item">
                  <div className="result-icon">
                    <Target className="result-icon-svg" />
                  </div>
                  <div className="result-content">
                    <div className="result-label">Efficiency</div>
                    <div className="result-value">{results.efficiency.toFixed(1)}</div>
                    <div className="result-change neutral">
                      orders/staff
                    </div>
                  </div>
                </div>
      </div>

              {results.revenueChange < -10 && (
                <div className="alert-item">
                  <AlertTriangle className="alert-icon" />
                  <span className="alert-text">Warning: Significant revenue decrease projected</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Forecast Chart */}
        {results && results.forecastData && (
          <div className="simulator-card">
            <div className="card-header">
              <div className="card-title-section">
                <div className="card-subtitle">Order Forecast</div>
                <h2 className="card-title">7-Day Order Projection</h2>
              </div>
            </div>
            
            <div className="card-body">
              <div className="forecast-chart-container">
        <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={results.forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        `${value}`, 
                        name === 'orders' ? 'Forecasted Orders' : 'Base Orders'
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
                      dataKey="baseOrders" 
                      stroke="#E0E0E0" 
                      fill="url(#baseGradient)" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
            <Area 
              type="monotone" 
              dataKey="orders" 
              stroke="#E23A00" 
                      fill="url(#forecastGradient)" 
                      strokeWidth={3}
            />
            <defs>
                      <linearGradient id="baseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E0E0E0" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#E0E0E0" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E23A00" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#E23A00" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
              </div>
              
              <div className="forecast-legend">
                <div className="legend-item">
                  <div className="legend-dot forecast"></div>
                  <span>Forecasted Orders</span>
                </div>
                <div className="legend-item">
                  <div className="legend-dot base"></div>
                  <span>Base Orders</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatIfSimulator;