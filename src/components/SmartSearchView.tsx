import React, { useState } from 'react';
import {
  Search,
  Pill,
  FlaskConical,
  FolderOpen,
  CalendarDays,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { useTibbi } from '../context/TibbiContext';

export const SmartSearchView: React.FC = () => {
  const {
    language,
    activeMember,
    medications,
    labTests,
    documents,
    appointments,
    timelineEvents,
    setActiveTab,
  } = useTibbi();

  const isAr = language === 'ar';
  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  const [query, setQuery] = useState('');

  const cleanQ = query.trim().toLowerCase();

  // Search through all entities
  const matchedMeds = medications.filter(
    (m) =>
      m.patientId === activeMember.id &&
      (m.name.toLowerCase().includes(cleanQ) ||
        m.condition.toLowerCase().includes(cleanQ) ||
        m.prescribingDoctor.toLowerCase().includes(cleanQ))
  );

  const matchedLabs = labTests.filter(
    (l) =>
      l.patientId === activeMember.id &&
      (l.testName.toLowerCase().includes(cleanQ) ||
        l.laboratory.toLowerCase().includes(cleanQ) ||
        (l.notes && l.notes.toLowerCase().includes(cleanQ)))
  );

  const matchedDocs = documents.filter(
    (d) =>
      d.patientId === activeMember.id &&
      (d.title.toLowerCase().includes(cleanQ) ||
        (d.doctorName && d.doctorName.toLowerCase().includes(cleanQ)) ||
        (d.facility && d.facility.toLowerCase().includes(cleanQ)) ||
        (d.notes && d.notes.toLowerCase().includes(cleanQ)) ||
        d.tags.some((t) => t.toLowerCase().includes(cleanQ)))
  );

  const matchedAppointments = appointments.filter(
    (a) =>
      a.patientId === activeMember.id &&
      (a.doctorName.toLowerCase().includes(cleanQ) ||
        a.specialty.toLowerCase().includes(cleanQ) ||
        a.clinicName.toLowerCase().includes(cleanQ) ||
        a.reason.toLowerCase().includes(cleanQ))
  );

  const matchedTimeline = timelineEvents.filter(
    (t) =>
      t.patientId === activeMember.id &&
      (t.title.toLowerCase().includes(cleanQ) ||
        t.description.toLowerCase().includes(cleanQ))
  );

  const totalMatches =
    cleanQ.length === 0
      ? 0
      : matchedMeds.length +
        matchedLabs.length +
        matchedDocs.length +
        matchedAppointments.length +
        matchedTimeline.length;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Search className="w-7 h-7 text-teal-600 dark:text-teal-400" />
          <span>{isAr ? 'محرك البحث الذكي في الذاكرة الصحية' : 'Recherche Intelligente dans le Dossier'}</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {isAr
            ? `ابحث في جميع وصفات، تحاليل، مواعيد وأدوية المريض: ${activeMember.fullNameAr} باللغتين العربية والفرنسية.`
            : `Recherchez instantanément parmi les ordonnances, bilans, examens et médecins de ${activeMember.fullNameFr}.`}
        </p>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            isAr
              ? 'ابحث باسم دواء (Coversyl...)، تحليل (سكر الدم، NFS...)، اسم طبيب (بوجمعة...) أو مخبر...'
              : 'Rechercher par médicament, analyse, médecin, laboratoire...'
          }
          className="w-full p-4 pr-12 pl-12 rounded-2xl border-2 border-teal-200 dark:border-slate-700 focus:border-teal-500 dark:focus:border-teal-400 focus:outline-hidden text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-xs font-medium"
        />
        <Search className={`w-5 h-5 text-teal-600 dark:text-teal-400 absolute top-4 ${isAr ? 'right-4' : 'left-4'}`} />
        {query && (
          <button
            onClick={() => setQuery('')}
            className={`text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs font-bold absolute top-4 ${isAr ? 'left-4' : 'right-4'} cursor-pointer`}
          >
            {isAr ? 'مسح' : 'Effacer'}
          </button>
        )}
      </div>

      {/* Suggested Quick Searches */}
      {!cleanQ && (
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 block">
            {isAr ? 'عمليات بحث مقترحة وسريعة:' : 'Recherches suggérées :'}
          </span>
          <div className="flex flex-wrap gap-2">
            {['Coversyl', 'ضغط الدم', 'Glycémie', 'كوليسترول', 'د. كريم بوجمعة', 'مخبر ابن رشد', 'أشعة صدى', 'تلقيح'].map((tag) => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-800 dark:hover:text-teal-300 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
              >
                🔍 {tag}
              </button>
            ))}
          </div>

          {/* Medical Acronyms & Terminology Guide (HTA, PEV, HbA1c, ECG, SAMU, PAI, IMC) */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                {isAr ? 'دليل الاختصارات والمصطلحات الطبية المتداولة (Glossaire Médical):' : 'Guide des sigles & abréviations médicales :'}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {[
                {
                  code: 'HTA',
                  ar: 'ارتفاع ضغط الدم الشرياني',
                  fr: 'Hypertension Artérielle',
                  desc: isAr ? 'قراءات ضغط الدم الانقباضي/الانبساطي فوق 140/90 مم زئبق.' : 'Pression artérielle supérieure à 140/90 mmHg.',
                },
                {
                  code: 'PEV',
                  ar: 'البرنامج الموسع للتلقيح',
                  fr: 'Programme Élargi de Vaccination',
                  desc: isAr ? 'الرزنامة الوطنية الرسمية لتلقيحات الرضع والأطفال بالجزائر.' : 'Calendrier vaccinal national officiel de l’Algérie.',
                },
                {
                  code: 'HbA1c',
                  ar: 'الهيموغلوبين السكري (التراكمي)',
                  fr: 'Hémoglobine Glyquée (Glycée)',
                  desc: isAr ? 'مؤشر مراقبة توازن السكر في الدم على مدى الأشهر الثلاثة الأخيرة.' : 'Reflet de l’équilibre glycémique sur 3 mois (cible < 6.5%).',
                },
                {
                  code: 'ECG',
                  ar: 'تخطيط كهربائية القلب',
                  fr: 'Électrocardiogramme',
                  desc: isAr ? 'تسجيل النشاط الكهربائي لنبضات القلب والبحث عن أي اضطراب أو نقص تروية.' : 'Tracé électrique analysant le rythme sinusal et l’ischémie.',
                },
                {
                  code: 'SAMU',
                  ar: 'مصلحة المساعدة الطبية المستعجلة',
                  fr: 'Service d’Aide Médicale Urgente',
                  desc: isAr ? 'فرق الإسعاف الطبي والإنعاش التابعة للمستشفيات الجامعية (تختلف أرقامها محلياً).' : 'Unités médicalisées mobiles hospitalières.',
                },
                {
                  code: 'PAI',
                  ar: 'مشروع الاستقبال الفردي المدرسي',
                  fr: 'Projet d’Accueil Individualisé',
                  desc: isAr ? 'وثيقة تنظيمية مدرسية لرعاية الأطفال المصابين بالربو أو الحساسية.' : 'Protocole médical d’accueil scolaire (asthme, allergies).',
                },
                {
                  code: 'IMC / BMI',
                  ar: 'مؤشر كتلة الجسم',
                  fr: 'Indice de Masse Corporelle',
                  desc: isAr ? 'الوزن (كغ) مقسوماً على مربع الطول (م)، والمعدل الطبيعي بين 18.5 و 24.9.' : 'Poids (kg) / Taille² (m). Zone normale : 18.5 à 24.9.',
                },
              ].map((item) => (
                <div
                  key={item.code}
                  onClick={() => setQuery(item.code)}
                  className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-500 cursor-pointer shadow-2xs transition-all text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-teal-700 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md">
                      {item.code}
                    </span>
                    <span className="text-[10px] text-slate-400">{isAr ? 'بحث سريع ↵' : 'Rechercher ↵'}</span>
                  </div>
                  <div className="font-bold text-slate-800 dark:text-slate-100">
                    {isAr ? item.ar : item.fr}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      {cleanQ && (
        <div className="space-y-5">
          <div className="text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-3 py-2 rounded-xl border border-teal-200 dark:border-teal-800/60">
            {isAr
              ? `تم العثور على ${totalMatches} نتائج مطابقة لـ "${query}"`
              : `${totalMatches} résultat(s) pour "${query}"`}
          </div>

          {totalMatches === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-dashed border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isAr ? 'لم يتم العثور على أي بيانات مطابقة لكلمة البحث.' : 'Aucun résultat trouvé.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Matched Medications */}
              {matchedMeds.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-extrabold text-sm text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>{isAr ? `الأدوية والعلاجات (${matchedMeds.length})` : `Médicaments (${matchedMeds.length})`}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedMeds.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setActiveTab('medications')}
                        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-400 transition-all cursor-pointer shadow-2xs"
                      >
                        <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{m.name}</div>
                        <div className="text-xs text-amber-800 dark:text-amber-300 font-semibold mt-0.5">{m.dosage}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">الطبيب: {m.prescribingDoctor}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Lab Tests */}
              {matchedLabs.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-extrabold text-sm text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <FlaskConical className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>{isAr ? `التحاليل والفحوصات (${matchedLabs.length})` : `Analyses (${matchedLabs.length})`}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedLabs.map((l) => (
                      <div
                        key={l.id}
                        onClick={() => setActiveTab('labs')}
                        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-400 transition-all cursor-pointer shadow-2xs flex justify-between items-center"
                      >
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{l.testName}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{l.date} • {l.laboratory}</div>
                        </div>
                        <div className="font-mono font-bold text-base text-blue-700 dark:text-blue-400">
                          {l.value} {l.unit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Documents */}
              {matchedDocs.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-extrabold text-sm text-teal-900 dark:text-teal-300 flex items-center gap-1.5">
                    <FolderOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>{isAr ? `الأرشيف والوثائق (${matchedDocs.length})` : `Documents (${matchedDocs.length})`}</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {matchedDocs.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => setActiveTab('archive')}
                        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-400 transition-all cursor-pointer shadow-2xs"
                      >
                        <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{d.title}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{d.doctorName || d.facility}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-1">{d.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      )}

    </div>
  );
};
