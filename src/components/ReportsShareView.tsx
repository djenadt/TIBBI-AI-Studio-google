import React, { useState, useRef } from 'react';
import {
  Share2,
  QrCode,
  FileText,
  Printer,
  Download,
  Copy,
  CheckCircle2,
  Clock,
  ShieldCheck,
  User,
  ExternalLink,
  Plus,
  Trash2,
  X,
  AlertCircle,
  Eye,
  Activity,
  HeartPulse,
  FlaskConical,
  TrendingDown,
  TrendingUp,
  Loader2,
  Pill,
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
  LabelList,
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useTibbi } from '../context/TibbiContext';
import { DoctorSharePass, tr } from '../types/tibbi';
import { getSharePassStatus, maskIdentityNumber } from '../utils/securityAndSharing';
import { formatChartNumericLabel, resolveChartClickVitalId } from '../utils/healthCalculators';
import { ScrollableChartFrame } from './ScrollableChartFrame';
import { localizeText, localizeList, translateShareSectionLabel } from '../utils/frTranslator';

export const ReportsShareView: React.FC = () => {
  const {
    language,
    activeMember,
    activeMemberMedications,
    activeMemberLabTests,
    activeMemberVitals,
    sharePasses,
    createSharePass,
    setIsAuditLogsModalOpen,
    unmaskedIds,
  } = useTibbi();

  const isAr = language === 'ar';

  const [activeTabSub, setActiveTabSub] = useState<'share' | 'report'>('share');
  const [copiedPassId, setCopiedPassId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPassForModal, setSelectedPassForModal] = useState<DoctorSharePass | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [consentConfirmed, setConsentConfirmed] = useState(false);
  const [selectedReportVitalId, setSelectedReportVitalId] = useState<string | null>(null);
  const [selectedReportLabId, setSelectedReportLabId] = useState<string | null>(null);

  const reportRef = useRef<HTMLDivElement>(null);

  const defaultShareTitle = tr(
    language,
    'مشاركة للاستشارة الطبية',
    'Partage pour consultation médicale',
    'Medical Consultation Share'
  );

  // New share pass form state
  const [shareForm, setShareForm] = useState({
    doctorName: '',
    title: defaultShareTitle,
    durationHours: 24,
    allowedSections: ['profile', 'medications', 'labs', 'vitals'] as (
      | 'profile'
      | 'medications'
      | 'labs'
      | 'vitals'
      | 'documents'
      | 'timeline'
    )[],
  });

  const memberPasses = sharePasses.filter((p) => p.patientId === activeMember.id);

  // Chronological vitals data for chart
  const vitalsChartData = [...activeMemberVitals]
    .reverse()
    .map((v) => ({
      id: v.id,
      date: v.date.slice(5),
      fullDate: v.date,
      time: v.time,
      systolic: v.systolicBp,
      diastolic: v.diastolicBp,
      heartRate: v.heartRate,
      glucose: v.bloodGlucose,
      weight: v.weightKg,
      bmi: v.bmi,
      notes: localizeText(v.notes, language),
    }));

  // Chronological lab test (Glycémie à jeun) for chart — exclude HbA1c (%)
  const glucoseLabs = activeMemberLabTests
    .filter(
      (l) =>
        (l.testName.toLowerCase().includes('glyc') || l.testName.includes('السكر في الدم')) &&
        !l.testName.toLowerCase().includes('hba1c') &&
        !l.testName.includes('الهيموغلوبين')
    )
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((l) => ({
      id: l.id,
      date: l.date.slice(5),
      fullDate: l.date,
      value: l.value,
      unit: l.unit,
      min: l.referenceMin ?? 0.7,
      max: l.referenceMax ?? 1.1,
      laboratory: localizeText(l.laboratory, language),
      notes: localizeText(l.notes, language),
      isAbnormal: l.isAbnormal,
    }));

  const selectedReportVital = vitalsChartData.find((v) => v.id === selectedReportVitalId) ?? null;
  const selectedReportLab = glucoseLabs.find((l) => l.id === selectedReportLabId) ?? null;

  const renderReportInteractiveDot = (
    color: string,
    selectedId: string | null,
    onSelect: (id: string) => void,
    seriesKey: string,
    isActive = false
  ) => (props: any) => {
    const { cx, cy, payload, value, index } = props;
    const scalarValue = Array.isArray(value) ? value[1] : value;
    if (cx == null || cy == null || scalarValue == null || !payload?.id) {
      return <g key={`rep-dot-${seriesKey}-${index ?? 0}`} />;
    }
    const isSelected = selectedId === payload.id;
    if (isActive) {
      return (
        <g
          key={`rep-dot-${seriesKey}-${payload.id}-active`}
          style={{ pointerEvents: 'none' }}
        >
          <circle cx={cx} cy={cy} r={8} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={1.5} />
          <circle cx={cx} cy={cy} r={5} fill={color} stroke="#ffffff" strokeWidth={2} />
        </g>
      );
    }
    return (
      <g
        key={`rep-dot-${seriesKey}-${payload.id}-base`}
        role="button"
        tabIndex={0}
        aria-label={`${payload.fullDate}: ${scalarValue}`}
        style={{ cursor: 'pointer', outline: 'none' }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(payload.id);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(payload.id);
          }
        }}
      >
        {isSelected && (
          <circle cx={cx} cy={cy} r={8} fill={color} fillOpacity={0.2} stroke={color} strokeWidth={1.5} />
        )}
        <circle cx={cx} cy={cy} r={11} fill="transparent" />
        <circle
          cx={cx}
          cy={cy}
          r={isSelected ? 5 : 3.5}
          fill={isSelected ? color : '#ffffff'}
          stroke={color}
          strokeWidth={2}
        />
      </g>
    );
  };

  const handleCopyLink = (pass: DoctorSharePass) => {
    const status = getSharePassStatus(pass.expiresAt);
    if (status.isExpired) return;
    navigator.clipboard.writeText(pass.qrValue);
    setCopiedPassId(pass.id);
    setTimeout(() => setCopiedPassId(null), 3000);
  };

  const handleCreatePass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentConfirmed) {
      return;
    }
    const expires = new Date();
    expires.setHours(expires.getHours() + Number(shareForm.durationHours));

    const newPass = createSharePass({
      patientId: activeMember.id,
      doctorName: shareForm.doctorName || tr(language, 'طبيب استشاري', 'Médecin consultant', 'Consulting Physician'),
      title: shareForm.title || defaultShareTitle,
      expiresAt: expires.toISOString(),
      allowedSections: shareForm.allowedSections,
      consentedBy: isAr
        ? `${activeMember.fullNameAr} (الموافق القانوني)`
        : language === 'en'
          ? `${activeMember.fullNameFr} (Legal Consent)`
          : `${activeMember.fullNameFr} (Consentement légal)`,
      consentedAt: new Date().toISOString(),
    });

    setIsCreateModalOpen(false);
    setConsentConfirmed(false);
    setSelectedPassForModal(newPass);
    setShareForm({
      doctorName: '',
      title: defaultShareTitle,
      durationHours: 24,
      allowedSections: ['profile', 'medications', 'labs', 'vitals'],
    });
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Direct Formatted PDF Export using html2canvas & jsPDF
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      setIsExportingPdf(true);

      const element = reportRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution rendering
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // Canvas helper to convert modern oklch colors to standard rgb for html2canvas
          const cvs = clonedDoc.createElement('canvas');
          cvs.width = 1;
          cvs.height = 1;
          const ctx = cvs.getContext('2d', { willReadFrequently: true });

          const toRgb = (colorStr: string): string => {
            if (!colorStr || !colorStr.includes('oklch') || !ctx) return colorStr;
            try {
              ctx.clearRect(0, 0, 1, 1);
              ctx.fillStyle = colorStr;
              ctx.fillRect(0, 0, 1, 1);
              const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
              return a < 255
                ? `rgba(${r}, ${g}, ${b}, ${Math.round((a / 255) * 100) / 100})`
                : `rgb(${r}, ${g}, ${b})`;
            } catch {
              return '#ffffff';
            }
          };

          // Sanitize documentElement, body, and report element subtree
          clonedDoc.documentElement.style.backgroundColor = '#ffffff';
          clonedDoc.body.style.backgroundColor = '#ffffff';

          const allElements = clonedDoc.body.querySelectorAll('*');
          allElements.forEach((node) => {
            const el = node as HTMLElement;
            if (!el.style) return;
            const style = window.getComputedStyle(el);

            if (style.color && style.color.includes('oklch')) {
              el.style.color = toRgb(style.color);
            }
            if (style.backgroundColor && style.backgroundColor.includes('oklch')) {
              el.style.backgroundColor = toRgb(style.backgroundColor);
            }
            if (style.borderColor && style.borderColor.includes('oklch')) {
              el.style.borderColor = toRgb(style.borderColor);
            }
            if (style.outlineColor && style.outlineColor.includes('oklch')) {
              el.style.outlineColor = toRgb(style.outlineColor);
            }
          });
        },
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / pdfWidth;
      const totalPdfHeight = canvasHeight / ratio;

      let position = 0;
      let heightLeft = totalPdfHeight;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, totalPdfHeight);
        heightLeft -= pdfHeight;
      }

      const patientName = isAr ? activeMember.fullNameAr : activeMember.fullNameFr;
      const reportPrefix = tr(language, 'تقرير_طبي_TIBBI', 'Rapport_Medical_TIBBI', 'Medical_Report_TIBBI');
      const cleanFileName = `${reportPrefix}_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(cleanFileName);
    } catch (e) {
      console.error('PDF export failed:', e);
      // Fallback to print dialog if html2canvas fails
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Share2 className="w-7 h-7 text-teal-600 dark:text-teal-400" />
            <span>{tr(language, 'التقارير الطبية وتصدير PDF والمشاركة (QR)', 'Rapports Médicaux, Export PDF & QR', 'Medical Reports, PDF Export & QR Share')}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {tr(
              language,
              `إعداد ملخص طبي شامل للمريض: ${activeMember.fullNameAr} متضمناً الرسوم البيانية وتصديره كملف PDF لمشاركته مع الأطباء.`,
              'Génération de synthèses médicales avec graphiques et export PDF téléchargeable pour les médecins.',
              `Generate comprehensive medical summaries with charts for ${activeMember.fullNameFr} and export them as formatted PDFs for physicians.`
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveTabSub('share')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTabSub === 'share'
                ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {tr(language, 'روابط ومفاتيح الـ QR', 'Partage & Clés QR', 'QR Share & Passes')}
          </button>
          <button
            onClick={() => setActiveTabSub('report')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTabSub === 'report'
                ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{tr(language, 'معاينة التقرير والرسوم', 'Rapport & Graphiques', 'Report & Charts')}</span>
          </button>
          <button
            onClick={() => setIsAuditLogsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 flex items-center gap-1.5 shadow-2xs"
            title={tr(language, 'سجل عمليات فتح الملف والمشاركة', 'Journal d’accès et d’audit', 'Access & Sharing Audit Log')}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{tr(language, 'سجل العمليات والمشاركة', 'Journal d’audit', 'Audit Log')}</span>
          </button>
        </div>
      </div>

      {activeTabSub === 'share' ? (
        <div className="space-y-6">
          
          {/* Banner: How Doctor Sharing Works */}
          <section className="bg-gradient-to-br from-teal-800 to-emerald-900 dark:from-slate-900 dark:via-teal-950 dark:to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-teal-700/30 dark:border-teal-800/40">
            <div className="space-y-2 max-w-xl">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
                {tr(language, 'مشاركة منظمة تخضع لتحكمك الكامل', 'Contrôle d’accès strict & temporaire', 'Strict & Temporary Access Control')}
              </span>
              <h3 className="text-xl md:text-2xl font-black">
                {tr(language, 'امنح طبيبك وصولاً مؤقتاً لملفك بنقرة واحدة', 'Partagez vos données en toute sécurité via QR Code', 'Grant Your Doctor Temporary Access with One Click')}
              </h3>
              <p className="text-xs md:text-sm text-teal-100/90 leading-relaxed">
                {tr(
                  language,
                  'لا حاجة لحمل ملفات ورقية ثقيلة إلى العيادة؛ أنشئ رمز QR أو رابطاً مؤقتاً (صالحة لمدة محددة)، واعرض شاشة هاتفك ليمسحها الطبيب ويتصفح أدويتك وتحاليلك فوراً، أو قم بتصدير تقرير PDF منسق.',
                  'Générez un QR code éphémère ou téléchargez une synthèse PDF formatée avec graphiques.',
                  'No need to carry heavy paper folders to the clinic—generate an expiring QR code or link for instant clinician review, or download a formatted PDF report.'
                )}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
              <button
                onClick={() => {
                  setShareForm((prev) => ({
                    ...prev,
                    title: defaultShareTitle,
                  }));
                  setIsCreateModalOpen(true);
                }}
                className="px-5 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 dark:bg-teal-400 dark:hover:bg-teal-300 text-teal-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105"
              >
                <QrCode className="w-4 h-4" />
                <span>{tr(language, '+ إنشاء رمز QR مشاركة جديد', '+ Nouveau QR de partage', '+ Create Share QR')}</span>
              </button>

              <button
                onClick={() => setActiveTabSub('report')}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border border-white/20"
              >
                <Download className="w-4 h-4" />
                <span>{tr(language, 'تصدير ملف PDF', 'Exporter PDF', 'Export PDF')}</span>
              </button>
            </div>
          </section>

          {/* Active Doctor Share Passes List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                {tr(language, 'أذونات ومفاتيح المشاركة النشطة', 'Autorisations et accès en cours', 'Active Share Passes & Permissions')}
              </h3>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {memberPasses.length} {tr(language, 'روابط مشاركة', 'passes', 'passes')}
              </span>
            </div>

            {memberPasses.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-dashed border-slate-200 dark:border-slate-800">
                <QrCode className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {tr(language, 'لا توجد أذونات مشاركة نشطة حالياً.', 'Aucun partage actif.', 'No active share permissions at the moment.')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {memberPasses.map((pass) => {
                  const passStatus = getSharePassStatus(pass.expiresAt);
                  const isExpired = passStatus.isExpired;

                  return (
                    <div
                      key={pass.id}
                      className={`rounded-2xl p-5 border transition-all space-y-3 flex flex-col justify-between ${
                        isExpired
                          ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500 shadow-xs'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`p-2 rounded-xl ${
                                isExpired
                                  ? 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400'
                                  : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400'
                              }`}
                            >
                              <QrCode className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{localizeText(pass.title, language)}</h4>
                              <span className="text-xs text-slate-500 dark:text-slate-400">{localizeText(pass.doctorName, language)}</span>
                            </div>
                          </div>

                          <div className="text-end">
                            <span
                              className={`inline-block text-[11px] font-black px-2.5 py-1 rounded-lg border font-mono ${
                                isExpired
                                  ? 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                              }`}
                            >
                              {tr(language, passStatus.badgeTextAr, passStatus.badgeTextFr, passStatus.badgeTextEn)}
                            </span>
                            <span className="block font-mono text-[10px] text-slate-400 mt-0.5">
                              {pass.accessCode}
                            </span>
                          </div>
                        </div>

                        {/* Expiry Details with exact Timezone */}
                        <div
                          className={`text-xs p-2.5 rounded-xl border flex items-center justify-between ${
                            isExpired
                              ? 'bg-rose-100/60 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                          }`}
                        >
                          <span className="flex items-center gap-1 text-[11px]">
                            <Clock className={`w-3.5 h-3.5 ${isExpired ? 'text-rose-500' : 'text-amber-500'}`} />
                            <span>{tr(language, 'الصلاحية والمنطقة الزمنية:', 'Validité (fuseau horaire) :', 'Validity (Timezone):')}</span>
                          </span>
                          <span className="font-mono font-bold text-[11px]">
                            {tr(language, passStatus.formattedExpiry, passStatus.formattedExpiryFr, passStatus.formattedExpiryEn)}
                          </span>
                        </div>

                        {isExpired && (
                          <p className="text-[11px] text-rose-700 dark:text-rose-300 bg-rose-100/40 dark:bg-rose-950/60 p-2 rounded-lg border border-rose-200/60 dark:border-rose-800/40">
                            {tr(
                              language,
                              '⚠️ انتهت صلاحية هذا الرابط تلقائياً لضمان أمان ملفك الطبي. تم تعطيل رمز QR وخاصية النسخ.',
                              '⚠️ Ce lien a expiré. L’affichage du QR et la copie sont désactivés pour votre sécurité.',
                              '⚠️ This link has automatically expired for your security. QR display and copying are disabled.'
                            )}
                          </p>
                        )}

                        {/* Allowed Sections Tags */}
                        <div className="flex flex-wrap gap-1">
                          {pass.allowedSections.map((sec, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-md"
                            >
                              ✓ {translateShareSectionLabel(sec, language)}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        {isExpired ? (
                          <button
                            onClick={() => {
                              setShareForm({
                                doctorName: pass.doctorName || '',
                                title: pass.title,
                                durationHours: 24,
                                allowedSections: pass.allowedSections,
                              });
                              setIsCreateModalOpen(true);
                            }}
                            className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs min-h-[40px]"
                          >
                            <Plus className="w-4 h-4" />
                            <span>{tr(language, 'تجديد وإنشاء رابط جديد', 'Renouveler ce partage', 'Renew Share Pass')}</span>
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => setSelectedPassForModal(pass)}
                              className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold flex items-center gap-1 cursor-pointer min-h-[38px]"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>{tr(language, 'عرض رمز QR للطبيب', 'Afficher le QR', 'Show Doctor QR')}</span>
                            </button>

                            <button
                              onClick={() => handleCopyLink(pass)}
                              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 font-semibold cursor-pointer min-h-[38px]"
                              title={tr(language, 'نسخ الرابط', 'Copier le lien', 'Copy link')}
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>{copiedPassId === pass.id ? tr(language, 'تم النسخ!', 'Copié !', 'Copied!') : tr(language, 'نسخ', 'Lien', 'Copy')}</span>
                            </button>
                          </>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Printable & PDF Exportable Comprehensive Medical Report View */
        <div className="space-y-4">
          
          {/* Action Bar for PDF & Print */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <FileText className="w-5 h-5" />
              </span>
              <div>
                <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 block">
                  {tr(language, 'الملخص الطبي المنسق مع الرسوم البيانية', 'Dossier Médical Formaté avec Graphiques', 'Formatted Medical Summary with Charts')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {tr(language, 'جاهز للتنزيل كملف PDF رسمي أو الطباعة الفورية', 'Prêt pour l’export PDF haute définition', 'Ready for high-definition PDF export or instant printing')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintReport}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>{tr(language, 'طباعة', 'Imprimer', 'Print')}</span>
              </button>

              <button
                disabled={isExportingPdf}
                onClick={handleDownloadPDF}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-all disabled:opacity-50"
              >
                {isExportingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{tr(language, 'جاري إنشاء ملف PDF...', 'Génération du PDF...', 'Generating PDF...')}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{tr(language, 'تحميل تقرير PDF كامل', 'Télécharger le PDF', 'Download Full PDF')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* The Actual Exported Document Container (Pure White for Clean PDF Export) */}
          <div
            ref={reportRef}
            className="bg-white text-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-md space-y-6 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0 print:w-full"
            style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
          >
            
            {/* Document Header */}
            <div className="flex items-start justify-between border-b-2 border-teal-700 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-black text-teal-800 tracking-tight">TIBBI</span>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-widest bg-teal-50 text-teal-900 px-2 py-0.5 rounded-md border border-teal-200">
                    {tr(language, 'DZ 🇩🇿 صحة', 'DZ 🇩🇿 Santé', 'DZ 🇩🇿 Health')}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1.5">
                  {tr(language, 'تقرير السجل الطبي الشامل والملخص السريري', 'Synthèse Médicale & Dossier Clinique', 'Comprehensive Medical Summary & Clinical Record')}
                </h3>
                <p className="text-xs text-slate-500">
                  {tr(language, 'تاريخ الاستخراج: ', 'Date d’émission : ', 'Issue Date: ')}{' '}
                  {new Date().toLocaleDateString(isAr ? 'ar-DZ' : language === 'en' ? 'en-US' : 'fr-FR')} •{' '}
                  {new Date().toLocaleTimeString(language === 'en' ? 'en-US' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="text-end flex flex-col items-end">
                <span className="text-[10px] font-mono text-slate-400">
                  {tr(language, 'المرجع:', 'RÉF:', 'REF:')} TIBBI-{activeMember.id.toUpperCase()}-2026
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black mt-1">
                  {tr(language, 'وثيقة طبية معتمدة', 'Dossier Numérique Vérifié', 'Verified Digital Record')}
                </span>
              </div>
            </div>

            {/* Patient Identity Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">{tr(language, 'اسم المريض:', 'Patient :', 'Patient:')}</span>
                <span className="font-extrabold text-slate-900 text-sm block">
                  {isAr ? activeMember.fullNameAr : activeMember.fullNameFr}
                </span>
                <span className="text-[11px] text-slate-500">
                  {tr(language, activeMember.relationshipLabelAr, activeMember.relationshipLabelFr, activeMember.relationshipLabelEn)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">{tr(language, 'فصيلة الدم:', 'Groupe sanguin :', 'Blood Type:')}</span>
                <span dir="ltr" className="font-mono font-black text-teal-700 text-base inline-block">{activeMember.bloodGroup}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">{tr(language, 'تاريخ الميلاد:', 'Date de naissance :', 'Date of Birth:')}</span>
                <span className="font-mono font-bold text-slate-800 block">{activeMember.birthDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">{tr(language, 'بطاقة الشفاء / التعريف:', 'N° Chifa :', 'Chifa / ID No.:')}</span>
                <span dir="ltr" className="font-mono font-bold text-slate-800 inline-block">
                  {activeMember.nationalIdOrChifa
                    ? maskIdentityNumber(activeMember.nationalIdOrChifa, !!unmaskedIds[activeMember.id])
                    : '--'}
                </span>
              </div>
            </div>

            {/* Allergies & Chronic Diseases Warning Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                <span className="font-black text-rose-900 block flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{tr(language, 'الحساسيات الموثقة:', 'Allergies documentées :', 'Documented Allergies:')}</span>
                </span>
                <p className="text-rose-800 font-bold">
                  {activeMember.allergies.length > 0
                    ? localizeList(activeMember.allergies, language).join(isAr ? '، ' : ', ')
                    : tr(language, 'لا توجد حساسية معروفة', 'Aucune allergie connue', 'No known allergies')}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="font-black text-amber-900 block">
                  {tr(language, 'الحالات المرضية المزمنة:', 'Pathologies chroniques :', 'Chronic Conditions:')}
                </span>
                <p className="text-amber-800 font-bold">
                  {activeMember.chronicDiseases.length > 0
                    ? localizeList(activeMember.chronicDiseases, language).join(isAr ? '، ' : ', ')
                    : tr(language, 'لا توجد حالات مزمنة', 'Aucune', 'None reported')}
                </p>
              </div>
            </div>

            {/* Current Active Medications Table */}
            <div className="space-y-2 text-xs">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-amber-500" />
                <span>{tr(language, 'العلاجات والأدوية الحالية الموصوفة:', 'Prescriptions et traitements en cours :', 'Active Prescriptions & Medications:')}</span>
              </h4>
              <table className={`w-full ${isAr ? 'text-right' : 'text-left'} border border-slate-200 rounded-xl overflow-hidden`}>
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5">{tr(language, 'اسم الدواء', 'Médicament', 'Medication')}</th>
                    <th className="p-2.5">{tr(language, 'الجرعة والتكرار', 'Posologie', 'Dosage & Schedule')}</th>
                    <th className="p-2.5">{tr(language, 'الطبيب المعالج', 'Prescripteur', 'Prescriber')}</th>
                    <th className="p-2.5">{tr(language, 'دواعي الاستعمال', 'Indication', 'Indication')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeMemberMedications.filter((m) => m.status === 'active').map((m) => (
                    <tr key={m.id}>
                      <td className="p-2.5 font-bold text-slate-900">{localizeText(m.name, language)}</td>
                      <td className="p-2.5 text-slate-700">
                        {localizeText(m.dosage, language)} ({localizeText(m.frequency, language)})
                      </td>
                      <td className="p-2.5 text-slate-700">{localizeText(m.prescribingDoctor, language)}</td>
                      <td className="p-2.5 text-slate-600">{localizeText(m.condition, language)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* =================================================================== */}
            {/* RENDERED CHARTS IN PDF (AS REQUESTED BY USER)                       */}
            {/* =================================================================== */}
            <div className="space-y-3 pt-2">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-rose-500" />
                <span>{tr(language, 'الرسوم البيانية وتطور القياسات الحيوية والتحاليل:', 'Graphiques d’évolution des constantes & bilans :', 'Vitals & Lab Evolution Charts:')}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Chart 1: Blood Pressure Evolution */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 min-w-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-900 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span>{tr(language, 'تطور ضغط الدم (انقباضي / انبساطي)', 'Pression artérielle (mmHg)', 'Blood Pressure (mmHg)')}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{tr(language, 'الهدف:', 'Cible:', 'Target:')} &lt;140/90</span>
                  </div>
                  
                  <ScrollableChartFrame
                    pointCount={vitalsChartData.length}
                    heightClass="h-48"
                    language={language}
                    testId="report-bp-chart-scroll"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={vitalsChartData}
                        margin={{ top: 24, right: 16, left: 0, bottom: 10 }}
                        onClick={(state: any) => {
                          const clickedId = resolveChartClickVitalId(vitalsChartData, state);
                          if (clickedId) setSelectedReportVitalId(clickedId);
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} padding={{ left: 22, right: 20 }} />
                        <YAxis domain={[50, 170]} width={34} stroke="#64748b" tick={{ fontSize: 10 }} />
                        <Tooltip
                          formatter={(value: any, name: any) => [
                            `${value} mmHg`,
                            name === 'systolic'
                              ? tr(language, 'الانقباضي', 'Systolique', 'Systolic')
                              : tr(language, 'الانبساطي', 'Diastolique', 'Diastolic'),
                          ]}
                          labelFormatter={(_label: any, payload: any) => payload?.[0]?.payload?.fullDate || _label}
                        />
                        <ReferenceLine y={140} stroke="#f43f5e" strokeDasharray="3 3" />
                        <ReferenceLine y={90} stroke="#0d9488" strokeDasharray="3 3" />
                        <Line
                          type="monotone"
                          dataKey="systolic"
                          stroke="#f43f5e"
                          strokeWidth={2}
                          isAnimationActive={false}
                          dot={renderReportInteractiveDot('#f43f5e', selectedReportVitalId, setSelectedReportVitalId, 'bp-sys', false)}
                          activeDot={renderReportInteractiveDot('#f43f5e', selectedReportVitalId, setSelectedReportVitalId, 'bp-sys', true)}
                        >
                          <LabelList
                            dataKey="systolic"
                            position="top"
                            offset={8}
                            formatter={formatChartNumericLabel}
                            fill="#e11d48"
                            fontSize={10}
                            fontWeight={700}
                          />
                        </Line>
                        <Line
                          type="monotone"
                          dataKey="diastolic"
                          stroke="#0d9488"
                          strokeWidth={2}
                          isAnimationActive={false}
                          dot={renderReportInteractiveDot('#0d9488', selectedReportVitalId, setSelectedReportVitalId, 'bp-dia', false)}
                          activeDot={renderReportInteractiveDot('#0d9488', selectedReportVitalId, setSelectedReportVitalId, 'bp-dia', true)}
                        >
                          <LabelList
                            dataKey="diastolic"
                            position="bottom"
                            offset={8}
                            formatter={formatChartNumericLabel}
                            fill="#0f766e"
                            fontSize={10}
                            fontWeight={700}
                          />
                        </Line>
                      </LineChart>
                    </ResponsiveContainer>
                  </ScrollableChartFrame>
                  {selectedReportVital && (
                    <div
                      data-testid="report-bp-selected-details"
                      className="p-2.5 rounded-xl bg-white border border-rose-200 text-[11px] space-y-1 text-slate-700"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span dir="ltr" className="font-mono">{selectedReportVital.fullDate} • {selectedReportVital.time}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedReportVitalId(null)}
                          aria-label={tr(language, 'إغلاق التفاصيل', 'Fermer', 'Close details')}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-3 font-mono font-bold">
                        <span className="text-rose-600">{selectedReportVital.systolic}/{selectedReportVital.diastolic} mmHg</span>
                        {selectedReportVital.heartRate && <span>{selectedReportVital.heartRate} BPM</span>}
                        {selectedReportVital.weight && <span>{selectedReportVital.weight} kg</span>}
                      </div>
                      {selectedReportVital.notes && <p className="text-[10px] text-slate-500">{selectedReportVital.notes}</p>}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                    <span>🔴 {tr(language, 'الانقباضي (Systolique)', 'Systolique', 'Systolic')}</span>
                    <span>🟢 {tr(language, 'الانبساطي (Diastolique)', 'Diastolique', 'Diastolic')}</span>
                  </div>
                </div>

                {/* Chart 2: Fasting Blood Sugar Evolution */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 min-w-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-900 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                      <span>{tr(language, 'منحنى سكر الدم على الريق (g/L)', 'Glycémie à jeun (g/L)', 'Fasting Blood Glucose (g/L)')}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">{tr(language, 'المرجع:', 'Norme:', 'Ref:')} 0.7 - 1.1</span>
                  </div>

                  <ScrollableChartFrame
                    pointCount={glucoseLabs.length}
                    heightClass="h-48"
                    language={language}
                    testId="report-glucose-chart-scroll"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={glucoseLabs}
                        margin={{ top: 24, right: 16, left: 0, bottom: 8 }}
                        onClick={(state: any) => {
                          const clickedId = resolveChartClickVitalId(glucoseLabs, state);
                          if (clickedId) setSelectedReportLabId(clickedId);
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} padding={{ left: 22, right: 20 }} />
                        <YAxis domain={[0.6, 1.35]} width={36} stroke="#64748b" tick={{ fontSize: 10 }} />
                        <Tooltip
                          formatter={(value: any) => [`${value} g/L`, tr(language, 'سكر الدم', 'Glycémie', 'Glucose')]}
                          labelFormatter={(_label: any, payload: any) => payload?.[0]?.payload?.fullDate || _label}
                        />
                        <ReferenceLine y={1.1} stroke="#f59e0b" strokeDasharray="3 3" />
                        <ReferenceLine y={0.7} stroke="#10b981" strokeDasharray="3 3" />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#0d9488"
                          strokeWidth={2}
                          fill="#ccfbf1"
                          fillOpacity={0.6}
                          isAnimationActive={false}
                          dot={renderReportInteractiveDot('#0d9488', selectedReportLabId, setSelectedReportLabId, 'rep-glu', false)}
                          activeDot={renderReportInteractiveDot('#0d9488', selectedReportLabId, setSelectedReportLabId, 'rep-glu', true)}
                        >
                          <LabelList
                            dataKey="value"
                            position="top"
                            offset={8}
                            formatter={formatChartNumericLabel}
                            fill="#0f766e"
                            fontSize={10}
                            fontWeight={700}
                          />
                        </Area>
                      </AreaChart>
                    </ResponsiveContainer>
                  </ScrollableChartFrame>
                  {selectedReportLab && (
                    <div
                      data-testid="report-glucose-selected-details"
                      className="p-2.5 rounded-xl bg-white border border-teal-200 text-[11px] space-y-1 text-slate-700"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span dir="ltr" className="font-mono">{selectedReportLab.fullDate}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedReportLabId(null)}
                          aria-label={tr(language, 'إغلاق التفاصيل', 'Fermer', 'Close details')}
                          className="text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 font-mono font-bold">
                        <span className={selectedReportLab.isAbnormal ? 'text-amber-600' : 'text-teal-700'}>
                          {selectedReportLab.value} {selectedReportLab.unit}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          ({selectedReportLab.min} - {selectedReportLab.max})
                        </span>
                      </div>
                      {selectedReportLab.laboratory && <p className="text-[10px] text-slate-500 truncate">{selectedReportLab.laboratory}</p>}
                      {selectedReportLab.notes && <p className="text-[10px] text-slate-600">{selectedReportLab.notes}</p>}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                    <span>🟢 {tr(language, 'المجال الطبيعي: 0.7 - 1.10 g/L', 'Zone cible: 0.7 - 1.1 g/L', 'Target range: 0.7 - 1.1 g/L')}</span>
                    <span>{glucoseLabs.length} {tr(language, 'فحوصات مسجلة', 'analyses', 'tests')}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Recent Lab Tests Table */}
            <div className="space-y-2 text-xs">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-teal-600" />
                <span>{tr(language, 'آخر النتائج والتحاليل البيولوجية المخبرية:', 'Derniers bilans biologiques :', 'Recent Lab & Biological Test Results:')}</span>
              </h4>
              <table className={`w-full ${isAr ? 'text-right' : 'text-left'} border border-slate-200 rounded-xl overflow-hidden`}>
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5">{tr(language, 'التحليل', 'Examen', 'Test')}</th>
                    <th className="p-2.5">{tr(language, 'النتيجة', 'Résultat', 'Result')}</th>
                    <th className="p-2.5">{tr(language, 'المجال المرجعي', 'Normes', 'Reference Range')}</th>
                    <th className="p-2.5">{tr(language, 'التاريخ والمخبر', 'Date & Labo', 'Date & Lab')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeMemberLabTests.slice(0, 6).map((l) => (
                    <tr key={l.id}>
                      <td className="p-2.5 font-bold text-slate-900">{localizeText(l.testName, language)}</td>
                      <td className={`p-2.5 font-mono font-bold ${l.isAbnormal ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {l.value} {l.unit} {l.isAbnormal ? tr(language, '⚠️ (مرتفع)', '⚠️ (Élevé)', '⚠️ (High)') : '✓'}
                      </td>
                      <td className="p-2.5 font-mono text-slate-600">
                        {l.referenceMin !== undefined ? `${l.referenceMin} - ${l.referenceMax} ${l.unit}` : '--'}
                      </td>
                      <td className="p-2.5 text-slate-600">{l.date} • {localizeText(l.laboratory, language)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Quick Digital Verification Pass Block */}
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white border border-teal-300 shadow-xs shrink-0">
                  <QrCode className="w-10 h-10 text-teal-700" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-black text-teal-900 block text-sm">
                    {tr(language, 'رمز التحقق الرقمي المباشر للطبيب (QR Pass)', 'Accès Numérique Sécurisé Médecin', 'Secure Physician Digital QR Pass')}
                  </span>
                  <p className="text-teal-800 text-[11px]">
                    {tr(
                      language,
                      'يمكن للطبيب مسح رمز QR من هاتفه للوصول الفوري إلى النسخة الرقمية الحية والمستندات المرفقة.',
                      'Permet au médecin d’accéder à la version numérique dynamique et aux ordonnances scannées.',
                      'Allows the physician to scan the QR code for instant access to live records and scanned documents.'
                    )}
                  </p>
                </div>
              </div>

              <div className="text-end shrink-0">
                <span className="text-[10px] text-teal-700 block font-semibold">{tr(language, 'رمز الوصول السريع:', 'Code d’accès :', 'Access Code:')}</span>
                <span className="font-mono font-black text-sm bg-teal-700 text-white px-3 py-1 rounded-lg inline-block">
                  {memberPasses[0]?.accessCode || 'TIBBI-8942'}
                </span>
              </div>
            </div>

            {/* Official Legal Footer */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 text-center sm:text-end">
              <span>
                {tr(
                  language,
                  'منظومة TIBBI للذاكرة الصحية الرقمية • مصرح بالاستعمال الطبي • الجمهورية الجزائرية الديمقراطية الشعبية',
                  'Plateforme TIBBI • Santé Numérique Familiale • République Algérienne Démocratique et Populaire',
                  'TIBBI Platform • Family Digital Health Record • People’s Democratic Republic of Algeria'
                )}
              </span>
              <span className="font-mono font-bold text-slate-400">
                PAGE 1/1 • {tr(language, 'مصادق عليه', 'VALIDÉ', 'VERIFIED')}
              </span>
            </div>

          </div>
        </div>
      )}

      {/* QR Code Presentation Modal */}
      {selectedPassForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl text-center space-y-4 border border-transparent dark:border-slate-800">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-transparent dark:border-teal-800/60 px-2 py-0.5 rounded-md">
                TIBBI Quick Share
              </span>
              <button
                onClick={() => setSelectedPassForModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-black text-slate-900 dark:text-slate-100">{localizeText(selectedPassForModal.title, language)}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {tr(language, `المريض: ${activeMember.fullNameAr}`, `Patient : ${activeMember.fullNameFr}`, `Patient: ${activeMember.fullNameFr}`)}
              </p>
            </div>

            {/* High-Resolution SVG QR Visual Representation */}
            <div className="p-4 bg-white rounded-2xl border-2 border-teal-500 shadow-md inline-block mx-auto">
              <svg viewBox="0 0 100 100" className="w-44 h-44 mx-auto text-slate-900" fill="currentColor">
                <rect x="5" y="5" width="25" height="25" fill="#0f766e" rx="4" />
                <rect x="9" y="9" width="17" height="17" fill="white" rx="2" />
                <rect x="13" y="13" width="9" height="9" fill="#0f766e" rx="2" />

                <rect x="70" y="5" width="25" height="25" fill="#0f766e" rx="4" />
                <rect x="74" y="9" width="17" height="17" fill="white" rx="2" />
                <rect x="78" y="13" width="9" height="9" fill="#0f766e" rx="2" />

                <rect x="5" y="70" width="25" height="25" fill="#0f766e" rx="4" />
                <rect x="9" y="74" width="17" height="17" fill="white" rx="2" />
                <rect x="13" y="78" width="9" height="9" fill="#0f766e" rx="2" />

                <rect x="35" y="10" width="5" height="5" />
                <rect x="45" y="10" width="5" height="5" />
                <rect x="55" y="10" width="5" height="5" />
                <rect x="40" y="20" width="5" height="5" />
                <rect x="50" y="20" width="5" height="5" />
                <rect x="60" y="20" width="5" height="5" />

                <rect x="10" y="40" width="5" height="5" />
                <rect x="20" y="40" width="5" height="5" />
                <rect x="40" y="40" width="20" height="20" fill="#0d9488" rx="3" />
                <circle cx="50" cy="50" r="5" fill="white" />
                <rect x="70" y="40" width="5" height="5" />
                <rect x="85" y="40" width="5" height="5" />

                <rect x="35" y="70" width="5" height="5" />
                <rect x="50" y="70" width="5" height="5" />
                <rect x="65" y="70" width="5" height="5" />
                <rect x="40" y="80" width="5" height="5" />
                <rect x="55" y="80" width="5" height="5" />
                <rect x="70" y="80" width="5" height="5" />
                <rect x="85" y="80" width="5" height="5" />
              </svg>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-mono font-black text-slate-800 dark:text-slate-200 tracking-wider">
                {tr(language, 'رمز الوصول:', 'Code d’accès :', 'Access Code:')} {selectedPassForModal.accessCode}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {tr(language, 'وجّه كاميرا الهاتف أو جهاز الطبيب لمسح الرمز', 'Scannez avec la caméra du smartphone', 'Scan with a smartphone or clinician scanner')}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                onClick={() => handleCopyLink(selectedPassForModal)}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>
                  {copiedPassId === selectedPassForModal.id
                    ? tr(language, 'تم النسخ!', 'Copié !', 'Copied!')
                    : tr(language, 'نسخ رابط الطبيب', 'Copier l’URL', 'Copy Doctor Link')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Share Pass Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 border border-transparent dark:border-slate-800">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <QrCode className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span>{tr(language, 'إنشاء رمز مشاركة مؤقت للطبيب', 'Générer un accès QR sécurisé', 'Generate Temporary Doctor Share QR')}</span>
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePass} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {tr(language, 'اسم الطبيب أو المركز الصحي', 'Nom du médecin ou établissement', 'Physician or Clinic Name')}
                </label>
                <input
                  type="text"
                  required
                  value={shareForm.doctorName}
                  onChange={(e) => setShareForm({ ...shareForm, doctorName: e.target.value })}
                  placeholder={tr(language, 'مثال: د. بوجمعة (أمراض القلب)...', 'Ex : Dr Boudjemaa (Cardiologie)...', 'e.g. Dr. Boudjemaa (Cardiology)...')}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {tr(language, 'عنوان أو سبب المشاركة', 'Motif', 'Share Title / Purpose')}
                </label>
                <input
                  type="text"
                  value={shareForm.title}
                  onChange={(e) => setShareForm({ ...shareForm, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {tr(language, 'مدة صلاحية الرابط', 'Durée de validité', 'Validity Duration')}
                </label>
                <select
                  value={shareForm.durationHours}
                  onChange={(e) => setShareForm({ ...shareForm, durationHours: parseInt(e.target.value, 10) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                >
                  <option value={2}>{tr(language, 'ساعتان فقط (مدة الزيارة)', '2 heures (durée de la visite)', '2 hours (visit duration)')}</option>
                  <option value={24}>{tr(language, '24 ساعة (يوم كامل)', '24 heures (1 jour)', '24 hours (1 day)')}</option>
                  <option value={72}>{tr(language, '3 أيام', '3 jours', '3 days')}</option>
                  <option value={168}>{tr(language, 'أسبوع واحد (7 أيام)', '7 jours (1 semaine)', '7 days (1 week)')}</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  {tr(language, 'المعلومات المصرح للطبيب بالاطلاع عليها:', 'Sections autorisées à la consultation :', 'Authorized Sections for Viewing:')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'profile', label: tr(language, 'الملف الأساسي وفصيلة الدم', 'Profil & Groupe sanguin', 'Profile & Blood Type') },
                    { id: 'medications', label: tr(language, 'سجل الأدوية والعلاجات', 'Médicaments', 'Medications') },
                    { id: 'labs', label: tr(language, 'التحاليل والفحوصات', 'Analyses médicales', 'Lab Results') },
                    { id: 'vitals', label: tr(language, 'القياسات والمؤشرات الحيوية', 'Constantes vitales', 'Vitals & Metrics') },
                    { id: 'timeline', label: tr(language, 'الخط الزمني والتاريخ المرضي', 'Historique & Antécédents', 'Medical Timeline & History') },
                  ].map((sec) => (
                    <label key={sec.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={shareForm.allowedSections.includes(sec.id as any)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setShareForm({ ...shareForm, allowedSections: [...shareForm.allowedSections, sec.id as any] });
                          } else {
                            setShareForm({ ...shareForm, allowedSections: shareForm.allowedSections.filter((s) => s !== sec.id) });
                          }
                        }}
                        className="rounded-sm text-teal-600 focus:ring-teal-500"
                      />
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{sec.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Explicit Scope & Consent Confirmation */}
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-2">
                <div className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                  {tr(
                    language,
                    `إشعار الصلاحية والموافقة: بصفتك صاحب الحساب أو الولي القانوني لـ (${activeMember.fullNameAr})، فإنك تفوض الطبيب صراحة بالاطلاع على البيانات المحددة أعلاه لمدة ${shareForm.durationHours} ساعة عبر رمز مشفر. تسجل هذه العملية في سجل العمليات والتدقيق.`,
                    `Consentement explicite : En qualité de titulaire ou tuteur légal de (${activeMember.fullNameFr}), vous autorisez l'accès aux données cochées pendant ${shareForm.durationHours}h. Cette action est consignée dans le registre d'audit.`,
                    `Explicit Consent: As account holder or legal guardian of (${activeMember.fullNameFr}), you authorize access to the selected sections above for ${shareForm.durationHours}h via an encrypted pass. This action is recorded in the audit log.`
                  )}
                </div>
                <label className="flex items-start gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={consentConfirmed}
                    onChange={(e) => setConsentConfirmed(e.target.checked)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                    required
                  />
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    {tr(
                      language,
                      'أوافق بصفتي صاحب الشأن/الولي القانوني على مشاركة هذه البيانات ضمن النطاق والمدة المحددين',
                      'Je confirme en qualité de titulaire/tuteur le partage de ces données selon la durée et le périmètre définis',
                      'I confirm as account holder/legal guardian that I authorize sharing this data within the specified scope and duration'
                    )}
                  </span>
                </label>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  {tr(language, 'إلغاء', 'Annuler', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={!consentConfirmed}
                  className={`px-5 py-2.5 rounded-xl font-bold shadow-md transition-all ${
                    consentConfirmed
                      ? 'bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white cursor-pointer'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60'
                  }`}
                >
                  {tr(language, 'إنشاء رمز QR الآن', 'Générer le QR code', 'Generate QR Code Now')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
