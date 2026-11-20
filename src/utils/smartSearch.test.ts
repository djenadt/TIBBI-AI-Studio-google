import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterSmartSearchResults,
  isDateInRange,
  isInvalidDateRange,
} from './smartSearch';
import {
  INITIAL_APPOINTMENTS,
  INITIAL_DOCUMENTS,
  INITIAL_LAB_TESTS,
  INITIAL_MEDICATIONS,
  INITIAL_TIMELINE_EVENTS,
  INITIAL_VITALS,
} from '../data/initialData';

test('isDateInRange supports open-ended and bounded YYYY-MM-DD filtering', () => {
  assert.equal(isDateInRange('2026-07-15', '2026-07-01', '2026-07-31'), true);
  assert.equal(isDateInRange('2026-07-01', '2026-07-01', '2026-07-31'), true);
  assert.equal(isDateInRange('2026-07-31', '2026-07-01', '2026-07-31'), true);
  assert.equal(isDateInRange('2026-06-30', '2026-07-01', '2026-07-31'), false);
  assert.equal(isDateInRange('2026-08-01', '2026-07-01', '2026-07-31'), false);
  assert.equal(isDateInRange('2026-07-15', '2026-07-01', ''), true);
  assert.equal(isDateInRange('2026-07-15', '', '2026-07-31'), true);
  assert.equal(isDateInRange(undefined, '2026-07-01', ''), false);
});

test('isInvalidDateRange detects reversed from/to dates', () => {
  assert.equal(isInvalidDateRange('2026-10-01', '2026-01-01'), true);
  assert.equal(isInvalidDateRange('2026-01-01', '2026-10-01'), false);
  assert.equal(isInvalidDateRange('2026-01-01', '2026-01-01'), false);
  assert.equal(isInvalidDateRange('2026-01-01', ''), false);
});

test('filterSmartSearchResults supports date-range-only filtering without keyword', () => {
  const res = filterSmartSearchResults({
    patientId: 'fam_amine',
    query: '',
    dateFrom: '2026-10-01',
    dateTo: '2026-11-30',
    medications: INITIAL_MEDICATIONS,
    labTests: INITIAL_LAB_TESTS,
    documents: INITIAL_DOCUMENTS,
    appointments: INITIAL_APPOINTMENTS,
    timelineEvents: INITIAL_TIMELINE_EVENTS,
    vitals: INITIAL_VITALS,
  });

  assert.equal(res.hasActiveCriteria, true);
  assert.equal(res.invalidDateRange, false);
  assert.ok(res.totalMatches > 0);
  for (const lab of res.matchedLabs) {
    assert.ok(lab.date >= '2026-10-01' && lab.date <= '2026-11-30');
  }
  for (const vital of res.matchedVitals) {
    assert.ok(vital.date >= '2026-10-01' && vital.date <= '2026-11-30');
  }
  for (const apt of res.matchedAppointments) {
    assert.ok(apt.date >= '2026-10-01' && apt.date <= '2026-11-30');
  }
});

test('filterSmartSearchResults combines keyword query and date range accurately', () => {
  const allAmineGlyc = filterSmartSearchResults({
    patientId: 'fam_amine',
    query: 'Glycémie',
    medications: INITIAL_MEDICATIONS,
    labTests: INITIAL_LAB_TESTS,
    documents: INITIAL_DOCUMENTS,
    appointments: INITIAL_APPOINTMENTS,
    timelineEvents: INITIAL_TIMELINE_EVENTS,
    vitals: INITIAL_VITALS,
  });

  const filtered2026H2 = filterSmartSearchResults({
    patientId: 'fam_amine',
    query: 'Glycémie',
    dateFrom: '2026-07-01',
    dateTo: '2026-10-31',
    medications: INITIAL_MEDICATIONS,
    labTests: INITIAL_LAB_TESTS,
    documents: INITIAL_DOCUMENTS,
    appointments: INITIAL_APPOINTMENTS,
    timelineEvents: INITIAL_TIMELINE_EVENTS,
    vitals: INITIAL_VITALS,
  });

  assert.ok(allAmineGlyc.matchedLabs.length > filtered2026H2.matchedLabs.length);
  assert.ok(filtered2026H2.matchedLabs.length >= 2);
  for (const lab of filtered2026H2.matchedLabs) {
    assert.ok(lab.date >= '2026-07-01' && lab.date <= '2026-10-31');
  }
});

test('filterSmartSearchResults returns empty matches when date range is reversed', () => {
  const res = filterSmartSearchResults({
    patientId: 'fam_amine',
    query: 'Coversyl',
    dateFrom: '2026-12-01',
    dateTo: '2026-01-01',
    medications: INITIAL_MEDICATIONS,
    labTests: INITIAL_LAB_TESTS,
    documents: INITIAL_DOCUMENTS,
    appointments: INITIAL_APPOINTMENTS,
    timelineEvents: INITIAL_TIMELINE_EVENTS,
    vitals: INITIAL_VITALS,
  });

  assert.equal(res.invalidDateRange, true);
  assert.equal(res.totalMatches, 0);
});
