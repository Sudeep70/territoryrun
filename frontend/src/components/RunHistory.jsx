import React, { useEffect, useState } from 'react';
import { fetchRuns, deleteRun } from '../api.js';
import { formatDistance, formatDuration, formatDate } from '../utils.js';
import './RunHistory.css';

export default function RunHistory({ onClose, onSelectRun, selectedRunId }) {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRuns();
      setRuns(data.reverse()); // newest first
    } catch (e) {
      setError('Could not connect to backend. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this run?')) return;
    setDeleting(id);
    try {
      await deleteRun(id);
      setRuns(runs => runs.filter(r => r.id !== id));
      if (selectedRunId === id) onSelectRun(null);
    } catch (e) {
      alert('Failed to delete run.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="history-panel">
      <div className="history-header">
        <h2 className="history-title">RUN HISTORY</h2>
        <button className="history-close" onClick={onClose}>✕</button>
      </div>

      {loading && (
        <div className="history-loading">
          <span className="loading-spinner">↻</span>
          LOADING...
        </div>
      )}

      {error && (
        <div className="history-error">
          <span>⚠</span> {error}
        </div>
      )}

      {!loading && !error && runs.length === 0 && (
        <div className="history-empty">
          <span className="empty-icon">🏃</span>
          <p>No runs saved yet.</p>
          <p className="empty-sub">Start running to claim territory!</p>
        </div>
      )}

      <div className="history-list">
        {runs.map((run, i) => (
          <div
            key={run.id}
            className={`run-card ${selectedRunId === run.id ? 'selected' : ''}`}
            onClick={() => onSelectRun(selectedRunId === run.id ? null : run)}
          >
            <div className="run-card-header">
              <span className="run-number">#{runs.length - i}</span>
              <span className="run-date">{formatDate(run.createdAt)}</span>
              <button
                className="run-delete"
                onClick={(e) => handleDelete(e, run.id)}
                disabled={deleting === run.id}
              >
                {deleting === run.id ? '...' : '✕'}
              </button>
            </div>
            <div className="run-card-stats">
              <div className="run-stat">
                <span className="run-stat-val">{formatDistance(run.distance)}</span>
                <span className="run-stat-lbl">DIST</span>
              </div>
              <div className="run-stat">
                <span className="run-stat-val">{formatDuration(run.duration)}</span>
                <span className="run-stat-lbl">TIME</span>
              </div>
              <div className="run-stat">
                <span className="run-stat-val accent">{run.claimedTiles?.length || 0}</span>
                <span className="run-stat-lbl">TILES</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
