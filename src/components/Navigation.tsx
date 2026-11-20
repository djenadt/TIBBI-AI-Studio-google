import React from 'react';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  FlaskConical,
  HeartPulse,
  CalendarDays,
  Clock,
  Baby,
  Sparkles,
  Share2,
  Settings,
  Search,
} from 'lucide-react';
import { useTibbi, NavigationTab } from '../context/TibbiContext';
import { tr } from '../types/tibbi';

interface NavItem {
  id: NavigationTab;
  labelAr: string;
  labelFr: string;
  labelEn: string;
  icon: React.ElementType;
  badge?: string;
}

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, language, activeMember } = useTibbi();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      labelAr: 'الرئيسية',
      labelFr: 'Accueil',
      labelEn: 'Home',
      icon: LayoutDashboard,
    },
    {
      id: 'family',
      labelAr: 'إدارة الأسرة',
      labelFr: 'Famille',
      labelEn: 'Family',
      icon: Users,
    },
    {
      id: 'archive',
      labelAr: 'الأرشيف الذكي & OCR',
      labelFr: 'Archives & OCR',
      labelEn: 'Archive & OCR',
      icon: FolderOpen,
    },
    {
      id: 'labs',
      labelAr: 'التحاليل والفحوصات',
      labelFr: 'Analyses & Examens',
      labelEn: 'Lab Tests',
      icon: FlaskConical,
    },
    {
      id: 'vitals',
      labelAr: 'المؤشرات والقياسات',
      labelFr: 'Mesures & Santé',
      labelEn: 'Vitals & Metrics',
      icon: HeartPulse,
    },
    {
      id: 'appointments',
      labelAr: 'المواعيد والزيارات',
      labelFr: 'Rendez-vous',
      labelEn: 'Appointments',
      icon: CalendarDays,
    },
    {
      id: 'timeline',
      labelAr: 'الخط الزمني الصحي',
      labelFr: 'Chronologie',
      labelEn: 'Timeline',
      icon: Clock,
    },
    {
      id: 'women_health',
      labelAr: 'صحة المرأة والحمل',
      labelFr: 'Santé Féminine & Grossesse',
      labelEn: "Women's Health",
      icon: Sparkles,
      badge: activeMember.isPregnant ? tr(language, 'حامل', 'Enceinte', 'Pregnant') : undefined,
    },
    {
      id: 'child_health',
      labelAr: 'صحة الأطفال والنمو',
      labelFr: 'Enfants & Vaccins',
      labelEn: 'Child Health',
      icon: Baby,
    },
    {
      id: 'reports_share',
      labelAr: 'التقارير والمشاركة (QR)',
      labelFr: 'Rapports & Partage QR',
      labelEn: 'Reports & QR Share',
      icon: Share2,
    },
    {
      id: 'settings',
      labelAr: 'الإعدادات',
      labelFr: 'Paramètres',
      labelEn: 'Settings',
      icon: Settings,
    },
    {
      id: 'search',
      labelAr: 'البحث الشامل',
      labelFr: 'Recherche',
      labelEn: 'Search',
      icon: Search,
    },
  ];

  // Mobile primary items for bottom bar
  const mobilePrimaryTabs: NavigationTab[] = [
    'dashboard',
    'family',
    'archive',
    'reports_share',
    'settings',
  ];

  return (
    <>
      {/* Desktop/Tablet Horizontal Category Nav Pill Bar */}
      <nav aria-label="Main Navigation" className="hidden lg:block bg-slate-100/90 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-1.5 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm shadow-teal-600/30 ring-1 ring-teal-700 dark:ring-teal-400'
                      : 'bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-700 hover:text-teal-800 dark:hover:text-teal-300 border border-slate-200/80 dark:border-slate-700/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-teal-600 dark:text-teal-400'}`} />
                  <span>{tr(language, item.labelAr, item.labelFr, item.labelEn)}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        isActive
                          ? 'bg-white text-teal-800 dark:bg-teal-950 dark:text-teal-200'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Sticky Bottom Navigation Bar (exact match to poster mobile app shell) */}
      <nav aria-label="Mobile Navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1 shadow-lg transition-colors">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {navItems
            .filter((item) => mobilePrimaryTabs.includes(item.id))
            .map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex flex-col items-center justify-center py-1.5 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'text-teal-700 dark:text-teal-400 font-bold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                    {item.badge && (
                      <span className="absolute -top-1 -right-2 w-3.5 h-3.5 bg-amber-500 rounded-full text-white text-[9px] flex items-center justify-center font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] mt-0.5 truncate max-w-[65px]">
                    {tr(language, item.labelAr, item.labelFr, item.labelEn).split(' ')[0]}
                  </span>
                </button>
              );
            })}
        </div>
      </nav>
    </>
  );
};
