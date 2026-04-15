import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import apiClient from "../api/client";
import "leaflet/dist/leaflet.css";

type Event = {
  id: string;
  category: string;
  latitude: number;
  longitude: number;
  date: string;
  source: string;
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

// Function to get region name from coordinates
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

export default function EnhancedMapView() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regions, setRegions] = useState<Record<string, string>>({});
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All', emoji: '🌍' },
    { id: 'wildfire', label: 'Wildfire', emoji: '🔥' },
    { id: 'flood', label: 'Flood', emoji: '🌊' },
    { id: 'storm', label: 'Storm', emoji: '⛈️' },
    { id: 'volcano', label: 'Volcano', emoji: '🌋' }
  ];

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

  const filteredEvents = events.filter(event => {
    if (activeFilter === 'all') return true;
    return event.category.toLowerCase().includes(activeFilter);
  });

  if (loading) {
    return (
      <div style={{ height: '95vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-secondary">Loading disaster data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: '95vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ padding: '24px', maxWidth: '400px' }}>
          <h3 style={{ color: 'var(--danger)', marginBottom: '16px' }}>Error</h3>
          <p className="text-secondary">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '95vh', position: 'relative' }}>
      <MapContainer 
        center={[20, 0]} 
        zoom={2} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {filteredEvents.map((event) => (
          <Marker 
            key={`${event.id}-${event.date}`} 
            position={[event.latitude, event.longitude]}
          >
            <Popup>
              <div style={{ 
                minWidth: "250px", 
                padding: "15px",
                fontFamily: "'Inter', sans-serif"
              }}>
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
                
                <div style={{
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "var(--text-secondary)"
                }}>
                  <span style={{ marginRight: "4px" }}>📍</span>
                  Near {regions[`${event.id}-${event.date}`] || 'Unknown Location'}
                </div>
                
                <div style={{
                  marginBottom: "8px",
                  fontSize: "14px",
                  color: "var(--text-secondary)"
                }}>
                  <span style={{ marginRight: "4px" }}>📅</span>
                  Reported on {new Date(event.date).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
                
                <div style={{
                  fontSize: "14px",
                  color: "var(--warning)",
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

      {/* Floating Active Disasters Card */}
      <div 
        className="card fade-in"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '16px 20px',
          zIndex: 1000,
          minWidth: '200px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>🌍</span>
          <div>
            <div className="text-primary" style={{ fontWeight: '600', fontSize: '14px' }}>
              Active Disasters
            </div>
            <div style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              color: 'var(--accent)' 
            }}>
              {filteredEvents.length}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Filter Bar */}
      <div 
        className="card fade-in"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '12px',
          zIndex: 1000,
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          maxWidth: '300px'
        }}
      >
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={activeFilter === filter.id ? 'tab-active' : 'tab-inactive'}
            style={{
              padding: '8px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: 'none'
            }}
          >
            <span>{filter.emoji}</span>
            <span>{filter.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
