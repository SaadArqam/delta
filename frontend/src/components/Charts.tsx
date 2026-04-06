import { useEffect, useState } from "react";
import apiClient from "../api/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

type DataItem = {
  name: string;
  value: number;
};

export default function Charts() {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<Record<string, number>>('/analytics/categories');
        const formatted = Object.entries(response.data)
          .map(([key, value]) => ({
            name: key,
            value
          }))
          .sort((a, b) => b.value - a.value); // Sort by count descending
        setData(formatted);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
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
      <h2>📊 Disaster Categories</h2>
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
            formatter={(value: number) => [`${value} events`, 'Count']}
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