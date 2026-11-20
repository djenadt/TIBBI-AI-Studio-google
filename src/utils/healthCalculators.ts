/**
 * Core health metrics, calculations, and clinical logic for TIBBI
 */

export interface BMICategory {
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  labelAr: string;
  labelFr: string;
  labelEn: string;
  color: string;
}

export function calculateBMI(weightKg: number, heightCm: number): number {
  if (weightKg <= 0 || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  return Math.round(bmi * 10) / 10;
}

export function getBMICategory(bmi: number): BMICategory {
  if (bmi < 18.5) {
    return {
      category: 'underweight',
      labelAr: 'نقص في الوزن',
      labelFr: 'Insuffisance pondérale',
      labelEn: 'Underweight',
      color: '#eab308', // yellow
    };
  }
  if (bmi < 25) {
    return {
      category: 'normal',
      labelAr: 'وزن مثالي وطبيعي',
      labelFr: 'Poids normal',
      labelEn: 'Normal weight',
      color: '#10b981', // green
    };
  }
  if (bmi < 30) {
    return {
      category: 'overweight',
      labelAr: 'زيادة في الوزن',
      labelFr: 'Surpoids',
      labelEn: 'Overweight',
      color: '#f97316', // orange
    };
  }
  return {
    category: 'obese',
    labelAr: 'سمنة',
    labelFr: 'Obésité',
    labelEn: 'Obesity',
    color: '#ef4444', // red
  };
}

export function calculatePregnancyWeek(lmpDateStr: string, currentDateStr?: string): {
  weeks: number;
  days: number;
  trimester: 1 | 2 | 3;
  progressPercent: number;
} {
  const lmp = new Date(lmpDateStr);
  const now = currentDateStr ? new Date(currentDateStr) : new Date();
  const diffMs = now.getTime() - lmp.getTime();
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  
  const totalWeeks = Math.floor(diffDays / 7);
  const remDays = diffDays % 7;
  const clampedWeeks = Math.min(42, totalWeeks);
  
  let trimester: 1 | 2 | 3 = 1;
  if (clampedWeeks >= 28) {
    trimester = 3;
  } else if (clampedWeeks >= 13) {
    trimester = 2;
  }

  const progressPercent = Math.min(100, Math.round((diffDays / 280) * 100));

  return {
    weeks: clampedWeeks,
    days: remDays,
    trimester,
    progressPercent,
  };
}

export function calculateDueDate(lmpDateStr: string): string {
  // Naegele's rule: LMP + 280 days (40 weeks)
  const lmp = new Date(lmpDateStr);
  const dueDate = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
  return dueDate.toISOString().split('T')[0];
}

export function calculateFertileWindow(lastPeriodDateStr: string, cycleLengthDays: number = 28): {
  ovulationDate: string;
  fertileStart: string;
  fertileEnd: string;
  nextPeriodDate: string;
} {
  const start = new Date(lastPeriodDateStr);
  // Ovulation typically occurs 14 days before next period
  const nextPeriod = new Date(start.getTime() + cycleLengthDays * 24 * 60 * 60 * 1000);
  const ovulation = new Date(nextPeriod.getTime() - 14 * 24 * 60 * 60 * 1000);
  const fertileStart = new Date(ovulation.getTime() - 4 * 24 * 60 * 60 * 1000);
  const fertileEnd = new Date(ovulation.getTime() + 1 * 24 * 60 * 60 * 1000);

  return {
    ovulationDate: ovulation.toISOString().split('T')[0],
    fertileStart: fertileStart.toISOString().split('T')[0],
    fertileEnd: fertileEnd.toISOString().split('T')[0],
    nextPeriodDate: nextPeriod.toISOString().split('T')[0],
  };
}

export type CycleDayPhase = 'period' | 'fertile' | 'normal';

export interface CycleCalendarCell {
  dateStr: string;
  dayOfMonth: number;
  inCurrentMonth: boolean;
  phase: CycleDayPhase;
  isOvulationDay: boolean;
  cycleDayNumber: number; // 1-indexed day within cycle
  isLoggedPeriod: boolean;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function parseUtcDateMs(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return Date.UTC(y, (m || 1) - 1, d || 1);
}

export function formatUtcDateStr(utcMs: number): string {
  return new Date(utcMs).toISOString().split('T')[0];
}

export function getDayCyclePhase(
  dateStr: string,
  anchorPeriodStartStr: string,
  cycleLengthDays: number = 28,
  periodLengthDays: number = 5,
  loggedCycles: Array<{ startDate: string; endDate?: string }> = []
): {
  phase: CycleDayPhase;
  isOvulationDay: boolean;
  cycleDayNumber: number;
  isLoggedPeriod: boolean;
} {
  const safeCycleLen = Math.max(21, Math.min(45, Math.round(cycleLengthDays) || 28));
  const safePeriodLen = Math.max(2, Math.min(10, Math.round(periodLengthDays) || 5));

  const targetMs = parseUtcDateMs(dateStr);
  const anchorMs = parseUtcDateMs(anchorPeriodStartStr);
  const diffDays = Math.round((targetMs - anchorMs) / MS_PER_DAY);
  const cycleIndex = ((diffDays % safeCycleLen) + safeCycleLen) % safeCycleLen;
  const cycleDayNumber = cycleIndex + 1;

  // Check explicit logged menstrual period intervals first
  const isLoggedPeriod = loggedCycles.some((c) => {
    const cStartMs = parseUtcDateMs(c.startDate);
    const cEndMs = c.endDate
      ? parseUtcDateMs(c.endDate)
      : cStartMs + (safePeriodLen - 1) * MS_PER_DAY;
    return targetMs >= cStartMs && targetMs <= cEndMs;
  });

  if (isLoggedPeriod || cycleIndex < safePeriodLen) {
    return {
      phase: 'period',
      isOvulationDay: false,
      cycleDayNumber,
      isLoggedPeriod,
    };
  }

  // Ovulation typically occurs 14 days before the next period
  const ovulationIndex = Math.max(safePeriodLen, safeCycleLen - 14);
  const fertileStartIndex = Math.max(safePeriodLen, ovulationIndex - 4);
  const fertileEndIndex = Math.min(safeCycleLen - 1, ovulationIndex + 1);

  if (cycleIndex >= fertileStartIndex && cycleIndex <= fertileEndIndex) {
    return {
      phase: 'fertile',
      isOvulationDay: cycleIndex === ovulationIndex,
      cycleDayNumber,
      isLoggedPeriod: false,
    };
  }

  return {
    phase: 'normal',
    isOvulationDay: false,
    cycleDayNumber,
    isLoggedPeriod: false,
  };
}

export function buildCycleCalendarMonth(
  year: number,
  monthIndex: number, // 0 = Jan, 11 = Dec
  anchorPeriodStartStr: string,
  cycleLengthDays: number = 28,
  periodLengthDays: number = 5,
  loggedCycles: Array<{ startDate: string; endDate?: string }> = []
): CycleCalendarCell[] {
  const firstOfMonthMs = Date.UTC(year, monthIndex, 1);
  const firstDayUtc = new Date(firstOfMonthMs).getUTCDay(); // 0 = Sun, 1 = Mon ... 6 = Sat
  // Monday-first grid offset: Mon=0, Tue=1, ..., Sun=6
  const leadingEmptyDays = (firstDayUtc + 6) % 7;

  const daysInMonth = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const totalSlots = Math.ceil((leadingEmptyDays + daysInMonth) / 7) * 7;

  const cells: CycleCalendarCell[] = [];
  for (let i = 0; i < totalSlots; i++) {
    const dayOffset = i - leadingEmptyDays;
    const cellMs = firstOfMonthMs + dayOffset * MS_PER_DAY;
    const cellDate = new Date(cellMs);
    const dateStr = formatUtcDateStr(cellMs);
    const inCurrentMonth =
      cellDate.getUTCFullYear() === year && cellDate.getUTCMonth() === monthIndex;

    const info = getDayCyclePhase(
      dateStr,
      anchorPeriodStartStr,
      cycleLengthDays,
      periodLengthDays,
      loggedCycles
    );

    cells.push({
      dateStr,
      dayOfMonth: cellDate.getUTCDate(),
      inCurrentMonth,
      phase: info.phase,
      isOvulationDay: info.isOvulationDay,
      cycleDayNumber: info.cycleDayNumber,
      isLoggedPeriod: info.isLoggedPeriod,
    });
  }

  return cells;
}

export type LabStatus = 'normal' | 'low' | 'high' | 'critical';

export function evaluateLabValue(value: number, minRef?: number, maxRef?: number): {
  status: LabStatus;
  labelAr: string;
  labelFr: string;
  labelEn: string;
  color: string;
} {
  if (minRef !== undefined && value < minRef) {
    const isCritical = value < minRef * 0.7;
    return {
      status: isCritical ? 'critical' : 'low',
      labelAr: isCritical ? 'منخفض جداً (حرج)' : 'منخفض عن المعدل',
      labelFr: isCritical ? 'Très bas (critique)' : 'Inférieur à la normale',
      labelEn: isCritical ? 'Critically low' : 'Below normal',
      color: '#ef4444',
    };
  }
  if (maxRef !== undefined && value > maxRef) {
    const isCritical = value > maxRef * 1.3;
    return {
      status: isCritical ? 'critical' : 'high',
      labelAr: isCritical ? 'مرتفع جداً (حرج)' : 'مرتفع عن المعدل',
      labelFr: isCritical ? 'Très élevé (critique)' : 'Supérieur à la normale',
      labelEn: isCritical ? 'Critically high' : 'Above normal',
      color: '#ef4444',
    };
  }
  return {
    status: 'normal',
    labelAr: 'ضمن المعدل الطبيعي',
    labelFr: 'Dans les normes',
    labelEn: 'Within normal range',
    color: '#10b981',
  };
}

export interface VaccineScheduleItem {
  id: string;
  name: string;
  nameFr?: string;
  nameEn?: string;
  targetAgeMonths: number;
  ageLabelAr: string;
  ageLabelFr: string;
  ageLabelEn: string;
  descriptionAr: string;
  descriptionFr: string;
  descriptionEn: string;
  mandatory: boolean;
}

// Algerian National Vaccination Schedule (PEV Algérie)
export const ALGERIAN_PEV_SCHEDULE: VaccineScheduleItem[] = [
  {
    id: 'bcg_hb0',
    name: 'BCG + Hépatite B (Dose 1)',
    nameEn: 'BCG + Hepatitis B (Dose 1)',
    targetAgeMonths: 0,
    ageLabelAr: 'عند الولادة',
    ageLabelFr: 'À la naissance',
    ageLabelEn: 'At birth',
    descriptionAr: 'السل + التهاب الكبد الفيروسي ب',
    descriptionFr: 'Tuberculose + Hépatite B',
    descriptionEn: 'Tuberculosis + Hepatitis B',
    mandatory: true,
  },
  {
    id: 'penta1_polio1',
    name: 'Pentavalent 1 + VPO 1 + Pneumo 1',
    nameEn: 'Pentavalent 1 + OPV 1 + Pneumo 1',
    targetAgeMonths: 2,
    ageLabelAr: 'الشهر الثاني (2 أشهر)',
    ageLabelFr: 'À 2 mois',
    ageLabelEn: 'At 2 months',
    descriptionAr: 'الدفتيريا، الكزاز، السعال الديكي، هيموفيلوس، كبد ب + شلل الأطفال + المكورات الرئوية',
    descriptionFr: 'DTC-HepB-Hib + Polio oral + Pneumocoque',
    descriptionEn: 'DTP-HepB-Hib + Oral Polio + Pneumococcal',
    mandatory: true,
  },
  {
    id: 'penta2_polio2',
    name: 'Pentavalent 2 + VPO 2 + Pneumo 2',
    nameEn: 'Pentavalent 2 + OPV 2 + Pneumo 2',
    targetAgeMonths: 4,
    ageLabelAr: 'الشهر الرابع (4 أشهر)',
    ageLabelFr: 'À 4 mois',
    ageLabelEn: 'At 4 months',
    descriptionAr: 'الجرعة الثانية من الخماسي وشلل الأطفال والمكورات الرئوية',
    descriptionFr: '2ème dose DTC-HepB-Hib + Polio oral + Pneumocoque',
    descriptionEn: '2nd dose DTP-HepB-Hib + Oral Polio + Pneumococcal',
    mandatory: true,
  },
  {
    id: 'penta3_polio3',
    name: 'Pentavalent 3 + VPO 3 + VPI',
    nameEn: 'Pentavalent 3 + OPV 3 + IPV',
    targetAgeMonths: 6,
    ageLabelAr: 'الشهر السادس (6 أشهر)',
    ageLabelFr: 'À 6 mois',
    ageLabelEn: 'At 6 months',
    descriptionAr: 'الجرعة الثالثة من الخماسي وشلل الأطفال + شلل معطل بالحقن',
    descriptionFr: '3ème dose DTC-HepB-Hib + Polio oral + Polio injectable',
    descriptionEn: '3rd dose DTP-HepB-Hib + Oral Polio + Inactivated Polio',
    mandatory: true,
  },
  {
    id: 'ror1',
    name: 'ROR 1 (الحصبة، النكاف، الحميراء)',
    nameFr: 'ROR 1 (Rougeole, Oreillons, Rubéole)',
    nameEn: 'MMR 1 (Measles, Mumps, Rubella)',
    targetAgeMonths: 11,
    ageLabelAr: 'الشهر الحادي عشر (11 شهراً)',
    ageLabelFr: 'À 11 mois',
    ageLabelEn: 'At 11 months',
    descriptionAr: 'الجرعة الأولى من لقاح الحصبة والنكاف والحميراء',
    descriptionFr: 'Rougeole - Oreillons - Rubéole (1ère dose)',
    descriptionEn: 'Measles - Mumps - Rubella (1st dose)',
    mandatory: true,
  },
  {
    id: 'ror2_pneumo_rappel',
    name: 'ROR 2 + تذكير المكورات الرئوية',
    nameFr: 'ROR 2 + Rappel Pneumocoque',
    nameEn: 'MMR 2 + Pneumococcal Booster',
    targetAgeMonths: 18,
    ageLabelAr: 'الشهر الثامن عشر (18 شهراً)',
    ageLabelFr: 'À 18 mois',
    ageLabelEn: 'At 18 months',
    descriptionAr: 'الجرعة الداعمة ROR وتذكير المكورات الرئوية وتذكير شلل الأطفال',
    descriptionFr: '2ème dose ROR + Rappel Pneumocoque et Polio',
    descriptionEn: '2nd MMR dose + Pneumococcal and Polio boosters',
    mandatory: true,
  },
];

export function getVaccineDueSummary(
  childAgeMonths: number,
  completedVaccineIds: string[]
): {
  completedCount: number;
  totalDue: number;
  upcomingOrOverdue: VaccineScheduleItem[];
} {
  const completedSet = new Set(completedVaccineIds);
  const totalDueList = ALGERIAN_PEV_SCHEDULE.filter((v) => v.targetAgeMonths <= childAgeMonths);
  const completedCount = totalDueList.filter((v) => completedSet.has(v.id)).length;
  const upcomingOrOverdue = ALGERIAN_PEV_SCHEDULE.filter((v) => !completedSet.has(v.id));

  return {
    completedCount,
    totalDue: totalDueList.length,
    upcomingOrOverdue,
  };
}

export function formatChartNumericLabel(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : '';
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return '';
    const match = trimmed.match(/-?\d+(?:\.\d+)?/);
    return match ? match[0] : '';
  }
  return '';
}

export interface ChartClickStateLike {
  activePayload?: Array<{ payload?: { id?: string } }>;
  activeTooltipIndex?: number | string | null;
  activeLabel?: string | number;
}

export function resolveChartClickVitalId(
  chartData: Array<{ id: string; date: string }>,
  clickState: ChartClickStateLike | null | undefined
): string | null {
  if (!clickState || chartData.length === 0) return null;

  const payloadId = clickState.activePayload?.[0]?.payload?.id;
  if (typeof payloadId === 'string' && payloadId.length > 0) {
    return payloadId;
  }

  const rawIdx = clickState.activeTooltipIndex;
  if (rawIdx !== null && rawIdx !== undefined && rawIdx !== '') {
    const idx = typeof rawIdx === 'number' ? rawIdx : Number(rawIdx);
    if (Number.isInteger(idx) && idx >= 0 && idx < chartData.length) {
      return chartData[idx].id;
    }
  }

  if (clickState.activeLabel !== undefined && clickState.activeLabel !== null) {
    const labelStr = String(clickState.activeLabel);
    const matched = chartData.find((d) => d.date === labelStr);
    if (matched) return matched.id;
  }

  return null;
}

