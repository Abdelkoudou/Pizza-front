import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Edit, Pizza as PizzaIcon } from 'lucide-react';
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
import { getPizzaByName } from '../utils/pizzaData';
import { apiService, dataUtils } from '../utils/api'; // still used for fallback ingredient mapping helpers

interface PizzaDetailProps {
  pizza: {
    id: number;
    name: string;
    sizes: string[];
    prices: string[];
    image: string;
    variantKeys: string[];
  };
  onBack: () => void;
  precomputedDailyRecords?: DailyPredRecord[];     // Passed from MenuManagement
  precomputedWeeklyRecords?: WeeklyPredRecord[];
  ingredientPredictionsTomorrow?: Record<string, number>;
}

interface DailyPredRecord {
  date: string;
  predictions: Record<string, number>;
}
interface WeeklyPredRecord {
  week: string;
  predictions: Record<string, number>;
}

type ForecastPointDaily = {
  day: string;
  real: number;
  predicted: number;
};

type ForecastPointWeekly = {
  week: string;
  real: number;
  predicted: number;
};

interface IngredientForecast {
  name: string;
  price: string;
  image: string;
  forecast: number;
}

const formatYMD = (d: Date) => d.toISOString().slice(0, 10);
const startOfISOWeek = (d: Date) => {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay() || 7;
  if (day !== 1) date.setUTCDate(date.getUTCDate() - (day - 1));
  return date;
};

