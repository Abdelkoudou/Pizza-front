from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
import math
import pulp
import requests
from datetime import datetime, timedelta
import pytz

app = FastAPI()

# Weather API Configuration
API_KEY = "d482f7e538604e6ba99200013252209"
LOCATION = "Constantine,Algeria"

# Forecast API Configuration (assuming it's running on localhost:8000)
FORECAST_API_URL = "http://localhost:8000"

# ------------------------------
# Weather Data Fetching
# ------------------------------
def fetch_weather_data():
    """Fetch current weather data and format it for forecasting"""
    url = f"http://api.weatherapi.com/v1/forecast.json?key={API_KEY}&q={LOCATION}&days=1&aqi=no&alerts=no"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        
        # Get today's date
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Extract forecast data for today
        forecast_day = data["forecast"]["forecastday"][0]
        day_data = forecast_day["day"]
        
        # Format the context data
        context = {
            "date": today,
            "temp_min_c": day_data["mintemp_c"],
            "temp_max_c": day_data["maxtemp_c"],
            "humidity_pct": day_data["avghumidity"],
            "wind_kph": day_data["maxwind_kph"],
            "precip_mm": day_data["totalprecip_mm"],
            "precip_prob": day_data.get("daily_chance_of_rain", 0)
        }
        
        return context
        
    except requests.exceptions.RequestException as e:
        print(f"Weather API error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch weather data")
    except KeyError as e:
        print(f"Weather data parsing error: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse weather data")

def generate_shift_timestamps(shift_type: str):
    """Generate hourly timestamps for morning (8-16) or night (17-00) shift"""
    today = datetime.now().date()
    timestamps = []
    
    if shift_type == "morning":
        # Morning shift: 8 AM to 4 PM (8-16)
        for hour in range(8, 17):  # 8 to 16 inclusive
            dt = datetime.combine(today, datetime.min.time().replace(hour=hour))
            timestamps.append(dt.strftime("%Y-%m-%dT%H:00:00Z"))
    elif shift_type == "night":
        # Night shift: 5 PM to 12 AM (17-00)
        for hour in range(17, 24):  # 17 to 23
            dt = datetime.combine(today, datetime.min.time().replace(hour=hour))
            timestamps.append(dt.strftime("%Y-%m-%dT%H:00:00Z"))
        # Add midnight (00:00)
        midnight = datetime.combine(today + timedelta(days=1), datetime.min.time())
        timestamps.append(midnight.strftime("%Y-%m-%dT%H:00:00Z"))
    
    return timestamps

def get_shift_orders_forecast(shift_type: str, context: dict):
    """Get orders forecast for a specific shift"""
    timestamps = generate_shift_timestamps(shift_type)
    
    forecast_data = {
        "timestamps": timestamps,
        "context": [context]
    }
    
    try:
        response = requests.post(f"{FORECAST_API_URL}/predict", json=forecast_data)
        response.raise_for_status()
        predictions = response.json()
        
        # Sum all predicted orders for the shift
        total_orders = sum(prediction["predicted_orders"] for prediction in predictions)
        return int(round(total_orders))
        
    except requests.exceptions.RequestException as e:
        print(f"Forecast API error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch orders forecast")
    except (KeyError, ValueError) as e:
        print(f"Forecast data parsing error: {e}")
        raise HTTPException(status_code=500, detail="Failed to parse forecast data")

def get_hourly_forecast(timestamps: List[str], context: dict):
    """Call the hourly forecast API"""
    forecast_data = {
        "timestamps": timestamps,
        "context": [context]
    }
    
    try:
        response = requests.post(f"{FORECAST_API_URL}/predict", json=forecast_data)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500)

# ------------------------------
# Staffing Config Function
# ------------------------------
def get_staffing_config(orders_forecast: int) -> dict:
    """Calculate staffing configuration based on orders forecast"""
    rules = {
        "dough": (1, 2),
        "topping": (1, 2),
        "cashier": (1, 2),
        "waiter": (1, 3),
        "delivery": (1, 2),
        "packaging": (1, 2),
        "bar": (1, 2)
    }
    scale = math.ceil(orders_forecast / 50) if orders_forecast > 0 else 1
    staffing = {role: min(base + (scale - 1), max_staff) for role, (base, max_staff) in rules.items()}
    return staffing

