import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Haversine distance between two [lat, lng] points in meters
 */
export function haversineDistance([lat1, lon1], [lat2, lon2]) {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert lat/lng to a tile key string based on grid size (degrees)
 */
export function latLngToTileKey(lat, lng, gridSize = 0.0002) {
  const tileX = Math.floor(lng / gridSize);
  const tileY = Math.floor(lat / gridSize);
  return `${tileX}:${tileY}`;
}

/**
 * Convert tile key back to lat/lng bounds
 */
export function tileKeyToBounds(key, gridSize = 0.0002) {
  const [tileX, tileY] = key.split(':').map(Number);
  const south = tileY * gridSize;
  const north = (tileY + 1) * gridSize;
  const west = tileX * gridSize;
  const east = (tileX + 1) * gridSize;
  return [[south, west], [north, east]];
}

export function useGPS() {
  const [position, setPosition] = useState(null);       // current [lat, lng]
  const [path, setPath] = useState([]);                  // array of [lat, lng]
  const [distance, setDistance] = useState(0);           // meters
  const [claimedTiles, setClaimedTiles] = useState(new Set());
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  const [duration, setDuration] = useState(0);           // seconds
  const [startTime, setStartTime] = useState(null);

  const watchIdRef = useRef(null);
  const timerRef = useRef(null);
  const pathRef = useRef([]);
  const distanceRef = useRef(0);
  const claimedTilesRef = useRef(new Set());

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setError(null);
    setPath([]);
    setDistance(0);
    setClaimedTiles(new Set());
    setDuration(0);
    pathRef.current = [];
    distanceRef.current = 0;
    claimedTilesRef.current = new Set();
    const now = new Date().toISOString();
    setStartTime(now);

    // Start duration timer
    const startMs = Date.now();
    timerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startMs) / 1000));
    }, 1000);

    // Start geolocation watch
    watchIdRef.current = navigator.geolocation.watchPosition(
      (geo) => {
        const newPos = [geo.coords.latitude, geo.coords.longitude];
        setPosition(newPos);

        const prev = pathRef.current;

        // Add point if moved more than 3 meters (filter GPS jitter)
        if (prev.length === 0 || haversineDistance(prev[prev.length - 1], newPos) > 3) {
          const updated = [...prev, newPos];
          pathRef.current = updated;
          setPath([...updated]);

          // Update distance
          if (prev.length > 0) {
            const added = haversineDistance(prev[prev.length - 1], newPos);
            distanceRef.current += added;
            setDistance(distanceRef.current);
          }

          // Claim tile
          const tileKey = latLngToTileKey(newPos[0], newPos[1]);
          if (!claimedTilesRef.current.has(tileKey)) {
            claimedTilesRef.current = new Set([...claimedTilesRef.current, tileKey]);
            setClaimedTiles(new Set(claimedTilesRef.current));
          }
        }
      },
      (err) => {
        console.error('GPS error:', err);
        setError(`GPS error: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );

    setIsTracking(true);
  }, []);

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsTracking(false);
  }, []);

  const resetRun = useCallback(() => {
    stopTracking();
    setPath([]);
    setDistance(0);
    setClaimedTiles(new Set());
    setDuration(0);
    setStartTime(null);
    pathRef.current = [];
    distanceRef.current = 0;
    claimedTilesRef.current = new Set();
  }, [stopTracking]);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return {
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
  };
}
