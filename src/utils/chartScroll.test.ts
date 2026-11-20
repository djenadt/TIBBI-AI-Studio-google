import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MAX_VISIBLE_CHART_POINTS,
  shouldEnableChartScroll,
  getChartScrollContainerWidth,
  getChartStepScrollDelta,
  shouldBlockChartClickAfterDrag,
} from './chartScroll';

test('shouldEnableChartScroll only activates above 5 points', () => {
  assert.equal(MAX_VISIBLE_CHART_POINTS, 5);
  assert.equal(shouldEnableChartScroll(0), false);
  assert.equal(shouldEnableChartScroll(5), false);
  assert.equal(shouldEnableChartScroll(6), true);
  assert.equal(shouldEnableChartScroll(7), true);
});

test('getChartScrollContainerWidth returns 100% up to 5 points and expanded width for >5 points', () => {
  assert.equal(getChartScrollContainerWidth(3), '100%');
  assert.equal(getChartScrollContainerWidth(5), '100%');
  assert.equal(getChartScrollContainerWidth(7), 'max(140%, 512px)');
  assert.equal(getChartScrollContainerWidth(10), 'max(200%, 704px)');
});

test('getChartStepScrollDelta computes directional scroll steps', () => {
  assert.equal(getChartStepScrollDelta(500, 'next'), 300);
  assert.equal(getChartStepScrollDelta(500, 'prev'), -300);
  assert.equal(getChartStepScrollDelta(200, 'next'), 160);
});

test('shouldBlockChartClickAfterDrag distinguishes clicks from drags', () => {
  assert.equal(shouldBlockChartClickAfterDrag(0), false);
  assert.equal(shouldBlockChartClickAfterDrag(4), false);
  assert.equal(shouldBlockChartClickAfterDrag(-6), false);
  assert.equal(shouldBlockChartClickAfterDrag(7), true);
  assert.equal(shouldBlockChartClickAfterDrag(-15), true);
});
