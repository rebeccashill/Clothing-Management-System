import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const TrendForecastChart = () => {
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/api/trend-forecast')
      .then(res => res.json())
      .then(data => setForecast(data))
      .catch(err => console.error('Error fetching forecast:', err));
  }, []);

  if (!forecast) return <div>Loading trend forecast...</div>;

  const { totalForecast, forecastByBrand, forecastByPlatform } = forecast;

  return (
    <div>
      <h2>Overall Profit Forecast</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={totalForecast}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="dayIndex" label={{ value: "Day Index", position: "insideBottomRight", offset: 0 }} />
          <YAxis label={{ value: "Profit ($)", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="predictedProfit" name="Predicted Profit" stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>

      <h2>Profit Forecast by Brand</h2>
      {forecastByBrand.map(({ brand, forecast }) => (
        <div key={brand}>
          <h3>{brand}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dayIndex" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="predictedProfit" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}

      <h2>Profit Forecast by Platform</h2>
      {forecastByPlatform.map(({ platform, forecast }) => (
        <div key={platform}>
          <h3>{platform}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={forecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dayIndex" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="predictedProfit" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
};

export default TrendForecastChart;