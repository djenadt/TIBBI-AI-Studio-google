/**
 * TIBBI Main Application Context
 * Handles family state, clinical records, language toggling, persistence & AI OCR workflows
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Language,
  tr,
  FamilyMember,
  Medication,
  LabTest,
  HealthVital,
  MedicalDocument,
  DoctorAppointment,
  TimelineEvent,
  MenstrualCycleEntry,
  ChildGrowthEntry,
  DoctorSharePass,
  MedicationScheduleItem,
  AccessLogEntry,
  HealthNotificationItem,
} from '../types/tibbi';
import {
  INITIAL_FAMILY_MEMBERS,
  INITIAL_MEDICATIONS,
  INITIAL_LAB_TESTS,
  INITIAL_VITALS,
  INITIAL_DOCUMENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_TIMELINE_EVENTS,
  INITIAL_MENSTRUAL_CYCLES,
  INITIAL_CHILD_GROWTH,
  INITIAL_SHARE_PASSES,
  INITIAL_ACCESS_LOGS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';
import { calculateBMI } from '../utils/healthCalculators';
import {
  ALL_LIGHT_BG_CLASSES,
  LightBgThemeId,
  resolveLightBgPreset,
} from '../utils/appearanceSettings';
import { localizeText } from '../utils/frTranslator';

export type NavigationTab =
  | 'dashboard'
  | 'family'
  | 'archive'
  | 'medications'
  | 'labs'
  | 'vitals'
  | 'appointments'
  | 'timeline'
  | 'women_health'
  | 'child_health'
  | 'reports_share'
  | 'settings'
  | 'search';

interface TibbiContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  lightBgTheme: LightBgThemeId;
  setLightBgTheme: (id: LightBgThemeId) => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  goBack: () => void;
  canGoBack: boolean;
  navigationHistory: NavigationTab[];
  
  // Family Members & Privacy
  familyMembers: FamilyMember[];
  activeMemberId: string;
  activeMember: FamilyMember;
  setActiveMemberId: (id: string) => void;
  addFamilyMember: (member: Omit<FamilyMember, 'id'>) => void;
  updateFamilyMember: (id: string, updates: Partial<FamilyMember>) => void;
  unmaskedIds: Record<string, boolean>;
  toggleMaskId: (memberId: string) => void;
  
  // Access & Sharing Audit Logs
  accessLogs: AccessLogEntry[];
  addAccessLog: (log: Omit<AccessLogEntry, 'id' | 'timestamp'>) => void;
  isAuditLogsModalOpen: boolean;
  setIsAuditLogsModalOpen: (open: boolean) => void;

  // Notifications Center
  notifications: HealthNotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  isNotificationsModalOpen: boolean;
  setIsNotificationsModalOpen: (open: boolean) => void;

  // Medications & Schedule
  medications: Medication[];
  activeMemberMedications: Medication[];
  dailySchedule: MedicationScheduleItem[];
  addMedication: (med: Omit<Medication, 'id'>) => void;
  toggleMedicationScheduleStatus: (itemId: string, status: 'taken' | 'skipped' | 'pending') => void;
  toggleMedicationStatus: (id: string, status: 'active' | 'completed' | 'paused') => void;
  deleteMedication: (id: string) => void;

  // Lab Tests
  labTests: LabTest[];
  activeMemberLabTests: LabTest[];
  addLabTest: (test: Omit<LabTest, 'id'>) => void;
  deleteLabTest: (id: string) => void;

  // Health Vitals
  vitals: HealthVital[];
  activeMemberVitals: HealthVital[];
  addVital: (vital: Omit<HealthVital, 'id'>) => void;

  // Medical Documents & OCR
  documents: MedicalDocument[];
  activeMemberDocuments: MedicalDocument[];
  addDocument: (doc: Omit<MedicalDocument, 'id'>) => void;
  deleteDocument: (id: string) => void;
  processDocumentOcr: (fileOrBase64: { imageBase64?: string; fileName?: string; documentType?: string }) => Promise<any>;
  isProcessingOcr: boolean;

  // Appointments
  appointments: DoctorAppointment[];
  activeMemberAppointments: DoctorAppointment[];
  addAppointment: (apt: Omit<DoctorAppointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: 'upcoming' | 'completed' | 'cancelled') => void;

  // Timeline
  timelineEvents: TimelineEvent[];
  activeMemberTimeline: TimelineEvent[];
  addTimelineEvent: (event: Omit<TimelineEvent, 'id'>) => void;

  // Women's Health
  menstrualCycles: MenstrualCycleEntry[];
  activeMemberCycles: MenstrualCycleEntry[];
  addMenstrualCycle: (entry: Omit<MenstrualCycleEntry, 'id'>) => void;

  // Child Growth & Vaccines
  childGrowth: ChildGrowthEntry[];
  activeMemberGrowth: ChildGrowthEntry[];
  completedVaccineIds: string[];
  toggleVaccineCompleted: (vaccineId: string) => void;
  addChildGrowthEntry: (entry: Omit<ChildGrowthEntry, 'id'>) => void;

  // Doctor Share Passes
  sharePasses: DoctorSharePass[];
  createSharePass: (pass: Omit<DoctorSharePass, 'id' | 'createdAt' | 'accessCount' | 'qrValue' | 'accessCode'>) => DoctorSharePass;

  // Emergency Card Modal
  isEmergencyModalOpen: boolean;
  setIsEmergencyModalOpen: (open: boolean) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  
  // Reset Data to Defaults
  resetDataToDefaults: () => void;
}

const TibbiContext = createContext<TibbiContextType | undefined>(undefined);

const STORAGE_PREFIX = 'tibbi_health_data_v1_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error saving ${key} to storage:`, e);
  }
}

export const TibbiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return loadFromStorage<Language>('language', 'ar');
  });

  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    return loadFromStorage<'light' | 'dark'>('theme', 'light');
  });

  const [lightBgTheme, setLightBgThemeState] = useState<LightBgThemeId>(() => {
    return resolveLightBgPreset(loadFromStorage<string>('light_bg_theme', 'default')).id;
  });

  const [activeTab, setActiveTabState] = useState<NavigationTab>('dashboard');
  const [navigationHistory, setNavigationHistory] = useState<NavigationTab[]>([]);

  const setActiveTab = (tab: NavigationTab) => {
    setActiveTabState((currentTab) => {
      if (currentTab !== tab) {
        setNavigationHistory((prev) => [...prev, currentTab]);
      }
      return tab;
    });
  };

  const goBack = () => {
    setNavigationHistory((prev) => {
      if (prev.length === 0) {
        setActiveTabState('dashboard');
        return [];
      }
      const newHistory = [...prev];
      const previous = newHistory.pop() || 'dashboard';
      setActiveTabState(previous);
      return newHistory;
    });
  };

  const canGoBack = activeTab !== 'dashboard' || navigationHistory.length > 0;

  const [activeMemberId, setActiveMemberIdState] = useState<string>('fam_amine');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isAuditLogsModalOpen, setIsAuditLogsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessingOcr, setIsProcessingOcr] = useState(false);

  // Sensitive ID masking state
  const [unmaskedIds, setUnmaskedIds] = useState<Record<string, boolean>>(() =>
    loadFromStorage('unmasked_ids', {})
  );

  // Access & Sharing Audit Logs
  const [accessLogs, setAccessLogs] = useState<AccessLogEntry[]>(() =>
    loadFromStorage('access_logs', INITIAL_ACCESS_LOGS)
  );

  // Notifications Center
  const [notifications, setNotifications] = useState<HealthNotificationItem[]>(() =>
    loadFromStorage('notifications', INITIAL_NOTIFICATIONS)
  );

  // Clinical records states
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() =>
    loadFromStorage('family_members', INITIAL_FAMILY_MEMBERS)
  );
  const [medications, setMedications] = useState<Medication[]>(() =>
    loadFromStorage('medications', INITIAL_MEDICATIONS)
  );
  const [labTests, setLabTests] = useState<LabTest[]>(() => {
    const stored = loadFromStorage<LabTest[]>('lab_tests', INITIAL_LAB_TESTS);
    if (Array.isArray(stored) && stored.length < INITIAL_LAB_TESTS.length) {
      const existingIds = new Set(stored.map((t) => t.id));
      const missing = INITIAL_LAB_TESTS.filter((t) => !existingIds.has(t.id));
      return [...stored, ...missing];
    }
    return stored;
  });
  const [vitals, setVitals] = useState<HealthVital[]>(() =>
    loadFromStorage('vitals', INITIAL_VITALS)
  );
  const [documents, setDocuments] = useState<MedicalDocument[]>(() => {
    const stored = loadFromStorage<MedicalDocument[]>('documents', INITIAL_DOCUMENTS);
    if (Array.isArray(stored)) {
      const sanitized = stored.map((d) => {
        if (d.patientId === 'fam_radiology_sinus' || !d.patientId) {
          return { ...d, patientId: 'fam_yacine' };
        }
        return d;
      });
      if (sanitized.length < INITIAL_DOCUMENTS.length) {
        const existingIds = new Set(sanitized.map((d) => d.id));
        const missing = INITIAL_DOCUMENTS.filter((d) => !existingIds.has(d.id));
        return [...sanitized, ...missing];
      }
      return sanitized;
    }
    return stored;
  });
  const [appointments, setAppointments] = useState<DoctorAppointment[]>(() =>
    loadFromStorage('appointments', INITIAL_APPOINTMENTS)
  );
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(() =>
    loadFromStorage('timeline', INITIAL_TIMELINE_EVENTS)
  );
  const [menstrualCycles, setMenstrualCycles] = useState<MenstrualCycleEntry[]>(() =>
    loadFromStorage('menstrual_cycles', INITIAL_MENSTRUAL_CYCLES)
  );
  const [childGrowth, setChildGrowth] = useState<ChildGrowthEntry[]>(() =>
    loadFromStorage('child_growth', INITIAL_CHILD_GROWTH)
  );
  const [completedVaccineIds, setCompletedVaccineIds] = useState<string[]>(() =>
    loadFromStorage('completed_vaccines', ['bcg_hb0', 'penta1_polio1', 'penta2_polio2', 'penta3_polio3', 'ror1'])
  );
  const [sharePasses, setSharePasses] = useState<DoctorSharePass[]>(() =>
    loadFromStorage('share_passes', INITIAL_SHARE_PASSES)
  );

  // Daily pill checklist tracker state
  const [dailySchedule, setDailySchedule] = useState<MedicationScheduleItem[]>(() => {
    return loadFromStorage('daily_schedule', [
      {
        id: 'sched_1',
        medicationId: 'med_amine_1',
        patientId: 'fam_amine',
        time: '08:00',
        medicationName: 'Coversyl (Périndopril) 5mg',
        dosage: 'قرص واحد يومياً',
        status: 'taken',
        takenAt: '08:12',
        date: new Date().toISOString().split('T')[0],
      },
      {
        id: 'sched_2',
        medicationId: 'med_amine_2',
        patientId: 'fam_amine',
        time: '13:00',
        medicationName: 'Omega 3 Max 1000mg',
        dosage: 'كبسولة واحدة مع الغداء',
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
      },
      {
        id: 'sched_3',
        medicationId: 'med_meriem_1',
        patientId: 'fam_meriem',
        time: '09:00',
        medicationName: 'Gestarelle G3 (Complément Grossesse)',
        dosage: 'كبسولة واحدة صباحاً',
        status: 'taken',
        takenAt: '09:30',
        date: new Date().toISOString().split('T')[0],
      },
      {
        id: 'sched_4',
        medicationId: 'med_meriem_2',
        patientId: 'fam_meriem',
        time: '12:30',
        medicationName: 'Tardyferon B9 (Fer + Acide Folique)',
        dosage: 'قرص واحد ظهراً',
        status: 'pending',
        date: new Date().toISOString().split('T')[0],
      },
    ]);
  });

  const getDocumentTitle = (lang: Language) =>
    tr(
      lang,
      'TIBBI - الملف الصحي الرقمي للعائلة | صحتك وصحة عائلتك في مكان واحد',
      'TIBBI - Dossier Médical Familial Numérique | Santé en un seul endroit',
      'TIBBI - Digital Family Health Record | All your family health in one place'
    );

  // Sync language with HTML dir and lang attributes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    saveToStorage('language', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = getDocumentTitle(lang);
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    saveToStorage('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const setLightBgTheme = (id: LightBgThemeId) => {
    const resolved = resolveLightBgPreset(id).id;
    setLightBgThemeState(resolved);
    saveToStorage('light_bg_theme', resolved);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.title = getDocumentTitle(language);
  }, [language]);

  useEffect(() => {
    const preset = resolveLightBgPreset(lightBgTheme);
    document.documentElement.dataset.lightBg = preset.id;
    document.body.classList.remove(...ALL_LIGHT_BG_CLASSES);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.add(preset.appBgClass);
    }
  }, [theme, lightBgTheme]);

  // Sync to localStorage
  useEffect(() => saveToStorage('family_members', familyMembers), [familyMembers]);
  useEffect(() => saveToStorage('medications', medications), [medications]);
  useEffect(() => saveToStorage('lab_tests', labTests), [labTests]);
  useEffect(() => saveToStorage('vitals', vitals), [vitals]);
  useEffect(() => saveToStorage('documents', documents), [documents]);
  useEffect(() => saveToStorage('appointments', appointments), [appointments]);
  useEffect(() => saveToStorage('timeline', timelineEvents), [timelineEvents]);
  useEffect(() => saveToStorage('menstrual_cycles', menstrualCycles), [menstrualCycles]);
  useEffect(() => saveToStorage('child_growth', childGrowth), [childGrowth]);
  useEffect(() => saveToStorage('completed_vaccines', completedVaccineIds), [completedVaccineIds]);
  useEffect(() => saveToStorage('share_passes', sharePasses), [sharePasses]);
  useEffect(() => saveToStorage('daily_schedule', dailySchedule), [dailySchedule]);
  useEffect(() => saveToStorage('unmasked_ids', unmaskedIds), [unmaskedIds]);
  useEffect(() => saveToStorage('access_logs', accessLogs), [accessLogs]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);

  // Active member
  const activeMember = useMemo(() => {
    const found = familyMembers.find((m) => m.id === activeMemberId);
    return found || familyMembers[0] || INITIAL_FAMILY_MEMBERS[0];
  }, [familyMembers, activeMemberId]);

  // Filtered slices for active member
  const activeMemberMedications = useMemo(
    () => medications.filter((m) => m.patientId === activeMemberId),
    [medications, activeMemberId]
  );

  const activeMemberLabTests = useMemo(
    () => labTests.filter((l) => l.patientId === activeMemberId),
    [labTests, activeMemberId]
  );

  const activeMemberVitals = useMemo(
    () => vitals.filter((v) => v.patientId === activeMemberId),
    [vitals, activeMemberId]
  );

  const activeMemberDocuments = useMemo(
    () => documents.filter((d) => d.patientId === activeMemberId),
    [documents, activeMemberId]
  );

  const activeMemberAppointments = useMemo(
    () => appointments.filter((a) => a.patientId === activeMemberId),
    [appointments, activeMemberId]
  );

  const activeMemberTimeline = useMemo(
    () => timelineEvents.filter((t) => t.patientId === activeMemberId).sort((a, b) => b.date.localeCompare(a.date)),
    [timelineEvents, activeMemberId]
  );

  const activeMemberCycles = useMemo(
    () => menstrualCycles.filter((c) => c.patientId === activeMemberId).sort((a, b) => b.startDate.localeCompare(a.startDate)),
    [menstrualCycles, activeMemberId]
  );

  const activeMemberGrowth = useMemo(
    () => childGrowth.filter((g) => g.patientId === activeMemberId).sort((a, b) => a.ageMonths - b.ageMonths),
    [childGrowth, activeMemberId]
  );

  // Actions
  const setActiveMemberId = (id: string) => {
    if (id !== activeMemberId) {
      const target = familyMembers.find((m) => m.id === id);
      if (target) {
        const isAr = language === 'ar';
        addAccessLog({
          action: 'view_profile',
          actionLabelAr: `فتح ومعاينة ملف ${target.relationship === 'child' ? 'الطفل القاصر (وصاية)' : 'فرد الأسرة'}`,
          actionLabelFr: `Consultation du dossier (${target.fullNameFr})`,
          actionLabelEn: `Viewed health record (${target.fullNameFr})`,
          actorName: tr(
            language,
            'أمين مزيان (الولي وصاحب الحساب)',
            'Amine Meziane (Tuteur et titulaire du compte)',
            'Amine Meziane (Guardian & Account Holder)'
          ),
          targetMemberName: isAr ? target.fullNameAr : target.fullNameFr,
          details:
            target.relationship === 'child'
              ? tr(
                  language,
                  `الوصول تحت وصاية الولي القانوني (${target.legalGuardian || 'أمين مزيان'})`,
                  `Accès sous tutelle parentale légale (${localizeText(target.legalGuardian || 'Amine Meziane', 'fr')})`,
                  `Accessed under legal guardianship (${localizeText(target.legalGuardian || 'Amine Meziane', 'en')})`
                )
              : tr(
                  language,
                  'استعراض البيانات الصحية والمؤشرات الحيوية',
                  'Consultation des données de santé et constantes vitales',
                  'Viewed health records and vital signs'
                ),
          ipOrDevice: tr(language, 'تطبيق TIBBI المحلي', 'Application TIBBI locale', 'Local TIBBI App'),
        });
      }
    }
    setActiveMemberIdState(id);
  };

  const toggleMaskId = (memberId: string) => {
    setUnmaskedIds((prev) => {
      const willBeUnmasked = !prev[memberId];
      const target = familyMembers.find((m) => m.id === memberId);
      if (willBeUnmasked) {
        const isAr = language === 'ar';
        addAccessLog({
          action: 'unmask_id',
          actionLabelAr: 'إظهار رقم بطاقة الشفاء / المعرّف الشخصي',
          actionLabelFr: 'Démasquage du numéro Chifa / Identifiant',
          actionLabelEn: 'Unmasked Chifa / National ID number',
          actorName: activeMember
            ? isAr
              ? activeMember.fullNameAr
              : activeMember.fullNameFr
            : tr(
                language,
                'أمين مزيان (رب الأسرة)',
                'Amine Meziane (Chef de famille)',
                'Amine Meziane (Head of Family)'
              ),
          targetMemberName: target
            ? isAr
              ? target.fullNameAr
              : target.fullNameFr
            : tr(language, 'فرد الأسرة', 'Membre de la famille', 'Family Member'),
          details: tr(
            language,
            'تم النقر على زر إظهار المعرف المحمي بعد التحقق من الهوية',
            'Démasquage de l’identifiant protégé après vérification',
            'Revealed protected ID after verification'
          ),
          ipOrDevice: tr(
            language,
            'تطبيق TIBBI المحلي (جلسة موثقة)',
            'Application TIBBI locale (session authentifiée)',
            'Local TIBBI App (authenticated session)'
          ),
        });
      }
      return { ...prev, [memberId]: willBeUnmasked };
    });
  };

  const addAccessLog = (entry: Omit<AccessLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: AccessLogEntry = {
      ...entry,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setAccessLogs((prev) => [newEntry, ...prev]);
  };

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const addFamilyMember = (memberData: Omit<FamilyMember, 'id'>) => {
    const newId = `fam_${Date.now()}`;
    const newMember: FamilyMember = { ...memberData, id: newId };
    setFamilyMembers((prev) => [...prev, newMember]);
    setActiveMemberId(newId);
  };

  const updateFamilyMember = (id: string, updates: Partial<FamilyMember>) => {
    setFamilyMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const addMedication = (medData: Omit<Medication, 'id'>) => {
    const newId = `med_${Date.now()}`;
    const newMed: Medication = { ...medData, id: newId };
    setMedications((prev) => [newMed, ...prev]);

    // Add to timeline
    addTimelineEvent({
      patientId: medData.patientId,
      date: medData.startDate,
      title: tr(
        language,
        `بدء علاج جديد: ${medData.name}`,
        `Nouveau traitement initié : ${medData.name}`,
        `New medication started: ${medData.name}`
      ),
      category: 'prescription',
      description: tr(
        language,
        `الجرعة: ${medData.dosage} - الطبيب: ${medData.prescribingDoctor}`,
        `Posologie : ${localizeText(medData.dosage, 'fr')} - Médecin : ${localizeText(medData.prescribingDoctor, 'fr')}`,
        `Dosage: ${localizeText(medData.dosage, 'en')} - Doctor: ${localizeText(medData.prescribingDoctor, 'en')}`
      ),
      doctorOrFacility: localizeText(medData.prescribingDoctor, language),
      badge: tr(language, 'دواء جديد', 'Nouveau traitement', 'New Medication'),
    });

    // Add to daily schedule if active
    if (newMed.status === 'active' && newMed.timing.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const newScheduleItems: MedicationScheduleItem[] = newMed.timing.map((t, idx) => ({
        id: `sched_${newId}_${idx}`,
        medicationId: newId,
        patientId: newMed.patientId,
        time: t,
        medicationName: newMed.name,
        dosage: newMed.dosage,
        status: 'pending',
        date: today,
      }));
      setDailySchedule((prev) => [...newScheduleItems, ...prev]);
    }
  };

  const toggleMedicationScheduleStatus = (itemId: string, status: 'taken' | 'skipped' | 'pending') => {
    const nowTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    setDailySchedule((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status,
              takenAt: status === 'taken' ? nowTime : undefined,
            }
          : item
      )
    );
  };

  const toggleMedicationStatus = (id: string, status: 'active' | 'completed' | 'paused') => {
    setMedications((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
  };

  const deleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
    setDailySchedule((prev) => prev.filter((s) => s.medicationId !== id));
  };

  const addLabTest = (testData: Omit<LabTest, 'id'>) => {
    const newId = `lab_${Date.now()}`;
    const newTest: LabTest = { ...testData, id: newId };
    setLabTests((prev) => [newTest, ...prev]);

    addTimelineEvent({
      patientId: testData.patientId,
      date: testData.date,
      title: tr(
        language,
        `تحليل مخبري: ${testData.testName}`,
        `Analyse biologique : ${localizeText(testData.testName, 'fr')}`,
        `Lab test: ${localizeText(testData.testName, 'en')}`
      ),
      category: 'lab',
      description: tr(
        language,
        `النتيجة: ${testData.value} ${testData.unit} (${testData.isAbnormal ? 'خارج المجال الطبيعي' : 'طبيعي'})`,
        `Résultat : ${testData.value} ${testData.unit} (${testData.isAbnormal ? 'Hors norme' : 'Normal'})`,
        `Result: ${testData.value} ${testData.unit} (${testData.isAbnormal ? 'Out of range' : 'Normal'})`
      ),
      doctorOrFacility: localizeText(testData.laboratory, language),
      badge: tr(language, 'تحليل دم', 'Analyse sanguine', 'Blood Test'),
    });
  };

  const deleteLabTest = (id: string) => {
    setLabTests((prev) => prev.filter((t) => t.id !== id));
  };

  const addVital = (vitalData: Omit<HealthVital, 'id'>) => {
    const newId = `vit_${Date.now()}`;
    let computedBmi = vitalData.bmi;
    if (!computedBmi && vitalData.weightKg && vitalData.heightCm) {
      computedBmi = calculateBMI(vitalData.weightKg, vitalData.heightCm);
    }

    const newVital: HealthVital = { ...vitalData, id: newId, bmi: computedBmi };
    setVitals((prev) => [newVital, ...prev]);

    // If systolic BP recorded, log event
    if (vitalData.systolicBp) {
      addTimelineEvent({
        patientId: vitalData.patientId,
        date: vitalData.date,
        title: tr(
          language,
          `تسجيل قياس ضغط الدم: ${vitalData.systolicBp}/${vitalData.diastolicBp} مم زئبق`,
          `Mesure tensionnelle enregistrée : ${vitalData.systolicBp}/${vitalData.diastolicBp} mmHg`,
          `Blood pressure recorded: ${vitalData.systolicBp}/${vitalData.diastolicBp} mmHg`
        ),
        category: 'vital',
        description: tr(
          language,
          `النبض: ${vitalData.heartRate || '--'} ن/د ${vitalData.notes ? '- ' + vitalData.notes : ''}`,
          `Pouls : ${vitalData.heartRate || '--'} bpm ${vitalData.notes ? '- ' + localizeText(vitalData.notes, 'fr') : ''}`,
          `Pulse: ${vitalData.heartRate || '--'} bpm ${vitalData.notes ? '- ' + localizeText(vitalData.notes, 'en') : ''}`
        ),
        badge: tr(language, 'مؤشر حيوي', 'Constante vitale', 'Vital Sign'),
      });
    }
  };

  const addDocument = (docData: Omit<MedicalDocument, 'id'>) => {
    const newId = `doc_${Date.now()}`;
    const newDoc: MedicalDocument = { ...docData, id: newId };
    setDocuments((prev) => [newDoc, ...prev]);

    addTimelineEvent({
      patientId: docData.patientId,
      date: docData.date,
      title: tr(
        language,
        `إضافة وثيقة: ${docData.title}`,
        `Document archivé : ${localizeText(docData.title, 'fr')}`,
        `Document archived: ${localizeText(docData.title, 'en')}`
      ),
      category: docData.type === 'prescription' ? 'prescription' : docData.type === 'lab_result' ? 'lab' : 'radiology',
      description: docData.doctorName
        ? tr(
            language,
            `بإشراف: ${docData.doctorName}`,
            `Prescrit par : ${localizeText(docData.doctorName, 'fr')}`,
            `Prescribed by: ${localizeText(docData.doctorName, 'en')}`
          )
        : tr(
            language,
            `وثيقة مؤرشفة في ملف ${docData.patientId}`,
            `Document archivé dans le dossier ${docData.patientId}`,
            `Document archived in record ${docData.patientId}`
          ),
      doctorOrFacility: localizeText(docData.facility || docData.doctorName, language),
      badge: tr(language, 'أرشيف طبي', 'Archive médicale', 'Medical Archive'),
    });
  };

  const deleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const processDocumentOcr = async (payload: {
    imageBase64?: string;
    fileName?: string;
    documentType?: string;
  }) => {
    setIsProcessingOcr(true);
    try {
      const response = await fetch('/api/ai/ocr-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`OCR request failed: ${response.statusText}`);
      }

      const resData = await response.json();
      return resData.data;
    } catch (err) {
      console.error('Error during OCR processing:', err);
      throw err;
    } finally {
      setIsProcessingOcr(false);
    }
  };

  const addAppointment = (aptData: Omit<DoctorAppointment, 'id'>) => {
    const newId = `apt_${Date.now()}`;
    const newApt: DoctorAppointment = { ...aptData, id: newId };
    setAppointments((prev) => [newApt, ...prev]);

    addTimelineEvent({
      patientId: aptData.patientId,
      date: aptData.date,
      title: tr(
        language,
        `موعد طبي: ${aptData.doctorName} (${aptData.specialty})`,
        `Rendez-vous médical : ${localizeText(aptData.doctorName, 'fr')} (${localizeText(aptData.specialty, 'fr')})`,
        `Medical appointment: ${localizeText(aptData.doctorName, 'en')} (${localizeText(aptData.specialty, 'en')})`
      ),
      category: 'consultation',
      description: tr(
        language,
        `السبب: ${aptData.reason} - المكان: ${aptData.clinicName}`,
        `Motif : ${localizeText(aptData.reason, 'fr')} - Lieu : ${localizeText(aptData.clinicName, 'fr')}`,
        `Reason: ${localizeText(aptData.reason, 'en')} - Location: ${localizeText(aptData.clinicName, 'en')}`
      ),
      doctorOrFacility: localizeText(aptData.doctorName, language),
      badge: tr(language, 'موعد طبي', 'Rendez-vous médical', 'Medical Appointment'),
    });
  };

  const updateAppointmentStatus = (id: string, status: 'upcoming' | 'completed' | 'cancelled') => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  };

  const addTimelineEvent = (eventData: Omit<TimelineEvent, 'id'>) => {
    const newId = `time_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newEvent: TimelineEvent = { ...eventData, id: newId };
    setTimelineEvents((prev) => [newEvent, ...prev]);
  };

  const addMenstrualCycle = (cycleData: Omit<MenstrualCycleEntry, 'id'>) => {
    const newId = `cyc_${Date.now()}`;
    const newCycle: MenstrualCycleEntry = { ...cycleData, id: newId };
    setMenstrualCycles((prev) => [newCycle, ...prev]);
  };

  const toggleVaccineCompleted = (vaccineId: string) => {
    setCompletedVaccineIds((prev) => {
      if (prev.includes(vaccineId)) {
        return prev.filter((id) => id !== vaccineId);
      } else {
        return [...prev, vaccineId];
      }
    });
  };

  const addChildGrowthEntry = (entryData: Omit<ChildGrowthEntry, 'id'>) => {
    const newId = `gro_${Date.now()}`;
    const newEntry: ChildGrowthEntry = { ...entryData, id: newId };
    setChildGrowth((prev) => [...prev, newEntry]);
  };

  const createSharePass = (passData: Omit<DoctorSharePass, 'id' | 'createdAt' | 'accessCount' | 'qrValue' | 'accessCode'>) => {
    const randomCode = `TIBBI-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowIso = new Date().toISOString();
    const target = familyMembers.find((m) => m.id === passData.patientId);

    const isAr = language === 'ar';
    const newPass: DoctorSharePass = {
      ...passData,
      id: `share_${Date.now()}`,
      accessCode: randomCode,
      createdAt: nowIso,
      accessCount: 0,
      qrValue: `https://tibbi.dz/share/pass/${randomCode}`,
      consentedBy:
        passData.consentedBy ||
        tr(
          language,
          'أمين مزيان (صاحب الحساب والولي)',
          'Amine Meziane (Titulaire et tuteur)',
          'Amine Meziane (Account Holder & Guardian)'
        ),
      consentedAt: passData.consentedAt || nowIso,
    };
    setSharePasses((prev) => [newPass, ...prev]);

    // Record in Access & Sharing Audit Log
    addAccessLog({
      action: 'create_share_pass',
      actionLabelAr: 'توليد رخصة مشاركة مؤقتة للطبيب (QR Pass)',
      actionLabelFr: 'Génération de clé de partage QR médecin',
      actionLabelEn: 'Generated temporary doctor QR share pass',
      actorName:
        localizeText(passData.consentedBy, language) ||
        tr(
          language,
          'أمين مزيان (الولي وصاحب الملف)',
          'Amine Meziane (Titulaire et tuteur)',
          'Amine Meziane (Account Holder & Guardian)'
        ),
      targetMemberName: target ? (isAr ? target.fullNameAr : target.fullNameFr) : tr(language, 'المريض', 'Patient', 'Patient'),
      details: tr(
        language,
        `مشاركة (${passData.title}) موجهة إلى: ${passData.doctorName || 'طبيب استشاري'} برمز: ${randomCode}`,
        `Partage (${localizeText(passData.title, 'fr')}) destiné à ${localizeText(passData.doctorName || 'Médecin consultant', 'fr')} • Code : ${randomCode}`,
        `Shared (${localizeText(passData.title, 'en')}) with ${localizeText(passData.doctorName || 'Consulting Physician', 'en')} • Code: ${randomCode}`
      ),
      ipOrDevice: tr(language, 'تطبيق TIBBI للويب', 'Application Web TIBBI', 'TIBBI Web App'),
    });

    return newPass;
  };

  const resetDataToDefaults = () => {
    localStorage.clear();
    setFamilyMembers(INITIAL_FAMILY_MEMBERS);
    setMedications(INITIAL_MEDICATIONS);
    setLabTests(INITIAL_LAB_TESTS);
    setVitals(INITIAL_VITALS);
    setDocuments(INITIAL_DOCUMENTS);
    setAppointments(INITIAL_APPOINTMENTS);
    setTimelineEvents(INITIAL_TIMELINE_EVENTS);
    setMenstrualCycles(INITIAL_MENSTRUAL_CYCLES);
    setChildGrowth(INITIAL_CHILD_GROWTH);
    setSharePasses(INITIAL_SHARE_PASSES);
    setAccessLogs(INITIAL_ACCESS_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setUnmaskedIds({});
    setActiveMemberIdState('fam_amine');
  };

  return (
    <TibbiContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        toggleTheme,
        lightBgTheme,
        setLightBgTheme,
        activeTab,
        setActiveTab,
        goBack,
        canGoBack,
        navigationHistory,
        familyMembers,
        activeMemberId,
        activeMember,
        setActiveMemberId,
        addFamilyMember,
        updateFamilyMember,
        unmaskedIds,
        toggleMaskId,
        accessLogs,
        addAccessLog,
        isAuditLogsModalOpen,
        setIsAuditLogsModalOpen,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        isNotificationsModalOpen,
        setIsNotificationsModalOpen,
        medications,
        activeMemberMedications,
        dailySchedule,
        addMedication,
        toggleMedicationScheduleStatus,
        toggleMedicationStatus,
        deleteMedication,
        labTests,
        activeMemberLabTests,
        addLabTest,
        deleteLabTest,
        vitals,
        activeMemberVitals,
        addVital,
        documents,
        activeMemberDocuments,
        addDocument,
        deleteDocument,
        processDocumentOcr,
        isProcessingOcr,
        appointments,
        activeMemberAppointments,
        addAppointment,
        updateAppointmentStatus,
        timelineEvents,
        activeMemberTimeline,
        addTimelineEvent,
        menstrualCycles,
        activeMemberCycles,
        addMenstrualCycle,
        childGrowth,
        activeMemberGrowth,
        completedVaccineIds,
        toggleVaccineCompleted,
        addChildGrowthEntry,
        sharePasses,
        createSharePass,
        isEmergencyModalOpen,
        setIsEmergencyModalOpen,
        searchQuery,
        setSearchQuery,
        resetDataToDefaults,
      }}
    >
      {children}
    </TibbiContext.Provider>
  );
};

export const useTibbi = () => {
  const context = useContext(TibbiContext);
  if (!context) {
    throw new Error('useTibbi must be used within a TibbiProvider');
  }
  return context;
};
