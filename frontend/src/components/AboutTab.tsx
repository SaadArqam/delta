export default function AboutTab() {
  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px'
    }}>
      <div className="card fade-in" style={{ 
        maxWidth: '600px', 
        width: '100%',
        padding: '40px',
        textAlign: 'center'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: '700',
            marginBottom: '16px',
            color: 'var(--text-primary)'
          }}>
            About DisasterWatch
          </h1>
          <p className="text-secondary" style={{ fontSize: '18px', lineHeight: 1.6 }}>
            A comprehensive disaster intelligence platform that provides real-time monitoring, 
            AI-powered risk assessment, and actionable insights to help communities 
            stay safe during natural disasters.
          </p>
        </div>

        {/* Feature Highlights */}
        <div style={{ marginBottom: '32px' }}>
          <div className="card" style={{ 
            padding: '24px',
            marginBottom: '20px',
            background: 'var(--bg-primary)',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px'
          }}>
            <span style={{ fontSize: '32px', marginTop: '4px' }}>🛰️</span>
            <div>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '8px',
                color: 'var(--text-primary)'
              }}>
                Real-time NASA Data
              </h3>
              <p className="text-secondary" style={{ fontSize: '14px', margin: 0 }}>
                Updated every 6 hours automatically with the latest disaster events 
                from NASA's Earth Observatory Natural Events Tracker
              </p>
            </div>
          </div>

          <div className="card" style={{ 
            padding: '24px',
            marginBottom: '20px',
            background: 'var(--bg-primary)',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px'
          }}>
            <span style={{ fontSize: '32px', marginTop: '4px' }}>🤖</span>
            <div>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '8px',
                color: 'var(--text-primary)'
              }}>
                AI Risk Prediction
              </h3>
              <p className="text-secondary" style={{ fontSize: '14px', margin: 0 }}>
                Machine learning model trained on historical disaster events to provide 
                accurate risk assessments for any location worldwide
              </p>
            </div>
          </div>

          <div className="card" style={{ 
            padding: '24px',
            background: 'var(--bg-primary)',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '16px'
          }}>
            <span style={{ fontSize: '32px', marginTop: '4px' }}>🗺️</span>
            <div>
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                marginBottom: '8px',
                color: 'var(--text-primary)'
              }}>
                Interactive Map
              </h3>
              <p className="text-secondary" style={{ fontSize: '14px', margin: 0 }}>
                Visualize active disasters worldwide with detailed information, 
                filtering options, and real-time updates
              </p>
            </div>
          </div>
        </div>

        {/* Data Source */}
        <div className="card" style={{ 
          padding: '20px',
          background: `${getComputedStyle(document.documentElement).getPropertyValue('--accent')}20`,
          border: `1px solid var(--accent)`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>📊</span>
            <span className="text-secondary" style={{ fontSize: '14px' }}>
              Data sourced from NASA EONET API
            </span>
          </div>
        </div>

        {/* Additional Info */}
        <div style={{ marginTop: '24px' }}>
          <p className="text-secondary" style={{ fontSize: '14px', margin: 0 }}>
            Built with ❤️ using React, TypeScript, FastAPI, and modern web technologies
          </p>
        </div>
      </div>
    </div>
  );
}
