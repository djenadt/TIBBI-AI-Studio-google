import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Phone,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  Hospital,
  MapPin,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useTibbi } from '../context/TibbiContext';
import {
  maskIdentityNumber,
  VERIFIED_ALGERIAN_HOTLINES,
  WILAYA_HOSPITAL_URGENCES,
} from '../utils/securityAndSharing';

export const EmergencyModal: React.FC = () => {
  const {
    language,
    activeMember,
    activeMemberMedications,
    isEmergencyModalOpen,
    setIsEmergencyModalOpen,
    unmaskedIds,
    toggleMaskId,
  } = useTibbi();

  const isAr = language === 'ar';
  const [selectedWilaya, setSelectedWilaya] = useState<string>('16'); // 16 Alger by default

  // Escape key handler to close modal
  useEffect(() => {
    if (!isEmergencyModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsEmergencyModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEmergencyModalOpen, setIsEmergencyModalOpen]);

  // Lock body scroll when modal is open and restore on unmount/close
  useEffect(() => {
    if (isEmergencyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isEmergencyModalOpen]);

  if (!isEmergencyModalOpen) return null;

  const isChifaRevealed = Boolean(unmaskedIds[activeMember.id]);
  const maskedChifa = maskIdentityNumber(activeMember.nationalIdOrChifa, isChifaRevealed);
  const selectedHospital = WILAYA_HOSPITAL_URGENCES[selectedWilaya];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={() => setIsEmergencyModalOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border-4 border-red-500 transition-colors text-right"
        onClick={(e) => e.stopPropagation()}
        dir={isAr ? 'rtl' : 'ltr'}
      >
        {/* Urgent Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-4 sm:p-5 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 id="emergency-modal-title" className="text-base sm:text-lg font-black tracking-tight">
                {isAr ? 'بطاقة الطوارئ والإنقاذ السريع' : 'Fiche d’Urgence Médicale'}
              </h3>
              <span className="text-xs text-red-100 font-bold">
                {isAr ? 'بيانات حيوية فورية وأرقام الإسعاف الرسمية' : 'Données vitales immédiates & Urgences officielles'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEmergencyModalOpen(false)}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/20 cursor-pointer transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={isAr ? 'إغلاق بطاقة الطوارئ' : 'Fermer'}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content Container with ample padding */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs pb-10">
          
          {/* Identity & Blood Group */}
          <div className="bg-red-50 dark:bg-red-950/40 rounded-2xl p-4 border border-red-200 dark:border-red-900/60 flex items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold text-red-700 dark:text-red-300 block">
                {isAr ? 'صاحب البطاقة' : 'Identité du patient'}
              </span>
              <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                {isAr ? activeMember.fullNameAr : activeMember.fullNameFr}
              </h4>
              <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                {activeMember.birthDate} • {isAr ? activeMember.relationshipLabelAr : activeMember.relationshipLabelFr}
              </span>
              {activeMember.relationship === 'child' && (
                <div className="text-[11px] text-red-800 dark:text-red-300 font-semibold mt-0.5">
                  {isAr
                    ? `تحت وصاية الولي القانوني: ${activeMember.legalGuardian || 'أمين مزيان (الأب)'}`
                    : `Sous tutelle légale : ${activeMember.legalGuardian || 'Amine Meziane'}`}
                </div>
              )}
            </div>

            <div className="text-center bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl border border-red-200 dark:border-red-900/70 shadow-2xs shrink-0">
              <span className="text-[10px] text-red-600 dark:text-red-400 font-bold block">
                {isAr ? 'فصيلة الدم' : 'Groupe'}
              </span>
              <span className="text-2xl font-black font-mono text-red-700 dark:text-red-400 block">
                {activeMember.bloodGroup}
              </span>
            </div>
          </div>

          {/* Masked Chifa Card Box */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-bold">
                {isAr ? 'رقم بطاقة الشفاء / المعرّف الشخصي (محمي):' : 'N° Carte Chifa / Identifiant (protégé) :'}
              </span>
              <span className="font-mono font-bold text-sm text-slate-800 dark:text-slate-100">
                {maskedChifa}
              </span>
            </div>
            {activeMember.nationalIdOrChifa && (
              <button
                onClick={() => toggleMaskId(activeMember.id)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1 hover:bg-slate-100 cursor-pointer min-h-[36px]"
                title={isChifaRevealed ? (isAr ? 'إخفاء الرقم' : 'Masquer') : (isAr ? 'إظهار الرقم' : 'Afficher')}
              >
                {isChifaRevealed ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>{isAr ? 'إخفاء' : 'Masquer'}</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5 text-teal-600" />
                    <span>{isAr ? 'إظهار' : 'Afficher'}</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Known Allergies Warning Box */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 space-y-1">
            <span className="font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{isAr ? 'الحساسية المعروفة تجاه الأدوية والمواد:' : 'Allergies médicamenteuses majeures :'}</span>
            </span>
            <p className="text-amber-950 dark:text-amber-200 font-black text-sm">
              {activeMember.allergies.length > 0
                ? activeMember.allergies.join(' ، ')
                : (isAr ? 'لا توجد حساسية مسجلة' : 'Aucune allergie connue')}
            </p>
          </div>

          {/* Chronic Conditions & Surgeries */}
          <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              {isAr ? 'السوابق المرضية والحالات المزمنة:' : 'Antécédents & Pathologies :'}
            </span>
            <div className="text-slate-800 dark:text-slate-200 font-semibold space-y-0.5">
              {activeMember.chronicDiseases.length > 0 ? (
                activeMember.chronicDiseases.map((c, i) => <div key={i}>• {c}</div>)
              ) : (
                <span className="text-slate-400 dark:text-slate-500">{isAr ? 'لا توجد حالات مسجلة' : 'Aucune'}</span>
              )}
            </div>
          </div>

          {/* Current Critical Medications */}
          <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              {isAr ? 'الأدوية الحالية المستعملة:' : 'Médicaments réguliers :'}
            </span>
            <div className="space-y-1">
              {activeMemberMedications.filter((m) => m.status === 'active').length === 0 ? (
                <span className="text-slate-400 dark:text-slate-500">{isAr ? 'لا توجد أدوية حالية' : 'Aucun médicament'}</span>
              ) : (
                activeMemberMedications.filter((m) => m.status === 'active').map((m) => (
                  <div key={m.id} className="text-slate-800 dark:text-slate-200 font-medium flex items-center justify-between">
                    <span>💊 {m.name}</span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{m.dosage}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Emergency Direct Contact */}
          <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/70">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-emerald-900 dark:text-emerald-200 block text-xs">
                  {isAr ? 'جهة الاتصال عند الطوارئ:' : 'Contact d’urgence :'}
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                  {activeMember.relationship === 'child'
                    ? isAr
                      ? 'الولي: أمين مزيان (الأب)'
                      : 'Tuteur : Amine Meziane (Père)'
                    : isAr
                    ? 'هاتف الطوارئ المباشر'
                    : 'Ligne directe'}
                </span>
              </div>
            </div>
            <a
              href={`tel:${activeMember.phone || '+213550123456'}`}
              className="font-mono font-black text-emerald-800 dark:text-emerald-300 hover:underline text-xs bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-emerald-300 min-h-[36px] flex items-center"
            >
              {activeMember.phone || '+213 550 12 34 56'}
            </a>
          </div>

          {/* Official Algerian Emergency Hotlines with Verified Sources */}
          <div className="bg-slate-100 dark:bg-slate-800/70 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <span>🇩🇿</span>
                <span>{isAr ? 'أرقام الطوارئ الرسمية الموثقة في الجزائر:' : 'Numéros d’urgence officiels (Algérie) :'}</span>
              </span>
              <span className="text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-semibold">
                {isAr ? 'تحديث نوفمبر 2026' : 'Vérifié Nov 2026'}
              </span>
            </div>

            {/* Emergency Hotline Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs">
              
              {/* Protection Civile (14 / 1021) */}
              <a
                href="tel:14"
                className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 shadow-2xs flex flex-col justify-between min-h-[64px]"
              >
                <div>
                  <div className="font-mono text-base font-black">14 <span className="text-[10px] text-slate-400">/ 1021</span></div>
                  <div className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
                    {isAr ? 'الحماية المدنية (الإسعاف)' : 'Protection Civile (Secours)'}
                  </div>
                </div>
                <div className="text-[8px] text-slate-400 mt-1">الرقم الوطني الموحد للإسعاف</div>
              </a>

              {/* Police Nationale (17 / 1548) */}
              <a
                href="tel:17"
                className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 shadow-2xs flex flex-col justify-between min-h-[64px]"
              >
                <div>
                  <div className="font-mono text-base font-black">17 <span className="text-[10px] text-slate-400">/ 1548</span></div>
                  <div className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
                    {isAr ? 'الشرطة والأمن الوطني' : 'Police Nationale (DGSN)'}
                  </div>
                </div>
                <div className="text-[8px] text-slate-400 mt-1">النجدة الحضرية (و104 للأطفال)</div>
              </a>

              {/* Gendarmerie Nationale (1055) */}
              <a
                href="tel:1055"
                className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 shadow-2xs flex flex-col justify-between min-h-[64px]"
              >
                <div>
                  <div className="font-mono text-base font-black">1055</div>
                  <div className="text-[10px] font-bold text-slate-800 dark:text-slate-200">
                    {isAr ? 'الدرك الوطني' : 'Gendarmerie Nationale'}
                  </div>
                </div>
                <div className="text-[8px] text-slate-400 mt-1">الطرق السريعة والمناطق الريفية</div>
              </a>

            </div>

            {/* SAMU & Wilaya Hospital Urgences Notice */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                  <Hospital className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isAr ? 'مستعجلات المستشفيات الجامعية (حسب الولاية):' : 'Urgences Hospitalières (CHU par wilaya) :'}</span>
                </span>
                
                <select
                  value={selectedWilaya}
                  onChange={(e) => setSelectedWilaya(e.target.value)}
                  className="p-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-[11px] font-bold text-slate-800 dark:text-slate-100"
                >
                  <option value="16">16 - الجزائر (Mustapha CHU)</option>
                  <option value="31">31 - وهران (CHU Benzerdjeb)</option>
                  <option value="25">25 - قسنطينة (CHU Ibn Badis)</option>
                  <option value="19">19 - سطيف (CHU Saadna)</option>
                  <option value="23">23 - عنابة (CHU Ibn Rochd)</option>
                </select>
              </div>

              {selectedHospital ? (
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block text-xs">
                      {isAr ? selectedHospital.hospitalNameAr : selectedHospital.hospitalNameFr}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      📍 {isAr ? selectedHospital.addressAr : selectedHospital.addressFr}
                    </span>
                  </div>
                  <a
                    href={`tel:${selectedHospital.phone}`}
                    className="font-mono font-bold text-teal-700 dark:text-teal-400 hover:underline text-xs shrink-0"
                  >
                    {selectedHospital.phone}
                  </a>
                </div>
              ) : (
                <p className="text-[10px] text-slate-400">
                  {isAr ? 'لطلب الإسعاف في الولايات الأخرى، اتصل فوراً بالرقم الموحد للحماية المدنية 14.' : 'Pour les autres wilayas, composez directement le 14.'}
                </p>
              )}

              {/* Clarification about 115 not being a universal emergency line */}
              <div className="flex items-start gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                <Info className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <p>
                  {isAr
                    ? 'تنبيه: خدمة الإسعاف الطبي SAMU ليست رقماً وطنياً موحداً (رقم 115 كان مخصصاً لليقظة الصحية الوبائية بوزارة الصحة وليس خط نجدة لكافة الولايات). يُرجى الاتصال بالحماية المدنية (14) أو المستشفى الجامعي بالولاية.'
                    : 'Le 115 n’est pas un numéro d’urgence médical universel en Algérie. Privilégiez le 14 (Protection Civile) ou les urgences du CHU local.'}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Action Button Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-slate-400 font-medium">
            TIBBI Emergency Card DZ • 🇩🇿
          </span>
          <button
            onClick={() => setIsEmergencyModalOpen(false)}
            className="px-5 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-700 text-white font-bold text-xs cursor-pointer min-h-[44px]"
          >
            {isAr ? 'إغلاق البطاقة' : 'Fermer'}
          </button>
        </div>

      </div>
    </div>
  );
};
