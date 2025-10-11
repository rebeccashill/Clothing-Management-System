// forecast.js
import { promises as fs } from 'fs';
import * as ss from 'simple-statistics';


/**
 * Helper to generate linear regression forecast
 * @param {Array} dataPoints - [[x, y], ...]
 * @param {number} futureDays - number of future points to forecast
 */
function generateForecast(dataPoints, futureDays = 7) {
  if (!dataPoints.length) return [];
  const regression = ss.linearRegression(dataPoints);
  const regressionLine = ss.linearRegressionLine(regression);

  const lastX = dataPoints[dataPoints.length - 1][0];
  const forecast = [];

  // Existing points
// Existing points
    dataPoints.forEach(([x, y], i) => {
        forecast.push({
        dayIndex: x,
        predictedProfit: Number(regressionLine(x).toFixed(2)),
        dateSold: items[i]?.salesHistory?.[x]?.dateSold || null
    });
});


  // Future points
  for (let i = 1; i <= futureDays; i++) {
    const x = lastX + i;
    forecast.push({ dayIndex: x, predictedProfit: Number(regressionLine(x).toFixed(2)) });
  }

  return forecast;
}

/**
 * Forecast overall trends, by brand, and by platform
 */
export async function forecastTrends(futureDays = 7) {
  const data = await fs.readFile('inventory.json', 'utf8');
  const items = JSON.parse(data);

  // Flatten sales history across all items for total forecast
  const totalSalesData = items.flatMap(item =>
    item.salesHistory?.map((sale, idx) => [idx, sale.totalProfit]) || []
  );

  const totalForecast = generateForecast(totalSalesData, futureDays);

  // Forecast by brand
  const brands = {};
  items.forEach(item => {
    if (!item.salesHistory) return;
    brands[item.brand || 'Unknown'] = brands[item.brand || 'Unknown'] || [];
    item.salesHistory.forEach((sale, idx) => brands[item.brand || 'Unknown'].push([idx, sale.totalProfit]));
  });

  const forecastByBrand = Object.entries(brands).map(([brand, dataPoints]) => ({
    brand,
    forecast: generateForecast(dataPoints, futureDays)
  }));

  // Forecast by platform
  const platforms = {};
  items.forEach(item => {
    if (!item.salesHistory) return;
    platforms[item.platform || 'Unknown'] = platforms[item.platform || 'Unknown'] || [];
    item.salesHistory.forEach((sale, idx) => platforms[item.platform || 'Unknown'].push([idx, sale.totalProfit]));
  });

  const forecastByPlatform = Object.entries(platforms).map(([platform, dataPoints]) => ({
    platform,
    forecast: generateForecast(dataPoints, futureDays)
  }));

  return {
    totalForecast,
    forecastByBrand,
    forecastByPlatform
  };
}