const PizzaDetail: React.FC<PizzaDetailProps> = ({
  pizza,
  onBack,
  precomputedDailyRecords,
  precomputedWeeklyRecords,
  ingredientPredictionsTomorrow
}) => {
  const [activeTab, setActiveTab] = useState<'Daily' | 'Weekly'>('Daily');
  const [forecastData, setForecastData] = useState<(ForecastPointDaily | ForecastPointWeekly)[]>([]);
  const [ingredientForecasts, setIngredientForecasts] = useState<IngredientForecast[]>([]);
  const [localLoading, setLocalLoading] = useState(false); // fallback if passed data missing

  // Build chart whenever tab or dataset changes
  useEffect(() => {
    buildForecastData();
  }, [activeTab, pizza.variantKeys, precomputedDailyRecords, precomputedWeeklyRecords]);

  // Build ingredient forecast panel when pizza changes or ingredient predictions provided
  useEffect(() => {
    buildIngredientForecasts();
  }, [pizza.name, ingredientPredictionsTomorrow]);

  const buildForecastData = () => {
    setLocalLoading(true);
    try {
      if (activeTab === 'Daily') {
        if (!precomputedDailyRecords || !precomputedDailyRecords.length) {
          setForecastData([]);
          setLocalLoading(false);
          return;
        }
        const todayStr = formatYMD(new Date());
        const sorted = [...precomputedDailyRecords].sort((a, b) => a.date.localeCompare(b.date));
        const dailyPoints: ForecastPointDaily[] = sorted.map(rec => {
          let sum = 0;
          pizza.variantKeys.forEach(k => {
            const v = rec.predictions?.[k];
            if (typeof v === 'number') sum += v;
          });
          sum = Math.max(0, Math.round(sum));
          const dayName = new Date(rec.date).toLocaleDateString('en', { weekday: 'short' });
          const isReal = rec.date <= todayStr;
          return {
            day: dayName,
            real: isReal ? sum : 0,
            predicted: rec.date > todayStr ? sum : 0
          };
        });
        setForecastData(dailyPoints);
      } else {
        if (!precomputedWeeklyRecords || !precomputedWeeklyRecords.length) {
          setForecastData([]);
          setLocalLoading(false);
          return;
        }
        const weekStart = startOfISOWeek(new Date());
        const currentWeekStr = formatYMD(weekStart);
        const sorted = [...precomputedWeeklyRecords].sort((a, b) => a.week.localeCompare(b.week));
        const weeklyPoints: ForecastPointWeekly[] = sorted.map((rec, idx) => {
          let sum = 0;
          pizza.variantKeys.forEach(k => {
            const v = rec.predictions?.[k];
            if (typeof v === 'number') sum += v;
          });
          sum = Math.max(0, Math.round(sum));
          const isReal = rec.week <= currentWeekStr;
          return {
            week: `Week ${idx + 1}`,
            real: isReal ? sum : 0,
            predicted: rec.week > currentWeekStr ? sum : 0
          };
        });
        setForecastData(weeklyPoints);
      }
    } finally {
      setLocalLoading(false);
    }
  };

  const buildIngredientForecasts = () => {
    // Use provided ingredient predictions for tomorrow if available
    if (!ingredientPredictionsTomorrow) {
      setIngredientForecasts([]);
      return;
    }
    const pizzaData = getPizzaByName(pizza.name);
    const list: IngredientForecast[] = [];

    if (pizzaData && pizzaData.sizes.length > 0) {
      const medium = pizzaData.sizes.find(s => s.size === 30) || pizzaData.sizes[1] || pizzaData.sizes[0];
      medium.ingredients.forEach(ing => {
        let forecastValue = 0;
        const ingLower = ing.label.toLowerCase();
        Object.entries(ingredientPredictionsTomorrow).forEach(([key, value]) => {
          const keyLower = key.toLowerCase();
          if (
            keyLower.includes(ingLower) ||
            ingLower.includes(keyLower.split(' ')[0]) ||
            (ingLower.includes('tomato') && keyLower.includes('sauce tomate')) ||
            (ingLower.includes('mozzarella') && keyLower.includes('mozzarella')) ||
            (ingLower.includes('pepper') && keyLower.includes('pepper'))
          ) {
            if (typeof value === 'number') forecastValue = Math.max(forecastValue, value);
          }
        });
        list.push({
          name: ing.label,
          price: `${Math.round(ing.amount * 10)} DA`,
          image: pizza.image || pizzaImage,
          forecast: Math.round(forecastValue)
        });
      });
    } else {
      // fallback sample
      const p = ingredientPredictionsTomorrow;
      list.push(
        { name: 'Câpres', price: '20 DA', image: pizzaImage, forecast: Math.round(p['Capres'] || 18) },
        { name: 'Champignons', price: '170 DA', image: pizzaImage, forecast: Math.round(p['Champignons'] || 65) },
        { name: 'Gruyère', price: '100 DA', image: pizzaImage, forecast: Math.round(p['Gruyere'] || 68) },
        { name: 'Herbes italiennes', price: '0 DA', image: pizzaImage, forecast: Math.round(p['Herbes de Provence'] || 68) },
        { name: "Huile d'olive", price: '0 DA', image: pizzaImage, forecast: Math.round(p["Huile d'Olive"] || 67) },
        { name: 'Poulet', price: '160 DA', image: pizzaImage, forecast: Math.round(p["Double Chicken 30'"] || 25) }
      );
    }

    setIngredientForecasts(list);
  };

  const averageForecast = useMemo(() => {
    if (!forecastData.length) return null;
    const totals = forecastData.map((d: any) => (d.real || 0) + (d.predicted || 0));
    const sum = totals.reduce((a: number, b: number) => a + b, 0);
    return Math.round(sum / totals.length);
  }, [forecastData]);

  const yMax = useMemo(() => {
    let maxVal = 0;
    forecastData.forEach((d: any) => {
      maxVal = Math.max(maxVal, (d.real || 0), (d.predicted || 0));
    });
    if (maxVal === 0) return 10;
    const scaled = Math.ceil(maxVal * 1.2);
    const pow = Math.pow(10, Math.floor(Math.log10(scaled)));
    const steps = [1, 2, 5, 10];
    for (const s of steps) {
      const candidate = s * pow;
      if (candidate >= scaled) return candidate;
    }
    return scaled;
  }, [forecastData]);

  const showChartLoader = localLoading || (activeTab === 'Daily' && !precomputedDailyRecords?.length) || (activeTab === 'Weekly' && !precomputedWeeklyRecords?.length);

  return (
    <div className="pizza-detail-page">
      <div className="back-button-container">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft className="nav-icon" />
          Back to Menu
        </button>
      </div>

      <div className="pizza-detail-content">
        <div className="pizza-info-card">
          <div className="pizza-image-large">
            <img src={pizza.image} alt={pizza.name} />
          </div>
          <div className="pizza-details">
            <h2>{pizza.name}</h2>
            <p>Real & predicted aggregated demand for all size variants.</p>
            <div className="pizza-tag">
              <PizzaIcon className="nav-icon" />
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
                  {pizza.prices[index] || '—'}
                </div>
              </div>
            ))}
          </div>
          <button className="edit-button">
            <Edit className="nav-icon" />
          </button>
        </div>

        <div className="main-content-row">
          <div className="revenue-card">
            <div className="revenue-header">
              <div className="revenue-info">
                <h3>Demand Forecast</h3>
                <div className="revenue-metric">
                  {averageForecast !== null ? `${averageForecast} avg` : '—'}
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
              {showChartLoader && (
                <div className="mini-loader">
                  <div className="mini-spinner" />
                  <span>Building chart...</span>
                </div>
              )}
              {!showChartLoader && (
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart
                    data={forecastData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey={activeTab === 'Daily' ? 'day' : 'week'}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={50}
                      domain={[0, yMax]}
                      tickFormatter={(v) => Math.round(v).toString()}
                    />
                    <Tooltip
                      formatter={(value: any, name: string) => [
                        Math.round(value).toString(),
                        name === 'real' ? 'Real' : 'Predicted'
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
                      dataKey="real"
                      stroke="#10B981"
                      fill="url(#realGradient)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="predicted"
                      stroke="#E23A00"
                      fill="url(#predictedGradient)"
                      strokeWidth={2}
                    />
                    <defs>
                      <linearGradient id="realGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.08} />
                      </linearGradient>
                      <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#E23A00" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#E23A00" stopOpacity={0.08} />
                      </linearGradient>
                    </defs>
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="toppings-card">
            <h3>Topping - Forecast for Tomorrow</h3>
            <div className="toppings-grid">
              {ingredientForecasts.map((topping, index) => (
                <div key={index} className="topping-item">
                  <div className="topping-image">
                    <img src={topping.image} alt={topping.name} />
                  </div>
                  <div className="topping-info">
                    <span className="topping-name">{topping.name}</span>
                    <span className="topping-price">{topping.price}</span>
                    <span className="topping-forecast">
                      Forecast: {Math.round(topping.forecast)} units
                    </span>
                  </div>
                </div>
              ))}
              {!ingredientForecasts.length && (
                <div className="empty-state small">
                  No ingredient forecasts available.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
        .mini-loader {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          justify-content: center;
          height: 200px;
          font-size: 0.85rem;
          color: #555;
        }
        .mini-spinner {
          width: 30px;
          height: 30px;
          border: 3px solid #eee;
          border-top: 3px solid #E23A00;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        `}
      </style>
    </div>
  );
};

export default PizzaDetail;