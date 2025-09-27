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
  const [loading, setLoading] = useState(false);

  // Load staff data on component mount
  useEffect(() => {
    loadStaffConfig();
  }, []);

  const loadStaffConfig = async () => {
    setLoading(true);
    try {
      const staffConfig = await apiService.getStaffConfig();
      if (staffConfig) {
        // Transform API data to match the existing UI format
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
    } catch (error) {
      console.error('Failed to load staff config:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStaffAssignment = async () => {
    setLoading(true);
    try {
      const staffAssignment = await apiService.getStaffAssignment();
      if (staffAssignment) {
        // Format the date for tomorrow
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
    } catch (error) {
      console.error('Failed to load staff assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Role to icon mapping
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
      {/* Search and Filter Bar */}
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

      {/* Config Card */}
      <div className="staff-card">
        <div className="card-header">
          <div className="card-title-section">
            <div className="card-subtitle">Staff Planning</div>
            <h2 className="card-title">Best Staff Configuration</h2>
          </div>
          <button
            className="add-button"
            onClick={loadStaffConfig}
          >
            {loading ? 'Loading...' : 'Get Best Config'}
          </button>
        </div>
        <div className="card-body">
          {config && (
            <div className="config-list">
              {config.map((day, i) => (
                <div key={i} className="config-item">
                  <h3 className="config-date">
                    📅 {day.date} - {day.weather && `${day.weather.temp_min_c}°C to ${day.weather.temp_max_c}°C`}
                  </h3>
                  {day.shifts.map((shift: any, idx: number) => (
                    <div key={idx} className="shift-section">
                      <p className="shift-name">{shift.name} - Predicted Orders: {shift.orders}</p>
                      <div className="roles-grid">
                        {Object.entries(
                          shift.roles as Record<string, number>
                        ).map(([role, count]) => (
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

      {/* Assignment Card */}
      <div className="staff-card">
        <div className="card-header">
          <div className="card-title-section">
            <div className="card-subtitle">Staff Planning</div>
            <h2 className="card-title">Best Staff Assignment</h2>
          </div>
          <button
            className="add-button"
            onClick={loadStaffAssignment}
          >
            {loading ? 'Loading...' : 'Get Best Assignment'}
          </button>
        </div>
        <div className="card-body">
          {assignment && (
            <div className="assignment-list">
              {assignment.map((day, i) => (
                <div key={i} className="assignment-item">
                  <h3 className="assignment-date">
                    📅 {day.date} - Total Cost: ${day.totalCost ? day.totalCost.toLocaleString() : 'N/A'} DZD
                  </h3>
                  {day.weather && (
                    <div className="weather-info">
                      🌤️ Weather: {day.weather.temp_min_c}°C - {day.weather.temp_max_c}°C, 
                      Humidity: {day.weather.humidity_pct}%, Rain: {day.weather.precip_mm}mm
                    </div>
                  )}
                  <div className="shift-assignment">
                    <p className="shift-title">
                      Morning Shift (Forecast Orders: {day.morningOrders || 340})
                    </p>
                    <div className="roles-grid">
                      {Object.entries(
                        day.day as Record<string, string[]>
                      ).map(([role, people]) => (
                        <div key={role} className="role-item">
                          {roleIcons[role]}
                          <span className="role-name">{role}</span>
                          <span className="role-people">{people.join(", ")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="shift-assignment">
                    <p className="shift-title">
                      Night Shift (Forecast Orders: {day.nightOrders || 570})
                    </p>
                    <div className="roles-grid">
                      {Object.entries(
                        day.night as Record<string, string[]>
                      ).map(([role, people]) => (
                        <div key={role} className="role-item">
                          {roleIcons[role]}
                          <span className="role-name">{role}</span>
                          <span className="role-people">{people.join(", ")}</span>
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
  );
};

export default StaffManagement;
