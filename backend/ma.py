from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import pandas as pd
import numpy as np
import joblib
from collections import defaultdict
from sklearn.multioutput import MultiOutputRegressor
from xgboost import XGBRegressor

# Create a single FastAPI app instance
app = FastAPI()

# Load models once at startup
hourly_model = joblib.load("forecast_model.pkl")
daily_model = joblib.load("daily_forecast_model.pkl")
weekly_model = joblib.load("weekly_forecast_model.pkl")
ingredient_model = joblib.load("ingredient_forecast_model.pkl")
ingredient_weekly_model = joblib.load("ingredient_weekly_model.pkl")

# Load feature names
with open("ingredient_features.txt", "r", encoding="utf-8") as f:
    trained_features = [line.strip() for line in f]

with open("ingredient_weekly_features.txt", "r", encoding="utf-8") as f:
    weekly_features = [line.strip() for line in f]

# Load historical hourly data once
# Load and aggregate historical hourly data from NDJSON
orders_df = pd.read_json("orders.ndjson", lines=True)
orders_df['createdAt'] = pd.to_datetime(orders_df['createdAt'], utc=True)
order_items_df = pd.read_json("order_items.ndjson", lines=True)

# Merge and aggregate
merged_df = pd.merge(order_items_df, orders_df, left_on="orderId", right_on="_id")
merged_df['hour'] = pd.to_datetime(merged_df['createdAt']).dt.floor("h")
historical_hourly = merged_df.groupby('hour').size().reset_index(name='orders_per_hour')
historical_hourly = historical_hourly.drop_duplicates(subset='hour', keep='last')
historical_hourly = historical_hourly.sort_values('hour').set_index('hour')

# Aggregate historical daily orders
merged_df['date'] = pd.to_datetime(merged_df['createdAt']).dt.floor("d")
historical_daily = merged_df.groupby('date').size().reset_index(name='orders_per_day')
historical_daily = historical_daily.drop_duplicates(subset='date', keep='last')
historical_daily = historical_daily.sort_values('date').set_index('date')

# Aggregate historical weekly orders
merged_df['week'] = merged_df['createdAt'].dt.to_period("W").dt.start_time
historical_weekly = merged_df.groupby('week').size().reset_index(name='orders_per_week')
historical_weekly['week'] = pd.to_datetime(historical_weekly['week'], utc=True)
historical_weekly['week_num'] = historical_weekly['week'].dt.isocalendar().week
historical_weekly['month'] = historical_weekly['week'].dt.month
historical_weekly['lag_1w'] = historical_weekly['orders_per_week'].shift(1)
historical_weekly['rolling_mean_3w'] = historical_weekly['orders_per_week'].rolling(3).mean()
historical_weekly['rolling_sum_4w'] = historical_weekly['orders_per_week'].rolling(4).sum()
historical_weekly = historical_weekly.drop_duplicates(subset='week', keep='last')
historical_weekly = historical_weekly.sort_values('week').set_index('week')

# Load NDJSON sources for ingredients
items = pd.read_json("items.ndjson", lines=True)
options = pd.read_json("options.ndjson", lines=True)
order_items = pd.read_json("order_items.ndjson", lines=True)
orders = pd.read_json("orders.ndjson", lines=True)

# Build lookups
pizza_items = items[items['category'] == 'Pizzas']
pizza_id_to_name = dict(zip(pizza_items['_id'], pizza_items['name']))
size_names = ['Pâte S', 'Pâte M', 'Pâte L']
size_mods = options[options['name'].isin(size_names)]
mod_id_to_size = dict(zip(size_mods['_id'], size_mods['name']))
ingredient_mods = options[~options['name'].isin(size_names)]
mod_id_to_ing = dict(zip(ingredient_mods['_id'], ingredient_mods['name']))

# Join order_items with orders
merged = order_items.merge(orders[['_id', 'createdAt']], left_on='orderId', right_on='_id')
merged['date'] = pd.to_datetime(merged['createdAt']).dt.date

# Build daily counts
variant_counts = defaultdict(lambda: defaultdict(int))
ingredient_counts = defaultdict(lambda: defaultdict(int))

for _, row in merged.iterrows():
    date = row['date']
    qty = row['qty']
    item_id = row['itemId']
    applied = row['appliedOptions']

    if item_id in pizza_id_to_name:
        size = next((mod_id_to_size.get(mod) for mod in applied if mod in mod_id_to_size), None)
        if size:
            variant = f"{pizza_id_to_name[item_id]} ({size})"
            variant_counts[date][variant] += qty

    for mod in applied:
        if mod in mod_id_to_ing:
            ing = mod_id_to_ing[mod]
            ingredient_counts[date][ing] += qty

