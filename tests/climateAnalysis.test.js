import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeMonthlyBaseline, summarizeMonthlyTrend } from '../src/data/climateAnalysis.js';

function monthlySeries(startYear, endYear, fn, missing = new Set()) {
  const values = {};
  for (let year = startYear; year <= endYear; year += 1) {
    for (let month = 1; month <= 12; month += 1) {
      const key = `${year}${String(month).padStart(2, '0')}`;
      values[key] = missing.has(key) ? -999 : fn(year, month);
    }
  }
  return values;
}

test('annual means keep the valid month count and exclude years with fewer than 9 valid months', () => {
  const raw = monthlySeries(2001, 2012, year => year - 2000);
  for (let month = 1; month <= 4; month += 1) raw[`200505${month}`] = -999; // malformed keys should be ignored
  for (let month = 1; month <= 4; month += 1) raw[`2005${String(month).padStart(2, '0')}`] = -999;
  const result = summarizeMonthlyTrend(raw);
  assert.equal(result.series.some(row => row.year === 2005), false);
  assert.equal(result.series.find(row => row.year === 2004).monthsUsed, 12);
  assert.equal(result.annualCoverageThresholdMonths, 9);
});

test('missing NASA sentinel values remain visible and are not imputed', () => {
  const raw = monthlySeries(2001, 2012, year => year - 2000);
  raw['200101'] = -999;
  const result = summarizeMonthlyTrend(raw);
  assert.equal(result.missingMonthlyCount, 1);
  assert.deepEqual(result.monthlyObservations.find(row => row.year === 2001 && row.month === 1).value, null);
  assert.equal(result.series.find(row => row.year === 2001).monthsUsed, 11);
});

test('positive and negative annual trends are classified by the displayed slope sign', () => {
  const rising = summarizeMonthlyTrend(monthlySeries(2001, 2012, year => (year - 2001) * 0.1));
  const falling = summarizeMonthlyTrend(monthlySeries(2001, 2012, year => 10 - (year - 2001) * 0.1));
  const flat = summarizeMonthlyTrend(monthlySeries(2001, 2012, () => 15));
  assert.equal(rising.trend, 'Increasing');
  assert.equal(falling.trend, 'Decreasing');
  assert.equal(flat.trend, 'Relatively stable');
});

test('only 6-digit year-month keys are treated as source observations', () => {
  const raw = monthlySeries(2001, 2012, year => year - 2000);
  raw.metadata = 12;
  raw.annual = 4;
  const result = summarizeMonthlyTrend(raw);
  assert.equal(result.monthlyObservations.length, 144);
});

test('null, undefined and empty string values are missing, never converted to zero', () => {
  const raw = monthlySeries(2001, 2012, () => 4);
  raw['200101'] = null;
  raw['200102'] = '';
  raw['200103'] = undefined;
  const result = summarizeMonthlyTrend(raw);
  assert.equal(result.missingMonthlyCount, 3);
  assert.equal(result.monthlyObservations.find(row => row.year === 2001 && row.month === 1).value, null);
  assert.equal(result.monthlyObservations.find(row => row.year === 2001 && row.month === 2).value, null);
  assert.equal(result.monthlyObservations.find(row => row.year === 2001 && row.month === 3).value, null);
  assert.equal(result.series.find(row => row.year === 2001).monthsUsed, 9);
});


test('trend summaries count completely absent expected months as missing when a period is supplied', () => {
  const raw = monthlySeries(2001, 2012, year => year - 2000);
  delete raw['200101'];
  const result = summarizeMonthlyTrend(raw, { startYear: 2001, endYear: 2012 });
  assert.equal(result.expectedMonthlyCount, 144);
  assert.equal(result.validMonthlyCount, 143);
  assert.equal(result.missingMonthlyCount, 1);
  assert.equal(result.monthlyObservations.find(row => row.year === 2001 && row.month === 1).value, null);
});

test('building baseline averages qualifying annual means and requires minimum data coverage', () => {
  const raw = monthlySeries(2001, 2024, year => year - 2000);
  for (let month = 1; month <= 4; month += 1) raw[`2005${String(month).padStart(2, '0')}`] = -999;
  const result = summarizeMonthlyBaseline(raw, { startYear: 2001, endYear: 2024, minMonthsPerYear: 9, minValidYears: 10 });
  assert.equal(result.validMonthlyCount, 284);
  assert.equal(result.missingMonthlyCount, 4);
  assert.equal(result.validYearCount, 23);
  assert.equal(result.mean, 12.83);
  const sparseRaw = monthlySeries(2001, 2024, () => 5);
  for (let year = 2001; year <= 2015; year += 1) {
    for (let month = 1; month <= 4; month += 1) sparseRaw[`${year}${String(month).padStart(2, '0')}`] = -999;
  }
  const tooSparse = summarizeMonthlyBaseline(sparseRaw, { startYear: 2001, endYear: 2024, minMonthsPerYear: 9, minValidYears: 10 });
  assert.equal(tooSparse.validYearCount, 9);
  assert.equal(tooSparse.mean, null);
});
