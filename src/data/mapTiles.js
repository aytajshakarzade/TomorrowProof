// Standard map layers are deliberately keyless to avoid provider watermarks.
// CARTO raster basemaps began requiring keys in Sep 2026, so legacy VITE_MAP_TILE_URL
// settings are ignored here; configure a commercial/hosted provider deliberately in code
// only after adding its usage terms, required key handling, and attribution.
export const MAP_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
export const MAP_TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
