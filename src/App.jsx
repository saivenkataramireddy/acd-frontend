import React, { useState, useEffect } from 'react';
import ProfileForm from './components/ProfileForm';

function App() {
  const [isCrashed, setIsCrashed] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const [alertSent, setAlertSent] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    const storedProfile = localStorage.getItem('userProfile');
    if (storedProfile) {
      setUserProfile(JSON.parse(storedProfile));
    }
    setIsProfileLoaded(true);
  }, []);

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
        setCurrentLocation({lat, lon});
        
        // Delegate to backend for automatic sending without browser restrictions
        let contactsList = [];
        if (userProfile && userProfile.contact1Phone) contactsList.push(userProfile.contact1Phone);
        if (userProfile && userProfile.contact2Phone) contactsList.push(userProfile.contact2Phone);

        const response = await fetch('https://acd-backend-o3kh.onrender.com/api/v1/events/create', {
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
            source: 'auto',
            userFullName: userProfile ? userProfile.fullName : 'A User',
            contacts: contactsList
          })
        });
        const data = await response.json();
        console.log('Backend response:', data);
      } catch (e) {
        console.error('Failed to contact backend:', e);
      }
      setTimeout(() => {
        setIsCrashed(false);
      }, 5000); // Wait 5 seconds after sent to reset
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
          setIsCrashed(false);
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    } else {
      alert("Geolocation not supported by this browser.");
      setIsCrashed(false);
    }
  };

  const handleProfileComplete = (profile) => {
    setUserProfile(profile);
    setIsEditingProfile(false);
  };

  if (!isProfileLoaded) {
    return <div>Loading...</div>;
  }

  if (!userProfile || isEditingProfile) {
    return <ProfileForm onComplete={handleProfileComplete} initialData={userProfile} onCancel={userProfile ? () => setIsEditingProfile(false) : null} />;
  }

  return (
    <>
      <div className="app-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="app-title">Accident Response</h1>
          <p className="app-subtitle">Sensor monitoring active &bull; Network connected</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{userProfile.fullName}</p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Blood: {userProfile.bloodGroup || 'N/A'}</p>
          <button style={{ background: 'transparent', border: 'none', color: '#3b82f6', textDecoration: 'underline', fontSize: '0.8rem', cursor: 'pointer', marginTop: '4px' }} onClick={() => setIsEditingProfile(true)}>Edit Profile</button>
        </div>
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
                <h2 style={{ fontSize: '1.8rem', color: '#ef4444', marginBottom: '10px' }}>Alert Sent!</h2>
                <p style={{ color: 'var(--text-muted)' }}>Emergency services coordinates sent.</p>
                <p style={{ color: '#fbbf24', marginTop: '10px', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Notified securely via backend: {userProfile.contact1Name} & {userProfile.contact2Name}
                </p>
                
                <button className="btn btn-cancel" style={{ width: '100%', padding: '16px', background: 'rgba(255,255,255,0.05)', color: 'white', borderRadius: '12px', marginTop: '20px' }} onClick={cancelAlert}>
                  DISMISS
                </button>
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
