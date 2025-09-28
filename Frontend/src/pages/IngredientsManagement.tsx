import React, { useEffect, useMemo, useState } from 'react';
import { 
  Calendar, 
  Filter, 
  Search, 
  Plus, 
  ChevronRight,
  AlertTriangle,
  X
} from 'lucide-react';
import { 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  ComposedChart,
  Tooltip
} from 'recharts';
import { useTranslations } from '../i18n';

// =============================================
// Config
// =============================================
const PREDICT_BASE = 'http://127.0.0.1:8000';
const DAILY_ENDPOINT = `${PREDICT_BASE}/predict_ingredients`;
const WEEKLY_ENDPOINT = `${PREDICT_BASE}/predict_weekly_ingredients`;

const NUM_DAYS = 7;
const NUM_WEEKS = 4;

const formatYMD = (d: Date) => d.toISOString().slice(0,10);

const startOfISOWeek = (d: Date) => {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay() || 7;
  if (day !== 1) date.setUTCDate(date.getUTCDate() - (day - 1));
  return date;
};

// =============================================
// Types
// =============================================
interface IngredientsPredictionRecord {
  date: string;
  predictions: Record<string, number>;
}

interface WeeklyIngredientsPredictionRecord {
  week: string;
  predictions: Record<string, number>;
}

interface IngredientRow {
  name: string;
  kind: string;
  priceDelta: number;
  stock: number;
  hasWarning: boolean;
}

type ChartDatum = {
  label: string;
  solidOrange?: number;
  dottedGray?: number;
  dottedOrange?: number;
};

