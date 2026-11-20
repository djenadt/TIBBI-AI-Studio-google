import { Language, tr } from '../types/tibbi';
import { translateTextEn } from './enTranslator';

const ARABIC_CHAR_REGEX = /[\u0600-\u06FF]/;

export const FR_EXACT_MAP: Record<string, string> = {
  // === Family Members & Guardians ===
  'أمين مزيان': 'Amine Meziane',
  'مريم بلحاج': 'Meriem Belhadj',
  'ياسين مزيان': 'Yacine Meziane',
  'إيناس مزيان': 'Ines Meziane',
  'أمين': 'Amine',
  'مريم': 'Meriem',
  'ياسين': 'Yacine',
  'إيناس': 'Ines',
  'لا توجد حساسية معروفة': 'Aucune allergie connue',
  'حساسية من مادة السلفا (Sulfamides)': 'Allergie aux sulfamides',
  'حساسية البنسلين (Allergie Pénicilline)': 'Allergie à la pénicilline',
  'ارتفاع ضغط الدم الخفيف (HTA modérée)': 'Hypertension artérielle légère (HTA modérée)',
  'ربو تحسسي خفيف موسمي (Asthme allergique)': 'Asthme allergique saisonnier léger',
  'استئصال الزائدة الدودية (Appendicectomie 2012)': 'Appendicectomie (2012)',
  'أمين مزيان (الوصي القانوني الأول)': 'Amine Meziane (Tuteur légal principal)',
  'مريم بلحاج (وصية مشتركة)': 'Meriem Belhadj (Co-tutrice)',
  'أمين مزيان ومريم بلحاج': 'Amine Meziane & Meriem Belhadj',
  'متابعة دورية لضغط الدم ونسبة الكولسترول مرتين في السنة.':
    'Suivi régulier de la tension artérielle et du bilan lipidique deux fois par an.',
  'حمل صحي - متابعة شهرية مع طبيبة التوليد د. صارة بن شيخ.':
    'Grossesse normale – Suivi mensuel avec Dr Sara Bencheikh (gynécologue-obstétricienne).',
  'تلميذ في السنة الثانية ابتدائي، لقاحات الطفولة كاملة.':
    'Élève en 2e année primaire, vaccinations infantiles à jour.',
  'متابعة جدول التلقيحات الجزائري الوطني PEV ومنحنى نمو الرضيع.':
    'Suivi du calendrier vaccinal national (PEV) et de la courbe de croissance.',
  'أمين مزيان (الأب)': 'Amine Meziane (Père)',
  'أمين مزيان (الولي الشرعي والقانوني)': 'Amine Meziane (Tuteur légal)',
  'أمين مزيان (الولي وصاحب الحساب)': 'Amine Meziane (Tuteur et titulaire du compte)',
  'أمين مزيان (الولي القانوني)': 'Amine Meziane (Tuteur légal)',
  'أمين مزيان (صاحب الحساب)': 'Amine Meziane (Titulaire du compte)',
  'أمين مزيان (صاحب الحساب والولي)': 'Amine Meziane (Titulaire et tuteur)',
  'أمين مزيان (صاحب الملف)': 'Amine Meziane (Titulaire du dossier)',
  'أمين مزيان (رب الأسرة)': 'Amine Meziane (Chef de famille)',
  'مريم بلحاج (الأم / المعنية)': 'Meriem Belhadj (Mère / Titulaire)',
  'فرد من الأسرة': 'Membre de la famille',
  'المريض': 'Patient',

  // === Doctors & Specialties ===
  'د. كريم بوجمعة': 'Dr Karim Boudjemaa',
  'د. كريم بوجمعة - أخصائي أمراض القلب': 'Dr Karim Boudjemaa - Cardiologue',
  'د. سمير شريف': 'Dr Samir Cherif',
  'د. صارة بن شيخ': 'Dr Sara Bencheikh',
  'د. حفيظة لعريبي': 'Dr Hafida Laribi',
  'د. كمال بلحاج': 'Dr Kamal Belhadj',
  'د. فريد بن عيسى': 'Dr Farid Benaissa',
  'د. فريد بن عيسى (طبيب بيولوجي)': 'Dr Farid Benaissa (Médecin biologiste)',
  'د. طارق مراد': 'Dr Tarek Mourad',
  'أ.د. مسعود بوعلام': 'Pr Messaoud Boualam',
  'د. ليلى مزوز (بيولوجية)': 'Dr Leila Mezouz (Biologiste)',
  'د. إلياس عمراني': 'Dr Ilyes Amrani',
  'د. نبيلة تواتي': 'Dr Nabila Touati',
  'أ.د. رشيد زبيري': 'Pr Rachid Zoubiri',
  'د. نبيلة تواتي وطبيبة الصحة المدرسية د. حليمة قدور':
    'Dr Nabila Touati & Dr Halima Kaddour (Médecine scolaire)',
  'د. مهدي سليماني': 'Dr Mehdi Slimani',
  'د. يوسف شندرلي': 'Dr Youcef Chenderli',
  'د. ياسمين قادري': 'Dr Yasmine Kadri',
  'المركز الصحي البلدي - مصلحة حماية الأمومة والطفولة (PMI)':
    'Centre de santé communal - Service PMI',
  'طبيب معالج': 'Médecin traitant',
  'طبيب استشاري': 'Médecin consultant',
  'أمراض القلب والشرايين (Cardiologie)': 'Cardiologie et maladies vasculaires',
  'أمراض القلب والشرايين': 'Cardiologie',
  'طب عام': 'Médecine générale',
  'طب عام وأمراض باطنية (Médecine Générale)': 'Médecine générale et interne',
  'جراحة المسالك البولية': 'Urologie',
  'أمراض النساء والتوليد (Gynécologie-Obstétrique)': 'Gynécologie-Obstétrique',
  'أمراض النساء والتوليد (Gynécologie)': 'Gynécologie-Obstétrique',
  'أمراض النساء والتوليد': 'Gynécologie-Obstétrique',
  'طب الأطفال (Pédiatrie)': 'Pédiatrie',
  'طب الأطفال': 'Pédiatrie',
  'طب الأطفال وحديثي الولادة (Pédiatrie)': 'Pédiatrie et néonatologie',
  'البيولوجيا الطبية والتحاليل المخبرية': 'Biologie médicale et analyses',
  'بيولوجيا طبية (Biologie Médicale)': 'Biologie médicale',
  'الأشعة والتصوير الطبي (Radiologie)': 'Radiologie et imagerie médicale',
  'الأشعة والتصوير الطبي': 'Radiologie et imagerie médicale',
  'أشعة وتصوير طبي (Radiologie)': 'Radiologie et imagerie médicale',
  'الجراحة العامة وجراحة الجهاز الهضمي': 'Chirurgie générale et digestive',
  'الطب العام وطب الرياضة': 'Médecine générale et du sport',
  'التحاليل الطبية والبيولوجيا الجزيئية': 'Analyses médicales et biologie moléculaire',
  'جراحة وطب الأسنان (Chirurgie Dentaire)': 'Chirurgie dentaire',
  'أمراض الصدر والحساسية لدى الأطفال (Pneumo-Allergologie Pédiatrique)':
    'Pneumo-allergologie pédiatrique',
  'المناعة والحساسية السريرية (Immunologie & Allergologie)': 'Immunologie et allergologie clinique',
  'الصحة المدرسية والوقاية للأطفال': 'Santé scolaire et prévention pédiatrique',
  'طب وجراحة العيون (Ophtalmologie)': 'Ophtalmologie',
  'الصحة الوقائية وطب الأطفال': 'Santé préventive et pédiatrie',
  'أشعة الأطفال وتصوير حديثي الولادة': 'Radiologie pédiatrique et néonatale',

  // === Facilities, Labs & Clinics ===
  'مخبر ابن رشد للتحاليل الطبية - الجزائر العاصمة': "Laboratoire d'analyses Ibn Rochd - Alger",
  'مخبر ابن رشد للتحاليل الطبية': "Laboratoire d'analyses Ibn Rochd",
  'مخبر الأمل - سطيف': 'Laboratoire El Amel - Sétif',
  'مخبر النور للتحاليل الطبية - القبة': 'Laboratoire Ennour - Kouba',
  'مخبر التحاليل': "Laboratoire d'analyses médicales",
  'عيادة ابن سينا لأمراض القلب - الجزائر': 'Clinique cardiologique Ibn Sina - Alger',
  'عيادة ابن سينا لأمراض القلب': 'Clinique cardiologique Ibn Sina',
  'عيادة ابن سينا - نهج ديدوش مراد، الجزائر العاصمة': 'Clinique Ibn Sina - Rue Didouche Mourad, Alger',
  '14 شارع ديدوش مراد، الطابق 2، الجزائر': '14 Rue Didouche Mourad, 2e étage, Alger',
  'مركز التصوير الطبي ابن خلدون - باب الواد': "Centre d'imagerie médicale Ibn Khaldoun - Bab El Oued",
  'مركز التصوير الطبي ابن خلدون': "Centre d'imagerie médicale Ibn Khaldoun",
  'العيادة الجراحية الأبيار - الجزائر': 'Clinique chirurgicale El Biar - Alger',
  'عيادة الصحة العامة - حيدرة': 'Clinique de santé publique - Hydra',
  'عيادة الأمل لأمراض النساء والتوليد - الجزائر': 'Clinique El Amel de gynécologie-obstétrique - Alger',
  'عيادة الأمل لأمراض النساء والتوليد': 'Clinique El Amel de gynécologie-obstétrique',
  'عيادة الأمل للأمومة والتوليد': 'Clinique de maternité et d’obstétrique El Amel',
  'حي القبة، مقابل مستشفى بشير منتوري، الجزائر': 'Kouba, en face de l’hôpital Bachir Mentouri, Alger',
  'عيادة النجمة لطب وجراحة الأسنان - القبة': 'Clinique dentaire Ennedjma - Kouba',
  'عيادة ابن الهيثم التخصصية للأطفال - الجزائر': 'Clinique pédiatrique spécialisée Ibn El Haitham - Alger',
  'معهد باستور الجزائر - مصلحة الحساسية': "Institut Pasteur d'Algérie - Service d'allergologie",
  'وحدة الكشف والمتابعة المدرسية (UDS) - مدرسة ابن خلدون الابتدائية':
    'Unité de dépistage scolaire (UDS) - École primaire Ibn Khaldoun',
  'مركز النور التخصصي لجراحة العيون - الجزائر': 'Centre ophtalmologique Ennour - Alger',
  'العيادة متعددة الخدمات الشهيد سي الحواس - الجزائر': 'Polyclinique Chahid Si El Haouès - Alger',
  'مركز طب الأطفال النموذجي - بئر مراد رايس': 'Centre pédiatrique pilote - Bir Mourad Raïs',
  'مركز طب الأطفال النموذجي': 'Centre pédiatrique pilote',
  'مصلحة حديثي الولادة - مستشفى مصطفى باشا الجامعي': 'Service de néonatologie - CHU Mustapha Pacha',
  'مصلحة الولادة والأمومة - مستشفى مصطفى باشا / بارني':
    'Service de maternité - CHU Mustapha Pacha / Parnet',
  'مركز السلام للتصوير الطبي والأشعة - وهران': "Centre d'imagerie médicale Essalam - Oran",
  'عيادة الرحمة الطبية - سطيف': 'Clinique médicale Errahma - Sétif',

  // === Medications ===
  'قرص واحد يومياً': '1 comprimé par jour',
  'كبسولة واحدة مع وجبة الغداء': '1 gélule au déjeuner',
  'كبسولة واحدة مع الغداء': '1 gélule au déjeuner',
  'كبسولة صباحاً ومساءً': '1 gélule matin et soir',
  'كبسولة واحدة يومياً': '1 gélule par jour',
  'كبسولة واحدة صباحاً': '1 gélule le matin',
  'قرص واحد ظهراً': '1 comprimé à midi',
  'بختان عند ظهور نوبة السعال أو ضيق التنفس': '2 bouffées en cas de toux ou de gêne respiratoire',
  'أمبولة شرب واحدة كل 6 أشهر': '1 ampoule buvable tous les 6 mois',
  'مرة واحدة صباحاً': '1 fois par jour le matin',
  'مرة واحدة يومياً': '1 fois par jour',
  'مرتان يومياً لمدة شهر': '2 fois par jour pendant 1 mois',
  'مرة واحدة بعد الإفطار': '1 fois par jour après le petit-déjeuner',
  'مرة واحدة ظهراً': '1 fois par jour à midi',
  'عند اللزوم فقط': 'Si besoin uniquement',
  'جرعة دورية حسب جدول طبيب الأطفال': 'Dose périodique selon calendrier pédiatrique',
  'ارتفاع ضغط الدم (Hypertension)': 'Hypertension artérielle (HTA)',
  'دعم صحة القلب وتوازن الدهون': 'Soutien cardiovasculaire et équilibre lipidique',
  'علاج وقائي دوري': 'Traitement préventif périodique',
  'مكملات الحمل (فيتامينات، حمض الفوليك، يود وأوميغا 3)':
    'Supplémentation grossesse (vitamines, acide folique, iode et oméga-3)',
  'الوقاية من فقر الدم وعوز الحديد أثناء الحمل': "Prévention de l'anémie et de la carence martiale",
  'نوبات الربو التحسسي الخفيف': "Crises d'asthme allergique léger",
  'الوقاية من الكساح ودعم نمو العظام والأسنان': 'Prévention du rachitisme et croissance osseuse',
  'يؤخذ صباحاً على الريق قبل الفطور مع كأس ماء': "À prendre le matin à jeun avec un grand verre d'eau",
  'مع الطعام': 'Au cours du repas',
  'بعد الأكل': 'Après le repas',
  'وسط وجبة الإفطار لتجنب الغثيان': 'Au milieu du petit-déjeuner pour éviter les nausées',
  'تجنب شرب الشاي أو القهوة مباشرة بعد تناول القرص':
    'Éviter le thé ou le café juste après la prise',
  "استعمال غرفة الاستنشاق (Chambre d'inhalation) للأطفال":
    "Utiliser avec une chambre d'inhalation pédiatrique",
  'تُخلط مع قليل من الحليب أو عصير طبيعي': 'À mélanger dans un peu de lait ou de jus naturel',
  'قرص واحد يومياً صباحاً': '1 comprimé par jour le matin',
  'كبسولة واحدة ظهراً مع وجبة الغداء': '1 gélule à midi avec le déjeuner',
  'قرص واحد يومياً في منتصف النهار': '1 comprimé par jour en milieu de journée',
  'بختان عند اللزوم بواسطة غرفة الاستنشاق': "2 bouffées si besoin via chambre d'inhalation",
  'ملعقة قياس 5 مل يومياً قبل النوم': '1 cuillère-mesure (5 ml) le soir au coucher',
  'محقنة مدرجة حسب وزن الرضيع (11 كغ) كل 6 ساعات عند اللزوم':
    'Dose-poids (11 kg) à la pipette toutes les 6h si besoin',
  'أمبولة واحدة صالحة للشرب في ملعقة ماء صباحاً': '1 ampoule buvable dans une cuillère d’eau le matin',
  '6 أشهر': '6 mois',
  '3 أشهر': '3 mois',
  '30 يوماً': '30 jours',
  '7 أيام': '7 jours',
  '5 أيام': '5 jours',
  'طوال فترة الحمل': 'Pendant toute la grossesse',
  'عند اللزوم': 'Si besoin',
  'عند حدوث نوبة أو قبل الرياضة': "En cas de crise ou avant l'effort",
  'جرعة وحيدة سنوية': 'Dose unique annuelle',
  'حسب الوصفة': 'Selon prescription',
  'مرتين يومياً': '2 fois par jour',
  'قرص واحد مرتين يومياً': '1 comprimé 2 fois par jour',
  'قرص واحد عند الحاجة (أقصى 3 أقراص يومياً)': '1 comprimé si besoin (max 3/jour)',
  'ملعقة كبيرة 3 مرات يومياً': '1 cuillère à soupe 3 fois par jour',
  'في بداية الوجبات مع كوب ماء كبير': "En début de repas avec un grand verre d'eau",
  'بفارق 6 ساعات على الأقل بين الجرعات': 'Espacer les prises d’au moins 6 heures',
  'لعلاج التهاب الحلق والبلعوم': 'Pour traiter la pharyngite et les maux de gorge',

  // === Lab Tests ===
  'نسبة السكر في الدم على الريق (Glycémie à jeun)': 'Glycémie à jeun',
  'نسبة السكر في الدم (Glycémie à jeun)': 'Glycémie à jeun',
  'الكوليسترول الكلي (Cholestérol Total)': 'Cholestérol Total',
  'الكوليسترول الضار (LDL Cholestérol)': 'LDL-Cholestérol',
  'تصفية الكرياتينين (Créatinine Sanguine)': 'Créatinine Sanguine',
  'كرياتينين الدم (Créatinine)': 'Créatinine Sanguine',
  'الهيموغلوبين السكري (HbA1c)': 'Hémoglobine glyquée (HbA1c)',
  'الهيموغلوبين والتعداد الدموي (NFS / Hémoglobine)': 'NFS / Hémoglobine',
  'مخزون الحديد (Ferritine Sérique)': 'Ferritine Sérique',
  'اختبار داء المقوسات (Sérologie Toxoplasmose IgG/IgM)': 'Sérologie Toxoplasmose IgG/IgM',
  'الدهون الثلاثية (Triglycérides)': 'Triglycérides',
  'قيمة أولية مرتفعة قليلاً، تم البدء ببرنامج ضبط التغذية وإنقاص الوزن.':
    'Valeur initiale légèrement élevée ; mise en place d’un suivi diététique et pondéral.',
  'تحسن ملحوظ بعد تعديل وجبات العشاء وتقليل السكريات السريعة.':
    'Amélioration notable après ajustement des dîners et réduction des sucres rapides.',
  'استقرار ممتاز في النطاق الطبيعي السوي.': 'Excellente stabilisation dans les normes.',
  'مستوى منضبط مع ممارسة المشي المنتظم.': 'Niveau maîtrisé grâce à la marche régulière.',
  'تحليل دوري سنوي، النتيجة طبيعية ومستقرة تماماً.':
    'Bilan annuel de contrôle ; résultat normal et parfaitement stable.',
  'ارتفاع شحوم الدم، توجيه لحمية البحر المتوسط وإضافة أوميغا 3.':
    'Dyslipidémie modérée ; régime méditerranéen et supplémentation en oméga-3.',
  'استجابة أولية إيجابية، انخفاض تدريجي.': 'Première réponse positive avec baisse progressive.',
  'مواصلة الالتزام بحمية زيت الزيتون والأسماك.':
    'Poursuite du régime riche en huile d’olive et poissons gras.',
  'مرتفع قليلاً، يُنصح بمواصلة حمية البحر المتوسط وممارسة المشي اليومي.':
    'Légèrement élevé ; maintenir le régime méditerranéen et la marche quotidienne.',
  'مرتفع فوق الهدف الوعائي، مراقبة مستمرة.':
    'Au-dessus de la cible cardiovasculaire ; surveillance continue.',
  'انخفاض مشجع نحو الهدف.': 'Baisse encourageante vers la cible thérapeutique.',
  'أعلى قليلاً من الهدف المطلوب لمريض الضغط، يحتاج متابعة بعد 3 أشهر.':
    'Légèrement supérieur à la cible chez un patient hypertendu ; contrôle à 3 mois.',
  'وظائف كلى سليمة وطبيعية قبل بدء علاج خافض الضغط.':
    'Fonction rénale normale avant instauration du traitement antihypertenseur.',
  'وظائف كلى ممتازة.': 'Excellente fonction rénale.',
  'وظائف كلى ممتازة وترشيح كبيبي سليم.': 'Fonction rénale optimale avec filtration glomérulaire normale.',
  'معدل سكر تراكمي في مرحلة ما قبل السكري المبكرة.': 'HbA1c en zone de prédiabète débutant.',
  'تحسن ممتاز وعودة إلى المعدل الطبيعي التام.': 'Excellente amélioration avec retour dans la norme.',
  'معدل سكر تراكمي مثالي ومستقر لمدة 3 أشهر سابقة.':
    'HbA1c optimale et stable sur les 3 derniers mois.',
  'تحليل بداية الحمل (الأسبوع 6)، تعداد دموي طبيعي وسليم.':
    'Bilan de début de grossesse (6 SA) ; numération sanguine normale.',
  'متابعة الثلث الأول، الهيموغلوبين جيد ومستقر.': 'Suivi du 1er trimestre ; hémoglobine stable.',
  'تحليل الثلث الثاني للحمل، لا يوجد فقر دم ملحوظ مع تمدد حجم البلازما الطبيعي.':
    'Bilan du 2e trimestre ; absence d’anémie notable avec hémodilution physiologique.',
  'مخزون حديد أولي ممتاز قبل بدء الحمل النشط.': 'Réserve martiale initiale excellente.',
  'بداية استهلاك الجنين للحديد، وصف دواء تارديفيرون B9.':
    'Mobilisation fœtale du fer ; prescription de Tardyferon B9.',
  'طبيعي مع الاستمرار في حبوب تارديفيرون لتفادي فقر دم الثلث الثالث.':
    'Normal sous Tardyferon en prévention de l’anémie du 3e trimestre.',
  'سلبي (Séronégative) - يُشترط غسل الخضار جيداً وطهي اللحوم بصورة تامة وإعادة الفحص شهرياً.':
    'Séronégative : laver soigneusement les crudités, bien cuire les viandes et contrôler mensuellement.',
  'ارتفاع طفيف': 'Légère élévation',
  'فوق المعدل المستهدف': 'Au-dessus de la cible',
  'سلبي (غياب المناعة)': 'Négatif (non immunisée)',
  'إيجابي (مناعة محصنة)': 'Positif (immunisée)',
  'مرتفع قليلاً عن المعدل الطبيعي': 'Légèrement supérieur à la norme',
  'مرتفع يحتاج حمية ومتابعة': 'Élevé, nécessite un suivi hygiéno-diététique',
  'طبيعي': 'Normal',
  'وظائف كلوية طبيعية': 'Fonction rénale normale',

  // === Vitals Notes ===
  'قياس صباحي بعد أخذ حبة الضغط بنصف ساعة - ضغط مستقر.':
    'Mesure matinale 30 min après la prise du traitement — tension stabilisée.',
  'قياس مسائي بعد يوم عمل هادئ.': 'Mesure vespérale au repos après une journée calme.',
  'ارتفاع طفيف بسبب الإرهاق والسفر.': 'Légère élévation réactionnelle liée à la fatigue et au voyage.',
  'متابعة شهرية مع دواء كوفرسيل.': 'Contrôle mensuel régulier sous Coversyl (Périndopril).',
  'استجابة جيدة مع ممارسة رياضة المشي.': 'Bonne réponse thérapeutique associée à la marche.',
  'بداية خطة تعديل النظام الغذائي وتخفيف الملح.': 'Début du rééquilibrage alimentaire hyposodé.',
  'فحص دوري أولي قبل تعديل جرعة علاج الضغط.': 'Bilan initial avant ajustement posologique.',
  'زيارة التوليد الشهرية، ضغط دم سوي وحجم بطن مناسب للأسبوع 24.':
    'Visite prénatale mensuelle (24 SA) : tension normale et hauteur utérine conforme.',
  'متابعة الثلث الثاني للحمل (الأسبوع 18).': 'Suivi du 2e trimestre de grossesse (18 SA).',
  'تطور نمو الجنين سليم ووزن الأم منتظم.': 'Croissance fœtale harmonieuse et prise pondérale régulière.',
  'نهاية الثلث الأول، علامات حيوية ممتازة.': 'Fin du 1er trimestre : constantes vitales optimales.',
  'فحص دوري عمر 18 شهراً عند د. لعريبي.': 'Visite pédiatrique des 18 mois avec Dr Laribi.',

  // === Archive Documents ===
  'وصفة علاج ضغط الدم الدوري (Ordonnance HTA)': 'Ordonnance traitement antihypertenseur (HTA)',
  'تحليل شامل للدم والدهون والكلى (Bilan Biologique Complet)': 'Bilan biologique complet (Sang, Lipides & Reins)',
  'تخطيط كهربائية القلب القياسي (ECG 12 Dérivations de Repos)': 'ECG standard 12 dérivations au repos',
  'تصوير الصدر بالأشعة السينية (Téléthorax Face)': 'Radiographie thoracique de face (Téléthorax)',
  'تقرير التدخل الجراحي لاستئصال الزائدة (Compte-rendu Opératoire)':
    'Compte-rendu opératoire : Appendicectomie',
  "شهادة الكفاءة والقدرة البدنية لممارسة الرياضة (Certificat Médical d’Aptitude)":
    "Certificat médical d'aptitude sportive",
  'تقرير فحص بالصدى الصوتي للحمل - الأسبوع 22 (Échographie Morphologique T2)':
    'Échographie morphologique obstétricale T2 (22 SA)',
  'التحاليل المصلية والمخبرية لمتابعة الحمل (Bilan Sérologique & Prénatal)':
    'Bilan sérologique et prénatal complet',
  'وصفة المكملات الغذائية والحديد للثلث الثاني (Ordonnance Grossesse T2)':
    'Ordonnance fer et suppléments grossesse (T2)',
  'تقرير الاستشارة التوليدية الشهرية - الشهر السادس (Suivi Obstétrical T2)':
    'Compte-rendu de suivi obstétrical (6e mois)',
  'فحص صحة الفم والأسنان للأم الحامل (Examen Bucco-Dentaire Préventif)':
    'Examen bucco-dentaire préventif prénatal',
  'وصفة علاج الربو التحسسي وموسّع الشعب (Ordonnance Asthme & Allergie)':
    'Ordonnance asthme allergique et bronchodilatateur',
  'تقرير الفحص الجلدي للحساسية واختبارات الوخز (Prick-Tests Allergologiques)':
    'Compte-rendu des prick-tests allergologiques',
  "مشروع الاستقبال الفردي المدرسي (Projet d’Accueil Individualisé - PAI Scolaire)":
    "Projet d'Accueil Individualisé (PAI Scolaire)",
  'فحص فسيولوجيا البصر وقياس حدة الرؤية (Bilan Ophtalmologique Pédiatrique)':
    'Bilan ophtalmologique pédiatrique',
  'أشعة الجيوب الأنفية والوجه (Radiographie des Sinus de la Face)':
    'Radiographie des sinus de la face',
  'الدفتر الصحي وسجل التلقيحات الوطني (Carnet de Santé & PEV Algérie)':
    'Carnet de santé et vaccinations (PEV Algérie)',
  'تقرير تقييم النمو والتطور النفسي والحركي (Bilan de Développement 18 Mois)':
    'Bilan de développement psychomoteur (18 mois)',
  'وصفة بزوغ الأسنان وفيتامين د الوقائي (Ordonnance Pédiatrique Dents & Vitamine D)':
    'Ordonnance pédiatrique : poussée dentaire & vitamine D',
  'الصدى الصوتي عبر اليافوخ لحديثي الولادة (Échographie Transfontanellaire - ETF)':
    'Échographie transfontanellaire néonatale (ETF)',
  'تحليل بيولوجي شامل (Bilan Biologique Sanguin)': 'Bilan biologique sanguin complet',
  'تقرير فحص بالصدى الصوتي (Échographie Abdominale)': "Compte-rendu d'échographie abdominale",
  'وصفة طبية - استشارة عامة (Ordonnance Médicale)': 'Ordonnance médicale - Consultation générale',

  // Conclusions, recommendations & notes of documents
  'تثبيت ضغط الدم الشرياني حول 125/82 مم زئبق مع تحمل ممتاز للعلاج الدوائي.':
    'Stabilisation tensionnelle autour de 125/82 mmHg avec excellente tolérance du traitement.',
  'تناول قرص كوفرسيل 5 ملغ صباحاً على الريق، الاستمرار في تقليل ملح الطعام، والمتابعة الدورية كل 6 أشهر.':
    'Prendre Coversyl 5 mg le matin à jeun, maintenir le régime hyposodé et contrôler tous les 6 mois.',
  'تجديد سنوي مع إجراء تحليل دوري لوظائف الكلى والكوليسترول.':
    'Renouvellement annuel avec contrôle biologique de la fonction rénale et du bilan lipidique.',
  'وظائف كلوية ممتازة (Creatinine 8.8 mg/L)، سكر تراكمي مثالي (5.4%)، مع ارتفاع طفيف في الكوليسترول الضار LDL (1.52 g/L).':
    'Excellente fonction rénale (Créatinine 8,8 mg/L), HbA1c optimale (5,4 %), légère élévation du LDL-Cholestérol (1,52 g/L).',
  'تعزيز الألياف والنشاط البدني الهوائي (30 دقيقة مشي يومياً)، والالتزام بمكمل الأوميغا 3.':
    'Augmenter les apports en fibres, pratiquer 30 min de marche quotidienne et poursuivre l’oméga-3.',
  'مؤشرات وظائف الكلى طبيعية جداً تؤكد سلامة استخدام مثبطات الإنزيم المحول للأنجيوتنسين (ACEI).':
    'Paramètres rénaux normaux confirmant la bonne tolérance des inhibiteurs de l’enzyme de conversion (IEC).',
  'إيقاع جيبي منتظم بسرعة 68 ن/د، محاور وموجات طبيعية، عدم وجود علامات تضخم في البطين الأيسر أو إقفار عضلي.':
    'Rythme sinusal régulier à 68 bpm, axe et ondes normaux, sans hypertrophie ventriculaire gauche ni ischémie.',
  'لا يتطلب أي فحص إجهاد حالياً، إعادة التخطيط بعد سنة للمتابعة الوقائية.':
    'Pas d’épreuve d’effort requise actuellement ; contrôle ECG préventif dans 1 an.',
  'حقول رئوية صافية خالية من أي كثافة مشبوهة، الحجاب الحاجز ذو حركة سوية، المؤشر القلبي الصدري طبيعي (< 0.50).':
    'Champs pulmonaires clairs sans foyer suspect, coupoles diaphragmatiques normales, index cardiothoracique normal (< 0,50).',
  'فحص مرجعي سليم، لا يتطلب أي إجراء إضافي.':
    'Examen de référence normal, aucun bilan complémentaire nécessaire.',
  'استئصال الزائدة الدودية الالتهابية عبر الجراحة بالمنظار (Cœlioscopie) بنجاح تام وبدون أي مضاعفات داخل أو بعد الجراحة.':
    'Appendicectomie par cœlioscopie réalisée avec succès, sans complication per- ou postopératoire.',
  'ملف جراحي مستقر ومكتمل، شفاء تام لجدار البطن.':
    'Dossier chirurgical clos et stable, cicatrisation pariétale complète.',
  'عدم وجود أي مانع سريري أو قلبي وعائي لممارسة رياضة الجري والمشاركة في المسابقات الرياضية.':
    'Absence de contre-indication clinique ou cardiovasculaire à la course à pied en compétition.',
  'المحافظة على الترطيب الجيد والإحماء التدريجي ومراقبة النبض أثناء المجهود البدني المكثف.':
    'Maintenir une bonne hydratation, un échauffement progressif et surveiller la fréquence cardiaque à l’effort.',
  'شهادة صالحة لمدة سنة للمشاركة في سباق الجزائر العاصمة لنصف الماراثون.':
    'Certificat valable 1 an pour le semi-marathon d’Alger.',
  'حمل أحادي متطور بانسجام تام مع عمر الحمل (22 أسبوعاً + 3 أيام). تشريح جنيني مكتمل وطبيعي دون أي تشوهات ظاهرة.':
    'Grossesse monofœtale évolutive concordante avec le terme (22 SA + 3 j). Morphologie fœtale normale sans malformation décelable.',
  'الاستمرار في المكملات الغذائية، وإجراء فحص الصدى للثلث الثالث في الأسبوع 32.':
    'Poursuivre la supplémentation et programmer l’échographie du 3e trimestre à 32 SA.',
  'نمو الجنين وحركته ومعدل ضربات القلب طبيعية، المشيمة ذات توضع خلفي مرتفع سليم.':
    'Croissance, vitalité et rythme cardiaque fœtaux normaux ; placenta postérieur haut inséré.',
  'مناعة مؤكدة ضد الحصبة الألمانية (Rubéole IgG +++)، سلبية المقوسات (Toxoplasmose Séronégative) تستوجب حيطة غذائية صارمة.':
    'Immunité rubéolique acquise (IgG +++), sérologie toxoplasmose négative imposant des précautions alimentaires strictes.',
  'طهي اللحوم جيداً وغسل الخضار والفواكه وإعادة تحليل التوكسوبلازموز شهرياً حتى موعد الولادة.':
    'Bien cuire les viandes, laver fruits et légumes et renouveler la sérologie toxoplasmose chaque mois jusqu’à l’accouchement.',
  'تنبيه حساس: حساسية مفرطة مسجلة لمشتقات السلفاميد، يحظر تماماً وصف أي مضاد حيوي من عائلة Sulfamides.':
    'Alerte critique : allergie avérée aux sulfamides — contre-indication formelle.',
  'دعم مخزون الحديد والوقاية من فقر الدم الناجم عن التمدد الحجمي البلازمي للجنين.':
    'Soutien des réserves en fer et prévention de l’anémie gestationnelle.',
  'كبسولة Gestarelle صباحاً مع الإفطار، وقرص Tardyferon B9 ظهراً مع كوب عصير برتقال لتعزيز امتصاص الحديد وتجنب الشاي مباشرة.':
    '1 gélule de Gestarelle le matin et 1 comprimé de Tardyferon B9 à midi (à distance du thé).',
  'استجابة جيدة مع مؤشر خضاب دموي مستقر عند 12.1 غ/دسل.':
    'Bonne réponse biologique avec hémoglobine stable à 12,1 g/dL.',
  'حمل هادئ ومستقر، ارتفاع الرحم 24 سم مطابق لسن الحمل، حركة جنينية نشطة، ضغط دم الأم مثالي عند 115/70.':
    'Grossesse évolutive calme, hauteur utérine à 24 cm conforme au terme, mouvements actifs perçus, TA maternelle à 115/70.',
  'فحص سكر الحمل (HGPO 75g) خلال الأسبوعين القادمين، وموعد الفحص القادم في بداية الشهر السابع.':
    'Dépistage du diabète gestationnel (HGPO 75 g) sous 15 jours et prochaine visite au début du 7e mois.',
  'حالة لثوية وسنية سليمة، تم إجراء جلسة تنظيف وترسيب كلسي خفيف (Détartrage doux) للوقاية من التهاب اللثة الحملي.':
    'État bucco-dentaire sain ; détartrage doux préventif de la gingivite gravidique.',
  'تفريش الأسنان 3 مرات يومياً بمعجون غني بالفلورايد، وتجنب أي تصوير إشعاعي سني غير ضروري.':
    'Brossage 3 fois par jour au dentifrice fluoré et éviction de toute radiographie non indispensable.',
  'ربو متقطع خفيف مسيطر عليه جيداً، مع نوبات سعال مرتبطة بتغير الفصول وحبوب الطلع أو الغبار.':
    'Asthme intermittent léger bien contrôlé avec toux saisonnière aux pollens et poussières.',
  'استخدام بخاخ Ventoline 100µg (بختين عبر غرفة الاستنشاق Babyhaler عند السعال أو ضيق التنفس)، وإعطاء شراب Aérius 5ml مساءً لمدة شهر في موسم الخريف.':
    'Ventoline 100 µg (2 bouffées via Babyhaler si toux/dyspnée) et sirop Aérius 5 ml le soir pendant 1 mois à l’automne.',
  'تنبيه مشدد: ياسين يعاني من حساسية مؤكدة ضد البنسلين ومشتقاته (Allergie Pénicilline).':
    'Alerte majeure : allergie confirmée de Yacine à la pénicilline et ses dérivés.',
  'إيجابية واضحة لعث الغبار المنزلي (Dermatophagoides pteronyssinus ++++)، وتأكيد التحسس المفرط للبنسلين. سلبية تجاه وبر القطط والفول السوداني.':
    'Positivité franche aux acariens (Dermatophagoides pteronyssinus ++++) et allergie à la pénicilline confirmée ; négatif pour poils de chat et arachide.',
  'تغطية الفراش والوسائد بأغطية مضادة لعث الغبار، تهوية الغرفة يومياً، واستبعاد تام لجميع مضادات البنسلين والأموكسيسيلين من وصفاته.':
    'Housses anti-acariens, aération quotidienne et éviction absolue des pénicillines et de l’amoxicilline.',
  'ترخيص رسمي بحفظ بخاخ الفنتولين وغرفة الاستنشاق لدى الإدارة المدرسية ومعلم القسم، مع بروتوكول تدبير الأزمات الطارئة والسماح بالتربية البدنية.':
    'Autorisation de détention de la Ventoline et chambre d’inhalation à l’école avec protocole d’urgence et aptitude au sport.',
  'إعطاء بختين من الفنتولين 15 دقيقة قبل حصص التربية البدنية، والاتصال الفوري بالأولياء في حال عدم استقرار التنفس.':
    'Administrer 2 bouffées de Ventoline 15 min avant l’EPS et contacter immédiatement les parents en cas de gêne persistante.',
  'نسخة مودعة لدى مديرة المدرسة، طبيبة الوحدة الصحية، ومعلم السنة الثانية ابتدائي.':
    'Exemplaire déposé auprès de la direction, du médecin UDS et de l’enseignant de 2e année.',
  'حدة بصر ممتازة 10/10 في كلتا العينين بدون تصحيح، رؤية ثنائية متناسقة، قاع العين طبيعي والقرنية سليمة تماماً.':
    'Acuité visuelle excellente 10/10 bilatérale sans correction, vision binoculaire et fond d’œil normaux.',
  'لا حاجة لنظارات طبية، تحديد وقت الشاشات والهواتف بحد أقصى ساعة يومياً مع إضاءة مناسبة أثناء القراءة.':
    'Pas de correction optique nécessaire ; limiter les écrans à 1 h/jour avec bon éclairage.',
  'شفاء تام من التهاب الجيوب الفكية السابق، شفافية جيبية طبيعية وتراجع الاحتقان بعد العلاج الموضعي.':
    'Guérison complète de la sinusite maxillaire antérieure, transparence sinusienne normale.',
  'الاستمرار في غسيل الأنف بمحلول مياه البحر الملحية في الصباح وعند النوم.':
    'Poursuivre le lavage nasal au sérum physiologique marin matin et soir.',
  'البرنامج الموسع للتلقيحات (PEV) مستوفى بالكامل ومحدث بانتظام: BCG + HepB0 (الولادة)، Pentavalent 1-2-3 + Polio + ROR1 + Pneumo.':
    'Programme Élargi de Vaccination (PEV) complet et à jour : BCG + HepB0, Pentavalent 1-2-3 + Polio + ROR 1 + Pneumo.',
  'التطعيم القادم المقرر: الجرعة التذكيرية للقاح الحصبة والحصبة الألمانية (ROR 2) والرباعي التذكيري عند بلوغ 18 شهراً.':
    'Prochain vaccin prévu à 18 mois : rappel ROR 2 + rappel tétravalent.',
  'دفتر صحي سليم، تفاعلات لقاحية خفيفة فقط مع استجابة مناعية ممتازة.':
    'Carnet vaccinal conforme, réactions post-vaccinales minimes et bonne réponse immunitaire.',
  'تطور نفسي حركي ممتاز: مشي مستقل متوازن، اكتساب 15 كلمة واضحة، تفاعل اجتماعي مرح، نمو بدني متوازن على خط المتوسط OMS (وزن 11.2 كغ، طول 82 سم، محيط رأس 47 سم).':
    'Développement psychomoteur excellent : marche acquise, ~15 mots, courbe staturo-pondérale OMS harmonieuse (11,2 kg, 82 cm, PC 47 cm).',
  'مواصلة التغذية المتنوعة الغنية بالبروتين والخضار، الفطام التدريجي، ومشاركة الألعاب الحركية التفاعلية.':
    'Poursuivre une alimentation diversifiée équilibrée et les jeux d’éveil psychomoteur.',
  'تخفيف آلام بزوغ الأضراس اللبنية الأولى مع تأمين الجرعة الوقائية العظمية السنوية من فيتامين د.':
    'Soulagement de la poussée des premières molaires lactéales et prophylaxie annuelle par vitamine D.',
  'شراب دوليبران بجرعة وزن الطفلة (حقنة القياس عند الألم أو ارتفاع الحرارة فوق 38.5)، وجرعة الفيتامين د3 السنوية.':
    'Doliprane sirop dose-poids (si douleur ou fièvre > 38,5 °C) et dose annuelle de vitamine D3.',
  'فحص صدى عبر اليافوخ سليم تماماً: بنية الدماغ والبطينات المخية ذات حجم وشكل متناسق، عدم وجود أي نزيف أو نقص تروية أو تشوه ولادي.':
    'ETF strictement normale : parenchyme cérébral et ventricules symétriques sans hémorragie ni anomalie.',
  'فحص دوري أولي سليم لا يستدعي أي إعادة مراقبة.':
    'Examen néonatal initial normal ne nécessitant aucun contrôle ultérieur.',

  // Tags
  'ضغط الدم': 'Tension artérielle',
  'قلب': 'Cardiologie',
  'دواء دوري': 'Traitement chronique',
  'تحليل دم': 'Bilan sanguin',
  'سكر صائم': 'Glycémie à jeun',
  'كوليسترول': 'Cholestérol',
  'كرياتينين': 'Créatinine',
  'تخطيط قلب': 'ECG',
  'نبض جيبي': 'Rythme sinusal',
  'شرايين': 'Artères',
  'أشعة سينية': 'Radiographie',
  'صدر': 'Thorax',
  'رئتين': 'Poumons',
  'عملية جراحية': 'Chirurgie',
  'استئصال زائدة': 'Appendicectomie',
  'جراحة بالمنظار': 'Cœlioscopie',
  'جراحة سابقة': 'Antécédent chirurgical',
  'شهادة طبية': 'Certificat médical',
  'رياضة': 'Sport',
  'لياقة بدنية': 'Aptitude physique',
  'سباق نصف الماراثون': 'Semi-marathon',
  'حمل': 'Grossesse',
  'أشعة صدى': 'Échographie',
  'تشريح الجنين': 'Morphologie fœtale',
  'الثلث الثاني': '2e trimestre',
  'مورفولوجي': 'Morphologique',
  'تحاليل حمل': 'Bilan grossesse',
  'داء المقوسات': 'Toxoplasmose',
  'الحصبة الألمانية': 'Rubéole',
  'فصيلة دم': 'Groupe sanguin',
  'سكر الحمل': 'Diabète gestationnel',
  'وصفة طبية': 'Ordonnance',
  'حديد': 'Fer',
  'حمض الفوليك': 'Acide folique',
  'مكملات': 'Suppléments',
  'استشارة توليدية': 'Suivi obstétrical',
  'ارتفاع الرحم': 'Hauteur utérine',
  'نبض الجنين': 'Rythme fœtal',
  'أسنان': 'Dentaire',
  'حمل وقائي': 'Prévention grossesse',
  'صحة الفم': 'Hygiène bucco-dentaire',
  'تنظيف لثة': 'Détartrage',
  'ربو أطفال': 'Asthme pédiatrique',
  'حساسية': 'Allergie',
  'فنتولين': 'Ventoline',
  'بخاخ': 'Inhalateur',
  'غرفة استنشاق': "Chambre d'inhalation",
  'اختبار حساسية': 'Test allergologique',
  'باستور': 'Institut Pasteur',
  'عث الغبار': 'Acariens',
  'بنسلين': 'Pénicilline',
  'جلدية': 'Dermatologie',
  'صحة مدرسية': 'Santé scolaire',
  'ترخيص دواء': 'Autorisation traitement',
  'مدرسة ابتدائية': 'École primaire',
  'عيون': 'Ophtalmologie',
  'رؤية': 'Vision',
  'فحص بصري': 'Bilan visuel',
  'حدة بصر': 'Acuité visuelle',
  'جيوب أنفية': 'Sinus',
  'بلوندو': 'Blondeau',
  'تنفس علوي': 'Voies aériennes',
  'تلقيحات': 'Vaccinations',
  'طفولة': 'Pédiatrie',
  'دفتر صحي': 'Carnet de santé',
  'وقاية وطنية': 'Prévention nationale',
  'نمو أطفال': 'Croissance',
  'تطور حركي': 'Développement moteur',
  'نطق': 'Langage',
  'منحنى الوزن': 'Courbe pondérale',
  'محيط الرأس': 'Périmètre crânien',
  'طب أطفال': 'Pédiatrie',
  'أسنان اللبن': 'Dents de lait',
  'فيتامين د': 'Vitamine D',
  'مسكن ألم': 'Antalgique',
  'حرارة': 'Fièvre',
  'حديثي الولادة': 'Néonatologie',
  'دماغ الرضيع': 'Cerveau nourrisson',
  'يافوخ': 'Fontanelle',
  'سلامة المخ': 'Intégrité cérébrale',

  // === Appointments ===
  'مراجعة دورية لنتائج التحاليل وتعديل جرعة دواء الضغط إذا لزم الأمر.':
    'Revue périodique du bilan biologique et réajustement éventuel du traitement antihypertenseur.',
  'إحضار نتائج التحاليل المخبرية الأخيرة ودفتر قياسات الضغط اليومي.':
    'Apporter les derniers résultats biologiques et le carnet d’automesure tensionnelle.',
  'فحص متابعة الحمل الشهرية - الأسبوع 26.': 'Consultation mensuelle de suivi de grossesse — 26 SA.',
  'إجراء قياس ضغط الدم، وزن الأم، وسماع نبضات قلب الجنين.':
    'Prise de tension, pesée maternelle et auscultation du rythme cardiaque fœtal.',
  'تطعيم تذكيري وتفقد الوزن ومحيط الرأس وتطور المشي والتعبير اللغوي.':
    'Rappel vaccinal et contrôle du poids, périmètre crânien, marche et langage.',
  'إحضار الدفتر الصحي الأزرق.': 'Apporter le carnet de santé.',

  // === Timeline ===
  'إجراء تحاليل دورية للدم والدهون': 'Bilan biologique sanguin et lipidique périodique',
  'تحليل السكر والكولسترول ووظائف الكلى بمخبر ابن رشد.':
    'Contrôle glycémie, cholestérol et fonction rénale au laboratoire Ibn Rochd.',
  'تحاليل مخبرية': 'Analyses médicales',
  'استشارة فحص عام وسكر تراكمي': 'Consultation générale et contrôle HbA1c',
  'فحص سريري لقياس الضغط ونبض القلب والاطمئنان على انتظام الدواء.':
    'Examen clinique complet (tension, fréquence cardiaque) et observance thérapeutique.',
  'استشارة طبية': 'Consultation médicale',
  'تشخيص وتثبيت علاج ارتفاع ضغط الدم': 'Diagnostic et instauration du traitement HTA',
  'بدء علاج كوفرسيل 5 ملغ بعد مراقبة الضغط لأسبوعين متتاليين.':
    'Début de Coversyl 5 mg après deux semaines de suivi tensionnel.',
  'وصفة طبية دورية': 'Ordonnance chronique',
  'فحص بالصدى الصوتي المورفولوجي للثلث الثاني': 'Échographie morphologique du 2e trimestre',
  'تصوير كامل لأعضاء الجنين والتأكد من سلامة المشيمة وحجم السائل الأمنيوسي.':
    'Exploration morphologique fœtale complète, placenta et liquide amniotique normaux.',
  'أشعة صدى التوليد': 'Échographie obstétricale',
  'تاريخ الولادة وتلقيح BCG والكبد الفيروسي ب': 'Naissance et vaccinations BCG + Hépatite B',
  'ولادة طبيعية بمستشفى بارني (حسين داي)، الوزن 3.2 كغ، الطول 49 سم.':
    'Accouchement par voie basse à Parnet (Hussein Dey) — Poids 3,2 kg, Taille 49 cm.',
  'ولادة وتلقيح': 'Naissance & Vaccin',
  'دواء جديد': 'Nouveau traitement',
  'مؤشر حيوي': 'Constante vitale',
  'أرشيف طبي': 'Archive médicale',
  'موعد طبي': 'Rendez-vous médical',

  // === Menstrual Cycles ===
  'مغص خفيف': 'Crampes légères',
  'صداع': 'Céphalées',
  'تقلب مزاج خفيف': 'Variations d’humeur légères',
  'ألم أسفل الظهر': 'Lombalgies',
  'آخر دورة طمثية قبل تأكيد الحمل المبارك.':
    'Dernières règles avant confirmation de la grossesse.',

  // === Child Growth Notes ===
  'الوزن والمقاييس عند الولادة ضمن الشريحة المئوية 50% المثالية.':
    'Mensurations de naissance idéales au 50e percentile OMS.',
  'رضاعة طبيعية حصرية، استجابة بصرية وابتسامة تفاعلية.':
    'Allaitement maternel exclusif, poursuite oculaire et sourire-réponse.',
  'التحكم بثبات الرأس ممتاز.': 'Excellente tenue de la tête.',
  'بدء إدخال الأطعمة المهروسة (الخضار والفاكهة) تدريجياً.':
    'Début progressif de la diversification alimentaire (légumes et fruits).',
  'إتمام العام الأول بصحة ممتازة، بداية الوقوف والمحاولات الأولى للمشي.':
    '1 an en excellente santé : station debout et premiers pas.',
  'المشي بثبات، نطق كلمات أولى (ماما، بابا، ماء)، التفاعل الاجتماعي سليم.':
    'Marche assurée, premiers mots clairs et bonne interaction sociale.',

  // === Share Passes, Access Logs & Hotlines ===
  'ملخص طبي لاستشارة أمراض القلب': 'Synthèse médicale pour consultation cardiologique',
  'مشاركة للاستشارة الطبية': 'Partage pour consultation médicale',
  'الاطلاع على ترخيص PAI المدرسي ووصفة بخاخ الفنتولين':
    "Consultation du PAI scolaire et de l'ordonnance de Ventoline",
  'تطبيق الويب المحلي (جلسة موثقة)': 'Application web locale (session authentifiée)',
  'تطبيق TIBBI المحلي (جلسة موثقة)': 'Application TIBBI locale (session authentifiée)',
  'تطبيق TIBBI المحلي': 'Application TIBBI locale',
  'تطبيق TIBBI للويب': 'Application Web TIBBI',
  'معاينة تقرير إيكوغرافي الأسبوع 22 للحمل':
    "Consultation du compte-rendu d'échographie T2 (22 SA)",
  'هاتف ذكي (Safari Mobile)': 'Smartphone (Safari Mobile)',
  'منح وصول مؤقت لمدة 48 ساعة للدكتور كريم بوجمعة (أمراض القلب)':
    'Accès temporaire de 48h accordé au Dr Karim Boudjemaa (Cardiologie)',
  'متصفح سطح المكتب (Chrome)': 'Navigateur de bureau (Chrome)',
  'تسجيل قياس الطول والوزن عند عمر 18 شهراً':
    'Saisie des mensurations (poids/taille) à 18 mois',
  'استعراض البيانات الصحية والمؤشرات الحيوية': 'Consultation des données de santé et constantes',
  'تم النقر على زر إظهار المعرف المحمي بعد التحقق من الهوية':
    "Affichage de l'identifiant protégé après vérification",
  'تذكير بموعد دواء الضغط اليومي': 'Rappel de prise : Coversyl 5 mg',
  'موعد استشارة أمراض القلب والشرايين قريباً': 'Rendez-vous cardiologie imminent',
  'تنبيه نتائج الكوليسترول للمتابعة': "Point d'attention bilan lipidique",
  'المديرية العامة للحماية المدنية (DGPC)': 'Direction Générale de la Protection Civile (DGPC)',
  'المديرية العامة للأمن الوطني (DGSN)': 'Direction Générale de la Sûreté Nationale (DGSN)',
  'قيادة الدرك الوطني': 'Commandement de la Gendarmerie Nationale',
  'نوفمبر 2026': 'Novembre 2026',
  'ROR 1 (الحصبة، النكاف، الحميراء)': 'ROR 1 (Rougeole, Oreillons, Rubéole)',
  'ROR 2 + تذكير المكورات الرئوية': 'ROR 2 + Rappel Pneumocoque',

  // === OCR Fallback ===
  'فحص دوري يظهر ارتفاعاً طفيفاً في نسبة السكر والكوليسترول الكلي. يُنصح بمراجعة الطبيب المعالج لمراقبة الحمية الغذائية.':
    'Bilan de contrôle montrant une légère élévation de la glycémie et du cholestérol total. Suivi hygiéno-diététique recommandé.',
  'سكر الدم الصباحي 1.18 g/L (المعدل 0.70 - 1.10)': 'Glycémie à jeun 1,18 g/L (norme 0,70 - 1,10)',
  'الكوليسترول الكلي 2.35 g/L (المعدل الأقصى 2.00)': 'Cholestérol total 2,35 g/L (seuil max 2,00)',
  'وظائف الكلى سليمة': 'Fonction rénale normale',
  'فحص الحويصل الصفراوي والكبد والأعضاء البطنية طبيعي بدون مؤشرات التهابية أو تشكلات حصوية.':
    'Échographie hépatobiliaire et abdominale normale sans anomalie inflammatoire ni lithiasique.',
  'كبد متجانس بحجم طبيعي': 'Foie homogène de taille normale',
  'مرارة خالية من الحصيات وبجدار رقيق': 'Vésicule alithiasique à paroi fine',
  'كليتان سليمتان بدون توسع استسقائي': 'Reins normaux sans dilatation pyélocalicielle',
  'التهاب حاد بالبلعوم ومجرى التنفس العلوي مع حمى معتدلة. راحة تامة وشرب سوائل دافئة.':
    'Angine / pharyngite aiguë fébrile. Repos et hydratation chaude recommandés.',
  'مضاد حيوي أوجمنتين 1 غرام لمدة 7 أيام متتالية': 'Antibiothérapie Augmentin 1 g pendant 7 jours',
  'باراسيتامول لتخفيف الألم والحمى': 'Paracétamol antalgique et antipyrétique',
  'مراجعة العيادة في حال استمرار الأعراض لأكثر من 3 أيام':
    'Reconsulter si persistance des symptômes au-delà de 3 jours',
  'مستخرج آلياً': 'Extrait automatiquement',
};

