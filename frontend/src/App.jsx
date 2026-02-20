import React, { useState, useCallback } from 'react';
import Header from './components/Header.jsx';
import StatsBar from './components/StatsBar.jsx';
import MapView from './components/MapView.jsx';
import Controls from './components/Controls.jsx';
import RunHistory from './components/RunHistory.jsx';
import { useGPS } from './hooks/useGPS.js';
import { saveRun } from './api.js';
import './App.css';

export default function App() {
  const {
    position,
    path,
    distance,
    claimedTiles,
    isTracking,
    error,
    duration,
    startTime,
    startTracking,
    stopTracking,
    resetRun
  } = useGPS();

  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryRun, setSelectedHistoryRun] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const hasPath = path.length >= 2;

  const handleSave = useCallback(async () => {
    if (!hasPath) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveRun({
        path,
        distance,
        claimedTiles: [...claimedTiles],
        duration,
        startTime,
        endTime: new Date().toISOString()
      });
      resetRun();
    } catch (e) {
      setSaveError(`Save failed: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [path, distance, claimedTiles, duration, startTime, hasPath, resetRun]);

  const handleSelectRun = useCallback((run) => {
    setSelectedHistoryRun(run);
  }, []);

  const displayError = error || saveError;

  return (
    <div className="app">
      <Header isTracking={isTracking} hasGPS={!!position} />

      <StatsBar
        distance={distance}
        duration={duration}
        claimedTiles={claimedTiles.size}
        isTracking={isTracking}
      />

      <div className="map-container">
        <MapView
          position={position}
          path={path}
          claimedTiles={claimedTiles}
          historyRun={selectedHistoryRun}
          isTracking={isTracking}
        />

        {showHistory && (
          <RunHistory
            onClose={() => setShowHistory(false)}
            onSelectRun={handleSelectRun}
            selectedRunId={selectedHistoryRun?.id}
          />
        )}

        {selectedHistoryRun && !showHistory && (
          <div className="history-chip" onClick={() => setShowHistory(true)}>
            <span className="chip-dot" />
            Viewing: Run #{selectedHistoryRun.id.slice(-4).toUpperCase()}
            <button
              className="chip-close"
              onClick={(e) => { e.stopPropagation(); setSelectedHistoryRun(null); }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      <Controls
        isTracking={isTracking}
        hasPath={hasPath}
        isSaving={isSaving}
        onStart={startTracking}
        onStop={stopTracking}
        onSave={handleSave}
        onReset={resetRun}
        onToggleHistory={() => setShowHistory(h => !h)}
        showHistory={showHistory}
        error={displayError}
      />
    </div>
  );
}
