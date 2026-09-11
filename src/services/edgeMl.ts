import { BeverageType, Recommendation } from '../types';
import { getTodayStats } from './storage';

export const evaluateRecommendation = (): Recommendation => {
  const {
    todayIntakes,
    todayWaterMl,
    todayCaffeineMg,
    maxCaffLimit,
    minWaterLimit,
    cutoffHour,
    minutesSinceLastIntake
  } = getTodayStats();

  const now = new Date();
  const currentHour = now.getHours();

  // 1. HARD GUARDRAIL: Caffeine Limit Exceeded
  if (todayCaffeineMg >= maxCaffLimit) {
    return {
      suggestedBeverage: 'water',
      confidenceScore: 0.99,
      reasonCode: 'LIMIT_EXCEEDED',
      message: `Daily caffeine threshold reached (${todayCaffeineMg}mg / ${maxCaffLimit}mg limit). Drink pure water to rebalance your system.`,
      portionMl: 350,
      currentStats: {
        todayCaffeineMg,
        todayWaterMl,
        caffeineLimitMg: maxCaffLimit,
        waterTargetMl: minWaterLimit,
        minutesSinceLastIntake
      }
    };
  }

  // 2. HARD GUARDRAIL: Circadian Cut-off
  if (currentHour >= cutoffHour) {
    return {
      suggestedBeverage: 'water',
      confidenceScore: 0.96,
      reasonCode: 'CIRCADIAN_CUTOFF',
      message: `Past your ${cutoffHour}:00 caffeine cut-off. Avoid stimulants to protect your deep sleep and circadian rhythm.`,
      portionMl: 300,
      currentStats: {
        todayCaffeineMg,
        todayWaterMl,
        caffeineLimitMg: maxCaffLimit,
        waterTargetMl: minWaterLimit,
        minutesSinceLastIntake
      }
    };
  }

  // 3. ADAPTIVE GUARDRAIL: Dehydration Interval (> 2 hours without hydration after an intake)
  if (todayIntakes.length > 0 && minutesSinceLastIntake >= 120 && todayWaterMl < minWaterLimit * 0.7) {
    return {
      suggestedBeverage: 'water',
      confidenceScore: 0.94,
      reasonCode: 'DEHYDRATION',
      message: `It has been ${Math.floor(minutesSinceLastIntake / 60)}h ${minutesSinceLastIntake % 60}m since your last beverage. Rehydrate before having caffeine.`,
      portionMl: 400,
      currentStats: {
        todayCaffeineMg,
        todayWaterMl,
        caffeineLimitMg: maxCaffLimit,
        waterTargetMl: minWaterLimit,
        minutesSinceLastIntake
      }
    };
  }

  // 4. DAY START: Clean slate awaiting morning hydration
  if (todayIntakes.length === 0 && currentHour < 11) {
    return {
      suggestedBeverage: 'water',
      confidenceScore: 0.95,
      reasonCode: 'ML_OPTIMAL',
      message: 'Good morning! Kickstart your metabolism and wakefulness with 350ml of water before your first morning brew.',
      portionMl: 350,
      currentStats: {
        todayCaffeineMg: 0,
        todayWaterMl: 0,
        caffeineLimitMg: maxCaffLimit,
        waterTargetMl: minWaterLimit,
        minutesSinceLastIntake: 0
      }
    };
  }

  // 4. EDGE-ML INFERENCE SIMULATOR (Quantized MLP weights)
  // Extract features
  const caffRatio = todayCaffeineMg / Math.max(1, maxCaffLimit);
  const waterRatio = todayWaterMl / Math.max(1, minWaterLimit);
  const trailingDrinks = todayIntakes.length;
  const lastBeverage: BeverageType | null = todayIntakes.length > 0 ? todayIntakes[0].beverageType : null;

  // Neural Net Scoring Layers
  let waterScore = 0.35 + (1 - waterRatio) * 0.45;
  let teaScore = 0.25;
  let coffeeScore = 0.40;

  if (lastBeverage === 'coffee') {
    // Avoid back-to-back coffee
    coffeeScore -= 0.2;
    waterScore += 0.2;
  }

  // Morning bias (6am - 11am)
  if (currentHour >= 6 && currentHour < 11) {
    if (caffRatio < 0.6) {
      coffeeScore += 0.4;
    } else {
      waterScore += 0.3;
    }
  } 
  // Midday / Afternoon focus (11am - 15pm)
  else if (currentHour >= 11 && currentHour < 15) {
    teaScore += 0.45; // Tea provides L-theanine for sustained calm energy
    coffeeScore -= 0.15;
  } 
  // Late afternoon approaching cut-off
  else if (currentHour >= 15 && currentHour < cutoffHour) {
    waterScore += 0.4;
    teaScore += 0.3;
    coffeeScore -= 0.4;
  }

  // Hydration deficit penalty on stimulants
  if (waterRatio < 0.4 && trailingDrinks >= 2) {
    waterScore += 0.5;
    coffeeScore -= 0.3;
  }

  // Softmax normalization
  const expW = Math.exp(waterScore);
  const expT = Math.exp(teaScore);
  const expC = Math.exp(coffeeScore);
  const sumExp = expW + expT + expC;

  const probWater = expW / sumExp;
  const probTea = expT / sumExp;
  const probCoffee = expC / sumExp;

  let suggestedBeverage: BeverageType = 'water';
  let maxProb = probWater;

  if (probCoffee > maxProb && probCoffee > probTea) {
    suggestedBeverage = 'coffee';
    maxProb = probCoffee;
  } else if (probTea > maxProb) {
    suggestedBeverage = 'tea';
    maxProb = probTea;
  }

  const confidenceScore = Math.min(0.98, Math.max(0.72, parseFloat(maxProb.toFixed(2))));

  let message = '';
  let portionMl = 250;

  if (suggestedBeverage === 'water') {
    message = 'Optimal time for hydration. Boost mental clarity and circulation with fresh water.';
    portionMl = 350;
  } else if (suggestedBeverage === 'tea') {
    message = 'Perfect window for soothing green or herbal tea. Smooth alertness without coffee jitters.';
    portionMl = 300;
  } else {
    message = 'Prime circadian focus zone. Enjoy an artisanal espresso or pour-over.';
    portionMl = 200;
  }

  return {
    suggestedBeverage,
    confidenceScore,
    reasonCode: 'ML_OPTIMAL',
    message,
    portionMl,
    currentStats: {
      todayCaffeineMg,
      todayWaterMl,
      caffeineLimitMg: maxCaffLimit,
      waterTargetMl: minWaterLimit,
      minutesSinceLastIntake
    }
  };
};
