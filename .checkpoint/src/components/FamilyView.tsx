import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Heart,
  Calendar,
  Phone,
  FileText,
  CheckCircle,
  AlertCircle,
  Baby,
  UserCheck,
  X,
} from 'lucide-react';
import { useTibbi } from '../context/TibbiContext';
import { FamilyMember, BloodGroup, FamilyRelationship } from '../types/tibbi';

export const FamilyView: React.FC = () => {
  const {
    language,
    familyMembers,
    activeMemberId,
    setActiveMemberId,
    addFamilyMember,
    setActiveTab,
  } = useTibbi();

  const isAr = language === 'ar';

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullNameAr: '',
    fullNameFr: '',
    relationship: 'child' as FamilyRelationship,
    relationshipLabelAr: 'ابن / ابنة',
    relationshipLabelFr: 'Enfant',
    gender: 'male' as 'male' | 'female',
    birthDate: '2020-01-01',
    bloodGroup: 'O+' as BloodGroup,
    nationalIdOrChifa: '',
    phone: '',
    allergies: '',
    chronicDiseases: '',
    surgeries: '',
    legalGuardian: 'أمين ومريم مزيان (رعاية مشتركة)',
    notes: '',
  });

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullNameAr.trim()) return;

    addFamilyMember({
      fullNameAr: formData.fullNameAr,
      fullNameFr: formData.fullNameFr || formData.fullNameAr,
      relationship: formData.relationship,
      relationshipLabelAr: formData.relationshipLabelAr,
      relationshipLabelFr: formData.relationshipLabelFr,
      gender: formData.gender,
      birthDate: formData.birthDate,
      bloodGroup: formData.bloodGroup,
      nationalIdOrChifa: formData.nationalIdOrChifa,
      phone: formData.phone,
      allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()) : [],
      chronicDiseases: formData.chronicDiseases ? formData.chronicDiseases.split(',').map((s) => s.trim()) : [],
      surgeries: formData.surgeries ? formData.surgeries.split(',').map((s) => s.trim()) : [],
      legalGuardian: formData.legalGuardian,
      notes: formData.notes,
    });

    setIsAddModalOpen(false);
    // Reset form
    setFormData({
      fullNameAr: '',
      fullNameFr: '',
      relationship: 'child',
      relationshipLabelAr: 'ابن / ابنة',
      relationshipLabelFr: 'Enfant',
      gender: 'male',
      birthDate: '2020-01-01',
      bloodGroup: 'O+',
      nationalIdOrChifa: '',
      phone: '',
      allergies: '',
      chronicDiseases: '',
      surgeries: '',
      legalGuardian: 'أمين ومريم مزيان',
      notes: '',
    });
  };

  const calculateAge = (birthDate: string): string => {
    const birth = new Date(birthDate);
    const now = new Date();
    const diffMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (diffMonths < 24) {
      return isAr ? `${diffMonths} شهراً` : `${diffMonths} mois`;
    }
    const years = Math.floor(diffMonths / 12);
    return isAr ? `${years} سنة` : `${years} ans`;
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-7 h-7 text-teal-600 dark:text-teal-400" />
            <span>{isAr ? 'إدارة الأسرة والملفات الصحية العائلية' : 'Gestion de la Famille & Dossiers'}</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? 'لكل فرد من أفراد الأسرة ملف صحي مستقل ومستمر طوال الحياة، مع إدارة الصلاحيات والوصاية القانونية.'
              : 'Dossier de santé continu et sécurisé pour chaque membre de la famille avec gestion des tuteurs.'}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold text-sm shadow-sm transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isAr ? '+ إضافة فرد جديد للأسرة' : '+ Ajouter un membre'}</span>
        </button>
      </div>

      {/* Family Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {familyMembers.map((member) => {
          const isActive = member.id === activeMemberId;
          const ageStr = calculateAge(member.birthDate);

          return (
            <div
              key={member.id}
              className={`rounded-2xl p-6 border transition-all ${
                isActive
                  ? 'bg-gradient-to-br from-teal-50/90 via-white to-emerald-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/40 border-teal-500 dark:border-teal-400 ring-2 ring-teal-500/20 shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black ${
                      isActive
                        ? 'bg-teal-700 dark:bg-teal-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {member.fullNameAr.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">
                        {isAr ? member.fullNameAr : member.fullNameFr}
                      </h3>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-md bg-teal-600 dark:bg-teal-500 text-white text-[11px] font-bold">
                          {isAr ? 'الملف النشط' : 'Actif'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {isAr ? member.relationshipLabelAr : member.relationshipLabelFr} • {ageStr} • {member.birthDate}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-900 dark:text-teal-300 border border-transparent dark:border-teal-800/60 font-mono font-black text-sm">
                    {member.bloodGroup}
                  </span>
                </div>
              </div>

              {/* Badges: Allergies, Chronics, Guardian */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5 text-xs">
                
                {/* Chronic conditions */}
                <div className="flex items-start gap-2">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold shrink-0">
                    {isAr ? 'الحالات المزمنة:' : 'Maladies chroniques:'}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {member.chronicDiseases.length > 0 ? (
                      member.chronicDiseases.map((cond, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 font-medium">
                          {cond}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">{isAr ? 'لا توجد' : 'Aucune'}</span>
                    )}
                  </div>
                </div>

                {/* Allergies */}
                <div className="flex items-start gap-2">
                  <span className="text-slate-500 dark:text-slate-400 font-semibold shrink-0">
                    {isAr ? 'الحساسية:' : 'Allergies:'}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {member.allergies.length > 0 ? (
                      member.allergies.map((allg, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-red-50 dark:bg-rose-950/50 text-red-700 dark:text-rose-300 border border-red-200 dark:border-rose-800/60 font-medium">
                          {allg}
                        </span>
                      ))
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500">{isAr ? 'لا توجد' : 'Aucune'}</span>
                    )}
                  </div>
                </div>

                {/* Legal Guardian / Custody info (as highlighted in prompt) */}
                {member.legalGuardian && (
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/70 p-2 rounded-lg border border-slate-100 dark:border-slate-700/60">
                    <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-teal-400 shrink-0" />
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{isAr ? 'الوصاية / المسؤول:' : 'Tuteur légal:'}</span>
                    <span className="text-slate-600 dark:text-slate-300 truncate">{member.legalGuardian}</span>
                  </div>
                )}

                {/* Chifa Card */}
                {member.nationalIdOrChifa && (
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                    {isAr ? 'بطاقة الشفاء: ' : 'N° Chifa: '}
                    {member.nationalIdOrChifa}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {!isActive ? (
                  <button
                    onClick={() => {
                      setActiveMemberId(member.id);
                      setActiveTab('dashboard');
                    }}
                    className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    {isAr ? 'التبديل إلى هذا الملف الصحي' : 'Basculer sur ce dossier'}
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-between text-xs text-teal-800 dark:text-teal-300 font-bold">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      {isAr ? 'الملف الحالي قيد الاستعراض' : 'Dossier en cours'}
                    </span>
                    <button
                      onClick={() => setActiveTab('timeline')}
                      className="text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
                    >
                      {isAr ? 'استعراض التاريخ الطبي ←' : 'Historique complet →'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Family Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 border border-transparent dark:border-slate-800">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span>{isAr ? 'إضافة فرد جديد للأسرة' : 'Nouveau membre de la famille'}</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'الاسم واللقب (بالعربية) *' : 'Nom complet (Arabe) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullNameAr}
                    onChange={(e) => setFormData({ ...formData, fullNameAr: e.target.value })}
                    placeholder="مثال: سارة مزيان"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'الاسم بالفرنسية' : 'Nom en Français'}
                  </label>
                  <input
                    type="text"
                    value={formData.fullNameFr}
                    onChange={(e) => setFormData({ ...formData, fullNameFr: e.target.value })}
                    placeholder="Ex: Sarah Meziane"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'صلة القرابة' : 'Lien familial'}
                  </label>
                  <select
                    value={formData.relationship}
                    onChange={(e) => {
                      const val = e.target.value as FamilyRelationship;
                      let labelAr = 'ابن / ابنة';
                      let labelFr = 'Enfant';
                      if (val === 'spouse') { labelAr = 'زوج / زوجة'; labelFr = 'Conjoint(e)'; }
                      if (val === 'parent') { labelAr = 'والد / والدة'; labelFr = 'Parent'; }
                      if (val === 'self') { labelAr = 'أنا'; labelFr = 'Moi'; }
                      setFormData({ ...formData, relationship: val, relationshipLabelAr: labelAr, relationshipLabelFr: labelFr });
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  >
                    <option value="child">{isAr ? 'ابن / ابنة' : 'Enfant'}</option>
                    <option value="spouse">{isAr ? 'زوج / زوجة' : 'Conjoint(e)'}</option>
                    <option value="parent">{isAr ? 'أب / أم' : 'Père / Mère'}</option>
                    <option value="other">{isAr ? 'قريب آخر / تحت الرعاية' : 'Autre proche'}</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'تاريخ الميلاد' : 'Date de naissance'}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'فصيلة الدم' : 'Groupe sanguin'}
                  </label>
                  <select
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value as BloodGroup })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 font-mono font-bold"
                  >
                    {['O+', 'A+', 'B+', 'AB+', 'O-', 'A-', 'B-', 'AB-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'رقم بطاقة الشفاء (اختياري)' : 'N° Carte Chifa'}
                  </label>
                  <input
                    type="text"
                    value={formData.nationalIdOrChifa}
                    onChange={(e) => setFormData({ ...formData, nationalIdOrChifa: e.target.value })}
                    placeholder="18 أرقام"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {isAr ? 'الوصي القانوني / المسؤول' : 'Tuteur / Responsable'}
                  </label>
                  <input
                    type="text"
                    value={formData.legalGuardian}
                    onChange={(e) => setFormData({ ...formData, legalGuardian: e.target.value })}
                    placeholder="مثال: الوالدان، أو الحضانة القانونية"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? 'الحساسية المعروفة (مفصولة بفواصل)' : 'Allergies connues (séparées par virgules)'}
                </label>
                <input
                  type="text"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="مثال: البنسلين، الفول السوداني..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {isAr ? 'الأمراض المزمنة (مفصولة بفواصل)' : 'Maladies chroniques'}
                </label>
                <input
                  type="text"
                  value={formData.chronicDiseases}
                  onChange={(e) => setFormData({ ...formData, chronicDiseases: e.target.value })}
                  placeholder="مثال: الربو، السكري، ضغط الدم..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-teal-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  {isAr ? 'إلغاء' : 'Annuler'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold shadow-md cursor-pointer"
                >
                  {isAr ? 'حفظ وإنشاء الملف الصحي' : 'Créer le dossier'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
