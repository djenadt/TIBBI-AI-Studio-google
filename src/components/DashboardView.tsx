import React from 'react';
import {
  Pill,
  FlaskConical,
  CalendarDays,
  Sparkles,
  Baby,
  HeartPulse,
  FolderOpen,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Bell,
  Cloud,
  Share2,
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
import { calculateBMI, getBMICategory } from '../utils/healthCalculators';
import { maskIdentityNumber, checkMemberAccessPermission } from '../utils/securityAndSharing';

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
              <span>{isAr ? 'الذاكرة الصحية الرقمية للعائلة الجزائرية' : 'Mémoire santé numérique pour toute la famille'}</span>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              {isAr ? `أهلاً بك، ملف ${activeMember.fullNameAr}` : `Bonjour, dossier de ${activeMember.fullNameFr}`}
            </h1>
            
            <p className="text-emerald-100/90 text-sm md:text-base max-w-2xl leading-relaxed">
              {isAr
                ? 'تاريخك الصحي الكامل، الأدوية، التحاليل المخبرية، ومتابعة نمو أطفالك في مساحة آمنة ومترابطة.'
                : 'Tout votre historique médical, ordonnances, bilans biologiques et suivi familial en un seul endroit sécurisé.'}
            </p>
          </div>

          {/* Quick Family Members Avatars Strip */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 max-w-full overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white/90">
                {isAr ? `عائلتي (${familyMembers.length} أفراد)` : `Ma Famille (${familyMembers.length} membres)`}
              </span>
              <button
                onClick={() => setActiveTab('family')}
                className="text-[11px] font-semibold text-emerald-200 hover:text-white underline cursor-pointer"
              >
                {isAr ? 'إدارة' : 'Gérer'}
              </button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
              {familyMembers.map((member) => {
                const isSelected = member.id === activeMember.id;
                return (
                  <button
                    key={member.id}
                    onClick={() => setActiveMemberId(member.id)}
                    className={`group relative flex flex-col items-center p-1.5 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white text-teal-900 shadow-md ring-2 ring-emerald-300 font-bold'
                        : 'bg-white/15 text-white hover:bg-white/25'
                    }`}
                    title={isAr ? member.fullNameAr : member.fullNameFr}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold ${
                        isSelected ? 'bg-teal-700 text-white' : 'bg-white/20 text-white'
                      }`}
                    >
                      {member.fullNameAr.charAt(0)}
                    </div>
                    <span className="text-[10px] mt-1 max-w-[55px] truncate font-medium">
                      {isAr ? member.fullNameAr.split(' ')[0] : member.fullNameFr.split(' ')[0]}
                    </span>
                    {member.isPregnant && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-pink-400 ring-2 ring-teal-800" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Health Status Ribbon for Active Member */}
        <div className="mt-6 pt-5 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-white">
          <div className="bg-white/10 rounded-xl p-2.5">
            <span className="text-[11px] text-emerald-200 block">{isAr ? 'فصيلة الدم' : 'Groupe sanguin'}</span>
            <span className="text-base font-extrabold font-mono text-white">{activeMember.bloodGroup}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5">
            <span className="text-[11px] text-emerald-200 block">{isAr ? 'الأمراض المزمنة' : 'Maladies chroniques'}</span>
            <span className="text-xs font-bold truncate block">
              {activeMember.chronicDiseases.length > 0
                ? activeMember.chronicDiseases[0]
                : isAr ? 'لا توجد' : 'Aucune'}
            </span>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5">
            <span className="text-[11px] text-emerald-200 block">{isAr ? 'الحساسية المعروفة' : 'Allergies connues'}</span>
            <span className="text-xs font-bold truncate block text-amber-200">
              {activeMember.allergies.length > 0 ? activeMember.allergies[0] : (isAr ? 'لا توجد' : 'Aucune')}
            </span>
          </div>
          <div className="bg-white/10 rounded-xl p-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-emerald-200 block">{isAr ? 'رقم الشفاء / التعريف' : 'N° Carte Chifa'}</span>
              {activeMember.nationalIdOrChifa && (
                <button
                  type="button"
                  onClick={() => toggleMaskId(activeMember.id)}
                  className="text-emerald-200 hover:text-white p-0.5 cursor-pointer"
                  title={unmaskedIds[activeMember.id] ? (isAr ? 'إخفاء' : 'Masquer') : (isAr ? 'إظهار' : 'Afficher')}
                  aria-label={unmaskedIds[activeMember.id] ? 'Masquer Chifa' : 'Afficher Chifa'}
                >
                  {unmaskedIds[activeMember.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              )}
            </div>
            <span className="text-xs font-mono font-bold truncate block tracking-wider">
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
              {isAr
                ? `الوصاية القانونية المعتمدة: ${activeMember.legalGuardian} (صلاحية تتبع ورعاية مصرح بها)`
                : `Tutelle légale autorisée : ${activeMember.legalGuardian}`}
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
              {isAr ? 'ملفك الصحي في متناول يدك' : 'Mon dossier santé - Tout votre historique'}
            </h2>
            <div className="text-xs text-teal-800/90 dark:text-slate-300 flex flex-wrap items-center gap-2 mt-0.5">
              <span className="font-bold text-teal-700 dark:text-teal-400">
                {isAr ? `${activeMemberDocuments.length} وثائق مؤرشفة` : `${activeMemberDocuments.length} docs archivés`}
              </span>
              <span>•</span>
              <span>
                {isAr ? `${activeMemberLabTests.length} نتائج تحاليل` : `${activeMemberLabTests.length} bilans labo`}
              </span>
              <span>•</span>
              <span>
                {isAr ? `${activeMemberVitals.length} تسجيلات حيوية` : `${activeMemberVitals.length} mesures vitales`}
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
            <span>{isAr ? 'مسح واستيراد وثيقة' : 'Numériser & Importer'}</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-teal-100/60 dark:hover:bg-slate-700 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-slate-700 text-xs font-bold transition-all cursor-pointer"
          >
            <span>{isAr ? 'الخط الزمني' : 'Chronologie'}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of the 6 Main Modules (Exact match to Phone App Mockup in attached poster) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {isAr ? 'الأقسام الصحية الرئيسية' : 'Modules de suivi de santé'}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {isAr ? 'خدمات طبية متكاملة' : 'Services intégrés'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          
          {/* Tile 1: Medications */}
          <button
            onClick={() => setActiveTab('medications')}
            className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md transition-all text-center cursor-pointer relative"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-2.5 transition-colors">
              <Pill className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-teal-700 dark:group-hover:text-teal-400">
              {isAr ? 'الأدوية والعلاجات' : 'Médicaments'}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {isAr ? `${activeMemberMedications.length} أدوية مسجلة` : `${activeMemberMedications.length} inscrits`}
            </span>
          </button>

          {/* Tile 2: Lab Tests */}
          <button
            onClick={() => setActiveTab('labs')}
            className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md transition-all text-center cursor-pointer relative"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-2.5 transition-colors">
              <FlaskConical className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-teal-700 dark:group-hover:text-teal-400">
              {isAr ? 'التحاليل والفحوصات' : 'Analyses & Labo'}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {isAr ? `${activeMemberLabTests.length} نتائج مخبرية` : `${activeMemberLabTests.length} bilans`}
            </span>
            {abnormalLabs.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
            )}
          </button>

          {/* Tile 3: Appointments */}
          <button
            onClick={() => setActiveTab('appointments')}
            className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md transition-all text-center cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-2.5 transition-colors">
              <CalendarDays className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-teal-700 dark:group-hover:text-teal-400">
              {isAr ? 'المواعيد والزيارات' : 'Rendez-vous'}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {isAr ? `${activeMemberAppointments.length} مواعيد` : `${activeMemberAppointments.length} RDV`}
            </span>
          </button>

          {/* Tile 4: Women's Health & Pregnancy */}
          <button
            onClick={() => setActiveTab('women_health')}
            className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md transition-all text-center cursor-pointer relative"
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950/50 group-hover:bg-pink-100 dark:group-hover:bg-pink-900/50 text-pink-600 dark:text-pink-400 flex items-center justify-center mb-2.5 transition-colors">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-teal-700 dark:group-hover:text-teal-400">
              {isAr ? 'صحة المرأة والحمل' : 'Santé Féminine'}
            </span>
            <span className="text-[11px] text-pink-600 dark:text-pink-400 font-semibold mt-0.5">
              {activeMember.isPregnant ? (isAr ? 'متابعة الحمل' : 'Grossesse') : (isAr ? 'دورة وتبويض' : 'Cycle')}
            </span>
          </button>

          {/* Tile 5: Child Health & Growth */}
          <button
            onClick={() => setActiveTab('child_health')}
            className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md transition-all text-center cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5 transition-colors">
              <Baby className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-teal-700 dark:group-hover:text-teal-400">
              {isAr ? 'صحة الأطفال والنمو' : 'Santé Enfants'}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {isAr ? 'لقاحات ومنحنيات' : 'Vaccins & PEV'}
            </span>
          </button>

          {/* Tile 6: Vitals & Health Metrics */}
          <button
            onClick={() => setActiveTab('vitals')}
            className="group flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 hover:shadow-md transition-all text-center cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/50 group-hover:bg-teal-100 dark:group-hover:bg-teal-900/50 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-2.5 transition-colors">
              <HeartPulse className="w-6 h-6" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-teal-700 dark:group-hover:text-teal-400">
              {isAr ? 'القياسات والمؤشرات' : 'Ma Santé'}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {latestVital?.systolicBp ? `${latestVital.systolicBp}/${latestVital.diastolicBp}` : (isAr ? 'ضغط، سكر، وزن' : 'Tension, Sucre')}
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
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
                <Pill className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {isAr ? 'جرعات اليوم وتذكيرات الأدوية' : "Prises du jour & Rappels de médicaments"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr ? `المسجل للمريض: ${activeMember.fullNameAr}` : `Pour: ${activeMember.fullNameFr}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('medications')}
              className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 flex items-center gap-1 cursor-pointer"
            >
              <span>{isAr ? 'عرض الكل' : 'Voir tout'}</span>
              <ArrowIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayMeds.length === 0 ? (
            <div className="p-6 text-center rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isAr ? 'لا توجد جرعات مجدولة لهذا اليوم.' : 'Aucune prise programmée pour aujourd’hui.'}
              </p>
              <button
                onClick={() => setActiveTab('medications')}
                className="mt-2 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
              >
                {isAr ? '+ إضافة دواء جديد' : '+ Ajouter un médicament'}
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
                          {item.medicationName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {item.dosage} {item.takenAt && `• ${isAr ? 'أُخذت في' : 'Prise à'} ${item.takenAt}`}
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
                        <span>{isTaken ? (isAr ? 'تم التناول' : 'Pris') : (isAr ? 'تناول' : 'Prendre')}</span>
                      </button>
                      {!isTaken && (
                        <button
                          onClick={() => toggleMedicationScheduleStatus(item.id, isSkipped ? 'pending' : 'skipped')}
                          className="px-2 py-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                          title={isAr ? 'تخطي الجرعة' : 'Passer'}
                        >
                          {isSkipped ? (isAr ? 'تراجع' : 'Annuler') : (isAr ? 'تخطي' : 'Sauter')}
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
                {isAr ? 'الموعد الطبي القادم' : 'Prochain Rendez-vous'}
              </span>
              <span className="p-1 rounded-md bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                <CalendarDays className="w-4 h-4" />
              </span>
            </div>

            {nextAppointment ? (
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{nextAppointment.doctorName}</h4>
                    <p className="text-xs text-teal-700 dark:text-teal-400 font-medium">{nextAppointment.specialty}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 text-xs font-bold font-mono">
                      {nextAppointment.date}
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400">{nextAppointment.time}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-100 dark:border-slate-700/80">
                  {nextAppointment.reason}
                </p>
                <div className="text-[11px] text-slate-400 dark:text-slate-400">
                  📍 {nextAppointment.clinicName}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr ? 'لا توجد مواعيد طبية قادمة مسجلة.' : 'Aucun rendez-vous à venir.'}
                </p>
                <button
                  onClick={() => setActiveTab('appointments')}
                  className="mt-2 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  {isAr ? '+ حجز موعد جديد' : '+ Programmer un RDV'}
                </button>
              </div>
            )}
          </div>

          {/* Vitals Summary Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-900 dark:to-slate-950 text-white rounded-2xl p-5 shadow-xs space-y-3 border border-transparent dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                {isAr ? 'آخر قياسات صحية' : 'Dernières Mesures'}
              </span>
              <HeartPulse className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-slate-400 block">{isAr ? 'ضغط الدم' : 'Tension (BP)'}</span>
                <span className="text-sm font-extrabold font-mono text-emerald-300">
                  {latestVital?.systolicBp ? `${latestVital.systolicBp}/${latestVital.diastolicBp}` : '--'}
                </span>
                <span className="text-[9px] text-slate-400 block">mmHg</span>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5">
                <span className="text-[10px] text-slate-400 block">{isAr ? 'مؤشر الكتلة BMI' : 'Indice IMC'}</span>
                <span className="text-sm font-extrabold font-mono text-white">
                  {bmiValue ?? '--'}
                </span>
                <span className="text-[9px] block text-emerald-300 truncate">
                  {bmiCat ? (isAr ? bmiCat.labelAr : bmiCat.labelFr) : '--'}
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('vitals')}
              className="w-full text-center text-xs text-emerald-300 hover:text-white font-semibold py-1 border-t border-white/10 cursor-pointer"
            >
              {isAr ? 'تسجيل قياس جديد ومخطط التطور ←' : 'Enregistrer une mesure & Voir les graphes →'}
            </button>
          </div>

        </div>

      </div>

      {/* 4 Pillars of TIBBI (As prominently showcased on the bottom of the poster) */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <div className="inline-block px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-xs font-bold border border-transparent dark:border-teal-800/50">
            {isAr ? 'أهم مميزات TIBBI' : 'Vos principaux avantages'}
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
            {isAr ? 'منظومة صُممت لحماية وتنظيم صحة عائلتك' : 'Une plateforme conçue pour la santé de votre foyer'}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              {isAr ? 'خصوصيتك وأمان بياناتك أولويتنا' : 'Confidentialité et sécurité maximales'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isAr
                ? 'فصل تام للملفات الصحية، وتشفير محكم للبيانات والوثائق، والتحكم المطلق في الصلاحيات.'
                : 'Séparation étanche des dossiers, cryptage des données et contrôle d’accès rigoureux.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              {isAr ? 'تنبيهات وتذكيرات مخصصة' : 'Notifications et rappels personnalisés'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isAr
                ? 'تذكيرات دقيقة بمواعيد تناول الأدوية، تجديد العلاجات، زيارات الأطباء، وتلقيحات الأطفال الدورية.'
                : 'Rappels réguliers de prises médicamenteuses, fin de traitements, consultations et vaccins.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 flex items-center justify-center">
              <Cloud className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              {isAr ? 'الوصول إلى معلوماتك في كل الأوقات' : 'Accès à vos informations en toutes circonstances'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isAr
                ? 'تاريخك الصحي محفوظ ومتاح في جيبك، عند السفر أو الطوارئ أو مراجعة أي عيادة طبية.'
                : 'Dossier accessible hors-ligne et synchronisé pour les voyages, urgences ou consultations.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <Share2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
              {isAr ? 'مشاركة آمنة مع الأطباء' : 'Partage sécurisé avec vos médecins'}
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {isAr
                ? 'إنشاء رموز QR وروابط مؤقتة محددة الصلاحية لمشاركة التحاليل والتقارير مع طبيبك بكل ثقة.'
                : 'Génération de QR codes et liens temporaires paramétrables pour consultation médicale rapide.'}
            </p>
          </div>

        </div>
      </section>

    </div>
  );
};
