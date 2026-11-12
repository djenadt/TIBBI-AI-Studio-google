import { useState } from 'react';
import {
  Activity,
  Users,
  ShieldAlert,
  Globe,
  Search,
  Bell,
  ChevronDown,
  Info,
  X,
  FileCheck2,
} from 'lucide-react';
import { useTibbi } from '../context/TibbiContext';
import { ThemeToggle } from './ThemeToggle';
import { BackButton } from './BackButton';

export const Header: React.FC = () => {
  const {
    language,
    setLanguage,
    theme,
    toggleTheme,
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
  const isDark = theme === 'dark';
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-teal-100 dark:border-slate-800 shadow-xs w-full max-w-full overflow-hidden transition-colors">
      {/* Prototype & Data Safety Banner */}
      {showDisclaimer && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-teal-700 text-white px-3 py-1.5 text-[11px] font-medium flex items-center justify-between gap-2 shadow-inner">
          <div className="max-w-7xl mx-auto flex items-center gap-2 flex-1 justify-center text-center">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>
              {isAr
                ? '⚠️ نسخة تجريبية تعليمية ببيانات محاكاة وهمية — ليست للاستخدام السريري الفعلي في غياب مصادقة سحابية وتشفير كامل.'
                : '⚠️ Prototype de démonstration avec données simulées — Non destiné à un usage clinique réel sans chiffrement complet.'}
            </span>
            <button
              onClick={() => setIsAuditLogsModalOpen(true)}
              className="underline text-[10px] font-bold hover:text-amber-200 transition-colors ml-2 cursor-pointer flex items-center gap-1"
            >
              <FileCheck2 className="w-3 h-3" />
              <span>{isAr ? 'سجل العمليات والخصوصية' : "Registre d'audit"}</span>
            </button>
          </div>
          <button
            onClick={() => setShowDisclaimer(false)}
            className="text-white/80 hover:text-white p-0.5 rounded cursor-pointer"
            aria-label={isAr ? 'إخفاء الإشعار' : 'Masquer'}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-2">
          
          {/* Back Button, Logo & Slogan */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <BackButton variant="header" />
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2 text-right focus:outline-hidden group cursor-pointer"
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
                  <span className="text-[9px] md:text-xs font-bold px-1 py-0.2 rounded-sm bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    DZ 🇩🇿
                  </span>
                </div>
                <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline-block">
                  {isAr ? 'صحتك وصحة عائلتك… في مكان واحد' : 'Votre santé et celle de votre famille… au même endroit'}
                </span>
              </div>
            </button>
          </div>

          {/* Center/Right Actions: Family Selector, Theme Toggle, Emergency Card, Language, Search */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            
            {/* Quick Family Member Switcher */}
            <div className="relative">
              <label htmlFor="family-member-select" className="sr-only">
                {isAr ? 'اختيار فرد العائلة' : 'Sélectionner le membre de famille'}
              </label>
              <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-teal-50/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-500/50 rounded-xl px-2 py-1.5 transition-colors">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs shrink-0">
                  {activeMember.fullNameAr.charAt(0)}
                </div>
                <div className="text-right hidden md:block">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                    {isAr ? activeMember.fullNameAr : activeMember.fullNameFr}
                  </div>
                  <div className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                    {isAr ? activeMember.relationshipLabelAr : activeMember.relationshipLabelFr} • {activeMember.bloodGroup}
                  </div>
                </div>
                <select
                  id="family-member-select"
                  value={activeMemberId}
                  onChange={(e) => setActiveMemberId(e.target.value)}
                  className="bg-transparent text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer max-w-[70px] sm:max-w-[120px] md:max-w-none truncate"
                  aria-label={isAr ? 'تغيير الملف الصحي' : 'Changer de dossier'}
                >
                  {familyMembers.map((member) => (
                    <option key={member.id} value={member.id} className="dark:bg-slate-900 dark:text-slate-100">
                      {isAr ? member.fullNameAr.split(' ')[0] : member.fullNameFr.split(' ')[0]}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 dark:text-slate-500 pointer-events-none shrink-0" />
              </div>
            </div>

            {/* Quick Search Shortcut */}
            <button
              onClick={() => setActiveTab('search')}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title={isAr ? 'البحث الذكي في التاريخ الصحي' : 'Recherche intelligente'}
              aria-label={isAr ? 'البحث الذكي' : 'Recherche'}
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Dedicated ThemeToggle Component (Toggle Switch for full system Dark/Light mode) */}
            <ThemeToggle variant="switch" showLabel={true} />

            {/* Emergency Medical Card Button (Chifa / Blood / Allergies) */}
            <button
              onClick={() => setIsEmergencyModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/80 text-xs font-bold transition-all shadow-2xs cursor-pointer"
              title={isAr ? 'بطاقة الطوارئ الطبية والشفاء' : "Fiche d'urgence médicale"}
              aria-label={isAr ? 'بطاقة الطوارئ الطبية' : "Fiche d'urgence"}
            >
              <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400 animate-pulse" />
              <span className="hidden sm:inline font-mono">
                {activeMember.bloodGroup}
              </span>
              <span className="hidden lg:inline">
                {isAr ? 'طوارئ' : 'Urgence'}
              </span>
            </button>

            {/* Notifications Indicator - Opens Dedicated Notification Center */}
            <button
              onClick={() => setIsNotificationsModalOpen(true)}
              className="relative p-2 text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title={isAr ? `مركز التنبيهات الصحية (${unreadNotificationCount} غير مقروء)` : `Centre de notifications (${unreadNotificationCount} non lues)`}
              aria-label={isAr ? 'مركز التنبيهات الصحية' : 'Centre de notifications'}
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                  {unreadNotificationCount}
                </span>
              )}
            </button>

            {/* Language Toggle: Arabic <-> French */}
            <button
              onClick={() => setLanguage(isAr ? 'fr' : 'ar')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-slate-600 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-300 transition-colors cursor-pointer"
              title={isAr ? 'Changer en Français' : 'التحويل إلى العربية'}
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{isAr ? 'FR' : 'عربي'}</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
