export type BeverageType = 'water' | 'tea' | 'coffee';

export type IntakeSource = 'manual' | 'nfc' | 'qr';

export interface Intake {
  id: string;
  userId: string;
  beverageType: BeverageType;
  volumeMl: number;
  caffeineMg: number;
  loggedAt: string; // ISO string
  source: IntakeSource;
  label?: string;
}

export interface UserLimit {
  id: string;
  userId: string;
  metric: 'max_caffeine_daily' | 'min_water_daily' | 'caffeine_cutoff_hour';
  thresholdValue: number;
  unit: 'mg' | 'ml' | 'hour';
  isActive: boolean;
}

export type ReasonCode = 'LIMIT_EXCEEDED' | 'CIRCADIAN_CUTOFF' | 'DEHYDRATION' | 'ML_OPTIMAL';

export interface Recommendation {
  suggestedBeverage: BeverageType;
  confidenceScore: number;
  reasonCode: ReasonCode;
  message: string;
  portionMl: number;
  currentStats: {
    todayCaffeineMg: number;
    todayWaterMl: number;
    caffeineLimitMg: number;
    waterTargetMl: number;
    minutesSinceLastIntake: number;
  };
}

export interface RecommendationLog {
  id: string;
  userId: string;
  suggestedBeverage: BeverageType;
  confidenceScore: number;
  reasonCode: ReasonCode;
  createdAt: string;
}

export type DashboardRange = 'day' | 'week' | 'month' | 'year' | 'lifetime';

export interface TimeSeriesPoint {
  label: string;
  waterMl: number;
  caffeineMg: number;
  teaCount: number;
  coffeeCount: number;
  waterCount: number;
}

export interface BeverageMetric {
  count: number;
  volumeMl: number;
  caffeineMg: number;
}

export interface DashboardStats {
  range: DashboardRange;
  totalWaterMl: number;
  totalCaffeineMg: number;
  totalVolumeMl: number;
  beverageBreakdown: {
    waterPercentage: number;
    teaPercentage: number;
    coffeePercentage: number;
  };
  counts: {
    water: number;
    tea: number;
    coffee: number;
  };
  beverages: {
    water: BeverageMetric;
    tea: BeverageMetric;
    coffee: BeverageMetric;
  };
  complianceScore: number;
  peakConsumptionHour: number | null;
  series: TimeSeriesPoint[];
}
