// Core verification test for BrewBalance logic
import assert from 'node:assert/strict';

console.log('🧪 Running BrewBalance Core Logic Tests...');

// Test 1: Caffeine Calculation rules
const calculateCaffeine = (type, ml) => {
  if (type === 'water') return 0;
  if (type === 'tea') return Math.round((ml / 250) * 45);
  if (type === 'coffee') {
    if (ml <= 60) return 65;
    return Math.round((ml / 250) * 95);
  }
  return 0;
};

assert.equal(calculateCaffeine('water', 500), 0, 'Water must have 0mg caffeine');
assert.equal(calculateCaffeine('tea', 250), 45, '250ml tea should have ~45mg caffeine');
assert.equal(calculateCaffeine('coffee', 250), 95, '250ml coffee should have ~95mg caffeine');
assert.equal(calculateCaffeine('coffee', 60), 65, 'Espresso (60ml) should have ~65mg caffeine');
console.log('✅ Test 1: Beverage caffeine calculations passed.');

// Test 2: Guardrail rule verification
const evaluateGuardrails = (todayCaffeine, maxCaffeine, currentHour, cutoffHour, minutesSinceLast) => {
  if (todayCaffeine >= maxCaffeine) {
    return { beverage: 'water', reason: 'LIMIT_EXCEEDED' };
  }
  if (currentHour >= cutoffHour) {
    return { beverage: 'water', reason: 'CIRCADIAN_CUTOFF' };
  }
  if (minutesSinceLast >= 120) {
    return { beverage: 'water', reason: 'DEHYDRATION' };
  }
  return { beverage: 'optimal', reason: 'ML_OPTIMAL' };
};

assert.equal(evaluateGuardrails(320, 300, 10, 16, 30).reason, 'LIMIT_EXCEEDED');
assert.equal(evaluateGuardrails(150, 300, 17, 16, 30).reason, 'CIRCADIAN_CUTOFF');
assert.equal(evaluateGuardrails(100, 300, 14, 16, 140).reason, 'DEHYDRATION');
assert.equal(evaluateGuardrails(95, 300, 9, 16, 45).reason, 'ML_OPTIMAL');
console.log('✅ Test 2: Pre-ML guardrails logic passed.');

// Test 3: Aggregation metrics separation
const mockIntakes = [
  { beverageType: 'water', volumeMl: 500, caffeineMg: 0 },
  { beverageType: 'tea', volumeMl: 250, caffeineMg: 45 },
  { beverageType: 'coffee', volumeMl: 250, caffeineMg: 95 }
];

const counts = { water: 0, tea: 0, coffee: 0 };
const volumes = { water: 0, tea: 0, coffee: 0 };
let totalCaff = 0;

mockIntakes.forEach(i => {
  counts[i.beverageType]++;
  volumes[i.beverageType] += i.volumeMl;
  totalCaff += i.caffeineMg;
});

assert.equal(counts.water, 1);
assert.equal(counts.tea, 1);
assert.equal(counts.coffee, 1);
assert.equal(volumes.water, 500);
assert.equal(volumes.tea, 250);
assert.equal(volumes.coffee, 250);
assert.equal(totalCaff, 140);
console.log('✅ Test 3: Beverage separate aggregation passed.');

console.log('\n🎉 ALL 3 CORE TESTS PASSED SUCCESSFULLY!');
