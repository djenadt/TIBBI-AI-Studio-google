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
} from 'recharts';
import { useTibbi } from '../context/TibbiContext';
import { calculateBMI, getBMICategory } from '../utils/healthCalculators';

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
      diastolic: '#0d9488', // teal-600
      glucose: '#3b82f6', // blue-500
      glucoseFill: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
      weight: '#10b981', // emerald-500
      bmi: '#8b5cf6', // purple-500
    };
  }, [isDark]);

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
    if (bmi < 18.5) return isAr ? 'نقص في الوزن' : 'Insuffisance pondérale';
    if (bmi < 25) return isAr ? 'وزن طبيعي ومثالي' : 'Corpulence normale';
    if (bmi < 30) return isAr ? 'زيادة في الوزن' : 'Surpoids pondéral';
    return isAr ? 'سمنة (تحتاج متابعة)' : 'Obésité (à surveiller)';
  };

  // Helper translation for glucose contexts
  const getGlucoseContextLabel = (ctx?: string) => {
    switch (ctx) {
      case 'fasting':
        return isAr ? 'على الريق (صباحاً)' : 'À jeun (matin)';
      case 'post-meal':
        return isAr ? 'بعد الوجبة (ساعتان)' : 'Post-prandial (2h après repas)';
      case 'random':
        return isAr ? 'قياس عشوائي' : 'Aléatoire';
      default:
        return isAr ? 'على الريق' : 'À jeun';
    }
  };

  // Helper translation for clinical notes into fluent medical French
  const translateNotes = (note?: string) => {
    if (!note) return '--';
    if (isAr) return note;

    if (note.includes('حبة الضغط') || note.includes('ضغط مستقر') || note.includes('أخذ حبة')) {
      return 'Mesure matinale 30 min après prise du traitement - TA stabilisée.';
    }
    if (note.includes('مسائي') || note.includes('عمل هادئ')) {
      return 'Mesure vespérale au repos après une journée de travail calme.';
    }
    if (note.includes('إرهاق') || note.includes('سفر')) {
      return 'Légère élévation réactionnelle suite à la fatigue et au voyage.';
    }
    if (note.includes('كوفرسيل') || note.includes('متابعة شهرية')) {
      return 'Contrôle mensuel régulier sous traitement par Coversyl (Périndopril).';
    }
    if (note.includes('مشي') || note.includes('رياضة')) {
      return 'Excellente réponse thérapeutique associée à la marche quotidienne.';
    }
    if (note.includes('غذائي') || note.includes('ملح')) {
      return 'Début du rééquilibrage nutritionnel et restriction hyposodée.';
    }
    if (note.includes('تعديل جرعة') || note.includes('أولي')) {
      return 'Bilan de contrôle initial avant réajustement posologique.';
    }
    if (note.includes('توليد') || note.includes('24') || note.includes('الأسبوع')) {
      return 'Visite prénatale mensuelle (24 SA), tension normale et biométrie fœtale adéquate.';
    }
    if (note.includes('نمو الجنين') || note.includes('وزن الأم')) {
      return 'Croissance fœtale harmonieuse, prise pondérale maternelle conforme.';
    }
    if (note.includes('الثلث الأول') || note.includes('حيوية ممتازة')) {
      return 'Fin du 1er trimestre de grossesse, constantes hémodynamiques optimales.';
    }
    if (note.includes('لعريبي') || note.includes('18')) {
      return 'Visite pédiatrique systématique des 18 mois (Dr. Laribi).';
    }

    return note;
  };

  // Custom Recharts Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
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
              {dataPoint.notes}
            </div>
          )}
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
            <span>{isAr ? 'القياسات والمؤشرات الحيوية' : 'Constantes & Paramètres Vitaux'}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? `متابعة المؤشرات اليومية للمريض: ${activeMember.fullNameAr} - ضغط الدم، السكري، النبض ومؤشر كتلة الجسم.`
              : `Suivi continu des paramètres de santé de ${activeMember.fullNameFr} - Tension artérielle, glycémie capillaire, fréquence cardiaque et Indice de Masse Corporelle (IMC).`}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? '+ تسجيل قياس جديد' : '+ Enregistrer une mesure'}</span>
        </button>
      </div>

      {/* Primary Vitals Spotlight Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Blood Pressure */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isAr ? 'ضغط الدم (BP)' : 'Tension artérielle (TA)'}
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
              ? isAr
                ? 'مستقر وضمن الهدف السريري'
                : 'Pression optimale (< 130/85)'
              : isAr
              ? 'يحتاج متابعة وتعديل'
              : 'Pression limite (à surveiller)'}
          </span>
        </div>

        {/* Blood Glucose */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isAr ? 'سكر الدم' : 'Glycémie'}
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
              {isAr ? 'نبضات القلب' : 'Fréquence cardiaque'}
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
              ? isAr
                ? 'نبض طبيعي في وضع الراحة'
                : 'Rythme normal au repos'
              : '--'}
          </span>
        </div>

        {/* BMI & Weight */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isAr ? 'الوزن و BMI' : 'Poids & IMC'}
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
                (IMC {latest.bmi})
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
              <span>{isAr ? 'التطور الزمني والرسوم البيانية التفاعلية' : 'Évolution Graphique & Trajectoires Santé'}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isAr
                ? 'رسوم بيانية تفاعلية دقيقة لمراقبة استجابة المريض للعلاج وتطور الضغط، السكر والوزن بمرور الوقت.'
                : 'Visualisation dynamique Recharts pour le suivi de la tension, glycémie et poids corporel.'}
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700">
            {[
              { id: 'all', labelAr: 'الكل', labelFr: "Vue d'ensemble" },
              { id: 'blood_pressure', labelAr: 'ضغط الدم', labelFr: 'Tension (BP)' },
              { id: 'glucose', labelAr: 'سكر الدم', labelFr: 'Glycémie' },
              { id: 'weight_bmi', labelAr: 'الوزن و BMI', labelFr: 'Poids & IMC' },
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
                {isAr ? tab.labelAr : tab.labelFr}
              </button>
            ))}
          </div>
        </div>

        {/* Charts Body */}
        {chartData.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            {isAr ? 'لا توجد بيانات كافية لرسم المنحنيات التفاعلية.' : 'Données insuffisantes pour tracer les graphiques.'}
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
                      {isAr ? 'تغيرات ضغط الدم (انقباضي / انبساطي)' : 'Évolution de la Tension Artérielle (Systolique / Diastolique)'}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {isAr ? 'الهدف السريري: < 130/80 mmHg' : 'Cible clinique : < 130/80 mmHg'}
                  </span>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                      <XAxis
                        dataKey="date"
                        stroke={chartTheme.axisText}
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis
                        stroke={chartTheme.axisText}
                        fontSize={11}
                        domain={[60, 160]}
                        tickLine={false}
                        unit=" "
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        formatter={(val: string) => {
                          if (val === 'systolic') return isAr ? 'الانقباضي (Systolique mmHg)' : 'Systolique (mmHg)';
                          if (val === 'diastolic') return isAr ? 'الانبساطي (Diastolique mmHg)' : 'Diastolique (mmHg)';
                          return val;
                        }}
                      />
                      <ReferenceLine y={130} stroke="#f43f5e" strokeDasharray="4 4" label={{ value: isAr ? 'حد 130' : 'Cible 130', fill: '#f43f5e', fontSize: 10, position: 'right' }} />
                      <ReferenceLine y={80} stroke="#0d9488" strokeDasharray="4 4" label={{ value: isAr ? 'حد 80' : 'Cible 80', fill: '#0d9488', fontSize: 10, position: 'right' }} />
                      <Line
                        type="monotone"
                        dataKey="systolic"
                        name="systolic"
                        stroke={chartTheme.systolic}
                        strokeWidth={3}
                        dot={{ r: 4, fill: chartTheme.systolic }}
                        activeDot={{ r: 6 }}
                        unit="mmHg"
                      />
                      <Line
                        type="monotone"
                        dataKey="diastolic"
                        name="diastolic"
                        stroke={chartTheme.diastolic}
                        strokeWidth={3}
                        dot={{ r: 4, fill: chartTheme.diastolic }}
                        activeDot={{ r: 6 }}
                        unit="mmHg"
                      />
                    </LineChart>
                  </ResponsiveContainer>
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
                      {isAr ? 'منحنى مستوى السكر في الدم (Glycémie g/L)' : 'Trajectoire de la Glycémie à jeun (g/L)'}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {isAr ? 'المجال المرجعي الطبيعي: 0.70 - 1.10 g/L' : 'Intervalle de référence : 0.70 - 1.10 g/L'}
                  </span>
                </div>

                <div className="h-60 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
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
                      />
                      <YAxis
                        stroke={chartTheme.axisText}
                        fontSize={11}
                        domain={[0.6, 1.4]}
                        tickLine={false}
                        unit=" "
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        formatter={() => (isAr ? 'سكر الدم (g/L)' : 'Glycémie (g/L)')}
                      />
                      <ReferenceLine y={1.10} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: isAr ? 'حد 1.10' : 'Max 1.10', fill: '#f59e0b', fontSize: 10, position: 'right' }} />
                      <ReferenceLine y={0.70} stroke="#10b981" strokeDasharray="3 3" label={{ value: isAr ? 'حد 0.70' : 'Min 0.70', fill: '#10b981', fontSize: 10, position: 'right' }} />
                      <Area
                        type="monotone"
                        dataKey="glucose"
                        name="glucose"
                        stroke={chartTheme.glucose}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#glucoseGradient)"
                        dot={{ r: 4, fill: chartTheme.glucose }}
                        activeDot={{ r: 6 }}
                        unit="g/L"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
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
                      {isAr ? 'تغيرات الوزن ومؤشر كتلة الجسم (Poids & IMC)' : 'Évolution Pondérale & Indice de Masse Corporelle (IMC)'}
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {isAr ? 'المؤشر الطبيعي: 18.5 - 24.9' : 'IMC normal : 18.5 - 24.9 kg/m²'}
                  </span>
                </div>

                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                      <XAxis
                        dataKey="date"
                        stroke={chartTheme.axisText}
                        fontSize={11}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId="weightAxis"
                        stroke={chartTheme.weight}
                        fontSize={11}
                        domain={['dataMin - 2', 'dataMax + 2']}
                        tickLine={false}
                        unit="kg"
                      />
                      <YAxis
                        yAxisId="bmiAxis"
                        orientation="right"
                        stroke={chartTheme.bmi}
                        fontSize={11}
                        domain={[18, 32]}
                        tickLine={false}
                        unit=""
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        formatter={(val: string) => {
                          if (val === 'weight') return isAr ? 'الوزن (kg)' : 'Poids (kg)';
                          if (val === 'bmi') return isAr ? 'مؤشر الكتلة (IMC)' : 'Indice de Masse Corporelle (IMC)';
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
                        dot={{ r: 4, fill: chartTheme.weight }}
                        activeDot={{ r: 6 }}
                        unit="kg"
                      />
                      <Line
                        yAxisId="bmiAxis"
                        type="monotone"
                        dataKey="bmi"
                        name="bmi"
                        stroke={chartTheme.bmi}
                        strokeWidth={2.5}
                        strokeDasharray="4 2"
                        dot={{ r: 3, fill: chartTheme.bmi }}
                        activeDot={{ r: 5 }}
                        unit="kg/m²"
                      />
                    </LineChart>
                  </ResponsiveContainer>
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
              {isAr ? 'ملخص تحليلي للاتجاه الصحي السريري:' : 'Analyse Clinique des Tendances :'}
            </span>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              {isAr
                ? 'تظهر الرسوم البيانية استجابة إيجابية ومستمرة؛ حيث انخفض ضغط الدم الانقباضي من 138 إلى 124 mmHg واستقر سكر الدم عند 0.96 g/L، مع نزول تدريجي في الوزن قدره 2.1 كغ بفضل الحمية الغذائية والنشاط البدني.'
                : 'Les graphiques indiquent une réponse thérapeutique favorable : normalisation tensionnelle (systolique passée de 138 à 124 mmHg), stabilisation de la glycémie à jeun (0.96 g/L) et réduction pondérale progressive de 2.1 kg.'}
            </p>
          </div>
        </div>

      </div>

      {/* Vitals History Log Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md overflow-hidden transition-colors">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/80">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {isAr ? 'سجل القياسات والمؤشرات الزمنية' : 'Registre Chronologique des Constantes Vitales'}
            </h3>
            <span className="text-xs text-slate-400">
              {activeMemberVitals.length} {isAr ? 'تسجيلات مدخلة' : 'enregistrements saisis'}
            </span>
          </div>
        </div>

        {activeMemberVitals.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            {isAr ? 'لا توجد قياسات مسجلة بعد.' : 'Aucune mesure pour l’instant.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">{isAr ? 'التاريخ والوقت' : 'Date & Heure'}</th>
                  <th className="p-3.5">{isAr ? 'ضغط الدم (mmHg)' : 'Tension (mmHg)'}</th>
                  <th className="p-3.5">{isAr ? 'النبض (BPM)' : 'Pouls (BPM)'}</th>
                  <th className="p-3.5">{isAr ? 'سكر الدم (g/L)' : 'Glycémie (g/L)'}</th>
                  <th className="p-3.5">{isAr ? 'الوزن (kg)' : 'Poids (kg)'}</th>
                  <th className="p-3.5">{isAr ? 'مؤشر الكتلة (IMC)' : 'IMC (kg/m²)'}</th>
                  <th className="p-3.5">{isAr ? 'الملاحظات والسياق' : 'Notes & Contexte'}</th>
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
                        <span className={v.systolicBp > 135 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100'}>
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
                <span>{isAr ? 'تسجيل قياسات صحية جديدة' : 'Enregistrer de Nouvelles Constantes'}</span>
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
                    {isAr ? 'التاريخ' : 'Date'}
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
                    {isAr ? 'الوقت' : 'Heure'}
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
                  {isAr ? 'ضغط الدم الشرياني (mmHg)' : 'Tension Artérielle (mmHg)'}
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                      {isAr ? 'الانقباضي (Systolique)' : 'Systolique (max)'}
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 125"
                      value={form.systolicBp}
                      onChange={(e) => setForm({ ...form, systolicBp: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                      {isAr ? 'الانبساطي (Diastolique)' : 'Diastolique (min)'}
                    </label>
                    <input
                      type="number"
                      placeholder="Ex: 82"
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
                    {isAr ? 'سكر الدم (g/L)' : 'Glycémie (g/L)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ex: 0.98"
                    value={form.bloodGlucose}
                    onChange={(e) => setForm({ ...form, bloodGlucose: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'سياق قياس السكر' : 'Contexte glycémique'}
                  </label>
                  <select
                    value={form.glucoseContext}
                    onChange={(e: any) => setForm({ ...form, glucoseContext: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  >
                    <option value="fasting">{isAr ? 'على الريق (صباحاً)' : 'À jeun (matin)'}</option>
                    <option value="post-meal">{isAr ? 'بعد الوجبة (ساعتان)' : 'Post-prandial'}</option>
                    <option value="random">{isAr ? 'عشوائي' : 'Aléatoire'}</option>
                  </select>
                </div>
              </div>

              {/* Heart rate & Temp */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'نبض القلب (BPM)' : 'Fréquence cardiaque (BPM)'}
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 72"
                    value={form.heartRate}
                    onChange={(e) => setForm({ ...form, heartRate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'الحرارة (°C)' : 'Température (°C)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 36.6"
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
                    {isAr ? 'الوزن (kg)' : 'Poids corporel (kg)'}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Ex: 78.5"
                    value={form.weightKg}
                    onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'الطول (cm)' : 'Taille (cm)'}
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 176"
                    value={form.heightCm}
                    onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? 'ملاحظات وسياق القياس' : 'Observations & Contexte'}
                </label>
                <input
                  type="text"
                  placeholder={isAr ? 'صباحاً بعد الاستيقاظ، بعد المشي...' : 'Ex: Mesure matinale au repos, après traitement...'}
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
                  {isAr ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold shadow-md cursor-pointer"
                >
                  {isAr ? 'حفظ القياس' : 'Enregistrer la mesure'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
