import { Intake, UserLimit, DashboardStats, DashboardRange, TimeSeriesPoint } from '../types';

const INTAKES_KEY = 'brewbalance_ai_intakes_v2';
const LIMITS_KEY = 'brewbalance_ai_limits_v2';
const USER_ID = 'u_default_user';

export const DEFAULT_LIMITS: UserLimit[] = [
  {
    id: 'lim_caffeine_daily',
    userId: USER_ID,
    metric: 'max_caffeine_daily',
    thresholdValue: 300,
    unit: 'mg',
    isActive: true
  },
  {
    id: 'lim_water_daily',
    userId: USER_ID,
    metric: 'min_water_daily',
    thresholdValue: 2500,
    unit: 'ml',
    isActive: true
  },
  {
    id: 'lim_caffeine_cutoff',
    userId: USER_ID,
    metric: 'caffeine_cutoff_hour',
    thresholdValue: 16, // 4:00 PM
    unit: 'hour',
    isActive: true
  }
];

// Clean legacy cache keys if present
try {
  if (localStorage.getItem('brewbalance_intakes_v1')) {
    localStorage.removeItem('brewbalance_intakes_v1');
  }
} catch {
  // Ignore in SSR/non-browser
}

// Optional realistic sample intake history generator for users who want to preview charts
export const generateSeedIntakes = (): Intake[] => {
  const seed: Intake[] = [];
  const now = new Date();

  // Create entries for the past 7 days
  for (let i = 6; i >= 0; i--) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const dayStr = day.toISOString().split('T')[0];

    // Morning Coffee
    seed.push({
      id: `seed_c_${i}_1`,
      userId: USER_ID,
      beverageType: 'coffee',
      volumeMl: 250,
      caffeineMg: 95,
      loggedAt: `${dayStr}T08:15:00Z`,
      source: 'manual',
      label: 'Morning Drip'
    });

    // Mid-morning Water
    seed.push({
      id: `seed_w_${i}_1`,
      userId: USER_ID,
      beverageType: 'water',
      volumeMl: 500,
      caffeineMg: 0,
      loggedAt: `${dayStr}T10:00:00Z`,
      source: 'nfc',
      label: 'Smart Bottle'
    });

    // Afternoon Tea
    seed.push({
      id: `seed_t_${i}_1`,
      userId: USER_ID,
      beverageType: 'tea',
      volumeMl: 300,
      caffeineMg: 45,
      loggedAt: `${dayStr}T13:45:00Z`,
      source: 'manual',
      label: 'Green Matcha'
    });

    // Afternoon Water
    seed.push({
      id: `seed_w_${i}_2`,
      userId: USER_ID,
      beverageType: 'water',
      volumeMl: 500,
      caffeineMg: 0,
      loggedAt: `${dayStr}T15:30:00Z`,
      source: 'manual'
    });

    // Evening Water
    seed.push({
      id: `seed_w_${i}_3`,
      userId: USER_ID,
      beverageType: 'water',
      volumeMl: 400,
      caffeineMg: 0,
      loggedAt: `${dayStr}T19:20:00Z`,
      source: 'manual'
    });
  }

  return seed;
};

