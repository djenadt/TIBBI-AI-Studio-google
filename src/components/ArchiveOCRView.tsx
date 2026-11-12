import React, { useState, useRef, useMemo } from 'react';
import {
  FolderOpen,
  ScanLine,
  UploadCloud,
  FileText,
  FileCheck,
  Calendar,
  User,
  Building,
  Pill,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  Eye,
  Trash2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  Activity,
  HeartPulse,
  Stethoscope,
  Scissors,
  ShieldCheck,
  Baby,
  FileBadge,
  EyeIcon,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { useTibbi } from '../context/TibbiContext';
import { MedicalDocument, DocumentType } from '../types/tibbi';

export const ArchiveOCRView: React.FC = () => {
  const {
    language,
    activeMember,
    familyMembers,
    documents,
    activeMemberDocuments,
    addDocument,
    deleteDocument,
    processDocumentOcr,
    isProcessingOcr,
    addMedication,
    addLabTest,
    setActiveMemberId,
  } = useTibbi();

  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtering, Searching & Sorting States
  const [selectedFamilyFilter, setSelectedFamilyFilter] = useState<string>('active'); // 'active' | 'all' | memberId
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'title-asc' | 'status-attention'>('date-desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState<boolean>(true);

  // Selected document modal & OCR states
  const [selectedDoc, setSelectedDoc] = useState<MedicalDocument | null>(null);
  const [ocrResult, setOcrResult] = useState<any | null>(null);
  const [ocrNotice, setOcrNotice] = useState<string | null>(null);

  // Manual document upload form modal state
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualForm, setManualForm] = useState({
    title: '',
    type: 'prescription' as DocumentType,
    patientId: activeMember.id,
    doctorName: '',
    specialty: '',
    facility: '',
    date: new Date().toISOString().split('T')[0],
    conclusion: '',
    recommendations: '',
    status: 'normal' as 'normal' | 'attention' | 'critical' | 'completed',
    notes: '',
    tags: '',
  });

  // Base list depending on family filter
  const baseDocuments = useMemo(() => {
    if (selectedFamilyFilter === 'all') {
      return documents;
    }
    if (selectedFamilyFilter === 'active') {
      return documents.filter((d) => d.patientId === activeMember.id);
    }
    return documents.filter((d) => d.patientId === selectedFamilyFilter);
  }, [documents, selectedFamilyFilter, activeMember.id]);

  // Filtered & Sorted documents
  const filteredAndSortedDocuments = useMemo(() => {
    let result = baseDocuments.filter((doc) => {
      // Type filter
      if (filterType !== 'all' && doc.type !== filterType) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = doc.title.toLowerCase().includes(q);
        const matchDoctor = doc.doctorName?.toLowerCase().includes(q) || false;
        const matchFacility = doc.facility?.toLowerCase().includes(q) || false;
        const matchNotes = doc.notes?.toLowerCase().includes(q) || false;
        const matchConclusion = doc.conclusion?.toLowerCase().includes(q) || false;
        const matchTags = doc.tags?.some((t) => t.toLowerCase().includes(q)) || false;
        if (!matchTitle && !matchDoctor && !matchFacility && !matchNotes && !matchConclusion && !matchTags) {
          return false;
        }
      }
      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'date-desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'title-asc') {
        return a.title.localeCompare(b.title, isAr ? 'ar' : 'fr');
      }
      if (sortBy === 'status-attention') {
        const score = (status?: string) => (status === 'attention' || status === 'critical' ? 2 : 1);
        return score(b.status) - score(a.status);
      }
      return 0;
    });

    return result;
  }, [baseDocuments, filterType, searchQuery, sortBy, isAr]);

  // Statistics calculation for the current documents subset
  const stats = useMemo(() => {
    const total = baseDocuments.length;
    const ocrCount = baseDocuments.filter((d) => d.ocrExtracted).length;
    const attentionCount = baseDocuments.filter((d) => d.status === 'attention' || d.status === 'critical').length;
    const prescriptionsCount = baseDocuments.filter((d) => d.type === 'prescription').length;
    const labsCount = baseDocuments.filter((d) => d.type === 'lab_result').length;
    const radiologyCount = baseDocuments.filter((d) => d.type === 'radiology').length;
    const cardioCount = baseDocuments.filter((d) => d.type === 'ecg_cardio').length;
    const surgeryCount = baseDocuments.filter((d) => d.type === 'surgery_report').length;
    const vaccCount = baseDocuments.filter((d) => d.type === 'vaccination').length;
    const certCount = baseDocuments.filter((d) => d.type === 'certificate').length;
    return {
      total,
      ocrCount,
      attentionCount,
      prescriptionsCount,
      labsCount,
      radiologyCount,
      cardioCount,
      surgeryCount,
      vaccCount,
      certCount,
    };
  }, [baseDocuments]);

  // Helper for document type metadata
  const getTypeMeta = (type: DocumentType) => {
    switch (type) {
      case 'prescription':
        return {
          labelAr: 'وصفة طبية',
          labelFr: 'Ordonnance',
          color: 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 border-amber-300 dark:border-amber-800',
          icon: Pill,
        };
      case 'lab_result':
        return {
          labelAr: 'تحليل مخبري',
          labelFr: 'Bilan Labo',
          color: 'text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/70 border-blue-300 dark:border-blue-800',
          icon: FlaskConical,
        };
      case 'radiology':
        return {
          labelAr: 'أشعة وتصوير',
          labelFr: 'Imagerie / Radio',
          color: 'text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/70 border-purple-300 dark:border-purple-800',
          icon: ScanLine,
        };
      case 'ecg_cardio':
        return {
          labelAr: 'تخطيط قلب وفحوصات',
          labelFr: 'ECG / Cardio',
          color: 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/70 border-rose-300 dark:border-rose-800',
          icon: HeartPulse,
        };
      case 'surgery_report':
        return {
          labelAr: 'تقرير جراحي واستشفاء',
          labelFr: 'Chirurgie / Hôpital',
          color: 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-950/70 border-red-300 dark:border-red-800',
          icon: Scissors,
        };
      case 'vaccination':
        return {
          labelAr: 'دفتر تلقيحات',
          labelFr: 'Vaccination',
          color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/70 border-emerald-300 dark:border-emerald-800',
          icon: ShieldCheck,
        };
      case 'certificate':
        return {
          labelAr: 'شهادة ورخصة طبية',
          labelFr: 'Certificat / PAI',
          color: 'text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-950/70 border-teal-300 dark:border-teal-800',
          icon: FileBadge,
        };
      case 'specialist_report':
      default:
        return {
          labelAr: 'استشارة تخصصية',
          labelFr: 'Rapport Spécialiste',
          color: 'text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-800',
          icon: Stethoscope,
        };
    }
  };

  // Helper to find patient of a document
  const getPatientInfo = (patientId: string) => {
    return familyMembers.find((m) => m.id === patientId) || activeMember;
  };

  // Handle file select & OCR
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      await runOcrFlow({
        imageBase64: base64,
        fileName: file.name,
        mimeType: file.type || 'image/jpeg',
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Run OCR with server or presets
  const runOcrFlow = async (payload: { imageBase64?: string; fileName?: string; mimeType?: string; documentType?: string }) => {
    setOcrResult(null);
    setOcrNotice(null);
    try {
      const result = await processDocumentOcr(payload);
      setOcrResult(result);
      setOcrNotice(
        isAr
          ? 'تم استخراج وتحليل بيانات الوثيقة بنجاح بواسطة الذكاء الاصطناعي TIBBI OCR'
          : 'Données extraites avec succès par l’OCR intelligent'
      );
    } catch (err: any) {
      const msg = err?.message || '';
      const isNet = msg.includes('fetch') || msg.includes('network') || (typeof navigator !== 'undefined' && !navigator.onLine);
      setOcrNotice(
        isAr
          ? isNet
            ? 'تعذر الاتصال بخدمة التحليل البصري بسبب انقطاع الشبكة. تم الاحتفاظ بالوثيقة، يرجى إعادة المحاولة أو إدخال البيانات يدوياً.'
            : `تعذر إتمام قراءة الوثيقة تلقائياً (${msg || 'صورة غير واضحة'}). يمكنك حفظها وإدخال البيانات الطبية يدوياً عبر زر "+ إضافة وثيقة يدوياً".`
          : isNet
          ? 'Connexion réseau interrompue. Veuillez vérifier votre accès internet ou saisir manuellement le document.'
          : `Traitement automatique interrompu (${msg || 'document illisible'}). Vous pouvez ajouter ce document manuellement.`
      );
    }
  };

  // Preset sample documents for 1-click test
  const handlePresetScan = (type: 'prescription' | 'lab_result' | 'radiology') => {
    if (type === 'prescription') {
      runOcrFlow({
        documentType: 'prescription',
        fileName: 'Ordonnance_Dr_Benali_Clinique_Alger.jpg',
      });
    } else if (type === 'lab_result') {
      runOcrFlow({
        documentType: 'lab_result',
        fileName: 'Bilan_Biologique_Laboratoire_El_Amel.pdf',
      });
    } else {
      runOcrFlow({
        documentType: 'radiology',
        fileName: 'Compte_Rendu_Echographie_Abdominale.pdf',
      });
    }
  };

  // Save the extracted document into permanent archive + automatically save medications or lab items
  const handleSaveExtractedToArchive = () => {
    if (!ocrResult) return;

    // 1. Save document to archive
    addDocument({
      patientId: activeMember.id,
      title: ocrResult.title || (isAr ? 'وثيقة طبية مستخرجة' : 'Document extrait'),
      type: ocrResult.documentType || 'report',
      date: ocrResult.date || new Date().toISOString().split('T')[0],
      doctorName: ocrResult.doctorName,
      facility: ocrResult.institution,
      originalFileName: isAr ? 'مسح_ضوئي_رقمي.jpg' : 'scan_numerique.jpg',
      ocrExtracted: true,
      tags: ocrResult.keyFindings || [isAr ? 'مستخرج آلياً' : 'Extrait auto'],
      notes: ocrResult.summaryNotes,
      conclusion: ocrResult.summaryNotes,
      extractedData: ocrResult,
    });

    // 2. If it has medications, offer or automatically add them
    if (ocrResult.medications && Array.isArray(ocrResult.medications)) {
      ocrResult.medications.forEach((med: any) => {
        addMedication({
          patientId: activeMember.id,
          name: med.name,
          dosage: med.dosage || (isAr ? 'حسب الوصفة' : 'Selon prescription'),
          form: 'tablet',
          frequency: med.dosage || (isAr ? 'مرتين يومياً' : '2 fois par jour'),
          timing: ['08:00', '20:00'],
          startDate: ocrResult.date || new Date().toISOString().split('T')[0],
          prescribingDoctor: ocrResult.doctorName || 'طبيب معالج',
          prescribingSpecialty: ocrResult.specialty,
          condition: isAr ? 'وصفة طبية مستخرجة بالـ OCR' : 'Prescription extraite OCR',
          instructions: med.instructions || '',
          status: 'active',
          reminderEnabled: true,
        });
      });
    }

    // 3. If it has lab results, save them
    if (ocrResult.labResults && Array.isArray(ocrResult.labResults)) {
      ocrResult.labResults.forEach((lab: any) => {
        addLabTest({
          patientId: activeMember.id,
          testName: lab.testName,
          category: 'biochimie',
          value: typeof lab.value === 'number' ? lab.value : parseFloat(lab.value) || 0,
          unit: lab.unit || 'g/L',
          referenceMin: lab.referenceMin,
          referenceMax: lab.referenceMax,
          date: ocrResult.date || new Date().toISOString().split('T')[0],
          laboratory: ocrResult.institution || 'مخبر التحاليل',
          prescribingDoctor: ocrResult.doctorName,
          isAbnormal: lab.isAbnormal || false,
          notes: lab.interpretation || '',
        });
      });
    }

    setOcrResult(null);
    setOcrNotice(
      isAr
        ? '✅ تم حفظ الوثيقة واستيراد الأدوية والتحاليل إلى ملفك الصحي بنجاح!'
        : '✅ Document et données enregistrés avec succès !'
    );
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualForm.title.trim()) return;

    addDocument({
      patientId: manualForm.patientId,
      title: manualForm.title,
      type: manualForm.type,
      date: manualForm.date,
      doctorName: manualForm.doctorName,
      specialty: manualForm.specialty,
      facility: manualForm.facility,
      conclusion: manualForm.conclusion,
      recommendations: manualForm.recommendations,
      status: manualForm.status,
      tags: manualForm.tags ? manualForm.tags.split(',').map((t) => t.trim()) : [],
      notes: manualForm.notes,
      ocrExtracted: false,
    });

    setIsManualModalOpen(false);
    setManualForm({
      title: '',
      type: 'prescription',
      patientId: activeMember.id,
      doctorName: '',
      specialty: '',
      facility: '',
      date: new Date().toISOString().split('T')[0],
      conclusion: '',
      recommendations: '',
      status: 'normal',
      notes: '',
      tags: '',
    });
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* View Header with Family Scope Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800/80 mb-2">
            <FolderOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>{isAr ? 'الأرشيف الطبي الذكي والتحليل السريري' : 'Archives Médicales & Analyse Clinique'}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {isAr ? 'الملف الصحي والوثائق الطبية لجميع أفراد الأسرة' : 'Dossier Médical & Documents de la Famille'}
          </h2>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
            {isAr
              ? 'أرشيف طبي شامل ومتنوع يجمع الوصفات، التحاليل البيولوجية، صور الأشعة، التخطيط القلبي، التقارير الجراحية ودفاتر التلقيح، مصنفة ومحللة سريرياً.'
              : 'Archive médicale complète et analysée : ordonnances, bilans de sang, radiographies, ECG, comptes-rendus opératoires et carnets vaccinaux.'}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-xs shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>{isAr ? 'إضافة وثيقة جديدة' : 'Nouveau document'}</span>
          </button>
        </div>
      </div>

      {/* Family Member Scope Switcher (Filter all vs individual) */}
      <div className="bg-white dark:bg-slate-900 p-2 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar shadow-xs">
        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap px-2">
          {isAr ? 'نطاق العرض:' : 'Afficher :'}
        </span>

        <button
          onClick={() => setSelectedFamilyFilter('all')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            selectedFamilyFilter === 'all'
              ? 'bg-teal-700 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>{isAr ? 'جميع أفراد العائلة (الأرشيف الكامل)' : 'Toute la famille (Tous)'}</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20">
            {documents.length}
          </span>
        </button>

        {familyMembers.map((member) => {
          const isSelected = selectedFamilyFilter === member.id || (selectedFamilyFilter === 'active' && member.id === activeMember.id);
          const memberDocsCount = documents.filter((d) => d.patientId === member.id).length;
          return (
            <button
              key={member.id}
              onClick={() => {
                setSelectedFamilyFilter(member.id);
                setActiveMemberId(member.id);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200 text-[10px] flex items-center justify-center font-bold">
                {member.fullNameAr.charAt(0)}
              </span>
              <span>{isAr ? member.fullNameAr : member.fullNameFr}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                {memberDocsCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* AI Clinical Analysis & Synthesis Dashboard Panel */}
      <section className="bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-teal-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-teal-500/10 pointer-events-none blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-500/10 pointer-events-none blur-3xl" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>{isAr ? 'التحليل الاسترشادي للأرشيف الطبي' : 'Synthèse & Lecture Indicative de l’Archive'}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    AI Indicative (Non-Diagnostic)
                  </span>
                </h3>
                <p className="text-xs text-slate-300">
                  {isAr
                    ? 'تلخيص آلي استرشادي يربط الوثائق والنتائج لتسهيل المتابعة، ويتطلب دائماً مراجعة الطبيب المعالج.'
                    : 'Lecture croisée et indicative des documents pour suivi — Nécessite validation médicale.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
              className="text-xs text-teal-300 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
            >
              <span>{isAnalysisExpanded ? (isAr ? 'إخفاء التفاصيل' : 'Réduire') : (isAr ? 'عرض التفاصيل والتحليل' : 'Développer')}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isAnalysisExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Prominent Medical Safety Notice */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="leading-relaxed">
              {isAr
                ? 'إشعار طبي وقائي: الملخصات والتحليلات الآلية مستخلصة استرشادياً لتنظيم السجلات ولا تشكل بأي حال تشخيصاً سريرياً أو توجيهاً علاجياً. يُلزم الرجوع للأصل الورقي وللطبيب المعالج قبل اتخاذ أي قرار طبي.'
                : 'Avertissement médical : Cette synthèse automatisée est fournie à titre indicatif pour l’organisation de vos archives. Elle ne remplace pas l’avis d’un médecin ou pharmacien qualifié.'}
            </p>
          </div>

          {/* KPI Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
              <span className="text-[11px] text-slate-400 block">{isAr ? 'إجمالي الوثائق المفهرسة' : 'Total Documents'}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-white">{stats.total}</span>
                <span className="text-[10px] text-teal-300">{isAr ? 'وثيقة طبية' : 'fichiers'}</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
              <span className="text-[11px] text-slate-400 block">{isAr ? 'استخراج وتحليل OCR' : 'Traitement OCR'}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-emerald-400">{stats.ocrCount}</span>
                <span className="text-[10px] text-emerald-300">100% {isAr ? 'رقمي' : 'numérique'}</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
              <span className="text-[11px] text-slate-400 block">{isAr ? 'نتائج تتطلب انتباه' : 'Points d’attention'}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-amber-400">{stats.attentionCount}</span>
                <span className="text-[10px] text-amber-300">{isAr ? 'مؤشرات للمتابعة' : 'à surveiller'}</span>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-1">
              <span className="text-[11px] text-slate-400 block">{isAr ? 'تنوع التخصصات' : 'Spécialités couvertes'}</span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-teal-300">8</span>
                <span className="text-[10px] text-slate-300">{isAr ? 'فروع طبية' : 'domaines'}</span>
              </div>
            </div>
          </div>

          {/* Detailed Clinical Observations when expanded */}
          {isAnalysisExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
              {/* Card 1: Critical Alerts & Drug Allergies */}
              <div className="bg-white/5 border border-red-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-red-300 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span>{isAr ? 'تنبيهات الحساسية والتعارض الدوائي' : 'Allergies & Sécurité Médicamenteuse'}</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    <strong className="text-white">ياسين:</strong>{' '}
                    {isAr ? 'حساسية موثقة تجاه البنسلين ومسجلة في تقرير معهد باستور (12-05-2023) — يتوجب إشعار الطبيب والصيدلي عند كل زيارة.' : 'Allergie documentée à la pénicilline (Pasteur 12-05-2023) — À signaler au prescripteur.'}
                  </li>
                  <li>
                    <strong className="text-white">مريم:</strong>{' '}
                    {isAr ? 'حساسية موثقة تجاه السلفاميدات (Sulfamides) مسجلة في السجل الصحي — يُعرض على الطبيب المتابع للحمل عند وصف أي علاج.' : 'Allergie formelle aux sulfamides documentée au dossier.'}
                  </li>
                </ul>
              </div>

              {/* Card 2: Chronic & Physiological Monitoring */}
              <div className="bg-white/5 border border-teal-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-teal-300 font-bold text-xs">
                  <Activity className="w-4 h-4 text-teal-400" />
                  <span>{isAr ? 'المتابعات المزمنة والحمل النشط' : 'Suivi Chronique & Grossesse'}</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    <strong className="text-white">أمين:</strong>{' '}
                    {isAr ? 'ضغط دم مضبوط في آخر فحص (125/82 مم زئبق) تحت بروتوكول كوفرسيل 5 ملغ بمتابعة د. بن مهيدي.' : 'HTA sous Coversyl 5mg suivie par Dr Benmhidi. ECG sinusal normal.'}
                  </li>
                  <li>
                    <strong className="text-white">مريم:</strong>{' '}
                    {isAr ? 'متابعة الحمل في الثلث الثاني (الأسبوع 24). فحص الموجات الصوتية دوري ومطابق للمعدل الطبيعي.' : 'Grossesse T2 normale (24 SA), échographie morphologique normale.'}
                  </li>
                </ul>
              </div>

              {/* Card 3: Pediatric Milestones & Prevention */}
              <div className="bg-white/5 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                  <Baby className="w-4 h-4 text-emerald-400" />
                  <span>{isAr ? 'الوقاية المدرسية ونمو الأطفال' : 'Pédiatrie & Santé Scolaire'}</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside leading-relaxed">
                  <li>
                    <strong className="text-white">ياسين:</strong>{' '}
                    {isAr ? 'مشروع استقبال مدرسي (PAI) مفعل بالمدرسة للربو، رخصة الفنتولين وفحص بصر 10/10.' : 'PAI scolaire actif, Ventoline autorisée en classe.'}
                  </li>
                  <li>
                    <strong className="text-white">إيناس:</strong>{' '}
                    {isAr ? 'جدول التلقيحات الوطني PEV مستوفى بالكامل، تطور نفسي حركي مثالي عند 18 شهراً.' : 'Carnet vaccinal PEV à jour, marche autonome acquise.'}
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* OCR Instant Scanner Bar (Upload or 1-Click Fast Demonstration) */}
      <div className="bg-teal-50 dark:bg-slate-800/60 border border-teal-200 dark:border-slate-700 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 dark:bg-teal-500 text-white flex items-center justify-center shrink-0">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {isAr ? 'مسح ضوئي ذكي جديد (AI OCR Scanner)' : 'Numériser un nouveau document (OCR)'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isAr
                ? 'ارفع صورة وصفة أو تحليل لقراءتها وتصنيفها آلياً'
                : 'Glissez une ordonnance ou un compte-rendu pour analyse instantanée'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,application/pdf"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingOcr}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{isProcessingOcr ? (isAr ? 'جاري التحليل...' : 'Analyse...') : (isAr ? 'رفع ملف / صورة' : 'Téléverser')}</span>
          </button>

          <span className="text-xs text-slate-400 hidden sm:inline">|</span>

          {/* Quick preset tests */}
          <button
            onClick={() => handlePresetScan('prescription')}
            disabled={isProcessingOcr}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            {isAr ? 'تجربة وصفة' : 'Test Ordonnance'}
          </button>
          <button
            onClick={() => handlePresetScan('lab_result')}
            disabled={isProcessingOcr}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            {isAr ? 'تجربة تحليل' : 'Test Bilan'}
          </button>
          <button
            onClick={() => handlePresetScan('radiology')}
            disabled={isProcessingOcr}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            {isAr ? 'تجربة أشعة' : 'Test Radio'}
          </button>
        </div>
      </div>

      {/* OCR Result Approval Card if active */}
      {ocrResult && (
        <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-4 border border-teal-500/50 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/15 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h4 className="font-bold text-sm text-white">
                {isAr ? 'نتيجة الفحص والاستخراج بالـ OCR' : 'Résultat d’extraction OCR'}
              </h4>
            </div>
            <span className="text-xs font-mono text-teal-300">{ocrResult.date}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/10 p-2.5 rounded-xl">
              <span className="text-slate-400 block">{isAr ? 'عنوان الوثيقة:' : 'Titre :'}</span>
              <span className="font-bold text-white">{ocrResult.title}</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl">
              <span className="text-slate-400 block">{isAr ? 'الطبيب / المؤسسة:' : 'Médecin / Établissement :'}</span>
              <span className="font-bold text-white">{ocrResult.doctorName} • {ocrResult.institution}</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-xl">
              <span className="text-slate-400 block">{isAr ? 'المريض المستهدف:' : 'Patient :'}</span>
              <span className="font-bold text-emerald-300">{activeMember.fullNameAr}</span>
            </div>
          </div>

          {ocrResult.summaryNotes && (
            <p className="text-xs bg-white/5 p-3 rounded-xl border border-white/10 text-slate-200">
              {ocrResult.summaryNotes}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setOcrResult(null)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              {isAr ? 'تجاهل' : 'Ignorer'}
            </button>
            <button
              onClick={handleSaveExtractedToArchive}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAr ? 'حفظ الوثيقة ودمج بياناتها في الملف' : 'Enregistrer au dossier'}</span>
            </button>
          </div>
        </div>
      )}

      {ocrNotice && !ocrResult && (
        <div className="p-3 rounded-xl bg-teal-50 dark:bg-slate-800 text-xs text-teal-800 dark:text-teal-300 flex items-center gap-2 border border-teal-200 dark:border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span>{ocrNotice}</span>
        </div>
      )}

      {/* Controls Bar: Search, Category Filter Tabs, Sorting & View Toggle */}
      <div className="space-y-3">
        {/* Row 1: Search & Sorting */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Live Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isAr
                  ? 'بحث في الوثائق بالاسم، الطبيب، العيادة أو الكلمات المفتاحية...'
                  : 'Rechercher par titre, médecin, établissement ou mot-clé...'
              }
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pr-9 pl-4 py-2 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/50 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sorting Dropdown & Layout Mode Switcher */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <label htmlFor="archive-sort-select" className="sr-only">
                {isAr ? 'ترتيب الوثائق' : 'Trier les documents'}
              </label>
              <select
                id="archive-sort-select"
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent font-bold text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
              >
                <option value="date-desc" className="dark:bg-slate-900">{isAr ? 'التاريخ (الأحدث أولاً)' : 'Date (Récent)'}</option>
                <option value="date-asc" className="dark:bg-slate-900">{isAr ? 'التاريخ (الأقدم أولاً)' : 'Date (Ancien)'}</option>
                <option value="title-asc" className="dark:bg-slate-900">{isAr ? 'العنوان (أ - ي)' : 'Titre (A-Z)'}</option>
                <option value="status-attention" className="dark:bg-slate-900">{isAr ? 'مؤشرات تتطلب انتباه أولاً' : 'Attention requise'}</option>
              </select>
            </div>

            {/* View Mode (Grid vs List) */}
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 shadow-2xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title={isAr ? 'عرض بطاقات شبكية' : 'Vue Grille'}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
                title={isAr ? 'عرض جدول وقائمة تفصيلية' : 'Vue Liste'}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', labelAr: 'جميع الوثائق', labelFr: 'Tous', count: baseDocuments.length },
            { id: 'prescription', labelAr: 'الوصفات الطبية', labelFr: 'Ordonnances', count: stats.prescriptionsCount },
            { id: 'lab_result', labelAr: 'التحاليل المخبرية', labelFr: 'Bilans Labo', count: stats.labsCount },
            { id: 'radiology', labelAr: 'الأشعة والتصوير', labelFr: 'Imagerie', count: stats.radiologyCount },
            { id: 'ecg_cardio', labelAr: 'تخطيط القلب', labelFr: 'ECG / Cardio', count: stats.cardioCount },
            { id: 'surgery_report', labelAr: 'التقارير الجراحية', labelFr: 'Chirurgie', count: stats.surgeryCount },
            { id: 'vaccination', labelAr: 'دفاتر التلقيح', labelFr: 'Vaccinations', count: stats.vaccCount },
            { id: 'certificate', labelAr: 'الشهادات والرخص', labelFr: 'Certificats & PAI', count: stats.certCount },
            { id: 'specialist_report', labelAr: 'استشارات تخصصية', labelFr: 'Spécialités', count: baseDocuments.filter((d) => d.type === 'specialist_report').length },
          ].map((tab) => {
            const isActive = filterType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-slate-700'
                }`}
              >
                <span>{isAr ? tab.labelAr : tab.labelFr}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredAndSortedDocuments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
          <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
            {isAr ? 'لا توجد وثائق تطابق خيارات التصفية والبحث' : 'Aucun document ne correspond à vos critères'}
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {isAr
              ? 'جرّب تغيير فئة الوثيقة، أو تعديل نص البحث، أو إضافة وثيقة طبية جديدة.'
              : 'Essayez de modifier vos filtres ou d’ajouter un nouveau document.'}
          </p>
          <button
            onClick={() => {
              setFilterType('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-100 transition-colors cursor-pointer"
          >
            {isAr ? 'إعادة ضبط التصفية' : 'Réinitialiser les filtres'}
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW (Visual Cards with Patient Badge, Metadata & Analysis preview) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedDocuments.map((doc) => {
            const meta = getTypeMeta(doc.type);
            const TypeIcon = meta.icon;
            const patient = getPatientInfo(doc.patientId);
            const hasAttention = doc.status === 'attention' || doc.status === 'critical';

            return (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-teal-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Meta: Patient badge, Category Tag & Date */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${meta.color}`}>
                      <TypeIcon className="w-3.5 h-3.5" />
                      <span>{isAr ? meta.labelAr : meta.labelFr}</span>
                    </span>

                    {/* Patient tag */}
                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      <span className="w-2 h-2 rounded-full bg-teal-500" />
                      <span>{isAr ? patient.fullNameAr.split(' ')[0] : patient.fullNameFr.split(' ')[0]}</span>
                    </div>
                  </div>

                  {/* Document Title */}
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                    {doc.title}
                  </h4>

                  {/* Doctor & Facility */}
                  <div className="space-y-1 text-xs">
                    {doc.doctorName && (
                      <div className="text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 truncate">
                        <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span className="truncate">{doc.doctorName}</span>
                      </div>
                    )}
                    {doc.facility && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                        <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doc.facility}</span>
                      </div>
                    )}
                  </div>

                  {/* Clinical Conclusion preview if present */}
                  {doc.conclusion && (
                    <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] font-black tracking-wider text-teal-700 dark:text-teal-400 uppercase block">
                        {isAr ? 'الخلاصة الطبية:' : 'Conclusion médicale :'}
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                        {doc.conclusion}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {doc.tags && doc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {doc.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded-md"
                        >
                          #{tag}
                        </span>
                      ))}
                      {doc.tags.length > 3 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{doc.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom Footer: Date, Attention badge & Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[11px] font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{doc.date}</span>
                    {hasAttention && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                        <AlertCircle className="w-3 h-3" />
                        {isAr ? 'متابعة' : 'Attention'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedDoc(doc)}
                      className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isAr ? 'فحص وتحليل' : 'Détails'}</span>
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(isAr ? 'هل أنت متأكد من حذف هذه الوثيقة من الأرشيف؟' : 'Supprimer ce document ?')) {
                          deleteDocument(doc.id);
                        }
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer transition-colors"
                      title={isAr ? 'حذف الوثيقة' : 'Supprimer'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW (Structured Table for Chronological Auditing) */
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right rtl:text-right ltr:text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">{isAr ? 'التاريخ' : 'Date'}</th>
                  <th className="py-3 px-4">{isAr ? 'المريض' : 'Patient'}</th>
                  <th className="py-3 px-4">{isAr ? 'نوع الوثيقة' : 'Type'}</th>
                  <th className="py-3 px-4">{isAr ? 'عنوان الوثيقة والتشخيص' : 'Titre & Diagnostic'}</th>
                  <th className="py-3 px-4">{isAr ? 'الطبيب والمؤسسة' : 'Médecin / Établissement'}</th>
                  <th className="py-3 px-4">{isAr ? 'الحالة' : 'État'}</th>
                  <th className="py-3 px-4 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredAndSortedDocuments.map((doc) => {
                  const meta = getTypeMeta(doc.type);
                  const patient = getPatientInfo(doc.patientId);
                  const hasAttention = doc.status === 'attention' || doc.status === 'critical';

                  return (
                    <tr
                      key={doc.id}
                      className="hover:bg-teal-50/40 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {doc.date}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {isAr ? patient.fullNameAr : patient.fullNameFr}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] border ${meta.color}`}>
                          {isAr ? meta.labelAr : meta.labelFr}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-md">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{doc.title}</div>
                        {doc.conclusion && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                            {doc.conclusion}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        <div className="font-semibold">{doc.doctorName || '--'}</div>
                        <div className="text-[10px] text-slate-400">{doc.facility || doc.specialty || ''}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {hasAttention ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                            <AlertCircle className="w-3 h-3" />
                            {isAr ? 'يتطلب متابعة' : 'À suivre'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            {isAr ? 'سليم ومكتمل' : 'Normal'}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedDoc(doc)}
                            className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 text-teal-800 dark:text-teal-300 cursor-pointer"
                            title={isAr ? 'معاينة' : 'Voir'}
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(isAr ? 'حذف هذه الوثيقة؟' : 'Supprimer ce document ?')) {
                                deleteDocument(doc.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer"
                            title={isAr ? 'حذف' : 'Supprimer'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DOCUMENT DEEP INSPECTION & ANALYSIS MODAL */}
      {selectedDoc && (() => {
        const meta = getTypeMeta(selectedDoc.type);
        const TypeIcon = meta.icon;
        const patient = getPatientInfo(selectedDoc.patientId);
        const hasAttention = selectedDoc.status === 'attention' || selectedDoc.status === 'critical';

        return (
          <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 shadow-2xl space-y-5 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
              
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold border ${meta.color}`}>
                      <TypeIcon className="w-3.5 h-3.5" />
                      <span>{isAr ? meta.labelAr : meta.labelFr}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>{isAr ? patient.fullNameAr : patient.fullNameFr}</span>
                    </span>

                    {hasAttention && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{isAr ? 'يتطلب متابعة سريرية' : 'Attention requise'}</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-slate-100 leading-snug">
                    {selectedDoc.title}
                  </h3>
                </div>

                <button
                  onClick={() => setSelectedDoc(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Core Metadata Card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-700 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">{isAr ? 'تاريخ الفحص / الوثيقة:' : 'Date :'}</span>
                  <span className="font-bold font-mono text-slate-800 dark:text-slate-100">{selectedDoc.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">{isAr ? 'الطبيب المعالج:' : 'Médecin :'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{selectedDoc.doctorName || '--'}</span>
                  {selectedDoc.specialty && (
                    <span className="text-[10px] text-teal-600 dark:text-teal-400 block">{selectedDoc.specialty}</span>
                  )}
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block text-[11px]">{isAr ? 'المؤسسة الصحية:' : 'Établissement :'}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{selectedDoc.facility || '--'}</span>
                </div>
              </div>

              {/* Mandatory Medical Safety Disclaimer */}
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-850 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="block font-bold">
                    {isAr ? 'تنبيه طبي وقانوني هام:' : 'Avertissement médical réglementaire :'}
                  </strong>
                  <span>
                    {isAr
                      ? 'الاستخلاص والملخص الآلي مخصصان للمساعدة التنظيمية فقط، ولا يمثلان تشخيصاً طبياً مؤكداً أو توصية علاجية. يجب دائماً عرض الوثيقة الأصلية على الطبيب المعالج أو الصيدلي لاعتماد أي إجراء.'
                      : 'L’extraction OCR et la synthèse sont purement indicatives et ne sauraient constituer un diagnostic ou une prescription. Consultez votre praticien référent.'}
                  </span>
                </div>
              </div>

              {/* Source Authenticity & Confidence Score */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <FileCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="font-semibold">{isAr ? 'مصدر الوثيقة الأصلية:' : 'Source originale :'}</span>
                  <span>{selectedDoc.facility || (isAr ? 'مرفق صحي جزائري' : 'Établissement de santé')}</span>
                  <span>•</span>
                  <span className="font-mono text-slate-500">{selectedDoc.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400">{isAr ? 'دقة الاستخراج OCR:' : 'Score de confiance :'}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold font-mono text-[10px] border border-emerald-300 dark:border-emerald-800">
                    96% {isAr ? 'مطابقة' : 'confiance'}
                  </span>
                </div>
              </div>

              {/* AI Indicative Summary (Clearly separated from raw text) */}
              {selectedDoc.conclusion && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-black text-teal-800 dark:text-teal-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>{isAr ? 'الملخص الاسترشادي بالذكاء الاصطناعي (Synthèse IA):' : 'Synthèse Indicative par IA :'}</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 font-bold">
                      {isAr ? 'قراءة مساعدة' : 'Aide à la lecture'}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 text-teal-950 dark:text-teal-100 border border-teal-100 dark:border-teal-900/60 text-xs leading-relaxed font-medium">
                    {selectedDoc.conclusion}
                  </div>
                </div>
              )}

              {/* Clinical Recommendations / Follow-up */}
              {selectedDoc.recommendations && (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-800 dark:text-slate-200">
                    <ArrowIcon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>{isAr ? 'الإجراءات المقترحة للمتابعة (Conduite à tenir):' : 'Recommandations & Suivi :'}</span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed">
                    {selectedDoc.recommendations}
                  </div>
                </div>
              )}

              {/* Structured Extracted Data (Medications / Labs / Biometry / ECG) */}
              {selectedDoc.extractedData && (
                <div className="space-y-3 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    {isAr ? 'البيانات المنظمة المستخرجة:' : 'Données Cliniques Extraites :'}
                  </span>

                  {/* Medications list */}
                  {selectedDoc.extractedData.medications && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                        <Pill className="w-4 h-4" />
                        <span>{isAr ? 'الأدوية الموصوفة والجرعات:' : 'Médicaments prescrits :'}</span>
                      </span>
                      <div className="space-y-1.5">
                        {selectedDoc.extractedData.medications.map((m: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs flex items-center justify-between"
                          >
                            <div>
                              <strong className="text-slate-900 dark:text-slate-100 block">{m.name || m}</strong>
                              {m.dosage && <span className="text-slate-600 dark:text-slate-300 text-[11px]">{m.dosage}</span>}
                            </div>
                            {m.duration && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 font-bold font-mono">
                                {m.duration}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lab Results list */}
                  {selectedDoc.extractedData.labResults && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                        <FlaskConical className="w-4 h-4" />
                        <span>{isAr ? 'النتائج والمؤشرات البيولوجية:' : 'Valeurs Biologiques :'}</span>
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedDoc.extractedData.labResults.map((l: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/40 text-xs flex items-center justify-between"
                          >
                            <div>
                              <div className="font-bold text-slate-900 dark:text-slate-100">{l.testName}</div>
                              {l.referenceMin !== undefined && (
                                <div className="text-[10px] text-slate-500">
                                  {isAr ? 'المجال:' : 'Norme :'} {l.referenceMin} - {l.referenceMax} {l.unit}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <span className={`font-mono font-bold text-sm ${l.isAbnormal ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {l.value} {l.unit}
                              </span>
                              {l.interpretation && (
                                <span className="block text-[10px] text-red-600 dark:text-red-400 font-semibold">{l.interpretation}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Fetal Biometry if pregnancy scan */}
                  {selectedDoc.extractedData.biometry && (
                    <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-xs space-y-2">
                      <strong className="text-purple-900 dark:text-purple-300 block">{isAr ? 'القياسات الحيوية للجنين (Biométrie Fœtale):' : 'Biométrie Fœtale :'}</strong>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-[11px]">
                        {Object.entries(selectedDoc.extractedData.biometry).map(([k, v]) => (
                          <div key={k} className="bg-white/80 dark:bg-slate-900 p-1.5 rounded-lg text-center">
                            <span className="text-slate-400 block text-[9px]">{k}</span>
                            <span className="font-bold text-purple-700 dark:text-purple-300">{v as string}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* General notes */}
              {selectedDoc.notes && (
                <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong className="text-slate-700 dark:text-slate-300 block mb-1">{isAr ? 'ملاحظات إضافية:' : 'Remarques :'}</strong>
                  <p>{selectedDoc.notes}</p>
                </div>
              )}

              {/* Tags list */}
              {selectedDoc.tags && selectedDoc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {selectedDoc.tags.map((t, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md font-mono">
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>{isAr ? 'طباعة تقرير الوثيقة' : 'Imprimer'}</span>
                </button>

                <button
                  onClick={() => setSelectedDoc(null)}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  {isAr ? 'إغلاق' : 'Fermer'}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* MANUAL DOCUMENT CREATION MODAL */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                {isAr ? 'إضافة وثيقة طبية جديدة للأرشيف' : 'Ajouter un nouveau document'}
              </h3>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
              {/* Member Selector */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'المريض صاحب الوثيقة:' : 'Patient :'}
                </label>
                <select
                  value={manualForm.patientId}
                  onChange={(e) => setManualForm({ ...manualForm, patientId: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 font-bold"
                >
                  {familyMembers.map((m) => (
                    <option key={m.id} value={m.id} className="dark:bg-slate-900">
                      {isAr ? m.fullNameAr : m.fullNameFr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'عنوان الوثيقة:' : 'Titre du document :'}
                </label>
                <input
                  type="text"
                  required
                  value={manualForm.title}
                  onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
                  placeholder={isAr ? 'مثال: فحص صدى صوتي، وصفة مضاد حيوي...' : 'Ex: Échographie pelvienne...'}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Type and Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'نوع الوثيقة:' : 'Type de document :'}
                  </label>
                  <select
                    value={manualForm.type}
                    onChange={(e: any) => setManualForm({ ...manualForm, type: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100"
                  >
                    <option value="prescription">{isAr ? 'وصفة طبية' : 'Ordonnance'}</option>
                    <option value="lab_result">{isAr ? 'تحليل مخبري' : 'Bilan Biologique'}</option>
                    <option value="radiology">{isAr ? 'أشعة وتصوير' : 'Radiologie / Scanner'}</option>
                    <option value="ecg_cardio">{isAr ? 'تخطيط قلب وفحوصات' : 'ECG / Cardio'}</option>
                    <option value="surgery_report">{isAr ? 'تقرير جراحي واستشفاء' : 'Compte-rendu Opératoire'}</option>
                    <option value="vaccination">{isAr ? 'دفتر تلقيحات' : 'Carnet de Vaccination'}</option>
                    <option value="certificate">{isAr ? 'شهادة طبية ورخصة' : 'Certificat Médical'}</option>
                    <option value="specialist_report">{isAr ? 'استشارة تخصصية' : 'Rapport Spécialiste'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'تاريخ الوثيقة:' : 'Date :'}
                  </label>
                  <input
                    type="date"
                    required
                    value={manualForm.date}
                    onChange={(e) => setManualForm({ ...manualForm, date: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              {/* Doctor & Facility */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'اسم الطبيب:' : 'Médecin :'}
                  </label>
                  <input
                    type="text"
                    value={manualForm.doctorName}
                    onChange={(e) => setManualForm({ ...manualForm, doctorName: e.target.value })}
                    placeholder={isAr ? 'د. فلان' : 'Dr...'}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'المؤسسة / العيادة:' : 'Établissement :'}
                  </label>
                  <input
                    type="text"
                    value={manualForm.facility}
                    onChange={(e) => setManualForm({ ...manualForm, facility: e.target.value })}
                    placeholder={isAr ? 'عيادة الأمل...' : 'Clinique...'}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Clinical Conclusion & Status */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'الخلاصة والتشخيص الطبي:' : 'Conclusion & Diagnostic :'}
                </label>
                <textarea
                  rows={2}
                  value={manualForm.conclusion}
                  onChange={(e) => setManualForm({ ...manualForm, conclusion: e.target.value })}
                  placeholder={isAr ? 'خلاصة الفحص أو نتيجة التحليل الرئيسية...' : 'Conclusion principale du compte-rendu...'}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Recommendations */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'التوصيات والإجراءات القادمة:' : 'Recommandations & Conduite à tenir :'}
                </label>
                <input
                  type="text"
                  value={manualForm.recommendations}
                  onChange={(e) => setManualForm({ ...manualForm, recommendations: e.target.value })}
                  placeholder={isAr ? 'مثال: إعادة الفحص بعد 3 أشهر، متابعة الضغط...' : 'Ex: Contrôle dans 3 mois...'}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Status & Tags */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'حالة النتيجة:' : 'Statut :'}
                  </label>
                  <select
                    value={manualForm.status}
                    onChange={(e: any) => setManualForm({ ...manualForm, status: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100"
                  >
                    <option value="normal">{isAr ? 'سليم وطبيعي' : 'Normal'}</option>
                    <option value="attention">{isAr ? 'يتطلب متابعة وانتباه' : 'Attention requise'}</option>
                    <option value="completed">{isAr ? 'مكتمل وأرشيف سابق' : 'Complété / Ancien'}</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الكلمات المفتاحية (مفصولة بفاصلة):' : 'Tags (séparés par virgule) :'}
                  </label>
                  <input
                    type="text"
                    value={manualForm.tags}
                    onChange={(e) => setManualForm({ ...manualForm, tags: e.target.value })}
                    placeholder="قلب, كوليسترول, دم"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-xs font-bold"
                >
                  {isAr ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-xs"
                >
                  {isAr ? 'حفظ في الأرشيف' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ArchiveOCRView;