def get_shift_staffing_configs():
    """Get staffing configurations for both morning and night shifts"""
    try:
        # Fetch weather context
        weather_context = fetch_weather_data()
        
        # Get orders forecast for morning shift
        morning_orders = get_shift_orders_forecast("morning", weather_context)
        morning_config = get_staffing_config(morning_orders)
        
        # Get orders forecast for night shift
        night_orders = get_shift_orders_forecast("night", weather_context)
        night_config = get_staffing_config(night_orders)
        
        return {
            "weather_context": weather_context,
            "morning_shift": {
                "predicted_orders": morning_orders,
                "staffing_config": morning_config,
                "shift_hours": "08:00 - 16:00"
            },
            "night_shift": {
                "predicted_orders": night_orders,
                "staffing_config": night_config,
                "shift_hours": "17:00 - 00:00"
            }
        }
        
    except Exception as e:
        print(f"Error in get_shift_staffing_configs: {e}")
        raise

# ------------------------------
# Staff Assignment Optimizer
# ------------------------------
staff_pool = [
    {"name": "Ahmed",   "wage": 2500, "skills": ["cashier", "packaging"]},
    {"name": "Youssef", "wage": 3000, "skills": ["dough", "bar"]},
    {"name": "Khaled",  "wage": 2700, "skills": ["topping", "waiter"]},
    {"name": "Rania",   "wage": 2400, "skills": ["waiter", "packaging"]},
    {"name": "Fatima",  "wage": 3200, "skills": ["bar", "dough", "topping"]},
    {"name": "Samir",   "wage": 2600, "skills": ["cashier", "waiter", "packaging"]},
    {"name": "Houda",   "wage": 3100, "skills": ["dough", "topping", "packaging"]},
    {"name": "Zineb",   "wage": 2900, "skills": ["waiter", "cashier", "bar"]},
    {"name": "Karim",   "wage": 2500, "skills": ["topping", "dough"]},
    {"name": "Leila",   "wage": 2600, "skills": ["cashier", "packaging"]},
    {"name": "Omar",    "wage": 2400, "skills": ["packaging", "bar"]},
    {"name": "Nour",    "wage": 2500, "skills": ["cashier", "topping"]},
    {"name": "Salima",  "wage": 2600, "skills": ["waiter", "packaging"]},
    {"name": "Hassan",  "wage": 2700, "skills": ["bar", "topping"]},
    {"name": "Amel",    "wage": 2550, "skills": ["topping", "cashier"]},
    {"name": "Djamila", "wage": 2800, "skills": ["delivery"]},
    {"name": "Imane",   "wage": 2700, "skills": ["delivery"]},
    {"name": "Walid",   "wage": 2600, "skills": ["delivery"]},
    {"name": "Salem",   "wage": 2500, "skills": ["delivery"]},
    {"name": "Nadia",   "wage": 2550, "skills": ["delivery"]},
]

def optimize_staff_assignment(staff_pool, needs, forbidden=[]):
    roles = list(needs.keys())
    prob = pulp.LpProblem("StaffAssignment", pulp.LpMinimize)
    x = {}
    for s in staff_pool:
        if s["name"] in forbidden: continue
        for r in roles:
            if r in s["skills"]:
                x[(s["name"], r)] = pulp.LpVariable(f"{s['name']}_{r}", 0, 1, cat="Binary")
    for r in roles:
        if r == "delivery":
            x[("TEMP", r)] = pulp.LpVariable(f"TEMP_{r}", 0, 0, cat="Integer")
        else:
            x[("TEMP", r)] = pulp.LpVariable(f"TEMP_{r}", 0, needs[r], cat="Integer")
    prob += (
        pulp.lpSum([
            (s["wage"] if r != "delivery" else s["wage"] * 0.8) * x[(s["name"], r)]
            for s in staff_pool for r in roles if (s["name"], r) in x
        ])
        + pulp.lpSum([20000 * x[("TEMP", r)] for r in roles])
    )
    for r in roles:
        prob += (pulp.lpSum([x[(s["name"], r)] for s in staff_pool if (s["name"], r) in x]) + x[("TEMP", r)] == needs[r])
    for s in staff_pool:
        if s["name"] in forbidden: continue
        prob += pulp.lpSum([x[(s["name"], r)] for r in roles if (s["name"], r) in x]) <= 1
    if "delivery" in needs:
        delivery_staff = [s for s in staff_pool if "delivery" in s["skills"]]
        if delivery_staff:
            prob += pulp.lpSum([x[(s["name"], "delivery")] for s in delivery_staff if (s["name"], "delivery") in x]) >= needs["delivery"]
    for r in roles:
        if r != "delivery": prob += x[("TEMP", r)] <= 1
    prob.solve(pulp.PULP_CBC_CMD(msg=0))
    assignment = {r: [] for r in roles}
    for (s_name, r), var in x.items():
        if pulp.value(var) > 0.5:
            assignment[r].append("TEMP-HIRE" if s_name == "TEMP" else s_name)
    return assignment

