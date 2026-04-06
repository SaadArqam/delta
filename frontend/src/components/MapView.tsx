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

export default function MapView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<Event[]>('/events');
        setEvents(response.data);
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
              <div style={{ minWidth: "200px" }}>
                <strong>{event.category}</strong><br />
                📍 {event.latitude.toFixed(2)}, {event.longitude.toFixed(2)}<br />
                📅 {new Date(event.date).toLocaleDateString()}<br />
                🆔 {event.id}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}