import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, LineChart, Line } from "recharts";

type DataItem = {
  name: string;
  value: number;
};

type TrendData = {
  date: string;
  count: number;
};

// Summary generation functions
const generateCategorySummary = (data: DataItem[]): string => {
  if (data.length === 0) return "No disaster data available.";
  
  const topCategory = data[0];
  const secondCategory = data[1];
  
  if (!secondCategory) {
    return `${topCategory.name} are the only disaster type recorded in recent data.`;
  }
  
  return `${topCategory.name} are the most common disaster in recent data, followed by ${secondCategory.name}.`;
};

const generateTrendSummary = (data: TrendData[]): string => {
  if (data.length < 2) return "Insufficient data to determine trends.";
  
  const firstHalf = data.slice(0, Math.floor(data.length / 2));
  const secondHalf = data.slice(Math.floor(data.length / 2));
  
  const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.count, 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.count, 0) / secondHalf.length;
  
  const percentChange = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;
  
  if (Math.abs(percentChange) < 5) {
    return "Disaster events have remained stable over the analyzed period.";
  } else if (percentChange > 0) {
    return `Disaster events have increased by approximately ${Math.round(percentChange)}% over the analyzed period.`;
  } else {
    return `Disaster events have decreased by approximately ${Math.round(Math.abs(percentChange))}% over the analyzed period.`;
  }
};

export default function Charts() {
  const [data, setData] = useState<DataItem[]>([]);
  const [trendsData, setTrendsData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch both category and trends data
        const [categoryResponse, trendsResponse] = await Promise.all([
          apiClient.get<Record<string, number>>('/analytics/categories'),
          apiClient.get<Record<string, number>>('/analytics/trends')
        ]);
        
        // Process category data
        const formattedCategories = Object.entries(categoryResponse.data)
          .map(([key, value]) => ({
            name: key,
            value
          }))
          .sort((a, b) => b.value - a.value);
        
        // Process trends data
        const formattedTrends = Object.entries(trendsResponse.data)
          .map(([date, count]) => ({
            date: new Date(date).toLocaleDateString(),
            count
          }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setData(formattedCategories);
        setTrendsData(formattedTrends);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h2>📊 Analytics Dashboard</h2>
        <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div>Loading analytics data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h2>📊 Analytics Dashboard</h2>
        <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
        <h2>📊 Analytics Dashboard</h2>
        <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div>No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>📊 Analytics Dashboard</h2>
      
      {/* Categories Chart */}
      <div style={{ marginBottom: "40px" }}>
        <h3>Disaster Categories</h3>
        <div style={{ marginBottom: "10px", color: "#666" }}>
          Total Events: {data.reduce((sum, item) => sum + item.value, 0)}
        </div>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: any) => [`${value || 0} events`, 'Count']}
              labelStyle={{ color: '#000' }}
            />
            <Legend />
            <Bar 
              dataKey="value" 
              fill="#007bff" 
              name="Event Count"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Category Summary */}
        <div style={{
          marginTop: "15px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          border: "1px solid #e9ecef",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          gap: "10px"
        }}>
          <span style={{ fontSize: "16px", color: "#666" }}>ℹ️</span>
          <span style={{ fontSize: "14px", color: "#495057" }}>
            {generateCategorySummary(data)}
          </span>
        </div>
      </div>

      {/* Trends Chart */}
      {trendsData.length > 0 && (
        <div style={{ marginBottom: "40px" }}>
          <h3>Disaster Trends</h3>
          
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendsData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={Math.floor(trendsData.length / 10)}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: any) => [`${value || 0} events`, 'Count']}
                labelStyle={{ color: '#000' }}
              />
              <Legend />
              <Line 
                type="monotone"
                dataKey="count"
                stroke="#dc3545"
                strokeWidth={2}
                name="Daily Events"
                dot={{ fill: "#dc3545", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          
          {/* Trends Summary */}
          <div style={{
            marginTop: "15px",
            padding: "15px",
            backgroundColor: "#f8f9fa",
            border: "1px solid #e9ecef",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <span style={{ fontSize: "16px", color: "#666" }}>ℹ️</span>
            <span style={{ fontSize: "14px", color: "#495057" }}>
              {generateTrendSummary(trendsData)}
            </span>
          </div>
        </div>
      )}
      
      {/* Top Categories List */}
      <div style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
        <h4>Top Categories:</h4>
        {data.slice(0, 5).map((item, index) => (
          <div key={item.name}>
            {index + 1}. {item.name}: {item.value} events
          </div>
        ))}
      </div>
    </div>
  );
}