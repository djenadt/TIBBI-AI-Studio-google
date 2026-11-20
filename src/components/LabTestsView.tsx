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
  LabelList,
} from 'recharts';
import { useTibbi } from '../context/TibbiContext';
import { LabTest, LabCategory, Language, tr } from '../types/tibbi';
import {
  evaluateLabValue,
  formatChartNumericLabel,
  resolveChartClickVitalId,
} from '../utils/healthCalculators';
import { ScrollableChartFrame } from './ScrollableChartFrame';
import { localizeText, translateLabCategory } from '../utils/frTranslator';

// Helper to translate medical notes to French or English with clinical precision
function translateLabNote(note: string | undefined, language: Language): string {
  if (!note) return '';
  if (language === 'ar') return note;

  if (language === 'en') {
    if (note.includes('قيمة أولية مرتفعة') || note.includes('إنقاص الوزن')) {
      return 'Moderately elevated initial value; dietary rebalancing and weight loss initiated.';
    }
    if (note.includes('تحسن ملحوظ') || note.includes('وجبات العشاء')) {
      return 'Notable improvement after lighter dinners and reducing simple sugars.';
    }
    if (note.includes('استقرار ممتاز') || note.includes('النطاق الطبيعي')) {
      return 'Excellent stabilization within the normal physiological range.';
    }
    if (note.includes('المشي المنتظم') || note.includes('مستوى منضبط')) {
      return 'Well-controlled blood glucose alongside regular walking.';
    }
    if (note.includes('دوري سنوي') || note.includes('مستقرة تماماً') || note.includes('طبيعية ومستقرة')) {
      return 'Annual routine panel; completely normal and stable result.';
    }
    if (note.includes('ارتفاع شحوم الدم') || note.includes('أوميغا 3')) {
      return 'Mild dyslipidemia; Mediterranean diet and omega-3 prescribed.';
    }
    if (note.includes('استجابة أولية') || note.includes('انخفاض تدريجي')) {
      return 'Positive initial therapeutic response with gradual cholesterol decline.';
    }
    if (note.includes('زيت الزيتون') || note.includes('الأسماك')) {
      return 'Continue dietary adherence (olive oil and fatty fish).';
    }
    if (note.includes('حمية البحر المتوسط وممارسة المشي')) {
      return 'Slightly above target; maintain Mediterranean diet and daily walking.';
    }
    if (note.includes('الهدف الوعائي') || note.includes('فوق الهدف')) {
      return 'LDL above cardiovascular target; close monitoring required.';
    }
    if (note.includes('انخفاض مشجع')) {
      return 'Favorable, encouraging progression toward therapeutic target.';
    }
    if (note.includes('مريض الضغط') || note.includes('3 أشهر')) {
      return 'Slightly above target for hypertensive patient; recheck in 3 months.';
    }
    if (note.includes('سليمة وطبيعية قبل بدء')) {
      return 'Normal renal function prior to starting antihypertensive therapy.';
    }
    if (note.includes('ترشيح كبيبي سليم')) {
      return 'Excellent kidney function with preserved glomerular filtration.';
    }
    if (note.includes('وظائف كلى ممتازة')) {
      return 'Excellent kidney function and normal clearance.';
    }
    if (note.includes('ما قبل السكري')) {
      return 'HbA1c in early prediabetes range; lifestyle monitoring.';
    }
    if (note.includes('عودة إلى المعدل الطبيعي')) {
      return 'Excellent return to normal physiological range.';
    }
    if (note.includes('تراكمي ممتاز') || note.includes('تراكمي مثالي')) {
      return 'Optimal, stable HbA1c over the past 3 months.';
    }
    if (note.includes('بداية الحمل') || note.includes('الأسبوع 6')) {
      return 'Initial pregnancy panel (6 wks GA); normal CBC.';
    }
    if (note.includes('الثلث الأول')) {
      return '1st trimester follow-up; satisfactory hemoglobin level.';
    }
    if (note.includes('الثلث الثاني') && note.includes('فقر دم')) {
      return '2nd trimester panel; no anemia despite physiological hemodilution.';
    }
    if (note.includes('مخزون حديد أولي')) {
      return 'Optimal baseline iron stores ahead of peak fetal demand.';
    }
    if (note.includes('استهلاك الجنين') || note.includes('تارديفيرون B9')) {
      return 'Increased fetal iron demand; Tardyferon B9 supplementation started.';
    }
    if (note.includes('تفادي فقر دم الثلث الثالث') || note.includes('تارديفيرون')) {
      return 'Satisfactory level; maintain preventive 3rd trimester supplementation.';
    }
    if (note.includes('Séronégative') || note.includes('المقوسات')) {
      return 'Seronegative: thoroughly wash raw produce, cook meats completely, and retest monthly.';
    }
    return localizeText(note, 'en');
  }

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

  return localizeText(note, 'fr');
}

