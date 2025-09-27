// Chart utility functions for dynamic scaling

export interface ChartScaleConfig {
  domain: [number, number];
  ticks: number[];
}

/**
 * Calculate dynamic Y-axis scale configuration based on data values
 * @param data - Array of data objects
 * @param dataKeys - Array of keys to check for values in the data objects
 * @param minTicks - Minimum number of ticks (default: 4)
 * @param maxTicks - Maximum number of ticks (default: 6)
 * @returns ChartScaleConfig with domain and ticks
 */
export const calculateDynamicScale = (
  data: any[],
  dataKeys: string[],
  minTicks: number = 4,
  maxTicks: number = 6
): ChartScaleConfig => {
  if (!data || data.length === 0) {
    // Fallback to default scale if no data
    return {
      domain: [0, 100],
      ticks: [0, 25, 50, 75, 100]
    };
  }

  // Find the maximum value across all data keys
  let maxValue = 0;
  data.forEach(item => {
    dataKeys.forEach(key => {
      const value = typeof item[key] === 'number' ? item[key] : 0;
      if (value > maxValue) {
        maxValue = value;
      }
    });
  });

  // If maxValue is 0, use a default small scale
  if (maxValue === 0) {
    return {
      domain: [0, 10],
      ticks: [0, 2.5, 5, 7.5, 10]
    };
  }

  // Calculate appropriate scale based on the maximum value
  const padding = 0.1; // 10% padding above max value
  const scaledMax = maxValue * (1 + padding);

  // Round up to a nice number
  const magnitude = Math.pow(10, Math.floor(Math.log10(scaledMax)));
  const normalizedMax = scaledMax / magnitude;
  
  let niceMax: number;
  if (normalizedMax <= 1) niceMax = 1;
  else if (normalizedMax <= 2) niceMax = 2;
  else if (normalizedMax <= 2.5) niceMax = 2.5;
  else if (normalizedMax <= 5) niceMax = 5;
  else niceMax = 10;

  const domainMax = niceMax * magnitude;

  // Generate appropriate tick values
  const tickCount = Math.min(maxTicks, Math.max(minTicks, Math.ceil(domainMax / magnitude)));
  const tickStep = domainMax / (tickCount - 1);
  const ticks: number[] = [];
  
  for (let i = 0; i < tickCount; i++) {
    ticks.push(Math.round(i * tickStep));
  }

  return {
    domain: [0, domainMax],
    ticks
  };
};

/**
 * Calculate dynamic scale for order data based on timeframe
 * @param data - Order data array
 * @param timeframe - 'Hourly', 'Daily', or 'Weekly'
 * @returns ChartScaleConfig with domain and ticks
 */
export const calculateOrderScale = (
  data: any[],
  timeframe: string
): ChartScaleConfig => {
  const dataKeys = ['pizza', 'bar', 'others', 'predicted_orders'];
  
  const baseScale = calculateDynamicScale(data, dataKeys);
  
  // Adjust based on timeframe expectations
  const timeframeMultipliers = {
    'Hourly': 1,
    'Daily': 5,
    'Weekly': 15
  };
  
  const multiplier = timeframeMultipliers[timeframe as keyof typeof timeframeMultipliers] || 1;
  const minExpected = 1000 * multiplier; // Base expectation
  
  // Use the larger of calculated or expected minimum
  if (baseScale.domain[1] < minExpected) {
    return calculateDynamicScale([{value: minExpected}], ['value']);
  }
  
  return baseScale;
};

/**
 * Calculate dynamic scale for ingredient data
 * @param data - Ingredient usage data array
 * @returns ChartScaleConfig with domain and ticks
 */
export const calculateIngredientScale = (
  data: any[]
): ChartScaleConfig => {
  const dataKeys = ['solidOrange', 'dottedGray', 'dottedOrange', 'past', 'actual', 'predicted'];
  return calculateDynamicScale(data, dataKeys);
};