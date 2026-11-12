import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBMI,
  getBMICategory,
  calculatePregnancyWeek,
  calculateDueDate,
  calculateFertileWindow,
  evaluateLabValue,
  getVaccineDueSummary,
  ALGERIAN_PEV_SCHEDULE,
} from './healthCalculators';

test('BMI calculation and category mapping', () => {
  // 75kg, 175cm -> 75 / (1.75 * 1.75) = 24.49 -> 24.5
  const bmiNormal = calculateBMI(75, 175);
  assert.equal(bmiNormal, 24.5);
  const catNormal = getBMICategory(bmiNormal);
  assert.equal(catNormal.category, 'normal');

  // Overweight test
  const bmiOver = calculateBMI(85, 175); // 27.8
  assert.equal(bmiOver, 27.8);
  const catOver = getBMICategory(bmiOver);
  assert.equal(catOver.category, 'overweight');
});

test('Pregnancy calculations calculate correct gestational age and trimester', () => {
  // 140 days ago = 20 weeks
  const lmpDate = new Date();
  lmpDate.setDate(lmpDate.getDate() - 140);
  const lmpStr = lmpDate.toISOString().split('T')[0];

  const result = calculatePregnancyWeek(lmpStr);
  assert.equal(result.weeks, 20);
  assert.equal(result.trimester, 2);
  assert.ok(result.progressPercent > 40 && result.progressPercent < 60);

  const dueDate = calculateDueDate('2026-01-01');
  // 2026-01-01 + 280 days is in October 2026
  assert.ok(dueDate.startsWith('2026-10'));
});

test('Fertile window and ovulation estimation', () => {
  const window = calculateFertileWindow('2026-05-01', 28);
  assert.equal(window.nextPeriodDate, '2026-05-29');
  assert.equal(window.ovulationDate, '2026-05-15');
});

test('Lab test range evaluation', () => {
  // Normal value: 0.95 g/L with range 0.70 - 1.10
  const normal = evaluateLabValue(0.95, 0.70, 1.10);
  assert.equal(normal.status, 'normal');

  // High value: 1.25 g/L with max 1.10 (not yet critical > 1.43)
  const high = evaluateLabValue(1.25, 0.70, 1.10);
  assert.equal(high.status, 'high');

  // Critical high value: 1.80 g/L
  const critical = evaluateLabValue(1.80, 0.70, 1.10);
  assert.equal(critical.status, 'critical');

  // Low value: 0.60 g/L with min 0.70 (0.60 > 0.70 * 0.7 = 0.49)
  const low = evaluateLabValue(0.60, 0.70, 1.10);
  assert.equal(low.status, 'low');
});

test('Algerian PEV vaccination summary', () => {
  assert.ok(ALGERIAN_PEV_SCHEDULE.length >= 6);
  // Child aged 5 months with bcg and penta1 done
  const summary = getVaccineDueSummary(5, ['bcg_hb0', 'penta1_polio1']);
  assert.equal(summary.completedCount, 2);
  // At 5 months, 3 are due (at birth, 2m, 4m)
  assert.equal(summary.totalDue, 3);
  assert.ok(summary.upcomingOrOverdue.length > 0);
});
