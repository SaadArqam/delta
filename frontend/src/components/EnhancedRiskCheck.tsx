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

export default function EnhancedRiskCheck() {
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

  const checkRisk = async () => {
    if (!city.trim()) {
      setError("Please enter a city name");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const geocoded = await geocodeCity(city.trim());
      
      if (!geocoded) {
        setError("We couldn't find that location. Try a nearby city.");
        return;
      }

      const response = await apiClient.get<Prediction>(
        `/predict?lat=${parseFloat(geocoded.lat)}&lon=${parseFloat(geocoded.lon)}`
      );
      
      setResult({
        ...response.data,
        lat: parseFloat(geocoded.lat),
        lon: parseFloat(geocoded.lon)
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const getRiskVerdict = (score: number | null) => {
    if (score === null) {
      return {
        emoji: '❓',
        level: 'Unknown Risk',
        message: 'Unable to calculate risk at this time.',
        color: 'var(--text-secondary)',
        bgColor: 'var(--bg-surface)',
        advice: 'Try again later or check nearby areas.'
      };
    }
    
    if (score <= 30) {
      return {
        emoji: '🟢',
        level: 'Low Risk',
        message: 'No immediate concern in this area.',
        color: 'var(--success)',
        bgColor: '#22c55e20',
        advice: 'Monitor updates and stay informed.'
      };
    }
    
    if (score <= 60) {
      return {
        emoji: '🟡',
        level: 'Moderate Risk',
        message: 'Stay informed and monitor updates.',
        color: 'var(--warning)',
        bgColor: '#f59e0b20',
        advice: 'Keep emergency supplies ready.'
      };
    }
    
    if (score <= 80) {
      return {
        emoji: '🔴',
        level: 'High Risk',
        message: 'Take precautions and follow local alerts.',
        color: 'var(--danger)',
        bgColor: '#ef444420',
        advice: 'Prepare for possible evacuation.'
      };
    }
    
    return {
      emoji: '🚨',
      level: 'Critical Risk',
      message: 'Immediate action may be required.',
      color: '#dc2626',
      bgColor: '#dc262620',
      advice: 'Follow evacuation orders immediately.'
    };
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkRisk();
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: '700',
            marginBottom: '16px',
            color: 'var(--text-primary)'
          }}>
            Check Your Area's Risk
          </h1>
          <p className="text-secondary" style={{ fontSize: '18px' }}>
            Enter any city name to get an AI-powered disaster risk assessment
          </p>
        </div>

        {/* Search Input */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ position: 'relative' }}>
            <span style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '20px',
              zIndex: 1
            }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Enter city name..."
              value={city}
              onChange={e => setCity(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading || geocodingLoading}
              style={{
                width: '100%',
                padding: '16px 16px 16px 52px',
                fontSize: '18px',
                border: `1px solid var(--border)`,
                borderRadius: '12px',
                background: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'all 0.15s ease'
              }}
            />
          </div>
        </div>

        {/* Check Risk Button */}
        <button
          onClick={checkRisk}
          disabled={loading || geocodingLoading || !city.trim()}
          className="btn-primary mobile-full"
          style={{
            width: '100%',
            padding: '16px',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '32px'
          }}
        >
          {geocodingLoading ? '🔍 Finding Location...' : loading ? '⏳ Analyzing Risk...' : 'Check Risk'}
        </button>

        {/* Error Display */}
        {error && (
          <div className="card fade-in" style={{
            padding: '16px',
            marginBottom: '24px',
            border: `1px solid var(--danger)`,
            background: '#ef444420'
          }}>
            <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="card fade-in" style={{ padding: '32px' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '600',
                marginBottom: '8px',
                color: 'var(--text-primary)'
              }}>
                {city}
              </h2>
            </div>

            {/* Risk Verdict Card */}
            <div style={{
              padding: '24px',
              borderRadius: '12px',
              background: getRiskVerdict(result.risk_score).bgColor,
              border: `1px solid ${getRiskVerdict(result.risk_score).color}`,
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                {getRiskVerdict(result.risk_score).emoji}
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: '700',
                color: getRiskVerdict(result.risk_score).color,
                marginBottom: '8px'
              }}>
                {getRiskVerdict(result.risk_score).level}
              </div>
              <div style={{
                fontSize: '16px',
                color: getRiskVerdict(result.risk_score).color,
                marginBottom: '16px'
              }}>
                {getRiskVerdict(result.risk_score).message}
              </div>
              <div className="text-secondary" style={{ fontSize: '14px' }}>
                Risk Score: <span style={{ fontWeight: '600', fontSize: '18px' }}>
                  {result.risk_score !== null ? `${result.risk_score}%` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Advice */}
            <div className="card" style={{ 
              padding: '20px',
              background: `${getRiskVerdict(result.risk_score).color}20`,
              border: `1px solid ${getRiskVerdict(result.risk_score).color}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>💡</span>
                <span style={{ fontSize: '16px', fontWeight: '500' }}>
                  {getRiskVerdict(result.risk_score).advice}
                </span>
              </div>
            </div>

            {/* Additional Details */}
            <div style={{ 
              marginTop: '24px', 
              padding: '16px',
              background: 'var(--bg-primary)',
              borderRadius: '8px',
              fontSize: '14px',
              color: 'var(--text-secondary)'
            }}>
              <div>📍 Location: {result.lat.toFixed(4)}, {result.lon.toFixed(4)}</div>
              <div>📊 Events (30 days): {result.event_count_30d}</div>
              <div>🔄 Status: {result.status}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
