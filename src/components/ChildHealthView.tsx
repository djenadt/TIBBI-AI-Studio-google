import React, { useState } from 'react';
import {
  Baby,
  ShieldCheck,
  Scale,
  Calendar,
  Plus,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  FileText,
  Activity,
  X,
} from 'lucide-react';
import { useTibbi } from '../context/TibbiContext';
import {
  ALGERIAN_PEV_SCHEDULE,
  getVaccineDueSummary,
} from '../utils/healthCalculators';
import { ChildGrowthEntry, tr } from '../types/tibbi';
import { localizeText } from '../utils/frTranslator';

export const ChildHealthView: React.FC = () => {
  const {
    language,
    activeMember,
    familyMembers,
    setActiveMemberId,
    activeMemberGrowth,
    completedVaccineIds,
    toggleVaccineCompleted,
    addChildGrowthEntry,
  } = useTibbi();

  const isAr = language === 'ar';

  // Find all children in family
  const children = familyMembers.filter((m) => m.relationship === 'child');
  const isCurrentAChild = activeMember.relationship === 'child';

  // Calculate child's age in months
  const birth = new Date(activeMember.birthDate);
  const now = new Date();
  const childAgeMonths = Math.max(
    0,
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  );

  const vaccineSummary = getVaccineDueSummary(childAgeMonths, completedVaccineIds);

  const latestGrowth = activeMemberGrowth[activeMemberGrowth.length - 1];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    ageMonths: childAgeMonths,
    weightKg: '',
    heightCm: '',
    headCircumferenceCm: '',
    pediatricianNotes: '',
  });

  const handleAddMeasurement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.weightKg || !form.heightCm) return;

    addChildGrowthEntry({
      patientId: activeMember.id,
      date: form.date,
      ageMonths: Number(form.ageMonths),
      weightKg: parseFloat(form.weightKg),
      heightCm: parseFloat(form.heightCm),
      headCircumferenceCm: form.headCircumferenceCm ? parseFloat(form.headCircumferenceCm) : undefined,
      pediatricianNotes: form.pediatricianNotes,
    });

    setIsModalOpen(false);
    setForm({
      date: new Date().toISOString().split('T')[0],
      ageMonths: childAgeMonths,
      weightKg: '',
      heightCm: '',
      headCircumferenceCm: '',
      pediatricianNotes: '',
    });
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Baby className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            <span>
              {tr(
                language,
                'صحة الأطفال والنمو والتلقيحات (PEV)',
                'Santé des Enfants, Croissance & Vaccins',
                'Child Health, Growth & Vaccinations (PEV)'
              )}
            </span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {tr(
              language,
              `الملف الصحي للطفل: ${activeMember.fullNameAr} - متابعة منحنيات الوزن والطول والجدول الوطني الجزائري للتلقيح.`,
              `Suivi pédiatrique de ${activeMember.fullNameFr} - Calendrier vaccinal algérien et courbes.`,
              `Pediatric follow-up for ${activeMember.fullNameFr} — Algerian vaccination schedule & growth charts.`
            )}
          </p>
        </div>

        {/* Children switcher if active member isn't a child or to switch between siblings */}
        {children.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 dark:text-slate-400 font-medium hidden sm:inline">
              {tr(language, 'أطفال العائلة:', 'Enfants :', 'Children:')}
            </span>
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setActiveMemberId(child.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  child.id === activeMember.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700'
                }`}
              >
                {isAr ? child.fullNameAr : child.fullNameFr}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Child Spotlight Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase">
            {tr(language, 'العمر المحسوب', 'Âge actuel', 'Current Age')}
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100">
            {childAgeMonths < 24
              ? tr(language, `${childAgeMonths} شهراً`, `${childAgeMonths} mois`, `${childAgeMonths} months`)
              : tr(
                  language,
                  `${Math.floor(childAgeMonths / 12)} سنوات`,
                  `${Math.floor(childAgeMonths / 12)} ans`,
                  `${Math.floor(childAgeMonths / 12)} yrs`
                )}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
            {tr(language, 'تاريخ الميلاد: ', 'Né(e) le : ', 'DOB: ')} {activeMember.birthDate}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase">
            {tr(language, 'آخر وزن مقاس', 'Dernier poids', 'Latest Weight')}
          </span>
          <div className="text-xl font-black font-mono text-emerald-700 dark:text-emerald-400">
            {latestGrowth?.weightKg ? `${latestGrowth.weightKg} kg` : '--'}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">
            {tr(language, 'نمو طبيعي ومتناسق', 'Bonne prise de poids', 'Healthy weight gain')}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase">
            {tr(language, 'آخر طول مقاس', 'Dernière taille', 'Latest Height')}
          </span>
          <div className="text-xl font-black font-mono text-slate-900 dark:text-slate-100">
            {latestGrowth?.heightCm ? `${latestGrowth.heightCm} cm` : '--'}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
            {latestGrowth?.headCircumferenceCm && (
              <span>
                {tr(
                  language,
                  `محيط الرأس: ${latestGrowth.headCircumferenceCm} cm`,
                  `Périmètre crânien : ${latestGrowth.headCircumferenceCm} cm`,
                  `Head circ.: ${latestGrowth.headCircumferenceCm} cm`
                )}
              </span>
            )}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1 transition-colors">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase">
            {tr(language, 'حالة التلقيحات', 'Vaccins réalisés', 'Vaccines Given')}
          </span>
          <div className="text-xl font-black font-mono text-teal-800 dark:text-teal-300">
            {completedVaccineIds.length} / {ALGERIAN_PEV_SCHEDULE.length}
          </div>
          <span className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold block">
            {tr(language, 'البرنامج الوطني الموسع PEV', 'Calendrier national', 'National PEV Schedule')}
          </span>
        </div>

      </div>

      {/* Algerian National Vaccination Calendar (PEV Algérie) */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span>
                {tr(
                  language,
                  'الرزنامة الوطنية للتلقيحات للأطفال (الجزائر PEV)',
                  'Calendrier National de Vaccination (Algérie PEV)',
                  'National Child Vaccination Schedule (Algeria PEV)'
                )}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {tr(
                language,
                'وفق توصيات وزارة الصحة الجزائرية - انقر على اللقاح لتسجيل إتمامه أو إضافته للتذكيرات.',
                'Conforme aux recommandations du Ministère de la Santé de la République Algérienne.',
                'Aligned with Algerian Ministry of Health guidelines — click a vaccine to mark it completed.'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold">
            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
              {completedVaccineIds.length} {tr(language, 'مكتمل', 'Effectués', 'Completed')}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          {ALGERIAN_PEV_SCHEDULE.map((vac) => {
            const isCompleted = completedVaccineIds.includes(vac.id);
            const isDueNow = vac.targetAgeMonths <= childAgeMonths && !isCompleted;

            return (
              <div
                key={vac.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80'
                    : isDueNow
                    ? 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/80 ring-1 ring-amber-200 dark:ring-amber-500/20'
                    : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                      {tr(language, vac.ageLabelAr, vac.ageLabelFr, vac.ageLabelEn)}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {tr(
                        language,
                        vac.name,
                        vac.nameFr || localizeText(vac.name, 'fr'),
                        vac.nameEn || localizeText(vac.name, 'en')
                      )}
                    </h4>
                    {isDueNow && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black animate-pulse">
                        {tr(language, 'مستحق الآن!', 'À faire !', 'Due Now!')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {tr(language, vac.descriptionAr, vac.descriptionFr, vac.descriptionEn)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleVaccineCompleted(vac.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isCompleted
                        ? 'bg-emerald-600 dark:bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-slate-700 dark:text-slate-200 hover:text-emerald-900 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isCompleted
                        ? tr(language, '✓ تم التلقيح', '✓ Effectué', '✓ Completed')
                        : tr(language, 'تسجيل كمنجز', 'Marquer fait', 'Mark Done')}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Child Growth Measurements Table */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/80">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {tr(
                language,
                'سجل قياسات النمو الدوري (الوزن والطول ومحيط الرأس)',
                'Historique des mesures de croissance',
                'Growth Measurements Log'
              )}
            </h3>
            <span className="text-xs text-slate-400">
              {activeMemberGrowth.length} {tr(language, 'فحوصات مسجلة', 'mesures', 'measurements')}
            </span>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{tr(language, '+ تسجيل قياس', '+ Nouvelle mesure', '+ New Measurement')}</span>
          </button>
        </div>

        {activeMemberGrowth.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            {tr(
              language,
              'لا توجد قياسات نمو مسجلة للطفل.',
              'Aucune mesure de croissance enregistrée.',
              'No growth measurements recorded yet.'
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className={`w-full ${isAr ? 'text-right' : 'text-left'} text-xs`}>
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3">{tr(language, 'العمر', 'Âge', 'Age')}</th>
                  <th className="p-3">{tr(language, 'التاريخ', 'Date', 'Date')}</th>
                  <th className="p-3">{tr(language, 'الوزن (kg)', 'Poids (kg)', 'Weight (kg)')}</th>
                  <th className="p-3">{tr(language, 'الطول (cm)', 'Taille (cm)', 'Height (cm)')}</th>
                  <th className="p-3">{tr(language, 'محيط الرأس (cm)', 'Périmètre crânien', 'Head Circ. (cm)')}</th>
                  <th className="p-3">{tr(language, 'ملاحظات طبيب الأطفال', 'Notes pédiatre', 'Pediatrician Notes')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {activeMemberGrowth.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/60 transition-colors">
                    <td className="p-3 font-bold text-slate-900 dark:text-slate-100">
                      {g.ageMonths === 0
                        ? tr(language, 'عند الولادة', 'Naissance', 'At Birth')
                        : tr(language, `${g.ageMonths} أشهر`, `${g.ageMonths} mois`, `${g.ageMonths} mos`)}
                    </td>
                    <td className="p-3 font-mono text-slate-500 dark:text-slate-400">{g.date}</td>
                    <td className="p-3 font-mono font-bold text-emerald-700 dark:text-emerald-400">{g.weightKg} kg</td>
                    <td className="p-3 font-mono text-slate-800 dark:text-slate-200">{g.heightCm} cm</td>
                    <td className="p-3 font-mono text-slate-800 dark:text-slate-200">{g.headCircumferenceCm ? `${g.headCircumferenceCm} cm` : '--'}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-300 max-w-xs">{g.pediatricianNotes ? localizeText(g.pediatricianNotes, language) : '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Add Growth Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 border border-transparent dark:border-slate-800">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Baby className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {tr(
                    language,
                    'تسجيل قياس نمو جديد للطفل',
                    'Enregistrer une mesure pédiatrique',
                    'Record Pediatric Growth Measurement'
                  )}
                </span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMeasurement} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'التاريخ', 'Date', 'Date')}
                  </label>
                  <input
                    type="date"
                    required
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'العمر بالشهور', 'Âge en mois', 'Age (months)')}
                  </label>
                  <input
                    type="number"
                    required
                    value={form.ageMonths}
                    onChange={(e) => setForm({ ...form, ageMonths: parseInt(e.target.value, 10) || 0 })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'الوزن (kg) *', 'Poids (kg) *', 'Weight (kg) *')}
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    placeholder={tr(language, 'مثال: 9.5', 'Ex : 9.5', 'e.g. 9.5')}
                    value={form.weightKg}
                    onChange={(e) => setForm({ ...form, weightKg: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'الطول (cm) *', 'Taille (cm) *', 'Height (cm) *')}
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    placeholder={tr(language, 'مثال: 75', 'Ex : 75', 'e.g. 75')}
                    value={form.heightCm}
                    onChange={(e) => setForm({ ...form, heightCm: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {tr(language, 'محيط الرأس (cm)', 'Périmètre crânien', 'Head Circ. (cm)')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder={tr(language, 'مثال: 45.2', 'Ex : 45.2', 'e.g. 45.2')}
                    value={form.headCircumferenceCm}
                    onChange={(e) => setForm({ ...form, headCircumferenceCm: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {tr(language, 'ملاحظات طبيب الأطفال وتطور المهارات', 'Observations du pédiatre', 'Pediatrician Observations')}
                </label>
                <textarea
                  rows={2}
                  value={form.pediatricianNotes}
                  onChange={(e) => setForm({ ...form, pediatricianNotes: e.target.value })}
                  placeholder={tr(
                    language,
                    'التفاعل، المشي، النطق، التغذية...',
                    'Éveil, marche, langage, alimentation...',
                    'Alertness, walking, speech, nutrition...'
                  )}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  {tr(language, 'إلغاء', 'Annuler', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md cursor-pointer"
                >
                  {tr(language, 'حفظ القياس', 'Enregistrer', 'Save Measurement')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
