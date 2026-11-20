import React from 'react';
import {
  Pill,
  FlaskConical,
  CalendarDays,
  Baby,
  HeartPulse,
  FolderOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ScanLine,
  ChevronRight,
  UserCheck,
  Activity,
  Heart,
  Eye,
  EyeOff,
  FileText,
  Lock,
} from 'lucide-react';
import { useTibbi } from '../context/TibbiContext';
import { tr } from '../types/tibbi';
import { calculateBMI, getBMICategory } from '../utils/healthCalculators';
import { maskIdentityNumber, checkMemberAccessPermission } from '../utils/securityAndSharing';
import { localizeText } from '../utils/frTranslator';

export const DashboardView: React.FC = () => {
  const {
    language,
    activeMember,
    familyMembers,
    setActiveMemberId,
    setActiveTab,
    dailySchedule,
    toggleMedicationScheduleStatus,
    activeMemberMedications,
    activeMemberLabTests,
    activeMemberAppointments,
    activeMemberVitals,
    activeMemberDocuments,
    unmaskedIds,
    toggleMaskId,
    setIsEmergencyModalOpen,
  } = useTibbi();

  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  // Active member's today pills
  const todayMeds = dailySchedule.filter((s) => s.patientId === activeMember.id);
  const nextAppointment = activeMemberAppointments.find((a) => a.status === 'upcoming');
  const latestVital = activeMemberVitals[0];
  const abnormalLabs = activeMemberLabTests.filter((l) => l.isAbnormal);

  // Latest BMI if height and weight available
  const bmiValue = latestVital?.weightKg && latestVital?.heightCm
    ? calculateBMI(latestVital.weightKg, latestVital.heightCm)
    : undefined;
  const bmiCat = bmiValue ? getBMICategory(bmiValue) : undefined;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Algerian Family Header & Profile Switcher */}
      <section className="bg-gradient-to-br from-teal-800 via-teal-700 to-emerald-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        {/* Background Algerian & Health Crest Accents */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none blur-2xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-emerald-400/10 pointer-events-none blur-xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-emerald-100 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{tr(language, 'الذاكرة الصحية الرقمية للعائلة الجزائرية', 'Mémoire santé numérique pour toute la famille', 'Digital health memory for the whole family')}</span>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              {tr(
                language,
                `أهلاً بك، ملف ${activeMember.fullNameAr}`,
                `Bonjour, dossier de ${activeMember.fullNameFr}`,
                `Welcome, ${activeMember.fullNameFr}'s record`
              )}
            </h1>
            
            <p className="text-emerald-100/90 text-sm md:text-base max-w-2xl leading-relaxed">
              {tr(
                language,
                'تاريخك الصحي الكامل، الأدوية، التحاليل المخبرية، ومتابعة نمو أطفالك في مساحة آمنة ومترابطة.',
                'Tout votre historique médical, ordonnances, bilans biologiques et suivi familial en un seul endroit sécurisé.',
                'Your complete medical history, prescriptions, lab tests, and family health tracking in one secure place.'
              )}
            </p>
          </div>
        </div>

        {/* Quick Health Status Ribbon for Active Member */}
        <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-white">
          <div className="bg-white/10 rounded-xl p-2.5">
            <span className="text-[11px] text-emerald-200 block">{tr(language, 'فصيلة الدم', 'Groupe sanguin', 'Blood Type')}</span>
            <span dir="ltr" className="text-base font-extrabold font-mono text-white inline-block">{activeMember.bloodGroup}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5">
            <span className="text-[11px] text-emerald-200 block">{tr(language, 'الأمراض المزمنة', 'Maladies chroniques', 'Chronic Conditions')}</span>
            <span className="text-xs font-bold truncate block">
              {activeMember.chronicDiseases.length > 0
                ? localizeText(activeMember.chronicDiseases[0], language)
                : tr(language, 'لا توجد', 'Aucune', 'None')}
            </span>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5">
            <span className="text-[11px] text-emerald-200 block">{tr(language, 'الحساسية المعروفة', 'Allergies connues', 'Known Allergies')}</span>
            <span className="text-xs font-bold truncate block text-amber-200">
              {activeMember.allergies.length > 0
                ? localizeText(activeMember.allergies[0], language)
                : tr(language, 'لا توجد', 'Aucune', 'None')}
            </span>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-200 block">{tr(language, 'رقم الشفاء / التعريف', 'N° Carte Chifa', 'Chifa Card No.')}</span>
              {activeMember.nationalIdOrChifa && (
                <button
                  type="button"
                  onClick={() => toggleMaskId(activeMember.id)}
                  className="text-emerald-200 hover:text-white p-0.5 cursor-pointer"
                  title={unmaskedIds[activeMember.id] ? tr(language, 'إخفاء', 'Masquer', 'Hide') : tr(language, 'إظهار', 'Afficher', 'Show')}
                  aria-label={unmaskedIds[activeMember.id] ? tr(language, 'إخفاء رقم الشفاء', 'Masquer Chifa', 'Hide Chifa number') : tr(language, 'إظهار رقم الشفاء', 'Afficher Chifa', 'Show Chifa number')}
                >
                  {unmaskedIds[activeMember.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              )}
            </div>
            <span dir="ltr" className={`text-[11px] sm:text-xs font-mono font-bold block sm:tracking-wider ${isAr ? 'text-right' : 'text-left'}`}>
              {activeMember.nationalIdOrChifa
                ? maskIdentityNumber(activeMember.nationalIdOrChifa, !!unmaskedIds[activeMember.id])
                : '--'}
            </span>
          </div>
        </div>

        {/* Guardian and Access Authorization Info */}
        {activeMember.legalGuardian && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-emerald-100">
            <ShieldCheck className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>
              {tr(
                language,
                `الوصاية القانونية المعتمدة: ${activeMember.legalGuardian} (صلاحية تتبع ورعاية مصرح بها)`,
                `Tutelle légale autorisée : ${localizeText(activeMember.legalGuardian, language)}`,
                `Authorized legal guardian: ${localizeText(activeMember.legalGuardian, language)}`
              )}
            </span>
          </div>
        )}
      </section>

      {/* Hero Quick Banner: Unified Counts & Quick Access */}
      <div className="bg-teal-50 dark:bg-slate-900 border border-teal-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <FolderOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-teal-950 dark:text-teal-200">
              {tr(language, 'ملفك الصحي في متناول يدك', 'Mon dossier santé - Tout votre historique', 'My Health Record - Complete Medical History')}
            </h2>
            <div className="text-xs text-teal-800/90 dark:text-slate-300 flex flex-wrap items-center gap-2 mt-0.5">
              <span className="font-bold text-teal-700 dark:text-teal-400">
                {tr(language, `${activeMemberDocuments.length} وثائق مؤرشفة`, `${activeMemberDocuments.length} docs archivés`, `${activeMemberDocuments.length} archived docs`)}
              </span>
              <span>•</span>
              <span>
                {tr(language, `${activeMemberLabTests.length} نتائج تحاليل`, `${activeMemberLabTests.length} bilans labo`, `${activeMemberLabTests.length} lab results`)}
              </span>
              <span>•</span>
              <span>
                {tr(language, `${activeMemberVitals.length} تسجيلات حيوية`, `${activeMemberVitals.length} mesures vitales`, `${activeMemberVitals.length} vital records`)}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('archive')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <ScanLine className="w-4 h-4" />
            <span>{tr(language, 'مسح واستيراد وثيقة', 'Numériser & Importer', 'Scan & Import')}</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-teal-100/60 dark:hover:bg-slate-700 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <span>{tr(language, 'الخط الزمني', 'Chronologie', 'Timeline')}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of the 6 Main Modules (Exact match to Phone App Mockup in attached poster) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {tr(language, 'الأقسام الصحية الرئيسية', 'Modules de suivi de santé', 'Health Monitoring Modules')}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {tr(language, 'خدمات طبية متكاملة', 'Services intégrés', 'Integrated services')}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          
          {/* Tile 1: Vitals & Health Metrics (Soft Cool Red) */}
          <button
            onClick={() => setActiveTab('vitals')}
            className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-red-50/80 dark:bg-red-950/30 border border-red-200/80 dark:border-red-800/50 hover:border-red-400 dark:hover:border-red-500 hover:shadow-md transition-all text-center cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-red-100/90 dark:bg-red-900/60 group-hover:bg-red-200/80 dark:group-hover:bg-red-800/70 text-red-700 dark:text-red-300 flex items-center justify-center mb-2.5 transition-colors">
              <HeartPulse className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-red-950 dark:text-red-100 group-hover:text-red-800 dark:group-hover:text-white">
              {tr(language, 'القياسات والمؤشرات', 'Ma Santé', 'Vitals & Metrics')}
            </span>
            <span dir="ltr" className="text-[11px] text-red-800/80 dark:text-red-300/85 mt-0.5">
              {latestVital?.systolicBp ? `${latestVital.systolicBp}/${latestVital.diastolicBp}` : tr(language, 'ضغط، سكر، وزن', 'Tension, Sucre', 'BP, Glucose, Weight')}
            </span>
          </button>

          {/* Tile 2: Medications (Soft Warm Amber) */}
          <button
            onClick={() => setActiveTab('medications')}
            className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all text-center cursor-pointer relative"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100/90 dark:bg-amber-900/60 group-hover:bg-amber-200/80 dark:group-hover:bg-amber-800/70 text-amber-700 dark:text-amber-300 flex items-center justify-center mb-2.5 transition-colors">
              <Pill className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-100 group-hover:text-amber-800 dark:group-hover:text-white">
              {tr(language, 'الأدوية والعلاجات', 'Médicaments', 'Medications')}
            </span>
            <span className="text-[11px] text-amber-800/80 dark:text-amber-300/85 mt-0.5">
              {tr(language, `${activeMemberMedications.length} أدوية مسجلة`, `${activeMemberMedications.length} inscrits`, `${activeMemberMedications.length} recorded`)}
            </span>
          </button>

          {/* Tile 3: Lab Tests (Soft Cool Blue) */}
          <button
            onClick={() => setActiveTab('labs')}
            className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-sky-50/85 dark:bg-sky-950/30 border border-sky-200/80 dark:border-sky-800/50 hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-md transition-all text-center cursor-pointer relative"
          >
            <div className="w-12 h-12 rounded-2xl bg-sky-100/90 dark:bg-sky-900/60 group-hover:bg-sky-200/80 dark:group-hover:bg-sky-800/70 text-sky-700 dark:text-sky-300 flex items-center justify-center mb-2.5 transition-colors">
              <FlaskConical className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-sky-950 dark:text-sky-100 group-hover:text-sky-800 dark:group-hover:text-white">
              {tr(language, 'التحاليل والفحوصات', 'Analyses & Labo', 'Lab Tests')}
            </span>
            <span className="text-[11px] text-sky-800/80 dark:text-sky-300/85 mt-0.5">
              {tr(language, `${activeMemberLabTests.length} نتائج مخبرية`, `${activeMemberLabTests.length} bilans`, `${activeMemberLabTests.length} lab tests`)}
            </span>
            {abnormalLabs.length > 0 && (
              <span className="absolute top-2.5 end-2.5 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          {/* Tile 4: Appointments (Soft Lavender Violet) */}
          <button
            onClick={() => setActiveTab('appointments')}
            className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-violet-50/80 dark:bg-violet-950/30 border border-violet-200/80 dark:border-violet-800/50 hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-md transition-all text-center cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-violet-100/90 dark:bg-violet-900/60 group-hover:bg-violet-200/80 dark:group-hover:bg-violet-800/70 text-violet-700 dark:text-violet-300 flex items-center justify-center mb-2.5 transition-colors">
              <CalendarDays className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-violet-950 dark:text-violet-100 group-hover:text-violet-800 dark:group-hover:text-white">
              {tr(language, 'المواعيد والزيارات', 'Rendez-vous', 'Appointments')}
            </span>
            <span className="text-[11px] text-violet-800/80 dark:text-violet-300/85 mt-0.5">
              {tr(language, `${activeMemberAppointments.length} مواعيد`, `${activeMemberAppointments.length} RDV`, `${activeMemberAppointments.length} visits`)}
            </span>
          </button>

          {/* Tile 5: Women's Health & Pregnancy (Soft Maternal Pink) */}
          <button
            onClick={() => setActiveTab('women_health')}
            className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-pink-50/85 dark:bg-pink-950/30 border border-pink-200/80 dark:border-pink-800/50 hover:border-pink-400 dark:hover:border-pink-500 hover:shadow-md transition-all text-center cursor-pointer relative"
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-100/90 dark:bg-pink-900/60 group-hover:bg-pink-200/80 dark:group-hover:bg-pink-800/70 text-pink-700 dark:text-pink-300 flex items-center justify-center mb-2.5 transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.85"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-7 h-7"
                aria-hidden="true"
              >
                <circle cx="11.5" cy="4.2" r="2.2" fill="currentColor" fillOpacity="0.18" />
                <path d="M9.5 8C8.3 8.5 7.8 10 8.2 12.5C8.5 14.5 8.5 16.5 9 18.5V21.5M12.5 21.5V18C14.8 17.6 17 15.8 17 13.3C17 11.2 15.4 9.6 13.8 8.7C13 8.2 12.2 8 11.5 8" />
                <path d="M10 10.5C10.5 12.5 12.2 13.8 14.4 13.8" />
                <path
                  d="M13.2 10.8C15.2 11.2 16.4 12.4 16.4 13.7C16.4 15.3 14.9 16.8 12.8 17.1"
                  fill="currentColor"
                  fillOpacity="0.16"
                  stroke="none"
                />
              </svg>
            </div>
            <span className="text-xs sm:text-sm font-bold text-pink-950 dark:text-pink-100 group-hover:text-pink-800 dark:group-hover:text-white">
              {tr(language, 'صحة المرأة والحمل', 'Santé Féminine', "Women's Health")}
            </span>
            <span className="text-[11px] text-pink-700 dark:text-pink-300 font-semibold mt-0.5">
              {activeMember.isPregnant ? tr(language, 'متابعة الحمل', 'Grossesse', 'Pregnancy') : tr(language, 'دورة وتبويض', 'Cycle', 'Cycle')}
            </span>
          </button>

          {/* Tile 6: Child Health & Growth (Soft Mint Emerald) */}
          <button
            onClick={() => setActiveTab('child_health')}
            className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-md transition-all text-center cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100/90 dark:bg-emerald-900/60 group-hover:bg-emerald-200/80 dark:group-hover:bg-emerald-800/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-2.5 transition-colors">
              <Baby className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-emerald-950 dark:text-emerald-100 group-hover:text-emerald-800 dark:group-hover:text-white">
              {tr(language, 'صحة الأطفال والنمو', 'Santé Enfants', 'Child Health')}
            </span>
            <span className="text-[11px] text-emerald-800/80 dark:text-emerald-300/85 mt-0.5">
              {tr(language, 'لقاحات ومنحنيات', 'Vaccins & PEV', 'Vaccines & Growth')}
            </span>
          </button>

        </div>
      </section>

      {/* Two-Column Working Section: Today's Pill Schedule & Upcoming Doctor Appointment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1 & 2: Today's Medication Tracker */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {tr(language, 'جرعات اليوم وتذكيرات الأدوية', 'Prises du jour & Rappels de médicaments', "Today's Doses & Medication Reminders")}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tr(language, `المسجل للمريض: ${activeMember.fullNameAr}`, `Pour : ${activeMember.fullNameFr}`, `For: ${activeMember.fullNameFr}`)}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('medications')}
              className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 flex items-center gap-1 cursor-pointer"
            >
              <span>{tr(language, 'عرض الكل', 'Voir tout', 'View all')}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayMeds.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {tr(language, 'لا توجد جرعات مجدولة لهذا اليوم.', 'Aucune prise programmée pour aujourd’hui.', 'No doses scheduled for today.')}
              </p>
              <button
                onClick={() => setActiveTab('medications')}
                className="mt-2 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
              >
                {tr(language, '+ إضافة دواء جديد', '+ Ajouter un médicament', '+ Add medication')}
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayMeds.map((item) => {
                const isTaken = item.status === 'taken';
                const isSkipped = item.status === 'skipped';
                return (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                      isTaken
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/70 text-emerald-950 dark:text-emerald-200'
                        : isSkipped
                        ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                        : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 hover:border-amber-300 dark:hover:border-amber-500/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-mono text-xs font-extrabold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                        {item.time}
                      </div>
                      <div>
                        <div className={`text-sm font-bold ${isTaken ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'}`}>
                          {localizeText(item.medicationName, language)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {localizeText(item.dosage, language)} {item.takenAt && `• ${tr(language, 'أُخذت في', 'Prise à', 'Taken at')} ${item.takenAt}`}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleMedicationScheduleStatus(item.id, isTaken ? 'pending' : 'taken')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                          isTaken
                            ? 'bg-emerald-600 dark:bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{isTaken ? tr(language, 'تم التناول', 'Pris', 'Taken') : tr(language, 'تناول', 'Prendre', 'Take')}</span>
                      </button>
                      {!isTaken && (
                        <button
                          onClick={() => toggleMedicationScheduleStatus(item.id, isSkipped ? 'pending' : 'skipped')}
                          className="px-2 py-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                          title={tr(language, 'تخطي الجرعة', 'Passer', 'Skip dose')}
                        >
                          {isSkipped ? tr(language, 'تراجع', 'Annuler', 'Undo') : tr(language, 'تخطي', 'Sauter', 'Skip')}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Column 3: Next Appointment & Vitals Spotlight */}
        <div className="space-y-4">
          
          {/* Upcoming Appointment */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                {tr(language, 'الموعد الطبي القادم', 'Prochain Rendez-vous', 'Next Appointment')}
              </span>
              <span className="p-1 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                <CalendarDays className="w-4 h-4" />
              </span>
            </div>

            {nextAppointment ? (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{localizeText(nextAppointment.doctorName, language)}</h4>
                    <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">{localizeText(nextAppointment.specialty, language)}</p>
                  </div>
                  <div className="text-end shrink-0">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 text-xs font-bold font-mono">
                      {nextAppointment.date}
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">{nextAppointment.time}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-100 dark:border-slate-700/80">
                  {localizeText(nextAppointment.reason, language)}
                </p>
                <div className="text-[11px] text-slate-400 dark:text-slate-400">
                  📍 {localizeText(nextAppointment.clinicName, language)}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tr(language, 'لا توجد مواعيد طبية قادمة مسجلة.', 'Aucun rendez-vous à venir.', 'No upcoming appointments scheduled.')}
                </p>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className="mt-2 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  {tr(language, '+ حجز موعد جديد', '+ Programmer un RDV', '+ Schedule Appointment')}
                </button>
              </div>
            )}
          </div>

          {/* Vitals Summary Card (Cool Blue) */}
          <div className="bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50/80 dark:from-sky-950/60 dark:via-blue-950/50 dark:to-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-5 shadow-xs space-y-3 border border-sky-200/90 dark:border-sky-800/60 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider">
                {tr(language, 'آخر قياسات صحية', 'Dernières Mesures', 'Latest Vitals')}
              </span>
              <HeartPulse className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white/85 dark:bg-sky-900/35 border border-sky-200/70 dark:border-sky-800/50 rounded-xl p-2.5">
                <span className="text-[10px] text-sky-700 dark:text-sky-300 font-semibold block">{tr(language, 'ضغط الدم', 'Tension (BP)', 'Blood Pressure')}</span>
                <span dir="ltr" className="text-sm font-extrabold font-mono text-sky-950 dark:text-sky-100 inline-block">
                  {latestVital?.systolicBp ? `${latestVital.systolicBp}/${latestVital.diastolicBp}` : '--'}
                </span>
                <span className="text-[9px] text-sky-700/75 dark:text-sky-300/80 block">mmHg</span>
              </div>
              <div className="bg-white/85 dark:bg-sky-900/35 border border-sky-200/70 dark:border-sky-800/50 rounded-xl p-2.5">
                <span className="text-[10px] text-sky-700 dark:text-sky-300 font-semibold block">{tr(language, 'مؤشر الكتلة BMI', 'Indice IMC', 'BMI Index')}</span>
                <span className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                  {bmiValue ?? '--'}
                </span>
                <span className="text-[9px] block text-sky-700 dark:text-sky-300 font-semibold truncate">
                  {bmiCat ? tr(language, bmiCat.labelAr, bmiCat.labelFr, bmiCat.labelEn) : '--'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('vitals')}
              className="w-full text-center text-xs text-sky-800 dark:text-sky-300 hover:text-sky-950 dark:hover:text-white font-bold py-1.5 border-t border-sky-200/80 dark:border-sky-800/60 cursor-pointer transition-colors"
            >
              {tr(language, 'تسجيل قياس جديد ومخطط التطور ←', 'Enregistrer une mesure & Voir les graphes →', 'Log measurement & View charts →')}
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
