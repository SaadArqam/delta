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

type Event = {
  id: string;
  category: string;
  latitude: number;
  longitude: number;
  date: string;
  source: string;
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

const getCategoryEmoji = (category: string): string => {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('wildfire') || categoryLower.includes('fire')) return '🔥';
  if (categoryLower.includes('flood')) return '🌊';
  if (categoryLower.includes('storm') || categoryLower.includes('severe')) return '⛈️';
  if (categoryLower.includes('volcano')) return '🌋';
  return '⚠️';
};

export default function EnhancedAnalytics() {
  const [categoryData, setCategoryData] = useState<DataItem[]>([]);
  const [trendsData, setTrendsData] = useState<TrendData[]>([]);
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [categoryResponse, trendsResponse, eventsResponse] = await Promise.all([
          apiClient.get<Record<string, number>>('/analytics/categories'),
          apiClient.get<Record<string, number>>('/analytics/trends'),
          apiClient.get<Event[]>('/events')
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
        
        // Get recent events (last 10)
        const sortedEvents = eventsResponse.data
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10);
        
        setCategoryData(formattedCategories);
        setTrendsData(formattedTrends);
        setRecentEvents(sortedEvents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="text-secondary">Loading analytics data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '24px', maxWidth: '400px', margin: '0 auto' }}>
          <h3 style={{ color: 'var(--danger)', marginBottom: '16px' }}>Error</h3>
          <p className="text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px' }}>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '24px',
        marginBottom: '24px'
      }}>
        
        {/* Category Chart Card */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            marginBottom: '16px',
            color: 'var(--text-primary)'
          }}>
            Disasters by Category
          </h3>
          
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip 
                formatter={(value: any) => [`${value || 0} events`, 'Count']}
                labelStyle={{ color: 'var(--text-primary)' }}
                contentStyle={{ 
                  background: 'var(--bg-surface)', 
                  border: `1px solid var(--border)`,
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar 
                dataKey="value" 
                fill="var(--accent)" 
                name="Event Count"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          
          {/* Category Summary */}
          <div className="card" style={{
            marginTop: '16px',
            padding: '16px',
            background: 'var(--bg-primary)',
            border: `1px solid var(--border)`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>ℹ️</span>
              <span className="text-secondary" style={{ fontSize: '14px' }}>
                {generateCategorySummary(categoryData)}
              </span>
            </div>
          </div>
        </div>

        {/* Trends Chart Card */}
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ 
            fontSize: '20px', 
            fontWeight: '600', 
            marginBottom: '16px',
            color: 'var(--text-primary)'
          }}>
            Events Over Time
          </h3>
          
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendsData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis 
                dataKey="date"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={Math.floor(trendsData.length / 5)}
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
              <Tooltip 
                formatter={(value: any) => [`${value || 0} events`, 'Count']}
                labelStyle={{ color: 'var(--text-primary)' }}
                contentStyle={{ 
                  background: 'var(--bg-surface)', 
                  border: `1px solid var(--border)`,
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone"
                dataKey="count"
                stroke="var(--danger)"
                strokeWidth={2}
                name="Daily Events"
                dot={{ fill: "var(--danger)", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          
          {/* Trends Summary */}
          <div className="card" style={{
            marginTop: '16px',
            padding: '16px',
            background: 'var(--bg-primary)',
            border: `1px solid var(--border)`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>ℹ️</span>
              <span className="text-secondary" style={{ fontSize: '14px' }}>
                {generateTrendSummary(trendsData)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events Card */}
      <div className="card" style={{ padding: '24px' }}>
        <h3 style={{ 
          fontSize: '20px', 
          fontWeight: '600', 
          marginBottom: '20px',
          color: 'var(--text-primary)'
        }}>
          Recent Events
        </h3>
        
        <div style={{ overflowX: 'auto' }}>
          {recentEvents.length === 0 ? (
            <p className="text-secondary">No recent events found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentEvents.map((event) => (
                <div 
                  key={`${event.id}-${event.date}`}
                  className="card"
                  style={{ 
                    padding: '16px',
                    background: 'var(--bg-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontSize: '24px' }}>
                    {getCategoryEmoji(event.category)}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontWeight: '600', 
                      marginBottom: '4px',
                      color: 'var(--text-primary)'
                    }}>
                      {event.category}
                    </div>
                    <div className="text-secondary" style={{ fontSize: '14px' }}>
                      📍 {event.latitude.toFixed(2)}, {event.longitude.toFixed(2)}
                    </div>
                    <div className="text-secondary" style={{ fontSize: '14px' }}>
                      📅 {new Date(event.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
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
}
