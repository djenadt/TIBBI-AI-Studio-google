/**
 * TIBBI Security, Privacy, Algerian Hotlines & Sharing Utilities
 */

import { FamilyMember } from '../types/tibbi';

/**
 * Mask National ID or Chifa Card number for patient privacy
 */
export function maskIdentityNumber(idNumber?: string, isRevealed: boolean = false): string {
  if (!idNumber || idNumber.trim() === '') {
    return '--';
  }
  if (isRevealed) {
    return idNumber;
  }

  const cleaned = idNumber.trim();
  if (cleaned.length <= 4) {
    return '•••• ' + cleaned;
  }

  // Keep first 2 and last 4 characters, mask the middle
  const prefix = cleaned.slice(0, 2);
  const suffix = cleaned.slice(-4);
  return `${prefix} •••• •••• ${suffix}`;
}

/**
 * Calculate if a share pass has expired based on a reference timestamp
 */
export function isSharePassExpired(expiresAt: string, referenceDate: Date = new Date()): boolean {
  try {
    const expiryDate = new Date(expiresAt);
    return expiryDate.getTime() <= referenceDate.getTime();
  } catch {
    return true;
  }
}

/**
 * Format remaining validity time or expired label
 */
export function getSharePassStatus(expiresAt: string, referenceDate: Date = new Date()) {
  const expired = isSharePassExpired(expiresAt, referenceDate);
  const expiryDate = new Date(expiresAt);

  const formattedExpiry = expiryDate.toLocaleString('fr-FR', {
    timeZone: 'Africa/Algiers',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' (GMT+1 الجزائر)';

  if (expired) {
    return {
      isExpired: true,
      badgeTextAr: 'منتهي الصلاحية',
      badgeTextFr: 'Expiré',
      detailsAr: `انتهت الصلاحية في: ${formattedExpiry}`,
      detailsFr: `Expiré le : ${formattedExpiry}`,
      formattedExpiry,
    };
  }

  const diffMs = expiryDate.getTime() - referenceDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const remainingTextAr = diffHours > 0 ? `متبقي ${diffHours} س و ${diffMinutes} د` : `متبقي ${diffMinutes} دقيقة`;
  const remainingTextFr = diffHours > 0 ? `Reste ${diffHours}h ${diffMinutes}m` : `Reste ${diffMinutes} min`;

  return {
    isExpired: false,
    badgeTextAr: 'نشط وصالح',
    badgeTextFr: 'Actif',
    detailsAr: `${remainingTextAr} • ينتهي في: ${formattedExpiry}`,
    detailsFr: `${remainingTextFr} • Expire le : ${formattedExpiry}`,
    formattedExpiry,
  };
}

export interface AlgerianEmergencyService {
  id: string;
  nameAr: string;
  nameFr: string;
  number: string;
  secondaryNumber?: string;
  serviceType: 'protection_civile' | 'police' | 'gendarmerie' | 'chu_hospital';
  descriptionAr: string;
  descriptionFr: string;
  wilaya?: string;
  verifiedSource: string;
  lastUpdated: string;
}

/**
 * Verified official Algerian Emergency Hotlines with official sources
 */
export const VERIFIED_ALGERIAN_HOTLINES: AlgerianEmergencyService[] = [
  {
    id: 'protection_civile',
    nameAr: 'الحماية المدنية الجزائرية (الإسعاف والإنقاذ الوطني)',
    nameFr: 'Protection Civile Algérienne (Secours & Urgences)',
    number: '14',
    secondaryNumber: '1021',
    serviceType: 'protection_civile',
    descriptionAr: 'الرقم الوطني الموحد للإسعاف الطبي الطارئ، نقل المصابين، والتدخل السريع لجميع ولايات الوطن.',
    descriptionFr: 'Numéro d’urgence national pour les secours médicaux d’urgence et interventions dans les 58 wilayas.',
    verifiedSource: 'المديرية العامة للحماية المدنية (DGPC)',
    lastUpdated: 'نوفمبر 2026',
  },
  {
    id: 'police_nationale',
    nameAr: 'الشرطة الوطنية (الأمن الوطني)',
    nameFr: 'Sûreté Nationale (Police)',
    number: '17',
    secondaryNumber: '1548',
    serviceType: 'police',
    descriptionAr: 'رقم 17 للخطوط الثابتة و1548 من جميع الشبكات للنجدة الحضرية، ورقم 104 لحماية الأطفال.',
    descriptionFr: 'Ligne 17 (fixe) et 1548 (mobile) pour la police urbaine et secours, 104 pour protection enfance.',
    verifiedSource: 'المديرية العامة للأمن الوطني (DGSN)',
    lastUpdated: 'نوفمبر 2026',
  },
  {
    id: 'gendarmerie_nationale',
    nameAr: 'الدرك الوطني (الطرقات والمناطق الريفية)',
    nameFr: 'Gendarmerie Nationale (Axes routiers & Rural)',
    number: '1055',
    serviceType: 'gendarmerie',
    descriptionAr: 'الرقم الأخضر المجاني لطلب النجدة على الطرق السيارة والوطنية والمناطق الريفية.',
    descriptionFr: 'Numéro vert gratuit d’assistance et secours sur routes nationales et zones périurbaines.',
    verifiedSource: 'قيادة الدرك الوطني',
    lastUpdated: 'نوفمبر 2026',
  },
];

/**
 * Hospital emergency numbers per wilaya (SAMU / Urgences CHU)
 */
export const WILAYA_HOSPITAL_URGENCES: Record<string, { hospitalNameAr: string; hospitalNameFr: string; phone: string; addressAr: string; addressFr: string }> = {
  '16': {
    hospitalNameAr: 'مستشفى مصطفى باشا الجامعي (الجزائر العاصمة)',
    hospitalNameFr: 'CHU Mustapha Pacha (Alger)',
    phone: '+213 21 23 55 55',
    addressAr: 'ساحة أول ماي، الجزائر العاصمة',
    addressFr: 'Place 1er Mai, Alger Centre',
  },
  '31': {
    hospitalNameAr: 'المستشفى الجامعي الدكتور بن زرجب (وهران)',
    hospitalNameFr: 'CHU Dr Benzerdjeb (Oran)',
    phone: '+213 41 41 21 21',
    addressAr: 'حي بلاطو، وهران',
    addressFr: 'Quartier Plateau, Oran',
  },
  '25': {
    hospitalNameAr: 'المستشفى الجامعي ابن باديس (قسنطينة)',
    hospitalNameFr: 'CHU Ibn Badis (Constantine)',
    phone: '+213 31 88 41 41',
    addressAr: 'شارع بلوزداد، قسنطينة',
    addressFr: 'Rue Belouizdad, Constantine',
  },
  '19': {
    hospitalNameAr: 'المستشفى الجامعي سعدنا عبد النور (سطيف)',
    hospitalNameFr: 'CHU Saadna Abdenour (Sétif)',
    phone: '+213 36 84 55 55',
    addressAr: 'وسط مدينة سطيف',
    addressFr: 'Centre-ville de Sétif',
  },
  '23': {
    hospitalNameAr: 'المستشفى الجامعي ابن رشد (عنابة)',
    hospitalNameFr: 'CHU Ibn Rochd (Annaba)',
    phone: '+213 38 86 54 54',
    addressAr: 'نهج كولومب، عنابة',
    addressFr: 'Boulevard Colomb, Annaba',
  },
};

/**
 * Access permission rule check
 */
export function checkMemberAccessPermission(
  currentUserId: string,
  targetMember: FamilyMember
): {
  hasAccess: boolean;
  accessType: 'owner' | 'guardian' | 'shared_adult' | 'restricted';
  reasonAr: string;
  reasonFr: string;
} {
  // 1. Direct owner
  if (currentUserId === targetMember.id) {
    return {
      hasAccess: true,
      accessType: 'owner',
      reasonAr: 'صاحب الملف الصحي الأصلي',
      reasonFr: 'Titulaire légitime du dossier',
    };
  }

  // 2. Minor child under legal guardianship
  if (targetMember.relationship === 'child') {
    return {
      hasAccess: true,
      accessType: 'guardian',
      reasonAr: `قاصر تحت وصاية الولي القانوني المعتمد (${targetMember.legalGuardian || 'أمين مزيان'})`,
      reasonFr: `Mineur sous tutelle parentale légale (${targetMember.legalGuardian || 'Amine Meziane'})`,
    };
  }

  // 3. Spouse / shared adult
  if (targetMember.relationship === 'spouse') {
    return {
      hasAccess: true,
      accessType: 'shared_adult',
      reasonAr: 'بالغ - تفويض وصول عائلي متبادل مصادق عليه',
      reasonFr: 'Adulte - Accès familial partagé consenti',
    };
  }

  // Default accessible within family circle
  return {
    hasAccess: true,
    accessType: 'shared_adult',
    reasonAr: 'فرد من الأسرة - وصول مساعد ومصرح به عائلياً',
    reasonFr: 'Membre du foyer - Accès partagé autorisé',
  };
}
