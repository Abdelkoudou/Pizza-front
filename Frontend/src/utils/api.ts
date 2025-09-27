// API utility functions for backend integration
const API_BASE_URL_FORECASTING = 'http://127.0.0.1:8000';
const API_BASE_URL_STAFF = 'http://127.0.0.1:8001';

// Types for API responses
export interface OrderPrediction {
  date?: string;
  hour?: string;
  week?: string;
  predicted_orders: number;
}

export interface IngredientPrediction {
  date: string;
  predictions: Record<string, number>;
}

export interface WeeklyIngredientPrediction {
  week: string;
  predictions: Record<string, number>;
}

export interface StaffAssignmentResponse {
  forecast_info: {
    forecast_date: string;
    forecast_day: string;
    generated_at: string;
  };
  weather_context: {
    date: string;
    temp_min_c: number;
    temp_max_c: number;
    humidity_pct: number;
    wind_kph: number;
    precip_mm: number;
    precip_prob: number;
  };
  morning_shift: {
    shift_hours: string;
    predicted_orders: number;
    staffing_needs: Record<string, number>;
    staff_assignment: Record<string, string[]>;
    estimated_cost: number;
    forbidden_staff: string[];
  };
  night_shift: {
    shift_hours: string;
    predicted_orders: number;
    staffing_needs: Record<string, number>;
    staff_assignment: Record<string, string[]>;
    estimated_cost: number;
    forbidden_staff: string[];
  };
  total_daily_cost: number;
}

export interface StaffConfigResponse {
  weather_context: {
    date: string;
    temp_min_c: number;
    temp_max_c: number;
    humidity_pct: number;
    wind_kph: number;
    precip_mm: number;
    precip_prob: number;
  };
  morning_shift: {
    predicted_orders: number;
    staffing_config: Record<string, number>;
    shift_hours: string;
  };
  night_shift: {
    predicted_orders: number;
    staffing_config: Record<string, number>;
    shift_hours: string;
  };
  forecast_info: {
    forecast_date: string;
    forecast_day: string;
    generated_at: string;
  };
}

