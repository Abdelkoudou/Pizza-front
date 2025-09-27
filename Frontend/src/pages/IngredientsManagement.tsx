import React, { useState } from 'react';
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
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  Tooltip,
  ComposedChart
} from 'recharts';

const IngredientsManagement: React.FC = () => {
  const [selectedIngredient, setSelectedIngredient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Daily');

  // Usage Data for Daily view
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

  const usageData = activeTab === 'Daily' ? dailyUsageData : weeklyUsageData;

  // Table Data
  const tableData = [
    { 
      name: 'Sauce Tomato', 
      kind: 'Topping', 
      priceDelta: '50 DZD', 
      stock: '6 Kg',
      hasWarning: true 
    },
    { 
      name: 'Sauce Tomato', 
      kind: 'Sauce', 
      priceDelta: '50 DZD', 
      stock: '6 Kg',
      hasWarning: false 
    },
    { 
      name: 'Sauce Tomato', 
      kind: 'Edge', 
      priceDelta: '50 DZD', 
      stock: '6 Kg',
      hasWarning: true 
    },
    { 
      name: 'Sauce Tomato', 
      kind: 'Size', 
      priceDelta: '50 DZD', 
      stock: '6 Kg',
      hasWarning: false 
    },
    { 
      name: 'Sauce Tomato', 
      kind: 'Topping', 
      priceDelta: '50 DZD', 
      stock: '6 Kg',
      hasWarning: true 
    },
    { 
      name: 'Sauce Tomato', 
      kind: 'Sauce', 
      priceDelta: '50 DZD', 
      stock: '6 Kg',
      hasWarning: false 
    },
    { 
      name: 'Sauce Tomato', 
      kind: 'Edge', 
      priceDelta: '50 DZD', 
      stock: '6 Kg',
      hasWarning: true 
    },
    { 
      name: 'Sauce Tomato', 
      kind: 'Size', 
      priceDelta: '50 DZD', 
      stock: '6 Kg',
      hasWarning: false 
    }
  ];

  return (
    <div className="ingredients-management">
      {/* Search and Action Bar */}
      <div className="search-filter-bar">
        <div className="search-filter-left">
          <button className="control-button">
            <Calendar className="nav-icon" />
            Today
          </button>
          <button className="control-button">
            <Filter className="nav-icon" />
          </button>
          <div className="search-input-group">
            <Search className="nav-icon" />
            <input type="text" placeholder="Q Search" />
          </div>
        </div>
        <button className="add-button">
          <Plus className="nav-icon" />
          Add New Items +
        </button>
      </div>

      {/* Ingredients Table */}
      <div className="staff-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>
                  Name
                  <div className="sort-icon">◆</div>
                </th>
                <th>
                  Kind
                  <div className="sort-icon">◆</div>
                </th>
                <th>
                  Price Delta
                  <div className="sort-icon">◆</div>
                </th>
                <th>
                  Stock
                  <div className="sort-icon">◆</div>
                </th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row, index) => (
                <tr key={index} onClick={() => setSelectedIngredient(row.name)} className="clickable-row">
                  <td>
                    <div className="name-cell">
                      {row.name}
                      {row.hasWarning && (
                        <AlertTriangle className="warning-icon" />
                      )}
                    </div>
                  </td>
                  <td>{row.kind}</td>
                  <td>{row.priceDelta}</td>
                  <td>{row.stock}</td>
                  <td>
                    <ChevronRight className="nav-icon" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ingredient Usage Modal */}
      {selectedIngredient && (
        <div className="modal-overlay" onClick={() => setSelectedIngredient(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedIngredient}</h2>
              <button 
                className="modal-close" 
                onClick={() => setSelectedIngredient(null)}
              >
                <X className="nav-icon" />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="modal-info">
                <p>Average Need</p>
                <div className="modal-metric">
                  6.2 kg/day
                  <span className="metric-change positive">+1.3%</span>
                </div>
              </div>
              
              <div className="modal-tabs">
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
            
            <div className="modal-chart">
              <ResponsiveContainer width="100%" height={200}>
                <ComposedChart data={usageData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey={activeTab === 'Daily' ? 'day' : 'week'} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis axisLine={false} tickLine={false} domain={[0, 125]} ticks={[0, 25, 50, 75, 100, 125]} />
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
        </div>
      )}
    </div>
  );
};

export default IngredientsManagement;
