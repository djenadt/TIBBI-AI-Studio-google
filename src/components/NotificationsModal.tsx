import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  Calendar,
  Pill,
  FlaskConical,
  AlertTriangle,
  Info,
  Clock,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useTibbi } from '../context/TibbiContext';
import { HealthNotificationItem, tr } from '../types/tibbi';
import { localizeText } from '../utils/frTranslator';

export const NotificationsModal: React.FC = () => {
  const {
    language,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    isNotificationsModalOpen,
    setIsNotificationsModalOpen,
    toggleMedicationScheduleStatus,
    dailySchedule,
    setActiveTab,
  } = useTibbi();

  const isAr = language === 'ar';
  const [filterType, setFilterType] = useState<'all' | 'medication' | 'appointment' | 'lab'>('all');
  const [confirmingDoseItem, setConfirmingDoseItem] = useState<{ notifId: string; schedId: string; name: string } | null>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isNotificationsModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsNotificationsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNotificationsModalOpen, setIsNotificationsModalOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isNotificationsModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isNotificationsModalOpen]);

  if (!isNotificationsModalOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const handleActionClick = (notif: HealthNotificationItem) => {
    markNotificationAsRead(notif.id);
    if (notif.type === 'medication' && notif.medScheduleId) {
      setConfirmingDoseItem({
        notifId: notif.id,
        schedId: notif.medScheduleId,
        name: tr(language, notif.titleAr, notif.titleFr, notif.titleEn || localizeText(notif.titleAr, 'en')),
      });
    } else if (notif.type === 'appointment') {
      setIsNotificationsModalOpen(false);
      setActiveTab('appointments');
    } else if (notif.type === 'lab') {
      setIsNotificationsModalOpen(false);
      setActiveTab('labs');
    }
  };

  const handleConfirmDose = (status: 'taken' | 'skipped') => {
    if (!confirmingDoseItem) return;
    toggleMedicationScheduleStatus(confirmingDoseItem.schedId, status);
    markNotificationAsRead(confirmingDoseItem.notifId);
    setConfirmingDoseItem(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={() => setIsNotificationsModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="notif-center-title"
    >
      <div
        className={`bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden ${isAr ? 'text-right' : 'text-left'} transition-colors`}
        onClick={(e) => e.stopPropagation()}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-teal-700 to-emerald-800 text-white shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 id="notif-center-title" className="text-base sm:text-lg font-black tracking-tight">
                {tr(
                  language,
                  'مركز التنبيهات والتذكيرات الصحية',
                  'Centre de Notifications & Rappels',
                  'Health Notifications & Reminders'
                )}
              </h3>
              <p className="text-xs text-teal-100">
                {unreadNotificationCount > 0
                  ? tr(
                      language,
                      `لديك ${unreadNotificationCount} تنبيهات تحتاج انتباهك`,
                      `${unreadNotificationCount} notification(s) non lue(s)`,
                      `You have ${unreadNotificationCount} unread notification(s)`
                    )
                  : tr(
                      language,
                      'جميع التنبيهات مقروءة ومحدثة',
                      'Toutes les notifications sont lues',
                      'All notifications are read and up to date'
                    )}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsNotificationsModalOpen(false)}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/15 cursor-pointer transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={tr(language, 'إغلاق مركز التنبيهات', 'Fermer', 'Close notifications')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Categories and Mark all as read */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-1 text-xs">
            {[
              { id: 'all', labelAr: 'الكل', labelFr: 'Tous', labelEn: 'All' },
              { id: 'medication', labelAr: 'الأدوية', labelFr: 'Médicaments', labelEn: 'Medications' },
              { id: 'appointment', labelAr: 'المواعيد', labelFr: 'Rendez-vous', labelEn: 'Appointments' },
              { id: 'lab', labelAr: 'التحاليل', labelFr: 'Bilans', labelEn: 'Labs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterType === tab.id
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tr(language, tab.labelAr, tab.labelFr, tab.labelEn)}
              </button>
            ))}
          </div>

          {unreadNotificationCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer whitespace-nowrap"
            >
              {tr(language, 'تحديد الكل كمقروء', 'Tout marquer comme lu', 'Mark all as read')}
            </button>
          )}
        </div>

        {/* Notification List (Scrollable Area) */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3 pb-8">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Bell className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-slate-600 dark:text-slate-300">
                {tr(language, 'لا توجد تنبيهات في هذا القسم', 'Aucune notification', 'No notifications in this category')}
              </p>
              <p className="text-xs text-slate-400">
                {tr(
                  language,
                  'التذكيرات والجرعات القادمة ستظهر هنا تلقائياً.',
                  'Les prochains rappels apparaîtront ici.',
                  'Upcoming reminders and scheduled doses will appear here.'
                )}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notif) => {
              const isUnread = !notif.isRead;
              const notifTitle = tr(
                language,
                notif.titleAr,
                notif.titleFr,
                notif.titleEn || localizeText(notif.titleAr, 'en')
              );
              const notifMsg = tr(
                language,
                notif.messageAr,
                notif.messageFr,
                notif.messageEn || localizeText(notif.messageAr, 'en')
              );
              const notifPatient = tr(
                language,
                notif.patientNameAr,
                notif.patientNameFr,
                notif.patientNameEn || notif.patientNameFr
              );
              const notifAction = tr(
                language,
                notif.actionLabelAr || 'استجابة',
                notif.actionLabelFr || 'Action',
                notif.actionLabelEn || 'Action'
              );
              return (
                <div
                  key={notif.id}
                  className={`p-3.5 rounded-2xl border transition-all text-xs space-y-2 ${
                    isUnread
                      ? 'bg-teal-50/70 dark:bg-teal-950/40 border-teal-300 dark:border-teal-800/80 shadow-xs'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          notif.type === 'medication'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300'
                            : notif.type === 'appointment'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300'
                        }`}
                      >
                        {notif.type === 'medication' ? (
                          <Pill className="w-4 h-4" />
                        ) : notif.type === 'appointment' ? (
                          <Calendar className="w-4 h-4" />
                        ) : (
                          <FlaskConical className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-slate-100">
                          {notifTitle}
                        </h4>
                        <span className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold">
                          {notifPatient}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isUnread ? (
                        <span
                          className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse"
                          title={tr(language, 'غير مقروء', 'Non lu', 'Unread')}
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">
                          {tr(language, 'مقروء', 'Lu', 'Read')}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                    {notifMsg}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(notif.timestamp).toLocaleTimeString(tr(language, 'ar-DZ', 'fr-FR', 'en-GB'), {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>

                    <div className="flex items-center gap-2">
                      {isUnread && (
                        <button
                          onClick={() => markNotificationAsRead(notif.id)}
                          className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                        >
                          {tr(language, 'تحديد كمقروء', 'Marquer comme lu', 'Mark as read')}
                        </button>
                      )}
                      <button
                        onClick={() => handleActionClick(notif)}
                        className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer"
                      >
                        {notifAction}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Browser Notification Privacy Note */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
            <span className="font-bold flex items-center gap-1 text-slate-700 dark:text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                {tr(
                  language,
                  'تنبيهات داخلية دون الحاجة لصلاحيات متصفح مزعجة',
                  'Système de rappels intégré sécurisé',
                  'Built-in private alert system'
                )}
              </span>
            </span>
            <p>
              {tr(
                language,
                'يعمل مركز التنبيهات ذاتياً داخل تطبيق TIBBI على جهازك؛ لا يُلزمك بمنح أذونات المتصفح الخارجية، ويمكنك متابعة الجرعات والمواعيد هنا بكل خصوصية.',
                'Les alertes s’exécutent directement dans l’application sans solliciter d’autorisations push externes intrusives.',
                'Alerts run locally inside TIBBI on your device without intrusive browser push permissions.'
              )}
            </p>
          </div>
        </div>

        {/* Action / Explicit Dose Confirmation Drawer */}
        {confirmingDoseItem && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/70 border-t border-amber-200 dark:border-amber-800 space-y-3 shrink-0">
            <div className="flex items-start gap-2 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-950 dark:text-amber-200 block">
                  {tr(
                    language,
                    'تأكيد تسجيل الجرعة الدوائية صراحة',
                    'Confirmation expresse de la prise',
                    'Explicit Dose Confirmation'
                  )}
                </span>
                <p className="text-amber-800 dark:text-amber-300 text-[11px]">
                  {tr(
                    language,
                    `هل قمت بالفعل بتناول دواء (${confirmingDoseItem.name}) أم تود تخطي الجرعة؟`,
                    `Confirmez-vous la prise du médicament (${confirmingDoseItem.name}) ?`,
                    `Did you take (${confirmingDoseItem.name}) or would you like to skip this dose?`
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => setConfirmingDoseItem(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold cursor-pointer hover:bg-slate-100"
              >
                {tr(language, 'إلغاء', 'Annuler', 'Cancel')}
              </button>
              <button
                onClick={() => handleConfirmDose('skipped')}
                className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold cursor-pointer hover:bg-slate-300"
              >
                {tr(language, 'تخطي الجرعة', 'Passer', 'Skip Dose')}
              </button>
              <button
                onClick={() => handleConfirmDose('taken')}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold cursor-pointer flex items-center gap-1 shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{tr(language, 'نعم، تم تناول الجرعة', 'Prise confirmée', 'Yes, Taken')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-between text-xs">
          <span className="text-[10px] text-slate-500 font-mono">
            TIBBI Alert Center DZ
          </span>
          <button
            onClick={() => setIsNotificationsModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-bold text-xs hover:bg-slate-900 cursor-pointer min-h-[40px]"
          >
            {tr(language, 'إغلاق', 'Fermer', 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
};
