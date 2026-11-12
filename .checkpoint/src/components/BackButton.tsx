import React, { useEffect } from 'react';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useTibbi } from '../context/TibbiContext';

export interface BackButtonProps {
  className?: string;
  variant?: 'header' | 'bar' | 'compact';
  showLabel?: boolean;
}

/**
 * BackButton Component (زر / سهم العودة إلى الصفحة السابقة)
 * Allows users to navigate back to the previous screen or tab.
 * Respects RTL (Arabic ArrowRight) vs LTR (French ArrowLeft) layout.
 */
export const BackButton: React.FC<BackButtonProps> = ({
  className = '',
  variant = 'header',
  showLabel = true,
}) => {
  const { goBack, canGoBack, language, activeTab } = useTibbi();
  const isAr = language === 'ar';
  const BackArrow = isAr ? ArrowRight : ArrowLeft;

  // Keyboard shortcut: Press Escape to go back if not in dashboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canGoBack) {
        // Don't trigger if user is typing in an input or textarea or modal is open
        const target = e.target as HTMLElement | null;
        const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
        if (!isInput) {
          e.preventDefault();
          goBack();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [canGoBack, goBack]);

  if (!canGoBack) {
    return null;
  }

  const labelText = isAr ? 'رجوع' : 'Retour';
  const tooltipText = isAr ? 'العودة إلى الصفحة السابقة (Esc)' : 'Retour à la page précédente (Esc)';

  // 1. Header variant (fits neatly in Top Header)
  if (variant === 'header') {
    return (
      <button
        type="button"
        onClick={goBack}
        title={tooltipText}
        aria-label={tooltipText}
        className={`group inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl bg-teal-50 dark:bg-slate-800 hover:bg-teal-100 dark:hover:bg-slate-700/80 text-teal-800 dark:text-teal-300 border border-teal-200/90 dark:border-slate-700 shadow-2xs transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-teal-500/50 shrink-0 ${className}`}
      >
        <BackArrow className="w-4 h-4 text-teal-700 dark:text-teal-400 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5 transition-transform" />
        {showLabel && (
          <span className="text-xs font-bold hidden sm:inline select-none">
            {labelText}
          </span>
        )}
      </button>
    );
  }

  // 2. Bar variant (top of view breadcrumb)
  if (variant === 'bar') {
    return (
      <div className={`flex items-center justify-between mb-4 ${className}`}>
        <button
          type="button"
          onClick={goBack}
          title={tooltipText}
          aria-label={tooltipText}
          className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-teal-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-teal-800 dark:hover:text-teal-300 border border-slate-200 dark:border-slate-800 shadow-2xs transition-all cursor-pointer text-xs font-bold"
        >
          <BackArrow className="w-4 h-4 text-teal-600 dark:text-teal-400 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
          <span>{isAr ? 'العودة إلى الصفحة السابقة' : 'Retour à la page précédente'}</span>
        </button>
      </div>
    );
  }

  // 3. Compact icon-only variant
  return (
    <button
      type="button"
      onClick={goBack}
      title={tooltipText}
      aria-label={tooltipText}
      className={`group p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-300 border border-slate-200 dark:border-slate-700 shadow-2xs transition-all cursor-pointer ${className}`}
    >
      <BackArrow className="w-4 h-4 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5 transition-transform" />
      <span className="sr-only">{labelText}</span>
    </button>
  );
};

export default BackButton;
