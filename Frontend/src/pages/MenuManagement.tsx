import React, { useState, useEffect, useMemo } from 'react';
import { Eye } from 'lucide-react';
import pizzaImage from '../pizza image.png';
import SearchContainer from '../components/SearchContainer';
import PizzaDetail from './PizzaDetail';
import { getMenuPizzas } from '../utils/pizzaData';

interface MenuItem {
  id: number;
  name: string;
  sizes: string[];
  prices: string[];
  image: string;
  variantKeys: string[];
  todayForecast?: number;
}

interface DailyPredRecord {
  date: string;
  predictions: Record<string, number>;
}
interface WeeklyPredRecord {
  week: string;
  predictions: Record<string, number>;
}

const PREDICT_BASE = 'http://127.0.0.1:8000';
const DAILY_ENDPOINT = `${PREDICT_BASE}/predict_ingredients`;
const WEEKLY_ENDPOINT = `${PREDICT_BASE}/predict_weekly_ingredients`;

const NUM_WEEKS = 4;
const DAILY_WINDOW_DAYS = 7; // 2 past, today, 4 future

const formatYMD = (d: Date) => d.toISOString().slice(0, 10);
const startOfISOWeek = (d: Date) => {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = date.getUTCDay() || 7;
  if (day !== 1) date.setUTCDate(date.getUTCDate() - (day - 1));
  return date;
};

const generateDailyWindowDates = () => {
  const dates: string[] = [];
  for (let i = -2; i < DAILY_WINDOW_DAYS - 2; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(formatYMD(d));
  }
  return dates;
};

// Identify keys treated as pizza variants
const isPizzaVariantKey = (k: string) => {
  const lower = k.toLowerCase();
  return (
    lower.includes('pizza') ||
    lower.includes("25'") ||
    lower.includes("30'") ||
    lower.includes("35'") ||
    lower.includes('bordure')
  );
};

// Exclusions
const EXCLUDED_VARIANTS = new Set([
  'bordure fine',
  'bordure traditionnelle'
]);

