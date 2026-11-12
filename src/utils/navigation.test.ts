import test from 'node:test';
import assert from 'node:assert/strict';

// Pure logic for navigation history stack
export function pushNavigation(history: string[], current: string, next: string): string[] {
  if (current === next) return history;
  return [...history, current];
}

export function popNavigation(history: string[]): { nextTab: string; remainingHistory: string[] } {
  if (history.length === 0) {
    return { nextTab: 'dashboard', remainingHistory: [] };
  }
  const remainingHistory = [...history];
  const nextTab = remainingHistory.pop() || 'dashboard';
  return { nextTab, remainingHistory };
}

export function canNavigateBack(activeTab: string, history: string[]): boolean {
  return activeTab !== 'dashboard' || history.length > 0;
}

test('navigation history: pushing new tabs accumulates breadcrumb trail', () => {
  let history: string[] = [];
  history = pushNavigation(history, 'dashboard', 'archive');
  assert.deepEqual(history, ['dashboard']);

  history = pushNavigation(history, 'archive', 'labs');
  assert.deepEqual(history, ['dashboard', 'archive']);

  // Pushing same tab should be idempotent
  history = pushNavigation(history, 'labs', 'labs');
  assert.deepEqual(history, ['dashboard', 'archive']);
});

test('navigation history: popping returns to previous tab step by step', () => {
  const history = ['dashboard', 'archive', 'medications'];
  
  const step1 = popNavigation(history);
  assert.equal(step1.nextTab, 'medications');
  assert.deepEqual(step1.remainingHistory, ['dashboard', 'archive']);

  const step2 = popNavigation(step1.remainingHistory);
  assert.equal(step2.nextTab, 'archive');
  assert.deepEqual(step2.remainingHistory, ['dashboard']);

  const step3 = popNavigation(step2.remainingHistory);
  assert.equal(step3.nextTab, 'dashboard');
  assert.deepEqual(step3.remainingHistory, []);

  // Popping empty history defaults safely to dashboard
  const step4 = popNavigation(step3.remainingHistory);
  assert.equal(step4.nextTab, 'dashboard');
  assert.deepEqual(step4.remainingHistory, []);
});

test('navigation history: canNavigateBack is false on clean dashboard, true otherwise', () => {
  assert.equal(canNavigateBack('dashboard', []), false);
  assert.equal(canNavigateBack('labs', []), true);
  assert.equal(canNavigateBack('dashboard', ['archive']), true);
  assert.equal(canNavigateBack('medications', ['dashboard']), true);
});
