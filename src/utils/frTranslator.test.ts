import test from 'node:test';
import assert from 'node:assert/strict';
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
} from '../data/initialData';
import {
  VERIFIED_ALGERIAN_HOTLINES,
  getSharePassStatus,
  checkMemberAccessPermission,
} from './securityAndSharing';
import {
  localizeText,
  localizeList,
  translateMedicationForm,
  translateLabCategory,
  translateFlowIntensity,
  translateShareSectionLabel,
} from './frTranslator';

const ARABIC_RE = /[\u0600-\u06FF]/;

function assertNoArabic(value: string | undefined, label: string) {
  if (!value) return;
  assert.equal(ARABIC_RE.test(value), false, `Found residual Arabic in ${label}: ${value}`);
}

test('All initial seed records translate cleanly to French with zero Arabic characters', () => {
  for (const m of INITIAL_FAMILY_MEMBERS) {
    assertNoArabic(localizeText(m.legalGuardian, 'fr'), `${m.id}.legalGuardian`);
    assertNoArabic(localizeText(m.notes, 'fr'), `${m.id}.notes`);
    localizeList(m.allergies, 'fr').forEach((a, i) => assertNoArabic(a, `${m.id}.allergies[${i}]`));
    localizeList(m.chronicDiseases, 'fr').forEach((c, i) => assertNoArabic(c, `${m.id}.chronicDiseases[${i}]`));
    localizeList(m.surgeries, 'fr').forEach((s, i) => assertNoArabic(s, `${m.id}.surgeries[${i}]`));

    assertNoArabic(localizeText(m.legalGuardian, 'en'), `${m.id}.legalGuardian.en`);
    assertNoArabic(localizeText(m.notes, 'en'), `${m.id}.notes.en`);
    assertNoArabic(m.relationshipLabelEn, `${m.id}.relationshipLabelEn`);
    localizeList(m.allergies, 'en').forEach((a, i) => assertNoArabic(a, `${m.id}.allergies.en[${i}]`));
    localizeList(m.chronicDiseases, 'en').forEach((c, i) => assertNoArabic(c, `${m.id}.chronicDiseases.en[${i}]`));
    localizeList(m.surgeries, 'en').forEach((s, i) => assertNoArabic(s, `${m.id}.surgeries.en[${i}]`));
  }

  for (const med of INITIAL_MEDICATIONS) {
    for (const lang of ['fr', 'en'] as const) {
      assertNoArabic(localizeText(med.dosage, lang), `${med.id}.dosage.${lang}`);
      assertNoArabic(localizeText(med.frequency, lang), `${med.id}.frequency.${lang}`);
      assertNoArabic(localizeText(med.prescribingDoctor, lang), `${med.id}.prescribingDoctor.${lang}`);
      assertNoArabic(localizeText(med.prescribingSpecialty, lang), `${med.id}.prescribingSpecialty.${lang}`);
      assertNoArabic(localizeText(med.condition, lang), `${med.id}.condition.${lang}`);
      assertNoArabic(localizeText(med.instructions, lang), `${med.id}.instructions.${lang}`);
    }
  }

  for (const lab of INITIAL_LAB_TESTS) {
    for (const lang of ['fr', 'en'] as const) {
      assertNoArabic(localizeText(lab.testName, lang), `${lab.id}.testName.${lang}`);
      assertNoArabic(localizeText(lab.laboratory, lang), `${lab.id}.laboratory.${lang}`);
      assertNoArabic(localizeText(lab.prescribingDoctor, lang), `${lab.id}.prescribingDoctor.${lang}`);
      assertNoArabic(localizeText(lab.notes, lang), `${lab.id}.notes.${lang}`);
    }
  }

  for (const vit of INITIAL_VITALS) {
    assertNoArabic(localizeText(vit.notes, 'fr'), `${vit.id}.notes.fr`);
    assertNoArabic(localizeText(vit.notes, 'en'), `${vit.id}.notes.en`);
  }

  for (const doc of INITIAL_DOCUMENTS) {
    for (const lang of ['fr', 'en'] as const) {
      assertNoArabic(localizeText(doc.title, lang), `${doc.id}.title.${lang}`);
      assertNoArabic(localizeText(doc.doctorName, lang), `${doc.id}.doctorName.${lang}`);
      assertNoArabic(localizeText(doc.specialty, lang), `${doc.id}.specialty.${lang}`);
      assertNoArabic(localizeText(doc.facility, lang), `${doc.id}.facility.${lang}`);
      assertNoArabic(localizeText(doc.conclusion, lang), `${doc.id}.conclusion.${lang}`);
      assertNoArabic(localizeText(doc.recommendations, lang), `${doc.id}.recommendations.${lang}`);
      assertNoArabic(localizeText(doc.notes, lang), `${doc.id}.notes.${lang}`);
      localizeList(doc.tags, lang).forEach((t, i) => assertNoArabic(t, `${doc.id}.tags.${lang}[${i}]`));
      if (doc.extractedData?.medications) {
        doc.extractedData.medications.forEach((m: any, i: number) => {
          assertNoArabic(localizeText(m.dosage, lang), `${doc.id}.extracted.med[${i}].dosage.${lang}`);
          assertNoArabic(localizeText(m.duration, lang), `${doc.id}.extracted.med[${i}].duration.${lang}`);
        });
      }
      if (doc.extractedData?.labResults) {
        doc.extractedData.labResults.forEach((l: any, i: number) => {
          assertNoArabic(localizeText(l.testName, lang), `${doc.id}.extracted.lab[${i}].testName.${lang}`);
          assertNoArabic(localizeText(l.interpretation, lang), `${doc.id}.extracted.lab[${i}].interpretation.${lang}`);
        });
      }
    }
  }

  for (const apt of INITIAL_APPOINTMENTS) {
    for (const lang of ['fr', 'en'] as const) {
      assertNoArabic(localizeText(apt.doctorName, lang), `${apt.id}.doctorName.${lang}`);
      assertNoArabic(localizeText(apt.specialty, lang), `${apt.id}.specialty.${lang}`);
      assertNoArabic(localizeText(apt.clinicName, lang), `${apt.id}.clinicName.${lang}`);
      assertNoArabic(localizeText(apt.address, lang), `${apt.id}.address.${lang}`);
      assertNoArabic(localizeText(apt.reason, lang), `${apt.id}.reason.${lang}`);
      assertNoArabic(localizeText(apt.notes, lang), `${apt.id}.notes.${lang}`);
    }
  }

  for (const ev of INITIAL_TIMELINE_EVENTS) {
    for (const lang of ['fr', 'en'] as const) {
      assertNoArabic(localizeText(ev.title, lang), `${ev.id}.title.${lang}`);
      assertNoArabic(localizeText(ev.description, lang), `${ev.id}.description.${lang}`);
      assertNoArabic(localizeText(ev.doctorOrFacility, lang), `${ev.id}.doctorOrFacility.${lang}`);
      assertNoArabic(localizeText(ev.badge, lang), `${ev.id}.badge.${lang}`);
    }
  }

  for (const cyc of INITIAL_MENSTRUAL_CYCLES) {
    assertNoArabic(localizeText(cyc.notes, 'fr'), `${cyc.id}.notes.fr`);
    assertNoArabic(localizeText(cyc.notes, 'en'), `${cyc.id}.notes.en`);
    localizeList(cyc.symptoms, 'fr').forEach((s, i) => assertNoArabic(s, `${cyc.id}.symptoms.fr[${i}]`));
    localizeList(cyc.symptoms, 'en').forEach((s, i) => assertNoArabic(s, `${cyc.id}.symptoms.en[${i}]`));
  }

  for (const g of INITIAL_CHILD_GROWTH) {
    assertNoArabic(localizeText(g.pediatricianNotes, 'fr'), `${g.id}.pediatricianNotes.fr`);
    assertNoArabic(localizeText(g.pediatricianNotes, 'en'), `${g.id}.pediatricianNotes.en`);
  }

  for (const sp of INITIAL_SHARE_PASSES) {
    for (const lang of ['fr', 'en'] as const) {
      assertNoArabic(localizeText(sp.title, lang), `${sp.id}.title.${lang}`);
      assertNoArabic(localizeText(sp.doctorName, lang), `${sp.id}.doctorName.${lang}`);
      assertNoArabic(localizeText(sp.consentedBy, lang), `${sp.id}.consentedBy.${lang}`);
    }
  }

  for (const log of INITIAL_ACCESS_LOGS) {
    for (const lang of ['fr', 'en'] as const) {
      assertNoArabic(localizeText(log.actorName, lang), `${log.id}.actorName.${lang}`);
      assertNoArabic(localizeText(log.targetMemberName, lang), `${log.id}.targetMemberName.${lang}`);
      assertNoArabic(localizeText(log.details, lang), `${log.id}.details.${lang}`);
      assertNoArabic(localizeText(log.ipOrDevice, lang), `${log.id}.ipOrDevice.${lang}`);
    }
  }

  for (const h of VERIFIED_ALGERIAN_HOTLINES) {
    assertNoArabic(localizeText(h.verifiedSource, 'fr'), `${h.id}.verifiedSource.fr`);
    assertNoArabic(localizeText(h.lastUpdated, 'fr'), `${h.id}.lastUpdated.fr`);
    assertNoArabic(localizeText(h.verifiedSource, 'en'), `${h.id}.verifiedSource.en`);
    assertNoArabic(localizeText(h.lastUpdated, 'en'), `${h.id}.lastUpdated.en`);
    assertNoArabic(h.nameEn, `${h.id}.nameEn`);
    assertNoArabic(h.descriptionEn, `${h.id}.descriptionEn`);
  }
});

