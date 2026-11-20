import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, MoveHorizontal } from 'lucide-react';
import {
  MAX_VISIBLE_CHART_POINTS,
  shouldEnableChartScroll,
  getChartScrollContainerWidth,
  getChartStepScrollDelta,
  shouldBlockChartClickAfterDrag,
} from '../utils/chartScroll';

import { Language, tr } from '../types/tibbi';

export interface ScrollableChartFrameProps {
  pointCount: number;
  heightClass?: string;
  isAr?: boolean;
  language?: Language;
  testId?: string;
  children: React.ReactNode;
}

export const ScrollableChartFrame: React.FC<ScrollableChartFrameProps> = ({
  pointCount,
  heightClass = 'h-64',
  isAr,
  language,
  testId,
  children,
}) => {
  const effectiveLang: Language = language ?? (isAr ? 'ar' : 'fr');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const dragStateRef = useRef({
    isDown: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });
  const suppressNextClickRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  const scrollable = shouldEnableChartScroll(pointCount);
  const containerWidth = getChartScrollContainerWidth(pointCount);

  const handleStepScroll = (direction: 'prev' | 'next') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const delta = getChartStepScrollDelta(el.clientWidth, direction);
    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!scrollable || e.button !== 0) return;
    const el = scrollContainerRef.current;
    if (!el) return;
    dragStateRef.current = {
      isDown: true,
      startX: e.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const state = dragStateRef.current;
    if (!scrollable || !state.isDown) return;
    const el = scrollContainerRef.current;
    if (!el) return;

    const deltaX = e.clientX - state.startX;
    if (shouldBlockChartClickAfterDrag(deltaX)) {
      if (!state.moved) {
        state.moved = true;
        setIsDragging(true);
      }
      el.scrollLeft = state.startScrollLeft - deltaX;
    }
  };

  const finishDrag = () => {
    if (dragStateRef.current.moved) {
      suppressNextClickRef.current = true;
      window.setTimeout(() => {
        suppressNextClickRef.current = false;
      }, 60);
    }
    dragStateRef.current.isDown = false;
    dragStateRef.current.moved = false;
    setIsDragging(false);
  };

  const handleClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (suppressNextClickRef.current) {
      e.stopPropagation();
      e.preventDefault();
      suppressNextClickRef.current = false;
    }
  };

  if (!scrollable) {
    return (
      <div data-testid={testId} dir="ltr" className={`${heightClass} w-full min-w-0`}>
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-1.5 min-w-0">
      <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5 font-semibold">
          <MoveHorizontal className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>
            {tr(
              effectiveLang,
              `عرض ${MAX_VISIBLE_CHART_POINTS} نتائج متتالية من أصل ${pointCount} — اسحب الشاشة أفقياً لإظهار البقية`,
              `${MAX_VISIBLE_CHART_POINTS} mesures affichées sur ${pointCount} — glisser horizontalement pour voir le reste`,
              `Showing ${MAX_VISIBLE_CHART_POINTS} of ${pointCount} results — swipe horizontally to view more`
            )}
          </span>
        </span>
        <div dir="ltr" className="inline-flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => handleStepScroll('prev')}
            aria-label={tr(effectiveLang, 'النتائج السابقة', 'Mesures précédentes', 'Previous results')}
            title={tr(effectiveLang, 'النتائج السابقة', 'Mesures précédentes', 'Previous results')}
            className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleStepScroll('next')}
            aria-label={tr(effectiveLang, 'النتائج التالية', 'Mesures suivantes', 'Next results')}
            title={tr(effectiveLang, 'النتائج التالية', 'Mesures suivantes', 'Next results')}
            className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        data-testid={testId}
        data-scrollable="true"
        dir="ltr"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onPointerLeave={finishDrag}
        onClickCapture={handleClickCapture}
        className={`w-full min-w-0 overflow-x-auto pb-1 select-none touch-pan-x ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        <div
          className={heightClass}
          style={{
            width: containerWidth,
            minWidth: containerWidth,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default ScrollableChartFrame;