# Convert to DataFrames
variant_df = pd.DataFrame([
    {"date": date, "variant": variant, "orders": count}
    for date, variants in variant_counts.items()
    for variant, count in variants.items()
])
ingredient_df = pd.DataFrame([
    {"date": date, "ingredient": ing, "units": count}
    for date, ingredients in ingredient_counts.items()
    for ing, count in ingredients.items()
])

variant_pivot = variant_df.pivot(index='date', columns='variant', values='orders').fillna(0)
ingredient_pivot = ingredient_df.pivot(index='date', columns='ingredient', values='units').fillna(0)
forecast_df = pd.concat([variant_pivot, ingredient_pivot], axis=1).sort_index()

# Add temporal features
dt_index = pd.to_datetime(forecast_df.index)
forecast_df['dayofweek'] = dt_index.dayofweek
forecast_df['is_weekend'] = dt_index.dayofweek.isin([5, 6]).astype(int)
forecast_df['month'] = dt_index.month
forecast_df['day'] = dt_index.day

# Merge with context
daily_context = pd.read_csv("daily_context.csv")
daily_context['date'] = pd.to_datetime(daily_context['date']).dt.date
daily_context.set_index('date', inplace=True)
full_df = forecast_df.merge(daily_context, left_index=True, right_index=True, how='left')
full_df.index = pd.to_datetime(full_df.index)

# Add lag features
for col in ingredient_pivot.columns:
    full_df[f"{col}_lag1"] = full_df[col].shift(1)
    full_df[f"{col}_diff"] = full_df[col] - full_df[f"{col}_lag1"]
    full_df[f"{col}_roll3"] = full_df[col].rolling(3).mean()

# Clean features
targets = ingredient_pivot.columns.tolist() + variant_pivot.columns.tolist()
full_df = full_df.drop(columns=['city', 'weather_desc', 'alerts', 'events'], errors='ignore')
full_df.columns = full_df.columns.str.replace("[", "(").str.replace("]", ")").str.replace("<", "_")

# Weekly aggregation for ingredients
full_df["week"] = full_df.index.to_period("W").start_time
raw_targets = ingredient_pivot.columns.tolist() + variant_pivot.columns.tolist()
targets = [col for col in raw_targets if col in full_df.columns]

features = [col for col in full_df.columns if col not in targets]
numeric_features = full_df[features].select_dtypes(include=["number"]).columns.tolist()

X_weekly = full_df[numeric_features].groupby(full_df["week"]).mean()
Y_weekly = full_df[targets].groupby(full_df["week"]).sum()

X_weekly.columns = X_weekly.columns.map(lambda x: str(x).replace("[", "(").replace("]", ")").replace("<", "_"))
X_weekly_lagged = X_weekly.shift(1).dropna()
Y_weekly_aligned = Y_weekly.loc[X_weekly_lagged.index]

# ---------------------- PYDANTIC MODELS ----------------------

class HourlyRequest(BaseModel):
    timestamps: List[str]
    context: List[dict]

class DailyRequest(BaseModel):
    dates: List[str]
    context: List[dict]

class WeeklyRequest(BaseModel):
    weeks: List[str]

class IngredientRequest(BaseModel):
    dates: List[str]

class WeeklyIngredientRequest(BaseModel):
    weeks: List[str]

# ---------------------- HELPER FUNCTIONS ----------------------

