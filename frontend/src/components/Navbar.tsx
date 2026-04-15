import { useState } from 'react';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'map', label: 'Live Map' },
    { id: 'risk', label: 'Risk Check' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'about', label: 'About' }
  ];

  return (
    <nav className="card" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px 24px',
      borderBottom: `1px solid var(--border)`,
      borderRadius: 0,
      margin: 0
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '18px' }}>
        🌍 <span className="text-primary">DisasterWatch</span>
      </div>

      {/* Desktop Navigation */}
      <div className="mobile-hidden" style={{ display: 'flex', gap: '8px' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={activeTab === tab.id ? 'tab-active' : 'tab-inactive'}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Live Status Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div 
          className="pulse"
          style={{
            width: '8px',
            height: '8px',
            backgroundColor: 'var(--success)',
            borderRadius: '50%'
          }}
        />
        <span className="text-secondary" style={{ fontSize: '14px', fontWeight: '500' }}>
          Live Data
        </span>
      </div>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{
          display: 'none',
          background: 'none',
          border: 'none',
          color: 'var(--text-primary)',
          fontSize: '24px',
          cursor: 'pointer',
          padding: '4px'
        }}
      >
        {isMobileMenuOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'var(--bg-surface)',
          borderBottom: `1px solid var(--border)`,
          padding: '16px'
        }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                onTabChange(tab.id);
                setIsMobileMenuOpen(false);
              }}
              className={activeTab === tab.id ? 'tab-active' : 'tab-inactive'}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                textAlign: 'left',
                marginBottom: '8px'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
