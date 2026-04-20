import React, { useState, useEffect } from 'react';

function App() {
  const [isCrashed, setIsCrashed] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [alertSent, setAlertSent] = useState(false);

  useEffect(() => {
    let timer;
    if (isCrashed && countdown > 0 && !alertSent) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (isCrashed && countdown === 0 && !alertSent) {
      triggerBackendAlert();
    }
    return () => clearTimeout(timer);
  }, [isCrashed, countdown, alertSent]);

  const simulateCrash = () => {
    setIsCrashed(true);
    setCountdown(10);
    setAlertSent(false);
  };

  const cancelAlert = () => {
    setIsCrashed(false);
  };

  const triggerBackendAlert = async () => {
    setAlertSent(true);

    const sendPayload = async (lat, lon) => {
      // Only send real location
      if (!lat || !lon) {
        alert("Location not available. Cannot send alert.");
        setIsCrashed(false);
        return;
      }
        
      try {
        console.log("Sending location payload:", lat, lon);
        const response = await fetch('http://localhost:8000/api/v1/events/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer dummy_token'
          },
          body: JSON.stringify({
            type: 'accident',
            severity: 3,
            lat: lat,
            lon: lon,
            source: 'auto'
          })
        });
        const data = await response.json();
        console.log('Backend response:', data);
      } catch (e) {
        console.error('Failed to contact backend:', e);
      }
      setTimeout(() => {
        setIsCrashed(false);
      }, 3000);
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          sendPayload(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Location error:", error);
          if (error.code === 1) {
            alert("Permission denied! Please allow location.");
          } else if (error.code === 2) {
            alert("Location unavailable.");
          } else if (error.code === 3) {
            alert("Location request timed out.");
          }
          // TEMP: removed fallback while debugging so we fix the real issue!
          setIsCrashed(false); 
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    } else {
      alert("Geolocation not supported by this browser.");
      setIsCrashed(false);
    }
  };

  return (
    <>
      <div className="app-header">
        <h1 className="app-title">Accident Response</h1>
        <p className="app-subtitle">Sensor monitoring active &bull; Network connected</p>
      </div>

      <div className="glass-panel">
        <div className="status-bar">
          <div>
            <span className="status-dot"></span>
            Sensors Calibrated
          </div>
          <div style={{ color: "var(--text-muted)" }}>GPS: ±3m Accuracy</div>
        </div>

        <div className="radar-container">
          <div className="radar-ring"></div>
          <div className="radar-ring"></div>
          <div className="radar-ring"></div>
          
          <button 
            className={`sos-button ${alertSent ? 'sos-active' : ''}`}
            onClick={simulateCrash}
          >
            SOS
          </button>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '20px' }}>
          Tap SOS to manual trigger or let the background sensors detect impacts automatically.
        </p>

        <div className="action-buttons">
          <button className="btn btn-police">🚔 Call Police</button>
          <button className="btn btn-medical">🚑 Nearest Hospital</button>
        </div>
      </div>

      {isCrashed && (
        <div className="modal-overlay">
          <div className="crash-alert">
            <div className="warn-icon">⚠️</div>
            {alertSent ? (
               <>
                 <h2 style={{ fontSize: '1.8rem', color: '#ef4444', marginBottom: '10px' }}>Dispatched!</h2>
                 <p style={{ color: 'var(--text-muted)' }}>Emergency services coordinates sent. Wait for help.</p>
               </>
            ) : (
                <>
                  <h2 style={{ fontSize: '1.8rem', color: '#fff' }}>Crash Detected!</h2>
                  <p style={{ color: 'var(--text-muted)', marginTop: '10px' }}>Alerting authorities and contacts in...</p>
                  
                  <div className="timer">{countdown}s</div>
                  
                  <button className="btn btn-cancel" style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.05)', color: 'white', borderRadius: '12px' }} onClick={cancelAlert}>
                    I'M OKAY (CANCEL ALERT)
                  </button>
                </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
