import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Pill,
  Plus,
  Clock,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  Trash2,
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Check,
  X,
  FileText,
  Sparkles,
  Info,
  Timer,
  AlertTriangle,
} from 'lucide-react';
import { useTibbi } from '../context/TibbiContext';
import { Medication, MedicationForm, MedicationScheduleItem, tr } from '../types/tibbi';
import {
  playMedicationChime,
  requestNotificationPermission,
  getNotificationPermission,
  sendBrowserNotification,
} from '../utils/medicationAlerts';
import { localizeText, translateMedicationForm } from '../utils/frTranslator';

export const MedicationsView: React.FC = () => {
  const {
    language,
    activeMember,
    activeMemberMedications,
    addMedication,
    toggleMedicationStatus,
    deleteMedication,
    dailySchedule,
    toggleMedicationScheduleStatus,
  } = useTibbi();

  const isAr = language === 'ar';

  const [activeTabFilter, setActiveTabFilter] = useState<'current' | 'past' | 'all'>('current');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Notification and Alert State
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(() =>
    getNotificationPermission()
  );
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeAlertDose, setActiveAlertDose] = useState<{
    id: string;
    medicationName: string;
    dosage: string;
    time: string;
    instructions?: string;
    isSimulated?: boolean;
  } | null>(null);
  const [snoozedUntil, setSnoozedUntil] = useState<number | null>(null);
  const [lastNotifiedDoseId, setLastNotifiedDoseId] = useState<string | null>(null);

  const defaultFrequency = tr(language, 'مرة واحدة يومياً', '1 fois par jour', 'Once daily');

  const [form, setForm] = useState({
    name: '',
    dosage: '',
    form: 'tablet' as MedicationForm,
    frequency: defaultFrequency,
    timingStr: '08:00',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    prescribingDoctor: '',
    prescribingSpecialty: '',
    condition: '',
    instructions: '',
    reminderEnabled: true,
  });

  const memberSchedule = dailySchedule.filter((s) => s.patientId === activeMember.id);

  const filteredMeds = activeMemberMedications.filter((m) => {
    if (activeTabFilter === 'current') return m.status === 'active';
    if (activeTabFilter === 'past') return m.status === 'completed' || m.status === 'paused';
    return true;
  });

  // Calculate if there is any pending dose currently due
  const checkDueDose = () => {
    // If snoozed and snooze time hasn't passed, do not alert
    if (snoozedUntil && Date.now() < snoozedUntil) {
      return;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentMinutesOfDay = currentHour * 60 + currentMinute;

    // Check each pending schedule item for active member
    for (const sched of memberSchedule) {
      if (sched.status !== 'pending') continue;

      const [hStr, mStr] = sched.time.split(':');
      const doseHour = parseInt(hStr, 10);
      const doseMin = parseInt(mStr, 10);
      const doseMinutesOfDay = doseHour * 60 + doseMin;

      // Dose is due if within 45 mins before or up to 3 hours after scheduled time today
      const diff = currentMinutesOfDay - doseMinutesOfDay;
      if (diff >= -15 && diff <= 180) {
        // Matched due dose!
        const relatedMed = activeMemberMedications.find(
          (m) => m.name.toLowerCase() === sched.medicationName.toLowerCase()
        );

        const alertData = {
          id: sched.id,
          medicationName: sched.medicationName,
          dosage: sched.dosage,
          time: sched.time,
          instructions: relatedMed?.instructions,
          isSimulated: false,
        };

        setActiveAlertDose(alertData);

        // Send browser notification and chime if new
        if (lastNotifiedDoseId !== sched.id) {
          setLastNotifiedDoseId(sched.id);
          if (soundEnabled) {
            playMedicationChime();
          }
          sendBrowserNotification(
            tr(
              language,
              `تنبيه دواء: موعد جرعة ${sched.medicationName}`,
              `Rappel Médicament : ${sched.medicationName}`,
              `Medication Reminder: ${sched.medicationName}`
            ),
            {
              body: tr(
                language,
                `حان الآن موعد تناول ${sched.medicationName} (${sched.dosage}) في تمام ${sched.time}.`,
                `Il est l'heure de prendre votre dose de ${sched.medicationName} (${sched.dosage}) à ${sched.time}.`,
                `It is time to take ${sched.medicationName} (${localizeText(sched.dosage, 'en')}) at ${sched.time}.`
              ),
            }
          );
        }
        return;
      }
    }
  };

  // Monitor doses periodically
  useEffect(() => {
    checkDueDose();
    const interval = setInterval(checkDueDose, 20000); // Check every 20 seconds
    return () => clearInterval(interval);
  }, [memberSchedule, activeMemberMedications, snoozedUntil, soundEnabled, lastNotifiedDoseId]);

  // Request browser notification permission
  const handleEnableNotifications = async () => {
    const res = await requestNotificationPermission();
    setPermissionStatus(res);
    if (res === 'granted') {
      sendBrowserNotification(
        tr(language, 'تم تفعيل إشعارات TIBBI بنجاح!', 'Notifications TIBBI activées !', 'TIBBI notifications enabled!'),
        {
          body: tr(
            language,
            'ستتلقى تنبيهات دقيقة بمواعيد جرعات الأدوية في وقتها المحدد.',
            'Vous recevrez des alertes précises lors des heures de prises.',
            'You will receive timely reminders for your scheduled medication doses.'
          ),
        }
      );
      if (soundEnabled) playMedicationChime();
    }
  };

  // Simulate an alert for test purposes
  const handleTestAlert = () => {
    const targetDose = memberSchedule.find((s) => s.status === 'pending') || memberSchedule[0] || {
      id: 'test_dose',
      patientId: activeMember.id,
      medicationId: 'test_med',
      medicationName: tr(language, 'Coversyl (Périndopril) 5mg', 'Coversyl 5mg', 'Coversyl 5mg'),
      dosage: tr(language, 'قرص واحد يومياً', '1 comprimé par jour', '1 tablet daily'),
      time: '08:00',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
    };

    const relatedMed = activeMemberMedications.find(
      (m) => m.name.toLowerCase() === targetDose.medicationName.toLowerCase()
    );

    setActiveAlertDose({
      id: targetDose.id,
      medicationName: targetDose.medicationName,
      dosage: targetDose.dosage,
      time: targetDose.time,
      instructions:
        relatedMed?.instructions ||
        tr(language, 'يؤخذ صباحاً على الريق قبل الفطور مع كأس ماء', 'À prendre le matin à jeun', 'Take in the morning on an empty stomach'),
      isSimulated: true,
    });

    if (soundEnabled) {
      playMedicationChime();
    }

    sendBrowserNotification(
      tr(
        language,
        `[تجربة] موعد جرعة: ${targetDose.medicationName}`,
        `[Test] Rappel : ${targetDose.medicationName}`,
        `[Test] Reminder: ${targetDose.medicationName}`
      ),
      {
        body: tr(
          language,
          `حان موعد تناول الدواء (${targetDose.dosage}) - تجربة التنبيه البصري والمسموع.`,
          `Prise de médicament (${targetDose.dosage}) - test du système d'alerte.`,
          `Medication dose (${localizeText(targetDose.dosage, 'en')}) - visual and audio alert test.`
        ),
      }
    );
  };

  // Acknowledge taking the dose
  const handleMarkDoseTaken = () => {
    if (activeAlertDose && !activeAlertDose.isSimulated) {
      toggleMedicationScheduleStatus(activeAlertDose.id, 'taken');
    }
    setActiveAlertDose(null);
    setSnoozedUntil(null);
    if (soundEnabled) {
      playMedicationChime();
    }
  };

  // Snooze alert for 10 minutes
  const handleSnoozeDose = () => {
    setSnoozedUntil(Date.now() + 10 * 60 * 1000); // 10 minutes
    setActiveAlertDose(null);
  };

  // Skip dose
  const handleSkipDose = () => {
    if (activeAlertDose && !activeAlertDose.isSimulated) {
      toggleMedicationScheduleStatus(activeAlertDose.id, 'skipped');
    }
    setActiveAlertDose(null);
    setSnoozedUntil(null);
  };

  const handleCreateMedication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const timings = form.timingStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    addMedication({
      patientId: activeMember.id,
      name: form.name,
      dosage: form.dosage,
      form: form.form,
      frequency: form.frequency,
      timing: timings.length > 0 ? timings : ['08:00'],
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      prescribingDoctor: form.prescribingDoctor || tr(language, 'طبيب العائلة', 'Médecin traitant', 'Primary Care Physician'),
      prescribingSpecialty: form.prescribingSpecialty,
      condition: form.condition,
      instructions: form.instructions,
      status: 'active',
      reminderEnabled: form.reminderEnabled,
    });

    setIsAddModalOpen(false);
    setForm({
      name: '',
      dosage: '',
      form: 'tablet',
      frequency: defaultFrequency,
      timingStr: '08:00',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      prescribingDoctor: '',
      prescribingSpecialty: '',
      condition: '',
      instructions: '',
      reminderEnabled: true,
    });
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Pill className="w-7 h-7 text-amber-500" />
            <span>{tr(language, 'إدارة الأدوية وتذكيرات العلاج', 'Gestion des Médicaments & Rappels', 'Medications & Treatment Reminders')}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {tr(
              language,
              `سجل علاجات ${activeMember.fullNameAr} - متابعة الجرعات اليومية، تاريخ العلاجات السابقة، ومواعيد التجديد.`,
              `Traitements de ${activeMember.fullNameFr} - Prises quotidiennes, historique et renouvellements.`,
              `Treatments for ${activeMember.fullNameFr} - Daily doses, medication history, and renewals.`
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Test Alert Button */}
          <button
            onClick={handleTestAlert}
            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 font-bold text-xs cursor-pointer shadow-2xs transition-colors"
            title={tr(language, 'اختبار التنبيه الصوتي والبصري للجرعة', 'Tester l’alerte visuelle et sonore', 'Test visual & audio dose alert')}
          >
            <BellRing className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>{tr(language, 'تجربة التنبيه الآن', 'Tester l’alerte', 'Test Alert')}</span>
          </button>

          <button
            onClick={() => {
              setForm((prev) => ({ ...prev, frequency: defaultFrequency }));
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{tr(language, '+ تسجيل دواء جديد', '+ Nouveau médicament', '+ New Medication')}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PROMINENT VISUAL ALERT SYSTEM (TRIGGERED WHEN DOSE IS DUE)               */}
      {/* ========================================================================= */}
      {activeAlertDose && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-rose-500 to-teal-600 p-[2px] shadow-2xl animate-pulse">
          <div className="bg-white dark:bg-slate-900 rounded-[22px] p-5 sm:p-6 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 ring-4 ring-amber-400/20 shrink-0">
                  <BellRing className="w-7 h-7 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 text-[11px] font-black uppercase tracking-wider">
                      {tr(language, 'حان موعد الجرعة الآن !', 'Dose à prendre maintenant !', 'Dose Due Now!')}
                    </span>
                    {activeAlertDose.isSimulated && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
                        {tr(language, 'وضع تجريبي', 'Mode test', 'Test mode')}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
                    {localizeText(activeAlertDose.medicationName, language)}
                  </h3>
                </div>
              </div>

              {/* Sound Toggle */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  title={soundEnabled ? tr(language, 'كتم الصوت', 'Couper le son', 'Mute') : tr(language, 'تفعيل الصوت', 'Activer le son', 'Unmute')}
                >
                  {soundEnabled ? (
                    <>
                      <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <span>{tr(language, 'صوت التنبيه: مفعّل', 'Son : Activé', 'Sound: On')}</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4 text-slate-400" />
                      <span>{tr(language, 'صوت التنبيه: مكتوم', 'Son : Muet', 'Sound: Muted')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Dose Details */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500 dark:text-slate-400">{tr(language, 'المقدار والجرعة:', 'Posologie :', 'Dosage:')}</span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 font-mono text-sm">{localizeText(activeAlertDose.dosage, language)}</span>
                </div>
                {activeAlertDose.instructions && (
                  <p className="text-teal-800 dark:text-teal-300 font-medium">
                    💡 {localizeText(activeAlertDose.instructions, language)}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 px-3 py-1.5 rounded-xl font-mono font-bold text-xs shrink-0 self-start sm:self-auto">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>{activeAlertDose.time}</span>
              </div>
            </div>

            {/* Interactive Actions */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              <button
                onClick={handleSkipDose}
                className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs cursor-pointer transition-colors"
              >
                {tr(language, 'تخطي هذه المرة', 'Passer', 'Skip')}
              </button>

              <button
                onClick={handleSnoozeDose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                <Timer className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>{tr(language, 'تذكير بعد 10 دقائق', 'Rappeler dans 10 min', 'Snooze 10 min')}</span>
              </button>

              <button
                onClick={handleMarkDoseTaken}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-transform hover:scale-[1.02]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{tr(language, '✓ تم التناول الآن', '✓ Marquer prise', '✓ Mark Taken')}</span>
              </button>
            </div>

          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* BROWSER NOTIFICATION SETTINGS & STATUS BANNER                            */}
      {/* ========================================================================= */}
      <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/70 text-teal-700 dark:text-teal-400 shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold text-slate-800 dark:text-slate-200 block">
              {tr(language, 'إشعارات المتصفح والتنبيهات المسموعة', 'Notifications du navigateur & alertes', 'Browser Notifications & Sound Alerts')}
            </span>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              {permissionStatus === 'granted'
                ? tr(
                    language,
                    'إشعارات المتصفح مفعلة - ستتلقى تنبيهاً عند حلول موعد الجرعة حتى وإن كان التطبيق في الخلفية.',
                    'Notifications autorisées - vous recevrez un rappel à l’heure précise même en arrière-plan.',
                    'Notifications enabled - you will receive timely reminders even in the background.'
                  )
                : permissionStatus === 'denied'
                ? tr(
                    language,
                    'تم حظر الإشعارات في إعدادات المتصفح. يرجى السماح بالإشعارات من شريط العنوان لتلقيها.',
                    'Notifications bloquées dans votre navigateur. Activez-les depuis la barre d’adresse.',
                    'Notifications are blocked in your browser. Enable them from the address bar.'
                  )
                : tr(
                    language,
                    'فعل إشعارات المتصفح لتلقي تنبيهات منبثقة بمواعيد الجرعات بدقة.',
                    'Activez les notifications pour recevoir les alertes de prises.',
                    'Enable browser notifications to receive accurate dose alerts.'
                  )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {permissionStatus !== 'granted' && permissionStatus !== 'denied' && (
            <button
              onClick={handleEnableNotifications}
              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer transition-colors shadow-2xs"
            >
              {tr(language, 'تفعيل الإشعارات', 'Activer', 'Enable')}
            </button>
          )}
          {permissionStatus === 'granted' && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold text-[11px]">
              <Check className="w-3.5 h-3.5" />
              <span>{tr(language, 'الإشعارات مفعلة', 'Activées', 'Enabled')}</span>
            </span>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DAILY PILL TRACKER SECTION                                               */}
      {/* ========================================================================= */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">
              {tr(language, 'جدول جرعات اليوم', 'Planning des prises du jour', "Today's Dose Schedule")}
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-400">
            {new Date().toISOString().split('T')[0]}
          </span>
        </div>

        {memberSchedule.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-3 text-center bg-slate-50 dark:bg-slate-800/60 rounded-xl">
            {tr(language, 'لا توجد جرعات مجدولة لهذا اليوم.', 'Aucune prise programmée aujourd’hui.', 'No doses scheduled for today.')}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {memberSchedule.map((sched) => {
              const isTaken = sched.status === 'taken';
              const isSkipped = sched.status === 'skipped';
              const isCurrentAlert = activeAlertDose?.id === sched.id;

              return (
                <div
                  key={sched.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2 relative ${
                    isCurrentAlert
                      ? 'border-amber-500 dark:border-amber-400 ring-2 ring-amber-400/50 bg-amber-50/50 dark:bg-amber-950/40 shadow-sm'
                      : isTaken
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-200'
                      : isSkipped
                      ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500'
                      : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 hover:border-amber-400 dark:hover:border-amber-500/70'
                  }`}
                >
                  {isCurrentAlert && (
                    <span className="absolute -top-2 left-3 px-2 py-0.5 rounded-full bg-amber-500 text-white font-black text-[9px] uppercase shadow-xs">
                      {tr(language, 'تنبيه موعد', 'Alerte', 'Alert')}
                    </span>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                      {sched.time}
                    </span>
                    {isTaken && (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        {tr(language, 'أُخذت', 'Prise', 'Taken')}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        isTaken ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {localizeText(sched.medicationName, language)}
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{localizeText(sched.dosage, language)}</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between gap-1">
                    <button
                      onClick={() => toggleMedicationScheduleStatus(sched.id, isTaken ? 'pending' : 'taken')}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        isTaken
                          ? 'bg-emerald-600 dark:bg-emerald-600 text-white shadow-2xs'
                          : 'bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                      }`}
                    >
                      {isTaken ? tr(language, '✓ تم التناول', '✓ Validé', '✓ Taken') : tr(language, 'تناول الآن', 'Prendre', 'Take Now')}
                    </button>
                    {!isTaken && (
                      <button
                        onClick={() => toggleMedicationScheduleStatus(sched.id, isSkipped ? 'pending' : 'skipped')}
                        className="p-1.5 rounded-lg text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs cursor-pointer"
                        title={tr(language, 'تخطي الجرعة', 'Passer', 'Skip dose')}
                      >
                        {isSkipped ? tr(language, 'تراجع', 'Annuler', 'Undo') : tr(language, 'تخطي', 'Sauter', 'Skip')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Filter Tabs: Current / Past / All */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTabFilter('current')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              activeTabFilter === 'current'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tr(language, 'الأدوية الحالية (قيد الاستعمال)', 'Traitements en cours', 'Active Treatments')}
          </button>
          <button
            onClick={() => setActiveTabFilter('past')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              activeTabFilter === 'past'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tr(language, 'سجل الأدوية السابقة والمنتهية', 'Traitements passés', 'Past Treatments')}
          </button>
          <button
            onClick={() => setActiveTabFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
              activeTabFilter === 'all'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {tr(language, 'الكل', 'Tous', 'All')}
          </button>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-400 font-medium">
          {filteredMeds.length} {tr(language, 'أدوية', 'médicaments', 'medications')}
        </span>
      </div>

      {/* Medications List Cards */}
      {filteredMeds.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
          <Pill className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {tr(language, 'لا توجد أدوية مسجلة في هذا القسم.', 'Aucun médicament dans cette catégorie.', 'No medications in this category.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMeds.map((med) => {
            const isActive = med.status === 'active';
            const isPaused = med.status === 'paused';

            return (
              <div
                key={med.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-3 ${
                  isActive
                    ? 'border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500/70 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 opacity-80'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        isActive
                          ? 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300'
                          : isPaused
                          ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {isActive ? tr(language, 'قيد الاستعمال', 'En cours', 'Active') : isPaused ? tr(language, 'متوقف مؤقتاً', 'Suspendu', 'Paused') : tr(language, 'منتهي', 'Terminé', 'Completed')}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                      {translateMedicationForm(med.form, language)}
                    </span>
                  </div>

                  <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base leading-tight">
                    {localizeText(med.name, language)}
                  </h4>

                  <div className="text-xs text-amber-900/90 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200/60 dark:border-amber-800/60">
                    {localizeText(med.dosage, language)} • {localizeText(med.frequency, language)}
                  </div>

                  {med.condition && (
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-semibold text-slate-500 dark:text-slate-400">{tr(language, 'الحالة / المرض: ', 'Indication : ', 'Condition: ')}</span>
                      {localizeText(med.condition, language)}
                    </div>
                  )}

                  {med.prescribingDoctor && (
                    <div className="text-xs text-teal-800 dark:text-teal-400 font-semibold flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                      <span>{localizeText(med.prescribingDoctor, language)}</span>
                    </div>
                  )}

                  {med.instructions && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                      💡 {localizeText(med.instructions, language)}
                    </p>
                  )}

                  <div className="text-[11px] text-slate-400 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {tr(language, 'تاريخ البدء: ', 'Début : ', 'Start: ')}
                      {med.startDate} {med.endDate && `→ ${med.endDate}`}
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    {isActive ? (
                      <button
                        onClick={() => toggleMedicationStatus(med.id, 'completed')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold cursor-pointer"
                      >
                        {tr(language, 'تسجيل انتهاء العلاج', 'Marquer terminé', 'Mark Completed')}
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleMedicationStatus(med.id, 'active')}
                        className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 hover:bg-emerald-200 dark:hover:bg-emerald-900/70 text-emerald-800 dark:text-emerald-300 font-bold cursor-pointer"
                      >
                        {tr(language, 'إعادة التفعيل', 'Réactiver', 'Reactivate')}
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => deleteMedication(med.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer"
                    title={tr(language, 'حذف من السجل', 'Supprimer', 'Delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Medication Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 border border-transparent dark:border-slate-800">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Pill className="w-5 h-5 text-amber-500" />
                <span>{tr(language, 'تسجيل دواء أو علاج جديد', 'Ajouter un médicament', 'Add New Medication')}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMedication} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {tr(language, 'اسم الدواء التجاري أو العلمي *', 'Nom du médicament *', 'Medication Name *')}
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder={tr(language, 'مثال: Coversyl 5mg, Doliprane 1000mg...', 'Ex : Coversyl 5mg, Doliprane 1000mg...', 'e.g. Coversyl 5mg, Doliprane 1000mg...')}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'المقدار / الجرعة', 'Dosage', 'Dosage')}
                  </label>
                  <input
                    type="text"
                    required
                    value={form.dosage}
                    onChange={(e) => setForm({ ...form, dosage: e.target.value })}
                    placeholder={tr(language, 'قرص واحد، كبسولة، 5 مل...', '1 comprimé, 1 gélule, 5 ml...', '1 tablet, 1 capsule, 5 ml...')}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'الشكل الصيدلاني', 'Forme galénique', 'Dosage Form')}
                  </label>
                  <select
                    value={form.form}
                    onChange={(e) => setForm({ ...form, form: e.target.value as MedicationForm })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  >
                    <option value="tablet">{tr(language, 'أقراص (Comprimé)', 'Comprimé', 'Tablet')}</option>
                    <option value="capsule">{tr(language, 'كبسولات (Gélule)', 'Gélule', 'Capsule')}</option>
                    <option value="syrup">{tr(language, 'شراب (Sirop)', 'Sirop', 'Syrup')}</option>
                    <option value="injection">{tr(language, 'حقن (Injection)', 'Injection', 'Injection')}</option>
                    <option value="drops">{tr(language, 'قطرات (Gouttes)', 'Gouttes', 'Drops')}</option>
                    <option value="cream">{tr(language, 'مرهم / كريم (Pommade)', 'Pommade / Crème', 'Cream / Ointment')}</option>
                    <option value="inhaler">{tr(language, 'بخاخ (Inhalateur)', 'Inhalateur', 'Inhaler')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'التكرار اليومي', 'Fréquence', 'Frequency')}
                  </label>
                  <input
                    type="text"
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                    placeholder={tr(language, 'مرة صباحاً، مرتان يومياً...', '1 fois le matin, 2 fois par jour...', 'Once in the morning, twice daily...')}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'أوقات التناول (مفصولة بفواصل)', 'Heures (séparées par virgule)', 'Times (comma-separated)')}
                  </label>
                  <input
                    type="text"
                    value={form.timingStr}
                    onChange={(e) => setForm({ ...form, timingStr: e.target.value })}
                    placeholder="08:00, 20:00"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'تاريخ بداية العلاج', 'Date de début', 'Start Date')}
                  </label>
                  <input
                    type="date"
                    required
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'تاريخ الانتهاء (اختياري)', 'Date de fin', 'End Date (optional)')}
                  </label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {tr(language, 'الحالة أو المرض المرتبط بالعلاج', 'Indication médicale', 'Medical Indication')}
                </label>
                <input
                  type="text"
                  value={form.condition}
                  onChange={(e) => setForm({ ...form, condition: e.target.value })}
                  placeholder={tr(language, 'ضغط الدم، السكري، دعم الحمل، وقاية...', 'HTA, diabète, grossesse, prévention...', 'Hypertension, diabetes, pregnancy, prevention...')}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'الطبيب الواصف', 'Médecin prescripteur', 'Prescribing Doctor')}
                  </label>
                  <input
                    type="text"
                    value={form.prescribingDoctor}
                    onChange={(e) => setForm({ ...form, prescribingDoctor: e.target.value })}
                    placeholder={tr(language, 'د. كريم بوجمعة', 'Dr Karim Boudjemaa', 'Dr. Karim Boudjemaa')}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'التخصص الطبي', 'Spécialité', 'Specialty')}
                  </label>
                  <input
                    type="text"
                    value={form.prescribingSpecialty}
                    onChange={(e) => setForm({ ...form, prescribingSpecialty: e.target.value })}
                    placeholder={tr(language, 'أمراض القلب، طب عام...', 'Cardiologie, médecine générale...', 'Cardiology, general medicine...')}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {tr(language, 'تعليمات وإرشادات الاستعمال', 'Instructions particulières', 'Special Instructions')}
                </label>
                <textarea
                  rows={2}
                  value={form.instructions}
                  onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                  placeholder={tr(language, 'قبل الفطور بنصف ساعة، تجنب شرب الشاي مباشرة...', 'À jeun 30 min avant le petit-déjeuner...', 'Take 30 min before breakfast...')}
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
                  {tr(language, 'حفظ الدواء في الملف', 'Enregistrer', 'Save Medication')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
