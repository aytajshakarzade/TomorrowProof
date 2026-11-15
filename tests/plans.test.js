import test from 'node:test';
import assert from 'node:assert/strict';
import {
  PLAN_LIMITS,
  canUseClimateVariable,
  getMonthKey,
  getPlanLimits,
  normalizeAiUsage,
} from '../src/data/plans.js';

test('plan tiers have progressively larger project, report and AI limits', () => {
  assert.equal(PLAN_LIMITS.free.maxProjects, 2);
  assert.equal(PLAN_LIMITS.go.maxProjects, 10);
  assert.equal(PLAN_LIMITS.pro.maxProjects, Infinity);
  assert.equal(PLAN_LIMITS.free.maxReports, 5);
  assert.equal(PLAN_LIMITS.go.maxReports, 50);
  assert.equal(PLAN_LIMITS.pro.maxReports, Infinity);
  assert.equal(PLAN_LIMITS.free.maxAiMessages, 3);
  assert.equal(PLAN_LIMITS.go.maxAiMessages, 50);
  assert.equal(PLAN_LIMITS.pro.maxAiMessages, Infinity);
});

test('unknown plans safely fall back to Free', () => {
  assert.equal(getPlanLimits('unknown').id, 'free');
});

test('Free unlocks core climate variables while Go and Pro unlock all variables', () => {
  assert.equal(canUseClimateVariable('free', 'T2M_MAX'), true);
  assert.equal(canUseClimateVariable('free', 'RH2M'), true);
  assert.equal(canUseClimateVariable('free', 'WS10M'), false);
  assert.equal(canUseClimateVariable('go', 'WS10M'), true);
  assert.equal(canUseClimateVariable('pro', 'PRECTOTCORR'), true);
});

test('AI usage resets at a new month and sanitizes stored counts', () => {
  const date = new Date(2026, 10, 15);
  assert.deepEqual(normalizeAiUsage({ month: getMonthKey(date), count: '4.8' }, date), {
    month: '2026-11', count: 4,
  });
  assert.deepEqual(normalizeAiUsage({ month: '2026-10', count: 20 }, date), {
    month: '2026-11', count: 0,
  });
  assert.deepEqual(normalizeAiUsage({ month: '2026-11', count: -2 }, date), {
    month: '2026-11', count: 0,
  });
});
