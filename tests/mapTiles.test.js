import test from 'node:test';
import assert from 'node:assert/strict';
import { MAP_TILE_URL, MAP_TILE_ATTRIBUTION } from '../src/data/mapTiles.js';

test('default map tile layer is the public keyless OpenStreetMap endpoint', () => {
  assert.equal(MAP_TILE_URL, 'https://tile.openstreetmap.org/{z}/{x}/{y}.png');
  assert.doesNotMatch(MAP_TILE_URL, /cartocdn\.com|\bkey=/i);
  assert.match(MAP_TILE_ATTRIBUTION, /openstreetmap\.org\/copyright/i);
});
