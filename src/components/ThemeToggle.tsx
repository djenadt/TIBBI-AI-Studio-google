import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTibbi } from '../context/TibbiContext';

export interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'switch' | 'icon' | 'pill' | 'button';
}

/**
 * ThemeToggle Component
 * A true accessible Toggle Switch for the Header and app navigation.
 * Toggles the 'dark' class on the document.documentElement (html element),
 * updates the application context, and persists the user preference in localStorage.
 */
export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
  variant = 'switch',
}) => {
  const { theme, setTheme, language } = useTibbi();
  const isAr = language === 'ar';
  const isDark = theme === 'dark';

  const handleToggle = () => {
    const nextTheme: 'light' | 'dark' = isDark ? 'light' : 'dark';

    // 1. Direct toggle of 'dark' class on <html> element
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 2. Persist in localStorage across standard keys
    try {
      localStorage.setItem('theme', nextTheme);
      localStorage.setItem('tibbi_theme', nextTheme);
      localStorage.setItem('tibbi_health_data_v1_theme', JSON.stringify(nextTheme));
    } catch (e) {
      console.warn('Failed to save theme in localStorage:', e);
    }

    // 3. Update React context state
    setTheme(nextTheme);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleToggle();
    }
  };

  const currentModeLabel = isAr
    ? isDark
      ? 'الوضع الداكن'
      : 'الوضع الفاتح'
    : isDark
    ? 'Mode Sombre'
    : 'Mode Clair';

  const toggleActionLabel = isAr
    ? isDark
      ? 'التبديل إلى الوضع الفاتح (Light Mode)'
      : 'التبديل إلى الوضع الداكن (Dark Mode)'
    : isDark
    ? 'Passer au mode clair'
    : 'Passer au mode sombre (Dark Mode)';

  // 1. True Interactive Toggle Switch Variant (Default)
  if (variant === 'switch') {
    return (
      <div className={`inline-flex items-center gap-1.5 sm:gap-2 ${className}`}>
        {showLabel && (
          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 select-none hidden md:inline">
            {currentModeLabel}
          </span>
        )}
        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          aria-label={toggleActionLabel}
          title={toggleActionLabel}
          onClick={handleToggle}
          onKeyDown={handleKeyDown}
          className={`relative inline-flex items-center h-7 w-12 sm:w-13.5 rounded-full p-0.5 cursor-pointer transition-colors duration-300 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-teal-500/60 focus:ring-offset-1 dark:focus:ring-offset-slate-900 shrink-0 ${
            isDark
              ? 'bg-slate-800 border border-teal-500/50 shadow-inner shadow-teal-950/40'
              : 'bg-slate-200 hover:bg-slate-300/90 border border-slate-300 shadow-inner'
          }`}
        >
          {/* Track Background Static Icons */}
          <div className="absolute inset-0 px-1.5 flex items-center justify-between pointer-events-none select-none">
            {/* Sun indicator on the start side */}
            <Sun
              className={`w-3.5 h-3.5 transition-opacity duration-200 ${
                isDark ? 'opacity-30 text-slate-500' : 'opacity-100 text-amber-500'
              }`}
            />
            {/* Moon indicator on the end side */}
            <Moon
              className={`w-3.5 h-3.5 transition-opacity duration-200 ${
                isDark ? 'opacity-100 text-teal-300' : 'opacity-30 text-slate-400'
              }`}
            />
          </div>

          {/* Sliding Knob (Thumb) with smooth translation */}
          <span
            style={{
              transform: isDark
                ? isAr
                  ? 'translateX(-22px)'
                  : 'translateX(22px)'
                : 'translateX(0px)',
            }}
            className={`pointer-events-none relative z-10 inline-flex items-center justify-center w-5.5 h-5.5 rounded-full shadow-md transition-all duration-300 ease-in-out ${
              isDark
                ? 'bg-teal-500 text-slate-950 ring-2 ring-teal-400/40 shadow-teal-900/50'
                : 'bg-white text-amber-500 ring-1 ring-slate-200 shadow-slate-300'
            }`}
          >
            {isDark ? (
              <Moon className="w-3 h-3 text-slate-950 fill-current" />
            ) : (
              <Sun className="w-3 h-3 text-amber-500 fill-amber-400/30" />
            )}
          </span>

          <span className="sr-only">{toggleActionLabel}</span>
        </button>
      </div>
    );
  }

  // 2. Pill button variant
  if (variant === 'pill') {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        title={toggleActionLabel}
        aria-label={toggleActionLabel}
        className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 shadow-2xs transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-teal-500/50 ${className}`}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700" />
        )}
        <span>{currentModeLabel}</span>
      </button>
    );
  }

  // 3. Compact icon-only button variant
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={handleToggle}
      onKeyDown={handleKeyDown}
      title={toggleActionLabel}
      aria-label={toggleActionLabel}
      className={`p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-amber-300 hover:text-teal-700 dark:hover:text-amber-200 hover:border-teal-300 dark:hover:border-slate-600 shadow-2xs transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-teal-500/50 ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-700" />
      )}
      <span className="sr-only">{currentModeLabel}</span>
    </button>
  );
};

export default ThemeToggle;
