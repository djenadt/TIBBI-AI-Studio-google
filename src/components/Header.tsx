import { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ShieldAlert,
  Globe,
  Search,
  Bell,
  ChevronDown,
  Info,
  X,
  FileCheck2,
  Check,
} from 'lucide-react';
import { useTibbi } from '../context/TibbiContext';
import { ThemeToggle } from './ThemeToggle';
import { BackButton } from './BackButton';
import { Language, tr } from '../types/tibbi';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    familyMembers,
    activeMemberId,
    activeMember,
    setActiveMemberId,
    setActiveTab,
    setIsEmergencyModalOpen,
    setIsNotificationsModalOpen,
    setIsAuditLogsModalOpen,
    unreadNotificationCount,
  } = useTibbi();

  const isAr = language === 'ar';
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLangMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLangMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isLangMenuOpen]);

  return (
    <header className="relative z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-teal-100 dark:border-slate-800 shadow-xs w-full max-w-full transition-colors">
      {/* Prototype & Data Safety Banner */}
      {showDisclaimer && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-teal-700 text-white px-3 py-1.5 text-[11px] font-medium flex items-center justify-between gap-2 shadow-inner">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-x-2 gap-y-1 flex-1 justify-center text-center">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>
              {tr(
                language,
                '⚠️ نسخة تجريبية تعليمية ببيانات محاكاة وهمية — ليست للاستخدام السريري الفعلي في غياب مصادقة سحابية وتشفير كامل.',
                '⚠️ Prototype de démonstration avec données simulées — Non destiné à un usage clinique réel sans chiffrement complet.',
                '⚠️ Educational demo prototype with simulated data — Not intended for real clinical use without full cloud encryption.'
              )}
            </span>
            <button
              onClick={() => setIsAuditLogsModalOpen(true)}
              className="underline text-[10px] font-bold hover:text-amber-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <FileCheck2 className="w-3 h-3" />
              <span>{tr(language, 'سجل العمليات والخصوصية', "Registre d'audit", 'Audit Log')}</span>
            </button>
          </div>
          <button
            onClick={() => setShowDisclaimer(false)}
            className="text-white/80 hover:text-white p-0.5 rounded cursor-pointer shrink-0"
            aria-label={tr(language, 'إخفاء الإشعار', 'Masquer', 'Dismiss')}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between py-2 sm:py-0 sm:h-16 md:h-20 gap-2">
          
          {/* Back Button, Logo & Slogan */}
          <div className="flex items-center justify-between w-full sm:w-auto gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3">
              <BackButton variant="header" />
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 ${isAr ? 'text-right' : 'text-left'} focus:outline-hidden group cursor-pointer`}
                aria-label="TIBBI Home"
              >
                <div className="w-9 h-9 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-800 dark:from-teal-500 dark:via-teal-600 dark:to-emerald-700 flex items-center justify-center text-white shadow-md shadow-teal-700/20 group-hover:scale-105 transition-transform shrink-0">
                  <Activity className="w-5 h-5 md:w-7 md:h-7 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-xl md:text-3xl font-black tracking-tight text-teal-800 dark:text-teal-300">
                      TIBBI
                    </span>
                  </div>
                  <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline-block">
                    {tr(
                      language,
                      'صحتك وصحة عائلتك… في مكان واحد',
                      'Votre santé et celle de votre famille… au même endroit',
                      'Your health & your family’s… in one place'
                    )}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Center/Right Actions: Family Selector, Theme Toggle, Emergency Card, Language, Search */}
          <div className="flex items-center justify-between sm:justify-end gap-1 sm:gap-2.5 w-full sm:w-auto shrink-0">
            
            {/* Quick Family Member Switcher */}
            <div className="relative min-w-0">
              <label htmlFor="family-member-select" className="sr-only">
                {tr(language, 'اختيار فرد العائلة', 'Sélectionner le membre de famille', 'Select family member')}
              </label>
              <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-teal-50/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-500/50 rounded-xl px-1.5 sm:px-2 py-1 sm:py-1.5 transition-colors">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs shrink-0">
                  {isAr ? activeMember.fullNameAr.charAt(0) : activeMember.fullNameFr.charAt(0)}
                </div>
                <select
                  id="family-member-select"
                  value={activeMemberId}
                  onChange={(e) => setActiveMemberId(e.target.value)}
                  className="bg-transparent text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer max-w-[92px] sm:max-w-[140px] md:max-w-none truncate"
                  aria-label={tr(language, 'تغيير الملف الصحي', 'Changer de dossier', 'Switch health record')}
                >
                  {familyMembers.map((member) => (
                    <option key={member.id} value={member.id} className="dark:bg-slate-900 dark:text-slate-100">
                      {isAr ? member.fullNameAr : member.fullNameFr}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500 pointer-events-none shrink-0" />
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              {/* Quick Search Shortcut */}
              <button
                onClick={() => setActiveTab('search')}
                className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title={tr(language, 'البحث الذكي في التاريخ الصحي', 'Recherche intelligente', 'Smart Health Search')}
                aria-label={tr(language, 'البحث الذكي', 'Recherche', 'Search')}
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Dedicated ThemeToggle Component (Single compact icon button for Dark/Light mode) */}
              <ThemeToggle variant="icon" showLabel={false} />

              {/* Emergency Medical Card Button (Chifa / Blood / Allergies) */}
              <button
                onClick={() => setIsEmergencyModalOpen(true)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/80 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title={tr(language, 'بطاقة الطوارئ الطبية والشفاء', "Fiche d'urgence médicale", 'Emergency Medical Card')}
                aria-label={tr(language, 'بطاقة الطوارئ الطبية', "Fiche d'urgence", 'Emergency Medical Card')}
              >
                <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 animate-pulse shrink-0" />
                <span dir="ltr" className="font-mono text-[11px] sm:text-xs">
                  {activeMember.bloodGroup}
                </span>
                <span className="hidden lg:inline">
                  {tr(language, 'طوارئ', 'Urgence', 'Emergency')}
                </span>
              </button>

              {/* Notifications Indicator - Opens Dedicated Notification Center */}
              <button
                onClick={() => setIsNotificationsModalOpen(true)}
                className="relative p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title={tr(
                  language,
                  `مركز التنبيهات الصحية (${unreadNotificationCount} غير مقروء)`,
                  `Centre de notifications (${unreadNotificationCount} non lues)`,
                  `Health Notifications (${unreadNotificationCount} unread)`
                )}
                aria-label={tr(language, 'مركز التنبيهات الصحية', 'Centre de notifications', 'Notifications')}
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Single Compact Language Icon Button + 3-Language Dropdown List */}
              <div ref={langMenuRef} className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsLangMenuOpen((prev) => !prev)}
                  data-testid="language-menu-button"
                  aria-haspopup="menu"
                  aria-expanded={isLangMenuOpen}
                  title={tr(
                    language,
                    'اختيار لغة التطبيق (العربية / الفرنسية / الإنجليزية)',
                    'Choisir la langue (AR / FR / EN)',
                    'Choose language (AR / FR / EN)'
                  )}
                  aria-label={tr(
                    language,
                    'اختيار لغة التطبيق',
                    'Choisir la langue',
                    'Choose language'
                  )}
                  className={`relative inline-flex items-center justify-center p-1.5 sm:p-2 rounded-xl border shadow-2xs transition-colors cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-teal-500/50 shrink-0 ${
                    isLangMenuOpen
                      ? 'border-teal-400 dark:border-teal-500 bg-teal-50 dark:bg-slate-700 text-teal-700 dark:text-teal-300'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 hover:border-teal-300 dark:hover:border-slate-600 hover:bg-teal-50/70 dark:hover:bg-slate-700/80'
                  }`}
                >
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600 dark:text-teal-400" />
                  <span
                    aria-hidden="true"
                    dir="ltr"
                    className="absolute -bottom-1 -right-1 px-1 min-w-[18px] h-4 rounded-full bg-teal-600 dark:bg-teal-500 text-white text-[9px] font-black leading-none tracking-tight flex items-center justify-center shadow-2xs ring-2 ring-white dark:ring-slate-900"
                  >
                    {language === 'ar' ? 'AR' : language === 'fr' ? 'FR' : 'EN'}
                  </span>
                </button>

                {isLangMenuOpen && (
                  <div
                    role="menu"
                    data-testid="language-menu-list"
                    aria-label={tr(language, 'قائمة اللغات', 'Liste des langues', 'Language list')}
                    className={`absolute top-full mt-2 w-44 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/10 dark:shadow-black/40 p-1.5 z-50 ${
                      isAr ? 'left-0' : 'right-0'
                    }`}
                  >
                    {(
                      [
                        { code: 'ar' as Language, badge: 'AR', label: 'العربية' },
                        { code: 'fr' as Language, badge: 'FR', label: 'Français' },
                        { code: 'en' as Language, badge: 'EN', label: 'English' },
                      ]
                    ).map((opt) => {
                      const active = language === opt.code;
                      return (
                        <button
                          key={opt.code}
                          type="button"
                          role="menuitemradio"
                          aria-checked={active}
                          onClick={() => {
                            setLanguage(opt.code);
                            setIsLangMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            active
                              ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span className="flex items-center gap-2 min-w-0">
                            <span
                              dir="ltr"
                              className={`inline-flex items-center justify-center w-6 h-5 rounded-md text-[10px] font-black shrink-0 ${
                                active
                                  ? 'bg-teal-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              {opt.badge}
                            </span>
                            <span className="truncate">{opt.label}</span>
                          </span>
                          {active && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
