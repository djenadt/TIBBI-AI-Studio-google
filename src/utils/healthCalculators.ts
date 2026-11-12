/**
 * Core health metrics, calculations, and clinical logic for TIBBI
 */

export interface BMICategory {
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  labelAr: string;
  labelFr: string;
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
      color: '#eab308', // yellow
    };
  }
  if (bmi < 25) {
    return {
      category: 'normal',
      labelAr: 'وزن مثالي وطبيعي',
      labelFr: 'Poids normal',
      color: '#10b981', // green
    };
  }
  if (bmi < 30) {
    return {
      category: 'overweight',
      labelAr: 'زيادة في الوزن',
      labelFr: 'Surpoids',
      color: '#f97316', // orange
    };
  }
  return {
    category: 'obese',
    labelAr: 'سمنة',
    labelFr: 'Obésité',
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

export type LabStatus = 'normal' | 'low' | 'high' | 'critical';

export function evaluateLabValue(value: number, minRef?: number, maxRef?: number): {
  status: LabStatus;
  labelAr: string;
  labelFr: string;
  color: string;
} {
  if (minRef !== undefined && value < minRef) {
    const isCritical = value < minRef * 0.7;
    return {
      status: isCritical ? 'critical' : 'low',
      labelAr: isCritical ? 'منخفض جداً (حرج)' : 'منخفض عن المعدل',
      labelFr: isCritical ? 'Très bas (critique)' : 'Inférieur à la normale',
      color: '#ef4444',
    };
  }
  if (maxRef !== undefined && value > maxRef) {
    const isCritical = value > maxRef * 1.3;
    return {
      status: isCritical ? 'critical' : 'high',
      labelAr: isCritical ? 'مرتفع جداً (حرج)' : 'مرتفع عن المعدل',
      labelFr: isCritical ? 'Très élevé (critique)' : 'Supérieur à la normale',
      color: '#ef4444',
    };
  }
  return {
    status: 'normal',
    labelAr: 'ضمن المعدل الطبيعي',
    labelFr: 'Dans les normes',
    color: '#10b981',
  };
}

export interface VaccineScheduleItem {
  id: string;
  name: string;
  targetAgeMonths: number;
  ageLabelAr: string;
  ageLabelFr: string;
  descriptionAr: string;
  descriptionFr: string;
  mandatory: boolean;
}

// Algerian National Vaccination Schedule (PEV Algérie)
export const ALGERIAN_PEV_SCHEDULE: VaccineScheduleItem[] = [
  {
    id: 'bcg_hb0',
    name: 'BCG + Hépatite B (Dose 1)',
    targetAgeMonths: 0,
    ageLabelAr: 'عند الولادة',
    ageLabelFr: 'À la naissance',
    descriptionAr: 'السل + التهاب الكبد الفيروسي ب',
    descriptionFr: 'Tuberculose + Hépatite B',
    mandatory: true,
  },
  {
    id: 'penta1_polio1',
    name: 'Pentavalent 1 + VPO 1 + Pneumo 1',
    targetAgeMonths: 2,
    ageLabelAr: 'الشهر الثاني (2 أشهر)',
    ageLabelFr: 'À 2 mois',
    descriptionAr: 'الدفتيريا، الكزاز، السعال الديكي، هيموفيلوس، كبد ب + شلل الأطفال + المكورات الرئوية',
    descriptionFr: 'DTC-HepB-Hib + Polio oral + Pneumocoque',
    mandatory: true,
  },
  {
    id: 'penta2_polio2',
    name: 'Pentavalent 2 + VPO 2 + Pneumo 2',
    targetAgeMonths: 4,
    ageLabelAr: 'الشهر الرابع (4 أشهر)',
    ageLabelFr: 'À 4 mois',
    descriptionAr: 'الجرعة الثانية من الخماسي وشلل الأطفال والمكورات الرئوية',
    descriptionFr: '2ème dose DTC-HepB-Hib + Polio oral + Pneumocoque',
    mandatory: true,
  },
  {
    id: 'penta3_polio3',
    name: 'Pentavalent 3 + VPO 3 + VPI',
    targetAgeMonths: 6,
    ageLabelAr: 'الشهر السادس (6 أشهر)',
    ageLabelFr: 'À 6 mois',
    descriptionAr: 'الجرعة الثالثة من الخماسي وشلل الأطفال + شلل معطل بالحقن',
    descriptionFr: '3ème dose DTC-HepB-Hib + Polio oral + Polio injectable',
    mandatory: true,
  },
  {
    id: 'ror1',
    name: 'ROR 1 (الحصبة، النكاف، الحميراء)',
    targetAgeMonths: 11,
    ageLabelAr: 'الشهر الحادي عشر (11 شهراً)',
    ageLabelFr: 'À 11 mois',
    descriptionAr: 'الجرعة الأولى من لقاح الحصبة والنكاف والحميراء',
    descriptionFr: 'Rougeole - Oreillons - Rubéole (1ère dose)',
    mandatory: true,
  },
  {
    id: 'ror2_pneumo_rappel',
    name: 'ROR 2 + تذكير المكورات الرئوية',
    targetAgeMonths: 18,
    ageLabelAr: 'الشهر الثامن عشر (18 شهراً)',
    ageLabelFr: 'À 18 mois',
    descriptionAr: 'الجرعة الداعمة ROR وتذكير المكورات الرئوية وتذكير شلل الأطفال',
    descriptionFr: '2ème dose ROR + Rappel Pneumocoque et Polio',
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
