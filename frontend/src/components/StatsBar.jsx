import React from 'react';
import { formatDistance, formatDuration, formatPace } from '../utils.js';
import './StatsBar.css';

export default function StatsBar({ distance, duration, claimedTiles, isTracking }) {
  return (
    <div className={`stats-bar ${isTracking ? 'tracking' : ''}`}>
      <div className="stat-item">
        <span className="stat-value">{formatDistance(distance)}</span>
        <span className="stat-label">DISTANCE</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <span className="stat-value">{formatDuration(duration)}</span>
        <span className="stat-label">TIME</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <span className="stat-value">{formatPace(distance, duration)}</span>
        <span className="stat-label">PACE/KM</span>
      </div>
      <div className="stat-divider" />
      <div className="stat-item">
        <span className="stat-value accent">{claimedTiles}</span>
        <span className="stat-label">TILES</span>
      </div>
    </div>
  );
}
