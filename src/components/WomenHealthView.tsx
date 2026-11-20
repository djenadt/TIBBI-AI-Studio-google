import React, { useState, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Calendar,
  Baby,
  Clock,
  Activity,
  Plus,
  CheckCircle2,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Info,
  Droplets,
} from 'lucide-react';
import { useTibbi } from '../context/TibbiContext';
import {
  calculatePregnancyWeek,
  calculateDueDate,
  calculateFertileWindow,
  buildCycleCalendarMonth,
  getDayCyclePhase,
  parseUtcDateMs,
  formatUtcDateStr,
} from '../utils/healthCalculators';
import { localizeText, localizeList, translateFlowIntensity } from '../utils/frTranslator';
import { tr } from '../types/tibbi';

const WEEKDAYS_FR = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const WEEKDAYS_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const WEEKDAYS_AR = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'];

const MONTHS_FR = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

const MONTHS_EN = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MONTHS_AR = [
  'جانفي',
  'فيفري',
  'مارس',
  'أفريل',
  'ماي',
  'جوان',
  'جويلية',
  'أوت',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

export const WomenHealthView: React.FC = () => {
  const {
    language,
    activeMember,
    familyMembers,
    setActiveMemberId,
    activeMemberCycles,
    addMenstrualCycle,
    updateFamilyMember,
  } = useTibbi();

  const isAr = language === 'ar';

  const isFemale = activeMember.gender === 'female';
  const motherMember = familyMembers.find((m) => m.gender === 'female');

  const [isPregnantState, setIsPregnantState] = useState<boolean>(
    Boolean(activeMember.isPregnant)
  );
  const [lmpDate, setLmpDate] = useState<string>(
    activeMember.pregnancyLmpDate || '2026-05-18'
  );

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const latestCycle = activeMemberCycles[0];

  const [cycleStartDate, setCycleStartDate] = useState<string>(
    latestCycle?.startDate || todayStr
  );
  const [cycleDays, setCycleDays] = useState<number>(28);
  const [periodDays, setPeriodDays] = useState<number>(5);

  const nowDate = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState<number>(nowDate.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(nowDate.getMonth());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(todayStr);
  const [cycleSavedFeedback, setCycleSavedFeedback] = useState<boolean>(false);

  // Sync local view state when active family member changes
  useEffect(() => {
    setIsPregnantState(Boolean(activeMember.isPregnant));
    setLmpDate(activeMember.pregnancyLmpDate || '2026-05-18');
  }, [activeMember.id, activeMember.isPregnant, activeMember.pregnancyLmpDate]);

  useEffect(() => {
    if (latestCycle?.startDate) {
      setCycleStartDate(latestCycle.startDate);
    }
  }, [activeMember.id, latestCycle?.startDate]);

  // Pregnancy calculations
  const pregnancyData = calculatePregnancyWeek(lmpDate);
  const dueDate = calculateDueDate(lmpDate);

  // Compute the current cycle's fertile window starting from the cycle containing viewMonth
  const anchorCycleForBanner = useMemo(() => {
    const viewMidMs = Date.UTC(viewYear, viewMonth, 15);
    const anchorMs = parseUtcDateMs(cycleStartDate);
    const msPerCycle = cycleDays * 24 * 60 * 60 * 1000;
    const cycleOffset = Math.floor((viewMidMs - anchorMs) / msPerCycle);
    const cycleStartForMonthMs = anchorMs + cycleOffset * msPerCycle;
    return formatUtcDateStr(cycleStartForMonthMs);
  }, [cycleStartDate, cycleDays, viewYear, viewMonth]);

  const fertileInfo = useMemo(
    () => calculateFertileWindow(anchorCycleForBanner, cycleDays),
    [anchorCycleForBanner, cycleDays]
  );

  // Monthly calendar cells colored by phase
  const calendarCells = useMemo(
    () =>
      buildCycleCalendarMonth(
        viewYear,
        viewMonth,
        cycleStartDate,
        cycleDays,
        periodDays,
        activeMemberCycles
      ),
    [viewYear, viewMonth, cycleStartDate, cycleDays, periodDays, activeMemberCycles]
  );

  const selectedDayInfo = useMemo(
    () =>
      getDayCyclePhase(
        selectedDateStr,
        cycleStartDate,
        cycleDays,
        periodDays,
        activeMemberCycles
      ),
    [selectedDateStr, cycleStartDate, cycleDays, periodDays, activeMemberCycles]
  );

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleGoToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDateStr(todayStr);
  };

  const handleSaveNewCycle = () => {
    const endMs = parseUtcDateMs(cycleStartDate) + (periodDays - 1) * 24 * 60 * 60 * 1000;
    const endDate = formatUtcDateStr(endMs);
    addMenstrualCycle({
      patientId: activeMember.id,
      startDate: cycleStartDate,
      endDate,
      flowIntensity: 'medium',
      symptoms: [],
      notes: tr(
        language,
        `دورة مسجلة (${cycleDays} يوماً)`,
        `Cycle enregistré (${cycleDays} jours)`,
        `Recorded cycle (${cycleDays} days)`
      ),
    });
    const parsedStart = new Date(parseUtcDateMs(cycleStartDate));
    setViewYear(parsedStart.getUTCFullYear());
    setViewMonth(parsedStart.getUTCMonth());
    setSelectedDateStr(cycleStartDate);
    setCycleSavedFeedback(true);
    setTimeout(() => setCycleSavedFeedback(false), 2500);
  };

  const handleTogglePregnancy = (pregnant: boolean) => {
    setIsPregnantState(pregnant);
    updateFamilyMember(activeMember.id, {
      isPregnant: pregnant,
      pregnancyLmpDate: pregnant ? lmpDate : undefined,
    });
  };

  const handleUpdateLmp = (date: string) => {
    setLmpDate(date);
    updateFamilyMember(activeMember.id, {
      pregnancyLmpDate: date,
    });
  };

  const weekdays = tr(language, WEEKDAYS_AR, WEEKDAYS_FR, WEEKDAYS_EN);
  const monthLabel = tr(
    language,
    `${MONTHS_AR[viewMonth]} ${viewYear}`,
    `${MONTHS_FR[viewMonth]} ${viewYear}`,
    `${MONTHS_EN[viewMonth]} ${viewYear}`
  );
  const trimesterEn =
    pregnancyData.trimester === 1 ? '1st Trimester' : pregnancyData.trimester === 2 ? '2nd Trimester' : '3rd Trimester';

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-pink-600 dark:text-pink-400" />
            <span>
              {tr(
                language,
                'صحة المرأة ومتابعة الحمل',
                'Santé Féminine & Suivi de Grossesse',
                "Women's Health & Pregnancy Care"
              )}
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {tr(
              language,
              `فضاء خاص بصحة المرأة: ${activeMember.fullNameAr} - متابعة الدورة الشهرية، تقويم أيام التبويض، ومتابعة الحمل.`,
              `Espace dédié à ${activeMember.fullNameFr} - Calendrier du cycle menstruel, ovulation et suivi de grossesse.`,
              `Dedicated to ${activeMember.fullNameFr} — menstrual cycle calendar, ovulation tracking, and pregnancy care.`
            )}
          </p>
        </div>

        {/* If current member is not female, offer quick switch to Mother (Meriem) */}
        {!isFemale && motherMember && (
          <button
            onClick={() => setActiveMemberId(motherMember.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900/60 text-pink-800 dark:text-pink-300 text-xs font-bold hover:bg-pink-100 dark:hover:bg-pink-900/60 transition-colors cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            <span>
              {tr(
                language,
                `التبديل إلى ملف ${motherMember.fullNameAr}`,
                `Basculer sur ${motherMember.fullNameFr}`,
                `Switch to ${motherMember.fullNameFr}`
              )}
            </span>
          </button>
        )}
      </div>

      {/* Mode Switcher: Pregnancy Mode vs Cycle Tracker Mode */}
      <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 max-w-md transition-colors">
        <button
          onClick={() => handleTogglePregnancy(true)}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            isPregnantState
              ? 'bg-pink-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Baby className="w-4 h-4" />
          <span>{tr(language, 'وضع متابعة الحمل', 'Suivi de grossesse', 'Pregnancy Tracker')}</span>
        </button>
        <button
          onClick={() => handleTogglePregnancy(false)}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            !isPregnantState
              ? 'bg-pink-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>{tr(language, 'متابعة الدورة والتبويض', 'Cycle & Ovulation', 'Cycle & Ovulation')}</span>
        </button>
      </div>

      {/* Pregnancy Tracking Section */}
      {isPregnantState ? (
        <div className="space-y-6">
          {/* Pregnancy Hero Card */}
          <div className="bg-gradient-to-br from-pink-700 via-rose-600 to-amber-700 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden space-y-6">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-lg">
                <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
                  {tr(
                    language,
                    `الثلث ${pregnancyData.trimester === 1 ? 'الأول' : pregnancyData.trimester === 2 ? 'الثاني' : 'الثالث'} من الحمل`,
                    `${pregnancyData.trimester}ème Trimestre`,
                    trimesterEn
                  )}
                </span>

                <h3 className="text-3xl md:text-4xl font-black">
                  {tr(
                    language,
                    `الأسبوع ${pregnancyData.weeks} من الحمل`,
                    `Semaine ${pregnancyData.weeks} de grossesse`,
                    `Week ${pregnancyData.weeks} of Pregnancy`
                  )}
                </h3>

                <p className="text-pink-100 text-sm leading-relaxed">
                  {tr(
                    language,
                    `تاريخ آخر دورة طمثية (LMP): ${lmpDate} • موعد الولادة المتوقع بإذن الله: ${dueDate}`,
                    `Date des dernières règles : ${lmpDate} • Terme prévu : ${dueDate}`,
                    `Last menstrual period (LMP): ${lmpDate} • Estimated due date: ${dueDate}`
                  )}
                </p>
              </div>

              {/* Fetal Milestone Pill */}
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center space-y-1">
                <div className="text-3xl">🌽</div>
                <div className="text-xs font-bold text-white">
                  {tr(
                    language,
                    'حجم الجنين الآن يماثل كوز الذرة',
                    'Taille : env. épis de maïs',
                    'Baby size: approx. ear of corn'
                  )}
                </div>
                <div className="text-[11px] text-pink-200">~ 30 cm • 600g</div>
              </div>
            </div>

            {/* Gestational Progress Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-bold text-pink-100">
                <span>{tr(language, 'بداية الحمل', 'Début', 'Start')}</span>
                <span>
                  {pregnancyData.progressPercent}% (
                  {tr(language, `${pregnancyData.weeks} أسبوعاً`, `${pregnancyData.weeks} SA`, `${pregnancyData.weeks} wks`)})
                </span>
                <span>{tr(language, 'الولادة (40 أسبوعاً)', 'Terme (40 SA)', 'Due Date (40 wks)')}</span>
              </div>
              <div className="h-3 w-full bg-white/25 rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${pregnancyData.progressPercent}%` }}
                />
              </div>
            </div>

            {/* Edit LMP Date Trigger */}
            <div className="flex items-center gap-2 pt-2 text-xs">
              <span className="text-pink-200 font-semibold">
                {tr(language, 'تعديل تاريخ آخر دورة (LMP):', 'Modifier DDR :', 'Edit LMP Date:')}
              </span>
              <input
                type="date"
                value={lmpDate}
                onChange={(e) => handleUpdateLmp(e.target.value)}
                className="bg-white/20 text-white rounded-lg px-2 py-1 font-mono text-xs focus:outline-hidden border border-white/30"
              />
            </div>
          </div>

          {/* Trimester Checklist & Important Tests */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-2 py-0.5 rounded-md border border-transparent dark:border-teal-800/40">
                  {tr(language, 'الثلث الأول (1 - 13 أسبوع)', '1er Trimestre', '1st Trimester (Wks 1–13)')}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                {tr(language, 'الفحوصات الأولية', 'Bilan initial', 'Initial Screening')}
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                <li>{tr(language, 'فحص الدم وفصيلة الريزوس', 'Groupe sanguin & Rhésus', 'Blood type & Rh factor')}</li>
                <li>{tr(language, 'داء المقوسات والحصبة الألمانية', 'Toxoplasmose & Rubéole', 'Toxoplasmosis & Rubella')}</li>
                <li>{tr(language, 'أشعة الصدى الأولى (T1 Echo)', 'Échographie du 1er trimestre', '1st trimester ultrasound')}</li>
                <li>{tr(language, 'حمض الفوليك وفيتامين D', 'Acide folique', 'Folic acid & Vitamin D')}</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-pink-300 dark:border-pink-800/80 ring-2 ring-pink-500/20 dark:ring-pink-500/10 shadow-xs space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/80 px-2 py-0.5 rounded-md border border-transparent dark:border-pink-800/40">
                  {tr(language, 'الثلث الحالي (14 - 27 أسبوع)', '2ème Trimestre (Actuel)', '2nd Trimester (Current)')}
                </span>
                <Activity className="w-4 h-4 text-pink-600 dark:text-pink-400 animate-pulse" />
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                {tr(language, 'الأشعة المورفولوجية والسكري', 'Écho morpho & HGPO', 'Anatomy Scan & OGTT')}
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                <li className="font-bold text-slate-900 dark:text-slate-100">
                  {tr(language, 'فحص الصدى المورفولوجي (الأسبوع 22)', 'Échographie morphologique (22 SA)', 'Morphology ultrasound (22 wks)')}
                </li>
                <li>{tr(language, 'اختبار تحمل السكر للحامل (HGPO)', 'Test de dépistage diabète gestationnel', 'Gestational diabetes OGTT screen')}</li>
                <li>{tr(language, 'مراقبة ضغط الدم والوزن', 'Surveillance tensionnelle', 'Blood pressure & weight monitoring')}</li>
                <li>{tr(language, 'مكملات الحديد والكالسيوم', 'Supplémentation en fer', 'Iron & calcium supplementation')}</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-transparent dark:border-slate-700">
                  {tr(language, 'الثلث الثالث (28 - 40 أسبوع)', '3ème Trimestre', '3rd Trimester (Wks 28–40)')}
                </span>
                <Clock className="w-4 h-4 text-slate-400 dark:text-slate-400" />
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                {tr(language, 'التحضير للولادة', 'Préparation terme', 'Birth Preparation')}
              </h4>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                <li>{tr(language, 'أشعة الصدى للثلث الثالث (T3)', 'Échographie T3 de croissance', '3rd trimester growth scan')}</li>
                <li>{tr(language, 'استشارة طبيب التخدير', 'Consultation anesthésie', 'Anesthesiology consultation')}</li>
                <li>{tr(language, 'تجهيز حقيبة الولادة وملف المستشفى', 'Valise de maternité', 'Hospital bag & maternity file')}</li>
                <li>{tr(language, 'تخطيط قلب الجنين الدوري', 'Monitoring fœtal', 'Routine fetal heart monitoring')}</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        /* Menstrual Cycle & Interactive Monthly Ovulation Calendar */
        <div className="space-y-6">
          {/* Summary KPI Cards matching Red (Period) & Green (Fertile/Ovulation) palette */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-red-200/80 dark:border-red-900/50 shadow-xs space-y-2 transition-colors">
              <span className="text-xs font-bold text-red-600 dark:text-red-400 uppercase flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                <span>{tr(language, 'الدورة المتوقعة القادمة', 'Prochaines règles', 'Next Expected Period')}</span>
              </span>
              <div dir="ltr" className={`text-xl font-black font-mono text-red-600 dark:text-red-400 ${isAr ? 'text-right' : 'text-left'}`}>
                {fertileInfo.nextPeriodDate}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tr(
                  language,
                  `طول الدورة: ${cycleDays} يوماً • الحيض: ${periodDays} أيام`,
                  `Cycle : ${cycleDays} j • Règles : ${periodDays} j`,
                  `Cycle: ${cycleDays} days • Period: ${periodDays} days`
                )}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 shadow-xs space-y-2 transition-colors">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                <span>{tr(language, 'يوم الإباضة المقدر', 'Jour d’ovulation estimé', 'Estimated Ovulation Day')}</span>
              </span>
              <div dir="ltr" className={`text-xl font-black font-mono text-emerald-700 dark:text-emerald-400 ${isAr ? 'text-right' : 'text-left'}`}>
                {fertileInfo.ovulationDate}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tr(language, 'ذروة احتمالية الحمل في الشهر', 'Pic de possibilité de grossesse', 'Peak fertility probability')}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 shadow-xs space-y-2 transition-colors">
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                <span>{tr(language, 'فترة الخصوبة (اللون الأخضر)', 'Fenêtre fertile (en vert)', 'Fertile Window (Green)')}</span>
              </span>
              <div dir="ltr" className={`text-sm font-black font-mono text-emerald-800 dark:text-emerald-300 ${isAr ? 'text-right' : 'text-left'}`}>
                {fertileInfo.fertileStart} → {fertileInfo.fertileEnd}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tr(
                  language,
                  'تقدير إحصائي ولا يُعد وسيلة منع حمل',
                  'Estimation indicative (non contraceptif)',
                  'Statistical estimate (not contraceptive)'
                )}
              </p>
            </div>
          </div>

          {/* Interactive Cycle Settings & Quick Record Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                <label className="block space-y-1 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    {tr(language, 'تاريخ بداية آخر دورة', 'Début des dernières règles', 'Last Period Start Date')}
                  </span>
                  <input
                    type="date"
                    value={cycleStartDate}
                    onChange={(e) => {
                      if (e.target.value) setCycleStartDate(e.target.value);
                    }}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </label>

                <label className="block space-y-1 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    {tr(language, 'طول الدورة (أيام)', 'Durée du cycle (jours)', 'Cycle Length (days)')}
                  </span>
                  <select
                    value={cycleDays}
                    onChange={(e) => setCycleDays(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    {Array.from({ length: 15 }, (_, idx) => 21 + idx).map((d) => (
                      <option key={d} value={d}>
                        {tr(language, `${d} يوماً`, `${d} jours`, `${d} days`)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block space-y-1 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">
                    {tr(language, 'مدة أيام الحيض', 'Durée des règles', 'Period Duration')}
                  </span>
                  <select
                    value={periodDays}
                    onChange={(e) => setPeriodDays(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  >
                    {[3, 4, 5, 6, 7].map((d) => (
                      <option key={d} value={d}>
                        {tr(language, `${d} أيام`, `${d} jours`, `${d} days`)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <button
                type="button"
                onClick={handleSaveNewCycle}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {cycleSavedFeedback
                    ? tr(language, 'تم تسجيل الدورة ✓', 'Cycle enregistré ✓', 'Cycle Saved ✓')
                    : tr(language, 'حفظ الدورة في السجل', 'Enregistrer ce cycle', 'Save Cycle')}
                </span>
              </button>
            </div>
          </div>

          {/* Monthly Color-Coded Ovulation & Cycle Calendar */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 transition-colors">
            {/* Calendar Header & Month Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    {tr(
                      language,
                      'تقويم الدورة الشهرية وفرص الإباضة',
                      'Calendrier mensuel du cycle & ovulation',
                      'Monthly Cycle & Ovulation Calendar'
                    )}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {tr(
                    language,
                    'اضغط على أي يوم لمعرفة تفاصيل المرحلة وتقدير إمكانية الحمل.',
                    'Cliquez sur un jour du mois pour consulter les détails de la phase.',
                    'Click any day of the month to inspect its phase details.'
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleGoToday}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-teal-400 transition-colors cursor-pointer"
                >
                  {tr(language, 'اليوم', "Aujourd'hui", 'Today')}
                </button>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={isAr ? handleNextMonth : handlePrevMonth}
                    aria-label={tr(language, 'الشهر السابق', 'Mois précédent', 'Previous month')}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 min-w-[120px] text-center">
                    {monthLabel}
                  </span>
                  <button
                    type="button"
                    onClick={isAr ? handlePrevMonth : handleNextMonth}
                    aria-label={tr(language, 'الشهر التالي', 'Mois suivant', 'Next month')}
                    className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Color Legend */}
            <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-md bg-emerald-500 border border-emerald-600 inline-block shrink-0" />
                <span className="font-bold text-emerald-800 dark:text-emerald-300">
                  {tr(
                    language,
                    'أخضر: إمكانية الحمل (الخصوبة والتبويض)',
                    'Vert : Possibilité de tomber enceinte (fenêtre fertile & ovulation)',
                    'Green: Fertility & ovulation window'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-md bg-red-500 border border-red-600 inline-block shrink-0" />
                <span className="font-bold text-red-700 dark:text-red-300">
                  {tr(
                    language,
                    'أحمر: أيام الدورة الشهرية (الحيض)',
                    'Rouge : Jours du cycle (règles)',
                    'Red: Menstrual period days'
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-4 rounded-md bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 inline-block shrink-0" />
                <span className="font-semibold text-slate-600 dark:text-slate-300">
                  {tr(language, 'عادي: بقية أيام الشهر', 'Normal : Reste du mois', 'Regular: Rest of month')}
                </span>
              </div>
            </div>

            {/* Weekday Header Row */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
              {weekdays.map((dayName) => (
                <div
                  key={dayName}
                  className="text-[11px] sm:text-xs font-extrabold text-slate-500 dark:text-slate-400 py-1.5"
                >
                  {dayName}
                </div>
              ))}
            </div>

            {/* Monthly Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2" role="grid" aria-label={monthLabel}>
              {calendarCells.map((cell) => {
                const isSelected = cell.dateStr === selectedDateStr;
                const isToday = cell.dateStr === todayStr;

                let cellClasses =
                  'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 hover:border-slate-400';

                if (cell.phase === 'period') {
                  cellClasses =
                    'bg-red-100 dark:bg-red-950/75 border-red-300 dark:border-red-700 text-red-900 dark:text-red-100 hover:border-red-500';
                } else if (cell.phase === 'fertile') {
                  cellClasses = cell.isOvulationDay
                    ? 'bg-emerald-600 dark:bg-emerald-600 border-emerald-700 dark:border-emerald-400 text-white shadow-sm hover:bg-emerald-700'
                    : 'bg-emerald-100 dark:bg-emerald-950/75 border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-100 hover:border-emerald-500';
                }

                return (
                  <button
                    key={cell.dateStr}
                    type="button"
                    onClick={() => setSelectedDateStr(cell.dateStr)}
                    aria-label={`${cell.dateStr} - ${cell.phase}`}
                    className={`relative flex flex-col items-center justify-between p-1.5 sm:p-2.5 min-h-[54px] sm:min-h-[68px] rounded-xl sm:rounded-2xl border transition-all cursor-pointer ${cellClasses} ${
                      !cell.inCurrentMonth ? 'opacity-35' : ''
                    } ${
                      isSelected
                        ? 'ring-2 ring-offset-1 ring-slate-900 dark:ring-white dark:ring-offset-slate-900 scale-[1.02]'
                        : ''
                    }`}
                  >
                    <div className="w-full flex items-center justify-between text-[10px]">
                      <span
                        className={`font-mono ${
                          cell.isOvulationDay
                            ? 'text-emerald-100'
                            : cell.phase === 'period'
                            ? 'text-red-700 dark:text-red-300'
                            : cell.phase === 'fertile'
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {tr(language, `ي${cell.cycleDayNumber}`, `J${cell.cycleDayNumber}`, `D${cell.cycleDayNumber}`)}
                      </span>
                      {isToday && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            cell.isOvulationDay ? 'bg-white' : 'bg-teal-600 dark:bg-teal-400'
                          }`}
                          title={tr(language, 'اليوم', "Aujourd'hui", 'Today')}
                        />
                      )}
                    </div>

                    <span className="text-sm sm:text-base font-black leading-none my-0.5">
                      {cell.dayOfMonth}
                    </span>

                    <div className="h-3 flex items-center justify-center">
                      {cell.phase === 'period' && (
                        <Droplets className="w-3 h-3 text-red-600 dark:text-red-300" />
                      )}
                      {cell.phase === 'fertile' && cell.isOvulationDay && (
                        <span className="text-[9px] font-extrabold tracking-tight">
                          {tr(language, 'إباضة', 'Ovul.', 'Ovul.')}
                        </span>
                      )}
                      {cell.phase === 'fertile' && !cell.isOvulationDay && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Day Detail & Phase Explanation */}
            <div
              className={`rounded-2xl p-4 border transition-colors ${
                selectedDayInfo.phase === 'period'
                  ? 'bg-red-50/90 dark:bg-red-950/40 border-red-200 dark:border-red-900/60'
                  : selectedDayInfo.phase === 'fertile'
                  ? 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60'
                  : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span dir="ltr" className="font-mono font-black text-sm text-slate-900 dark:text-slate-100">
                    {selectedDateStr}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-white/80 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 border border-slate-200/70 dark:border-slate-700">
                    {tr(
                      language,
                      `اليوم ${selectedDayInfo.cycleDayNumber} من الدورة`,
                      `Jour ${selectedDayInfo.cycleDayNumber} du cycle`,
                      `Cycle Day ${selectedDayInfo.cycleDayNumber}`
                    )}
                  </span>
                </div>

                <span
                  className={`text-xs font-extrabold px-2.5 py-1 rounded-lg self-start ${
                    selectedDayInfo.phase === 'period'
                      ? 'bg-red-600 text-white'
                      : selectedDayInfo.phase === 'fertile'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {selectedDayInfo.phase === 'period'
                    ? tr(language, '🔴 أيام الدورة الشهرية (الحيض)', '🔴 Jours des règles (cycle)', '🔴 Menstrual Period')
                    : selectedDayInfo.isOvulationDay
                    ? tr(language, '🟢 ذروة التبويض — أعلى احتمال للحمل', '🟢 Jour d’ovulation — Pic de fertilité', '🟢 Ovulation Day — Peak Fertility')
                    : selectedDayInfo.phase === 'fertile'
                    ? tr(language, '🟢 نافذة الخصوبة — إمكانية الحمل', '🟢 Période fertile — Possibilité de grossesse', '🟢 Fertile Window')
                    : tr(language, '⚪ يوم عادي من الشهر', '⚪ Jour normal du mois', '⚪ Regular Cycle Day')}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {selectedDayInfo.phase === 'period'
                  ? tr(
                      language,
                      'هذه الفترة تمثل أيام الحيض وبداية دورة جديدة (عادة من اليوم 1 إلى اليوم 5). فرص حدوث الحمل في هذه الأيام منخفضة جداً.',
                      'Ces jours correspondent aux règles (début du cycle, jours 1 à 5). La possibilité de concevoir pendant les règles est très faible.',
                      'These days represent menstrual bleeding (cycle start, days 1 to 5). Conception likelihood during this period is very low.'
                    )
                  : selectedDayInfo.isOvulationDay
                  ? tr(
                      language,
                      'هذا هو يوم الإباضة المقدر (قبل حوالي 14 يوماً من الدورة القادمة)، حيث تُطلق البويضة وتكون احتمالية حدوث الحمل في أعلى مستوياتها.',
                      'C’est le jour estimé de l’ovulation (environ 14 jours avant les prochaines règles) : l’ovule est libéré et la probabilité de tomber enceinte est maximale.',
                      'Estimated ovulation day (~14 days before the next period): an egg is released and the chance of conception is at its highest.'
                    )
                  : selectedDayInfo.phase === 'fertile'
                  ? tr(
                      language,
                      'تقع هذه الأيام ضمن النافذة الخصبة (من 4 أيام قبل الإباضة إلى يوم واحد بعدها)، وتبقى احتمالية الحمل مرتفعة لبقاء الحيوانات المنوية حية لعدة أيام.',
                      'Ce jour fait partie de la fenêtre fertile (4 jours avant l’ovulation jusqu’à 1 jour après) : les chances de grossesse sont élevées.',
                      'Within the fertile window (4 days before through 1 day after ovulation): conception likelihood remains elevated.'
                    )
                  : tr(
                      language,
                      'يوم عادي خارج فترة الحيض وفترة الإباضة المقدرة. تذكير: هذا التتبع استرشادي إحصائي ولا يغني عن الاستشارة الطبية أو وسائل التنظيم المعتمدة.',
                      'Jour normal en dehors des règles et de la fenêtre fertile estimée. Note : ce calendrier est indicatif et ne constitue pas une méthode de contraception fiable.',
                      'Regular day outside menstruation and the estimated fertile window. Note: this tracker is informational only and not a contraceptive method.'
                    )}
              </p>
            </div>

            {/* Educational 3-Phase Guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-red-50/60 dark:bg-red-950/30 border border-red-200/70 dark:border-red-900/50 space-y-1">
                <div className="text-xs font-extrabold text-red-800 dark:text-red-300">
                  {tr(language, '1. المرحلة الحمراء (الدورة)', '1. Jours rouges (Règles)', '1. Red Days (Period)')}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {tr(
                    language,
                    'تبدأ من اليوم الأول للنزيف وتمتد عادة 3 إلى 7 أيام، وتمثل بداية حساب الدورة الشهرية.',
                    'Débutent au 1er jour des saignements (3 à 7 jours) et marquent le jour 1 du cycle menstruel.',
                    'Begin on the first day of bleeding (3–7 days) and mark Day 1 of the menstrual cycle.'
                  )}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/50 space-y-1">
                <div className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                  {tr(language, '2. المرحلة الخضراء (الخصوبة والتبويض)', '2. Jours verts (Ovulation & Fertilité)', '2. Green Days (Ovulation & Fertility)')}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {tr(
                    language,
                    'تمتد ~6 أيام حول يوم التبويض (اليوم 14 قبل الدورة التالية)، وهي الأيام التي ترتفع فيها فرصة الحمل.',
                    'Environ 6 jours autour de l’ovulation (~14 j avant les règles suivantes) : période de possibilité de grossesse.',
                    'About 6 days around ovulation (~14 days before the next period): highest probability of conception.'
                  )}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
                <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200">
                  {tr(language, '3. الأيام العادية', '3. Jours normaux (Reste du mois)', '3. Regular Days (Rest of Month)')}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {tr(
                    language,
                    'بقية أيام الشهر قبل فترة الخصوبة وبعدها، وتكون فيها احتمالية الحمل منخفضة إحصائياً.',
                    'Le reste du mois (avant et après la fenêtre fertile) où la probabilité de conception est faible.',
                    'Remaining days before and after the fertile window, when conception probability is statistically low.'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-300">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {tr(
                  language,
                  'ملاحظة طبية: حساب الإباضة في التقويم يعتمد على متوسط طول الدورة المدخل، وقد يتغير موعد الإباضة الفعلي من شهر لآخر. استشيري طبيب النساء عند عدم انتظام الدورة.',
                  'Indication médicale : ces calculs reposent sur la régularité moyenne de votre cycle et peuvent varier chaque mois. Consultez un gynécologue en cas de cycle irrégulier.',
                  'Medical note: Ovulation estimates rely on average cycle length and may vary month to month. Consult a gynecologist if cycles are irregular.'
                )}
              </span>
            </div>
          </div>

          {/* Recent Cycle Entries */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              {tr(language, 'سجل الدورات السابقة والأعراض', 'Historique des cycles enregistrés', 'Recorded Cycle History')}
            </h3>
            {activeMemberCycles.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tr(
                  language,
                  'لا توجد دورات مسجلة لهذا الملف بعد. يمكنك حفظ الدورة أعلاه.',
                  'Aucun cycle enregistré pour ce dossier. Utilisez le bouton ci-dessus pour en ajouter un.',
                  'No cycles recorded for this profile yet. Use the form above to save one.'
                )}
              </p>
            ) : (
              <div className="space-y-2">
                {activeMemberCycles.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex items-center flex-wrap gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                      <span dir="ltr" className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {c.startDate}
                        {c.endDate ? ` → ${c.endDate}` : ''}
                      </span>
                      <span className="text-red-700 dark:text-red-400 font-semibold">
                        {translateFlowIntensity(c.flowIntensity, language)}
                      </span>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      {localizeList(c.symptoms, language).join(', ')} {c.notes && `• ${localizeText(c.notes, language)}`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
