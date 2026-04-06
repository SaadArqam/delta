import { useState, useEffect } from "react";

export default function OnboardingBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen the banner before
    const hasSeenBanner = localStorage.getItem('disaster-watch-onboarding');
    if (!hasSeenBanner) {
      setIsVisible(true);
    }
  }, []);

  const dismissBanner = () => {
    setIsVisible(false);
    localStorage.setItem('disaster-watch-onboarding', 'true');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: '#e3f2fd',
      borderBottom: '1px solid #bbdefb',
      padding: '16px 20px',
      zIndex: 1000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '16px',
          flex: 1
        }}>
          <div style={{ fontSize: '24px', lineHeight: 1 }}>👋</div>
          <div>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              marginBottom: '12px',
              color: '#1565c0'
            }}>
              Welcome to Disaster Watch.
            </div>
            <div style={{ 
              fontSize: '16px', 
              marginBottom: '8px',
              color: '#1976d2',
              fontWeight: '500'
            }}>
              Here's how it works:
            </div>
            <div style={{ fontSize: '15px', lineHeight: 1.6, color: '#424242' }}>
              <div style={{ marginBottom: '6px' }}>
                1. 🔍 Search your city to see your disaster risk
              </div>
              <div style={{ marginBottom: '6px' }}>
                2. 🗺️ Explore map to see active events near you
              </div>
              <div>
                3. 📊 Check dashboard to see trends in your region
              </div>
            </div>
          </div>
        </div>
        
        <button
          onClick={dismissBanner}
          style={{
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1565c0';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1976d2';
          }}
        >
          Got it →
        </button>
      </div>
    </div>
  );
}
