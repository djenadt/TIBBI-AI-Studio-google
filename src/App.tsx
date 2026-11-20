import React from 'react';
import { TibbiProvider, useTibbi } from './context/TibbiContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { FamilyView } from './components/FamilyView';
import { ArchiveOCRView } from './components/ArchiveOCRView';
import { MedicationsView } from './components/MedicationsView';
import { LabTestsView } from './components/LabTestsView';
import { VitalsView } from './components/VitalsView';
import { AppointmentsView } from './components/AppointmentsView';
import { TimelineView } from './components/TimelineView';
import { WomenHealthView } from './components/WomenHealthView';
import { ChildHealthView } from './components/ChildHealthView';
import { ReportsShareView } from './components/ReportsShareView';
import { SmartSearchView } from './components/SmartSearchView';
import { SettingsView } from './components/SettingsView';
import { EmergencyModal } from './components/EmergencyModal';
import { NotificationsModal } from './components/NotificationsModal';
import { AuditLogsModal } from './components/AuditLogsModal';
import { Activity, ShieldCheck } from 'lucide-react';
import { resolveLightBgPreset } from './utils/appearanceSettings';
import { tr } from './types/tibbi';

const AppContent: React.FC = () => {
  const { activeTab, language, resetDataToDefaults, lightBgTheme } = useTibbi();
  const [confirmReset, setConfirmReset] = React.useState(false);
  const lightBgClass = resolveLightBgPreset(lightBgTheme).appBgClass;

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'family':
        return <FamilyView />;
      case 'archive':
        return <ArchiveOCRView />;
      case 'medications':
        return <MedicationsView />;
      case 'labs':
        return <LabTestsView />;
      case 'vitals':
        return <VitalsView />;
      case 'appointments':
        return <AppointmentsView />;
      case 'timeline':
        return <TimelineView />;
      case 'women_health':
        return <WomenHealthView />;
      case 'child_health':
        return <ChildHealthView />;
      case 'reports_share':
        return <ReportsShareView />;
      case 'settings':
        return <SettingsView />;
      case 'search':
        return <SmartSearchView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className={`min-h-screen ${lightBgClass} dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-teal-500 selection:text-white transition-colors`}>
      {/* Unified Sticky Top Shell (Header + Desktop Navigation) */}
      <div className="sticky top-0 z-30">
        <Header />
        <Navigation />
      </div>

      {/* Main Content Area with bottom clearance for mobile navbar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 lg:pb-12">
        {renderActiveView()}
      </main>

      {/* Emergency, Notification Center, and Privacy Audit Modals */}
      <EmergencyModal />
      <NotificationsModal />
      <AuditLogsModal />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto py-8 text-xs text-slate-500 dark:text-slate-400 hidden lg:block transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-700 dark:bg-teal-600 text-white flex items-center justify-center font-black">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-slate-800 dark:text-slate-100 text-sm block">
                {tr(language, 'TIBBI • الجزائر 🇩🇿', 'TIBBI • Algérie 🇩🇿', 'TIBBI • Algeria 🇩🇿')}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {tr(
                  language,
                  'المنظومة الرقمية المتكاملة للذاكرة الصحية للأفراد والعائلات الجزائرية',
                  'Plateforme numérique intégrée de santé pour la famille algérienne',
                  'Integrated digital family health record platform'
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              {tr(
                language,
                'نسخة تجريبية • حفظ محلي ببيانات محاكاة',
                'Prototype démo • Stockage local simulé',
                'Demo Prototype • Local storage with simulated data'
              )}
            </span>
            {confirmReset ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    resetDataToDefaults();
                    setConfirmReset(false);
                  }}
                  className="text-red-600 dark:text-red-400 font-bold hover:underline cursor-pointer"
                >
                  {tr(language, 'تأكيد الاستعادة', 'Confirmer', 'Confirm Reset')}
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                >
                  {tr(language, 'إلغاء', 'Annuler', 'Cancel')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
              >
                {tr(language, 'إعادة ضبط البيانات النموذجية', 'Réinitialiser la démo', 'Reset Demo Data')}
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <TibbiProvider>
      <AppContent />
    </TibbiProvider>
  );
}
