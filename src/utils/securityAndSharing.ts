/**
 * TIBBI Security, Privacy, Algerian Hotlines & Sharing Utilities
 */

import { FamilyMember } from '../types/tibbi';
import { translateTextFr } from './frTranslator';
import { translateTextEn } from './enTranslator';

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

  const baseExpiry = expiryDate.toLocaleString('fr-FR', {
    timeZone: 'Africa/Algiers',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const baseExpiryEn = expiryDate.toLocaleString('en-GB', {
    timeZone: 'Africa/Algiers',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const formattedExpiry = baseExpiry + ' (GMT+1 الجزائر)';
  const formattedExpiryFr = baseExpiry + ' (GMT+1 Alger)';
  const formattedExpiryEn = baseExpiryEn + ' (GMT+1 Algiers)';

  if (expired) {
    return {
      isExpired: true,
      badgeTextAr: 'منتهي الصلاحية',
      badgeTextFr: 'Expiré',
      badgeTextEn: 'Expired',
      detailsAr: `انتهت الصلاحية في: ${formattedExpiry}`,
      detailsFr: `Expiré le : ${formattedExpiryFr}`,
      detailsEn: `Expired on: ${formattedExpiryEn}`,
      formattedExpiry,
      formattedExpiryFr,
      formattedExpiryEn,
    };
  }

  const diffMs = expiryDate.getTime() - referenceDate.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  const remainingTextAr = diffHours > 0 ? `متبقي ${diffHours} س و ${diffMinutes} د` : `متبقي ${diffMinutes} دقيقة`;
  const remainingTextFr = diffHours > 0 ? `Reste ${diffHours}h ${diffMinutes}m` : `Reste ${diffMinutes} min`;
  const remainingTextEn = diffHours > 0 ? `${diffHours}h ${diffMinutes}m left` : `${diffMinutes} min left`;

  return {
    isExpired: false,
    badgeTextAr: 'نشط وصالح',
    badgeTextFr: 'Actif',
    badgeTextEn: 'Active',
    detailsAr: `${remainingTextAr} • ينتهي في: ${formattedExpiry}`,
    detailsFr: `${remainingTextFr} • Expire le : ${formattedExpiryFr}`,
    detailsEn: `${remainingTextEn} • Expires: ${formattedExpiryEn}`,
    formattedExpiry,
    formattedExpiryFr,
    formattedExpiryEn,
  };
}

export interface AlgerianEmergencyService {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  number: string;
  secondaryNumber?: string;
  serviceType: 'protection_civile' | 'police' | 'gendarmerie' | 'chu_hospital';
  descriptionAr: string;
  descriptionFr: string;
  descriptionEn: string;
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
    nameEn: 'Algerian Civil Protection (Emergency Medical & Rescue)',
    number: '14',
    secondaryNumber: '1021',
    serviceType: 'protection_civile',
    descriptionAr: 'الرقم الوطني الموحد للإسعاف الطبي الطارئ، نقل المصابين، والتدخل السريع لجميع ولايات الوطن.',
    descriptionFr: 'Numéro d’urgence national pour les secours médicaux d’urgence et interventions dans les 58 wilayas.',
    descriptionEn: 'National emergency number for urgent medical aid, ambulance transport, and rescue across all 58 wilayas.',
    verifiedSource: 'المديرية العامة للحماية المدنية (DGPC)',
    lastUpdated: 'نوفمبر 2026',
  },
  {
    id: 'police_nationale',
    nameAr: 'الشرطة الوطنية (الأمن الوطني)',
    nameFr: 'Sûreté Nationale (Police)',
    nameEn: 'National Police (DGSN)',
    number: '17',
    secondaryNumber: '1548',
    serviceType: 'police',
    descriptionAr: 'رقم 17 للخطوط الثابتة و1548 من جميع الشبكات للنجدة الحضرية، ورقم 104 لحماية الأطفال.',
    descriptionFr: 'Ligne 17 (fixe) et 1548 (mobile) pour la police urbaine et secours, 104 pour protection enfance.',
    descriptionEn: 'Dial 17 (landline) and 1548 (all networks) for urban emergency assistance; 104 for child protection.',
    verifiedSource: 'المديرية العامة للأمن الوطني (DGSN)',
    lastUpdated: 'نوفمبر 2026',
  },
  {
    id: 'gendarmerie_nationale',
    nameAr: 'الدرك الوطني (الطرقات والمناطق الريفية)',
    nameFr: 'Gendarmerie Nationale (Axes routiers & Rural)',
    nameEn: 'National Gendarmerie (Highways & Rural Areas)',
    number: '1055',
    serviceType: 'gendarmerie',
    descriptionAr: 'الرقم الأخضر المجاني لطلب النجدة على الطرق السيارة والوطنية والمناطق الريفية.',
    descriptionFr: 'Numéro vert gratuit d’assistance et secours sur routes nationales et zones périurbaines.',
    descriptionEn: 'Toll-free emergency helpline for highways, national roads, and rural areas.',
    verifiedSource: 'قيادة الدرك الوطني',
    lastUpdated: 'نوفمبر 2026',
  },
];

/**
 * Hospital emergency numbers per wilaya (SAMU / Urgences CHU)
 */
export const WILAYA_HOSPITAL_URGENCES: Record<
  string,
  {
    hospitalNameAr: string;
    hospitalNameFr: string;
    hospitalNameEn: string;
    phone: string;
    addressAr: string;
    addressFr: string;
    addressEn: string;
  }
> = {
  '16': {
    hospitalNameAr: 'مستشفى مصطفى باشا الجامعي (الجزائر العاصمة)',
    hospitalNameFr: 'CHU Mustapha Pacha (Alger)',
    hospitalNameEn: 'Mustapha Pacha University Hospital (Algiers)',
    phone: '+213 21 23 55 55',
    addressAr: 'ساحة أول ماي، الجزائر العاصمة',
    addressFr: 'Place 1er Mai, Alger Centre',
    addressEn: '1st May Square, Central Algiers',
  },
  '31': {
    hospitalNameAr: 'المستشفى الجامعي الدكتور بن زرجب (وهران)',
    hospitalNameFr: 'CHU Dr Benzerdjeb (Oran)',
    hospitalNameEn: 'Dr Benzerdjeb University Hospital (Oran)',
    phone: '+213 41 41 21 21',
    addressAr: 'حي بلاطو، وهران',
    addressFr: 'Quartier Plateau, Oran',
    addressEn: 'Plateau District, Oran',
  },
  '25': {
    hospitalNameAr: 'المستشفى الجامعي ابن باديس (قسنطينة)',
    hospitalNameFr: 'CHU Ibn Badis (Constantine)',
    hospitalNameEn: 'Ibn Badis University Hospital (Constantine)',
    phone: '+213 31 88 41 41',
    addressAr: 'شارع بلوزداد، قسنطينة',
    addressFr: 'Rue Belouizdad, Constantine',
    addressEn: 'Belouizdad Street, Constantine',
  },
  '19': {
    hospitalNameAr: 'المستشفى الجامعي سعدنا عبد النور (سطيف)',
    hospitalNameFr: 'CHU Saadna Abdenour (Sétif)',
    hospitalNameEn: 'Saadna Abdenour University Hospital (Setif)',
    phone: '+213 36 84 55 55',
    addressAr: 'وسط مدينة سطيف',
    addressFr: 'Centre-ville de Sétif',
    addressEn: 'Setif City Center',
  },
  '23': {
    hospitalNameAr: 'المستشفى الجامعي ابن رشد (عنابة)',
    hospitalNameFr: 'CHU Ibn Rochd (Annaba)',
    hospitalNameEn: 'Ibn Rochd University Hospital (Annaba)',
    phone: '+213 38 86 54 54',
    addressAr: 'نهج كولومب، عنابة',
    addressFr: 'Boulevard Colomb, Annaba',
    addressEn: 'Colomb Boulevard, Annaba',
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
  reasonEn: string;
} {
  // 1. Direct owner
  if (currentUserId === targetMember.id) {
    return {
      hasAccess: true,
      accessType: 'owner',
      reasonAr: 'صاحب الملف الصحي الأصلي',
      reasonFr: 'Titulaire légitime du dossier',
      reasonEn: 'Primary health record holder',
    };
  }

  // 2. Minor child under legal guardianship
  if (targetMember.relationship === 'child') {
    const guardianFr = targetMember.legalGuardian
      ? translateTextFr(targetMember.legalGuardian)
      : 'Amine Meziane';
    const guardianEn = targetMember.legalGuardian
      ? translateTextEn(targetMember.legalGuardian)
      : 'Amine Meziane';
    return {
      hasAccess: true,
      accessType: 'guardian',
      reasonAr: `قاصر تحت وصاية الولي القانوني المعتمد (${targetMember.legalGuardian || 'أمين مزيان'})`,
      reasonFr: `Mineur sous tutelle parentale légale (${guardianFr})`,
      reasonEn: `Minor under authorized legal guardianship (${guardianEn})`,
    };
  }

  // 3. Spouse / shared adult
  if (targetMember.relationship === 'spouse') {
    return {
      hasAccess: true,
      accessType: 'shared_adult',
      reasonAr: 'بالغ - تفويض وصول عائلي متبادل مصادق عليه',
      reasonFr: 'Adulte - Accès familial partagé consenti',
      reasonEn: 'Adult - Authorized mutual family access',
    };
  }

  // Default accessible within family circle
  return {
    hasAccess: true,
    accessType: 'shared_adult',
    reasonAr: 'فرد من الأسرة - وصول مساعد ومصرح به عائلياً',
    reasonFr: 'Membre du foyer - Accès partagé autorisé',
    reasonEn: 'Family member - Authorized shared family access',
  };
}
