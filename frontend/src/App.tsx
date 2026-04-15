import { useState } from 'react';
import Navbar from './components/Navbar';
import OnboardingBanner from './components/OnboardingBanner';
import EnhancedMapView from './components/EnhancedMapView';
import EnhancedRiskCheck from './components/EnhancedRiskCheck';
import EnhancedAnalytics from './components/EnhancedAnalytics';
import AboutTab from './components/AboutTab';

function App() {
  const [activeTab, setActiveTab] = useState('map');

  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return <EnhancedMapView />;
      case 'risk':
        return <EnhancedRiskCheck />;
      case 'analytics':
        return <EnhancedAnalytics />;
      case 'about':
        return <AboutTab />;
      default:
        return <EnhancedMapView />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <OnboardingBanner />
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main style={{ paddingTop: '80px' }}>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;