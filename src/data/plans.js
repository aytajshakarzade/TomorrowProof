export const PLAN_LIMITS = Object.freeze({
  free: Object.freeze({
    id: 'free',
    maxProjects: 2,
    maxReports: 5,
    maxAiMessages: 3,
    maxClimateVariables: 3,
    maxAiContextItems: 3,
  }),
  go: Object.freeze({
    id: 'go',
    maxProjects: 10,
    maxReports: 50,
    maxAiMessages: 50,
    maxClimateVariables: 7,
    maxAiContextItems: 10,
  }),
  pro: Object.freeze({
    id: 'pro',
    maxProjects: Infinity,
    maxReports: Infinity,
    maxAiMessages: Infinity,
    maxClimateVariables: 7,
    maxAiContextItems: 25,
  }),
});

export const getPlanLimits = plan => PLAN_LIMITS[plan] || PLAN_LIMITS.free;

export const FREE_CLIMATE_VARIABLES = Object.freeze([
  'T2M_MAX',
  'T2M',
  'RH2M',
]);

export const canUseClimateVariable = (plan, variableId) =>
  getPlanLimits(plan).maxClimateVariables > FREE_CLIMATE_VARIABLES.length ||
  FREE_CLIMATE_VARIABLES.includes(variableId);

export const getMonthKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export const normalizeAiUsage = (stored, date = new Date()) => {
  const month = getMonthKey(date);
  if (!stored || stored.month !== month || !Number.isFinite(Number(stored.count))) {
    return { month, count: 0 };
  }
  return { month, count: Math.max(0, Math.floor(Number(stored.count))) };
};