const FR_TOKEN_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\(GMT\+1 الجزائر\)/g, '(GMT+1 Alger)'],
  [/الجزائر العاصمة/g, 'Alger'],
  [/الجزائر/g, 'Algérie'],
  [/مم زئبق/g, 'mmHg'],
  [/ن\/د/g, 'bpm'],
  [/غ\/دسل/g, 'g/dL'],
  [/غرام/g, 'g'],
  [/ملغ/g, 'mg'],
  [/كغ/g, 'kg'],
  [/سم/g, 'cm'],
  [/^د\.\s*/g, 'Dr '],
  [/^أ\.د\.\s*/g, 'Pr '],
  [/\bد\.\s+/g, 'Dr '],
  [/\bأ\.د\.\s+/g, 'Pr '],
  [/خارج المجال الطبيعي/g, 'Hors norme'],
  [/ضمن النطاق الطبيعي/g, 'Dans les normes'],
  [/طبيعي/g, 'Normal'],
  [/سليم/g, 'Normal'],
  [/مرتفع/g, 'Élevé'],
  [/منخفض/g, 'Bas'],
  [/أشهر/g, 'mois'],
  [/شهور/g, 'mois'],
  [/أيام/g, 'jours'],
  [/ساعات/g, 'heures'],
  [/ساعة/g, 'heure'],
  [/يومياً/g, 'par jour'],
  [/صباحاً/g, 'le matin'],
  [/مساءً/g, 'le soir'],
  [/ظهراً/g, 'à midi'],
  [/عند اللزوم/g, 'si besoin'],
  [/على الريق/g, 'à jeun'],
  [/قبل الأكل/g, 'avant le repas'],
  [/بعد الأكل/g, 'après le repas'],
  [/قرص واحد/g, '1 comprimé'],
  [/قرصين/g, '2 comprimés'],
  [/أقراص/g, 'comprimés'],
  [/كبسولة واحدة/g, '1 gélule'],
  [/كبسولة/g, 'gélule'],
  [/أمبولة/g, 'ampoule'],
  [/الجرعة:/g, 'Posologie :'],
  [/الطبيب:/g, 'Médecin :'],
  [/النتيجة:/g, 'Résultat :'],
  [/النبض:/g, 'Pouls :'],
  [/بإشراف:/g, 'Prescrit par :'],
  [/السبب:/g, 'Motif :'],
  [/المكان:/g, 'Lieu :'],
  [/تحاليل/g, 'Analyses'],
  [/تحليل/g, 'Analyse'],
  [/وصفة طبية/g, 'Ordonnance'],
  [/وصفة/g, 'Ordonnance'],
  [/قياس/g, 'Mesure'],
  [/موعد/g, 'Rendez-vous'],
  [/وثيقة طبية/g, 'Document médical'],
  [/وثيقة/g, 'Document'],
  [/مخبر/g, 'Laboratoire'],
  [/عيادة/g, 'Clinique'],
  [/مستشفى/g, 'Hôpital'],
];

