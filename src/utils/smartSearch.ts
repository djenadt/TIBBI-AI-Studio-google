import {
  DoctorAppointment,
  HealthVital,
  LabTest,
  MedicalDocument,
  Medication,
  TimelineEvent,
} from '../types/tibbi';
import { translateTextFr } from './frTranslator';
import { translateTextEn } from './enTranslator';

export interface SmartSearchInput {
  patientId: string;
  query: string;
  dateFrom?: string;
  dateTo?: string;
  medications: Medication[];
  labTests: LabTest[];
  documents: MedicalDocument[];
  appointments: DoctorAppointment[];
  timelineEvents: TimelineEvent[];
  vitals?: HealthVital[];
}

export interface SmartSearchResults {
  matchedMeds: Medication[];
  matchedLabs: LabTest[];
  matchedDocs: MedicalDocument[];
  matchedAppointments: DoctorAppointment[];
  matchedTimeline: TimelineEvent[];
  matchedVitals: HealthVital[];
  totalMatches: number;
  hasActiveCriteria: boolean;
  invalidDateRange: boolean;
}

export function normalizeDateOnly(dateStr?: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  const match = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : '';
}

export function isInvalidDateRange(dateFrom?: string, dateTo?: string): boolean {
  const from = normalizeDateOnly(dateFrom);
  const to = normalizeDateOnly(dateTo);
  if (!from || !to) return false;
  return from > to;
}

export function isDateInRange(
  dateStr?: string,
  dateFrom?: string,
  dateTo?: string
): boolean {
  const from = normalizeDateOnly(dateFrom);
  const to = normalizeDateOnly(dateTo);
  if (!from && !to) return true;

  const target = normalizeDateOnly(dateStr);
  if (!target) return false;
  if (from && target < from) return false;
  if (to && target > to) return false;
  return true;
}

function includesQuery(cleanQ: string, ...fields: Array<string | undefined>): boolean {
  if (!cleanQ) return true;
  return fields.some((field) => {
    if (!field) return false;
    if (field.toLowerCase().includes(cleanQ)) return true;
    const frField = translateTextFr(field);
    if (frField && frField.toLowerCase().includes(cleanQ)) return true;
    const enField = translateTextEn(field);
    return enField ? enField.toLowerCase().includes(cleanQ) : false;
  });
}

export function filterSmartSearchResults({
  patientId,
  query,
  dateFrom,
  dateTo,
  medications,
  labTests,
  documents,
  appointments,
  timelineEvents,
  vitals = [],
}: SmartSearchInput): SmartSearchResults {
  const cleanQ = query.trim().toLowerCase();
  const from = normalizeDateOnly(dateFrom);
  const to = normalizeDateOnly(dateTo);
  const hasActiveCriteria = cleanQ.length > 0 || from.length > 0 || to.length > 0;
  const invalidDateRange = isInvalidDateRange(from, to);

  if (!hasActiveCriteria || invalidDateRange) {
    return {
      matchedMeds: [],
      matchedLabs: [],
      matchedDocs: [],
      matchedAppointments: [],
      matchedTimeline: [],
      matchedVitals: [],
      totalMatches: 0,
      hasActiveCriteria,
      invalidDateRange,
    };
  }

  const matchedMeds = medications.filter(
    (m) =>
      m.patientId === patientId &&
      isDateInRange(m.startDate, from, to) &&
      includesQuery(cleanQ, m.name, m.condition, m.prescribingDoctor, m.instructions)
  );

  const matchedLabs = labTests.filter(
    (l) =>
      l.patientId === patientId &&
      isDateInRange(l.date, from, to) &&
      includesQuery(cleanQ, l.testName, l.laboratory, l.prescribingDoctor, l.notes)
  );

  const matchedDocs = documents.filter(
    (d) =>
      d.patientId === patientId &&
      isDateInRange(d.date, from, to) &&
      (includesQuery(cleanQ, d.title, d.doctorName, d.facility, d.notes, d.conclusion) ||
        d.tags.some((t) => t.toLowerCase().includes(cleanQ)))
  );

  const matchedAppointments = appointments.filter(
    (a) =>
      a.patientId === patientId &&
      isDateInRange(a.date, from, to) &&
      includesQuery(cleanQ, a.doctorName, a.specialty, a.clinicName, a.reason, a.notes)
  );

  const matchedTimeline = timelineEvents.filter(
    (t) =>
      t.patientId === patientId &&
      isDateInRange(t.date, from, to) &&
      includesQuery(cleanQ, t.title, t.description, t.doctorOrFacility)
  );

  const matchedVitals = vitals.filter((v) => {
    if (v.patientId !== patientId || !isDateInRange(v.date, from, to)) return false;
    if (!cleanQ) return true;
    const vitalTags: string[] = [];
    if (v.systolicBp !== undefined) vitalTags.push('ضغط الدم tension pression hta blood pressure bp hypertension');
    if (v.bloodGlucose !== undefined) vitalTags.push('السكري سكر الدم glycémie glucose blood sugar diabetes');
    if (v.weightKg !== undefined || v.bmi !== undefined) vitalTags.push('الوزن كتلة الجسم poids imc bmi weight height');
    if (v.heartRate !== undefined) vitalTags.push('النبض نبضات القلب bpm rythme heart rate pulse');
    return includesQuery(cleanQ, v.notes, ...vitalTags);
  });

  const totalMatches =
    matchedMeds.length +
    matchedLabs.length +
    matchedDocs.length +
    matchedAppointments.length +
    matchedTimeline.length +
    matchedVitals.length;

  return {
    matchedMeds,
    matchedLabs,
    matchedDocs,
    matchedAppointments,
    matchedTimeline,
    matchedVitals,
    totalMatches,
    hasActiveCriteria,
    invalidDateRange: false,
  };
}
