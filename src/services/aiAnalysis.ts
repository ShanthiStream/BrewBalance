import { getTodayStats } from './storage';

export interface DailyAiAnalysis {
  headline: string;
  vitalityScore: number;
  vitalityTier: 'Optimal' | 'Balanced' | 'Needs Hydration' | 'Caffeine Peak' | 'Resting Zone';
  tierColor: string;
  tierBg: string;
  insights: {
    category: string;
    title: string;
    description: string;
    iconType: 'hydration' | 'caffeine' | 'circadian' | 'balance';
  }[];
  recommendationNote: string;
  generatedAt: string;
}

export const generateDailyAiAnalysis = (): DailyAiAnalysis => {
  const stats = getTodayStats();
  const now = new Date();
  const currentHour = now.getHours();

  const {
    todayWaterMl,
    todayWaterCount,
    todayTeaCount,
    todayTeaCaffeine,
    todayCoffeeCount,
    todayCoffeeCaffeine,
    todayCaffeineMg,
    maxCaffLimit,
    minWaterLimit,
    cutoffHour,
    lastCaffeineTime
  } = stats;

  const waterRatio = todayWaterMl / Math.max(1, minWaterLimit);
  const caffRatio = todayCaffeineMg / Math.max(1, maxCaffLimit);
  const totalDrinks = todayWaterCount + todayTeaCount + todayCoffeeCount;

  // 1. Determine Vitality Tier & Headline
  let vitalityScore = 88;
  let vitalityTier: DailyAiAnalysis['vitalityTier'] = 'Balanced';
  let headline = 'Balanced Cognitive Rhythm & Healthy Hydration Pacing';
  let tierColor = 'var(--color-water)';
  let tierBg = 'var(--color-water-bg)';

  if (totalDrinks === 0) {
    vitalityScore = 70;
    vitalityTier = 'Needs Hydration';
    headline = 'Day Initialized: Awaiting Morning Fluid Intake';
    tierColor = '#38bdf8';
    tierBg = 'rgba(56, 189, 248, 0.15)';
  } else if (todayCaffeineMg >= maxCaffLimit) {
    vitalityScore = 65;
    vitalityTier = 'Caffeine Peak';
    headline = 'Caffeine Saturation: Nervous System Transitioning to Recovery';
    tierColor = 'var(--color-danger)';
    tierBg = 'var(--color-danger-bg)';
  } else if (currentHour >= cutoffHour) {
    vitalityScore = 92;
    vitalityTier = 'Resting Zone';
    headline = 'Circadian Decompression: Adenosine Clearance Active for Sleep';
    tierColor = '#c084fc';
    tierBg = 'rgba(192, 132, 252, 0.15)';
  } else if (waterRatio >= 0.7 && caffRatio <= 0.8) {
    vitalityScore = 96;
    vitalityTier = 'Optimal';
    headline = 'Prime Biomarker State: Excellent Hydration & Controlled Stimulation';
    tierColor = 'var(--color-success)';
    tierBg = 'var(--color-tea-bg)';
  } else if (waterRatio < 0.4 && totalDrinks >= 2) {
    vitalityScore = 72;
    vitalityTier = 'Needs Hydration';
    headline = 'Hydration Deficit Detected Relative to Caffeine Acceleration';
    tierColor = 'var(--color-warning)';
    tierBg = 'rgba(251, 191, 36, 0.15)';
  }

  // 2. Synthesize AI Insights
  const insights: DailyAiAnalysis['insights'] = [];

  // Insight 1: Hydration Velocity
  if (waterRatio >= 1.0) {
    insights.push({
      category: 'Hydration Target',
      title: 'Target Achieved',
      description: `You have consumed ${(todayWaterMl / 1000).toFixed(1)}L (${Math.round(waterRatio * 100)}% of your ${minWaterLimit}ml target). Cellular hydration is operating at full potential.`,
      iconType: 'hydration'
    });
  } else {
    const remaining = minWaterLimit - todayWaterMl;
    insights.push({
      category: 'Hydration Pacing',
      title: `${Math.round(waterRatio * 100)}% of Daily Goal`,
      description: `Logged ${todayWaterMl}ml across ${todayWaterCount} servings. ${remaining}ml remaining to maintain peak mental clarity and avoid sluggishness.`,
      iconType: 'hydration'
    });
  }

  // Insight 2: Caffeine Half-Life & Sleep Guard
  if (lastCaffeineTime) {
    const lastCaffDate = new Date(lastCaffeineTime);
    const hoursSinceCaff = Math.max(0, Math.round((now.getTime() - lastCaffDate.getTime()) / (1000 * 60 * 60)));
    const estimatedClearanceHours = Math.max(0, 6 - hoursSinceCaff);

    if (currentHour >= cutoffHour) {
      insights.push({
        category: 'Circadian Sleep Window',
        title: 'Caffeine Cut-off Enforced',
        description: `Your last caffeinated drink was ~${hoursSinceCaff}h ago. Half-life decay will reduce systemic levels before bedtime, promoting deep Stage 3 slow-wave sleep.`,
        iconType: 'circadian'
      });
    } else {
      insights.push({
        category: 'Metabolic Clearance',
        title: `${todayCaffeineMg}mg Total Load (${Math.round(caffRatio * 100)}% limit)`,
        description: `Last stimulant logged ~${hoursSinceCaff}h ago. With a ~5.5h half-life, ~${Math.round(todayCaffeineMg * 0.4)}mg remains active. Clearance estimated in ~${estimatedClearanceHours}h.`,
        iconType: 'caffeine'
      });
    }
  } else {
    insights.push({
      category: 'Stimulant Baseline',
      title: 'Zero Caffeine Consumed Today',
      description: 'Your adenosine receptors remain unblocked today. Natural circadian alertness is active without rebound fatigue.',
      iconType: 'caffeine'
    });
  }

  // Insight 3: Synergy & Beverage Portfolio
  if (todayTeaCount > 0 && todayCoffeeCount > 0) {
    insights.push({
      category: 'Neurotransmitter Synergy',
      title: 'Coffee + Tea Combination',
      description: `Blended intake (${todayCoffeeCount} coffee, ${todayTeaCount} tea) leverages coffee's rapid dopamine boost paired with green tea's L-theanine alpha-wave stabilization.`,
      iconType: 'balance'
    });
  } else if (todayCoffeeCount > 0) {
    insights.push({
      category: 'Stimulant Source',
      title: 'High-Impact Espresso / Drip',
      description: `${todayCoffeeCount} coffee serving(s) provided ${todayCoffeeCaffeine}mg of fast-acting methylxanthines. Ensure you match with 1.5x volume in pure water.`,
      iconType: 'balance'
    });
  } else if (todayTeaCount > 0) {
    insights.push({
      category: 'Sustained Calm Focus',
      title: 'Gentle Tea Infusion',
      description: `${todayTeaCount} tea serving(s) supplied ${todayTeaCaffeine}mg of smooth, jitter-free caffeine with high antioxidant epigallocatechin gallate (EGCG).`,
      iconType: 'balance'
    });
  } else {
    insights.push({
      category: 'Purity State',
      title: 'Clean Baseline',
      description: 'Pure hydration focus. Ready for your first intentional beverage when cognitive demand calls.',
      iconType: 'balance'
    });
  }

  // Recommendation Note
  let recommendationNote = 'Continue spacing water throughout the afternoon to maximize focus.';
  if (todayCaffeineMg >= maxCaffLimit) {
    recommendationNote = 'Prioritize cool mineral water and herbal infusions for the rest of today.';
  } else if (currentHour >= cutoffHour) {
    recommendationNote = 'Stick to warm chamomile, peppermint, or room-temperature water tonight.';
  } else if (waterRatio < 0.5) {
    recommendationNote = 'Have a large 350ml glass of water before ordering your next espresso or tea.';
  }

  return {
    headline,
    vitalityScore,
    vitalityTier,
    tierColor,
    tierBg,
    insights,
    recommendationNote,
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
};