// Parse a raw variant key into base + size
function parsePizzaVariant(raw: string): { base: string; size: string | null } {
  const original = raw.trim();
  const pattern1 = /^pizza\s+(.+?)\s*\(pâte\s+([lms])\)/i;
  const m1 = original.match(pattern1);
  if (m1) {
    return { base: normalizeBaseName(m1[1]), size: m1[2].toUpperCase() };
  }
  const pattern2 = /^(.+?)\s+(25'|30'|35')$/i;
  const m2 = original.match(pattern2);
  if (m2) {
    return { base: normalizeBaseName(m2[1]), size: sizeFromInchToken(m2[2]) };
  }
  let base = original;
  if (/^pizza\s+/i.test(base)) base = base.replace(/^pizza\s+/i, '');
  base = base.replace(/\(pâte\s+[lms]\)/i, '').trim();
  return { base: normalizeBaseName(base), size: null };
}

function sizeFromInchToken(token: string): string {
  switch (token) {
    case "25'": return 'S';
    case "30'": return 'M';
    case "35'": return 'L';
    default: return token;
  }
}

function normalizeBaseName(name: string): string {
  let n = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  n = n.replace(/\s{2,}/g, ' ').trim();
  n = n.replace(/\bmargharita\b/i, 'Margherita');
  n = n.replace(/\bmerguez\b/i, 'Merguez');
  return n;
}

function canonicalKey(base: string): string {
  return base.toLowerCase().replace(/\s+/g, ' ').trim();
}

const MenuManagement: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('Pizza');
  const [selectedPizza, setSelectedPizza] = useState<MenuItem | null>(null);

  // Pre-fetched datasets
  const [dailyWindowRecords, setDailyWindowRecords] = useState<DailyPredRecord[]>([]);
  const [weeklyRecords, setWeeklyRecords] = useState<WeeklyPredRecord[]>([]);
  const [tomorrowIngredientPredictions, setTomorrowIngredientPredictions] = useState<Record<string, number> | null>(null);

  const [loadingDaily, setLoadingDaily] = useState(false);
  const [loadingWeekly, setLoadingWeekly] = useState(false);
  const [loadingTomorrow, setLoadingTomorrow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loading = loadingDaily || loadingWeekly || loadingTomorrow;

  // Fetch daily window
  useEffect(() => {
    const run = async () => {
      setLoadingDaily(true);
      try {
        const dates = generateDailyWindowDates();
        const res = await fetch(DAILY_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dates })
        });
        if (!res.ok) throw new Error(`Daily window fetch failed (${res.status})`);
        const json = await res.json();
        setDailyWindowRecords(Array.isArray(json) ? json : []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoadingDaily(false);
      }
    };
    run();
  }, []);

  // Fetch weekly window
  useEffect(() => {
    const run = async () => {
      setLoadingWeekly(true);
      try {
        const weekStart = startOfISOWeek(new Date());
        const weeks: string[] = [];
        for (let i = 0; i < NUM_WEEKS; i++) {
          const w = new Date(weekStart);
          w.setDate(w.getDate() + i * 7);
          weeks.push(formatYMD(w));
        }
        const res = await fetch(WEEKLY_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ weeks })
        });
        if (!res.ok) throw new Error(`Weekly fetch failed (${res.status})`);
        const json = await res.json();
        setWeeklyRecords(Array.isArray(json) ? json : []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoadingWeekly(false);
      }
    };
    run();
  }, []);

  // Fetch tomorrow ingredient predictions once (shared cache)
  useEffect(() => {
    const run = async () => {
      setLoadingTomorrow(true);
      try {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dates = [formatYMD(tomorrow)];
        const res = await fetch(DAILY_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dates })
        });
        if (!res.ok) throw new Error(`Tomorrow ingredient fetch failed (${res.status})`);
        const json: DailyPredRecord[] = await res.json();
        if (json.length) {
          setTomorrowIngredientPredictions(json[0].predictions || {});
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoadingTomorrow(false);
      }
    };
    run();
  }, []);

  // Group by canonical base
  const groupedPizzas = useMemo(() => {
    interface Group {
      displayBase: string;
      variantKeys: Set<string>;
      sizes: Set<string>;
    }
    const groups: Record<string, Group> = {};

    // Prefer weekly keys for coverage
    const collectSources: (DailyPredRecord | WeeklyPredRecord)[] = [...weeklyRecords, ...dailyWindowRecords];

    collectSources.forEach(rec => {
      const predictions = (rec as any).predictions || {};
      Object.keys(predictions).forEach(k => {
        const lowerRaw = k.toLowerCase();
        if (!isPizzaVariantKey(k)) return;
        if (EXCLUDED_VARIANTS.has(lowerRaw)) return;
        const { base, size } = parsePizzaVariant(k);
        const cKey = canonicalKey(base);
        if (!groups[cKey]) {
          groups[cKey] = { displayBase: base, variantKeys: new Set(), sizes: new Set() };
        }
        groups[cKey].variantKeys.add(k);
        if (size) groups[cKey].sizes.add(size);
      });
    });

    return groups;
  }, [dailyWindowRecords, weeklyRecords]);

  // Static menu fallback
  const staticPizzas = useMemo(() => getMenuPizzas(pizzaImage), []);
  const staticMap = useMemo(() => {
    const m: Record<string, (typeof staticPizzas)[number]> = {};
    staticPizzas.forEach(p => {
      m[canonicalKey(p.name)] = p;
    });
    return m;
  }, [staticPizzas]);

  const menuItems: MenuItem[] = useMemo(() => {
    const todayStr = formatYMD(new Date());
    const todayRecord = dailyWindowRecords.find(r => r.date === todayStr);
    let idCounter = 1;

    return Object.entries(groupedPizzas).map(([cKey, group]) => {
      let todaySum = 0;
      if (todayRecord) {
        group.variantKeys.forEach(k => {
          const v = todayRecord.predictions?.[k];
            if (typeof v === 'number') todaySum += v;
        });
      }
      todaySum = Math.max(0, Math.round(todaySum));
      const staticEntry = staticMap[cKey] ||
        staticPizzas.find(p =>
          canonicalKey(p.name) === cKey ||
          canonicalKey(p.name).includes(cKey) ||
          cKey.includes(canonicalKey(p.name))
        );
      const sizes = group.sizes.size
        ? Array.from(group.sizes).sort()
        : (staticEntry ? staticEntry.sizes : ['S', 'M', 'L']);

      let prices: string[] = [];
      if (staticEntry) prices = staticEntry.prices.slice(0, sizes.length);
      else prices = sizes.map((_, i) => `${1500 + i * 200} DA`);

      return {
        id: idCounter++,
        name: group.displayBase,
        sizes,
        prices,
        image: staticEntry ? staticEntry.image : pizzaImage,
        variantKeys: Array.from(group.variantKeys),
        todayForecast: todaySum
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [groupedPizzas, dailyWindowRecords, staticMap, staticPizzas]);

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

  if (selectedPizza) {
    return (
      <PizzaDetail
        pizza={selectedPizza}
        onBack={() => setSelectedPizza(null)}
        precomputedDailyRecords={dailyWindowRecords}
        precomputedWeeklyRecords={weeklyRecords}
        ingredientPredictionsTomorrow={tomorrowIngredientPredictions || undefined}
      />
    );
  }

  return (
    <div className="menu-management">
      <SearchContainer />

      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <span>Loading forecasts...</span>
        </div>
      )}

      <div className={`content-grid ${loading ? 'blurred' : ''}`}>
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
          {error && <div className="error-text small">{error}</div>}
        </div>

        <div className="menu-section">
          <h2>Classic</h2>
          <div className="menu-grid">
            {!loading && menuItems.map((item) => (
              <div
                key={item.id}
                className="menu-item"
                onClick={() => setSelectedPizza(item)}
              >
                <div className="menu-item-actions">
                  <button className="action-button" onClick={() => setSelectedPizza(item)}>
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
                {item.todayForecast !== undefined && (
                  <div className="menu-item-prices">
                    <span className="price small">
                      Today: {item.todayForecast}
                    </span>
                  </div>
                )}
              </div>
            ))}
            {!loading && menuItems.length === 0 && (
              <div className="empty-state">
                No pizza forecast data available.
              </div>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
        .loading-overlay {
          position: fixed;
          inset: 0;
          background: rgba(255,255,255,0.65);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: center;
          justify-content: center;
          z-index: 999;
          font-weight: 500;
          color: #333;
        }
        .loading-overlay .spinner {
          width: 42px;
          height: 42px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #E23A00;
          border-radius: 50%;
          animation: spin 0.9s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .content-grid.blurred {
          filter: blur(2px);
          pointer-events: none;
          user-select: none;
        }
        `}
      </style>
    </div>
  );
};

export default MenuManagement;