export const getIntakes = (): Intake[] => {
  try {
    const raw = localStorage.getItem(INTAKES_KEY);
    if (!raw) {
      // First launch starts completely clean with 0 consumption
      return [];
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load intakes from localStorage:', err);
    return [];
  }
};

export const saveIntakes = (intakes: Intake[]): void => {
  try {
    localStorage.setItem(INTAKES_KEY, JSON.stringify(intakes));
  } catch (err) {
    console.error('Failed to save intakes to localStorage:', err);
  }
};

export const loadSampleData = (): Intake[] => {
  const seed = generateSeedIntakes();
  saveIntakes(seed);
  return seed;
};

export const clearAllIntakes = (): void => {
  saveIntakes([]);
};

export const addIntake = (intake: Omit<Intake, 'id' | 'userId'>): Intake => {
  const all = getIntakes();
  const record: Intake = {
    ...intake,
    id: `intk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId: USER_ID
  };
  const updated = [record, ...all];
  saveIntakes(updated);
  return record;
};

export const removeIntake = (id: string): void => {
  const all = getIntakes();
  saveIntakes(all.filter(i => i.id !== id));
};

export const getLimits = (): UserLimit[] => {
  try {
    const raw = localStorage.getItem(LIMITS_KEY);
    if (!raw) {
      saveLimits(DEFAULT_LIMITS);
      return DEFAULT_LIMITS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load limits:', err);
    return DEFAULT_LIMITS;
  }
};

export const saveLimits = (limits: UserLimit[]): void => {
  try {
    localStorage.setItem(LIMITS_KEY, JSON.stringify(limits));
  } catch (err) {
    console.error('Failed to save limits:', err);
  }
};

export const getTodayStats = () => {
  const all = getIntakes();
  const todayStr = new Date().toISOString().split('T')[0];
  
  const todayIntakes = all.filter(i => i.loggedAt.startsWith(todayStr));
  
  let todayWaterMl = 0;
  let todayWaterCount = 0;
  let todayTeaMl = 0;
  let todayTeaCount = 0;
  let todayTeaCaffeine = 0;
  let todayCoffeeMl = 0;
  let todayCoffeeCount = 0;
  let todayCoffeeCaffeine = 0;
  let todayCaffeineMg = 0;

  todayIntakes.forEach(i => {
    const caff = i.caffeineMg || 0;
    todayCaffeineMg += caff;

    if (i.beverageType === 'water') {
      todayWaterMl += i.volumeMl;
      todayWaterCount++;
    } else if (i.beverageType === 'tea') {
      todayTeaMl += i.volumeMl;
      todayTeaCount++;
      todayTeaCaffeine += caff;
    } else if (i.beverageType === 'coffee') {
      todayCoffeeMl += i.volumeMl;
      todayCoffeeCount++;
      todayCoffeeCaffeine += caff;
    }
  });

  const limits = getLimits();
  const maxCaffLimit = limits.find(l => l.metric === 'max_caffeine_daily')?.thresholdValue || 300;
  const minWaterLimit = limits.find(l => l.metric === 'min_water_daily')?.thresholdValue || 2500;
  const cutoffHour = limits.find(l => l.metric === 'caffeine_cutoff_hour')?.thresholdValue || 16;

  // Minutes since last intake
  let minutesSinceLastIntake = todayIntakes.length > 0 ? 999 : 0;
  let lastIntakeTime: string | null = null;
  let lastCaffeineTime: string | null = null;

  if (todayIntakes.length > 0) {
    const sorted = [...todayIntakes].sort((a, b) => new Date(b.loggedAt).getTime() - new Date(a.loggedAt).getTime());
    lastIntakeTime = sorted[0].loggedAt;
    const lastTime = new Date(sorted[0].loggedAt).getTime();
    minutesSinceLastIntake = Math.max(0, Math.floor((Date.now() - lastTime) / 60000));

    const caffIntakes = sorted.filter(i => (i.caffeineMg || 0) > 0);
    if (caffIntakes.length > 0) {
      lastCaffeineTime = caffIntakes[0].loggedAt;
    }
  }

  return {
    todayIntakes,
    todayWaterMl,
    todayWaterCount,
    todayTeaMl,
    todayTeaCount,
    todayTeaCaffeine,
    todayCoffeeMl,
    todayCoffeeCount,
    todayCoffeeCaffeine,
    todayCaffeineMg,
    maxCaffLimit,
    minWaterLimit,
    cutoffHour,
    minutesSinceLastIntake,
    lastIntakeTime,
    lastCaffeineTime
  };
};

export const getDashboardStats = (range: DashboardRange): DashboardStats => {
  const all = getIntakes();
  const now = new Date();
  
  let filtered = [...all];
  let daysCount = 1;

  if (range === 'day') {
    const todayStr = now.toISOString().split('T')[0];
    filtered = all.filter(i => i.loggedAt.startsWith(todayStr));
    daysCount = 1;
  } else if (range === 'week') {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    filtered = all.filter(i => new Date(i.loggedAt) >= weekAgo);
    daysCount = 7;
  } else if (range === 'month') {
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    filtered = all.filter(i => new Date(i.loggedAt) >= monthAgo);
    daysCount = 30;
  } else if (range === 'year') {
    const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    filtered = all.filter(i => new Date(i.loggedAt) >= yearAgo);
    daysCount = 365;
  } else {
    // lifetime
    daysCount = 90;
  }

  let totalWaterMl = 0;
  let totalCaffeineMg = 0;
  let totalVolumeMl = 0;

  const waterMetric = { count: 0, volumeMl: 0, caffeineMg: 0 };
  const teaMetric = { count: 0, volumeMl: 0, caffeineMg: 0 };
  const coffeeMetric = { count: 0, volumeMl: 0, caffeineMg: 0 };
  const hourBuckets: { [hour: number]: number } = {};

  filtered.forEach(i => {
    totalVolumeMl += i.volumeMl;
    const caff = i.caffeineMg || 0;
    totalCaffeineMg += caff;

    if (i.beverageType === 'water') {
      totalWaterMl += i.volumeMl;
      waterMetric.count++;
      waterMetric.volumeMl += i.volumeMl;
    } else if (i.beverageType === 'tea') {
      teaMetric.count++;
      teaMetric.volumeMl += i.volumeMl;
      teaMetric.caffeineMg += caff;
    } else if (i.beverageType === 'coffee') {
      coffeeMetric.count++;
      coffeeMetric.volumeMl += i.volumeMl;
      coffeeMetric.caffeineMg += caff;
    }

    const hr = new Date(i.loggedAt).getHours();
    hourBuckets[hr] = (hourBuckets[hr] || 0) + 1;
  });

  // Calculate breakdown
  const totalCount = waterMetric.count + teaMetric.count + coffeeMetric.count;
  const beverageBreakdown = {
    waterPercentage: totalCount ? Math.round((waterMetric.count / totalCount) * 100) : 0,
    teaPercentage: totalCount ? Math.round((teaMetric.count / totalCount) * 100) : 0,
    coffeePercentage: totalCount ? Math.round((coffeeMetric.count / totalCount) * 100) : 0
  };

  // Peak Hour
  let peakHour: number | null = null;
  let peakCount = 0;
  Object.entries(hourBuckets).forEach(([hr, count]) => {
    if (count > peakCount) {
      peakCount = count;
      peakHour = parseInt(hr, 10);
    }
  });

  // Compliance Score (rough formula based on water target met & caffeine under limit)
  const limits = getLimits();
  const maxCaff = limits.find(l => l.metric === 'max_caffeine_daily')?.thresholdValue || 300;
  const avgCaffPerDay = totalCaffeineMg / Math.max(1, daysCount);
  const caffPenalty = avgCaffPerDay > maxCaff ? Math.min(40, ((avgCaffPerDay - maxCaff) / maxCaff) * 100) : 0;
  const complianceScore = Math.max(20, Math.round(95 - caffPenalty));

  // Build Time Series Data
  const series: TimeSeriesPoint[] = [];
  if (range === 'day') {
    // 6-hour chunks for Day view
    for (let h = 0; h < 24; h += 3) {
      const label = `${h.toString().padStart(2, '0')}:00`;
      const inWindow = filtered.filter(i => {
        const hr = new Date(i.loggedAt).getHours();
        return hr >= h && hr < h + 3;
      });
      series.push({
        label,
        waterMl: inWindow.filter(i => i.beverageType === 'water').reduce((s, i) => s + i.volumeMl, 0),
        caffeineMg: inWindow.reduce((s, i) => s + i.caffeineMg, 0),
        waterCount: inWindow.filter(i => i.beverageType === 'water').length,
        teaCount: inWindow.filter(i => i.beverageType === 'tea').length,
        coffeeCount: inWindow.filter(i => i.beverageType === 'coffee').length
      });
    }
  } else {
    // Daily intervals for Week / Month
    const pointsCount = range === 'week' ? 7 : range === 'month' ? 10 : 12;
    for (let d = pointsCount - 1; d >= 0; d--) {
      const ptDate = new Date(now.getTime() - d * 24 * 60 * 60 * 1000 * (range === 'year' ? 30 : 1));
      const dateLabel = range === 'year' 
        ? ptDate.toLocaleString('default', { month: 'short' })
        : ptDate.toLocaleDateString('default', { weekday: 'short' });
      const isoDate = ptDate.toISOString().split('T')[0];

      const inDay = filtered.filter(i => i.loggedAt.startsWith(isoDate));
      series.push({
        label: dateLabel,
        waterMl: inDay.filter(i => i.beverageType === 'water').reduce((s, i) => s + i.volumeMl, 0),
        caffeineMg: inDay.reduce((s, i) => s + i.caffeineMg, 0),
        waterCount: inDay.filter(i => i.beverageType === 'water').length,
        teaCount: inDay.filter(i => i.beverageType === 'tea').length,
        coffeeCount: inDay.filter(i => i.beverageType === 'coffee').length
      });
    }
  }

  return {
    range,
    totalWaterMl,
    totalCaffeineMg,
    totalVolumeMl,
    beverageBreakdown,
    counts: {
      water: waterMetric.count,
      tea: teaMetric.count,
      coffee: coffeeMetric.count
    },
    beverages: {
      water: waterMetric,
      tea: teaMetric,
      coffee: coffeeMetric
    },
    complianceScore,
    peakConsumptionHour: peakHour,
    series
  };
};

export const exportDataCSV = (): string => {
  const all = getIntakes();
  const headers = ['id', 'user_id', 'beverage_type', 'volume_ml', 'caffeine_mg', 'logged_at', 'source', 'label'];
  const rows = all.map(i => [
    i.id,
    i.userId,
    i.beverageType,
    i.volumeMl,
    i.caffeineMg,
    i.loggedAt,
    i.source,
    i.label || ''
  ].map(v => `"${v}"`).join(','));

  return [headers.join(','), ...rows].join('\n');
};

export const exportDataJSON = (): string => {
  const all = getIntakes();
  const limits = getLimits();
  return JSON.stringify({ version: '1.0.0', exportedAt: new Date().toISOString(), intakes: all, limits }, null, 2);
};
