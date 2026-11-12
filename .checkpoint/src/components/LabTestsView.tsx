import React, { useState, useMemo } from 'react';
import {
  FlaskConical,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Building,
  Trash2,
  X,
  Activity,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  Layers,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { useTibbi } from '../context/TibbiContext';
import { LabTest, LabCategory } from '../types/tibbi';
import { evaluateLabValue } from '../utils/healthCalculators';

// Helper to translate medical notes to French with clinical precision
function translateLabNote(note: string | undefined, isAr: boolean): string {
  if (!note) return '';
  if (isAr) return note;

  if (note.includes('قيمة أولية مرتفعة') || note.includes('إنقاص الوزن')) {
    return "Valeur initiale modérément élevée, initiation d'un rééquilibrage alimentaire et perte pondérale.";
  }
  if (note.includes('تحسن ملحوظ') || note.includes('وجبات العشاء')) {
    return 'Amélioration notable après allègement des dîners et réduction des glucides rapides.';
  }
  if (note.includes('استقرار ممتاز') || note.includes('النطاق الطبيعي')) {
    return 'Excellente stabilisation dans la plage physiologique normale.';
  }
  if (note.includes('المشي المنتظم') || note.includes('مستوى منضبط')) {
    return 'Glycémie bien équilibrée avec pratique régulière de la marche.';
  }
  if (note.includes('دوري سنوي') || note.includes('مستقرة تماماً') || note.includes('طبيعية ومستقرة')) {
    return 'Bilan annuel de contrôle, résultat parfaitement normal et stable.';
  }
  if (note.includes('ارتفاع شحوم الدم') || note.includes('أوميغا 3')) {
    return 'Dyslipidémie modérée, prescription du régime méditerranéen et oméga 3.';
  }
  if (note.includes('استجابة أولية') || note.includes('انخفاض تدريجي')) {
    return 'Réponse thérapeutique initiale positive, baisse progressive du cholestérol.';
  }
  if (note.includes('زيت الزيتون') || note.includes('الأسماك')) {
    return "Poursuite de l'adhésion diététique (huile d'olive et poissons gras).";
  }
  if (note.includes('حمية البحر المتوسط وممارسة المشي')) {
    return "Légèrement supérieur à l'objectif, maintien du régime et marche quotidienne.";
  }
  if (note.includes('الهدف الوعائي') || note.includes('فوق الهدف')) {
    return 'LDL supérieur à la cible cardiovasculaire, surveillance rapprochée.';
  }
  if (note.includes('انخفاض مشجع')) {
    return 'Évolution favorable et encourageante vers la cible thérapeutique.';
  }
  if (note.includes('مريض الضغط') || note.includes('3 أشهر')) {
    return 'Légèrement au-dessus de la cible pour patient hypertendu, contrôle à 3 mois.';
  }
  if (note.includes('سليمة وطبيعية قبل بدء')) {
    return "Fonction rénale normale avant instauration de l'antihypertenseur.";
  }
  if (note.includes('ترشيح كبيبي سليم')) {
    return 'Excellente fonction rénale avec filtration glomérulaire conservée.';
  }
  if (note.includes('وظائف كلى ممتازة')) {
    return 'Excellente fonction rénale et clairance normale.';
  }
  if (note.includes('ما قبل السكري')) {
    return 'HbA1c en zone de prédiabète débutant, surveillance hygiéno-diététique.';
  }
  if (note.includes('عودة إلى المعدل الطبيعي')) {
    return 'Excellente régression vers les normes physiologiques.';
  }
  if (note.includes('تراكمي ممتاز') || note.includes('تراكمي مثالي')) {
    return 'HbA1c optimale et parfaitement stabilisée sur les 3 derniers mois.';
  }
  if (note.includes('بداية الحمل') || note.includes('الأسبوع 6')) {
    return 'Bilan initial de grossesse (6 SA), numération formule sanguine normale.';
  }
  if (note.includes('الثلث الأول')) {
    return "Suivi du premier trimestre, taux d'hémoglobine satisfaisant.";
  }
  if (note.includes('الثلث الثاني') && note.includes('فقر دم')) {
    return "Bilan du 2ème trimestre, absence d'anémie malgré l'hémodilution physiologique.";
  }
  if (note.includes('مخزون حديد أولي')) {
    return 'Réserves martiales initiales optimales avant le pic de consommation fœtale.';
  }
  if (note.includes('استهلاك الجنين') || note.includes('تارديفيرون B9')) {
    return 'Majoration des besoins fœtaux en fer, supplémentation par Tardyféron B9.';
  }
  if (note.includes('تفادي فقر دم الثلث الثالث') || note.includes('تارديفيرون')) {
    return 'Taux satisfaisant, maintien de la supplémentation préventive du 3ème trimestre.';
  }
  if (note.includes('Séronégative') || note.includes('المقوسات')) {
    return 'Séronégative : lavage strict des crudités, cuisson complète des viandes et contrôle mensuel.';
  }

  return note;
}

// Helper to extract clean bilingual name for tests
function cleanBiomarkerName(name: string, isAr: boolean): { display: string; short: string; key: string } {
  const match = name.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    const arPart = match[1].trim();
    const frPart = match[2].trim();
    return {
      display: isAr ? name : frPart,
      short: isAr ? arPart : frPart,
      key: frPart.toLowerCase(),
    };
  }
  return {
    display: name,
    short: name,
    key: name.toLowerCase(),
  };
}

