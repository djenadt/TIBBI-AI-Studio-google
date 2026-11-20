import React from 'react';
import {
  Settings,
  Palette,
  Check,
  RotateCcw,
  Sun,
  ShieldCheck,
  Bell,
  Cloud,
  Share2,
} from 'lucide-react';
import { useTibbi } from '../context/TibbiContext';
import { LIGHT_BG_PRESETS, resolveLightBgPreset } from '../utils/appearanceSettings';
import { tr } from '../types/tibbi';

interface SettingsSectionProps {
  sectionId?: string;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  sectionId = 'app-settings-section',
}) => {
  const { language, theme, setTheme, lightBgTheme, setLightBgTheme } = useTibbi();
  const headingId = `${sectionId}-heading`;
  const activePreset = resolveLightBgPreset(lightBgTheme);

  return (
    <section
      id={sectionId}
      data-testid="family-settings-section"
      aria-labelledby={headingId}
      className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-100 dark:border-teal-800/60 shrink-0">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 id={headingId} className="text-lg font-black text-slate-900 dark:text-slate-100">
              {tr(language, 'الإعدادات', 'Paramètres', 'Settings')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {tr(
                language,
                'تخصيص مظهر التطبيق وخلفية الشاشة في الوضع النهاري (Light Mode).',
                'Personnalisation de l’apparence et de la couleur de fond en mode clair.',
                'Customize app appearance and Light Mode background colors.'
              )}
            </p>
          </div>
        </div>

        {lightBgTheme !== 'default' && (
          <button
            type="button"
            onClick={() => setLightBgTheme('default')}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{tr(language, 'إعادة للافتراضي', 'Réinitialiser', 'Reset to Default')}</span>
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-extrabold text-slate-800 dark:text-slate-200">
            <Palette className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>
              {tr(
                language,
                'لون خلفية التطبيق في الوضع النهاري (Light Mode)',
                'Couleur d’arrière-plan en Mode Clair',
                'Light Mode Background Color'
              )}
            </span>
          </div>
          <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
            {tr(
              language,
              `المحدد حالياً: ${activePreset.labelAr}`,
              `Sélectionné : ${activePreset.labelFr}`,
              `Selected: ${activePreset.labelEn}`
            )}
          </span>
        </div>

        {theme === 'dark' && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
            <div className="flex items-center gap-2 font-semibold">
              <Sun className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                {tr(
                  language,
                  'الوضع الليلي (Dark Mode) مفعّل حالياً. سيتم تطبيق لون الخلفية الفاتح عند العودة إلى الوضع النهاري.',
                  'Le mode sombre est activé. Le fond choisi s’appliquera dès le passage en mode clair.',
                  'Dark Mode is currently active. Your chosen background color will apply when switching to Light Mode.'
                )}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setTheme('light')}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 cursor-pointer transition-colors"
            >
              {tr(language, 'معاينة الوضع النهاري', 'Passer en mode clair', 'Preview Light Mode')}
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {LIGHT_BG_PRESETS.map((preset) => {
            const isSelected = lightBgTheme === preset.id;
            return (
              <button
                type="button"
                key={preset.id}
                aria-pressed={isSelected}
                data-testid={`light-bg-option-${preset.id}`}
                onClick={() => setLightBgTheme(preset.id)}
                className={`text-start p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? 'border-teal-600 dark:border-teal-400 bg-teal-50/70 dark:bg-teal-950/40 ring-2 ring-teal-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-teal-300 dark:hover:border-slate-600'
                }`}
              >
                <span
                  className={`w-9 h-9 rounded-xl border border-slate-300 dark:border-slate-600 shrink-0 flex items-center justify-center shadow-2xs ${preset.swatchClass}`}
                >
                  {isSelected && <Check className="w-4 h-4 text-teal-700 stroke-[3]" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-slate-900 dark:text-slate-100 leading-snug">
                    {tr(language, preset.labelAr, preset.labelFr, preset.labelEn)}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                    {tr(language, preset.descAr, preset.descFr, preset.descEn)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const TibbiHighlightsSection: React.FC = () => {
  const { language } = useTibbi();

  return (
    <section
      id="tibbi-highlights-section"
      data-testid="tibbi-highlights-section"
      className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors"
    >
      <div className="text-center max-w-xl mx-auto space-y-1">
        <div className="inline-block px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 text-xs font-bold border border-transparent dark:border-teal-800/50">
          {tr(language, 'أهم مميزات TIBBI', 'Vos principaux avantages', 'Key TIBBI Features')}
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">
          {tr(
            language,
            'منظومة صُممت لحماية وتنظيم صحة عائلتك',
            'Une plateforme conçue pour la santé de votre foyer',
            'A platform designed to protect & organize your family’s health'
          )}
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {tr(
              language,
              'خصوصيتك وأمان بياناتك أولويتنا',
              'Confidentialité et sécurité maximales',
              'Privacy & data security first'
            )}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {tr(
              language,
              'فصل تام للملفات الصحية، وتشفير محكم للبيانات والوثائق، والتحكم المطلق في الصلاحيات.',
              'Séparation étanche des dossiers, cryptage des données et contrôle d’accès rigoureux.',
              'Strict separation of family records, data protection, and full access-permission control.'
            )}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {tr(
              language,
              'تنبيهات وتذكيرات مخصصة',
              'Notifications et rappels personnalisés',
              'Personalized alerts & reminders'
            )}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {tr(
              language,
              'تذكيرات دقيقة بمواعيد تناول الأدوية، تجديد العلاجات، زيارات الأطباء، وتلقيحات الأطفال الدورية.',
              'Rappels réguliers de prises médicamenteuses, fin de traitements, consultations et vaccins.',
              'Timely reminders for medication schedules, refills, doctor visits, and pediatric vaccines.'
            )}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 flex items-center justify-center">
            <Cloud className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {tr(
              language,
              'الوصول إلى معلوماتك في كل الأوقات',
              'Accès à vos informations en toutes circonstances',
              'Access your records anytime'
            )}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {tr(
              language,
              'تاريخك الصحي محفوظ ومتاح في جيبك، عند السفر أو الطوارئ أو مراجعة أي عيادة طبية.',
              'Dossier accessible hors-ligne et synchronisé pour les voyages, urgences ou consultations.',
              'Your medical history is always in your pocket for travel, emergencies, or clinic visits.'
            )}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {tr(
              language,
              'مشاركة آمنة مع الأطباء',
              'Partage sécurisé avec vos médecins',
              'Secure sharing with doctors'
            )}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {tr(
              language,
              'إنشاء رموز QR وروابط مؤقتة محددة الصلاحية لمشاركة التحاليل والتقارير مع طبيبك بكل ثقة.',
              'Génération de QR codes et liens temporaires paramétrables pour consultation médicale rapide.',
              'Generate expiring QR codes and scoped links to safely share lab panels and reports.'
            )}
          </p>
        </div>
      </div>
    </section>
  );
};

export const SettingsView: React.FC = () => {
  return (
    <div className="space-y-6 pb-20">
      <SettingsSection sectionId="settings-view-section" />
      <TibbiHighlightsSection />
    </div>
  );
};
