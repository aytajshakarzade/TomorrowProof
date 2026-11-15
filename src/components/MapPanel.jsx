import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, ZoomControl, useMap } from 'react-leaflet';
import { cities } from '../data/azerbaijan.js';
import { MAP_TILE_URL, MAP_TILE_ATTRIBUTION } from '../data/mapTiles.js';

function MapResizeHandler({ refreshKey }) {
  const map = useMap();
  useEffect(() => {
    const timer = window.setTimeout(() => map.invalidateSize(), 180);
    return () => window.clearTimeout(timer);
  }, [map, refreshKey]);
  return null;
}

const corridors = [
  [[40.4093,49.8671],[40.5855,49.6317]],
  [[40.4093,49.8671],[40.6828,46.3606]],
  [[40.6828,46.3606],[40.7639,47.0595]],
  [[40.6828,46.3606],[41.1919,47.1706]],
  [[39.9320,48.9200],[38.7543,48.8506]],
];

export default function MapPanel({ selectedCity, onSelect, showCenters, showCorridors, showLabels }) {
  const selected = cities.find(city => city.id === selectedCity) || cities[0];
  return (
    <div className="map-frame">
      <MapContainer center={[40.18, 47.85]} zoom={6} minZoom={5} maxZoom={13} zoomControl={false} scrollWheelZoom className="leaflet-map">
        <MapResizeHandler refreshKey={`${showCenters}-${showCorridors}-${showLabels}`} />
        <TileLayer
          attribution={MAP_TILE_ATTRIBUTION}
          url={MAP_TILE_URL}
        />
        <ZoomControl position="bottomright" />
        {showCorridors && corridors.map((line, i) => <Polyline key={i} positions={line} pathOptions={{ color: '#a6d85d', weight: 2, opacity: 0.48, dashArray: '5 8' }} />)}
        {showCenters && cities.map(city => (
          <CircleMarker
            key={city.id}
            center={[city.lat, city.lng]}
            radius={city.id === selectedCity ? 9 : 6}
            pathOptions={{ color: city.id === selectedCity ? '#d9ff85' : '#b9d2c4', fillColor: city.id === selectedCity ? '#c9f36a' : '#6f9c89', fillOpacity: 0.92, weight: city.id === selectedCity ? 3 : 1.5 }}
            eventHandlers={{ click: () => onSelect(city.id) }}
          >
            <Tooltip direction="top" offset={[0,-7]} permanent={showLabels} className="city-tooltip">{city.name}</Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
      <div className="map-caption"><span className="map-dot" /> {selected.name} seçilib <span className="caption-separator">·</span> {selected.region}</div>
      <div className="map-scale"><span>0</span><i /><span>100 km</span></div>
    </div>
  );
}
