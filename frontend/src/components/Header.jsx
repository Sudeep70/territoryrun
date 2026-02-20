import React from 'react';
import './Header.css';

export default function Header({ isTracking, hasGPS }) {
  return (
    <header className="app-header">
      <div className="header-logo">
        <span className="logo-icon">⬡</span>
        <span className="logo-text">TERRITORY<span className="logo-run">RUN</span></span>
      </div>
      <div className="header-status">
        {isTracking ? (
          <span className="status-badge tracking">
            <span className="status-dot" />
            TRACKING
          </span>
        ) : hasGPS ? (
          <span className="status-badge ready">
            <span className="status-dot static" />
            GPS READY
          </span>
        ) : (
          <span className="status-badge idle">
            <span className="status-dot static dim" />
            IDLE
          </span>
        )}
      </div>
    </header>
  );
}