function translateCompositeTextFr(text: string): string {
  // Handle structured timeline / log patterns generated dynamically in TibbiContext
  let out = text;

  const parentheticalMatch = out.match(/^(.+?)\s*\(([A-Za-zÀ-ÿ0-9\s/+.-]+)\)\s*$/);
  if (parentheticalMatch) {
    const [, arPart, frPart] = parentheticalMatch;
    const translatedPrefix = FR_EXACT_MAP[arPart.trim()];
    if (translatedPrefix) {
      return translatedPrefix;
    }
    if (!ARABIC_CHAR_REGEX.test(frPart) && frPart.trim().length >= 3) {
      // If there's a parenthetical French clinical label inside, prefer exact mapping or clean French label
      const normalized = out.trim();
      if (FR_EXACT_MAP[normalized]) return FR_EXACT_MAP[normalized];
    }
  }

  out = out
    .replace(/^بدء علاج جديد:\s*/, 'Nouveau traitement initié : ')
    .replace(/^تحليل مخبري:\s*/, 'Analyse biologique : ')
    .replace(/^تسجيل قياس ضغط الدم:\s*/, 'Mesure tensionnelle enregistrée : ')
    .replace(/^إضافة وثيقة:\s*/, 'Document archivé : ')
    .replace(/^موعد طبي:\s*/, 'Rendez-vous médical : ')
    .replace(
      /^الوصول تحت وصاية الولي القانوني \((.+)\)$/,
      (_m, g) => `Accès sous tutelle parentale légale (${translateTextFr(g)})`
    )
    .replace(
      /^مشاركة \((.+)\) موجهة إلى:\s*(.+?)\s*برمز:\s*(.+)$/,
      (_m, title, doc, code) =>
        `Partage (${translateTextFr(title)}) destiné à ${translateTextFr(doc)} • Code : ${code}`
    )
    .replace(/^وثيقة مؤرشفة في ملف\s*/, 'Document archivé dans le dossier ');

  for (const [pattern, replacement] of FR_TOKEN_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }

  // Replace any remaining exact dictionary substrings sorted by longest key first
  const keys = Object.keys(FR_EXACT_MAP).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (out.includes(k)) {
      out = out.split(k).join(FR_EXACT_MAP[k]);
    }
  }

  // Final safety pass: strip any residual untranslated Arabic characters in custom user entries if needed
  if (ARABIC_CHAR_REGEX.test(out)) {
    const stripped = out.replace(/[\u0600-\u06FF]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
    return stripped || 'Donnée clinique enregistrée';
  }

  return out;
}

