export const MAX_VISIBLE_CHART_POINTS = 5;
export const CHART_DRAG_CLICK_THRESHOLD_PX = 6;

export function shouldEnableChartScroll(
  pointCount: number,
  maxVisible: number = MAX_VISIBLE_CHART_POINTS
): boolean {
  return Number.isFinite(pointCount) && pointCount > maxVisible;
}

export function getChartScrollContainerWidth(
  pointCount: number,
  maxVisible: number = MAX_VISIBLE_CHART_POINTS
): string {
  if (!shouldEnableChartScroll(pointCount, maxVisible)) {
    return '100%';
  }

  const pct = Number(((pointCount / maxVisible) * 100).toFixed(2));
  const minPx = Math.round(pointCount * 64 + 64);
  return `max(${pct}%, ${minPx}px)`;
}

export function getChartStepScrollDelta(
  viewportWidth: number,
  direction: 'prev' | 'next'
): number {
  const safeWidth = Number.isFinite(viewportWidth) && viewportWidth > 0 ? viewportWidth : 320;
  const magnitude = Math.max(160, Math.round(safeWidth * 0.6));
  return direction === 'next' ? magnitude : -magnitude;
}

export function shouldBlockChartClickAfterDrag(
  dragDistancePx: number,
  thresholdPx: number = CHART_DRAG_CLICK_THRESHOLD_PX
): boolean {
  return Math.abs(dragDistancePx) > thresholdPx;
}
