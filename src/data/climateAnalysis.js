/**
 * Deterministic helpers for summarising NASA POWER monthly observations.
 * These functions do not fetch data; callers supply the actual source series.
 */
export function isValidClimateObservation(value) {
  // Number(null) and Number('') are both 0 in JavaScript, but neither means an
  // observed zero. Keep those and NASA's <= -900 sentinel values as missing.
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) return false;
  const number = Number(value);
  return Number.isFinite(number) && number > -900;
}

function validMonthKeys(raw) {
  return Object.keys(raw || {})
    .filter(key => /^\d{6}$/.test(key) && Number(key.slice(4, 6)) >= 1 && Number(key.slice(4, 6)) <= 12)
    .sort();
}

function makeMonthKeys(startYear, endYear) {
  const keys = [];
  for (let year = startYear; year <= endYear; year += 1) {
    for (let month = 1; month <= 12; month += 1) keys.push(`${year}${String(month).padStart(2, '0')}`);
  }
  return keys;
}

function readValue(raw, key) {
  const value = raw?.[key];
  return isValidClimateObservation(value) ? Number(Number(value).toFixed(3)) : null;
}

export function summarizeMonthlyTrend(raw, { minMonthsPerYear = 9, startYear = null, endYear = null } = {}) {
  const sourceKeys = validMonthKeys(raw);
  const expectedKeys = Number.isInteger(startYear) && Number.isInteger(endYear) && endYear >= startYear
    ? makeMonthKeys(startYear, endYear)
    : sourceKeys;
  const annual = {};
  const monthlyObservations = expectedKeys.map(month => {
    const validValue = readValue(raw, month);
    const year = month.slice(0, 4);
    if (validValue !== null) {
      if (!annual[year]) annual[year] = { sum: 0, count: 0 };
      annual[year].sum += validValue;
      annual[year].count += 1;
    }
    return { year: Number(year), month: Number(month.slice(4, 6)), value: validValue };
  });

  const series = Object.entries(annual)
    .sort(([a], [b]) => Number(a) - Number(b))
    .filter(([, values]) => values.count >= minMonthsPerYear)
    .map(([year, values]) => ({
      year: Number(year),
      value: Number((values.sum / values.count).toFixed(2)),
      monthsUsed: values.count,
    }));

  let slope = 0;
  if (series.length >= 2) {
    const xs = series.map(point => point.year);
    const meanX = xs.reduce((sum, value) => sum + value, 0) / xs.length;
    const meanY = series.reduce((sum, point) => sum + point.value, 0) / series.length;
    const numerator = series.reduce((sum, point, index) => sum + (xs[index] - meanX) * (point.value - meanY), 0);
    const denominator = xs.reduce((sum, value) => sum + (value - meanX) ** 2, 0);
    slope = denominator > 0 ? numerator / denominator : 0;
  }

  // This is a descriptive label, not a statistical significance result.
  const roundedSlope = Number(slope.toFixed(3));
  const trend = roundedSlope === 0 ? 'Relatively stable' : roundedSlope > 0 ? 'Increasing' : 'Decreasing';
  const missingMonthlyCount = monthlyObservations.filter(item => item.value === null).length;

  return {
    series,
    monthlyObservations,
    missingMonthlyCount,
    validMonthlyCount: monthlyObservations.length - missingMonthlyCount,
    expectedMonthlyCount: monthlyObservations.length,
    annualCoverageThresholdMonths: minMonthsPerYear,
    slope: roundedSlope,
    trend,
  };
}

/**
 * Build a multi-year baseline by first computing each year's mean from at least
 * minMonthsPerYear valid months, then averaging those qualifying annual means.
 * This avoids silently overweighting years with more available months.
 */
export function summarizeMonthlyBaseline(raw, {
  startYear = 2001,
  endYear = 2024,
  minMonthsPerYear = 9,
  minValidYears = 10,
} = {}) {
  const expectedKeys = makeMonthKeys(startYear, endYear);
  const byYear = {};
  const monthly = expectedKeys.map(key => {
    const value = readValue(raw, key);
    const year = Number(key.slice(0, 4));
    if (value !== null) {
      if (!byYear[year]) byYear[year] = { sum: 0, count: 0 };
      byYear[year].sum += value;
      byYear[year].count += 1;
    }
    return { year, month: Number(key.slice(4, 6)), value };
  });
  const annualSeries = Object.entries(byYear)
    .sort(([a], [b]) => Number(a) - Number(b))
    .filter(([, row]) => row.count >= minMonthsPerYear)
    .map(([year, row]) => ({ year: Number(year), value: row.sum / row.count, monthsUsed: row.count }));
  const mean = annualSeries.length >= minValidYears
    ? Number((annualSeries.reduce((sum, row) => sum + row.value, 0) / annualSeries.length).toFixed(2))
    : null;
  const validMonthlyCount = monthly.filter(row => row.value !== null).length;
  return {
    mean,
    annualSeries: annualSeries.map(row => ({ ...row, value: Number(row.value.toFixed(2)) })),
    validMonthlyCount,
    expectedMonthlyCount: monthly.length,
    missingMonthlyCount: monthly.length - validMonthlyCount,
    validYearCount: annualSeries.length,
    expectedYearCount: endYear - startYear + 1,
    minMonthsPerYear,
    minValidYears,
  };
}