export function translateTextFr(text?: string | null): string {
  if (text === undefined || text === null) return '';
  const trimmed = text.trim();
  if (!trimmed) return text;
  if (!ARABIC_CHAR_REGEX.test(trimmed)) return text;

  const exact = FR_EXACT_MAP[trimmed];
  if (exact) return exact;

  return translateCompositeTextFr(trimmed);
}

export function localizeText(text: string | undefined | null, language: Language): string {
  if (text === undefined || text === null) return '';
  if (language === 'ar') return text;
  if (language === 'en') return translateTextEn(text);
  return translateTextFr(text);
}

export function localizeList(items: string[] | undefined, language: Language): string[] {
  if (!items || items.length === 0) return [];
  if (language === 'ar') return items;
  if (language === 'en') return items.map((item) => translateTextEn(item));
  return items.map((item) => translateTextFr(item));
}

export function translateMedicationForm(form: string, language: Language): string {
  switch (form) {
    case 'tablet':
      return tr(language, 'أقراص', 'Comprimés', 'Tablets');
    case 'capsule':
      return tr(language, 'كبسولات', 'Gélules', 'Capsules');
    case 'syrup':
      return tr(language, 'شراب', 'Sirop', 'Syrup');
    case 'inhaler':
      return tr(language, 'بخاخ استنشاق', 'Inhalateur', 'Inhaler');
    case 'drops':
      return tr(language, 'قطرات / أمبولة', 'Gouttes / Ampoules', 'Drops / Ampoules');
    case 'injection':
      return tr(language, 'حقن', 'Injection', 'Injection');
    case 'cream':
    case 'ointment':
      return tr(language, 'مرهم / كريم', 'Pommade / Crème', 'Cream / Ointment');
    default:
      return tr(language, form, 'Traitement', 'Medication');
  }
}