// =============================================
// Component
// =============================================
const IngredientsManagement: React.FC = () => {
  const t = useTranslations();
  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dailyDataRaw, setDailyDataRaw] = useState<IngredientsPredictionRecord[]>([]);
  const [weeklyDataRaw, setWeeklyDataRaw] = useState<WeeklyIngredientsPredictionRecord[]>([]);

  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'Daily' | 'Weekly'>('Daily');

  // Precompute requested dates/weeks
  const { requestedDates, requestedWeeks } = useMemo(() => {
    const today = new Date();
    const dates: string[] = [];
    for (let i = 0; i < NUM_DAYS; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push(formatYMD(d));
    }

    const weekStart = startOfISOWeek(today);
    const weeks: string[] = [];
    for (let i = 0; i < NUM_WEEKS; i++) {
      const w = new Date(weekStart);
      w.setDate(w.getDate() + i * 7);
      weeks.push(formatYMD(w));
    }
    return { requestedDates: dates, requestedWeeks: weeks };
  }, []);

  // Fetch daily
  useEffect(() => {
    let abort = false;
    (async () => {
      setLoadingDaily(true);
      try {
        const res = await fetch(DAILY_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dates: requestedDates })
        });
        if (!res.ok) throw new Error(`Daily fetch failed (${res.status})`);
        const json = await res.json();
        if (!abort) {
          setDailyDataRaw(Array.isArray(json) ? json : []);
        }
      } catch (e: any) {
        if (!abort) setError(e.message);
      } finally {
        if (!abort) setLoadingDaily(false);
      }
    })();
    return () => { abort = true; };
  }, [requestedDates]);

  // Fetch weekly
  useEffect(() => {
    let abort = false;
    (async () => {
      setLoadingWeekly(true);
      try {
        const res = await fetch(WEEKLY_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weeks: requestedWeeks })
        });
        if (!res.ok) throw new Error(`Weekly fetch failed (${res.status})`);
        const json = await res.json();
        if (!abort) {
          setWeeklyDataRaw(Array.isArray(json) ? json : []);
        }
      } catch (e: any) {
        if (!abort) setError(e.message);
      } finally {
        if (!abort) setLoadingWeekly(false);
      }
    })();
    return () => { abort = true; };
  }, [requestedWeeks]);

  // Build ingredient list
  const ingredientNames = useMemo(() => {
    const set = new Set<string>();
    weeklyDataRaw.forEach(r => {
      Object.keys(r.predictions || {}).forEach(k => {
        if (!['pizza', "25'", "30'", "35'", 'bordure'].some(word => k.trim().toLowerCase().includes(word)))
          set.add(k);
      });
    });
    if (set.size === 0) {
      dailyDataRaw.forEach(r => {
        Object.keys(r.predictions || {}).forEach(k => {
          if (!['pizza', "25'", "30'", "35'", 'bordure'].some(word => k.trim().toLowerCase().includes(word)))
            set.add(k);
        });
      });
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [weeklyDataRaw, dailyDataRaw]);

  const tableData: IngredientRow[] = useMemo(() => {
    const priceOptions = [10, 100, 150, 250];
    return ingredientNames.map(name => ({
      name,
      kind: 'Ingredient',
      priceDelta: priceOptions[Math.floor(Math.random() * priceOptions.length)],
      stock: Math.floor(Math.random() * 500),
      hasWarning: Math.random() < 0.15
    }));
  }, [ingredientNames]);

  const dailyChartData: ChartDatum[] = useMemo(() => {
    if (!selectedIngredient) return [];
    const todayStr = formatYMD(new Date());
    return dailyDataRaw
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(rec => {
        const rawVal = rec.predictions?.[selectedIngredient] ?? 0;
        const value = rawVal < 0 ? 0 : rawVal;
        const isTodayOrPast = rec.date <= todayStr;
        return {
          label: new Date(rec.date).toLocaleDateString(undefined, { weekday: 'short' }),
          ...(isTodayOrPast ? { solidOrange: value } : { dottedOrange: value })
        };
      });
  }, [dailyDataRaw, selectedIngredient]);

  const weeklyChartData: ChartDatum[] = useMemo(() => {
    if (!selectedIngredient) return [];
    const currentWeekStart = startOfISOWeek(new Date());
    const currentWeekStr = formatYMD(currentWeekStart);
    return weeklyDataRaw
      .slice()
      .sort((a, b) => a.week.localeCompare(b.week))
      .map((rec, idx) => {
        const rawVal = rec.predictions?.[selectedIngredient] ?? 0;
        const value = rawVal < 0 ? 0 : rawVal;
        const isCurrentOrPast = rec.week <= currentWeekStr;
        return {
          label: `W${idx + 1}`,
          ...(isCurrentOrPast ? { solidOrange: value } : { dottedOrange: value })
        };
      });
  }, [weeklyDataRaw, selectedIngredient]);

  const usageData = activeTab === 'Daily' ? dailyChartData : weeklyChartData;
  const overallLoading = loadingDaily || loadingWeekly;

  const handleRowClick = (name: string) => {
    setSelectedIngredient(name);
    setActiveTab('Daily');
  };

  return (
    <div className="ingredients-management">
      {/* Loading Overlay */}
      {overallLoading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <span>Loading predictions...</span>
        </div>
      )}

      {/* Content (blur when loading) */}
      <div className={`page-content-wrapper ${overallLoading ? 'blurred' : ''}`}>
        <div className="search-filter-bar">
          <div className="search-filter-left">
            <button className="control-button">
              <Calendar className="nav-icon" />
              {t.today}
            </button>
            <button className="control-button">
              <Filter className="nav-icon" />
            </button>
            <div className="search-input-group">
              <Search className="nav-icon" />
              <input type="text" placeholder={t.searchPlaceholder} />
            </div>
          </div>
          <button className="add-button" disabled>
            <Plus className="nav-icon" />
            {t.addNew} Items +
          </button>
        </div>

        {(error) && (
          <div className="status-bar">
            <span className="error-text">{t.errorMessage} {error}</span>
          </div>
        )}

        <div className="staff-card">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Kind</th>
                  <th>Price Delta</th>
                  <th>Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {!overallLoading && tableData.map((row, index) => (
                  <tr
                    key={row.name + index}
                    onClick={() => handleRowClick(row.name)}
                    className="clickable-row"
                  >
                    <td>
                      <div className="name-cell">
                        {row.name}
                        {row.hasWarning && <AlertTriangle className="warning-icon" />}
                      </div>
                    </td>
                    <td>{row.kind}</td>
                    <td>{row.priceDelta} da</td>
                    <td>{row.stock}</td>
                    <td><ChevronRight className="nav-icon" /></td>
                  </tr>
                ))}

                {overallLoading && (
                  Array.from({ length: 6 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="skeleton-row">
                      <td colSpan={5}>
                        <div className="skeleton-line" />
                      </td>
                    </tr>
                  ))
                )}

                {!overallLoading && tableData.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '1rem' }}>
                      No ingredients available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selectedIngredient && (
          <div className="modal-overlay" onClick={() => setSelectedIngredient(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{selectedIngredient}</h2>
                <button className="modal-close" onClick={() => setSelectedIngredient(null)}>
                  <X className="nav-icon" />
                </button>
              </div>

              <div className="modal-body">
                <div className="modal-info">
                  <p>Predicted Average Need</p>
                  <div className="modal-metric">
                    {(() => {
                      const dataSet = dailyChartData;
                      if (!dataSet.length) return '—';
                      const sum = dataSet.reduce((acc, d) => {
                        const v = d.solidOrange ?? d.dottedOrange ?? d.dottedGray ?? 0;
                        return acc + v;
                      }, 0);
                      const avg = sum / dataSet.length;
                      return `${avg.toFixed(2)} units/day`;
                    })()}
                  </div>
                </div>

                <div className="modal-tabs">
                  <button
                    className={`tab-button ${activeTab === 'Daily' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Daily')}
                  >
                    {t.daily}
                  </button>
                  <button
                    className={`tab-button ${activeTab === 'Weekly' ? 'active' : ''}`}
                    onClick={() => setActiveTab('Weekly')}
                  >
                    {t.weekly}
                  </button>
                </div>
              </div>

              <div className="modal-chart">
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart
                    data={usageData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      width={50}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip
                      formatter={(value: any) => [Number(value).toFixed(2), 'Predicted']}
                      labelFormatter={label => `${activeTab} ${label}`}
                    />
                    <Bar dataKey="solidOrange" fill="#E23A00" maxBarSize={18} />
                    <Bar dataKey="dottedGray" fill="url(#dottedGray)" maxBarSize={18} />
                    <Bar dataKey="dottedOrange" fill="url(#dottedOrange)" maxBarSize={18} />

                    <defs>
                      <pattern id="dottedGray" patternUnits="userSpaceOnUse" width="4" height="4">
                        <rect width="4" height="4" fill="#E0E0E0" />
                        <rect width="2" height="4" fill="transparent" />
                      </pattern>
                      <pattern id="dottedOrange" patternUnits="userSpaceOnUse" width="4" height="4">
                        <rect width="4" height="4" fill="#E23A00" />
                        <rect width="2" height="4" fill="transparent" />
                      </pattern>
                    </defs>
                  </ComposedChart>
                </ResponsiveContainer>
                {usageData.length === 0 && (
                  <div className="empty-chart-msg">
                    No prediction data for this ingredient.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>
        {`
        .loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(255,255,255,0.7);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          color: #333;
          font-weight: 500;
        }
        .spinner {
          width: 48px;
          height: 48px;
          border: 5px solid #eee;
          border-top: 5px solid #E23A00;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .page-content-wrapper.blurred {
          filter: blur(2px);
          pointer-events: none;
          user-select: none;
        }
        .skeleton-row .skeleton-line {
          height: 14px;
          width: 100%;
          background: linear-gradient(90deg,#f2f2f2 25%,#e6e6e6 37%,#f2f2f2 63%);
          background-size: 400% 100%;
          animation: shimmer 1.2s ease-in-out infinite;
          border-radius: 4px;
        }
        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        `}
      </style>
    </div>
  );
};

export default IngredientsManagement;