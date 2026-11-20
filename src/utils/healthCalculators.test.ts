import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateBMI,
  getBMICategory,
  calculatePregnancyWeek,
  calculateDueDate,
  calculateFertileWindow,
  getDayCyclePhase,
  buildCycleCalendarMonth,
  evaluateLabValue,
  getVaccineDueSummary,
  ALGERIAN_PEV_SCHEDULE,
  formatChartNumericLabel,
  resolveChartClickVitalId,
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

test('Cycle calendar phase classification colors period (red), fertile/ovulation (green), and normal days accurately', () => {
  const anchor = '2026-11-01';
  // Day 1 & Day 5 -> period
  assert.equal(getDayCyclePhase('2026-11-01', anchor, 28, 5).phase, 'period');
  assert.equal(getDayCyclePhase('2026-11-05', anchor, 28, 5).phase, 'period');
  // Day 7 -> normal follicular
  assert.equal(getDayCyclePhase('2026-11-07', anchor, 28, 5).phase, 'normal');
  // Day 11..16 -> fertile (green), Day 15 (2026-11-15) -> peak ovulation
  assert.equal(getDayCyclePhase('2026-11-11', anchor, 28, 5).phase, 'fertile');
  const peak = getDayCyclePhase('2026-11-15', anchor, 28, 5);
  assert.equal(peak.phase, 'fertile');
  assert.equal(peak.isOvulationDay, true);
  // Day 20 -> normal luteal
  assert.equal(getDayCyclePhase('2026-11-20', anchor, 28, 5).phase, 'normal');
  // Next cycle projection in December (2026-11-29 is next period day 1)
  assert.equal(getDayCyclePhase('2026-12-01', anchor, 28, 5).phase, 'period');

  // Calendar grid for November 2026 (monthIndex = 10)
  const cells = buildCycleCalendarMonth(2026, 10, anchor, 28, 5);
  const novCells = cells.filter((c) => c.inCurrentMonth);
  assert.equal(novCells.length, 30);
  const periodCount = novCells.filter((c) => c.phase === 'period').length;
  const fertileCount = novCells.filter((c) => c.phase === 'fertile').length;
  const normalCount = novCells.filter((c) => c.phase === 'normal').length;
  assert.equal(periodCount, 7); // Nov 1-5 + Nov 29-30
  assert.equal(fertileCount, 6); // Nov 11-16
  assert.equal(normalCount, 17); // 30 - 7 - 6
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

test('Chart numeric label formatter outputs only extracted numbers without units', () => {
  assert.equal(formatChartNumericLabel(124), '124');
  assert.equal(formatChartNumericLabel(0.96), '0.96');
  assert.equal(formatChartNumericLabel(78.5), '78.5');
  assert.equal(formatChartNumericLabel('124 mmHg'), '124');
  assert.equal(formatChartNumericLabel('0.98 g/L'), '0.98');
  assert.equal(formatChartNumericLabel(null), '');
  assert.equal(formatChartNumericLabel(undefined), '');
  assert.equal(formatChartNumericLabel(NaN), '');
});

test('Chart click vital resolver resolves clicked point ID from payload, index, or label', () => {
  const sample = [
    { id: 'vit_1', date: '06-12' },
    { id: 'vit_2', date: '07-15' },
    { id: 'vit_3', date: '11-04' },
  ];

  assert.equal(
    resolveChartClickVitalId(sample, { activePayload: [{ payload: { id: 'vit_2' } }] }),
    'vit_2'
  );
  assert.equal(
    resolveChartClickVitalId(sample, { activeTooltipIndex: 2 }),
    'vit_3'
  );
  assert.equal(
    resolveChartClickVitalId(sample, { activeTooltipIndex: '0' }),
    'vit_1'
  );
  assert.equal(
    resolveChartClickVitalId(sample, { activeLabel: '07-15' }),
    'vit_2'
  );
  assert.equal(resolveChartClickVitalId(sample, null), null);
});

