export type LightBgThemeId =
  | 'default'
  | 'ice_blue'
  | 'mint_soft'
  | 'warm_ivory'
  | 'blush_pearl'
  | 'lavender_mist'
  | 'sky_sage';

export interface LightBgPreset {
  id: LightBgThemeId;
  labelAr: string;
  labelFr: string;
  labelEn: string;
  descAr: string;
  descFr: string;
  descEn: string;
  appBgClass: string;
  swatchClass: string;
  hex: string;
}

export const LIGHT_BG_PRESETS: LightBgPreset[] = [
  {
    id: 'default',
    labelAr: 'الأبيض الناعم (الافتراضي)',
    labelFr: 'Blanc doux (Par défaut)',
    labelEn: 'Soft White (Default)',
    descAr: 'الخلفية القياسية النظيفة للتطبيق',
    descFr: 'Fond clair standard épuré',
    descEn: 'Clean standard light background',
    appBgClass: 'bg-slate-50',
    swatchClass: 'bg-slate-50',
    hex: '#f8fafc',
  },
  {
    id: 'ice_blue',
    labelAr: 'أزرق جليدي هادئ',
    labelFr: 'Bleu glacier apaisant',
    labelEn: 'Calm Ice Blue',
    descAr: 'نغمة طبية باردة مريحة للعين',
    descFr: 'Teinte clinique fraîche et reposante',
    descEn: 'Cool, eye-friendly clinical tone',
    appBgClass: 'bg-[#e8f2fc]',
    swatchClass: 'bg-[#e8f2fc]',
    hex: '#e8f2fc',
  },
  {
    id: 'mint_soft',
    labelAr: 'أخضر نعناعي باهت',
    labelFr: 'Vert menthe pastel',
    labelEn: 'Soft Pastel Mint',
    descAr: 'خلفية خضراء خافتة بنعومة طبية',
    descFr: 'Nuance végétale douce et sereine',
    descEn: 'Gentle and serene botanical tint',
    appBgClass: 'bg-[#e6f6ee]',
    swatchClass: 'bg-[#e6f6ee]',
    hex: '#e6f6ee',
  },
  {
    id: 'warm_ivory',
    labelAr: 'كريمي عاجي دافئ',
    labelFr: 'Ivoire chaleureux',
    labelEn: 'Warm Ivory',
    descAr: 'لون ورقي دافئ يقلل إجهاد القراءة',
    descFr: 'Fond papier doux réduisant la fatigue visuelle',
    descEn: 'Warm paper tone reducing eye strain',
    appBgClass: 'bg-[#fbf4e4]',
    swatchClass: 'bg-[#fbf4e4]',
    hex: '#fbf4e4',
  },
  {
    id: 'blush_pearl',
    labelAr: 'وردي لؤلؤي خافت',
    labelFr: 'Rose perle poudré',
    labelEn: 'Soft Blush Pearl',
    descAr: 'درجة وردية هادئة ولطيفة',
    descFr: 'Tonalité rosée claire et délicate',
    descEn: 'Light, delicate rose tint',
    appBgClass: 'bg-[#fbeaf0]',
    swatchClass: 'bg-[#fbeaf0]',
    hex: '#fbeaf0',
  },
  {
    id: 'lavender_mist',
    labelAr: 'خزامي ضبابي فاتح',
    labelFr: 'Lavande brumeuse',
    labelEn: 'Lavender Mist',
    descAr: 'لون بنفسجي فاتح هادئ ومتوازن',
    descFr: 'Pastel lavande doux et équilibré',
    descEn: 'Soft, balanced pastel lavender',
    appBgClass: 'bg-[#efeafd]',
    swatchClass: 'bg-[#efeafd]',
    hex: '#efeafd',
  },
  {
    id: 'sky_sage',
    labelAr: 'رمادي سماوي فاتح',
    labelFr: 'Gris brume bleuté',
    labelEn: 'Light Sky Slate',
    descAr: 'درجة محايدة ناعمة بوضوح عالٍ',
    descFr: 'Neutre doux à haute lisibilité',
    descEn: 'Soft neutral with crisp readability',
    appBgClass: 'bg-[#e9eef4]',
    swatchClass: 'bg-[#e9eef4]',
    hex: '#e9eef4',
  },
];

export const ALL_LIGHT_BG_CLASSES: string[] = LIGHT_BG_PRESETS.map((p) => p.appBgClass);

export function resolveLightBgPreset(id?: string | null): LightBgPreset {
  const found = LIGHT_BG_PRESETS.find((preset) => preset.id === id);
  return found ?? LIGHT_BG_PRESETS[0];
}
