import React, { useEffect, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Polyline,
  Rectangle,
  useMap,
  CircleMarker
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { tileKeyToBounds, latLngToTileKey } from '../hooks/useGPS.js';

const GRID_SIZE = 0.0002; // ~22m tiles
const DEFAULT_CENTER = [51.505, -0.09];
const DEFAULT_ZOOM = 16;

// Sub-component to fly to user position
function FlyToPosition({ position }) {
  const map = useMap();
  const lastPos = useRef(null);
  const hasFlewOnce = useRef(false);

  useEffect(() => {
    if (!position) return;
    if (!hasFlewOnce.current) {
      map.flyTo(position, 17, { duration: 1.5 });
      hasFlewOnce.current = true;
    } else {
      // Gentle pan to follow user if they drift outside 30% of view
      const bounds = map.getBounds();
      const padded = bounds.pad(-0.3);
      if (!padded.contains(position)) {
        map.panTo(position, { animate: true, duration: 0.5 });
      }
    }
    lastPos.current = position;
  }, [position, map]);

  return null;
}

// Claimed tile rectangles
function ClaimedTiles({ tiles, color, fillColor }) {
  if (!tiles || tiles.size === 0) return null;
  return (
    <>
      {[...tiles].map(key => {
        const bounds = tileKeyToBounds(key, GRID_SIZE);
        return (
          <Rectangle
            key={key}
            bounds={bounds}
            pathOptions={{
              color,
              fillColor,
              fillOpacity: 0.3,
              weight: 1,
              opacity: 0.7
            }}
          />
        );
      })}
    </>
  );
}

// History tiles from a saved run
function HistoryTiles({ tiles }) {
  if (!tiles || tiles.length === 0) return null;
  const tileSet = new Set(tiles);
  return (
    <>
      {[...tileSet].map(key => {
        const bounds = tileKeyToBounds(key, GRID_SIZE);
        return (
          <Rectangle
            key={key}
            bounds={bounds}
            pathOptions={{
              color: 'rgba(100,160,255,0.8)',
              fillColor: 'rgba(100,160,255,0.9)',
              fillOpacity: 0.25,
              weight: 1,
              opacity: 0.6
            }}
          />
        );
      })}
    </>
  );
}

export default function MapView({ position, path, claimedTiles, historyRun, isTracking }) {
  return (
    <MapContainer
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      style={{ width: '100%', height: '100%' }}
      zoomControl={true}
      attributionControl={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        maxZoom={19}
      />

      {/* Fly to current user position */}
      {position && <FlyToPosition position={position} />}

      {/* Current run path */}
      {path.length >= 2 && (
        <Polyline
          positions={path}
          pathOptions={{
            color: '#00ff88',
            weight: 4,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round'
          }}
        />
      )}

      {/* Current run claimed tiles */}
      <ClaimedTiles
        tiles={claimedTiles}
        color="#00ff88"
        fillColor="#00ff88"
      />

      {/* Historical run overlay */}
      {historyRun && (
        <>
          <HistoryTiles tiles={historyRun.claimedTiles} />
          {historyRun.path && historyRun.path.length >= 2 && (
            <Polyline
              positions={historyRun.path}
              pathOptions={{
                color: '#64a0ff',
                weight: 3,
                opacity: 0.7,
                dashArray: '6 4'
              }}
            />
          )}
        </>
      )}

      {/* Current user position dot */}
      {position && (
        <>
          <CircleMarker
            center={position}
            radius={12}
            pathOptions={{
              color: '#00ff88',
              fillColor: '#00ff88',
              fillOpacity: 0.15,
              weight: 1,
              opacity: 0.5
            }}
          />
          <CircleMarker
            center={position}
            radius={5}
            pathOptions={{
              color: '#fff',
              fillColor: '#00ff88',
              fillOpacity: 1,
              weight: 2
            }}
          />
        </>
      )}
    </MapContainer>
  );
}