export const LabTestsView: React.FC = () => {
  const {
    language,
    theme,
    activeMember,
    activeMemberLabTests,
    addLabTest,
    deleteLabTest,
    setActiveTab,
  } = useTibbi();

  const isAr = language === 'ar';
  const isDark = theme === 'dark';

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedBiomarkerKey, setSelectedBiomarkerKey] = useState<string>('');
  const [chartType, setChartType] = useState<'area' | 'line'>('area');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [form, setForm] = useState({
    testName: '',
    category: 'biochimie' as LabCategory,
    value: '',
    unit: 'g/L',
    referenceMin: '',
    referenceMax: '',
    date: new Date().toISOString().split('T')[0],
    laboratory: '',
    prescribingDoctor: '',
    notes: '',
  });

  // Chart styling colors based on current theme
  const chartTheme = useMemo(() => {
    return {
      grid: isDark ? '#1e293b' : '#f1f5f9', // slate-800 vs slate-100
      axisText: isDark ? '#94a3b8' : '#64748b', // slate-400 vs slate-500
      tooltipBg: isDark ? '#0f172a' : '#ffffff', // slate-900 vs white
      tooltipBorder: isDark ? '#334155' : '#e2e8f0', // slate-700 vs slate-200
      primary: '#0d9488', // teal-600
      primaryLight: '#14b8a6', // teal-500
      gradientStart: isDark ? 'rgba(13, 148, 136, 0.45)' : 'rgba(13, 148, 136, 0.25)',
      gradientEnd: isDark ? 'rgba(13, 148, 136, 0.0)' : 'rgba(13, 148, 136, 0.01)',
      normalRef: isDark ? '#10b981' : '#059669', // emerald
      abnormalRef: isDark ? '#f59e0b' : '#d97706', // amber
      safeAreaFill: isDark ? 'rgba(16, 185, 129, 0.07)' : 'rgba(16, 185, 129, 0.08)',
    };
  }, [isDark]);

  // Group lab tests by biomarker key for longitudinal tracking
  const biomarkerGroups = useMemo(() => {
    const groups = new Map<
      string,
      {
        key: string;
        nameAr: string;
        nameFr: string;
        fullName: string;
        category: LabCategory;
        unit: string;
        referenceMin?: number;
        referenceMax?: number;
        tests: LabTest[];
      }
    >();

    activeMemberLabTests.forEach((test) => {
      const { short, key } = cleanBiomarkerName(test.testName, isAr);
      const match = test.testName.match(/^(.*?)\s*\((.*?)\)$/);
      const nameAr = match ? match[1].trim() : test.testName;
      const nameFr = match ? match[2].trim() : test.testName;

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          nameAr,
          nameFr,
          fullName: test.testName,
          category: test.category,
          unit: test.unit,
          referenceMin: test.referenceMin,
          referenceMax: test.referenceMax,
          tests: [],
        });
      }

      const grp = groups.get(key)!;
      grp.tests.push(test);
      if (test.referenceMin !== undefined) grp.referenceMin = test.referenceMin;
      if (test.referenceMax !== undefined) grp.referenceMax = test.referenceMax;
      if (test.unit) grp.unit = test.unit;
    });

    // Convert map to array and sort tests chronologically (oldest to newest)
    const result = Array.from(groups.values()).map((grp) => ({
      ...grp,
      tests: [...grp.tests].sort((a, b) => a.date.localeCompare(b.date)),
    }));

    // Sort groups by tests count descending (so biomarkers with timeline come first)
    return result.sort((a, b) => b.tests.length - a.tests.length);
  }, [activeMemberLabTests, isAr]);

  // Determine currently active biomarker group for charts
  const activeBiomarker = useMemo(() => {
    if (!biomarkerGroups.length) return null;
    if (selectedBiomarkerKey) {
      const found = biomarkerGroups.find((g) => g.key === selectedBiomarkerKey);
      if (found) return found;
    }
    // Default to the first group that has 2+ tests, or just first group
    const multi = biomarkerGroups.find((g) => g.tests.length > 1);
    return multi || biomarkerGroups[0];
  }, [biomarkerGroups, selectedBiomarkerKey]);

  // Prepare chronological chart data for Recharts
  const chartData = useMemo(() => {
    if (!activeBiomarker) return [];

    return activeBiomarker.tests.map((t) => {
      const evaluation = evaluateLabValue(t.value, t.referenceMin, t.referenceMax);
      const parts = t.date.split('-');
      const formattedDate = `${parts[2]}/${parts[1]}/${parts[0].slice(2)}`; // DD/MM/YY
      const translatedNote = translateLabNote(t.notes, isAr);

      return {
        id: t.id,
        rawDate: t.date,
        date: formattedDate,
        fullDate: t.date,
        value: t.value,
        unit: t.unit,
        referenceMin: t.referenceMin,
        referenceMax: t.referenceMax,
        isAbnormal: t.isAbnormal || evaluation.status !== 'normal',
        evaluation,
        laboratory: t.laboratory,
        doctor: t.prescribingDoctor,
        notes: translatedNote,
      };
    });
  }, [activeBiomarker, isAr]);

  // Statistics & Evolution for active biomarker
  const biomarkerStats = useMemo(() => {
    if (!chartData.length) return null;

    const values = chartData.map((d) => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const avgVal = Math.round((values.reduce((acc, v) => acc + v, 0) / values.length) * 100) / 100;

    const latest = chartData[chartData.length - 1];
    const initial = chartData[0];
    const delta = Math.round((latest.value - initial.value) * 100) / 100;
    const deltaPercent = initial.value > 0 ? Math.round((delta / initial.value) * 100) : 0;

    return {
      count: chartData.length,
      latest,
      initial,
      minVal,
      maxVal,
      avgVal,
      delta,
      deltaPercent,
      isImproving:
        // For cholesterol / sugar, lower is better. For ferritin / hemoglobin, higher (if below max) is better.
        (activeBiomarker?.key.includes('chol') || activeBiomarker?.key.includes('glyc'))
          ? delta <= 0
          : delta >= 0,
    };
  }, [chartData, activeBiomarker]);

  // Filtered tests list for card view
  const filteredTests = activeMemberLabTests.filter((test) => {
    if (categoryFilter === 'all') return true;
    return test.category === categoryFilter;
  });

  const handleCreateLabTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.testName.trim() || !form.value) return;

    const numVal = parseFloat(form.value);
    const minRef = form.referenceMin ? parseFloat(form.referenceMin) : undefined;
    const maxRef = form.referenceMax ? parseFloat(form.referenceMax) : undefined;

    const evaluation = evaluateLabValue(numVal, minRef, maxRef);

    addLabTest({
      patientId: activeMember.id,
      testName: form.testName,
      category: form.category,
      value: numVal,
      unit: form.unit,
      referenceMin: minRef,
      referenceMax: maxRef,
      date: form.date,
      laboratory: form.laboratory || (isAr ? 'مخبر التحاليل الطبية' : 'Laboratoire d’analyses'),
      prescribingDoctor: form.prescribingDoctor,
      notes: form.notes,
      isAbnormal: evaluation.status !== 'normal',
    });

    setIsAddModalOpen(false);
    setForm({
      testName: '',
      category: 'biochimie',
      value: '',
      unit: 'g/L',
      referenceMin: '',
      referenceMax: '',
      date: new Date().toISOString().split('T')[0],
      laboratory: '',
      prescribingDoctor: '',
      notes: '',
    });
  };

  // Custom Recharts Tooltip for lab measurements
  const CustomLabTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    const isAbnormal = data.isAbnormal;

    return (
      <div
        className="rounded-2xl p-4 shadow-xl border backdrop-blur-md text-xs space-y-2 max-w-xs z-50 transition-all"
        style={{
          backgroundColor: chartTheme.tooltipBg,
          borderColor: chartTheme.tooltipBorder,
          color: isDark ? '#f1f5f9' : '#0f172a',
        }}
      >
        <div className="flex items-center justify-between border-b pb-2 gap-3" style={{ borderColor: chartTheme.grid }}>
          <div className="flex items-center gap-1.5 font-bold">
            <Calendar className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span>{data.fullDate}</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              isAbnormal
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
            }`}
          >
            {isAbnormal
              ? isAr ? data.evaluation.labelAr : data.evaluation.labelFr
              : isAr ? 'طبيعي وسوي' : 'Dans les normes'}
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {isAr ? 'النتيجة المقاسة:' : 'Valeur mesurée :'}
          </span>
          <div className="font-mono">
            <span className={`text-xl font-black ${isAbnormal ? 'text-amber-600 dark:text-amber-400' : 'text-teal-600 dark:text-teal-400'}`}>
              {data.value}
            </span>
            <span className="ml-1 text-slate-500 dark:text-slate-400 font-bold">{data.unit}</span>
          </div>
        </div>

        {data.referenceMin !== undefined && data.referenceMax !== undefined && (
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl">
            <span>{isAr ? 'المجال المرجعي:' : 'Norme réf. :'}</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
              {data.referenceMin} - {data.referenceMax} {data.unit}
            </span>
          </div>
        )}

        {data.laboratory && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{data.laboratory}</span>
          </div>
        )}

        {data.notes && (
          <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800/70 p-2 rounded-xl italic border border-slate-200/50 dark:border-slate-700/50">
            "{data.notes}"
          </p>
        )}
      </div>
    );
  };

  // Custom Dot component to highlight normal vs abnormal readings
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy) return null;
    const isAbnormal = payload.isAbnormal;

    return (
      <g>
        {isAbnormal ? (
          <>
            <circle cx={cx} cy={cy} r={7} fill="#f59e0b" fillOpacity={0.25} />
            <circle cx={cx} cy={cy} r={4.5} fill="#f59e0b" stroke="#ffffff" strokeWidth={1.5} />
          </>
        ) : (
          <circle cx={cx} cy={cy} r={4.5} fill="#0d9488" stroke="#ffffff" strokeWidth={1.5} />
        )}
      </g>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FlaskConical className="w-7 h-7 text-teal-600 dark:text-teal-400" />
            <span>{isAr ? 'متابعة التحاليل والفحوصات الطبية' : 'Suivi des Analyses Biologiques & Examens'}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? `سجل التحاليل المخبرية للمريض: ${activeMember.fullNameAr} - المقارنة الزمنية والمجالات المرجعية وتنبيهات القيم الشاذة.`
              : `Analyses médicales de ${activeMember.fullNameFr} - Évolution chronologique Recharts et valeurs cibles.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('archive')}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer shadow-2xs transition-colors"
          >
            <span>{isAr ? 'استخراج من ورقة مخبر (OCR)' : 'Scanner un bilan (OCR)'}</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? '+ تسجيل نتيجة تحليل' : '+ Ajouter une analyse'}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* INTERACTIVE RECHARTS LONGITUDINAL EVOLUTION SECTION                     */}
      {/* ========================================================================= */}
      {biomarkerGroups.length > 0 && activeBiomarker && (
        <section className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          
          {/* Header of Evolution Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                    {isAr ? 'تطور نتائج التحاليل عبر الزمن (Recharts)' : 'Évolution Chronologique des Biomarqueurs (Recharts)'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isAr
                      ? 'مخطط بياني تفاعلي يبرز مسار المؤشرات الحيوية مقارنة بالمجال المرجعي السوي'
                      : 'Suivi interactif de la cinétique biologique par rapport à la zone physiologique cible'}
                  </p>
                </div>
              </div>
            </div>

            {/* Chart Presentation Toggle */}
            <div className="flex items-center gap-2 self-start lg:self-auto">
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <button
                  onClick={() => setChartType('area')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    chartType === 'area'
                      ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <AreaChartIcon className="w-3.5 h-3.5" />
                  <span>{isAr ? 'مخطط المساحة' : 'Aire'}</span>
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    chartType === 'line'
                      ? 'bg-white dark:bg-slate-700 text-teal-700 dark:text-teal-300 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <LineChartIcon className="w-3.5 h-3.5" />
                  <span>{isAr ? 'مخطط خطي' : 'Ligne'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Biomarkers Selector Tabs / Pills */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {isAr ? 'اختر المؤشر المخبري لمشاهدة تطوره:' : 'Sélectionnez le biomarqueur à analyser :'}
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {biomarkerGroups.map((grp) => {
                const isSelected = grp.key === activeBiomarker.key;
                const displayName = isAr ? grp.nameAr : grp.nameFr;

                return (
                  <button
                    key={grp.key}
                    onClick={() => setSelectedBiomarkerKey(grp.key)}
                    className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{displayName}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                        isSelected
                          ? 'bg-teal-700 text-teal-100'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {grp.tests.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Key Summary Cards for Active Biomarker */}
          {biomarkerStats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              
              {/* Latest Value Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  {isAr ? 'آخر نتيجة مقاسة' : 'Dernière valeur'}
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span
                    className={`text-2xl font-black font-mono ${
                      biomarkerStats.latest.isAbnormal
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-teal-600 dark:text-teal-400'
                    }`}
                  >
                    {biomarkerStats.latest.value}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                    {activeBiomarker.unit}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                  <Calendar className="w-3 h-3" />
                  <span>{biomarkerStats.latest.fullDate}</span>
                </div>
              </div>

              {/* Evolution & Variation Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  {isAr ? 'التغير الكلي' : 'Évolution globale'}
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span
                    className={`text-2xl font-black font-mono flex items-center ${
                      biomarkerStats.delta <= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
                    }`}
                  >
                    {biomarkerStats.delta > 0 ? `+${biomarkerStats.delta}` : biomarkerStats.delta}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                    ({biomarkerStats.deltaPercent > 0 ? `+${biomarkerStats.deltaPercent}` : biomarkerStats.deltaPercent}%)
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-1 text-[10px] font-bold">
                  {biomarkerStats.delta <= 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                      <TrendingDown className="w-3 h-3" />
                      <span>{isAr ? 'انخفاض نحو الهدف' : 'Baisse favorable'}</span>
                    </span>
                  ) : (
                    <span className="text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" />
                      <span>{isAr ? 'ارتفاع تدريجي' : 'Hausse progressive'}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Reference Range Target Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  {isAr ? 'المجال المرجعي السوي' : 'Norme physiologique'}
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-lg font-black font-mono text-slate-800 dark:text-slate-200">
                    {activeBiomarker.referenceMin ?? 0} - {activeBiomarker.referenceMax ?? '--'}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                    {activeBiomarker.unit}
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{isAr ? 'النطاق المستهدف' : 'Zone cible'}</span>
                </div>
              </div>

              {/* Average & Readings Count Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  {isAr ? 'المتوسط الحسابي' : 'Moyenne calculée'}
                </span>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-black font-mono text-slate-800 dark:text-slate-200">
                    {biomarkerStats.avgVal}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                    {activeBiomarker.unit}
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                  <span>
                    {biomarkerStats.count} {isAr ? 'فحوصات مسجلة' : 'mesures au total'}
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* Interactive Recharts Canvas */}
          <div className="bg-slate-50/70 dark:bg-slate-950/50 rounded-2xl p-3 sm:p-5 border border-slate-200/70 dark:border-slate-800/70">
            
            {/* Chart Legend & Reference indicators */}
            <div className="flex flex-wrap items-center justify-between text-xs pb-3 mb-2 border-b border-slate-200/60 dark:border-slate-800/60 gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-teal-600" />
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {isAr ? activeBiomarker.nameAr : activeBiomarker.nameFr} ({activeBiomarker.unit})
                  </span>
                </div>
                {activeBiomarker.referenceMax !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-500" />
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {isAr ? 'الحد الأقصى' : 'Max réf.'}: {activeBiomarker.referenceMax}
                    </span>
                  </div>
                )}
                {activeBiomarker.referenceMin !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-500" />
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {isAr ? 'الحد الأدنى' : 'Min réf.'}: {activeBiomarker.referenceMin}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                <span>{isAr ? 'نقطة سويّة' : 'Normale'}</span>
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 ml-1" />
                <span>{isAr ? 'شاذة / تتطلب متابعة' : 'À surveiller'}</span>
              </div>
            </div>

            {/* Recharts Container */}
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                    <defs>
                      <linearGradient id="labBiomarkerGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartTheme.primary} stopOpacity={isDark ? 0.45 : 0.25} />
                        <stop offset="95%" stopColor={chartTheme.primary} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke={chartTheme.axisText}
                      tick={{ fill: chartTheme.axisText, fontSize: 11, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: chartTheme.grid }}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      stroke={chartTheme.axisText}
                      tick={{ fill: chartTheme.axisText, fontSize: 11, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                      unit={` ${activeBiomarker.unit}`}
                    />
                    <Tooltip content={<CustomLabTooltip />} />

                    {/* Safe reference area if min & max defined */}
                    {activeBiomarker.referenceMin !== undefined && activeBiomarker.referenceMax !== undefined && (
                      <ReferenceArea
                        y1={activeBiomarker.referenceMin}
                        y2={activeBiomarker.referenceMax}
                        fill={chartTheme.safeAreaFill}
                      />
                    )}

                    {/* Reference line for Min */}
                    {activeBiomarker.referenceMin !== undefined && (
                      <ReferenceLine
                        y={activeBiomarker.referenceMin}
                        stroke={chartTheme.normalRef}
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                      />
                    )}

                    {/* Reference line for Max */}
                    {activeBiomarker.referenceMax !== undefined && (
                      <ReferenceLine
                        y={activeBiomarker.referenceMax}
                        stroke={chartTheme.abnormalRef}
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                      />
                    )}

                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={chartTheme.primary}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#labBiomarkerGradient)"
                      dot={<CustomDot />}
                      activeDot={{ r: 6, fill: chartTheme.primary, stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={chartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke={chartTheme.axisText}
                      tick={{ fill: chartTheme.axisText, fontSize: 11, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: chartTheme.grid }}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      stroke={chartTheme.axisText}
                      tick={{ fill: chartTheme.axisText, fontSize: 11, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                      unit={` ${activeBiomarker.unit}`}
                    />
                    <Tooltip content={<CustomLabTooltip />} />

                    {/* Reference line for Min */}
                    {activeBiomarker.referenceMin !== undefined && (
                      <ReferenceLine
                        y={activeBiomarker.referenceMin}
                        stroke={chartTheme.normalRef}
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                      />
                    )}

                    {/* Reference line for Max */}
                    {activeBiomarker.referenceMax !== undefined && (
                      <ReferenceLine
                        y={activeBiomarker.referenceMax}
                        stroke={chartTheme.abnormalRef}
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                      />
                    )}

                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={chartTheme.primary}
                      strokeWidth={2.5}
                      dot={<CustomDot />}
                      activeDot={{ r: 6, fill: chartTheme.primary, stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          {/* Clinical Trend Insights Banner */}
          {biomarkerStats && (
            <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 flex items-start gap-3">
              <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                <span className="font-extrabold text-teal-900 dark:text-teal-300 block">
                  {isAr ? 'التحليل السريري للذاكرة المخبرية:' : 'Synthèse et Cinétique Clinique :'}
                </span>
                <p className="leading-relaxed">
                  {isAr ? (
                    <>
                      يظهر التحليل البيولوجي لمؤشر <strong>{activeBiomarker.nameAr}</strong> تسجيل{' '}
                      <strong>{biomarkerStats.count}</strong> قياسات متعاقبة. القيمة الأخيرة المسجلة هي{' '}
                      <strong>
                        {biomarkerStats.latest.value} {activeBiomarker.unit}
                      </strong>{' '}
                      بتاريخ {biomarkerStats.latest.fullDate}.{' '}
                      {biomarkerStats.latest.isAbnormal
                        ? 'النتيجة تحتاج إلى مواصلة الخطة الوقائية أو استشارة الطبيب لتعديل العلاج.'
                        : 'النتيجة مستقرة ومثالية وضمن النطاق المرجعي الآمن.'}
                    </>
                  ) : (
                    <>
                      La cinétique du marqueur <strong>{activeBiomarker.nameFr}</strong> comporte{' '}
                      <strong>{biomarkerStats.count}</strong> prélèvements successifs. Le dernier résultat est de{' '}
                      <strong>
                        {biomarkerStats.latest.value} {activeBiomarker.unit}
                      </strong>{' '}
                      au {biomarkerStats.latest.fullDate}.{' '}
                      {biomarkerStats.latest.isAbnormal
                        ? 'Valeur au-dessus de la cible, nécessitant le maintien des mesures diététiques et avis médical.'
                        : 'Valeur équilibrée et stable, parfaitement située dans les normes de référence.'}
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

        </section>
      )}

      {/* ========================================================================= */}
      {/* FILTER TABS BY LAB CATEGORY & CARDS GRID                                */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'all', labelAr: 'جميع التحاليل المسجلة', labelFr: 'Toutes les analyses' },
            { id: 'biochimie', labelAr: 'كيمياء حيوية (سكر، دهون، كلى)', labelFr: 'Biochimie' },
            { id: 'hematologie', labelAr: 'أمراض الدم (NFS)', labelFr: 'Hématologie' },
            { id: 'hormonologie', labelAr: 'هرمونات (TSH، غدة)', labelFr: 'Hormonologie' },
            { id: 'serologie', labelAr: 'مصليات ومناعة', labelFr: 'Sérologie' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === cat.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {isAr ? cat.labelAr : cat.labelFr}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-400 font-medium whitespace-nowrap">
          {filteredTests.length} {isAr ? 'فحوصات' : 'analyses'}
        </span>
      </div>

      {/* Lab Tests Cards Grid */}
      {filteredTests.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
          <FlaskConical className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isAr ? 'لا توجد تحاليل مسجلة في هذا القسم.' : 'Aucune analyse enregistrée dans cette catégorie.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests.map((test) => {
            const evaluation = evaluateLabValue(test.value, test.referenceMin, test.referenceMax);
            const isAbnormal = test.isAbnormal || evaluation.status !== 'normal';
            const { display } = cleanBiomarkerName(test.testName, isAr);
            const translatedNote = translateLabNote(test.notes, isAr);

            // Calculate progress bar representation between min and max
            let percentPosition = 50;
            if (test.referenceMin !== undefined && test.referenceMax !== undefined) {
              const range = test.referenceMax - test.referenceMin;
              if (range > 0) {
                const normalized = ((test.value - test.referenceMin) / range) * 100;
                percentPosition = Math.max(5, Math.min(95, normalized));
              }
            }

            return (
              <div
                key={test.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-3 ${
                  isAbnormal
                    ? 'border-amber-300 dark:border-amber-700/80 ring-1 ring-amber-400/30 dark:ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold">
                      {test.category}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {test.date}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-snug">
                    {display}
                  </h4>

                  {/* Value Display */}
                  <div className="flex items-baseline justify-between pt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                      {isAr ? 'النتيجة المقاسة:' : 'Valeur :'}
                    </span>
                    <div className="text-right">
                      <span className={`text-xl font-black font-mono ${isAbnormal ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
                        {test.value}
                      </span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 ml-1">{test.unit}</span>
                    </div>
                  </div>

                  {/* Visual Reference Range Bar */}
                  {test.referenceMin !== undefined && test.referenceMax !== undefined && (
                    <div className="space-y-1 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80">
                      <div className="flex justify-between text-[10px] font-mono text-slate-400 dark:text-slate-400">
                        <span>Min: {test.referenceMin}</span>
                        <span>Max: {test.referenceMax} {test.unit}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full relative overflow-hidden">
                        {/* Target normal zone */}
                        <div className="absolute inset-y-0 left-[20%] right-[20%] bg-emerald-200 dark:bg-emerald-900/60" />
                        {/* Indicator pin */}
                        <div
                          className={`absolute top-0 bottom-0 w-2.5 rounded-full ${
                            isAbnormal ? 'bg-amber-500 ring-2 ring-amber-300 dark:ring-amber-400' : 'bg-emerald-600 dark:bg-emerald-400'
                          }`}
                          style={{ left: `${percentPosition}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="flex items-center gap-1.5">
                    {isAbnormal ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>{isAr ? evaluation.labelAr : evaluation.labelFr}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{isAr ? 'ضمن المعدل الطبيعي' : 'Dans les normes'}</span>
                      </span>
                    )}
                  </div>

                  {test.laboratory && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-1">
                      <Building className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{test.laboratory}</span>
                    </div>
                  )}

                  {translatedNote && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      {translatedNote}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      const { key } = cleanBiomarkerName(test.testName, isAr);
                      setSelectedBiomarkerKey(key);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <LineChartIcon className="w-3 h-3" />
                    <span>{isAr ? 'عرض المنحنى البياني' : 'Voir la courbe'}</span>
                  </button>

                  <button
                    onClick={() => deleteLabTest(test.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer"
                    title={isAr ? 'حذف التحليل' : 'Supprimer'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Lab Test Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 border border-transparent dark:border-slate-800">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span>{isAr ? 'تسجيل نتيجة تحليل مخبري' : 'Ajouter une analyse médicale'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLabTest} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? 'اسم التحليل أو الفحص *' : 'Nom de l’analyse *'}
                </label>
                <input
                  type="text"
                  required
                  value={form.testName}
                  onChange={(e) => setForm({ ...form, testName: e.target.value })}
                  placeholder={
                    isAr
                      ? 'مثال: نسبة السكر في الدم على الريق (Glycémie à jeun)...'
                      : 'Ex: Glycémie à jeun, Cholestérol Total...'
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'التصنيف' : 'Catégorie'}
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as LabCategory })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  >
                    <option value="biochimie">{isAr ? 'كيمياء حيوية (Biochimie)' : 'Biochimie'}</option>
                    <option value="hematologie">{isAr ? 'أمراض الدم (Hématologie)' : 'Hématologie'}</option>
                    <option value="hormonologie">{isAr ? 'هرمونات (Hormonologie)' : 'Hormonologie'}</option>
                    <option value="serologie">{isAr ? 'مصليات ومناعة (Sérologie)' : 'Sérologie'}</option>
                    <option value="urine">{isAr ? 'تحليل البول (Urines)' : 'Urines'}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'تاريخ الفحص' : 'Date de prélèvement'}
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'القيمة المقاسة *' : 'Valeur mesurée *'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    placeholder="0.98"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'الوحدة' : 'Unité'}
                  </label>
                  <input
                    type="text"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    placeholder="g/L, mg/dL..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'المجال المرجعي' : 'Norme (Min - Max)'}
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Min"
                      value={form.referenceMin}
                      onChange={(e) => setForm({ ...form, referenceMin: e.target.value })}
                      className="w-1/2 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-[11px]"
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Max"
                      value={form.referenceMax}
                      onChange={(e) => setForm({ ...form, referenceMax: e.target.value })}
                      className="w-1/2 p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'اسم المخبر' : 'Laboratoire'}
                  </label>
                  <input
                    type="text"
                    value={form.laboratory}
                    onChange={(e) => setForm({ ...form, laboratory: e.target.value })}
                    placeholder={isAr ? 'مخبر ابن رشد، مخبر الأمل...' : 'Laboratoire Ibn Rouchd...'}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'الطبيب الطالب للفحص' : 'Médecin prescripteur'}
                  </label>
                  <input
                    type="text"
                    value={form.prescribingDoctor}
                    onChange={(e) => setForm({ ...form, prescribingDoctor: e.target.value })}
                    placeholder="د. كريم بوجمعة"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? 'ملاحظات وتفسير الطبيب' : 'Interprétation & Notes'}
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder={
                    isAr
                      ? 'ملاحظات بيولوجية، تعليمات إضافية...'
                      : 'Remarques cliniques, consignes de surveillance...'
                  }
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  {isAr ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md cursor-pointer"
                >
                  {isAr ? 'حفظ النتيجة في الملف' : 'Enregistrer'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
