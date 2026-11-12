import React, { useEffect } from 'react';
import {
  ShieldCheck,
  X,
  Eye,
  Share2,
  FileText,
  UserCheck,
  Lock,
  Clock,
  Laptop,
} from 'lucide-react';
import { useTibbi } from '../context/TibbiContext';

export const AuditLogsModal: React.FC = () => {
  const {
    language,
    accessLogs,
    isAuditLogsModalOpen,
    setIsAuditLogsModalOpen,
  } = useTibbi();

  const isAr = language === 'ar';

  // Close on Escape key
  useEffect(() => {
    if (!isAuditLogsModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAuditLogsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuditLogsModalOpen, setIsAuditLogsModalOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isAuditLogsModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isAuditLogsModalOpen]);

  if (!isAuditLogsModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={() => setIsAuditLogsModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="audit-logs-title"
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-right transition-colors"
        onClick={(e) => e.stopPropagation()}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white shrink-0 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 id="audit-logs-title" className="text-base sm:text-lg font-black tracking-tight">
                {isAr ? 'سجل عمليات فتح الملفات ومشاركة البيانات' : 'Journal d’Accès & Audit de Sécurité'}
              </h3>
              <p className="text-xs text-slate-300">
                {isAr
                  ? 'سجل غير قابل للتعديل يوثق جميع عمليات استعراض السجلات وإظهار المعرفات ومشاركة الروابط'
                  : 'Historique traçable de toutes les consultations, démasquages et partages'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuditLogsModalOpen(false)}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 cursor-pointer transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={isAr ? 'إغلاق سجل الوصول' : 'Fermer'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info banner on privacy & legal guardianship */}
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-300 flex items-center gap-2 shrink-0">
          <Lock className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
          <p className="leading-relaxed">
            {isAr
              ? 'مبدأ الشفافية والوصاية: بيانات الأطفال والقصر لا تُعرض إلا للممثل والولي القانوني المعتمد، وتُسجّل كل عملية اطلاع لحماية خصوصية الأسرة.'
              : 'Conformité stricte : Seuls les tuteurs légaux peuvent consulter les dossiers pédiatriques.'}
          </p>
        </div>

        {/* Scrollable logs list */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3 pb-8 text-xs">
          {accessLogs.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <ShieldCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="font-bold text-slate-600 dark:text-slate-300">
                {isAr ? 'لا توجد عمليات مسجلة حتى الآن' : 'Aucun journal d’accès'}
              </p>
            </div>
          ) : (
            accessLogs.map((log) => {
              const isShare = log.action === 'create_share_pass';
              const isUnmask = log.action === 'unmask_id';
              const isView = log.action === 'view_profile' || log.action === 'view_document';

              return (
                <div
                  key={log.id}
                  className="bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isShare
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300'
                            : isUnmask
                            ? 'bg-red-100 text-red-800 dark:bg-red-950/70 dark:text-red-300'
                            : 'bg-teal-100 text-teal-800 dark:bg-teal-950/70 dark:text-teal-300'
                        }`}
                      >
                        {isShare ? (
                          <Share2 className="w-3.5 h-3.5" />
                        ) : isUnmask ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <UserCheck className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">
                          {isAr ? log.actionLabelAr : log.actionLabelFr}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {isAr ? `المعني: ${log.targetMemberName}` : `Cible : ${log.targetMemberName}`}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.timestamp).toLocaleString(isAr ? 'ar-DZ' : 'fr-FR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {log.details && (
                    <p className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px]">
                      {log.details}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {isAr ? `المستخدم: ${log.actorName}` : `Opéré par: ${log.actorName}`}
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Laptop className="w-3 h-3" />
                      {log.ipOrDevice || 'جلسة محلية'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-between text-xs">
          <span className="text-[10px] text-slate-400 font-mono">
            TIBBI Security Audit Log • الجزائر 🇩🇿
          </span>
          <button
            onClick={() => setIsAuditLogsModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-bold text-xs hover:bg-slate-900 cursor-pointer min-h-[40px]"
          >
            {isAr ? 'إغلاق السجل' : 'Fermer'}
          </button>
        </div>
      </div>
    </div>
  );
};
