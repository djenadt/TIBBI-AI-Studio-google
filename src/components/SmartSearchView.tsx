import React, { useMemo, useState } from 'react';
import {
  Search,
  Pill,
  FlaskConical,
  FolderOpen,
  CalendarDays,
  Calendar,
  Clock,
  Sparkles,
  HeartPulse,
  AlertCircle,
  X,
} from 'lucide-react';
import { useTibbi } from '../context/TibbiContext';
import { tr } from '../types/tibbi';
import { filterSmartSearchResults } from '../utils/smartSearch';
import { localizeText } from '../utils/frTranslator';

export const SmartSearchView: React.FC = () => {
  const {
    language,
    activeMember,
    medications,
    labTests,
    documents,
    appointments,
    timelineEvents,
    vitals,
    setActiveTab,
  } = useTibbi();

  const isAr = language === 'ar';

  const [query, setQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const {
    matchedMeds,
    matchedLabs,
    matchedDocs,
    matchedAppointments,
    matchedTimeline,
    matchedVitals,
    totalMatches,
    hasActiveCriteria,
    invalidDateRange,
  } = useMemo(
    () =>
      filterSmartSearchResults({
        patientId: activeMember.id,
        query,
        dateFrom,
        dateTo,
        medications,
        labTests,
        documents,
        appointments,
        timelineEvents,
        vitals,
      }),
    [
      activeMember.id,
      query,
      dateFrom,
      dateTo,
      medications,
      labTests,
      documents,
      appointments,
      timelineEvents,
      vitals,
    ]
  );

  const hasDateFilter = Boolean(dateFrom || dateTo);

  const clearDates = () => {
    setDateFrom('');
    setDateTo('');
  };

  const clearAll = () => {
    setQuery('');
    setDateFrom('');
    setDateTo('');
  };

  const formatSearchCriteriaSummary = () => {
    const parts: string[] = [];
    if (query.trim()) {
      parts.push(`"${query.trim()}"`);
    }
    if (dateFrom && dateTo) {
      parts.push(tr(language, `من ${dateFrom} إلى ${dateTo}`, `du ${dateFrom} au ${dateTo}`, `from ${dateFrom} to ${dateTo}`));
    } else if (dateFrom) {
      parts.push(tr(language, `من تاريخ ${dateFrom}`, `à partir du ${dateFrom}`, `from ${dateFrom}`));
    } else if (dateTo) {
      parts.push(tr(language, `حتى تاريخ ${dateTo}`, `jusqu’au ${dateTo}`, `up to ${dateTo}`));
    }
    return parts.join(' • ');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Search className="w-7 h-7 text-teal-600 dark:text-teal-400" />
          <span>{tr(language, 'محرك البحث الذكي في الذاكرة الصحية', 'Recherche Intelligente dans le Dossier', 'Smart Health Memory Search')}</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {tr(
            language,
            `ابحث في جميع وصفات، تحاليل، مواعيد وأدوية المريض: ${activeMember.fullNameAr} بالكلمات المفتاحية أو الفترة الزمنية.`,
            `Recherchez instantanément parmi les ordonnances, bilans, examens et médecins de ${activeMember.fullNameFr} par mot-clé ou période.`,
            `Instantly search prescriptions, labs, exams, doctors, and vitals for ${activeMember.fullNameFr} by keyword or date range.`
          )}
        </p>
      </div>

      {/* Unified Search Bar + Date Range Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-4 shadow-xs space-y-3.5">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label={tr(language, 'كلمة البحث', 'Mot-clé de recherche', 'Search keyword')}
            placeholder={tr(
              language,
              'ابحث باسم دواء (Coversyl...)، تحليل (سكر الدم، NFS...)، اسم طبيب (بوجمعة...) أو مخبر...',
              'Rechercher par médicament, analyse, médecin, laboratoire...',
              'Search by medication, lab test, doctor, or laboratory...'
            )}
            className="w-full p-3.5 pr-11 pl-16 rounded-xl border-2 border-teal-200 dark:border-slate-700 focus:border-teal-500 dark:focus:border-teal-400 focus:outline-hidden text-sm bg-slate-50/50 dark:bg-slate-950/60 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
          />
          <Search
            className={`w-5 h-5 text-teal-600 dark:text-teal-400 absolute top-1/2 -translate-y-1/2 ${
              isAr ? 'right-3.5' : 'left-3.5'
            }`}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className={`text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold absolute top-1/2 -translate-y-1/2 ${
                isAr ? 'left-3.5' : 'right-3.5'
              } cursor-pointer px-1.5 py-1 rounded-md`}
            >
              {tr(language, 'مسح', 'Effacer', 'Clear')}
            </button>
          )}
        </div>

        {/* Date Range Filter Row (From .. To ..) */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 shrink-0">
            <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>{tr(language, 'البحث بالتاريخ:', 'Filtrer par date :', 'Filter by date:')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 min-h-[42px]">
              <label
                htmlFor="smart-search-date-from"
                className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0"
              >
                {tr(language, 'من', 'Du', 'From')}
              </label>
              <input
                id="smart-search-date-from"
                type="date"
                dir="ltr"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full bg-transparent text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden dark:[color-scheme:dark]"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 min-h-[42px]">
              <label
                htmlFor="smart-search-date-to"
                className="text-xs font-bold text-slate-500 dark:text-slate-400 shrink-0"
              >
                {tr(language, 'إلى', 'Au', 'To')}
              </label>
              <input
                id="smart-search-date-to"
                type="date"
                dir="ltr"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full bg-transparent text-xs font-mono font-bold text-slate-800 dark:text-slate-100 focus:outline-hidden dark:[color-scheme:dark]"
              />
            </div>
          </div>

          {(hasDateFilter || query.trim()) && (
            <div className="flex items-center gap-2 shrink-0">
              {hasDateFilter && (
                <button
                  type="button"
                  onClick={clearDates}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{tr(language, 'مسح التاريخ', 'Effacer dates', 'Clear dates')}</span>
                </button>
              )}
              {hasDateFilter && query.trim() && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 cursor-pointer transition-colors"
                >
                  <span>{tr(language, 'مسح الكل', 'Tout effacer', 'Clear all')}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Invalid Date Range Alert */}
      {invalidDateRange && (
        <div
          role="alert"
          className="flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-200 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/70 px-4 py-3 rounded-xl"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>
            {tr(
              language,
              'تاريخ البداية (من) يجب أن يكون أقدم من أو مساوياً لتاريخ النهاية (إلى).',
              'La date de début doit être antérieure ou égale à la date de fin.',
              'Start date (From) must be earlier than or equal to end date (To).'
            )}
          </span>
        </div>
      )}

      {/* Suggested Quick Searches & Glossary (shown when no text or date criteria active) */}
      {!hasActiveCriteria && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block">
            {tr(language, 'عمليات بحث مقترحة وسريعة:', 'Recherches suggérées :', 'Suggested quick searches:')}
          </span>
          <div className="flex flex-wrap gap-2">
            {tr(
              language,
              ['Coversyl', 'ضغط الدم', 'Glycémie', 'كوليسترول', 'د. كريم بوجمعة', 'مخبر ابن رشد', 'أشعة صدى', 'تلقيح'],
              ['Coversyl', 'HTA', 'Glycémie', 'Cholestérol', 'Dr Karim Boudjemaa', 'Ibn Rochd', 'Échographie', 'PEV'],
              ['Coversyl', 'Blood pressure', 'Glucose', 'Cholesterol', 'Dr Karim Boudjemaa', 'Ibn Rochd', 'Ultrasound', 'PEV']
            ).map(
              (tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-800 dark:hover:text-teal-300 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                >
                  🔍 {tag}
                </button>
              )
            )}
          </div>

          {/* Medical Acronyms & Terminology Guide (HTA, PEV, HbA1c, ECG, SAMU, PAI, IMC) */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                {tr(
                  language,
                  'دليل الاختصارات والمصطلحات الطبية المتداولة (Glossaire Médical):',
                  'Guide des sigles & abréviations médicales :',
                  'Medical Acronyms & Terminology Guide:'
                )}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {[
                {
                  code: 'HTA',
                  ar: 'ارتفاع ضغط الدم الشرياني',
                  fr: 'Hypertension Artérielle',
                  en: 'Arterial Hypertension',
                  desc: tr(
                    language,
                    'قراءات ضغط الدم الانقباضي/الانبساطي فوق 140/90 مم زئبق.',
                    'Pression artérielle supérieure à 140/90 mmHg.',
                    'Blood pressure readings above 140/90 mmHg.'
                  ),
                },
                {
                  code: 'PEV',
                  ar: 'البرنامج الموسع للتلقيح',
                  fr: 'Programme Élargi de Vaccination',
                  en: 'Expanded Immunization Program',
                  desc: tr(
                    language,
                    'الرزنامة الوطنية الرسمية لتلقيحات الرضع والأطفال بالجزائر.',
                    'Calendrier vaccinal national officiel de l’Algérie.',
                    'Official national pediatric immunization schedule in Algeria.'
                  ),
                },
                {
                  code: 'HbA1c',
                  ar: 'الهيموغلوبين السكري (التراكمي)',
                  fr: 'Hémoglobine Glyquée (Glycée)',
                  en: 'Glycated Hemoglobin (A1c)',
                  desc: tr(
                    language,
                    'مؤشر مراقبة توازن السكر في الدم على مدى الأشهر الثلاثة الأخيرة.',
                    'Reflet de l’équilibre glycémique sur 3 mois (cible < 6.5%).',
                    '3-month average blood glucose control indicator (target < 6.5%).'
                  ),
                },
                {
                  code: 'ECG',
                  ar: 'تخطيط كهربائية القلب',
                  fr: 'Électrocardiogramme',
                  en: 'Electrocardiogram',
                  desc: tr(
                    language,
                    'تسجيل النشاط الكهربائي لنبضات القلب والبحث عن أي اضطراب أو نقص تروية.',
                    'Tracé électrique analysant le rythme sinusal et l’ischémie.',
                    'Electrical tracing analyzing sinus rhythm and cardiac ischemia.'
                  ),
                },
                {
                  code: 'SAMU',
                  ar: 'مصلحة المساعدة الطبية المستعجلة',
                  fr: 'Service d’Aide Médicale Urgente',
                  en: 'Emergency Medical Assistance Service',
                  desc: tr(
                    language,
                    'فرق الإسعاف الطبي والإنعاش التابعة للمستشفيات الجامعية (تختلف أرقامها محلياً).',
                    'Unités médicalisées mobiles hospitalières.',
                    'Hospital-based mobile medical emergency and resuscitation units.'
                  ),
                },
                {
                  code: 'PAI',
                  ar: 'مشروع الاستقبال الفردي المدرسي',
                  fr: 'Projet d’Accueil Individualisé',
                  en: 'Individualized Healthcare Plan',
                  desc: tr(
                    language,
                    'وثيقة تنظيمية مدرسية لرعاية الأطفال المصابين بالربو أو الحساسية.',
                    'Protocole médical d’accueil scolaire (asthme, allergies).',
                    'School medical care protocol for children with asthma or allergies.'
                  ),
                },
                {
                  code: 'IMC / BMI',
                  ar: 'مؤشر كتلة الجسم',
                  fr: 'Indice de Masse Corporelle',
                  en: 'Body Mass Index',
                  desc: tr(
                    language,
                    'الوزن (كغ) مقسوماً على مربع الطول (م)، والمعدل الطبيعي بين 18.5 و 24.9.',
                    'Poids (kg) / Taille² (m). Zone normale : 18.5 à 24.9.',
                    'Weight (kg) / Height² (m). Normal range: 18.5 to 24.9.'
                  ),
                },
              ].map((item) => (
                <button
                  type="button"
                  key={item.code}
                  onClick={() => setQuery(item.code)}
                  className="text-start p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500 cursor-pointer shadow-2xs transition-all text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md">
                      {item.code}
                    </span>
                    <span className="text-[10px] text-slate-400">{tr(language, 'بحث سريع ↵', 'Rechercher ↵', 'Quick search ↵')}</span>
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-100">
                    {tr(language, item.ar, item.fr, item.en)}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {hasActiveCriteria && !invalidDateRange && (
        <div className="space-y-5">
          <div
            data-testid="smart-search-summary"
            className="text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-3.5 py-2.5 rounded-xl border border-teal-200 dark:border-teal-800/60"
          >
            {tr(
              language,
              `تم العثور على ${totalMatches} نتائج مطابقة (${formatSearchCriteriaSummary()})`,
              `${totalMatches} résultat(s) (${formatSearchCriteriaSummary()})`,
              `${totalMatches} result(s) found (${formatSearchCriteriaSummary()})`
            )}
          </div>

          {totalMatches === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {tr(
                  language,
                  'لم يتم العثور على أي سجلات طبية مطابقة لمعايير البحث والتاريخ المحددة.',
                  'Aucun résultat trouvé pour ces critères.',
                  'No matching medical records found for these criteria.'
                )}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Matched Medications */}
              {matchedMeds.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-extrabold text-sm text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{tr(language, `الأدوية والعلاجات (${matchedMeds.length})`, `Médicaments (${matchedMeds.length})`, `Medications (${matchedMeds.length})`)}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedMeds.map((m) => (
                      <button
                        type="button"
                        key={m.id}
                        onClick={() => setActiveTab('medications')}
                        className="text-start bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-400 transition-all cursor-pointer shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{localizeText(m.name, language)}</div>
                          <span dir="ltr" className="text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                            {m.startDate}
                          </span>
                        </div>
                        <div className="text-xs text-amber-800 dark:text-amber-300 font-semibold mt-0.5">{localizeText(m.dosage, language)}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                          {tr(language, 'الطبيب:', 'Médecin :', 'Doctor:')} {localizeText(m.prescribingDoctor, language)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Lab Tests */}
              {matchedLabs.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-extrabold text-sm text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{tr(language, `التحاليل والفحوصات (${matchedLabs.length})`, `Analyses (${matchedLabs.length})`, `Lab Tests (${matchedLabs.length})`)}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedLabs.map((l) => (
                      <button
                        type="button"
                        key={l.id}
                        onClick={() => setActiveTab('labs')}
                        className="text-start bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-400 transition-all cursor-pointer shadow-2xs flex justify-between items-center gap-3"
                      >
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{localizeText(l.testName, language)}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            <span dir="ltr" className="font-mono">{l.date}</span> • {localizeText(l.laboratory, language)}
                          </div>
                        </div>
                        <div dir="ltr" className="font-mono font-bold text-base text-blue-700 dark:text-blue-400 shrink-0">
                          {l.value} {l.unit}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Vitals */}
              {matchedVitals.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-extrabold text-sm text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <span>{tr(language, `القياسات والمؤشرات (${matchedVitals.length})`, `Constantes vitales (${matchedVitals.length})`, `Vitals & Metrics (${matchedVitals.length})`)}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedVitals.map((v) => (
                      <button
                        type="button"
                        key={v.id}
                        onClick={() => setActiveTab('vitals')}
                        className="text-start bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-rose-400 dark:hover:border-rose-400 transition-all cursor-pointer shadow-2xs space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span dir="ltr" className="font-mono font-bold text-xs text-rose-700 dark:text-rose-300">
                            {v.date} • {v.time}
                          </span>
                          {v.systolicBp !== undefined && v.diastolicBp !== undefined && (
                            <span dir="ltr" className="font-mono font-extrabold text-sm text-slate-900 dark:text-slate-100">
                              {v.systolicBp}/{v.diastolicBp} mmHg
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-600 dark:text-slate-300">
                          {v.heartRate !== undefined && <span>{v.heartRate} BPM</span>}
                          {v.bloodGlucose !== undefined && <span>{v.bloodGlucose} g/L</span>}
                          {v.weightKg !== undefined && <span>{v.weightKg} kg</span>}
                        </div>
                        {v.notes && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{localizeText(v.notes, language)}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Documents */}
              {matchedDocs.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-extrabold text-sm text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
                    <FolderOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>{tr(language, `الأرشيف والوثائق (${matchedDocs.length})`, `Documents (${matchedDocs.length})`, `Documents (${matchedDocs.length})`)}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedDocs.map((d) => (
                      <button
                        type="button"
                        key={d.id}
                        onClick={() => setActiveTab('archive')}
                        className="text-start bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-400 transition-all cursor-pointer shadow-2xs"
                      >
                        <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{localizeText(d.title, language)}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{localizeText(d.doctorName || d.facility, language)}</div>
                        <div dir="ltr" className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1 inline-block">
                          {d.date}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Appointments */}
              {matchedAppointments.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-extrabold text-sm text-violet-900 dark:text-violet-300 flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                    <span>{tr(language, `المواعيد والزيارات (${matchedAppointments.length})`, `Rendez-vous (${matchedAppointments.length})`, `Appointments (${matchedAppointments.length})`)}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedAppointments.map((a) => (
                      <button
                        type="button"
                        key={a.id}
                        onClick={() => setActiveTab('appointments')}
                        className="text-start bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-violet-400 dark:hover:border-violet-400 transition-all cursor-pointer shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{localizeText(a.doctorName, language)}</div>
                          <span dir="ltr" className="text-[11px] font-mono text-violet-700 dark:text-violet-300 shrink-0">
                            {a.date} • {a.time}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{localizeText(a.specialty, language)} • {localizeText(a.clinicName, language)}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{localizeText(a.reason, language)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Timeline Events */}
              {matchedTimeline.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-extrabold text-sm text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>{tr(language, `الخط الزمني الصحي (${matchedTimeline.length})`, `Chronologie médicale (${matchedTimeline.length})`, `Medical Timeline (${matchedTimeline.length})`)}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedTimeline.map((t) => (
                      <button
                        type="button"
                        key={t.id}
                        onClick={() => setActiveTab('timeline')}
                        className="text-start bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-400 transition-all cursor-pointer shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{localizeText(t.title, language)}</div>
                          <span dir="ltr" className="text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                            {t.date}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{localizeText(t.description, language)}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