def preprocess_and_predict(hourly_timestamps, context_df, model):
    hourly_timestamps = pd.to_datetime(hourly_timestamps, utc=True)

    context_df['date'] = pd.to_datetime(context_df['date'], utc=True)
    context_df = context_df.drop_duplicates(subset='date', keep='last')
    hourly_context = context_df.set_index('date').reindex(hourly_timestamps).ffill().reset_index()
    hourly_context.rename(columns={'index': 'hour'}, inplace=True)

    df = pd.DataFrame({'hour': hourly_timestamps})
    df['hour_of_day'] = df['hour'].dt.hour
    df['day_of_week'] = df['hour'].dt.dayofweek
    df['is_weekend'] = df['day_of_week'].isin([4, 5]).astype(int)
    df = df.merge(hourly_context, on='hour', how='left')

    # Compute lag features using historical data
    lag_features = []
    for ts in df.index:
        ts_actual = df.loc[ts, 'hour']
        fallback_ts = ts_actual.replace(year=2024)

        if ts_actual in historical_hourly.index:
            base = historical_hourly
        elif fallback_ts in historical_hourly.index:
            base = historical_hourly.rename_axis('hour').copy()
            ts_actual = fallback_ts
        else:
            weekday = ts_actual.dayofweek
            base = historical_hourly[historical_hourly.index.dayofweek == weekday]

        lag_1h = base['orders_per_hour'].get(ts_actual - pd.Timedelta(hours=1), base['orders_per_hour'].mean())
        rolling_mean_3h = base['orders_per_hour'].rolling(3).mean().get(ts_actual, base['orders_per_hour'].mean())
        rolling_sum_24h = base['orders_per_hour'].rolling(24).sum().get(ts_actual, base['orders_per_hour'].mean())

        lag_features.append({
            'hour': df.loc[ts, 'hour'],
            'lag_1h': lag_1h,
            'rolling_mean_3h': rolling_mean_3h,
            'rolling_sum_24h': rolling_sum_24h
        })

    lag_df = pd.DataFrame(lag_features).set_index('hour')
    df = df.set_index('hour')
    df[['lag_1h', 'rolling_mean_3h', 'rolling_sum_24h']] = lag_df

    features = [
        'hour_of_day', 'day_of_week', 'is_weekend',
        'temp_min_c', 'temp_max_c', 'humidity_pct', 'wind_kph',
        'precip_mm', 'precip_prob',
        'lag_1h', 'rolling_mean_3h', 'rolling_sum_24h'
    ]

    df[['lag_1h', 'rolling_mean_3h', 'rolling_sum_24h']] = df[['lag_1h', 'rolling_mean_3h', 'rolling_sum_24h']].fillna(0)
    weather_cols = [
        'temp_min_c', 'temp_max_c', 'humidity_pct', 'wind_kph',
        'precip_mm', 'precip_prob'
    ]
    df[weather_cols] = df[weather_cols].fillna(df[weather_cols].mean())

    X = df[features]
    df['predicted_orders'] = model.predict(X)

    return df.reset_index()[['hour', 'predicted_orders']]

# ---------------------- ENDPOINTS ----------------------

@app.post("/predict")
def predict_hourly(request: HourlyRequest):
    hourly_timestamps = pd.to_datetime(request.timestamps, utc=True)
    context_df = pd.DataFrame(request.context)
    context_df['date'] = pd.to_datetime(context_df['date'], utc=True)

    result_df = preprocess_and_predict(hourly_timestamps, context_df, hourly_model)
    return result_df.to_dict(orient="records")

@app.post("/predict_daily")
def predict_daily(request: DailyRequest):
    prediction_dates = pd.to_datetime(request.dates)
    context_df = pd.DataFrame(request.context)
    context_df['date'] = pd.to_datetime(context_df['date'])

    df = pd.DataFrame({'date': prediction_dates})
    df['day_of_week'] = df['date'].dt.dayofweek
    df['is_weekend'] = df['day_of_week'].isin([4, 5])

    df = df.merge(context_df, on='date', how='left')

    # Compute lag features using historical data
    lag_features = []
    for ts in df.index:
        ts_actual = df.loc[ts, 'date']
        fallback_ts = ts_actual.replace(year=2024)

        if ts_actual in historical_daily.index:
            base = historical_daily
        elif fallback_ts in historical_daily.index:
            base = historical_daily.rename_axis('date').copy()
            ts_actual = fallback_ts
        else:
            weekday = ts_actual.dayofweek
            base = historical_daily[historical_daily.index.dayofweek == weekday]

        lag_1d = base['orders_per_day'].get(ts_actual - pd.Timedelta(days=1), base['orders_per_day'].mean())
        rolling_mean_3d = base['orders_per_day'].rolling(3).mean().get(ts_actual, base['orders_per_day'].mean())
        rolling_sum_7d = base['orders_per_day'].rolling(7).sum().get(ts_actual, base['orders_per_day'].mean())

        lag_features.append({
            'date': df.loc[ts, 'date'],
            'lag_1d': lag_1d,
            'rolling_mean_3d': rolling_mean_3d,
            'rolling_sum_7d': rolling_sum_7d
        })

    lag_df = pd.DataFrame(lag_features).set_index('date')
    df = df.set_index('date')
    df[['lag_1d', 'rolling_mean_3d', 'rolling_sum_7d']] = lag_df

    features = [
        'day_of_week', 'is_weekend',
        'temp_min_c', 'temp_max_c', 'humidity_pct', 'wind_kph',
        'precip_mm', 'precip_prob',
        'lag_1d', 'rolling_mean_3d', 'rolling_sum_7d'
    ]

    df[['lag_1d', 'rolling_mean_3d', 'rolling_sum_7d']] = df[['lag_1d', 'rolling_mean_3d', 'rolling_sum_7d']].fillna(0)
    weather_cols = [
        'temp_min_c', 'temp_max_c', 'humidity_pct', 'wind_kph',
        'precip_mm', 'precip_prob'
    ]
    df[weather_cols] = df[weather_cols].fillna(df[weather_cols].mean())

    X = df[features]
    df['predicted_orders'] = daily_model.predict(X)

    return df.reset_index()[['date', 'predicted_orders']].to_dict(orient="records")