test('localizeText preserves Arabic in ar mode and translates dynamic phrases in fr and en modes', () => {
  const arSample = 'د. كريم بوجمعة';
  assert.equal(localizeText(arSample, 'ar'), arSample);
  assert.equal(localizeText(arSample, 'fr'), 'Dr Karim Boudjemaa');
  assert.equal(localizeText(arSample, 'en'), 'Dr Karim Boudjemaa');

  const dynamicMedFr = localizeText('بدء علاج جديد: Paracetamol 500mg', 'fr');
  assert.equal(dynamicMedFr, 'Nouveau traitement initié : Paracetamol 500mg');
  assertNoArabic(dynamicMedFr, 'dynamicMedFr');

  const dynamicMedEn = localizeText('بدء علاج جديد: Paracetamol 500mg', 'en');
  assert.equal(dynamicMedEn, 'New medication started: Paracetamol 500mg');
  assertNoArabic(dynamicMedEn, 'dynamicMedEn');

  const passStatus = getSharePassStatus('2026-11-13T10:00:00Z', new Date('2026-11-12T10:00:00Z'));
  assertNoArabic(localizeText(passStatus.detailsFr, 'fr'), 'sharePassStatus.detailsFr');
  assertNoArabic(passStatus.detailsEn, 'sharePassStatus.detailsEn');

  const child = INITIAL_FAMILY_MEMBERS.find((m) => m.id === 'fam_yacine')!;
  const perm = checkMemberAccessPermission('fam_amine', child);
  assertNoArabic(localizeText(perm.reasonFr, 'fr'), 'perm.reasonFr');
  assertNoArabic(perm.reasonEn, 'perm.reasonEn');
});

test('enum/category helpers return fluent French and English labels', () => {
  assert.equal(translateMedicationForm('tablet', 'fr'), 'Comprimés');
  assert.equal(translateMedicationForm('tablet', 'en'), 'Tablets');
  assert.equal(translateLabCategory('biochimie', 'fr'), 'Biochimie');
  assert.equal(translateLabCategory('biochimie', 'en'), 'Biochemistry');
  assert.equal(translateFlowIntensity('heavy', 'fr'), 'Abondante');
  assert.equal(translateFlowIntensity('heavy', 'en'), 'Heavy');
  assert.equal(translateShareSectionLabel('profile', 'fr'), 'Identité & Allergies');
  assert.equal(translateShareSectionLabel('profile', 'en'), 'Identity & Allergies');
});
