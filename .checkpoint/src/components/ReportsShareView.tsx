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
  ReferenceLine,
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useTibbi } from '../context/TibbiContext';
import { DoctorSharePass } from '../types/tibbi';

export const ReportsShareView: React.FC = () => {
  const {
    language,
    activeMember,
    activeMemberMedications,
    activeMemberLabTests,
    activeMemberVitals,
    sharePasses,
    createSharePass,
  } = useTibbi();

  const isAr = language === 'ar';

  const [activeTabSub, setActiveTabSub] = useState<'share' | 'report'>('share');
  const [copiedPassId, setCopiedPassId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPassForModal, setSelectedPassForModal] = useState<DoctorSharePass | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  // New share pass form state
  const [shareForm, setShareForm] = useState({
    doctorName: '',
    title: isAr ? 'مشاركة للاستشارة الطبية' : 'Partage pour consultation médicale',
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
    .slice(-6)
    .map((v) => ({
      date: v.date.slice(5),
      fullDate: v.date,
      systolic: v.systolicBp,
      diastolic: v.diastolicBp,
      glucose: v.bloodGlucose,
      weight: v.weightKg,
    }));

  // Chronological lab test (Glycémie à jeun & Cholestérol) for chart
  const glucoseLabs = activeMemberLabTests
    .filter((l) => l.testName.toLowerCase().includes('glyc') || l.testName.includes('السكر'))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-5)
    .map((l) => ({
      date: l.date.slice(5),
      fullDate: l.date,
      value: l.value,
      min: l.referenceMin ?? 0.7,
      max: l.referenceMax ?? 1.1,
    }));

  const handleCopyLink = (pass: DoctorSharePass) => {
    navigator.clipboard.writeText(pass.qrValue);
    setCopiedPassId(pass.id);
    setTimeout(() => setCopiedPassId(null), 3000);
  };

  const handleCreatePass = (e: React.FormEvent) => {
    e.preventDefault();
    const expires = new Date();
    expires.setHours(expires.getHours() + Number(shareForm.durationHours));

    const newPass = createSharePass({
      patientId: activeMember.id,
      doctorName: shareForm.doctorName || (isAr ? 'طبيب استشاري' : 'Médecin consultant'),
      title: shareForm.title,
      expiresAt: expires.toISOString(),
      allowedSections: shareForm.allowedSections,
    });

    setIsCreateModalOpen(false);
    setSelectedPassForModal(newPass);
    setShareForm({
      doctorName: '',
      title: isAr ? 'مشاركة للاستشارة الطبية' : 'Partage pour consultation',
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
      const cleanFileName = `Rapport_Medical_TIBBI_${patientName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
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
            <span>{isAr ? 'التقارير الطبية وتصدير PDF والمشاركة (QR)' : 'Rapports Médicaux, Export PDF & QR'}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? `إعداد ملخص طبي شامل للمريض: ${activeMember.fullNameAr} متضمناً الرسوم البيانية وتصديره كملف PDF لمشاركته مع الأطباء.`
              : `Génération de synthèses médicales avec graphiques et export PDF téléchargeable pour les médecins.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTabSub('share')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTabSub === 'share'
                ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {isAr ? 'روابط ومفاتيح الـ QR' : 'Partage & Clés QR'}
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
            <span>{isAr ? 'معاينة التقرير الطبي والرسوم' : 'Rapport & Graphiques'}</span>
          </button>
        </div>
      </div>

      {activeTabSub === 'share' ? (
        <div className="space-y-6">
          
          {/* Banner: How Doctor Sharing Works */}
          <section className="bg-gradient-to-br from-teal-800 to-emerald-900 dark:from-slate-900 dark:via-teal-950 dark:to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-teal-700/30 dark:border-teal-800/40">
            <div className="space-y-2 max-w-xl">
              <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
                {isAr ? 'مشاركة منظمة تخضع لتحكمك الكامل' : 'Contrôle d’accès strict & temporaire'}
              </span>
              <h3 className="text-xl md:text-2xl font-black">
                {isAr ? 'امنح طبيبك وصولاً مؤقتاً لملفك بنقرة واحدة' : 'Partagez vos données en toute sécurité via QR Code'}
              </h3>
              <p className="text-xs md:text-sm text-teal-100/90 leading-relaxed">
                {isAr
                  ? 'لا حاجة لحمل ملفات ورقية ثقيلة إلى العيادة؛ أنشئ رمز QR أو رابطاً مؤقتاً (صالحة لمدة محددة)، واعرض شاشة هاتفك ليمسحها الطبيب ويتصفح أدويتك وتحاليلك فوراً، أو قم بتصدير تقرير PDF منسق.'
                  : 'Générez un QR code éphémère ou téléchargez une synthèse PDF formatée avec graphiques.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-emerald-400 hover:bg-emerald-300 dark:bg-teal-400 dark:hover:bg-teal-300 text-teal-950 font-black text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-105"
              >
                <QrCode className="w-4 h-4" />
                <span>{isAr ? '+ إنشاء رمز QR مشاركة جديد' : '+ Nouveau QR de partage'}</span>
              </button>

              <button
                onClick={() => setActiveTabSub('report')}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border border-white/20"
              >
                <Download className="w-4 h-4" />
                <span>{isAr ? 'تصدير ملف PDF' : 'Exporter PDF'}</span>
              </button>
            </div>
          </section>

          {/* Active Doctor Share Passes List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                {isAr ? 'أذونات ومفاتيح المشاركة النشطة' : 'Autorisations et accès en cours'}
              </h3>
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {memberPasses.length} {isAr ? 'روابط مشاركة' : 'passes'}
              </span>
            </div>

            {memberPasses.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-dashed border-slate-200 dark:border-slate-800">
                <QrCode className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr ? 'لا توجد أذونات مشاركة نشطة حالياً.' : 'Aucun partage actif.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {memberPasses.map((pass) => (
                  <div
                    key={pass.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500 shadow-xs transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400">
                            <QrCode className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{pass.title}</h4>
                            <span className="text-xs text-slate-500 dark:text-slate-400">{pass.doctorName}</span>
                          </div>
                        </div>

                        <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-900 dark:text-teal-300 border border-transparent dark:border-teal-800/60">
                          {pass.accessCode}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          {isAr ? 'ينتهي في: ' : 'Expire le : '}
                        </span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {new Date(pass.expiresAt).toLocaleString(isAr ? 'ar-DZ' : 'fr-FR', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Allowed Sections Tags */}
                      <div className="flex flex-wrap gap-1">
                        {pass.allowedSections.map((sec, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold px-2 py-0.5 rounded-md">
                            ✓ {sec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <button
                        onClick={() => setSelectedPassForModal(pass)}
                        className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>{isAr ? 'عرض رمز QR للطبيب' : 'Afficher le QR'}</span>
                      </button>

                      <button
                        onClick={() => handleCopyLink(pass)}
                        className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 font-semibold cursor-pointer"
                        title={isAr ? 'نسخ الرابط' : 'Copier le lien'}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedPassId === pass.id ? (isAr ? 'تم النسخ!' : 'Copié !') : (isAr ? 'نسخ' : 'Lien')}</span>
                      </button>
                    </div>

                  </div>
                ))}
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
                  {isAr ? 'الملخص الطبي المنسق مع الرسوم البيانية' : 'Dossier Médical Formaté avec Graphiques'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr ? 'جاهز للتنزيل كملف PDF رسمي أو الطباعة الفورية' : 'Prêt pour l’export PDF haute définition'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintReport}
                className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>{isAr ? 'طباعة' : 'Imprimer'}</span>
              </button>

              <button
                disabled={isExportingPdf}
                onClick={handleDownloadPDF}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm cursor-pointer transition-all disabled:opacity-50"
              >
                {isExportingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isAr ? 'جاري إنشاء ملف PDF...' : 'Génération du PDF...'}</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>{isAr ? 'تحميل تقرير PDF كامل' : 'Télécharger le PDF'}</span>
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
                    DZ 🇩🇿 Santé
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-900 mt-1.5">
                  {isAr ? 'تقرير السجل الطبي الشامل والملخص السريري' : 'Synthèse Médicale & Dossier Clinique'}
                </h3>
                <p className="text-xs text-slate-500">
                  {isAr ? 'تاريخ الاستخراج: ' : 'Date d’émission : '} {new Date().toLocaleDateString(isAr ? 'ar-DZ' : 'fr-FR')} • {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="text-right flex flex-col items-end">
                <span className="text-[10px] font-mono text-slate-400">RÉF: TIBBI-{activeMember.id.toUpperCase()}-2026</span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black mt-1">
                  {isAr ? 'وثيقة طبية معتمدة' : 'Dossier Numérique Vérifié'}
                </span>
              </div>
            </div>

            {/* Patient Identity Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">{isAr ? 'اسم المريض:' : 'Patient :'}</span>
                <span className="font-extrabold text-slate-900 text-sm block">
                  {isAr ? activeMember.fullNameAr : activeMember.fullNameFr}
                </span>
                <span className="text-[11px] text-slate-500">
                  {isAr ? activeMember.relationshipLabelAr : activeMember.relationshipLabelFr}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">{isAr ? 'فصيلة الدم:' : 'Groupe sanguin :'}</span>
                <span className="font-mono font-black text-teal-700 text-base block">{activeMember.bloodGroup}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">{isAr ? 'تاريخ الميلاد:' : 'Date de naissance :'}</span>
                <span className="font-mono font-bold text-slate-800 block">{activeMember.birthDate}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">{isAr ? 'بطاقة الشفاء / التعريف:' : 'N° Chifa :'}</span>
                <span className="font-mono font-bold text-slate-800 block">{activeMember.nationalIdOrChifa || '--'}</span>
              </div>
            </div>

            {/* Allergies & Chronic Diseases Warning Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                <span className="font-black text-rose-900 block flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{isAr ? 'الحساسيات الموثقة:' : 'Allergies documentées :'}</span>
                </span>
                <p className="text-rose-800 font-bold">
                  {activeMember.allergies.length > 0 ? activeMember.allergies.join('، ') : (isAr ? 'لا توجد حساسية معروفة' : 'Aucune allergie connue')}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="font-black text-amber-900 block">
                  {isAr ? 'الحالات المرضية المزمنة:' : 'Pathologies chroniques :'}
                </span>
                <p className="text-amber-800 font-bold">
                  {activeMember.chronicDiseases.length > 0 ? activeMember.chronicDiseases.join('، ') : (isAr ? 'لا توجد حالات مزمنة' : 'Aucune')}
                </p>
              </div>
            </div>

            {/* Current Active Medications Table */}
            <div className="space-y-2 text-xs">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-amber-500" />
                <span>{isAr ? 'العلاجات والأدوية الحالية الموصوفة:' : 'Prescriptions et traitements en cours :'}</span>
              </h4>
              <table className="w-full text-right border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5 text-right">{isAr ? 'اسم الدواء' : 'Médicament'}</th>
                    <th className="p-2.5 text-right">{isAr ? 'الجرعة والتكرار' : 'Posologie'}</th>
                    <th className="p-2.5 text-right">{isAr ? 'الطبيب المعالج' : 'Prescripteur'}</th>
                    <th className="p-2.5 text-right">{isAr ? 'دواعي الاستعمال' : 'Indication'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeMemberMedications.filter((m) => m.status === 'active').map((m) => (
                    <tr key={m.id}>
                      <td className="p-2.5 font-bold text-slate-900">{m.name}</td>
                      <td className="p-2.5 text-slate-700">{m.dosage} ({m.frequency})</td>
                      <td className="p-2.5 text-slate-700">{m.prescribingDoctor}</td>
                      <td className="p-2.5 text-slate-600">{m.condition}</td>
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
                <span>{isAr ? 'الرسوم البيانية وتطور القياسات الحيوية والتحاليل:' : 'Graphiques d’évolution des constantes & bilans :'}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Chart 1: Blood Pressure Evolution */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-900 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <span>{isAr ? 'تطور ضغط الدم (انقباضي / انبساطي)' : 'Pression artérielle (mmHg)'}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Cible: &lt;140/90</span>
                  </div>
                  
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={vitalsChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                        <YAxis domain={[60, 160]} stroke="#64748b" tick={{ fontSize: 10 }} />
                        <ReferenceLine y={140} stroke="#f43f5e" strokeDasharray="3 3" />
                        <ReferenceLine y={90} stroke="#0d9488" strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="systolic" stroke="#f43f5e" strokeWidth={2} dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="diastolic" stroke="#0d9488" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                    <span>🔴 {isAr ? 'الانقباضي (Systolique)' : 'Systolique'}</span>
                    <span>🟢 {isAr ? 'الانبساطي (Diastolique)' : 'Diastolique'}</span>
                  </div>
                </div>

                {/* Chart 2: Fasting Blood Sugar Evolution */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-slate-900 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                      <span>{isAr ? 'منحنى سكر الدم على الريق (g/L)' : 'Glycémie à jeun (g/L)'}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Norme: 0.7 - 1.1</span>
                  </div>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={glucoseLabs} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10 }} />
                        <YAxis domain={[0.6, 1.3]} stroke="#64748b" tick={{ fontSize: 10 }} />
                        <ReferenceLine y={1.1} stroke="#f59e0b" strokeDasharray="3 3" />
                        <ReferenceLine y={0.7} stroke="#10b981" strokeDasharray="3 3" />
                        <Area type="monotone" dataKey="value" stroke="#0d9488" strokeWidth={2} fill="#ccfbf1" fillOpacity={0.6} dot={{ r: 3 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200">
                    <span>🟢 {isAr ? 'المجال الطبيعي: 0.7 - 1.10 g/L' : 'Zone cible: 0.7 - 1.1 g/L'}</span>
                    <span>{glucoseLabs.length} {isAr ? 'فحوصات مسجلة' : 'analyses'}</span>
                  </div>
                </div>

              </div>
            </div>

            {/* Recent Lab Tests Table */}
            <div className="space-y-2 text-xs">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <FlaskConical className="w-4 h-4 text-teal-600" />
                <span>{isAr ? 'آخر النتائج والتحاليل البيولوجية المخبرية:' : 'Derniers bilans biologiques :'}</span>
              </h4>
              <table className="w-full text-right border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 font-bold text-slate-700">
                  <tr>
                    <th className="p-2.5 text-right">{isAr ? 'التحليل' : 'Examen'}</th>
                    <th className="p-2.5 text-right">{isAr ? 'النتيجة' : 'Résultat'}</th>
                    <th className="p-2.5 text-right">{isAr ? 'المجال المرجعي' : 'Normes'}</th>
                    <th className="p-2.5 text-right">{isAr ? 'التاريخ والمخبر' : 'Date & Labo'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeMemberLabTests.slice(0, 6).map((l) => (
                    <tr key={l.id}>
                      <td className="p-2.5 font-bold text-slate-900">{l.testName}</td>
                      <td className={`p-2.5 font-mono font-bold ${l.isAbnormal ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {l.value} {l.unit} {l.isAbnormal ? '⚠️ (مرتفع)' : '✓'}
                      </td>
                      <td className="p-2.5 font-mono text-slate-600">
                        {l.referenceMin !== undefined ? `${l.referenceMin} - ${l.referenceMax} ${l.unit}` : '--'}
                      </td>
                      <td className="p-2.5 text-slate-600">{l.date} • {l.laboratory}</td>
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
                    {isAr ? 'رمز التحقق الرقمي المباشر للطبيب (QR Pass)' : 'Accès Numérique Sécurisé Médecin'}
                  </span>
                  <p className="text-teal-800 text-[11px]">
                    {isAr
                      ? 'يمكن للطبيب مسح رمز QR من هاتفه للوصول الفوري إلى النسخة الرقمية الحية والمستندات المرفقة.'
                      : 'Permet au médecin d’accéder à la version numérique dynamique et aux ordonnances scannées.'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-teal-700 block font-semibold">{isAr ? 'رمز الوصول السريع:' : 'Code d’accès :'}</span>
                <span className="font-mono font-black text-sm bg-teal-700 text-white px-3 py-1 rounded-lg inline-block">
                  {memberPasses[0]?.accessCode || 'TIBBI-8942'}
                </span>
              </div>
            </div>

            {/* Official Legal Footer */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 text-center sm:text-right">
              <span>
                {isAr
                  ? 'منظومة TIBBI للذاكرة الصحية الرقمية • مصرح بالاستعمال الطبي • الجمهورية الجزائرية الديمقراطية الشعبية'
                  : 'Plateforme TIBBI • Santé Numérique Familiale • République Algérienne Démocratique et Populaire'}
              </span>
              <span className="font-mono font-bold text-slate-400">
                PAGE 1/1 • VALIDÉ
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
              <h4 className="text-base font-black text-slate-900 dark:text-slate-100">{selectedPassForModal.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? `المريض: ${activeMember.fullNameAr}` : `Patient : ${activeMember.fullNameFr}`}
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
                رمز الوصول: {selectedPassForModal.accessCode}
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {isAr ? 'وجّه كاميرا الهاتف أو جهاز الطبيب لمسح الرمز' : 'Scannez avec la caméra du smartphone'}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                onClick={() => handleCopyLink(selectedPassForModal)}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>{copiedPassId === selectedPassForModal.id ? (isAr ? 'تم النسخ!' : 'Copié !') : (isAr ? 'نسخ رابط الطبيب' : 'Copier l’URL')}</span>
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
                <span>{isAr ? 'إنشاء رمز مشاركة مؤقت للطبيب' : 'Générer un accès QR sécurisé'}</span>
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
                  {isAr ? 'اسم الطبيب أو المركز الصحي' : 'Nom du médecin ou établissement'}
                </label>
                <input
                  type="text"
                  required
                  value={shareForm.doctorName}
                  onChange={(e) => setShareForm({ ...shareForm, doctorName: e.target.value })}
                  placeholder="مثال: د. بوجمعة (أمراض القلب)..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? 'عنوان أو سبب المشاركة' : 'Motif'}
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
                  {isAr ? 'مدة صلاحية الرابط' : 'Durée de validité'}
                </label>
                <select
                  value={shareForm.durationHours}
                  onChange={(e) => setShareForm({ ...shareForm, durationHours: parseInt(e.target.value, 10) })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                >
                  <option value={2}>{isAr ? 'ساعتان فقط (مدة الزيارة)' : '2 heures (durée de la visite)'}</option>
                  <option value={24}>{isAr ? '24 ساعة (يوم كامل)' : '24 heures (1 jour)'}</option>
                  <option value={72}>{isAr ? '3 أيام' : '3 jours'}</option>
                  <option value={168}>{isAr ? 'أسبوع واحد (7 أيام)' : '7 jours (1 semaine)'}</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-2">
                  {isAr ? 'المعلومات المصرح للطبيب بالاطلاع عليها:' : 'Sections autorisées à la consultation :'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'profile', label: isAr ? 'الملف الأساسي وفصيلة الدم' : 'Profil & Groupe sanguin' },
                    { id: 'medications', label: isAr ? 'سجل الأدوية والعلاجات' : 'Médicaments' },
                    { id: 'labs', label: isAr ? 'التحاليل والفحوصات' : 'Analyses médicales' },
                    { id: 'vitals', label: isAr ? 'القياسات والمؤشرات الحيوية' : 'Constantes vitales' },
                    { id: 'timeline', label: isAr ? 'الخط الزمني والتاريخ المرضي' : 'Historique & Antécédents' },
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

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  {isAr ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold shadow-md cursor-pointer"
                >
                  {isAr ? 'إنشاء رمز QR الآن' : 'Générer le QR code'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