@app.post("/predict_weekly")
def predict_weekly(request: WeeklyRequest):
    prediction_weeks = pd.to_datetime(request.weeks)
    df = pd.DataFrame({'week': prediction_weeks})
    df['week_num'] = df['week'].dt.isocalendar().week
    df['month'] = df['week'].dt.month

    # Compute lag features using historical data
    lag_features = []
    for ts in df.index:
        ts_actual = df.loc[ts, 'week']
        fallback_ts = ts_actual.replace(year=2024)

        if ts_actual in historical_weekly.index:
            base = historical_weekly
        elif fallback_ts in historical_weekly.index:
            base = historical_weekly.rename_axis('week').copy()
            ts_actual = fallback_ts
        else:
            week_num = ts_actual.isocalendar().week
            base = historical_weekly[historical_weekly.index.isocalendar().week == week_num]

        lag_1w = base['orders_per_week'].get(ts_actual - pd.Timedelta(weeks=1), base['orders_per_week'].mean())
        rolling_mean_3w = base['orders_per_week'].rolling(3).mean().get(ts_actual, base['orders_per_week'].mean())
        rolling_sum_4w = base['orders_per_week'].rolling(4).sum().get(ts_actual, base['orders_per_week'].mean())

        lag_features.append({
            'week': df.loc[ts, 'week'],
            'lag_1w': lag_1w,
            'rolling_mean_3w': rolling_mean_3w,
            'rolling_sum_4w': rolling_sum_4w
        })

    lag_df = pd.DataFrame(lag_features).set_index('week')
    df = df.set_index('week')
    df[['lag_1w', 'rolling_mean_3w', 'rolling_sum_4w']] = lag_df

    features = [
        'week_num', 'month',
        'lag_1w', 'rolling_mean_3w', 'rolling_sum_4w'
    ]

    df[features] = df[features].fillna(0)
    X = df[features]
    df['predicted_orders'] = weekly_model.predict(X)

    return df.reset_index()[['week', 'predicted_orders']].to_dict(orient="records")

@app.post("/predict_ingredients")
def predict_ingredients(request: IngredientRequest):
    prediction_dates = pd.to_datetime(request.dates)
    df = pd.DataFrame({'date': prediction_dates})
    df['dayofweek'] = df['date'].dt.dayofweek
    df['is_weekend'] = df['dayofweek'].isin([5, 6]).astype(int)
    df['month'] = df['date'].dt.month
    df['day'] = df['date'].dt.day
    df = df.set_index('date')

    # Fallback logic
    enriched = []
    for date in df.index:
        if date in full_df.index:
            enriched.append(full_df.loc[date])
        else:
            fallback = pd.Timestamp(date).replace(year=2024)
            if fallback in full_df.index:
                enriched.append(full_df.loc[fallback])
            else:
                weekday = date.dayofweek
                fallback_rows = full_df[full_df.index.dayofweek == weekday]
                enriched.append(fallback_rows.mean())

    X_pred = pd.DataFrame(enriched)
    X_pred = X_pred.drop(columns=targets, errors='ignore')
    X_pred = X_pred.rename(columns=lambda x: str(x).replace("[","(").replace("]",")").replace("<","_"))
    X_pred = X_pred.reindex(columns=trained_features).fillna(0)

    predictions = ingredient_model.predict(X_pred)

    result = []
    for i, date in enumerate(df.index):
        result.append({
            "date": str(date.date()),
            "predictions": {k: float(v) for k, v in zip(targets, predictions[i])}
        })

    return result

@app.post("/predict_weekly_ingredients")
def predict_weekly_ingredients(request: WeeklyIngredientRequest):
    requested_weeks = pd.to_datetime(request.weeks)
    enriched = []

    for week in requested_weeks:
        week_start = pd.Timestamp(week).to_period("W").start_time
        if week_start in X_weekly_lagged.index:
            enriched.append(X_weekly_lagged.loc[week_start])
        else:
            fallback = pd.Timestamp(week_start).replace(year=2024)
            if fallback in X_weekly_lagged.index:
                enriched.append(X_weekly_lagged.loc[fallback])
            else:
                weekday = week_start.dayofweek
                fallback_rows = X_weekly_lagged[X_weekly_lagged.index.dayofweek == weekday]
                enriched.append(fallback_rows.mean())

    X_pred = pd.DataFrame(enriched)
    X_pred = X_pred.reindex(columns=weekly_features).fillna(0)

    predictions = ingredient_weekly_model.predict(X_pred)

    result = []
    for i, week in enumerate(requested_weeks):
        result.append({
            "week": str(pd.Timestamp(week).to_period("W").start_time.date()),
            "predictions": {k: float(v) for k, v in zip(targets, predictions[i])}
        })

    return result

# ✅ Run server directly with `python your_file.py`
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ma:app", host="127.0.0.1", port=8000, reload=True)