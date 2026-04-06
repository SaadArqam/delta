import { useState } from "react";
import apiClient from "../api/client";

type GeocodingResult = {
  lat: string;
  lon: string;
  display_name: string;
};

type Prediction = {
  lat: number;
  lon: number;
  event_count_30d: number;
  risk_score: number | null;
  status: string;
  message?: string;
};

export default function PredictBox() {
  const [city, setCity] = useState("");
  const [result, setResult] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const geocodeCity = async (cityName: string): Promise<GeocodingResult | null> => {
    try {
      setGeocodingLoading(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)}&format=json&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        return data[0];
      }
      return null;
    } catch (err) {
      console.error("Geocoding error:", err);
      return null;
    } finally {
      setGeocodingLoading(false);
    }
  };

  const predict = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // First geocode the city to get lat/lon
      const geocoded = await geocodeCity(city.trim());
      
      if (!geocoded) {
        setError("We couldn't find that location. Try a nearby city.");
        return;
      }

      // Now call the predict API with the resolved coordinates
      const response = await apiClient.get<Prediction>(
        `/predict?lat=${parseFloat(geocoded.lat)}&lon=${parseFloat(geocoded.lon)}`
      );
      
      setResult({
        ...response.data,
        // Include the resolved coordinates for display
        lat: parseFloat(geocoded.lat),
        lon: parseFloat(geocoded.lon)
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score: number | null) => {
    if (score === null) return '#666';
    if (score < 30) return '#28a745'; // Green
    if (score < 70) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };

  const getRiskVerdict = (score: number | null) => {
    if (score === null) {
      return {
        emoji: '❓',
        level: 'Unknown Risk',
        message: 'Unable to calculate risk at this time.',
        color: '#666',
        bgColor: '#f8f9fa'
      };
    }
    
    if (score <= 30) {
      return {
        emoji: '🟢',
        level: 'Low Risk',
        message: 'No immediate concern in this area.',
        color: '#28a745',
        bgColor: '#d4edda'
      };
    }
    
    if (score <= 60) {
      return {
        emoji: '🟡',
        level: 'Moderate Risk',
        message: 'Stay informed and monitor updates.',
        color: '#ffc107',
        bgColor: '#fff3cd'
      };
    }
    
    if (score <= 80) {
      return {
        emoji: '🔴',
        level: 'High Risk',
        message: 'Take precautions and follow local alerts.',
        color: '#dc3545',
        bgColor: '#f8d7da'
      };
    }
    
    // score > 80
    return {
      emoji: '🚨',
      level: 'Critical Risk',
      message: 'Immediate action may be required.',
      color: '#721c24',
      bgColor: '#f5c6cb'
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      predict();
    }
  };

  return (
    <div style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>🔮 Risk Prediction</h2>
      
      <div style={{ marginBottom: "15px" }}>
        <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
          City Name:
        </label>
        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="text"
            placeholder="e.g., New York, London, Tokyo"
            value={city}
            onChange={e => setCity(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading || geocodingLoading}
            style={{
              flex: 1,
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              fontSize: "16px"
            }}
          />
          <button 
            onClick={predict}
            disabled={loading || geocodingLoading || !city.trim()}
            style={{
              padding: "8px 16px",
              backgroundColor: (loading || geocodingLoading) ? "#ccc" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: (loading || geocodingLoading) ? "not-allowed" : "pointer",
              fontSize: "16px",
              whiteSpace: "nowrap"
            }}
          >
            {geocodingLoading ? "🔍 Finding..." : loading ? "⏳ Predicting..." : "🔮 Predict Risk"}
          </button>
        </div>
        {geocodingLoading && (
          <div style={{ marginTop: "5px", color: "#666", fontSize: "14px" }}>
            🔍 Searching for location...
          </div>
        )}
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "10px", padding: "10px", backgroundColor: "#ffebee", borderRadius: "4px" }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
          <h3>Prediction Results</h3>
          
          {/* Risk Verdict Card */}
          <div style={{
            margin: "20px 0",
            padding: "20px",
            borderRadius: "12px",
            backgroundColor: getRiskVerdict(result.risk_score).bgColor,
            border: `2px solid ${getRiskVerdict(result.risk_score).color}`,
            textAlign: "center"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "10px" }}>
              {getRiskVerdict(result.risk_score).emoji}
            </div>
            <div style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: getRiskVerdict(result.risk_score).color,
              marginBottom: "8px"
            }}>
              {getRiskVerdict(result.risk_score).level}
            </div>
            <div style={{
              fontSize: "16px",
              color: getRiskVerdict(result.risk_score).color,
              marginBottom: "15px"
            }}>
              {getRiskVerdict(result.risk_score).message}
            </div>
            {/* Risk Score as secondary info */}
            <div style={{
              fontSize: "14px",
              color: "#666",
              fontStyle: "italic"
            }}>
              Risk Score: <span style={{ fontWeight: "bold", fontSize: "18px" }}>
                {result.risk_score !== null ? `${result.risk_score}%` : 'N/A'}
              </span>
            </div>
          </div>

          {/* Additional Details */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px", marginTop: "20px" }}>
            <div>
              <strong>Location:</strong><br />
              {result.lat.toFixed(4)}, {result.lon.toFixed(4)}
            </div>
            <div>
              <strong>City:</strong><br />
              {city}
            </div>
            <div>
              <strong>Events (30 days):</strong><br />
              {result.event_count_30d}
            </div>
            <div>
              <strong>Status:</strong><br />
              <span style={{ color: getRiskColor(result.risk_score), fontWeight: "bold" }}>
                {result.status}
              </span>
            </div>
          </div>
          {result.message && (
            <div style={{ marginTop: "10px", fontStyle: "italic", color: "#666" }}>
              {result.message}
            </div>
          )}
        </div>
      )}
    </div>
  );
}