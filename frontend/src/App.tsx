import MapView from "./components/MapView";
import Charts from "./components/Charts";
import PredictBox from "./components/PredictBox";
import OnboardingBanner from "./components/OnboardingBanner";
import "leaflet/dist/leaflet.css";

function App() {
  return (
    <div style={{
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "20px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif"
    }}>
      <OnboardingBanner />
      
      <header style={{
        textAlign: "center",
        marginBottom: "40px",
        marginTop: "80px", // Add space for banner
        padding: "20px",
        backgroundColor: "#f8f9fa",
        borderRadius: "12px",
        border: "1px solid #e9ecef"
      }}>
        <h1 style={{
          margin: "0",
          color: "#2c3e50",
          fontSize: "2.5rem",
          fontWeight: "700",
          textShadow: "2px 2px 4px rgba(0,0,0,0.1)"
        }}>
          🌍 AI Disaster Intelligence Platform
        </h1>
        <p style={{
          margin: "10px 0 0 0",
          color: "#6c757d",
          fontSize: "1.1rem"
        }}>
          Real-time disaster tracking and risk prediction powered by NASA data
        </p>
      </header>

      <main>
        <PredictBox />
        <MapView />
        <Charts />
      </main>

      <footer style={{
        textAlign: "center",
        marginTop: "40px",
        padding: "20px",
        borderTop: "1px solid #e9ecef",
        color: "#6c757d"
      }}>
        <p style={{ margin: "0" }}>
          Powered by NASA EONET API | Built with FastAPI, React, and ML
        </p>
      </footer>
    </div>
  );
}

export default App;