# ------------------------------
# FastAPI Schemas
# ------------------------------
class ForecastRequest(BaseModel):
    orders_forecast: int

class AssignmentRequest(BaseModel):
    forbidden: Optional[List[str]] = []

class ShiftPlanningResponse(BaseModel):
    weather_context: dict
    morning_shift: dict
    night_shift: dict

# ------------------------------
# API Endpoints
# ------------------------------
@app.get("/staffing-config")
def staffing_config():
    """Get automatic staffing configuration for both shifts based on weather and forecast data"""
    try:
        config = get_shift_staffing_configs()
        # Add forecast date information
        forecast_date = datetime.now().strftime("%Y-%m-%d")
        config["forecast_info"] = {
            "forecast_date": forecast_date,
            "forecast_day": datetime.now().strftime("%A, %B %d, %Y"),
            "generated_at": datetime.now().isoformat()
        }
        return config
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in staffing_config: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/staff-assignment")
def staff_assignment(req: AssignmentRequest):
    """
    Automatically get staffing needs from /staffing-config and assign staff for both shifts
    Only requires forbidden staff list as input
    """
    try:
        # Get staffing configuration data
        config_data = staffing_config()
        
        # Extract staffing needs for both shifts
        morning_needs = config_data["morning_shift"]["staffing_config"]
        night_needs = config_data["night_shift"]["staffing_config"]
        
        # Optimize staff assignment for both shifts
        morning_assignment = optimize_staff_assignment(staff_pool, morning_needs, req.forbidden)
        night_assignment = optimize_staff_assignment(staff_pool, night_needs, req.forbidden)
        
        # Calculate costs
        morning_cost = calculate_shift_cost(morning_assignment)
        night_cost = calculate_shift_cost(night_assignment)
        
        return {
            "forecast_info": config_data["forecast_info"],
            "weather_context": config_data["weather_context"],
            "morning_shift": {
                "shift_hours": "08:00 - 16:00",
                "predicted_orders": config_data["morning_shift"]["predicted_orders"],
                "staffing_needs": morning_needs,
                "staff_assignment": morning_assignment,
                "estimated_cost": morning_cost,
                "forbidden_staff": req.forbidden
            },
            "night_shift": {
                "shift_hours": "17:00 - 00:00",
                "predicted_orders": config_data["night_shift"]["predicted_orders"],
                "staffing_needs": night_needs,
                "staff_assignment": night_assignment,
                "estimated_cost": night_cost,
                "forbidden_staff": req.forbidden
            },
            "total_daily_cost": morning_cost + night_cost
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in staff_assignment: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate staff assignments")

class ShiftPlanningRequest(BaseModel):
    forbidden_staff: Optional[List[str]] = []

def calculate_shift_cost(assignment: dict) -> float:
    """Calculate the total cost for a shift assignment"""
    total_cost = 0
    for role, staff_list in assignment.items():
        for staff_member in staff_list:
            if staff_member == "TEMP-HIRE":
                total_cost += 20000  # Temp hire cost
            else:
                # Find staff member in pool
                staff_info = next((s for s in staff_pool if s["name"] == staff_member), None)
                if staff_info:
                    if role == "delivery":
                        total_cost += staff_info["wage"] * 0.8  # Delivery staff cost reduction
                    else:
                        total_cost += staff_info["wage"]
    return total_cost

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# ✅ Run server directly with `python your_file.py`
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("staff_apis:app", host="127.0.0.1", port=8001, reload=True)