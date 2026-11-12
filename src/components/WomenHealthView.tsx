import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Calendar,
  Baby,
  Clock,
  Activity,
  Plus,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserCheck,
} from 'lucide-react';
import { useTibbi } from '../context/TibbiContext';
import {
  calculatePregnancyWeek,
  calculateDueDate,
  calculateFertileWindow,
} from '../utils/healthCalculators';

export const WomenHealthView: React.FC = () => {
  const {
    language,
    activeMember,
    familyMembers,
    setActiveMemberId,
    activeMemberCycles,
    addMenstrualCycle,
    updateFamilyMember,
    setActiveTab,
  } = useTibbi();

  const isAr = language === 'ar';

  // Check if active member is female
  const isFemale = activeMember.gender === 'female';
  // Check if any other female in family (e.g. Meriem)
  const motherMember = familyMembers.find((m) => m.gender === 'female');

  const [isPregnantState, setIsPregnantState] = useState<boolean>(
    Boolean(activeMember.isPregnant)
  );
  const [lmpDate, setLmpDate] = useState<string>(
    activeMember.pregnancyLmpDate || '2026-05-18'
  );

  const [cycleStartDate, setCycleStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [cycleDays, setCycleDays] = useState(28);

  // Pregnancy calculations
  const pregnancyData = calculatePregnancyWeek(lmpDate);
  const dueDate = calculateDueDate(lmpDate);

  // Fertile window calculations
  const latestCycle = activeMemberCycles[0];
  const fertileInfo = calculateFertileWindow(
    latestCycle ? latestCycle.startDate : cycleStartDate,
    cycleDays
  );

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

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-pink-600 dark:text-pink-400" />
            <span>{isAr ? 'صحة المرأة ومتابعة الحمل' : 'Santé Féminine & Suivi de Grossesse'}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? `فضاء خاص بصحة المرأة: ${activeMember.fullNameAr} - متابعة الدورة الشهرية، تقدير أيام التبويض، ومتابعة الحمل أسبوعاً بأسبوع.`
              : `Espace dédié à ${activeMember.fullNameFr} - Cycle menstruel, ovulation et suivi de grossesse.`}
          </p>
        </div>

        {/* If current member is not female, offer quick switch to Mother (Meriem) */}
        {!isFemale && motherMember && (
          <button
            onClick={() => setActiveMemberId(motherMember.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-900/60 text-pink-800 dark:text-pink-300 text-xs font-bold hover:bg-pink-100 dark:hover:bg-pink-900/60 transition-colors cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-pink-600 dark:text-pink-400" />
            <span>{isAr ? `التبديل إلى ملف ${motherMember.fullNameAr}` : `Basculer sur ${motherMember.fullNameFr}`}</span>
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
          <span>{isAr ? 'وضع متابعة الحمل' : 'Suivi de grossesse'}</span>
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
          <span>{isAr ? 'متابعة الدورة والتبويض' : 'Cycle & Ovulation'}</span>
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
                  {isAr ? `الثلث ${pregnancyData.trimester === 1 ? 'الأول' : pregnancyData.trimester === 2 ? 'الثاني' : 'الثالث'} من الحمل` : `${pregnancyData.trimester}ème Trimestre`}
                </span>
                
                <h3 className="text-3xl md:text-4xl font-black">
                  {isAr ? `الأسبوع ${pregnancyData.weeks} من الحمل` : `Semaine ${pregnancyData.weeks} de grossesse`}
                </h3>

                <p className="text-pink-100 text-sm leading-relaxed">
                  {isAr
                    ? `تاريخ آخر دورة طمثية (LMP): ${lmpDate} • موعد الولادة المتوقع بإذن الله: ${dueDate}`
                    : `Date des dernières règles : ${lmpDate} • Terme prévu : ${dueDate}`}
                </p>
              </div>

              {/* Fetal Milestone Pill */}
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center space-y-1">
                <div className="text-3xl">🌽</div>
                <div className="text-xs font-bold text-white">
                  {isAr ? 'حجم الجنين الآن يماثل كوز الذرة' : 'Taille : env. épis de maïs'}
                </div>
                <div className="text-[11px] text-pink-200">
                  ~ 30 cm • 600g
                </div>
              </div>
            </div>

            {/* Gestational Progress Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-bold text-pink-100">
                <span>{isAr ? 'بداية الحمل' : 'Début'}</span>
                <span>{pregnancyData.progressPercent}% ({isAr ? `${pregnancyData.weeks} أسبوعاً` : `${pregnancyData.weeks} SA`})</span>
                <span>{isAr ? 'الولادة (40 أسبوعاً)' : 'Terme (40 SA)'}</span>
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
              <span className="text-pink-200 font-semibold">{isAr ? 'تعديل تاريخ آخر دورة (LMP):' : 'Modifier DDR :'}</span>
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
                  {isAr ? 'الثلث الأول (1 - 13 أسبوع)' : '1er Trimestre'}
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{isAr ? 'الفحوصات الأولية' : 'Bilan initial'}</h4>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                <li>{isAr ? 'فحص الدم وفصيلة الريزوس' : 'Groupe sanguin & Rhésus'}</li>
                <li>{isAr ? 'داء المقوسات والحصبة الألمانية' : 'Toxoplasmose & Rubéole'}</li>
                <li>{isAr ? 'أشعة الصدى الأولى (T1 Echo)' : 'Échographie du 1er trimestre'}</li>
                <li>{isAr ? 'حمض الفوليك وفيتامين D' : 'Acide folique'}</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-pink-300 dark:border-pink-800/80 ring-2 ring-pink-500/20 dark:ring-pink-500/10 shadow-xs space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/80 px-2 py-0.5 rounded-md border border-transparent dark:border-pink-800/40">
                  {isAr ? 'الثلث الحالي (14 - 27 أسبوع)' : '2ème Trimestre (Actuel)'}
                </span>
                <Activity className="w-4 h-4 text-pink-600 dark:text-pink-400 animate-pulse" />
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{isAr ? 'الأشعة المورفولوجية والسكري' : 'Écho morpho & HGPO'}</h4>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                <li className="font-bold text-slate-900 dark:text-slate-100">{isAr ? 'فحص الصدى المورفولوجي (الأسبوع 22)' : 'Échographie morphologique (22 SA)'}</li>
                <li>{isAr ? 'اختبار تحمل السكر للحامل (HGPO)' : 'Test de dépistage diabète gestationnel'}</li>
                <li>{isAr ? 'مراقبة ضغط الدم والوزن' : 'Surveillance tensionnelle'}</li>
                <li>{isAr ? 'مكملات الحديد والكالسيوم' : 'Supplémentation en fer'}</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-transparent dark:border-slate-700">
                  {isAr ? 'الثلث الثالث (28 - 40 أسبوع)' : '3ème Trimestre'}
                </span>
                <Clock className="w-4 h-4 text-slate-400 dark:text-slate-400" />
              </div>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{isAr ? 'التحضير للولادة' : 'Préparation terme'}</h4>
              <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
                <li>{isAr ? 'أشعة الصدى للثلث الثالث (T3)' : 'Échographie T3 de croissance'}</li>
                <li>{isAr ? 'استشارة طبيب التخدير' : 'Consultation anesthésie'}</li>
                <li>{isAr ? 'تجهيز حقيبة الولادة وملف المستشفى' : 'Valise de maternité'}</li>
                <li>{isAr ? 'تخطيط قلب الجنين الدوري' : 'Monitoring fœtal'}</li>
              </ul>
            </div>

          </div>

        </div>
      ) : (
        /* Menstrual Cycle and Ovulation Section */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase">{isAr ? 'الدورة المتوقعة القادمة' : 'Prochaines règles'}</span>
              <div className="text-xl font-black font-mono text-pink-600 dark:text-pink-400">
                {fertileInfo.nextPeriodDate}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? `طول الدورة المحسوب: ${cycleDays} يوماً` : `Durée du cycle : ${cycleDays} jours`}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase">{isAr ? 'يوم التبويض المقدر' : 'Ovulation estimée'}</span>
              <div className="text-xl font-black font-mono text-teal-700 dark:text-teal-400">
                {fertileInfo.ovulationDate}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? 'الذروة التقديرية للخصوبة' : 'Pic estimé de fertilité'}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase">{isAr ? 'النافذة الخصبة' : 'Fenêtre fertile'}</span>
              <div className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200">
                {fertileInfo.fertileStart} → {fertileInfo.fertileEnd}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? 'تقدير إحصائي ولا يُعد وسيلة منع حمل' : 'Indication prévisionnelle'}
              </p>
            </div>

          </div>

          {/* Recent Cycle Entries */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              {isAr ? 'سجل الدورات السابقة والأعراض' : 'Historique des cycles enregistrés'}
            </h3>
            <div className="space-y-2">
              {activeMemberCycles.map((c) => (
                <div key={c.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{c.startDate}</span>
                    {c.endDate && <span className="font-mono text-slate-500 dark:text-slate-400"> → {c.endDate}</span>}
                    <span className="mr-3 ml-3 text-pink-700 dark:text-pink-400 font-semibold">{c.flowIntensity}</span>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    {c.symptoms.join(', ')} {c.notes && `• ${c.notes}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
