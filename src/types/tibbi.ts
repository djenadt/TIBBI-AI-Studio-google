/**
 * TIBBI - Digital Health Platform Data Types
 */

export type Language = 'ar' | 'fr' | 'en';

export function tr<T>(language: Language, ar: T, fr: T, en: T): T {
  if (language === 'ar') return ar;
  if (language === 'en') return en;
  return fr;
}

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type FamilyRelationship = 'self' | 'spouse' | 'child' | 'parent' | 'other';

export interface FamilyMember {
  id: string;
  fullNameAr: string;
  fullNameFr: string;
  relationship: FamilyRelationship;
  relationshipLabelAr: string;
  relationshipLabelFr: string;
  relationshipLabelEn?: string;
  gender: 'male' | 'female';
  birthDate: string; // YYYY-MM-DD
  bloodGroup: BloodGroup;
  nationalIdOrChifa?: string;
  phone?: string;
  allergies: string[];
  chronicDiseases: string[];
  surgeries: string[];
  avatarUrl?: string;
  avatarSeed?: string;
  isPregnant?: boolean;
  pregnancyLmpDate?: string;
  legalGuardian?: string;
  notes?: string;
}

export type MedicationForm = 'tablet' | 'syrup' | 'injection' | 'cream' | 'drops' | 'inhaler' | 'capsule';

export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  form: MedicationForm;
  frequency: string;
  timing: string[]; // e.g. ['08:00', '14:00', '20:00']
  startDate: string;
  endDate?: string;
  prescribingDoctor: string;
  prescribingSpecialty?: string;
  condition: string;
  instructions: string;
  status: 'active' | 'completed' | 'paused';
  reminderEnabled: boolean;
  prescriptionId?: string;
}

export interface MedicationScheduleItem {
  id: string;
  medicationId: string;
  patientId: string;
  time: string;
  medicationName: string;
  dosage: string;
  status: 'pending' | 'taken' | 'skipped';
  takenAt?: string;
  date: string;
}

export type LabCategory = 'biochimie' | 'hematologie' | 'hormonologie' | 'serologie' | 'urine' | 'microbiologie';

export interface LabTest {
  id: string;
  patientId: string;
  testName: string;
  category: LabCategory;
  value: number;
  unit: string;
  referenceMin?: number;
  referenceMax?: number;
  date: string;
  laboratory: string;
  prescribingDoctor?: string;
  documentId?: string;
  notes?: string;
  isAbnormal?: boolean;
}

export interface HealthVital {
  id: string;
  patientId: string;
  date: string;
  time: string;
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  bloodGlucose?: number;
  glucoseContext?: 'fasting' | 'post-meal' | 'random';
  weightKg?: number;
  heightCm?: number;
  bmi?: number;
  temperatureC?: number;
  oxygenSpO2?: number;
  notes?: string;
}

export type DocumentType =
  | 'prescription'
  | 'lab_result'
  | 'radiology'
  | 'report'
  | 'vaccination'
  | 'surgery_report'
  | 'ecg_cardio'
  | 'certificate'
  | 'specialist_report';

export interface MedicalDocument {
  id: string;
  patientId: string;
  title: string;
  type: DocumentType;
  date: string;
  doctorName?: string;
  specialty?: string;
  facility?: string;
  fileUrl?: string;
  originalFileName?: string;
  ocrExtracted: boolean;
  extractedData?: any;
  tags: string[];
  notes?: string;
  conclusion?: string;
  recommendations?: string;
  status?: 'normal' | 'attention' | 'critical' | 'completed';
}

export interface DoctorAppointment {
  id: string;
  patientId: string;
  doctorName: string;
  specialty: string;
  clinicName: string;
  address?: string;
  phone?: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  reason: string;
  notes?: string;
  linkedDocumentIds?: string[];
}

export type TimelineCategory = 'consultation' | 'prescription' | 'lab' | 'radiology' | 'surgery' | 'vaccine' | 'vital';

export interface TimelineEvent {
  id: string;
  patientId: string;
  date: string;
  title: string;
  category: TimelineCategory;
  description: string;
  doctorOrFacility?: string;
  badge?: string;
  refId?: string;
}

export interface MenstrualCycleEntry {
  id: string;
  patientId: string;
  startDate: string;
  endDate?: string;
  flowIntensity: 'light' | 'medium' | 'heavy';
  symptoms: string[];
  notes?: string;
}

export interface ChildGrowthEntry {
  id: string;
  patientId: string;
  date: string;
  ageMonths: number;
  weightKg: number;
  heightCm: number;
  headCircumferenceCm?: number;
  pediatricianNotes?: string;
}

export interface DoctorSharePass {
  id: string;
  patientId: string;
  accessCode: string;
  title: string;
  createdAt: string;
  expiresAt: string;
  allowedSections: ('profile' | 'medications' | 'labs' | 'vitals' | 'documents' | 'timeline')[];
  qrValue: string;
  accessCount: number;
  doctorName?: string;
  consentedBy?: string;
  consentedAt?: string;
}

export interface AccessLogEntry {
  id: string;
  timestamp: string;
  action: 'view_profile' | 'view_document' | 'unmask_id' | 'create_share_pass' | 'export_report' | 'update_record';
  actionLabelAr: string;
  actionLabelFr: string;
  actionLabelEn?: string;
  actorName: string;
  targetMemberName: string;
  details?: string;
  ipOrDevice?: string;
}

export interface HealthNotificationItem {
  id: string;
  type: 'medication' | 'appointment' | 'lab' | 'system';
  titleAr: string;
  titleFr: string;
  titleEn?: string;
  messageAr: string;
  messageFr: string;
  messageEn?: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'info';
  patientId: string;
  patientNameAr: string;
  patientNameFr: string;
  patientNameEn?: string;
  medScheduleId?: string;
  actionLabelAr?: string;
  actionLabelFr?: string;
  actionLabelEn?: string;
}
