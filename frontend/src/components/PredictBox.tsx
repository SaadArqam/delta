import { useState } from "react";
import apiClient from "../api/client";

type Prediction = {
  lat: number;
  lon: number;
  event_count_30d: number;
  risk_score: number | null;
  status: string;
  message?: string;
};

export default function PredictBox() {
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [result, setResult] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateInput = (latStr: string, lonStr: string): { valid: boolean; error?: string } => {
    const latNum = parseFloat(latStr);
    const lonNum = parseFloat(lonStr);
    
    if (isNaN(latNum) || isNaN(lonNum)) {
      return { valid: false, error: "Please enter valid numbers for latitude and longitude" };
    }
    
    if (latNum < -90 || latNum > 90) {
      return { valid: false, error: "Latitude must be between -90 and 90" };
    }
    
    if (lonNum < -180 || lonNum > 180) {
      return { valid: false, error: "Longitude must be between -180 and 180" };
    }
    
    return { valid: true };
  };

  const predict = async () => {
    const validation = validateInput(lat, lon);
    if (!validation.valid) {
      setError(validation.error!);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Prediction>(
        `/predict?lat=${parseFloat(lat)}&lon=${parseFloat(lon)}`
      );
      setResult(response.data);
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

  const getRiskLevel = (score: number | null) => {
    if (score === null) return 'Unknown';
    if (score < 30) return 'Low';
    if (score < 70) return 'Medium';
    return 'High';
  };

  return (
    <div style={{ marginBottom: "30px", padding: "20px", border: "1px solid #ddd", borderRadius: "8px" }}>
      <h2>🔮 Risk Prediction</h2>
      
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "150px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Latitude (-90 to 90):
          </label>
          <input
            type="number"
            step="0.0001"
            placeholder="e.g., 40.7128"
            value={lat}
            onChange={e => setLat(e.target.value)}
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </div>

        <div style={{ flex: 1, minWidth: "150px" }}>
          <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Longitude (-180 to 180):
          </label>
          <input
            type="number"
            step="0.0001"
            placeholder="e.g., -74.0060"
            value={lon}
            onChange={e => setLon(e.target.value)}
            style={{ width: "100%", padding: "8px", border: "1px solid #ccc", borderRadius: "4px" }}
          />
        </div>
      </div>

      {error && (
        <div style={{ color: "red", marginBottom: "10px", padding: "10px", backgroundColor: "#ffebee", borderRadius: "4px" }}>
          {error}
        </div>
      )}

      <button 
        onClick={predict}
        disabled={loading || !lat || !lon}
        style={{
          padding: "10px 20px",
          backgroundColor: loading ? "#ccc" : "#007bff",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "16px"
        }}
      >
        {loading ? "Predicting..." : "Predict Risk"}
      </button>

      {result && (
        <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
          <h3>Prediction Results</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
            <div>
              <strong>Location:</strong><br />
              {result.lat.toFixed(4)}, {result.lon.toFixed(4)}
            </div>
            <div>
              <strong>Events (30 days):</strong><br />
              {result.event_count_30d}
            </div>
            <div>
              <strong>Risk Level:</strong><br />
              <span style={{ color: getRiskColor(result.risk_score), fontWeight: "bold", fontSize: "18px" }}>
                {getRiskLevel(result.risk_score)}
              </span>
            </div>
            <div>
              <strong>Risk Score:</strong><br />
              <span style={{ color: getRiskColor(result.risk_score), fontWeight: "bold", fontSize: "24px" }}>
                {result.risk_score !== null ? `${result.risk_score}%` : 'N/A'}
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