// Helper to extract clean localized name for tests
function cleanBiomarkerName(name: string, language: Language): { display: string; short: string; key: string } {
  const match = name.match(/^(.*?)\s*\((.*?)\)$/);
  if (match) {
    const arPart = match[1].trim();
    const frPart = match[2].trim();
    if (language === 'en') {
      const enName = localizeText(name, 'en');
      const enShort = enName !== name ? enName : localizeText(frPart, 'en');
      return {
        display: enShort,
        short: enShort,
        key: frPart.toLowerCase(),
      };
    }
    return {
      display: language === 'ar' ? name : frPart,
      short: language === 'ar' ? arPart : frPart,
      key: frPart.toLowerCase(),
    };
  }
  const localized = localizeText(name, language);
  return {
    display: localized,
    short: localized,
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
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
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
      primaryLabel: isDark ? '#5eead4' : '#0f766e',
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
        nameEn: string;
        fullName: string;
        category: LabCategory;
        unit: string;
        referenceMin?: number;
        referenceMax?: number;
        tests: LabTest[];
      }
    >();

    activeMemberLabTests.forEach((test) => {
      const { key } = cleanBiomarkerName(test.testName, language);
      const { short: enShort } = cleanBiomarkerName(test.testName, 'en');
      const match = test.testName.match(/^(.*?)\s*\((.*?)\)$/);
      const nameAr = match ? match[1].trim() : test.testName;
      const nameFr = match ? match[2].trim() : test.testName;

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          nameAr,
          nameFr,
          nameEn: enShort,
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
  }, [activeMemberLabTests, language]);

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
      const translatedNote = translateLabNote(t.notes, language);

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
        laboratory: localizeText(t.laboratory, language),
        doctor: localizeText(t.prescribingDoctor, language),
        notes: translatedNote,
      };
    });
  }, [activeBiomarker, language]);

  const selectedChartTest = useMemo(() => {
    if (!selectedTestId) return null;
    return chartData.find((d) => d.id === selectedTestId) ?? null;
  }, [chartData, selectedTestId]);

  const handleLabChartClick = (state: any) => {
    const clickedId = resolveChartClickVitalId(chartData, state);
    if (clickedId) {
      setSelectedTestId(clickedId);
    }
  };

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
      laboratory: form.laboratory || tr(language, 'مخبر التحاليل الطبية', 'Laboratoire d’analyses', 'Medical Laboratory'),
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
              ? tr(language, data.evaluation.labelAr, data.evaluation.labelFr, data.evaluation.labelEn)
              : tr(language, 'طبيعي وسوي', 'Dans les normes', 'Within Normal Range')}
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium">
            {tr(language, 'النتيجة المقاسة:', 'Valeur mesurée :', 'Measured Value:')}
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
            <span>{tr(language, 'المجال المرجعي:', 'Norme réf. :', 'Reference Range:')}</span>
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

  // Custom Dot component to highlight normal vs abnormal readings and support click-to-inspect
  const renderLabDot = (isActive = false) => (props: any) => {
    const { cx, cy, payload, value, index } = props;
    const scalarValue = Array.isArray(value) ? value[1] : value;
    if (cx == null || cy == null || scalarValue == null || !payload?.id) {
      return <g key={`lab-dot-empty-${index ?? 0}`} />;
    }
    const isAbnormal = payload.isAbnormal;
    const isSelected = selectedTestId === payload.id;
    const baseColor = isAbnormal ? '#f59e0b' : '#0d9488';

    if (isActive) {
      return (
        <g
          key={`lab-dot-${payload.id}-active`}
          style={{ pointerEvents: 'none' }}
        >
          <circle
            cx={cx}
            cy={cy}
            r={10}
            fill={baseColor}
            fillOpacity={0.2}
            stroke={baseColor}
            strokeWidth={1.5}
          />
          <circle
            cx={cx}
            cy={cy}
            r={6}
            fill={baseColor}
            stroke="#ffffff"
            strokeWidth={2}
          />
        </g>
      );
    }

    return (
      <g
        key={`lab-dot-${payload.id}-base`}
        role="button"
        tabIndex={0}
        aria-label={`${payload.fullDate}: ${scalarValue}`}
        style={{ cursor: 'pointer', outline: 'none' }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedTestId(payload.id);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedTestId(payload.id);
          }
        }}
      >
        {(isAbnormal || isSelected) && (
          <circle
            cx={cx}
            cy={cy}
            r={isSelected ? 10 : 7}
            fill={baseColor}
            fillOpacity={isSelected ? 0.22 : 0.25}
            stroke={isSelected ? baseColor : 'none'}
            strokeWidth={isSelected ? 1.5 : 0}
          />
        )}
        <circle cx={cx} cy={cy} r={13} fill="transparent" />
        <circle
          cx={cx}
          cy={cy}
          r={isSelected ? 6 : 4.5}
          fill={baseColor}
          stroke="#ffffff"
          strokeWidth={isSelected ? 2 : 1.5}
        />
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
            <span>{tr(language, 'متابعة التحاليل والفحوصات الطبية', 'Suivi des Analyses Biologiques & Examens', 'Lab Tests & Biomarker Tracking')}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {tr(
              language,
              `سجل التحاليل المخبرية للمريض: ${activeMember.fullNameAr} - المقارنة الزمنية والمجالات المرجعية وتنبيهات القيم الشاذة.`,
              `Analyses médicales de ${activeMember.fullNameFr} - Évolution chronologique et valeurs cibles.`,
              `Lab results for ${activeMember.fullNameFr} - Chronological trends, reference ranges, and out-of-range alerts.`
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('archive')}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer shadow-2xs transition-colors"
          >
            <span>{tr(language, 'استخراج من ورقة مخبر (OCR)', 'Scanner un bilan (OCR)', 'Scan Lab Report (OCR)')}</span>
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{tr(language, '+ تسجيل نتيجة تحليل', '+ Ajouter une analyse', '+ Add Lab Result')}</span>
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
                    {tr(language, 'تطور نتائج التحاليل عبر الزمن', 'Évolution Chronologique des Biomarqueurs', 'Chronological Biomarker Trends')}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {tr(
                      language,
                      'اضغط على أي نتيجة في الخط البياني لعرض التفاصيل الكاملة ومقارنتها بالمجال المرجعي',
                      'Cliquez sur un point de la courbe pour afficher les détails complets de l’analyse',
                      'Click any point on the chart line to view full result details and reference range'
                    )}
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
                  <span>{tr(language, 'مخطط المساحة', 'Aire', 'Area')}</span>
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
                  <span>{tr(language, 'مخطط خطي', 'Ligne', 'Line')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Biomarkers Selector Tabs / Pills */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {tr(language, 'اختر المؤشر المخبري لمشاهدة تطوره:', 'Sélectionnez le biomarqueur à analyser :', 'Select biomarker to analyze:')}
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {biomarkerGroups.map((grp) => {
                const isSelected = grp.key === activeBiomarker.key;
                const displayName = tr(language, grp.nameAr, grp.nameFr, grp.nameEn);

                return (
                  <button
                    key={grp.key}
                    onClick={() => {
                      setSelectedBiomarkerKey(grp.key);
                      setSelectedTestId(null);
                    }}
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
                  {tr(language, 'آخر نتيجة مقاسة', 'Dernière valeur', 'Latest Value')}
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
                  {tr(language, 'التغير الكلي', 'Évolution globale', 'Overall Change')}
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
                      <span>{tr(language, 'انخفاض نحو الهدف', 'Baisse favorable', 'Favorable decrease')}</span>
                    </span>
                  ) : (
                    <span className="text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" />
                      <span>{tr(language, 'ارتفاع تدريجي', 'Hausse progressive', 'Gradual increase')}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Reference Range Target Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  {tr(language, 'المجال المرجعي السوي', 'Norme physiologique', 'Reference Range')}
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
                  <span>{tr(language, 'النطاق المستهدف', 'Zone cible', 'Target zone')}</span>
                </div>
              </div>

              {/* Average & Readings Count Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  {tr(language, 'المتوسط الحسابي', 'Moyenne calculée', 'Calculated Average')}
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
                    {biomarkerStats.count} {tr(language, 'فحوصات مسجلة', 'mesures au total', 'total readings')}
                  </span>
                </div>
              </div>

            </div>
          )}

          {/* Selected Lab Result Details Panel (shown when clicking a point on the chart line) */}
          {selectedChartTest && (
            <div
              data-testid="lab-selected-details"
              className="rounded-2xl bg-teal-50/85 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/70 p-4 space-y-3 transition-all"
            >
              <div className="flex items-center justify-between gap-2 border-b border-teal-200/70 dark:border-teal-800/60 pb-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-700 dark:bg-teal-600 text-white text-xs font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    <span dir="ltr" className="font-mono">{selectedChartTest.fullDate}</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                      selectedChartTest.isAbnormal
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    }`}
                  >
                    {selectedChartTest.isAbnormal
                      ? tr(language, selectedChartTest.evaluation.labelAr, selectedChartTest.evaluation.labelFr, selectedChartTest.evaluation.labelEn)
                      : tr(language, 'ضمن المعدل الطبيعي', 'Dans les normes', 'Within Normal Range')}
                  </span>
                  <span className="text-xs font-bold text-teal-900 dark:text-teal-200">
                    {tr(language, activeBiomarker.nameAr, activeBiomarker.nameFr, activeBiomarker.nameEn)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTestId(null)}
                  aria-label={tr(language, 'إغلاق تفاصيل النتيجة', 'Fermer les détails', 'Close result details')}
                  className="p-1 rounded-lg text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="bg-white/90 dark:bg-slate-900/80 rounded-xl p-2.5 border border-teal-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {tr(language, 'النتيجة المقاسة', 'Valeur mesurée', 'Measured Value')}
                  </span>
                  <span
                    dir="ltr"
                    className={`font-mono font-extrabold text-base inline-block ${
                      selectedChartTest.isAbnormal ? 'text-amber-600 dark:text-amber-400' : 'text-teal-700 dark:text-teal-400'
                    }`}
                  >
                    {selectedChartTest.value} {selectedChartTest.unit}
                  </span>
                </div>

                <div className="bg-white/90 dark:bg-slate-900/80 rounded-xl p-2.5 border border-teal-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {tr(language, 'المجال المرجعي', 'Norme de référence', 'Reference Range')}
                  </span>
                  <span dir="ltr" className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 inline-block">
                    {selectedChartTest.referenceMin !== undefined && selectedChartTest.referenceMax !== undefined
                      ? `${selectedChartTest.referenceMin} - ${selectedChartTest.referenceMax} ${selectedChartTest.unit}`
                      : '--'}
                  </span>
                </div>

                <div className="bg-white/90 dark:bg-slate-900/80 rounded-xl p-2.5 border border-teal-100 dark:border-slate-800">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    {tr(language, 'المخبر والطبيب', 'Laboratoire & Médecin', 'Laboratory & Doctor')}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                    {selectedChartTest.laboratory ? localizeText(selectedChartTest.laboratory, language) : '--'}
                  </span>
                  {selectedChartTest.doctor && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                      {localizeText(selectedChartTest.doctor, language)}
                    </span>
                  )}
                </div>
              </div>

              {selectedChartTest.notes && (
                <p className="text-xs text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/60 px-3 py-2 rounded-xl border border-teal-100/80 dark:border-slate-800">
                  {translateLabNote(selectedChartTest.notes, language)}
                </p>
              )}
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
                    {tr(language, activeBiomarker.nameAr, activeBiomarker.nameFr, activeBiomarker.nameEn)} ({activeBiomarker.unit})
                  </span>
                </div>
                {activeBiomarker.referenceMax !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 border-t-2 border-dashed border-amber-500" />
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {tr(language, 'الحد الأقصى', 'Max réf.', 'Ref. Max')}: {activeBiomarker.referenceMax}
                    </span>
                  </div>
                )}
                {activeBiomarker.referenceMin !== undefined && (
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-500" />
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {tr(language, 'الحد الأدنى', 'Min réf.', 'Ref. Min')}: {activeBiomarker.referenceMin}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                <span>{tr(language, 'نقطة سويّة', 'Normale', 'Normal')}</span>
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 ml-1" />
                <span>{tr(language, 'شاذة / تتطلب متابعة', 'À surveiller', 'Monitor')}</span>
              </div>
            </div>

            {/* Recharts Container */}
            <ScrollableChartFrame
              pointCount={chartData.length}
              heightClass="h-72"
              language={language}
              testId="labs-biomarker-chart-scroll"
            >
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart
                    data={chartData}
                    margin={{ top: 26, right: 24, left: 4, bottom: 8 }}
                    onClick={handleLabChartClick}
                  >
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
                      padding={{ left: 32, right: 26 }}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      stroke={chartTheme.axisText}
                      tick={{ fill: chartTheme.axisText, fontSize: 11, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                      width={44}
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
                      isAnimationActive={false}
                      dot={renderLabDot(false)}
                      activeDot={renderLabDot(true)}
                    >
                      <LabelList
                        dataKey="value"
                        position="top"
                        offset={10}
                        formatter={formatChartNumericLabel}
                        fill={chartTheme.primaryLabel}
                        fontSize={11}
                        fontWeight={700}
                      />
                    </Area>
                  </AreaChart>
                ) : (
                  <LineChart
                    data={chartData}
                    margin={{ top: 26, right: 24, left: 4, bottom: 8 }}
                    onClick={handleLabChartClick}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke={chartTheme.axisText}
                      tick={{ fill: chartTheme.axisText, fontSize: 11, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={{ stroke: chartTheme.grid }}
                      padding={{ left: 32, right: 26 }}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      stroke={chartTheme.axisText}
                      tick={{ fill: chartTheme.axisText, fontSize: 11, fontWeight: 600 }}
                      tickLine={false}
                      axisLine={false}
                      width={44}
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
                      isAnimationActive={false}
                      dot={renderLabDot(false)}
                      activeDot={renderLabDot(true)}
                    >
                      <LabelList
                        dataKey="value"
                        position="top"
                        offset={10}
                        formatter={formatChartNumericLabel}
                        fill={chartTheme.primaryLabel}
                        fontSize={11}
                        fontWeight={700}
                      />
                    </Line>
                  </LineChart>
                )}
              </ResponsiveContainer>
            </ScrollableChartFrame>
          </div>

          {/* Clinical Trend Insights Banner */}
          {biomarkerStats && (
            <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 flex items-start gap-3">
              <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                <span className="font-extrabold text-teal-900 dark:text-teal-300 block">
                  {tr(language, 'التحليل السريري للذاكرة المخبرية:', 'Synthèse et Cinétique Clinique :', 'Clinical Lab Trend Summary:')}
                </span>
                <p className="leading-relaxed">
                  {language === 'ar' ? (
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
                  ) : language === 'fr' ? (
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
                  ) : (
                    <>
                      The longitudinal trend for <strong>{activeBiomarker.nameEn}</strong> includes{' '}
                      <strong>{biomarkerStats.count}</strong> consecutive measurements. The most recent value is{' '}
                      <strong>
                        {biomarkerStats.latest.value} {activeBiomarker.unit}
                      </strong>{' '}
                      on {biomarkerStats.latest.fullDate}.{' '}
                      {biomarkerStats.latest.isAbnormal
                        ? 'Result is outside the target range and requires ongoing lifestyle measures and medical follow-up.'
                        : 'Value is stable and well within the physiological reference range.'}
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
            { id: 'all', labelAr: 'جميع التحاليل المسجلة', labelFr: 'Toutes les analyses', labelEn: 'All Lab Tests' },
            { id: 'biochimie', labelAr: 'كيمياء حيوية (سكر، دهون، كلى)', labelFr: 'Biochimie', labelEn: 'Biochemistry' },
            { id: 'hematologie', labelAr: 'أمراض الدم (NFS)', labelFr: 'Hématologie', labelEn: 'Hematology (CBC)' },
            { id: 'hormonologie', labelAr: 'هرمونات (TSH، غدة)', labelFr: 'Hormonologie', labelEn: 'Hormonology' },
            { id: 'serologie', labelAr: 'مصليات ومناعة', labelFr: 'Sérologie', labelEn: 'Serology' },
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
              {tr(language, cat.labelAr, cat.labelFr, cat.labelEn)}
            </button>
          ))}
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-400 font-medium whitespace-nowrap">
          {filteredTests.length} {tr(language, 'فحوصات', 'analyses', 'tests')}
        </span>
      </div>

      {/* Lab Tests Cards Grid */}
      {filteredTests.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
          <FlaskConical className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {tr(language, 'لا توجد تحاليل مسجلة في هذا القسم.', 'Aucune analyse enregistrée dans cette catégorie.', 'No lab tests recorded in this category.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTests.map((test) => {
            const evaluation = evaluateLabValue(test.value, test.referenceMin, test.referenceMax);
            const isAbnormal = test.isAbnormal || evaluation.status !== 'normal';
            const { display } = cleanBiomarkerName(test.testName, language);
            const translatedNote = translateLabNote(test.notes, language);

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
                      {translateLabCategory(test.category, language)}
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
                      {tr(language, 'النتيجة المقاسة:', 'Valeur :', 'Result:')}
                    </span>
                    <div className="text-end shrink-0">
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
                        <span>{tr(language, evaluation.labelAr, evaluation.labelFr, evaluation.labelEn)}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{tr(language, 'ضمن المعدل الطبيعي', 'Dans les normes', 'Within Normal Range')}</span>
                      </span>
                    )}
                  </div>

                  {test.laboratory && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 pt-1">
                      <Building className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{localizeText(test.laboratory, language)}</span>
                    </div>
                  )}

                  {(translatedNote || test.notes) && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      {translatedNote || localizeText(test.notes, language)}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => {
                      const { key } = cleanBiomarkerName(test.testName, language);
                      setSelectedBiomarkerKey(key);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <LineChartIcon className="w-3 h-3" />
                    <span>{tr(language, 'عرض المنحنى البياني', 'Voir la courbe', 'View Chart')}</span>
                  </button>

                  <button
                    onClick={() => deleteLabTest(test.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer"
                    title={tr(language, 'حذف التحليل', 'Supprimer', 'Delete')}
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
                <span>{tr(language, 'تسجيل نتيجة تحليل مخبري', 'Ajouter une analyse médicale', 'Add Lab Test Result')}</span>
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
                  {tr(language, 'اسم التحليل أو الفحص *', 'Nom de l’analyse *', 'Test / Biomarker Name *')}
                </label>
                <input
                  type="text"
                  required
                  value={form.testName}
                  onChange={(e) => setForm({ ...form, testName: e.target.value })}
                  placeholder={tr(
                    language,
                    'مثال: نسبة السكر في الدم على الريق (Glycémie à jeun)...',
                    'Ex: Glycémie à jeun, Cholestérol Total...',
                    'e.g., Fasting Blood Glucose, Total Cholesterol...'
                  )}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'التصنيف', 'Catégorie', 'Category')}
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as LabCategory })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  >
                    <option value="biochimie">{tr(language, 'كيمياء حيوية (Biochimie)', 'Biochimie', 'Biochemistry')}</option>
                    <option value="hematologie">{tr(language, 'أمراض الدم (Hématologie)', 'Hématologie', 'Hematology (CBC)')}</option>
                    <option value="hormonologie">{tr(language, 'هرمونات (Hormonologie)', 'Hormonologie', 'Hormonology')}</option>
                    <option value="serologie">{tr(language, 'مصليات ومناعة (Sérologie)', 'Sérologie', 'Serology')}</option>
                    <option value="urine">{tr(language, 'تحليل البول (Urines)', 'Urines', 'Urinalysis')}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'تاريخ الفحص', 'Date de prélèvement', 'Collection Date')}
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
                    {tr(language, 'القيمة المقاسة *', 'Valeur mesurée *', 'Measured Value *')}
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
                    {tr(language, 'الوحدة', 'Unité', 'Unit')}
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
                    {tr(language, 'المجال المرجعي', 'Norme (Min - Max)', 'Ref. Range (Min - Max)')}
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
                    {tr(language, 'اسم المخبر', 'Laboratoire', 'Laboratory')}
                  </label>
                  <input
                    type="text"
                    value={form.laboratory}
                    onChange={(e) => setForm({ ...form, laboratory: e.target.value })}
                    placeholder={tr(language, 'مخبر ابن رشد، مخبر الأمل...', 'Laboratoire Ibn Rouchd...', 'Ibn Rouchd Laboratory...')}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'الطبيب الطالب للفحص', 'Médecin prescripteur', 'Ordering Physician')}
                  </label>
                  <input
                    type="text"
                    value={form.prescribingDoctor}
                    onChange={(e) => setForm({ ...form, prescribingDoctor: e.target.value })}
                    placeholder={tr(language, 'د. كريم بوجمعة', 'Dr Karim Boudjemaa', 'Dr. Karim Boudjemaa')}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {tr(language, 'ملاحظات وتفسير الطبيب', 'Interprétation & Notes', 'Interpretation & Notes')}
                </label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder={tr(
                    language,
                    'ملاحظات بيولوجية، تعليمات إضافية...',
                    'Remarques cliniques, consignes de surveillance...',
                    'Clinical remarks, monitoring notes...'
                  )}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  {tr(language, 'إلغاء', 'Annuler', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md cursor-pointer"
                >
                  {tr(language, 'حفظ النتيجة في الملف', 'Enregistrer', 'Save Result')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