export function translateLabCategory(category: string, language: Language): string {
  switch (category) {
    case 'biochimie':
      return tr(language, 'بيوكيمياء (Biochimie)', 'Biochimie', 'Biochemistry');
    case 'hematologie':
      return tr(language, 'أمراض الدم (Hématologie)', 'Hématologie', 'Hematology');
    case 'hormonologie':
      return tr(language, 'هرمونات (Hormonologie)', 'Hormonologie', 'Endocrinology');
    case 'serologie':
      return tr(language, 'أمصال ومناعة (Sérologie)', 'Sérologie', 'Serology');
    case 'urine':
      return tr(language, 'تحليل البول (ECBU)', 'Analyse d’urine', 'Urinalysis');
    case 'microbiologie':
      return tr(language, 'بكتيريا وميكروبات (Microbiologie)', 'Microbiologie', 'Microbiology');
    default:
      return tr(language, 'أخرى', 'Autre', 'Other');
  }
}

export function translateFlowIntensity(flow: string, language: Language): string {
  switch (flow) {
    case 'light':
      return tr(language, 'خفيفة', 'Légère', 'Light');
    case 'medium':
      return tr(language, 'متوسطة', 'Modérée', 'Medium');
    case 'heavy':
      return tr(language, 'غزيرة', 'Abondante', 'Heavy');
    default:
      return flow;
  }
}

export function translateShareSectionLabel(section: string, language: Language): string {
  switch (section) {
    case 'profile':
      return tr(language, 'الهوية والحساسية', 'Identité & Allergies', 'Identity & Allergies');
    case 'medications':
      return tr(language, 'الأدوية الحالية', 'Traitements en cours', 'Current Medications');
    case 'labs':
      return tr(language, 'التحاليل المخبرية', 'Bilans biologiques', 'Lab Results');
    case 'vitals':
      return tr(language, 'القياسات الحيوية', 'Constantes vitales', 'Vital Signs');
    case 'documents':
      return tr(language, 'الوثائق والأرشيف', 'Documents archivés', 'Archived Documents');
    case 'timeline':
      return tr(language, 'السجل الزمني', 'Chronologie médicale', 'Medical Timeline');
    default:
      return section;
  }
}
