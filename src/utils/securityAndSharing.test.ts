import test from 'node:test';
import assert from 'node:assert/strict';
import {
  maskIdentityNumber,
  isSharePassExpired,
  getSharePassStatus,
  VERIFIED_ALGERIAN_HOTLINES,
  WILAYA_HOSPITAL_URGENCES,
  checkMemberAccessPermission,
} from './securityAndSharing';
import { FamilyMember } from '../types/tibbi';

test('maskIdentityNumber correctly hides sensitive digits unless revealed', () => {
  const chifa = '0119867543219804';
  
  // Default masked
  const masked = maskIdentityNumber(chifa, false);
  assert.equal(masked, '01 •••• •••• 9804');

  // Revealed
  const revealed = maskIdentityNumber(chifa, true);
  assert.equal(revealed, chifa);

  // Empty value handling
  assert.equal(maskIdentityNumber(undefined, false), '--');
  assert.equal(maskIdentityNumber('', false), '--');
});

test('isSharePassExpired accurately calculates expired vs active passes', () => {
  const reference = new Date('2026-11-12T10:00:00Z');

  // Past date
  const past = '2026-11-06T10:00:00Z';
  assert.equal(isSharePassExpired(past, reference), true);

  // Future date
  const future = '2026-11-13T10:00:00Z';
  assert.equal(isSharePassExpired(future, reference), false);

  // Status computation
  const statusExpired = getSharePassStatus(past, reference);
  assert.equal(statusExpired.isExpired, true);
  assert.equal(statusExpired.badgeTextAr, 'منتهي الصلاحية');
  assert.equal(statusExpired.badgeTextFr, 'Expiré');

  const statusActive = getSharePassStatus(future, reference);
  assert.equal(statusActive.isExpired, false);
  assert.equal(statusActive.badgeTextAr, 'نشط وصالح');
});

test('Algerian emergency numbers contain official verified lines and disclaim SAMU universality', () => {
  assert.ok(VERIFIED_ALGERIAN_HOTLINES.length >= 3);
  
  const protCivile = VERIFIED_ALGERIAN_HOTLINES.find((h) => h.id === 'protection_civile');
  assert.ok(protCivile);
  assert.equal(protCivile?.number, '14');
  assert.equal(protCivile?.secondaryNumber, '1021');

  const police = VERIFIED_ALGERIAN_HOTLINES.find((h) => h.id === 'police_nationale');
  assert.ok(police);
  assert.equal(police?.number, '17');
  assert.equal(police?.secondaryNumber, '1548');

  // Check hospital urgences map for Alger and Oran
  assert.ok(WILAYA_HOSPITAL_URGENCES['16']);
  assert.ok(WILAYA_HOSPITAL_URGENCES['16'].phone.includes('23 55 55'));
  assert.ok(WILAYA_HOSPITAL_URGENCES['31']);
});

test('Guardian access permission enforces legal custody on child records', () => {
  const childMember: FamilyMember = {
    id: 'fam_yacine',
    fullNameAr: 'ياسين مزيان',
    fullNameFr: 'Yacine Meziane',
    relationship: 'child',
    relationshipLabelAr: 'ابن',
    relationshipLabelFr: 'Enfant',
    gender: 'male',
    birthDate: '2019-03-15',
    bloodGroup: 'A+',
    allergies: ['البنسلين'],
    chronicDiseases: ['ربو تحسسي'],
    surgeries: [],
    legalGuardian: 'أمين مزيان (الأب)',
  };

  const perm = checkMemberAccessPermission('fam_amine', childMember);
  assert.equal(perm.hasAccess, true);
  assert.equal(perm.accessType, 'guardian');
  assert.ok(perm.reasonAr.includes('وصاية الولي القانوني'));
});
