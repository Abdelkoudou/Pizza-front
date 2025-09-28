import React, { useState, useEffect } from "react";
import {
  Calendar,
  Filter,
  Search,
  Plus,
  Users,
  Pizza,
  ShoppingBasket,
  Package,
  Coffee,
  Truck,
  User,
} from "lucide-react";
import { apiService, dataUtils } from '../utils/api';

const StaffManagement: React.FC = () => {
  const [config, setConfig] = useState<any[] | null>(null);
  const [assignment, setAssignment] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);          // main loading
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [loadingAssign, setLoadingAssign] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load staff config on mount
  useEffect(() => {
    loadStaffConfig();
  }, []);

  const wrapAsync = async (fn: () => Promise<void>, setPartial: React.Dispatch<React.SetStateAction<boolean>>) => {
    try {
      setPartial(true);
      setLoading(true);
      await fn();
    } catch (e: any) {
      setError(e.message || 'Unexpected error');
    } finally {
      setPartial(false);
      setLoading(false);
    }
  };

  const loadStaffConfig = () => wrapAsync(async () => {
    const staffConfig = await apiService.getStaffConfig();
    if (staffConfig) {
      const configData = [{
        date: staffConfig.forecast_info.forecast_date,
        shifts: [
          {
            name: `Morning (${staffConfig.morning_shift.shift_hours})`,
            orders: staffConfig.morning_shift.predicted_orders,
            roles: staffConfig.morning_shift.staffing_config,
          },
          {
            name: `Night (${staffConfig.night_shift.shift_hours})`,
            orders: staffConfig.night_shift.predicted_orders,
            roles: staffConfig.night_shift.staffing_config,
          }
        ],
        weather: staffConfig.weather_context
      }];
      setConfig(configData);
    }
  }, setLoadingConfig);

  const loadStaffAssignment = () => wrapAsync(async () => {
    const staffAssignment = await apiService.getStaffAssignment();
    if (staffAssignment) {
      const tomorrow = dataUtils.getTomorrowDate();
      const formattedDate = dataUtils.formatDateForDisplay(tomorrow);
      const assignmentData = [{
        date: formattedDate,
        day: staffAssignment.morning_shift.staff_assignment,
        night: staffAssignment.night_shift.staff_assignment,
        morningOrders: staffAssignment.morning_shift.predicted_orders,
        nightOrders: staffAssignment.night_shift.predicted_orders,
        totalCost: staffAssignment.total_daily_cost,
        weather: staffAssignment.weather_context
      }];
      setAssignment(assignmentData);
    }
  }, setLoadingAssign);

  const roleIcons: Record<string, React.ReactNode> = {
    dough: <Pizza className="inline w-4 h-4 mr-1 text-orange-600" />,
    topping: <ShoppingBasket className="inline w-4 h-4 mr-1 text-green-600" />,
    cashier: <User className="inline w-4 h-4 mr-1 text-blue-600" />,
    waiter: <Users className="inline w-4 h-4 mr-1 text-purple-600" />,
    delivery: <Truck className="inline w-4 h-4 mr-1 text-red-600" />,
    packaging: <Package className="inline w-4 h-4 mr-1 text-pink-600" />,
    bar: <Coffee className="inline w-4 h-4 mr-1 text-brown-600" />,
  };

  return (
    <div className="staff-management">
      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <span>Loading...</span>
        </div>
      )}

      <div className={`page-content-wrapper ${loading ? 'blurred' : ''}`}>
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
            Add New Staff +
          </button>
        </div>

        {error && (
          <div className="status-bar">
            <span className="error-text">Error: {error}</span>
          </div>
        )}

        <div className="staff-card">
          <div className="card-header">
            <div className="card-title-section">
              <div className="card-subtitle">Staff Planning</div>
              <h2 className="card-title">Best Staff Configuration</h2>
            </div>
            <button
              className="add-button"
              onClick={loadStaffConfig}
              disabled={loadingConfig}
            >
              {loadingConfig ? 'Loading...' : 'Get Best Config'}
            </button>
          </div>
          <div className="card-body">
            {(!config && loadingConfig) && (
              <div className="skeleton-block">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="skeleton-line" />
                ))}
              </div>
            )}
            {config && (
              <div className="config-list">
                {config.map((day, i) => (
                  <div key={i} className="config-item">
                    <h3 className="config-date">
                      📅 {day.date} {day.weather && ` - ${day.weather.temp_min_c}°C → ${day.weather.temp_max_c}°C`}
                    </h3>
                    {day.shifts.map((shift: any, idx: number) => (
                      <div key={idx} className="shift-section">
                        <p className="shift-name">
                          {shift.name} - Predicted Orders: {shift.orders}
                        </p>
                        <div className="roles-grid">
                          {Object.entries(shift.roles as Record<string, number>).map(([role, count]) => (
                            <div key={role} className="role-item">
                              {roleIcons[role]}
                              <span className="role-name">{role}</span>
                              <span className="role-count">{count} staff</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="staff-card">
          <div className="card-header">
            <div className="card-title-section">
              <div className="card-subtitle">Staff Planning</div>
              <h2 className="card-title">Best Staff Assignment</h2>
            </div>
            <button
              className="add-button"
              onClick={loadStaffAssignment}
              disabled={loadingAssign}
            >
              {loadingAssign ? 'Loading...' : 'Get Best Assignment'}
            </button>
          </div>
          <div className="card-body">
            {(!assignment && loadingAssign) && (
              <div className="skeleton-block">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton-line" />
                ))}
              </div>
            )}
            {assignment && (
              <div className="assignment-list">
                {assignment.map((day, i) => (
                  <div key={i} className="assignment-item">
                    <h3 className="assignment-date">
                      📅 {day.date} - Total Cost: {day.totalCost ? `${Math.round(day.totalCost).toLocaleString()} DZD` : 'N/A'}
                    </h3>
                    {day.weather && (
                      <div className="weather-info">
                        🌤️ {day.weather.temp_min_c}°C - {day.weather.temp_max_c}°C | Humidity {day.weather.humidity_pct}% | Rain {day.weather.precip_mm}mm
                      </div>
                    )}
                    <div className="shift-assignment">
                      <p className="shift-title">
                        Morning Shift (Forecast Orders: {day.morningOrders ?? '—'})
                      </p>
                      <div className="roles-grid">
                        {Object.entries(day.day as Record<string, string[]>).map(([role, people]) => (
                          <div key={role} className="role-item">
                            {roleIcons[role]}
                            <span className="role-name">{role}</span>
                            <span className="role-people">{people.join(', ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="shift-assignment">
                      <p className="shift-title">
                        Night Shift (Forecast Orders: {day.nightOrders ?? '—'})
                      </p>
                      <div className="roles-grid">
                        {Object.entries(day.night as Record<string, string[]>).map(([role, people]) => (
                          <div key={role} className="role-item">
                            {roleIcons[role]}
                            <span className="role-name">{role}</span>
                            <span className="role-people">{people.join(', ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
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
          background: rgba(255,255,255,0.68);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          font-weight: 500;
          color: #333;
        }
        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #e5e5e5;
          border-top: 5px solid #E23A00;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .page-content-wrapper.blurred {
          filter: blur(2px);
          pointer-events: none;
          user-select: none;
        }
        .skeleton-block {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 0.5rem 0;
        }
        .skeleton-line {
          height: 14px;
          width: 100%;
          border-radius: 4px;
          background: linear-gradient(90deg,#f2f2f2 25%,#e6e6e6 37%,#f2f2f2 63%);
          background-size: 400% 100%;
          animation: shimmer 1.2s ease-in-out infinite;
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

export default StaffManagement;