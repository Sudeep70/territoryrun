import React, { useState } from 'react';
import './Controls.css';

export default function Controls({
  isTracking,
  hasPath,
  isSaving,
  onStart,
  onStop,
  onSave,
  onReset,
  onToggleHistory,
  showHistory,
  error
}) {
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    await onSave();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="controls">
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠</span>
          {error}
        </div>
      )}

      <div className="controls-row">
        {!isTracking && !hasPath && (
          <button className="btn btn-primary" onClick={onStart}>
            <span className="btn-icon">▶</span>
            START RUN
          </button>
        )}

        {isTracking && (
          <button className="btn btn-danger" onClick={onStop}>
            <span className="btn-icon pulse-dot" />
            STOP
          </button>
        )}

        {!isTracking && hasPath && (
          <>
            <button
              className="btn btn-accent"
              onClick={handleSave}
              disabled={isSaving || saveSuccess}
            >
              {isSaving ? (
                <><span className="btn-icon spin">↻</span> SAVING...</>
              ) : saveSuccess ? (
                <><span className="btn-icon">✓</span> SAVED!</>
              ) : (
                <><span className="btn-icon">↑</span> SAVE RUN</>
              )}
            </button>
            <button className="btn btn-secondary" onClick={onReset}>
              <span className="btn-icon">✕</span>
              DISCARD
            </button>
          </>
        )}

        <button
          className={`btn btn-ghost ${showHistory ? 'active' : ''}`}
          onClick={onToggleHistory}
        >
          <span className="btn-icon">≡</span>
          HISTORY
        </button>
      </div>
    </div>
  );
}
