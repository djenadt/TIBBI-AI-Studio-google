import React, { useState, useMemo } from 'react';
import {
  HeartPulse,
  Plus,
  Calendar,
  Clock,
  Activity,
  Droplets,
  Scale,
  Thermometer,
  Gauge,
  CheckCircle2,
  AlertCircle,
  X,
  TrendingDown,
  TrendingUp,
  BarChart3,
  LineChart as LineChartIcon,
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
  Legend,
  ReferenceLine,
  LabelList,
} from 'recharts';
import { useTibbi } from '../context/TibbiContext';
import {
  calculateBMI,
  formatChartNumericLabel,
  resolveChartClickVitalId,
} from '../utils/healthCalculators';
import { ScrollableChartFrame } from './ScrollableChartFrame';
import { localizeText } from '../utils/frTranslator';
import { tr } from '../types/tibbi';

type ChartTab = 'all' | 'blood_pressure' | 'glucose' | 'weight_bmi';

export const VitalsView: React.FC = () => {
  const {
    language,
    theme,
    activeMember,
    activeMemberVitals,
    addVital,
  } = useTibbi();

  const isAr = language === 'ar';
  const isDark = theme === 'dark';

  const [activeChartTab, setActiveChartTab] = useState<ChartTab>('all');
  const [selectedVitalId, setSelectedVitalId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    systolicBp: '',
    diastolicBp: '',
    heartRate: '',
    bloodGlucose: '',
    glucoseContext: 'fasting' as 'fasting' | 'post-meal' | 'random',
    weightKg: '',
    heightCm: '',
    temperatureC: '',
    oxygenSpO2: '',
    notes: '',
  });

  const latest = activeMemberVitals[0];

  const selectedVital = useMemo(() => {
    if (!selectedVitalId) return null;
    return activeMemberVitals.find((v) => v.id === selectedVitalId) ?? null;
  }, [activeMemberVitals, selectedVitalId]);

  // Prepare chronological data for Recharts (oldest to newest)
  const chartData = useMemo(() => {
    return [...activeMemberVitals]
      .reverse()
      .map((v) => {
        // Format short date for axis
        const shortDate = v.date.slice(5); // "MM-DD"
        return {
          id: v.id,
          rawDate: v.date,
          date: shortDate,
          fullDate: v.date,
          time: v.time,
          systolic: v.systolicBp ?? null,
          diastolic: v.diastolicBp ?? null,
          glucose: v.bloodGlucose ?? null,
          glucoseContext: v.glucoseContext ?? 'fasting',
          weight: v.weightKg ?? null,
          bmi: v.bmi ?? null,
          heartRate: v.heartRate ?? null,
          notes: v.notes,
        };
      });
  }, [activeMemberVitals]);

  // Chart styling colors based on current theme
  const chartTheme = useMemo(() => {
    return {
      grid: isDark ? '#1e293b' : '#f1f5f9', // slate-800 vs slate-100
      axisText: isDark ? '#94a3b8' : '#64748b', // slate-400 vs slate-500
      tooltipBg: isDark ? '#0f172a' : '#ffffff', // slate-900 vs white
      tooltipBorder: isDark ? '#334155' : '#e2e8f0', // slate-700 vs slate-200
      systolic: '#f43f5e', // rose-500
      systolicLabel: isDark ? '#fda4af' : '#e11d48',
      diastolic: '#0d9488', // teal-600
      diastolicLabel: isDark ? '#5eead4' : '#0f766e',
      glucose: '#3b82f6', // blue-500
      glucoseLabel: isDark ? '#93c5fd' : '#1d4ed8',
      glucoseFill: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
      weight: '#10b981', // emerald-500
      weightLabel: isDark ? '#6ee7b7' : '#047857',
      bmi: '#8b5cf6', // purple-500
      bmiLabel: isDark ? '#c4b5fd' : '#6d28d9',
    };
  }, [isDark]);

  const handleChartClick = (state: any) => {
    const clickedId = resolveChartClickVitalId(chartData, state);
    if (clickedId) {
      setSelectedVitalId(clickedId);
    }
  };

  const renderInteractiveDot = (color: string, seriesKey: string, isActive = false) => (props: any) => {
    const { cx, cy, payload, value, index } = props;
    const scalarValue = Array.isArray(value) ? value[1] : value;
    if (cx == null || cy == null || scalarValue == null || !payload?.id) {
      return <g key={`${seriesKey}-${index ?? 'empty'}`} />;
    }
    const isSelected = selectedVitalId === payload.id;
    const radius = isActive ? 6 : isSelected ? 6 : 4;
    return (
      <g
        key={`${seriesKey}-${payload.id}-${isActive ? 'active' : 'dot'}`}
        role="button"
        tabIndex={0}
        aria-label={`${payload.fullDate}: ${scalarValue}`}
        style={{ cursor: 'pointer', outline: 'none' }}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedVitalId(payload.id);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedVitalId(payload.id);
          }
        }}
      >
        {isSelected && (
          <circle
            cx={cx}
            cy={cy}
            r={10}
            fill={color}
            fillOpacity={0.18}
            stroke={color}
            strokeWidth={1.5}
          />
        )}
        <circle cx={cx} cy={cy} r={13} fill="transparent" />
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill={isActive || isSelected ? color : isDark ? '#0f172a' : '#ffffff'}
          stroke={color}
          strokeWidth={isActive || isSelected ? 2 : 2.5}
        />
      </g>
    );
  };

  const handleCreateVital = (e: React.FormEvent) => {
    e.preventDefault();

    const w = form.weightKg ? parseFloat(form.weightKg) : undefined;
    const h = form.heightCm ? parseFloat(form.heightCm) : undefined;
    const bmi = w && h ? calculateBMI(w, h) : undefined;

    addVital({
      patientId: activeMember.id,
      date: form.date,
      time: form.time,
      systolicBp: form.systolicBp ? parseInt(form.systolicBp, 10) : undefined,
      diastolicBp: form.diastolicBp ? parseInt(form.diastolicBp, 10) : undefined,
      heartRate: form.heartRate ? parseInt(form.heartRate, 10) : undefined,
      bloodGlucose: form.bloodGlucose ? parseFloat(form.bloodGlucose) : undefined,
      glucoseContext: form.glucoseContext,
      weightKg: w,
      heightCm: h,
      bmi,
      temperatureC: form.temperatureC ? parseFloat(form.temperatureC) : undefined,
      oxygenSpO2: form.oxygenSpO2 ? parseInt(form.oxygenSpO2, 10) : undefined,
      notes: form.notes,
    });

    setIsModalOpen(false);
    setForm({
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      systolicBp: '',
      diastolicBp: '',
      heartRate: '',
      bloodGlucose: '',
      glucoseContext: 'fasting',
      weightKg: '',
      heightCm: '',
      temperatureC: '',
      oxygenSpO2: '',
      notes: '',
    });
  };

  // Helper translations for BMI categories
  const getBmiCategoryLabel = (bmi: number | undefined) => {
    if (!bmi) return '--';
    if (bmi < 18.5) return tr(language, 'نقص في الوزن', 'Insuffisance pondérale', 'Underweight');
    if (bmi < 25) return tr(language, 'وزن طبيعي ومثالي', 'Corpulence normale', 'Normal weight');
    if (bmi < 30) return tr(language, 'زيادة في الوزن', 'Surpoids pondéral', 'Overweight');
    return tr(language, 'سمنة (تحتاج متابعة)', 'Obésité (à surveiller)', 'Obesity (monitor)');
  };

  // Helper translation for glucose contexts
  const getGlucoseContextLabel = (ctx?: string) => {
    switch (ctx) {
      case 'fasting':
        return tr(language, 'على الريق (صباحاً)', 'À jeun (matin)', 'Fasting (morning)');
      case 'post-meal':
        return tr(language, 'بعد الوجبة (ساعتان)', 'Post-prandial (2h après repas)', 'Post-meal (2h)');
      case 'random':
        return tr(language, 'قياس عشوائي', 'Aléatoire', 'Random');
      default:
        return tr(language, 'على الريق', 'À jeun', 'Fasting');
    }
  };

  // Helper translation for clinical notes into fluent medical French or English
  const translateNotes = (note?: string) => {
    if (!note) return '--';
    if (isAr) return note;

    if (note.includes('حبة الضغط') || note.includes('ضغط مستقر') || note.includes('أخذ حبة')) {
      return language === 'en'
        ? 'Morning reading 30 min after medication — BP stabilized.'
        : 'Mesure matinale 30 min après prise du traitement - TA stabilisée.';
    }
    if (note.includes('مسائي') || note.includes('عمل هادئ')) {
      return language === 'en'
        ? 'Evening reading at rest after a calm workday.'
        : 'Mesure vespérale au repos après une journée de travail calme.';
    }
    if (note.includes('إرهاق') || note.includes('سفر')) {
      return language === 'en'
        ? 'Mild reactive elevation following fatigue and travel.'
        : 'Légère élévation réactionnelle suite à la fatigue et au voyage.';
    }
    if (note.includes('كوفرسيل') || note.includes('متابعة شهرية')) {
      return language === 'en'
        ? 'Regular monthly follow-up on Coversyl (Perindopril).'
        : 'Contrôle mensuel régulier sous traitement par Coversyl (Périndopril).';
    }
    if (note.includes('مشي') || note.includes('رياضة')) {
      return language === 'en'
        ? 'Excellent therapeutic response combined with daily walking.'
        : 'Excellente réponse thérapeutique associée à la marche quotidienne.';
    }
    if (note.includes('غذائي') || note.includes('ملح')) {
      return language === 'en'
        ? 'Start of dietary rebalancing and low-sodium restriction.'
        : 'Début du rééquilibrage nutritionnel et restriction hyposodée.';
    }
    if (note.includes('تعديل جرعة') || note.includes('أولي')) {
      return language === 'en'
        ? 'Initial baseline check before dosage adjustment.'
        : 'Bilan de contrôle initial avant réajustement posologique.';
    }
    if (note.includes('توليد') || note.includes('24') || note.includes('الأسبوع')) {
      return language === 'en'
        ? 'Monthly prenatal visit (24 wks), normal BP and appropriate fetal biometry.'
        : 'Visite prénatale mensuelle (24 SA), tension normale et biométrie fœtale adéquate.';
    }
    if (note.includes('نمو الجنين') || note.includes('وزن الأم')) {
      return language === 'en'
        ? 'Healthy fetal growth and appropriate maternal weight gain.'
        : 'Croissance fœtale harmonieuse, prise pondérale maternelle conforme.';
    }
    if (note.includes('الثلث الأول') || note.includes('حيوية ممتازة')) {
      return language === 'en'
        ? 'End of 1st trimester of pregnancy, optimal hemodynamic vitals.'
        : 'Fin du 1er trimestre de grossesse, constantes hémodynamiques optimales.';
    }
    if (note.includes('لعريبي') || note.includes('18')) {
      return language === 'en'
        ? 'Routine 18-month pediatric check-up (Dr. Laribi).'
        : 'Visite pédiatrique systématique des 18 mois (Dr. Laribi).';
    }

    return localizeText(note, language);
  };

  // Custom Recharts Tooltip Component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div
          className="p-3 rounded-xl shadow-xl text-xs space-y-1.5 border"
          style={{
            backgroundColor: chartTheme.tooltipBg,
            borderColor: chartTheme.tooltipBorder,
          }}
        >
          <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-1">
            <span>📅 {dataPoint.fullDate}</span>
            <span className="font-mono text-[11px] text-slate-400">{dataPoint.time}</span>
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                {entry.value} {entry.unit || ''}
              </span>
            </div>
          ))}
          {dataPoint.notes && (
            <div className="text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800 italic max-w-xs">
              {translateNotes(dataPoint.notes)}
            </div>
          )}
          <div className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 pt-0.5">
            {tr(language, 'اضغط على النقطة لتثبيت التفاصيل الكاملة', 'Cliquez sur le point pour afficher les détails', 'Click point to pin full details')}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <HeartPulse className="w-7 h-7 text-teal-600 dark:text-teal-400" />
            <span>{tr(language, 'القياسات والمؤشرات الحيوية', 'Constantes & Paramètres Vitaux', 'Vitals & Health Metrics')}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {tr(
              language,
              `متابعة المؤشرات اليومية للمريض: ${activeMember.fullNameAr} - ضغط الدم، السكري، النبض ومؤشر كتلة الجسم.`,
              `Suivi continu des paramètres de santé de ${activeMember.fullNameFr} - Tension artérielle, glycémie capillaire, fréquence cardiaque et Indice de Masse Corporelle (IMC).`,
              `Continuous health tracking for ${activeMember.fullNameFr} - Blood pressure, blood glucose, heart rate, and Body Mass Index (BMI).`
            )}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold text-sm shadow-sm transition-all cursor-pointer shrink-0 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>{tr(language, '+ تسجيل قياس جديد', '+ Enregistrer une mesure', '+ Record New Vitals')}</span>
        </button>
      </div>

      {/* Primary Vitals Spotlight Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Blood Pressure */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {tr(language, 'ضغط الدم (BP)', 'Tension artérielle (TA)', 'Blood Pressure (BP)')}
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
              {latest?.systolicBp ? `${latest.systolicBp}/${latest.diastolicBp}` : '--/--'}
            </span>
            <span className="text-xs text-slate-400 font-bold">mmHg</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block">
            {latest?.systolicBp && latest.systolicBp <= 130
              ? tr(language, 'مستقر وضمن الهدف السريري', 'Pression optimale (< 130/85)', 'Optimal BP (< 130/85)')
              : tr(language, 'يحتاج متابعة وتعديل', 'Pression limite (à surveiller)', 'Borderline BP (monitor)')}
          </span>
        </div>

        {/* Blood Glucose */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {tr(language, 'سكر الدم', 'Glycémie', 'Blood Glucose')}
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
              {latest?.bloodGlucose ? latest.bloodGlucose : '--'}
            </span>
            <span className="text-xs text-slate-400 font-bold">g/L</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
            {latest?.glucoseContext ? getGlucoseContextLabel(latest.glucoseContext) : '--'}
          </span>
        </div>

        {/* Heart Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {tr(language, 'نبضات القلب', 'Fréquence cardiaque', 'Heart Rate')}
            </span>
            <div className="p-2 rounded-xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
              {latest?.heartRate ? latest.heartRate : '--'}
            </span>
            <span className="text-xs text-slate-400 font-bold">BPM</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block">
            {latest?.heartRate
              ? tr(language, 'نبض طبيعي في وضع الراحة', 'Rythme normal au repos', 'Normal resting heart rate')
              : '--'}
          </span>
        </div>

        {/* BMI & Weight */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {tr(language, 'الوزن و BMI', 'Poids & IMC', 'Weight & BMI')}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-slate-100">
              {latest?.weightKg ? latest.weightKg : '--'}
            </span>
            <span className="text-xs text-slate-400 font-bold">kg</span>
            {latest?.bmi && (
              <span className="text-xs text-teal-800 dark:text-teal-300 font-bold font-mono mr-1.5 ml-1.5">
                ({language === 'fr' ? 'IMC' : 'BMI'} {latest.bmi})
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
            {getBmiCategoryLabel(latest?.bmi)}
          </span>
        </div>

      </div>

      {/* Interactive Recharts Analytics Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-md space-y-6 transition-colors">
        
        {/* Section Header & View Toggles */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <span>{tr(language, 'التطور الزمني والرسوم البيانية التفاعلية', 'Évolution Graphique & Trajectoires Santé', 'Interactive Health Charts & Trends')}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {tr(
                language,
                'اضغط على أي نتيجة في الخط البياني لعرض كافة التفاصيل والملاحظات السريرية.',
                'Cliquez sur un point de la courbe pour afficher les détails complets de la mesure.',
                'Click any point on a chart line to view full measurement details and clinical notes.'
              )}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
            {[
              { id: 'all', labelAr: 'الكل', labelFr: "Vue d'ensemble", labelEn: 'Overview' },
              { id: 'blood_pressure', labelAr: 'ضغط الدم', labelFr: 'Tension (BP)', labelEn: 'Blood Pressure' },
              { id: 'glucose', labelAr: 'سكر الدم', labelFr: 'Glycémie', labelEn: 'Blood Glucose' },
              { id: 'weight_bmi', labelAr: 'الوزن و BMI', labelFr: 'Poids & IMC', labelEn: 'Weight & BMI' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveChartTab(tab.id as ChartTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeChartTab === tab.id
                    ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {tr(language, tab.labelAr, tab.labelFr, tab.labelEn)}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Point Details Panel (appears when clicking a result on any chart line) */}
        {selectedVital && (
          <div
            data-testid="vital-selected-details"
            className="rounded-2xl bg-teal-50/80 dark:bg-teal-950/35 border border-teal-200 dark:border-teal-800/70 p-4 space-y-3 transition-all"
          >
            <div className="flex items-center justify-between gap-2 border-b border-teal-200/70 dark:border-teal-800/60 pb-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-700 dark:bg-teal-600 text-white text-xs font-bold">
                  <Calendar className="w-3.5 h-3.5" />
                  <span dir="ltr" className="font-mono">{selectedVital.date}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-teal-900 dark:text-teal-200">
                  <Clock className="w-3.5 h-3.5" />
                  <span dir="ltr">{selectedVital.time}</span>
                </span>
                <span className="text-xs font-bold text-teal-800 dark:text-teal-300">
                  {tr(language, 'تفاصيل النتيجة المحددة', 'Détails de la mesure sélectionnée', 'Selected Reading Details')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVitalId(null)}
                aria-label={tr(language, 'إغلاق تفاصيل النتيجة', 'Fermer les détails', 'Close reading details')}
                className="p-1 rounded-lg text-teal-700 dark:text-teal-300 hover:bg-teal-100 dark:hover:bg-teal-900/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-xs">
              <div className="bg-white/90 dark:bg-slate-900/80 rounded-xl p-2.5 border border-teal-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  {tr(language, 'ضغط الدم', 'Tension', 'Blood Pressure')}
                </span>
                <span dir="ltr" className="font-mono font-extrabold text-sm text-rose-600 dark:text-rose-400 inline-block">
                  {selectedVital.systolicBp ? `${selectedVital.systolicBp}/${selectedVital.diastolicBp} mmHg` : '--'}
                </span>
              </div>

              <div className="bg-white/90 dark:bg-slate-900/80 rounded-xl p-2.5 border border-teal-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  {tr(language, 'سكر الدم', 'Glycémie', 'Blood Glucose')}
                </span>
                <span dir="ltr" className="font-mono font-extrabold text-sm text-blue-600 dark:text-blue-400 inline-block">
                  {selectedVital.bloodGlucose !== undefined ? `${selectedVital.bloodGlucose} g/L` : '--'}
                </span>
                {selectedVital.glucoseContext && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                    {getGlucoseContextLabel(selectedVital.glucoseContext)}
                  </span>
                )}
              </div>

              <div className="bg-white/90 dark:bg-slate-900/80 rounded-xl p-2.5 border border-teal-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  {tr(language, 'نبضات القلب', 'Pouls', 'Heart Rate')}
                </span>
                <span dir="ltr" className="font-mono font-extrabold text-sm text-slate-900 dark:text-slate-100 inline-block">
                  {selectedVital.heartRate ? `${selectedVital.heartRate} BPM` : '--'}
                </span>
              </div>

              <div className="bg-white/90 dark:bg-slate-900/80 rounded-xl p-2.5 border border-teal-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  {tr(language, 'الوزن', 'Poids', 'Weight')}
                </span>
                <span dir="ltr" className="font-mono font-extrabold text-sm text-emerald-600 dark:text-emerald-400 inline-block">
                  {selectedVital.weightKg !== undefined ? `${selectedVital.weightKg} kg` : '--'}
                </span>
              </div>

              <div className="bg-white/90 dark:bg-slate-900/80 rounded-xl p-2.5 border border-teal-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                  {tr(language, 'مؤشر الكتلة BMI', 'IMC', 'BMI')}
                </span>
                <span dir="ltr" className="font-mono font-extrabold text-sm text-violet-600 dark:text-violet-400 inline-block">
                  {selectedVital.bmi !== undefined ? selectedVital.bmi : '--'}
                </span>
                {selectedVital.bmi !== undefined && (
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                    {getBmiCategoryLabel(selectedVital.bmi)}
                  </span>
                )}
              </div>
            </div>

            {(selectedVital.temperatureC || selectedVital.oxygenSpO2 || selectedVital.notes) && (
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700 dark:text-slate-300 bg-white/75 dark:bg-slate-900/60 px-3 py-2 rounded-xl border border-teal-100/80 dark:border-slate-800">
                <span className="font-medium">
                  {translateNotes(selectedVital.notes)}
                </span>
                <div dir="ltr" className="flex items-center gap-3 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedVital.temperatureC && <span>{selectedVital.temperatureC} °C</span>}
                  {selectedVital.oxygenSpO2 && <span>SpO₂ {selectedVital.oxygenSpO2}%</span>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Charts Body */}
        {chartData.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            {tr(language, 'لا توجد بيانات كافية لرسم المنحنيات التفاعلية.', 'Données insuffisantes pour tracer les graphiques.', 'Insufficient data to plot interactive charts.')}
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* 1. Blood Pressure Chart */}
            {(activeChartTab === 'all' || activeChartTab === 'blood_pressure') && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500" />
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                      {tr(language, 'تغيرات ضغط الدم (انقباضي / انبساطي)', 'Évolution de la Tension Artérielle (Systolique / Diastolique)', 'Blood Pressure Trends (Systolic / Diastolic)')}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {tr(language, 'الهدف السريري: < 130/80 mmHg', 'Cible clinique : < 130/80 mmHg', 'Clinical target: < 130/80 mmHg')}
                  </span>
                </div>

                <div className="pt-2">
                  <ScrollableChartFrame
                    pointCount={chartData.length}
                    heightClass="h-64"
                    language={language}
                    testId="vitals-bp-chart-scroll"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 24, right: 64, left: 0, bottom: 14 }}
                        onClick={handleChartClick}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                        <XAxis
                          dataKey="date"
                          stroke={chartTheme.axisText}
                          fontSize={11}
                          tickLine={false}
                          padding={{ left: 24, right: 24 }}
                        />
                        <YAxis
                          stroke={chartTheme.axisText}
                          fontSize={11}
                          width={38}
                          domain={[55, 160]}
                          tickLine={false}
                          unit=" "
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          verticalAlign="top"
                          height={36}
                          formatter={(val: string) => {
                            if (val === 'systolic') return `\u00A0${tr(language, 'الانقباضي (Systolique mmHg)', 'Systolique (mmHg)', 'Systolic (mmHg)')}\u00A0`;
                            if (val === 'diastolic') return `\u00A0${tr(language, 'الانبساطي (Diastolique mmHg)', 'Diastolique (mmHg)', 'Diastolic (mmHg)')}\u00A0`;
                            return val;
                          }}
                        />
                        <ReferenceLine y={130} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: tr(language, 'حد 130', 'Cible 130', 'Target 130'), fill: '#f43f5e', fontSize: 10, position: 'right', dx: 6 }} />
                        <ReferenceLine y={80} stroke="#0d9488" strokeDasharray="4 4" label={{ value: tr(language, 'حد 80', 'Cible 80', 'Target 80'), fill: '#0d9488', fontSize: 10, position: 'right', dx: 6 }} />
                        <Line
                          type="monotone"
                          dataKey="systolic"
                          name="systolic"
                          stroke={chartTheme.systolic}
                          strokeWidth={3}
                          isAnimationActive={false}
                          dot={renderInteractiveDot(chartTheme.systolic, 'systolic', false)}
                          activeDot={renderInteractiveDot(chartTheme.systolic, 'systolic', true)}
                          unit="mmHg"
                        >
                          <LabelList
                            dataKey="systolic"
                            position="top"
                            offset={9}
                            formatter={formatChartNumericLabel}
                            fill={chartTheme.systolicLabel}
                            fontSize={11}
                            fontWeight={700}
                          />
                        </Line>
                        <Line
                          type="monotone"
                          dataKey="diastolic"
                          name="diastolic"
                          stroke={chartTheme.diastolic}
                          strokeWidth={3}
                          isAnimationActive={false}
                          dot={renderInteractiveDot(chartTheme.diastolic, 'diastolic', false)}
                          activeDot={renderInteractiveDot(chartTheme.diastolic, 'diastolic', true)}
                          unit="mmHg"
                        >
                          <LabelList
                            dataKey="diastolic"
                            position="bottom"
                            offset={9}
                            formatter={formatChartNumericLabel}
                            fill={chartTheme.diastolicLabel}
                            fontSize={11}
                            fontWeight={700}
                          />
                        </Line>
                      </LineChart>
                    </ResponsiveContainer>
                  </ScrollableChartFrame>
                </div>
              </div>
            )}

            {/* 2. Blood Glucose Chart */}
            {(activeChartTab === 'all' || activeChartTab === 'glucose') && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                      {tr(language, 'منحنى مستوى السكر في الدم (Glycémie g/L)', 'Trajectoire de la Glycémie à jeun (g/L)', 'Fasting Blood Glucose Trajectory (g/L)')}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {tr(language, 'المجال المرجعي الطبيعي: 0.70 - 1.10 g/L', 'Intervalle de référence : 0.70 - 1.10 g/L', 'Reference range: 0.70 - 1.10 g/L')}
                  </span>
                </div>

                <div className="pt-2">
                  <ScrollableChartFrame
                    pointCount={chartData.length}
                    heightClass="h-60"
                    language={language}
                    testId="vitals-glucose-chart-scroll"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={chartData}
                        margin={{ top: 24, right: 64, left: 0, bottom: 8 }}
                        onClick={handleChartClick}
                      >
                        <defs>
                          <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                        <XAxis
                          dataKey="date"
                          stroke={chartTheme.axisText}
                          fontSize={11}
                          tickLine={false}
                          padding={{ left: 24, right: 24 }}
                        />
                        <YAxis
                          stroke={chartTheme.axisText}
                          fontSize={11}
                          width={38}
                          domain={[0.6, 1.35]}
                          tickLine={false}
                          unit=" "
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          verticalAlign="top"
                          height={36}
                          formatter={() => `\u00A0${tr(language, 'سكر الدم (g/L)', 'Glycémie (g/L)', 'Blood Glucose (g/L)')}\u00A0`}
                        />
                        <ReferenceLine y={1.10} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: tr(language, 'حد 1.10', 'Max 1.10', 'Max 1.10'), fill: '#f59e0b', fontSize: 10, position: 'right', dx: 6 }} />
                        <ReferenceLine y={0.70} stroke="#10b981" strokeDasharray="3 3" label={{ value: tr(language, 'حد 0.70', 'Min 0.70', 'Min 0.70'), fill: '#10b981', fontSize: 10, position: 'right', dx: 6 }} />
                        <Area
                          type="monotone"
                          dataKey="glucose"
                          name="glucose"
                          stroke={chartTheme.glucose}
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#glucoseGradient)"
                          isAnimationActive={false}
                          dot={renderInteractiveDot(chartTheme.glucose, 'glucose', false)}
                          activeDot={renderInteractiveDot(chartTheme.glucose, 'glucose', true)}
                          unit="g/L"
                        >
                          <LabelList
                            dataKey="glucose"
                            position="top"
                            offset={9}
                            formatter={formatChartNumericLabel}
                            fill={chartTheme.glucoseLabel}
                            fontSize={11}
                            fontWeight={700}
                          />
                        </Area>
                      </AreaChart>
                    </ResponsiveContainer>
                  </ScrollableChartFrame>
                </div>
              </div>
            )}

            {/* 3. Weight & BMI Chart */}
            {(activeChartTab === 'all' || activeChartTab === 'weight_bmi') && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                      {tr(language, 'تغيرات الوزن ومؤشر كتلة الجسم (Poids & IMC)', 'Évolution Pondérale & Indice de Masse Corporelle (IMC)', 'Weight & Body Mass Index (BMI) Trends')}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {tr(language, 'المؤشر الطبيعي: 18.5 - 24.9', 'IMC normal : 18.5 - 24.9 kg/m²', 'Normal BMI: 18.5 - 24.9 kg/m²')}
                  </span>
                </div>

                <div className="pt-2">
                  <ScrollableChartFrame
                    pointCount={chartData.length}
                    heightClass="h-64"
                    language={language}
                    testId="vitals-weight-chart-scroll"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={chartData}
                        margin={{ top: 24, right: 16, left: 4, bottom: 14 }}
                        onClick={handleChartClick}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                        <XAxis
                          dataKey="date"
                          stroke={chartTheme.axisText}
                          fontSize={11}
                          tickLine={false}
                          padding={{ left: 26, right: 26 }}
                        />
                        <YAxis
                          yAxisId="weightAxis"
                          stroke={chartTheme.weight}
                          fontSize={11}
                          width={46}
                          allowDecimals={false}
                          domain={[(dataMin: number) => Math.floor(dataMin - 4), (dataMax: number) => Math.ceil(dataMax + 2)]}
                          tickLine={false}
                          unit="kg"
                        />
                        <YAxis
                          yAxisId="bmiAxis"
                          orientation="right"
                          stroke={chartTheme.bmi}
                          fontSize={11}
                          width={36}
                          allowDecimals={false}
                          domain={[(dataMin: number) => Math.floor(dataMin - 2), (dataMax: number) => Math.ceil(dataMax + 5)]}
                          tickLine={false}
                          unit=""
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          verticalAlign="top"
                          height={36}
                          formatter={(val: string) => {
                            if (val === 'weight') return `\u00A0${tr(language, 'الوزن (kg)', 'Poids (kg)', 'Weight (kg)')}\u00A0`;
                            if (val === 'bmi') return `\u00A0${tr(language, 'مؤشر الكتلة (IMC)', 'Indice de Masse Corporelle (IMC)', 'Body Mass Index (BMI)')}\u00A0`;
                            return val;
                          }}
                        />
                        <Line
                          yAxisId="weightAxis"
                          type="monotone"
                          dataKey="weight"
                          name="weight"
                          stroke={chartTheme.weight}
                          strokeWidth={3}
                          isAnimationActive={false}
                          dot={renderInteractiveDot(chartTheme.weight, 'weight', false)}
                          activeDot={renderInteractiveDot(chartTheme.weight, 'weight', true)}
                          unit="kg"
                        >
                          <LabelList
                            dataKey="weight"
                            position="top"
                            offset={9}
                            formatter={formatChartNumericLabel}
                            fill={chartTheme.weightLabel}
                            fontSize={11}
                            fontWeight={700}
                          />
                        </Line>
                        <Line
                          yAxisId="bmiAxis"
                          type="monotone"
                          dataKey="bmi"
                          name="bmi"
                          stroke={chartTheme.bmi}
                          strokeWidth={2.5}
                          strokeDasharray="4 2"
                          isAnimationActive={false}
                          dot={renderInteractiveDot(chartTheme.bmi, 'bmi', false)}
                          activeDot={renderInteractiveDot(chartTheme.bmi, 'bmi', true)}
                          unit="kg/m²"
                        >
                          <LabelList
                            dataKey="bmi"
                            position="bottom"
                            offset={9}
                            formatter={formatChartNumericLabel}
                            fill={chartTheme.bmiLabel}
                            fontSize={11}
                            fontWeight={700}
                          />
                        </Line>
                      </LineChart>
                    </ResponsiveContainer>
                  </ScrollableChartFrame>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Clinical Interpretation Notice */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-start gap-3 text-xs">
          <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {tr(language, 'ملخص تحليلي للاتجاه الصحي السريري:', 'Analyse Clinique des Tendances :', 'Clinical Trend Analysis:')}
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {tr(
                language,
                'تظهر الرسوم البيانية استجابة إيجابية ومستمرة؛ حيث انخفض ضغط الدم الانقباضي من 138 إلى 124 mmHg واستقر سكر الدم عند 0.96 g/L، مع نزول تدريجي في الوزن قدره 2.1 كغ بفضل الحمية الغذائية والنشاط البدني.',
                'Les graphiques indiquent une réponse thérapeutique favorable : normalisation tensionnelle (systolique passée de 138 à 124 mmHg), stabilisation de la glycémie à jeun (0.96 g/L) et réduction pondérale progressive de 2.1 kg.',
                'Charts show a positive, sustained therapeutic response: blood pressure normalized (systolic dropped from 138 to 124 mmHg), fasting glucose stabilized at 0.96 g/L, and weight steadily decreased by 2.1 kg.'
              )}
            </p>
          </div>
        </div>

      </div>

      {/* Vitals History Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/80">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {tr(language, 'سجل القياسات والمؤشرات الزمنية', 'Registre Chronologique des Constantes Vitales', 'Chronological Vitals Log')}
            </h3>
            <span className="text-xs text-slate-400">
              {activeMemberVitals.length} {tr(language, 'تسجيلات مدخلة', 'enregistrements saisis', 'recorded entries')}
            </span>
          </div>
        </div>

        {activeMemberVitals.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            {tr(language, 'لا توجد قياسات مسجلة بعد.', 'Aucune mesure pour l’instant.', 'No vitals recorded yet.')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full ${isAr ? 'text-right' : 'text-left'} text-xs`}>
              <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">{tr(language, 'التاريخ والوقت', 'Date & Heure', 'Date & Time')}</th>
                  <th className="p-3.5">{tr(language, 'ضغط الدم (mmHg)', 'Tension (mmHg)', 'BP (mmHg)')}</th>
                  <th className="p-3.5">{tr(language, 'النبض (BPM)', 'Pouls (BPM)', 'Heart Rate (BPM)')}</th>
                  <th className="p-3.5">{tr(language, 'سكر الدم (g/L)', 'Glycémie (g/L)', 'Glucose (g/L)')}</th>
                  <th className="p-3.5">{tr(language, 'الوزن (kg)', 'Poids (kg)', 'Weight (kg)')}</th>
                  <th className="p-3.5">{tr(language, 'مؤشر الكتلة (IMC)', 'IMC (kg/m²)', 'BMI (kg/m²)')}</th>
                  <th className="p-3.5">{tr(language, 'الملاحظات والسياق', 'Notes & Contexte', 'Notes & Context')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeMemberVitals.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="p-3.5 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {v.date} <span className="text-slate-400 text-[11px]">{v.time}</span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {v.systolicBp ? (
                        <span dir="ltr" className={`inline-block ${v.systolicBp > 135 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100'}`}>
                          {v.systolicBp}/{v.diastolicBp}
                        </span>
                      ) : '--'}
                    </td>
                    <td className="p-3.5 font-mono text-slate-800 dark:text-slate-200">
                      {v.heartRate ?? '--'}
                    </td>
                    <td className="p-3.5 font-mono text-slate-800 dark:text-slate-200">
                      {v.bloodGlucose ? (
                        <span className="font-bold">
                          {v.bloodGlucose}{' '}
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({v.glucoseContext ? getGlucoseContextLabel(v.glucoseContext) : 'g/L'})
                          </span>
                        </span>
                      ) : '--'}
                    </td>
                    <td className="p-3.5 font-mono text-slate-800 dark:text-slate-200">
                      {v.weightKg ? `${v.weightKg} kg` : '--'}
                    </td>
                    <td className="p-3.5 font-mono text-slate-800 dark:text-slate-200">
                      {v.bmi ? (
                        <span className="font-bold text-teal-800 dark:text-teal-300">
                          {v.bmi} <span className="text-[10px] font-normal text-slate-400">({getBmiCategoryLabel(v.bmi)})</span>
                        </span>
                      ) : '--'}
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                      {translateNotes(v.notes)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Vital Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 border border-transparent dark:border-slate-800">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <HeartPulse className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span>{tr(language, 'تسجيل قياسات صحية جديدة', 'Enregistrer de Nouvelles Constantes', 'Record New Vitals')}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVital} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'التاريخ', 'Date', 'Date')}
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'الوقت', 'Heure', 'Time')}
                  </label>
                  <input
                    type="time"
                    required
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Blood Pressure */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 space-y-2">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  {tr(language, 'ضغط الدم الشرياني (mmHg)', 'Tension Artérielle (mmHg)', 'Arterial Blood Pressure (mmHg)')}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                      {tr(language, 'الانقباضي (Systolique)', 'Systolique (max)', 'Systolic (max)')}
                    </label>
                    <input
                      type="number"
                      placeholder={tr(language, 'مثال: 125', 'Ex: 125', 'e.g., 125')}
                      value={form.systolicBp}
                      onChange={(e) => setForm({ ...form, systolicBp: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                      {tr(language, 'الانبساطي (Diastolique)', 'Diastolique (min)', 'Diastolic (min)')}
                    </label>
                    <input
                      type="number"
                      placeholder={tr(language, 'مثال: 82', 'Ex: 82', 'e.g., 82')}
                      value={form.diastolicBp}
                      onChange={(e) => setForm({ ...form, diastolicBp: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Glucose & Context */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'سكر الدم (g/L)', 'Glycémie (g/L)', 'Blood Glucose (g/L)')}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={tr(language, 'مثال: 0.98', 'Ex: 0.98', 'e.g., 0.98')}
                    value={form.bloodGlucose}
                    onChange={(e) => setForm({ ...form, bloodGlucose: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'سياق قياس السكر', 'Contexte glycémique', 'Glucose Context')}
                  </label>
                  <select
                    value={form.glucoseContext}
                    onChange={(e: any) => setForm({ ...form, glucoseContext: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  >
                    <option value="fasting">{tr(language, 'على الريق (صباحاً)', 'À jeun (matin)', 'Fasting (morning)')}</option>
                    <option value="post-meal">{tr(language, 'بعد الوجبة (ساعتان)', 'Post-prandial', 'Post-meal (2h)')}</option>
                    <option value="random">{tr(language, 'عشوائي', 'Aléatoire', 'Random')}</option>
                  </select>
                </div>
              </div>

              {/* Heart rate & Temp */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'نبض القلب (BPM)', 'Fréquence cardiaque (BPM)', 'Heart Rate (BPM)')}
                  </label>
                  <input
                    type="number"
                    placeholder={tr(language, 'مثال: 72', 'Ex: 72', 'e.g., 72')}
                    value={form.heartRate}
                    onChange={(e) => setForm({ ...form, heartRate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'الحرارة (°C)', 'Température (°C)', 'Temperature (°C)')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={tr(language, 'مثال: 36.6', 'Ex: 36.6', 'e.g., 36.6')}
                    value={form.temperatureC}
                    onChange={(e) => setForm({ ...form, temperatureC: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              {/* Weight & Height */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'الوزن (kg)', 'Poids corporel (kg)', 'Weight (kg)')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={tr(language, 'مثال: 78.5', 'Ex: 78.5', 'e.g., 78.5')}
                    value={form.weightKg}
                    onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'الطول (cm)', 'Taille (cm)', 'Height (cm)')}
                  </label>
                  <input
                    type="number"
                    placeholder={tr(language, 'مثال: 176', 'Ex: 176', 'e.g., 176')}
                    value={form.heightCm}
                    onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {tr(language, 'ملاحظات وسياق القياس', 'Observations & Contexte', 'Observations & Context')}
                </label>
                <input
                  type="text"
                  placeholder={tr(language, 'صباحاً بعد الاستيقاظ، بعد المشي...', 'Ex: Mesure matinale au repos, après traitement...', 'e.g., Morning resting reading, post-medication...')}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  {tr(language, 'إلغاء', 'Annuler', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold shadow-md cursor-pointer"
                >
                  {tr(language, 'حفظ القياس', 'Enregistrer la mesure', 'Save Vitals')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