// API Functions with mock data fallback
export const apiService = {
  // Order predictions - hourly
  async getHourlyPredictions(timestamps: string[], context: any[]): Promise<OrderPrediction[]> {
    try {
      const response = await fetch(`${API_BASE_URL_FORECASTING}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamps, context })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
    }
    
    // Fallback mock data
    return [
      { hour: "2022-08-28T18:00:00+00:00", predicted_orders: 28.9 }
    ];
  },

  // Order predictions - daily  
  async getDailyPredictions(dates: string[], context: any[]): Promise<OrderPrediction[]> {
    try {
      const response = await fetch(`${API_BASE_URL_FORECASTING}/predict_daily`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dates, context })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
    }
    
    // Fallback mock data
    return [
      { date: "2025-09-28T00:00:00", predicted_orders: 148.7 }
    ];
  },

  // Order predictions - weekly
  async getWeeklyPredictions(weeks: string[]): Promise<OrderPrediction[]> {
    try {
      const response = await fetch(`${API_BASE_URL_FORECASTING}/predict_weekly`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeks })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
    }
    
    // Fallback mock data
    return [
      { week: "2026-09-28T00:00:00", predicted_orders: 985.9 }
    ];
  },

  // Ingredient predictions - daily
  async getDailyIngredientPredictions(dates: string[]): Promise<IngredientPrediction[]> {
    try {
      const response = await fetch(`${API_BASE_URL_FORECASTING}/predict_ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dates })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
    }
    
    // Fallback mock data
    return [
      {
        date: "2026-09-28",
        predictions: {
          "Tomato Sauce": 15.5,
          "Mozzarella": 25.8,
          "Pepperoni": 18.2,
          "Mushrooms": 12.4,
          "Onions": 8.9
        }
      }
    ];
  },

  // Ingredient predictions - weekly
  async getWeeklyIngredientPredictions(weeks: string[]): Promise<WeeklyIngredientPrediction[]> {
    try {
      const response = await fetch(`${API_BASE_URL_FORECASTING}/predict_weekly_ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeks })
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
    }
    
    // Fallback mock data
    return [
      {
        week: "2026-09-28",
        predictions: {
          "Tomato Sauce": 68.5,
          "Mozzarella": 120.8,
          "Pepperoni": 85.2,
          "Mushrooms": 64.7,
          "Onions": 40.1
        }
      }
    ];
  },

  // Staff assignment
  async getStaffAssignment(): Promise<StaffAssignmentResponse | null> {
    try {
      const response = await fetch(`${API_BASE_URL_STAFF}/staff-assignment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
    }
    
    // Fallback mock data
    return {
      forecast_info: {
        forecast_date: "2025-09-28",
        forecast_day: "Sunday, September 28, 2025",
        generated_at: "2025-09-27T13:24:12.611934"
      },
      weather_context: {
        date: "2025-09-28",
        temp_min_c: 14.3,
        temp_max_c: 22.8,
        humidity_pct: 71,
        wind_kph: 18.4,
        precip_mm: 0.27,
        precip_prob: 88
      },
      morning_shift: {
        shift_hours: "08:00 - 16:00",
        predicted_orders: 238,
        staffing_needs: {
          dough: 2,
          topping: 2,
          cashier: 2,
          waiter: 3,
          delivery: 2,
          packaging: 2,
          bar: 2
        },
        staff_assignment: {
          dough: ["Youssef", "Karim"],
          topping: ["Khaled", "Hassan"],
          cashier: ["Nour", "Amel"],
          waiter: ["Rania", "Samir", "Salima"],
          delivery: ["Salem", "Nadia"],
          packaging: ["Ahmed", "Leila"],
          bar: ["Zineb", "Omar"]
        },
        estimated_cost: 37990.0,
        forbidden_staff: []
      },
      night_shift: {
        shift_hours: "17:00 - 00:00",
        predicted_orders: 222,
        staffing_needs: {
          dough: 2,
          topping: 2,
          cashier: 2,
          waiter: 3,
          delivery: 2,
          packaging: 2,
          bar: 2
        },
        staff_assignment: {
          dough: ["Youssef", "Karim"],
          topping: ["Khaled", "Hassan"],
          cashier: ["Nour", "Amel"],
          waiter: ["Rania", "Samir", "Salima"],
          delivery: ["Salem", "Nadia"],
          packaging: ["Ahmed", "Leila"],
          bar: ["Zineb", "Omar"]
        },
        estimated_cost: 37990.0,
        forbidden_staff: []
      },
      total_daily_cost: 75980.0
    };
  },

  // Staff configuration
  async getStaffConfig(): Promise<StaffConfigResponse | null> {
    try {
      const response = await fetch(`${API_BASE_URL_STAFF}/staffing-config`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('API call failed, using mock data:', error);
    }
    
    // Fallback mock data
    return {
      weather_context: {
        date: "2025-09-28",
        temp_min_c: 14.3,
        temp_max_c: 22.8,
        humidity_pct: 71,
        wind_kph: 18.4,
        precip_mm: 0.27,
        precip_prob: 88
      },
      morning_shift: {
        predicted_orders: 238,
        staffing_config: {
          dough: 2,
          topping: 2,
          cashier: 2,
          waiter: 3,
          delivery: 2,
          packaging: 2,
          bar: 2
        },
        shift_hours: "08:00 - 16:00"
      },
      night_shift: {
        predicted_orders: 222,
        staffing_config: {
          dough: 2,
          topping: 2,
          cashier: 2,
          waiter: 3,
          delivery: 2,
          packaging: 2,
          bar: 2
        },
        shift_hours: "17:00 - 00:00"
      },
      forecast_info: {
        forecast_date: "2025-09-28",
        forecast_day: "Sunday, September 28, 2025",
        generated_at: "2025-09-27T13:26:39.003890"
      }
    };
  }
};

// Utility functions for data processing
export const dataUtils = {
  // Format date for API calls
  formatDateForAPI(date: Date): string {
    return date.toISOString().split('T')[0];
  },

  // Format date for display
  formatDateForDisplay(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  },

  // Get tomorrow's date
  getTomorrowDate(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  },

  // Find most forecasted ingredient
  getMostForecastedIngredient(predictions: Record<string, number>): { name: string; value: number } {
    let maxName = '';
    let maxValue = 0;
    
    for (const [name, value] of Object.entries(predictions)) {
      if (value > maxValue) {
        maxValue = value;
        maxName = name;
      }
    }
    
    return { name: maxName, value: maxValue };
  }
};