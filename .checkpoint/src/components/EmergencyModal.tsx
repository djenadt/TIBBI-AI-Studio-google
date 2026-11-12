import React from 'react';
import {
  ShieldAlert,
  Phone,
  AlertTriangle,
  Heart,
  Pill,
  X,
  User,
  Activity,
} from 'lucide-react';
import { useTibbi } from '../context/TibbiContext';

export const EmergencyModal: React.FC = () => {
  const {
    language,
    activeMember,
    activeMemberMedications,
    isEmergencyModalOpen,
    setIsEmergencyModalOpen,
  } = useTibbi();

  const isAr = language === 'ar';

  if (!isEmergencyModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border-4 border-red-500 transition-colors">
        
        {/* Urgent Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">
                {isAr ? 'بطاقة الطوارئ والإنقاذ السريع' : 'Fiche d’Urgence Médicale'}
              </h3>
              <span className="text-xs text-red-100 font-bold">
                {isAr ? 'بيانات طبية حيوية وفصيلة الدم' : 'Données vitales immédiates'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsEmergencyModalOpen(false)}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-xs">
          
          {/* Blood Group and Patient Name */}
          <div className="bg-red-50 dark:bg-red-950/40 rounded-2xl p-4 border border-red-200 dark:border-red-900/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-red-700 dark:text-red-300 block">
                {isAr ? 'صاحب البطاقة' : 'Identité'}
              </span>
              <h4 className="text-base font-black text-slate-900 dark:text-slate-100">
                {isAr ? activeMember.fullNameAr : activeMember.fullNameFr}
              </h4>
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                {activeMember.birthDate} • {isAr ? activeMember.relationshipLabelAr : activeMember.relationshipLabelFr}
              </span>
            </div>

            <div className="text-center bg-white dark:bg-slate-800 px-3.5 py-2 rounded-xl border border-red-200 dark:border-red-900/70 shadow-2xs">
              <span className="text-[10px] text-red-600 dark:text-red-400 font-bold block">{isAr ? 'فصيلة الدم' : 'Groupe'}</span>
              <span className="text-2xl font-black font-mono text-red-700 dark:text-red-400 block">
                {activeMember.bloodGroup}
              </span>
            </div>
          </div>

          {/* Known Allergies Warning */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 space-y-1">
            <span className="font-extrabold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{isAr ? 'الحساسية تجاه الأدوية والمواد:' : 'Allergies médicamenteuses majeures :'}</span>
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
            <div className="text-slate-800 dark:text-slate-200 font-semibold">
              {activeMember.chronicDiseases.length > 0 ? (
                activeMember.chronicDiseases.map((c, i) => <div key={i}>• {c}</div>)
              ) : (
                <span className="text-slate-400 dark:text-slate-500">{isAr ? 'لا توجد' : 'Aucune'}</span>
              )}
            </div>
          </div>

          {/* Current Critical Medications */}
          <div className="space-y-1.5 bg-slate-50 dark:bg-slate-800/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="font-bold text-slate-700 dark:text-slate-300 block">
              {isAr ? 'الأدوية الحالية المستعملة:' : 'Médicaments réguliers :'}
            </span>
            <div className="space-y-1">
              {activeMemberMedications.filter((m) => m.status === 'active').map((m) => (
                <div key={m.id} className="text-slate-800 dark:text-slate-200 font-medium flex items-center justify-between">
                  <span>💊 {m.name}</span>
                  <span className="text-slate-500 dark:text-slate-400 font-mono">{m.dosage}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chifa Card and Emergency Phone Contact */}
          <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800/70">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <div>
                <span className="font-bold text-emerald-900 dark:text-emerald-200 block text-xs">
                  {isAr ? 'جهة الاتصال عند الطوارئ:' : 'Contact d’urgence :'}
                </span>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
                  {activeMember.phone
                    ? isAr ? 'هاتف المعني المباشر' : 'Ligne directe'
                    : isAr ? 'ولي الأمر: أمين مزيان (الأب)' : 'Tuteur : Amine Meziane (Père)'}
                </span>
              </div>
            </div>
            <a
              href={`tel:${activeMember.phone || '+213550123456'}`}
              className="font-mono font-bold text-emerald-800 dark:text-emerald-300 hover:underline text-xs"
            >
              {activeMember.phone || '+213 550 12 34 56'}
            </a>
          </div>

          {/* Algerian Emergency Hotlines */}
          <div className="bg-slate-100 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              {isAr ? 'أرقام الطوارئ الوطنية (الجزائر 🇩🇿):' : 'Numéros d’urgence nationaux (Algérie 🇩🇿) :'}
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-bold">
              <a
                href="tel:14"
                className="bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
              >
                <div className="font-mono text-sm">14</div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400">{isAr ? 'الحماية المدنية' : 'Prot. Civile'}</div>
              </a>
              <a
                href="tel:115"
                className="bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50"
              >
                <div className="font-mono text-sm">115</div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400">{isAr ? 'الإسعاف SAMU' : 'SAMU'}</div>
              </a>
              <a
                href="tel:17"
                className="bg-white dark:bg-slate-800 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50"
              >
                <div className="font-mono text-sm">17 / 1548</div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400">{isAr ? 'الشرطة' : 'Police'}</div>
              </a>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
            TIBBI Emergency Card DZ
          </span>
          <button
            onClick={() => setIsEmergencyModalOpen(false)}
            className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-800 hover:bg-slate-900 dark:hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
          >
            {isAr ? 'إغلاق البطاقة' : 'Fermer'}
          </button>
        </div>

      </div>
    </div>
  );
};
