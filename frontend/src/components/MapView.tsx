import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import apiClient from "../api/client";
import L from "leaflet";

type Event = {
  id: string;
  category: string;
  latitude: number;
  longitude: number;
  date: string;
};

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Function to map categories to emojis
const getCategoryEmoji = (category: string): string => {
  const categoryLower = category.toLowerCase();
  if (categoryLower.includes('wildfire') || categoryLower.includes('fire')) return '🔥';
  if (categoryLower.includes('flood')) return '🌊';
  if (categoryLower.includes('storm') || categoryLower.includes('severe')) return '⛈️';
  if (categoryLower.includes('volcano')) return '🌋';
  return '⚠️'; // default
};

// Function to get region name from coordinates (simplified reverse geocoding)
const getRegionName = async (lat: number, lon: number): Promise<string> => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&limit=1`
    );
    const data = await response.json();
    if (data && data.address) {
      const parts = [];
      if (data.address.city) parts.push(data.address.city);
      else if (data.address.town) parts.push(data.address.town);
      else if (data.address.village) parts.push(data.address.village);
      
      if (data.address.state) parts.push(data.address.state);
      else if (data.address.country) parts.push(data.address.country);
      
      return parts.join(', ');
    }
  } catch (err) {
    console.error('Reverse geocoding error:', err);
  }
  return 'Unknown Location';
};

export default function MapView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regions, setRegions] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<Event[]>('/events');
        setEvents(response.data);
        
        // Pre-fetch region names for all events
        const regionPromises = response.data.map(async (event) => {
          const region = await getRegionName(event.latitude, event.longitude);
          return [`${event.id}-${event.date}`, region];
        });
        
        const regionResults = await Promise.all(regionPromises);
        const regionMap = Object.fromEntries(regionResults);
        setRegions(regionMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div style={{ height: "500px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div>Loading map data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: "500px", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: "20px" }}>
      <h2>🗺️ Disaster Events Map</h2>
      <MapContainer center={[20, 0]} zoom={2} style={{ height: "500px", width: "100%", borderRadius: "8px" }}>
        <TileLayer 
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {events.map((event) => (
          <Marker 
            key={`${event.id}-${event.date}`} 
            position={[event.latitude, event.longitude]}
          >
            <Popup>
              <div style={{ 
                minWidth: "250px", 
                padding: "15px",
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
              }}>
                {/* Header with emoji and category */}
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                  fontSize: "16px",
                  fontWeight: "600"
                }}>
                  <span style={{ fontSize: "20px" }}>
                    {getCategoryEmoji(event.category)}
                  </span>
                  <span>
                    {event.category} detected
                  </span>
                </div>
                
                {/* Location */}
                <div style={{
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "#495057"
                }}>
                  <span style={{ marginRight: "4px" }}>📍</span>
                  Near {regions[`${event.id}-${event.date}`] || 'Unknown Location'}
                </div>
                
                {/* Date */}
                <div style={{
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "#495057"
                }}>
                  <span style={{ marginRight: "4px" }}>📅</span>
                  Reported on {new Date(event.date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
                
                {/* Warning */}
                <div style={{
                  fontSize: "14px",
                  color: "#dc3545",
                  fontWeight: "500",
                  fontStyle: "italic"
                }}>
                  <span style={{ marginRight: "4px" }}>⚠️</span>
                  Stay updated with local authorities.
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}