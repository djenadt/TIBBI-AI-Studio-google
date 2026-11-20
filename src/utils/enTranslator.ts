const ARABIC_CHAR_REGEX = /[\u0600-\u06FF]/;

export const EN_EXACT_MAP: Record<string, string> = {
  // === Family Members & Guardians ===
  'أمين مزيان': 'Amine Meziane',
  'مريم بلحاج': 'Meriem Belhadj',
  'ياسين مزيان': 'Yacine Meziane',
  'إيناس مزيان': 'Ines Meziane',
  'أمين': 'Amine',
  'مريم': 'Meriem',
  'ياسين': 'Yacine',
  'إيناس': 'Ines',
  'لا توجد حساسية معروفة': 'No known allergies',
  'حساسية من مادة السلفا (Sulfamides)': 'Sulfonamide allergy (Sulfa drugs)',
  'حساسية البنسلين (Allergie Pénicilline)': 'Penicillin allergy',
  'ارتفاع ضغط الدم الخفيف (HTA modérée)': 'Mild hypertension (Moderate HBP)',
  'ربو تحسسي خفيف موسمي (Asthme allergique)': 'Mild seasonal allergic asthma',
  'استئصال الزائدة الدودية (Appendicectomie 2012)': 'Appendectomy (2012)',
  'أمين مزيان (الوصي القانوني الأول)': 'Amine Meziane (Primary Legal Guardian)',
  'مريم بلحاج (وصية مشتركة)': 'Meriem Belhadj (Co-Guardian)',
  'أمين مزيان ومريم بلحاج': 'Amine Meziane & Meriem Belhadj',
  'متابعة دورية لضغط الدم ونسبة الكولسترول مرتين في السنة.':
    'Regular blood pressure and lipid panel monitoring twice a year.',
  'حمل صحي - متابعة شهرية مع طبيبة التوليد د. صارة بن شيخ.':
    'Healthy pregnancy – Monthly follow-up with Dr Sara Bencheikh (OB/GYN).',
  'تلميذ في السنة الثانية ابتدائي، لقاحات الطفولة كاملة.':
    '2nd-grade primary school student; childhood vaccinations up to date.',
  'متابعة جدول التلقيحات الجزائري الوطني PEV ومنحنى نمو الرضيع.':
    'Follow-up of the Algerian National Vaccination Schedule (PEV) and infant growth chart.',
  'أمين مزيان (الأب)': 'Amine Meziane (Father)',
  'أمين مزيان (الولي الشرعي والقانوني)': 'Amine Meziane (Legal Guardian)',
  'أمين مزيان (الولي وصاحب الحساب)': 'Amine Meziane (Guardian & Account Holder)',
  'أمين مزيان (الولي القانوني)': 'Amine Meziane (Legal Guardian)',
  'أمين مزيان (صاحب الحساب)': 'Amine Meziane (Account Holder)',
  'أمين مزيان (صاحب الحساب والولي)': 'Amine Meziane (Account Holder & Guardian)',
  'أمين مزيان (صاحب الملف)': 'Amine Meziane (Record Holder)',
  'أمين مزيان (رب الأسرة)': 'Amine Meziane (Head of Family)',
  'مريم بلحاج (الأم / المعنية)': 'Meriem Belhadj (Mother / Record Holder)',
  'فرد من الأسرة': 'Family Member',
  'المريض': 'Patient',
  'أنا (رب الأسرة)': 'Self (Head of Family)',
  'Moi (Chef de famille)': 'Self (Head of Family)',
  'الزوجة': 'Spouse',
  'Épouse': 'Spouse',
  'الابن (7 سنوات)': 'Son (7 yrs)',
  'Fils (7 ans)': 'Son (7 yrs)',
  'الابنة (18 شهراً)': 'Daughter (18 mos)',
  'Fille (18 mois)': 'Daughter (18 mos)',

  // === Doctors & Specialties ===
  'د. كريم بوجمعة': 'Dr Karim Boudjemaa',
  'د. كريم بوجمعة - أخصائي أمراض القلب': 'Dr Karim Boudjemaa - Cardiologist',
  'د. سمير شريف': 'Dr Samir Cherif',
  'د. صارة بن شيخ': 'Dr Sara Bencheikh',
  'د. حفيظة لعريبي': 'Dr Hafida Laribi',
  'د. كمال بلحاج': 'Dr Kamal Belhadj',
  'د. فريد بن عيسى': 'Dr Farid Benaissa',
  'د. فريد بن عيسى (طبيب بيولوجي)': 'Dr Farid Benaissa (Clinical Biologist)',
  'د. طارق مراد': 'Dr Tarek Mourad',
  'أ.د. مسعود بوعلام': 'Prof Messaoud Boualam',
  'د. ليلى مزوز (بيولوجية)': 'Dr Leila Mezouz (Clinical Biologist)',
  'د. إلياس عمراني': 'Dr Ilyes Amrani',
  'د. نبيلة تواتي': 'Dr Nabila Touati',
  'أ.د. رشيد زبيري': 'Prof Rachid Zoubiri',
  'د. نبيلة تواتي وطبيبة الصحة المدرسية د. حليمة قدور':
    'Dr Nabila Touati & Dr Halima Kaddour (School Health)',
  'د. مهدي سليماني': 'Dr Mehdi Slimani',
  'د. يوسف شندرلي': 'Dr Youcef Chenderli',
  'د. ياسمين قادري': 'Dr Yasmine Kadri',
  'المركز الصحي البلدي - مصلحة حماية الأمومة والطفولة (PMI)':
    'Municipal Health Center - Maternal & Child Protection (PMI)',
  'طبيب معالج': 'Attending Physician',
  'طبيب استشاري': 'Consulting Physician',
  'Médecin consultant': 'Consulting Physician',
  'أمراض القلب والشرايين (Cardiologie)': 'Cardiology & Vascular Medicine',
  'أمراض القلب والشرايين': 'Cardiology',
  'طب عام': 'General Practice',
  'طب عام وأمراض باطنية (Médecine Générale)': 'General & Internal Medicine',
  'جراحة المسالك البولية': 'Urology',
  'أمراض النساء والتوليد (Gynécologie-Obstétrique)': 'Obstetrics & Gynecology',
  'أمراض النساء والتوليد (Gynécologie)': 'Obstetrics & Gynecology',
  'أمراض النساء والتوليد': 'Obstetrics & Gynecology',
  'طب الأطفال (Pédiatrie)': 'Pediatrics',
  'طب الأطفال': 'Pediatrics',
  'طب الأطفال وحديثي الولادة (Pédiatrie)': 'Pediatrics & Neonatology',
  'البيولوجيا الطبية والتحاليل المخبرية': 'Clinical Biology & Lab Medicine',
  'بيولوجيا طبية (Biologie Médicale)': 'Clinical Biology',
  'الأشعة والتصوير الطبي (Radiologie)': 'Radiology & Medical Imaging',
  'الأشعة والتصوير الطبي': 'Radiology & Medical Imaging',
  'أشعة وتصوير طبي (Radiologie)': 'Radiology & Medical Imaging',
  'الجراحة العامة وجراحة الجهاز الهضمي': 'General & Digestive Surgery',
  'الطب العام وطب الرياضة': 'General & Sports Medicine',
  'التحاليل الطبية والبيولوجيا الجزيئية': 'Medical Labs & Molecular Biology',
  'جراحة وطب الأسنان (Chirurgie Dentaire)': 'Dental Surgery',
  'أمراض الصدر والحساسية لدى الأطفال (Pneumo-Allergologie Pédiatrique)':
    'Pediatric Pulmonology & Allergology',
  'المناعة والحساسية السريرية (Immunologie & Allergologie)': 'Clinical Immunology & Allergology',
  'الصحة المدرسية والوقاية للأطفال': 'School Health & Pediatric Prevention',
  'طب وجراحة العيون (Ophtalmologie)': 'Ophthalmology',
  'الصحة الوقائية وطب الأطفال': 'Preventive Health & Pediatrics',
  'أشعة الأطفال وتصوير حديثي الولادة': 'Pediatric & Neonatal Radiology',

  // === Facilities, Labs & Clinics ===
  'مخبر ابن رشد للتحاليل الطبية - الجزائر العاصمة': 'Ibn Rochd Medical Laboratory - Algiers',
  'مخبر ابن رشد للتحاليل الطبية': 'Ibn Rochd Medical Laboratory',
  'مخبر الأمل - سطيف': 'El Amel Laboratory - Setif',
  'مخبر النور للتحاليل الطبية - القبة': 'Ennour Medical Laboratory - Kouba',
  'مخبر التحاليل': 'Medical Analysis Laboratory',
  'عيادة ابن سينا لأمراض القلب - الجزائر': 'Ibn Sina Cardiology Clinic - Algiers',
  'عيادة ابن سينا لأمراض القلب': 'Ibn Sina Cardiology Clinic',
  'عيادة ابن سينا - نهج ديدوش مراد، الجزائر العاصمة': 'Ibn Sina Clinic - Didouche Mourad St, Algiers',
  '14 شارع ديدوش مراد، الطابق 2، الجزائر': '14 Didouche Mourad Street, 2nd Floor, Algiers',
  'مركز التصوير الطبي ابن خلدون - باب الواد': 'Ibn Khaldoun Medical Imaging Center - Bab El Oued',
  'مركز التصوير الطبي ابن خلدون': 'Ibn Khaldoun Medical Imaging Center',
  'العيادة الجراحية الأبيار - الجزائر': 'El Biar Surgical Clinic - Algiers',
  'عيادة الصحة العامة - حيدرة': 'Hydra Public Health Clinic',
  'عيادة الأمل لأمراض النساء والتوليد - الجزائر': 'El Amel OB/GYN Clinic - Algiers',
  'عيادة الأمل لأمراض النساء والتوليد': 'El Amel OB/GYN Clinic',
  'عيادة الأمل للأمومة والتوليد': 'El Amel Maternity & Obstetrics Clinic',
  'حي القبة، مقابل مستشفى بشير منتوري، الجزائر': 'Kouba, opposite Bachir Mentouri Hospital, Algiers',
  'عيادة النجمة لطب وجراحة الأسنان - القبة': 'Ennedjma Dental Clinic - Kouba',
  'عيادة ابن الهيثم التخصصية للأطفال - الجزائر': 'Ibn El Haitham Pediatric Specialty Clinic - Algiers',
  'معهد باستور الجزائر - مصلحة الحساسية': 'Institut Pasteur of Algeria - Allergology Dept.',
  'وحدة الكشف والمتابعة المدرسية (UDS) - مدرسة ابن خلدون الابتدائية':
    'School Screening Unit (UDS) - Ibn Khaldoun Primary School',
  'مركز النور التخصصي لجراحة العيون - الجزائر': 'Ennour Ophthalmology Center - Algiers',
  'العيادة متعددة الخدمات الشهيد سي الحواس - الجزائر': 'Chahid Si El Haoues Polyclinic - Algiers',
  'مركز طب الأطفال النموذجي - بئر مراد رايس': 'Pilot Pediatric Center - Bir Mourad Rais',
  'مركز طب الأطفال النموذجي': 'Pilot Pediatric Center',
  'مصلحة حديثي الولادة - مستشفى مصطفى باشا الجامعي': 'Neonatology Dept. - Mustapha Pacha University Hospital',
  'مصلحة الولادة والأمومة - مستشفى مصطفى باشا / بارني':
    'Maternity Dept. - Mustapha Pacha / Parnet Hospital',
  'مركز السلام للتصوير الطبي والأشعة - وهران': 'Essalam Medical Imaging Center - Oran',
  'عيادة الرحمة الطبية - سطيف': 'Errahma Medical Clinic - Setif',

  // === Medications ===
  'قرص واحد يومياً': '1 tablet daily',
  'كبسولة واحدة مع وجبة الغداء': '1 capsule with lunch',
  'كبسولة واحدة مع الغداء': '1 capsule with lunch',
  'كبسولة صباحاً ومساءً': '1 capsule morning & evening',
  'كبسولة واحدة يومياً': '1 capsule daily',
  'كبسولة واحدة صباحاً': '1 capsule in the morning',
  'قرص واحد ظهراً': '1 tablet at noon',
  'بختان عند ظهور نوبة السعال أو ضيق التنفس': '2 puffs in case of cough or shortness of breath',
  'أمبولة شرب واحدة كل 6 أشهر': '1 oral ampoule every 6 months',
  'مرة واحدة صباحاً': 'Once daily in the morning',
  'مرة واحدة يومياً': 'Once daily',
  'مرتان يومياً لمدة شهر': 'Twice daily for 1 month',
  'مرة واحدة بعد الإفطار': 'Once daily after breakfast',
  'مرة واحدة ظهراً': 'Once daily at noon',
  'عند اللزوم فقط': 'As needed only',
  'جرعة دورية حسب جدول طبيب الأطفال': 'Periodic dose per pediatric schedule',
  'ارتفاع ضغط الدم (Hypertension)': 'Hypertension (High Blood Pressure)',
  'دعم صحة القلب وتوازن الدهون': 'Cardiovascular support & lipid balance',
  'علاج وقائي دوري': 'Periodic preventive treatment',
  'مكملات الحمل (فيتامينات، حمض الفوليك، يود وأوميغا 3)':
    'Pregnancy supplementation (vitamins, folic acid, iodine & omega-3)',
  'الوقاية من فقر الدم وعوز الحديد أثناء الحمل': 'Prevention of anemia & iron deficiency in pregnancy',
  'نوبات الربو التحسسي الخفيف': 'Mild allergic asthma episodes',
  'الوقاية من الكساح ودعم نمو العظام والأسنان': 'Rickets prevention & bone growth support',
  'يؤخذ صباحاً على الريق قبل الفطور مع كأس ماء': 'Take in the morning on an empty stomach with a full glass of water',
  'مع الطعام': 'With food',
  'بعد الأكل': 'After meals',
  'وسط وجبة الإفطار لتجنب الغثيان': 'Mid-breakfast to prevent nausea',
  'تجنب شرب الشاي أو القهوة مباشرة بعد تناول القرص':
    'Avoid tea or coffee immediately after taking the tablet',
  "استعمال غرفة الاستنشاق (Chambre d'inhalation) للأطفال":
    'Use with a pediatric spacer / inhalation chamber',
  'تُخلط مع قليل من الحليب أو عصير طبيعي': 'Mix with a small amount of milk or natural juice',
  'قرص واحد يومياً صباحاً': '1 tablet daily in the morning',
  'كبسولة واحدة ظهراً مع وجبة الغداء': '1 capsule at noon with lunch',
  'قرص واحد يومياً في منتصف النهار': '1 tablet daily at midday',
  'بختان عند اللزوم بواسطة غرفة الاستنشاق': '2 puffs as needed via inhalation spacer',
  'ملعقة قياس 5 مل يومياً قبل النوم': '1 measuring spoon (5 ml) daily at bedtime',
  'محقنة مدرجة حسب وزن الرضيع (11 كغ) كل 6 ساعات عند اللزوم':
    'Weight-calibrated syringe dose (11 kg) every 6 hours as needed',
  'أمبولة واحدة صالحة للشرب في ملعقة ماء صباحاً': '1 oral ampoule in a spoonful of water in the morning',
  '6 أشهر': '6 months',
  '3 أشهر': '3 months',
  '30 يوماً': '30 days',
  '7 أيام': '7 days',
  '5 أيام': '5 days',
  'طوال فترة الحمل': 'Throughout pregnancy',
  'عند اللزوم': 'As needed',
  'عند حدوث نوبة أو قبل الرياضة': 'During flare-ups or before exercise',
  'جرعة وحيدة سنوية': 'Single annual dose',
  'حسب الوصفة': 'As prescribed',
  'مرتين يومياً': 'Twice daily',
  'قرص واحد مرتين يومياً': '1 tablet twice daily',
  'قرص واحد عند الحاجة (أقصى 3 أقراص يومياً)': '1 tablet as needed (max 3/day)',
  'ملعقة كبيرة 3 مرات يومياً': '1 tablespoon 3 times daily',
  'في بداية الوجبات مع كوب ماء كبير': 'At the start of meals with a large glass of water',
  'بفارق 6 ساعات على الأقل بين الجرعات': 'Space doses at least 6 hours apart',
  'لعلاج التهاب الحلق والبلعوم': 'To treat pharyngitis and sore throat',

  // === Lab Tests (Arabic + parenthetical French keys) ===
  'نسبة السكر في الدم على الريق (Glycémie à jeun)': 'Fasting Blood Glucose',
  'نسبة السكر في الدم (Glycémie à jeun)': 'Fasting Blood Glucose',
  'Glycémie à jeun': 'Fasting Blood Glucose',
  'الكوليسترول الكلي (Cholestérol Total)': 'Total Cholesterol',
  'Cholestérol Total': 'Total Cholesterol',
  'الكوليسترول الضار (LDL Cholestérol)': 'LDL Cholesterol',
  'LDL-Cholestérol': 'LDL Cholesterol',
  'LDL Cholestérol': 'LDL Cholesterol',
  'تصفية الكرياتينين (Créatinine Sanguine)': 'Serum Creatinine',
  'كرياتينين الدم (Créatinine)': 'Serum Creatinine',
  'Créatinine Sanguine': 'Serum Creatinine',
  'Créatinine Sérique': 'Serum Creatinine',
  'الهيموغلوبين السكري (HbA1c)': 'Glycated Hemoglobin (HbA1c)',
  'HbA1c (Hémoglobine glyquée)': 'Glycated Hemoglobin (HbA1c)',
  'الهيموغلوبين والتعداد الدموي (NFS / Hémoglobine)': 'CBC / Hemoglobin',
  'NFS / Hémoglobine': 'CBC / Hemoglobin',
  'Hémoglobine (NFS)': 'Hemoglobin (CBC)',
  'مخزون الحديد (Ferritine Sérique)': 'Serum Ferritin',
  'Ferritine Sérique': 'Serum Ferritin',
  'اختبار داء المقوسات (Sérologie Toxoplasmose IgG/IgM)': 'Toxoplasmosis Serology (IgG/IgM)',
  'Sérologie Toxoplasmose IgG': 'Toxoplasmosis IgG Serology',
  'Sérologie Rubéole IgG': 'Rubella IgG Serology',
  'الدهون الثلاثية (Triglycérides)': 'Triglycerides',
  'Triglycérides': 'Triglycerides',
  'قيمة أولية مرتفعة قليلاً، تم البدء ببرنامج ضبط التغذية وإنقاص الوزن.':
    'Slightly elevated initial value; dietary and weight management program started.',
  'تحسن ملحوظ بعد تعديل وجبات العشاء وتقليل السكريات السريعة.':
    'Notable improvement after adjusting dinner meals and reducing simple sugars.',
  'استقرار ممتاز في النطاق الطبيعي السوي.': 'Excellent stabilization within normal range.',
  'مستوى منضبط مع ممارسة المشي المنتظم.': 'Well-controlled level with regular walking.',
  'تحليل دوري سنوي، النتيجة طبيعية ومستقرة تماماً.':
    'Annual routine test; completely normal and stable result.',
  'ارتفاع شحوم الدم، توجيه لحمية البحر المتوسط وإضافة أوميغا 3.':
    'Mild dyslipidemia; Mediterranean diet and omega-3 supplementation recommended.',
  'استجابة أولية إيجابية، انخفاض تدريجي.': 'Positive initial response with gradual decline.',
  'مواصلة الالتزام بحمية زيت الزيتون والأسماك.':
    'Continue diet rich in olive oil and fatty fish.',
  'مرتفع قليلاً، يُنصح بمواصلة حمية البحر المتوسط وممارسة المشي اليومي.':
    'Slightly elevated; maintain Mediterranean diet and daily walking.',
  'مرتفع فوق الهدف الوعائي، مراقبة مستمرة.':
    'Above cardiovascular target; ongoing monitoring.',
  'انخفاض مشجع نحو الهدف.': 'Encouraging decrease toward therapeutic target.',
  'أعلى قليلاً من الهدف المطلوب لمريض الضغط، يحتاج متابعة بعد 3 أشهر.':
    'Slightly above target for a hypertensive patient; recheck in 3 months.',
  'وظائف كلى سليمة وطبيعية قبل بدء علاج خافض الضغط.':
    'Normal renal function prior to starting antihypertensive therapy.',
  'وظائف كلى ممتازة.': 'Excellent kidney function.',
  'وظائف كلى ممتازة وترشيح كبيبي سليم.': 'Optimal kidney function with normal glomerular filtration.',
  'معدل سكر تراكمي في مرحلة ما قبل السكري المبكرة.': 'HbA1c in early prediabetes range.',
  'تحسن ممتاز وعودة إلى المعدل الطبيعي التام.': 'Excellent improvement with full return to normal range.',
  'معدل سكر تراكمي مثالي ومستقر لمدة 3 أشهر سابقة.':
    'Optimal, stable HbA1c over the past 3 months.',
  'تحليل بداية الحمل (الأسبوع 6)، تعداد دموي طبيعي وسليم.':
    'Early pregnancy test (6 wks GA); normal blood count.',
  'متابعة الثلث الأول، الهيموغلوبين جيد ومستقر.': '1st trimester follow-up; stable hemoglobin.',
  'تحليل الثلث الثاني للحمل، لا يوجد فقر دم ملحوظ مع تمدد حجم البلازما الطبيعي.':
    '2nd trimester panel; no significant anemia with physiological hemodilution.',
  'مخزون حديد أولي ممتاز قبل بدء الحمل النشط.': 'Excellent baseline iron stores.',
  'بداية استهلاك الجنين للحديد، وصف دواء تارديفيرون B9.':
    'Fetal iron demand increasing; Tardyferon B9 prescribed.',
  'طبيعي مع الاستمرار في حبوب تارديفيرون لتفادي فقر دم الثلث الثالث.':
    'Normal under Tardyferon to prevent 3rd trimester anemia.',
  'سلبي (Séronégative) - يُشترط غسل الخضار جيداً وطهي اللحوم بصورة تامة وإعادة الفحص شهرياً.':
    'Seronegative: thoroughly wash produce, fully cook meats, and retest monthly.',
  'ارتفاع طفيف': 'Slightly elevated',
  'فوق المعدل المستهدف': 'Above target',
  'سلبي (غياب المناعة)': 'Negative (Non-immune)',
  'إيجابي (مناعة محصنة)': 'Positive (Immune)',
  'مرتفع قليلاً عن المعدل الطبيعي': 'Slightly above normal range',
  'مرتفع يحتاج حمية ومتابعة': 'Elevated; requires diet & follow-up',
  'طبيعي': 'Normal',
  'وظائف كلوية طبيعية': 'Normal kidney function',

  // === Vitals Notes ===
  'قياس صباحي بعد أخذ حبة الضغط بنصف ساعة - ضغط مستقر.':
    'Morning reading 30 min after medication — blood pressure stabilized.',
  'قياس مسائي بعد يوم عمل هادئ.': 'Evening resting reading after a calm workday.',
  'ارتفاع طفيف بسبب الإرهاق والسفر.': 'Mild reactive elevation due to fatigue and travel.',
  'متابعة شهرية مع دواء كوفرسيل.': 'Monthly routine check under Coversyl (Perindopril).',
  'استجابة جيدة مع ممارسة رياضة المشي.': 'Good therapeutic response alongside walking.',
  'بداية خطة تعديل النظام الغذائي وتخفيف الملح.': 'Start of low-sodium dietary plan.',
  'فحص دوري أولي قبل تعديل جرعة علاج الضغط.': 'Baseline check prior to dosage adjustment.',
  'زيارة التوليد الشهرية، ضغط دم سوي وحجم بطن مناسب للأسبوع 24.':
    'Monthly prenatal visit (24 wks GA): normal BP and fundal height.',
  'متابعة الثلث الثاني للحمل (الأسبوع 18).': '2nd trimester pregnancy follow-up (18 wks GA).',
  'تطور نمو الجنين سليم ووزن الأم منتظم.': 'Healthy fetal growth and steady maternal weight gain.',
  'نهاية الثلث الأول، علامات حيوية ممتازة.': 'End of 1st trimester: optimal vital signs.',
  'فحص دوري عمر 18 شهراً عند د. لعريبي.': '18-month pediatric checkup with Dr Laribi.',

  // === Archive Documents ===
  'وصفة علاج ضغط الدم الدوري (Ordonnance HTA)': 'Antihypertensive Medication Prescription (HBP)',
  'تحليل شامل للدم والدهون والكلى (Bilan Biologique Complet)': 'Complete Blood, Lipid & Renal Lab Panel',
  'تخطيط كهربائية القلب القياسي (ECG 12 Dérivations de Repos)': 'Standard 12-Lead Resting ECG',
  'تصوير الصدر بالأشعة السينية (Téléthorax Face)': 'Chest X-Ray (PA View)',
  'تقرير التدخل الجراحي لاستئصال الزائدة (Compte-rendu Opératoire)':
    'Operative Report: Appendectomy',
  "شهادة الكفاءة والقدرة البدنية لممارسة الرياضة (Certificat Médical d’Aptitude)":
    'Medical Certificate of Sports Fitness',
  'تقرير فحص بالصدى الصوتي للحمل - الأسبوع 22 (Échographie Morphologique T2)':
    'T2 Obstetric Morphology Ultrasound (22 wks GA)',
  'التحاليل المصلية والمخبرية لمتابعة الحمل (Bilan Sérologique & Prénatal)':
    'Complete Prenatal & Serological Panel',
  'وصفة المكملات الغذائية والحديد للثلث الثاني (Ordonnance Grossesse T2)':
    'Pregnancy T2 Iron & Supplements Prescription',
  'تقرير الاستشارة التوليدية الشهرية - الشهر السادس (Suivi Obstétrical T2)':
    'Monthly Obstetric Follow-Up Report (6th Month)',
  'فحص صحة الفم والأسنان للأم الحامل (Examen Bucco-Dentaire Préventif)':
    'Preventive Prenatal Dental Examination',
  'وصفة علاج الربو التحسسي وموسّع الشعب (Ordonnance Asthme & Allergie)':
    'Allergic Asthma & Bronchodilator Prescription',
  'تقرير الفحص الجلدي للحساسية واختبارات الوخز (Prick-Tests Allergologiques)':
    'Allergy Skin Prick-Test Report',
  "مشروع الاستقبال الفردي المدرسي (Projet d’Accueil Individualisé - PAI Scolaire)":
    'Individualized School Health Plan (PAI)',
  'فحص فسيولوجيا البصر وقياس حدة الرؤية (Bilan Ophtalmologique Pédiatrique)':
    'Pediatric Ophthalmology Assessment',
  'أشعة الجيوب الأنفية والوجه (Radiographie des Sinus de la Face)':
    'Facial & Paranasal Sinus X-Ray',
  'الدفتر الصحي وسجل التلقيحات الوطني (Carnet de Santé & PEV Algérie)':
    'Health Booklet & National Vaccination Record (PEV)',
  'تقرير تقييم النمو والتطور النفسي والحركي (Bilan de Développement 18 Mois)':
    '18-Month Psychomotor Development Assessment',
  'وصفة بزوغ الأسنان وفيتامين د الوقائي (Ordonnance Pédiatrique Dents & Vitamine D)':
    'Pediatric Prescription: Teething & Vitamin D',
  'الصدى الصوتي عبر اليافوخ لحديثي الولادة (Échographie Transfontanellaire - ETF)':
    'Neonatal Transfontanellar Ultrasound (TFUS)',
  'تحليل بيولوجي شامل (Bilan Biologique Sanguin)': 'Comprehensive Blood Lab Panel',
  'تقرير فحص بالصدى الصوتي (Échographie Abdominale)': 'Abdominal Ultrasound Report',
  'وصفة طبية - استشارة عامة (Ordonnance Médicale)': 'Medical Prescription - General Consultation',
  'وثيقة طبية مستخرجة بالذكاء الاصطناعي': 'AI-Extracted Medical Document',

  // Conclusions, recommendations & notes of documents (including French clinical notes!)
  'تثبيت ضغط الدم الشرياني حول 125/82 مم زئبق مع تحمل ممتاز للعلاج الدوائي.':
    'Blood pressure stabilized around 125/82 mmHg with excellent treatment tolerance.',
  'تناول قرص كوفرسيل 5 ملغ صباحاً على الريق، الاستمرار في تقليل ملح الطعام، والمتابعة الدورية كل 6 أشهر.':
    'Take Coversyl 5 mg each morning on an empty stomach, maintain low-sodium diet, and review every 6 months.',
  'تجديد سنوي مع إجراء تحليل دوري لوظائف الكلى والكوليسترول.':
    'Annual renewal with routine renal function and cholesterol blood panel.',
  'وظائف كلوية ممتازة (Creatinine 8.8 mg/L)، سكر تراكمي مثالي (5.4%)، مع ارتفاع طفيف في الكوليسترول الضار LDL (1.52 g/L).':
    'Excellent renal function (Creatinine 8.8 mg/L), optimal HbA1c (5.4%), mild LDL cholesterol elevation (1.52 g/L).',
  'تعزيز الألياف والنشاط البدني الهوائي (30 دقيقة مشي يومياً)، والالتزام بمكمل الأوميغا 3.':
    'Increase dietary fiber, walk 30 minutes daily, and continue omega-3 supplementation.',
  'مؤشرات وظائف الكلى طبيعية جداً تؤكد سلامة استخدام مثبطات الإنزيم المحول للأنجيوتنسين (ACEI).':
    'Normal renal markers confirming safe use of ACE inhibitor therapy.',
  'إيقاع جيبي منتظم بسرعة 68 ن/د، محاور وموجات طبيعية، عدم وجود علامات تضخم في البطين الأيسر أو إقفار عضلي.':
    'Regular sinus rhythm at 68 bpm, normal axis and waveforms, no LV hypertrophy or ischemia.',
  'لا يتطلب أي فحص إجهاد حالياً، إعادة التخطيط بعد سنة للمتابعة الوقائية.':
    'No stress test needed at present; repeat preventive ECG in 1 year.',
  'Intervalle PR = 160ms, QRS = 88ms, QTc = 410ms. Tracé strictement normal.':
    'PR interval = 160 ms, QRS = 88 ms, QTc = 410 ms. Completely normal tracing.',
  'حقول رئوية صافية خالية من أي كثافة مشبوهة، الحجاب الحاجز ذو حركة سوية، المؤشر القلبي الصدري طبيعي (< 0.50).':
    'Clear lung fields with no suspicious opacity, normal diaphragmatic domes, normal cardiothoracic ratio (< 0.50).',
  'فحص مرجعي سليم، لا يتطلب أي إجراء إضافي.':
    'Normal baseline exam; no further imaging required.',
  'Index cardio-thoracique normal à 0.46. Absence d’épanchement pleural.':
    'Normal cardiothoracic index at 0.46. No pleural effusion.',
  'استئصال الزائدة الدودية الالتهابية عبر الجراحة بالمنظار (Cœlioscopie) بنجاح تام وبدون أي مضاعفات داخل أو بعد الجراحة.':
    'Laparoscopic appendectomy completed successfully with zero intraoperative or postoperative complications.',
  'ملف جراحي مستقر ومكتمل، شفاء تام لجدار البطن.':
    'Surgical record closed and stable; complete abdominal wall healing.',
  'Anatomopathologie : Appendicite catarrhale subaiguë sans perforation. Suites opératoires simples.':
    'Pathology: Subacute catarrhal appendicitis without perforation. Uncomplicated recovery.',
  'عدم وجود أي مانع سريري أو قلبي وعائي لممارسة رياضة الجري والمشاركة في المسابقات الرياضية.':
    'No clinical or cardiovascular contraindication to distance running and competitive athletics.',
  'المحافظة على الترطيب الجيد والإحماء التدريجي ومراقبة النبض أثناء المجهود البدني المكثف.':
    'Maintain proper hydration, gradual warm-up, and heart-rate monitoring during intense exertion.',
  'شهادة صالحة لمدة سنة للمشاركة في سباق الجزائر العاصمة لنصف الماراثون.':
    'Certificate valid for 1 year for participation in the Algiers Half-Marathon.',
  'حمل أحادي متطور بانسجام تام مع عمر الحمل (22 أسبوعاً + 3 أيام). تشريح جنيني مكتمل وطبيعي دون أي تشوهات ظاهرة.':
    'Single viable gestation matching gestational age (22 wks + 3 days). Complete normal fetal anatomy with no visible anomalies.',
  'الاستمرار في المكملات الغذائية، وإجراء فحص الصدى للثلث الثالث في الأسبوع 32.':
    'Continue prenatal supplements and schedule 3rd trimester ultrasound at 32 weeks.',
  'نمو الجنين وحركته ومعدل ضربات القلب طبيعية، المشيمة ذات توضع خلفي مرتفع سليم.':
    'Normal fetal growth, movements, and heart rate; healthy high posterior placenta.',
  'Postérieur haut inséré, grade I': 'High posterior insertion, grade I',
  'Quantité normale, plus grande citerne à 48 mm': 'Normal volume, deepest vertical pocket 48 mm',
  'Quatre cavités bien équilibrées, rythme fœtal régulier à 144 bpm':
    'Balanced four-chamber heart, regular fetal heart rate at 144 bpm',
  'مناعة مؤكدة ضد الحصبة الألمانية (Rubéole IgG +++)، سلبية المقوسات (Toxoplasmose Séronégative) تستوجب حيطة غذائية صارمة.':
    'Confirmed rubella immunity (IgG +++); toxoplasmosis seronegative requiring strict food hygiene.',
  'طهي اللحوم جيداً وغسل الخضار والفواكه وإعادة تحليل التوكسوبلازموز شهرياً حتى موعد الولادة.':
    'Cook meats thoroughly, wash fruits and vegetables, and repeat monthly toxoplasmosis serology until delivery.',
  'تنبيه حساس: حساسية مفرطة مسجلة لمشتقات السلفاميد، يحظر تماماً وصف أي مضاد حيوي من عائلة Sulfamides.':
    'Critical alert: documented sulfonamide allergy — strictly avoid all sulfa antibiotics.',
  'دعم مخزون الحديد والوقاية من فقر الدم الناجم عن التمدد الحجمي البلازمي للجنين.':
    'Iron store support and prevention of gestational dilutional anemia.',
  'كبسولة Gestarelle صباحاً مع الإفطار، وقرص Tardyferon B9 ظهراً مع كوب عصير برتقال لتعزيز امتصاص الحديد وتجنب الشاي مباشرة.':
    '1 Gestarelle capsule with breakfast and 1 Tardyferon B9 tablet at noon (away from tea/coffee).',
  'استجابة جيدة مع مؤشر خضاب دموي مستقر عند 12.1 غ/دسل.':
    'Good response with stable hemoglobin at 12.1 g/dL.',
  'حمل هادئ ومستقر، ارتفاع الرحم 24 سم مطابق لسن الحمل، حركة جنينية نشطة، ضغط دم الأم مثالي عند 115/70.':
    'Smooth, stable pregnancy; 24 cm fundal height matches gestational age, active fetal movement, maternal BP 115/70.',
  'فحص سكر الحمل (HGPO 75g) خلال الأسبوعين القادمين، وموعد الفحص القادم في بداية الشهر السابع.':
    '75 g OGTT gestational diabetes screening within 2 weeks; next visit at start of 7th month.',
  'Pas d’œdèmes des membres inférieurs, bandelette urinaire : absence de protéinurie et de glycosurie.':
    'No lower-limb edema; urine dipstick negative for proteinuria and glycosuria.',
  'حالة لثوية وسنية سليمة، تم إجراء جلسة تنظيف وترسيب كلسي خفيف (Détartrage doux) للوقاية من التهاب اللثة الحملي.':
    'Healthy teeth and gums; gentle scaling performed to prevent pregnancy gingivitis.',
  'تفريش الأسنان 3 مرات يومياً بمعجون غني بالفلورايد، وتجنب أي تصوير إشعاعي سني غير ضروري.':
    'Brush 3 times daily with fluoride toothpaste and avoid unnecessary dental X-rays.',
  'Bilan bucco-dentaire prénatal favorable sans foyer infectieux.':
    'Favorable prenatal dental checkup with no infectious foci.',
  'ربو متقطع خفيف مسيطر عليه جيداً، مع نوبات سعال مرتبطة بتغير الفصول وحبوب الطلع أو الغبار.':
    'Well-controlled mild intermittent asthma with seasonal cough triggered by pollen or dust.',
  'استخدام بخاخ Ventoline 100µg (بختين عبر غرفة الاستنشاق Babyhaler عند السعال أو ضيق التنفس)، وإعطاء شراب Aérius 5ml مساءً لمدة شهر في موسم الخريف.':
    'Ventoline 100 µg (2 puffs via Babyhaler for cough/dyspnea) and Aerius syrup 5 ml nightly for 1 month in autumn.',
  'تنبيه مشدد: ياسين يعاني من حساسية مؤكدة ضد البنسلين ومشتقاته (Allergie Pénicilline).':
    'Strict alert: Yacine has a confirmed allergy to penicillin and its derivatives.',
  'إيجابية واضحة لعث الغبار المنزلي (Dermatophagoides pteronyssinus ++++)، وتأكيد التحسس المفرط للبنسلين. سلبية تجاه وبر القطط والفول السوداني.':
    'Strong positive reaction to house dust mites (Dermatophagoides pteronyssinus ++++) and confirmed penicillin hypersensitivity; negative for cat dander and peanut.',
  'تغطية الفراش والوسائد بأغطية مضادة لعث الغبار، تهوية الغرفة يومياً، واستبعاد تام لجميع مضادات البنسلين والأموكسيسيلين من وصفاته.':
    'Use anti-mite mattress/pillow covers, air out bedroom daily, and strictly avoid all penicillins and amoxicillin.',
  'Prick-test DP : papule 8mm, DF : papule 7mm. Témoin histamine : 6mm. Risque anaphylactique pénicilline documenté.':
    'Skin prick test: DP wheal 8 mm, DF wheal 7 mm, histamine control 6 mm. Documented penicillin anaphylaxis risk.',
  'ترخيص رسمي بحفظ بخاخ الفنتولين وغرفة الاستنشاق لدى الإدارة المدرسية ومعلم القسم، مع بروتوكول تدبير الأزمات الطارئة والسماح بالتربية البدنية.':
    'Official school authorization for keeping Ventoline inhaler and spacer with staff/teacher, emergency protocol, and full PE participation.',
  'إعطاء بختين من الفنتولين 15 دقيقة قبل حصص التربية البدنية، والاتصال الفوري بالأولياء في حال عدم استقرار التنفس.':
    'Administer 2 puffs of Ventoline 15 min before PE class and contact parents immediately if breathing distress persists.',
  'نسخة مودعة لدى مديرة المدرسة، طبيبة الوحدة الصحية، ومعلم السنة الثانية ابتدائي.':
    'Copy filed with the school principal, school health physician, and 2nd-grade teacher.',
  'حدة بصر ممتازة 10/10 في كلتا العينين بدون تصحيح، رؤية ثنائية متناسقة، قاع العين طبيعي والقرنية سليمة تماماً.':
    'Excellent 10/10 uncorrected visual acuity bilaterally; normal binocular vision, fundus, and corneas.',
  'لا حاجة لنظارات طبية، تحديد وقت الشاشات والهواتف بحد أقصى ساعة يومياً مع إضاءة مناسبة أثناء القراءة.':
    'No corrective lenses needed; limit screens to 1 hour/day with proper reading lighting.',
  'Examen à la lampe à fente normal, réfraction sous cycloplégique : emmétrope.':
    'Normal slit-lamp exam; cycloplegic refraction: emmetropic.',
  'شفاء تام من التهاب الجيوب الفكية السابق، شفافية جيبية طبيعية وتراجع الاحتقان بعد العلاج الموضعي.':
    'Full resolution of prior maxillary sinusitis; clear sinus aeration after topical therapy.',
  'الاستمرار في غسيل الأنف بمحلول مياه البحر الملحية في الصباح وعند النوم.':
    'Continue isotonic saline nasal rinses morning and bedtime.',
  'Incidence de Blondeau : Sinus maxillaires et frontaux bien aérés, pas de niveau hydro-aérique.':
    'Blondeau view: well-aerated maxillary and frontal sinuses, no air-fluid levels.',
  'البرنامج الموسع للتلقيحات (PEV) مستوفى بالكامل ومحدث بانتظام: BCG + HepB0 (الولادة)، Pentavalent 1-2-3 + Polio + ROR1 + Pneumo.':
    'Expanded Program on Immunization (PEV) complete and up to date: BCG + HepB0, Pentavalent 1-2-3 + Polio + MMR 1 + Pneumo.',
  'التطعيم القادم المقرر: الجرعة التذكيرية للقاح الحصبة والحصبة الألمانية (ROR 2) والرباعي التذكيري عند بلوغ 18 شهراً.':
    'Next scheduled vaccine at 18 months: MMR 2 booster + tetravalent booster.',
  'دفتر صحي سليم، تفاعلات لقاحية خفيفة فقط مع استجابة مناعية ممتازة.':
    'Healthy vaccination booklet; only mild post-vaccine reactions with strong immune response.',
  'تطور نفسي حركي ممتاز: مشي مستقل متوازن، اكتساب 15 كلمة واضحة، تفاعل اجتماعي مرح، نمو بدني متوازن على خط المتوسط OMS (وزن 11.2 كغ، طول 82 سم، محيط رأس 47 سم).':
    'Excellent psychomotor development: steady independent walking, ~15 clear words, playful engagement, WHO median growth (11.2 kg, 82 cm, HC 47 cm).',
  'مواصلة التغذية المتنوعة الغنية بالبروتين والخضار، الفطام التدريجي، ومشاركة الألعاب الحركية التفاعلية.':
    'Continue varied protein- and vegetable-rich diet, gradual weaning, and interactive motor play.',
  'Examen neuromoteur parfait. Aucun signe d’alerte sensoriel ou moteur.':
    'Normal neuromotor exam. No sensory or motor warning signs.',
  'تخفيف آلام بزوغ الأضراس اللبنية الأولى مع تأمين الجرعة الوقائية العظمية السنوية من فيتامين د.':
    'Pain relief for first primary molar teething alongside annual preventive Vitamin D prophylaxis.',
  'شراب دوليبران بجرعة وزن الطفلة (حقنة القياس عند الألم أو ارتفاع الحرارة فوق 38.5)، وجرعة الفيتامين د3 السنوية.':
    'Doliprane syrup weight-based dose (for pain or fever > 38.5 °C) and annual Vitamin D3 dose.',
  'Dentition en cours : éruption des premières molaires de lait sans surinfection gingivale.':
    'Teething in progress: eruption of first primary molars without gingival infection.',
  'فحص صدى عبر اليافوخ سليم تماماً: بنية الدماغ والبطينات المخية ذات حجم وشكل متناسق، عدم وجود أي نزيف أو نقص تروية أو تشوه ولادي.':
    'Completely normal TFUS: symmetrical cerebral parenchyma and ventricles, no hemorrhage, ischemia, or anomaly.',
  'فحص دوري أولي سليم لا يستدعي أي إعادة مراقبة.':
    'Normal baseline neonatal exam requiring no repeat follow-up.',
  'Parenchyme cérébral homogène, ventricules latéraux fins et symétriques. Tracé doppler des artères cérébrales normal.':
    'Homogeneous cerebral parenchyma, slender symmetrical lateral ventricles, normal cerebral arterial Doppler.',

  // Tags
  'ضغط الدم': 'Blood Pressure',
  'قلب': 'Cardiology',
  'دواء دوري': 'Chronic Meds',
  'تحليل دم': 'Blood Test',
  'سكر صائم': 'Fasting Glucose',
  'كوليسترول': 'Cholesterol',
  'كرياتينين': 'Creatinine',
  'تخطيط قلب': 'ECG',
  'نبض جيبي': 'Sinus Rhythm',
  'شرايين': 'Arteries',
  'أشعة سينية': 'X-Ray',
  'صدر': 'Chest',
  'رئتين': 'Lungs',
  'عملية جراحية': 'Surgery',
  'استئصال زائدة': 'Appendectomy',
  'جراحة بالمنظار': 'Laparoscopy',
  'جراحة سابقة': 'Surgical History',
  'شهادة طبية': 'Medical Certificate',
  'رياضة': 'Sports',
  'لياقة بدنية': 'Physical Fitness',
  'سباق نصف الماراثون': 'Half-Marathon',
  'حمل': 'Pregnancy',
  'أشعة صدى': 'Ultrasound',
  'تشريح الجنين': 'Fetal Anatomy',
  'الثلث الثاني': '2nd Trimester',
  'مورفولوجي': 'Morphology Scan',
  'تحاليل حمل': 'Prenatal Labs',
  'داء المقوسات': 'Toxoplasmosis',
  'الحصبة الألمانية': 'Rubella',
  'فصيلة دم': 'Blood Group',
  'سكر الحمل': 'Gestational Diabetes',
  'وصفة طبية': 'Prescription',
  'حديد': 'Iron',
  'حمض الفوليك': 'Folic Acid',
  'مكملات': 'Supplements',
  'استشارة توليدية': 'Obstetric Visit',
  'ارتفاع الرحم': 'Fundal Height',
  'نبض الجنين': 'Fetal Heartbeat',
  'أسنان': 'Dental',
  'حمل وقائي': 'Prenatal Prevention',
  'صحة الفم': 'Oral Health',
  'تنظيف لثة': 'Dental Scaling',
  'ربو أطفال': 'Pediatric Asthma',
  'حساسية': 'Allergy',
  'فنتولين': 'Ventoline',
  'بخاخ': 'Inhaler',
  'غرفة استنشاق': 'Inhalation Spacer',
  'اختبار حساسية': 'Allergy Test',
  'باستور': 'Pasteur Institute',
  'عث الغبار': 'Dust Mites',
  'بنسلين': 'Penicillin',
  'جلدية': 'Dermatology',
  'صحة مدرسية': 'School Health',
  'ترخيص دواء': 'Medication Auth',
  'مدرسة ابتدائية': 'Primary School',
  'عيون': 'Ophthalmology',
  'رؤية': 'Vision',
  'فحص بصري': 'Vision Exam',
  'حدة بصر': 'Visual Acuity',
  'جيوب أنفية': 'Sinuses',
  'بلوندو': 'Blondeau View',
  'تنفس علوي': 'Upper Airway',
  'تلقيحات': 'Vaccinations',
  'طفولة': 'Pediatrics',
  'دفتر صحي': 'Health Booklet',
  'وقاية وطنية': 'National Prevention',
  'نمو أطفال': 'Child Growth',
  'تطور حركي': 'Motor Development',
  'نطق': 'Speech',
  'منحنى الوزن': 'Weight Curve',
  'محيط الرأس': 'Head Circumference',
  'طب أطفال': 'Pediatrics',
  'أسنان اللبن': 'Baby Teeth',
  'فيتامين د': 'Vitamin D',
  'مسكن ألم': 'Analgesic',
  'حرارة': 'Fever',
  'حديثي الولادة': 'Neonatology',
  'دماغ الرضيع': 'Infant Brain',
  'يافوخ': 'Fontanelle',
  'سلامة المخ': 'Brain Integrity',

  // === Appointments ===
  'مراجعة دورية لنتائج التحاليل وتعديل جرعة دواء الضغط إذا لزم الأمر.':
    'Routine lab result review and blood pressure medication adjustment if needed.',
  'إحضار نتائج التحاليل المخبرية الأخيرة ودفتر قياسات الضغط اليومي.':
    'Bring recent lab results and daily blood pressure logbook.',
  'فحص متابعة الحمل الشهرية - الأسبوع 26.': 'Monthly pregnancy follow-up visit — 26 wks GA.',
  'إجراء قياس ضغط الدم، وزن الأم، وسماع نبضات قلب الجنين.':
    'Blood pressure check, maternal weight, and fetal heart rate auscultation.',
  'تطعيم تذكيري وتفقد الوزن ومحيط الرأس وتطور المشي والتعبير اللغوي.':
    'Booster vaccination plus weight, head circumference, walking, and speech checkup.',
  'إحضار الدفتر الصحي الأزرق.': 'Bring the blue child health booklet.',

  // === Timeline ===
  'إجراء تحاليل دورية للدم والدهون': 'Routine Blood & Lipid Lab Panel',
  'تحليل السكر والكولسترول ووظائف الكلى بمخبر ابن رشد.':
    'Glucose, cholesterol, and kidney function panel at Ibn Rochd Laboratory.',
  'تحاليل مخبرية': 'Lab Tests',
  'استشارة فحص عام وسكر تراكمي': 'General Checkup & HbA1c Consultation',
  'فحص سريري لقياس الضغط ونبض القلب والاطمئنان على انتظام الدواء.':
    'Physical exam (BP, heart rate) and medication adherence check.',
  'استشارة طبية': 'Medical Visit',
  'تشخيص وتثبيت علاج ارتفاع ضغط الدم': 'Hypertension Diagnosis & Treatment Setup',
  'بدء علاج كوفرسيل 5 ملغ بعد مراقبة الضغط لأسبوعين متتاليين.':
    'Started Coversyl 5 mg after two weeks of consecutive BP monitoring.',
  'وصفة طبية دورية': 'Chronic Rx',
  'فحص بالصدى الصوتي المورفولوجي للثلث الثاني': '2nd Trimester Morphology Ultrasound',
  'تصوير كامل لأعضاء الجنين والتأكد من سلامة المشيمة وحجم السائل الأمنيوسي.':
    'Complete fetal organ scan confirming healthy placenta and amniotic fluid volume.',
  'أشعة صدى التوليد': 'OB Ultrasound',
  'تاريخ الولادة وتلقيح BCG والكبد الفيروسي ب': 'Birth & BCG + Hepatitis B Vaccination',
  'ولادة طبيعية بمستشفى بارني (حسين داي)، الوزن 3.2 كغ، الطول 49 سم.':
    'Normal delivery at Parnet Hospital (Hussein Dey) — Weight 3.2 kg, Length 49 cm.',
  'ولادة وتلقيح': 'Birth & Vaccine',
  'دواء جديد': 'New Medication',
  'مؤشر حيوي': 'Vital Sign',
  'أرشيف طبي': 'Medical Archive',
  'موعد طبي': 'Medical Appointment',

  // === Menstrual Cycles ===
  'مغص خفيف': 'Mild cramps',
  'صداع': 'Headache',
  'تقلب مزاج خفيف': 'Mild mood changes',
  'ألم أسفل الظهر': 'Lower back pain',
  'آخر دورة طمثية قبل تأكيد الحمل المبارك.':
    'Last menstrual period prior to confirmed pregnancy.',

  // === Child Growth Notes ===
  'الوزن والمقاييس عند الولادة ضمن الشريحة المئوية 50% المثالية.':
    'Birth measurements ideally positioned at the WHO 50th percentile.',
  'رضاعة طبيعية حصرية، استجابة بصرية وابتسامة تفاعلية.':
    'Exclusive breastfeeding, good visual tracking and social smile.',
  'التحكم بثبات الرأس ممتاز.': 'Excellent head control.',
  'بدء إدخال الأطعمة المهروسة (الخضار والفاكهة) تدريجياً.':
    'Gradual introduction of pureed vegetables and fruits.',
  'إتمام العام الأول بصحة ممتازة، بداية الوقوف والمحاولات الأولى للمشي.':
    'Healthy 1st birthday: standing independently and taking first steps.',
  'المشي بثبات، نطق كلمات أولى (ماما، بابا، ماء)، التفاعل الاجتماعي سليم.':
    'Steady walking, speaking first words, and healthy social interaction.',

  // === Share Passes, Access Logs & Hotlines ===
  'ملخص طبي لاستشارة أمراض القلب': 'Medical Summary for Cardiology Consultation',
  'مشاركة للاستشارة الطبية': 'Share for Medical Consultation',
  'الاطلاع على ترخيص PAI المدرسي ووصفة بخاخ الفنتولين':
    'Reviewed school PAI authorization and Ventoline inhaler prescription',
  'تطبيق الويب المحلي (جلسة موثقة)': 'Local Web App (Authenticated Session)',
  'تطبيق TIBBI المحلي (جلسة موثقة)': 'Local TIBBI App (Authenticated Session)',
  'تطبيق TIBBI المحلي': 'Local TIBBI App',
  'تطبيق TIBBI للويب': 'TIBBI Web App',
  'تطبيق الويب المحلي': 'Local Web App',
  'معاينة تقرير إيكوغرافي الأسبوع 22 للحمل':
    'Viewed 22-week pregnancy morphology ultrasound report',
  'هاتف ذكي (Safari Mobile)': 'Smartphone (Safari Mobile)',
  'منح وصول مؤقت لمدة 48 ساعة للدكتور كريم بوجمعة (أمراض القلب)':
    'Granted 48-hour temporary access to Dr Karim Boudjemaa (Cardiology)',
  'متصفح سطح المكتب (Chrome)': 'Desktop Browser (Chrome)',
  'تسجيل قياس الطول والوزن عند عمر 18 شهراً':
    'Recorded height and weight measurements at 18 months',
  'استعراض البيانات الصحية والمؤشرات الحيوية': 'Viewed health records and vital signs',
  'استعراض البيانات الصحية والمؤشرات الحيوية.': 'Viewed health records and vital signs.',
  'تم النقر على زر إظهار المعرف المحمي بعد التحقق من الهوية':
    'Revealed protected ID after identity verification',
  'تذكير بموعد دواء الضغط اليومي': 'Daily BP Medication Reminder: Coversyl 5 mg',
  'موعد استشارة أمراض القلب والشرايين قريباً': 'Upcoming Cardiology Appointment',
  'تنبيه نتائج الكوليسترول للمتابعة': 'Lipid Panel Follow-Up Alert',
  'المديرية العامة للحماية المدنية (DGPC)': 'Directorate General of Civil Protection (DGPC)',
  'المديرية العامة للأمن الوطني (DGSN)': 'Directorate General of National Security (DGSN)',
  'قيادة الدرك الوطني': 'National Gendarmerie Command',
  'نوفمبر 2026': 'November 2026',
  'ROR 1 (الحصبة، النكاف، الحميراء)': 'MMR 1 (Measles, Mumps, Rubella)',
  'ROR 2 + تذكير المكورات الرئوية': 'MMR 2 + Pneumococcal Booster',

  // === OCR Fallback & server.ts strings ===
  'فحص دوري يظهر ارتفاعاً طفيفاً في نسبة السكر والكوليسترول الكلي. يُنصح بمراجعة الطبيب المعالج لمراقبة الحمية الغذائية.':
    'Routine panel showing mildly elevated glucose and total cholesterol. Dietary follow-up with your physician is advised.',
  'سكر الدم الصباحي 1.18 g/L (المعدل 0.70 - 1.10)': 'Fasting blood glucose 1.18 g/L (normal 0.70 - 1.10)',
  'الكوليسترول الكلي 2.35 g/L (المعدل الأقصى 2.00)': 'Total cholesterol 2.35 g/L (max 2.00)',
  'وظائف الكلى سليمة': 'Normal kidney function',
  'فحص الحويصل الصفراوي والكبد والأعضاء البطنية طبيعي بدون مؤشرات التهابية أو تشكلات حصوية.':
    'Normal hepatobiliary and abdominal ultrasound with no inflammation or gallstones.',
  'كبد متجانس بحجم طبيعي': 'Homogeneous liver of normal size',
  'مرارة خالية من الحصيات وبجدار رقيق': 'Stone-free gallbladder with thin wall',
  'كليتان سليمتان بدون توسع استسقائي': 'Normal kidneys without hydronephrosis',
  'التهاب حاد بالبلعوم ومجرى التنفس العلوي مع حمى معتدلة. راحة تامة وشرب سوائل دافئة.':
    'Acute pharyngitis / upper respiratory infection with moderate fever. Rest and warm fluids recommended.',
  'مضاد حيوي أوجمنتين 1 غرام لمدة 7 أيام متتالية': 'Augmentin 1 g antibiotic for 7 consecutive days',
  'باراسيتامول لتخفيف الألم والحمى': 'Paracetamol for pain and fever relief',
  'مراجعة العيادة في حال استمرار الأعراض لأكثر من 3 أيام':
    'Return to clinic if symptoms persist beyond 3 days',
  'مستخرج آلياً': 'Auto-extracted',

  // === Medication Names with French descriptors ===
  'Gestarelle G3 (Complément Grossesse)': 'Gestarelle G3 (Pregnancy Supplement)',
  'Gestarelle G3 Grossesse': 'Gestarelle G3 Pregnancy',
  'Tardyferon B9 (Fer + Acide Folique)': 'Tardyferon B9 (Iron + Folic Acid)',
  'Zymad (Vitamine D3) 100 000 UI': 'Zymad (Vitamin D3) 100,000 IU',
  'Aérius 0.5mg/ml Sirop (Desloratadine)': 'Aerius 0.5mg/ml Syrup (Desloratadine)',
  'Doliprane Pédiatrique 2.4% Sirop (Paracétamol)': 'Pediatric Doliprane 2.4% Syrup (Paracetamol)',
  'ZymaD 80 000 UI (Cholécalciférol)': 'ZymaD 80,000 IU (Cholecalciferol)',
};

const EN_TOKEN_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\(GMT\+1 الجزائر\)/g, '(GMT+1 Algiers)'],
  [/\(GMT\+1 Alger\)/g, '(GMT+1 Algiers)'],
  [/الجزائر العاصمة/g, 'Algiers'],
  [/الجزائر/g, 'Algeria'],
  [/مم زئبق/g, 'mmHg'],
  [/ن\/د/g, 'bpm'],
  [/غ\/دسل/g, 'g/dL'],
  [/غرام/g, 'g'],
  [/ملغ/g, 'mg'],
  [/كغ/g, 'kg'],
  [/سم/g, 'cm'],
  [/^د\.\s*/g, 'Dr '],
  [/^أ\.د\.\s*/g, 'Prof '],
  [/\bد\.\s+/g, 'Dr '],
  [/\bأ\.د\.\s+/g, 'Prof '],
  [/خارج المجال الطبيعي/g, 'Out of range'],
  [/ضمن النطاق الطبيعي/g, 'Within normal range'],
  [/طبيعي/g, 'Normal'],
  [/سليم/g, 'Normal'],
  [/مرتفع/g, 'High'],
  [/منخفض/g, 'Low'],
  [/أشهر/g, 'months'],
  [/شهور/g, 'months'],
  [/أيام/g, 'days'],
  [/ساعات/g, 'hours'],
  [/ساعة/g, 'hour'],
  [/يومياً/g, 'daily'],
  [/صباحاً/g, 'in the morning'],
  [/مساءً/g, 'in the evening'],
  [/ظهراً/g, 'at noon'],
  [/عند اللزوم/g, 'as needed'],
  [/على الريق/g, 'on an empty stomach'],
  [/قبل الأكل/g, 'before meals'],
  [/بعد الأكل/g, 'after meals'],
  [/قرص واحد/g, '1 tablet'],
  [/قرصين/g, '2 tablets'],
  [/أقراص/g, 'tablets'],
  [/كبسولة واحدة/g, '1 capsule'],
  [/كبسولة/g, 'capsule'],
  [/أمبولة/g, 'ampoule'],
  [/الجرعة:/g, 'Dosage:'],
  [/الطبيب:/g, 'Doctor:'],
  [/النتيجة:/g, 'Result:'],
  [/النبض:/g, 'Pulse:'],
  [/بإشراف:/g, 'Prescribed by:'],
  [/السبب:/g, 'Reason:'],
  [/المكان:/g, 'Location:'],
  [/تحاليل/g, 'Lab tests'],
  [/تحليل/g, 'Lab test'],
  [/وصفة طبية/g, 'Prescription'],
  [/وصفة/g, 'Prescription'],
  [/قياس/g, 'Measurement'],
  [/موعد/g, 'Appointment'],
  [/وثيقة طبية/g, 'Medical Document'],
  [/وثيقة/g, 'Document'],
  [/مخبر/g, 'Laboratory'],
  [/عيادة/g, 'Clinic'],
  [/مستشفى/g, 'Hospital'],
];

function translateCompositeTextEn(text: string): string {
  let out = text;

  const parentheticalMatch = out.match(/^(.+?)\s*\(([A-Za-zÀ-ÿ0-9\s/+.-]+)\)\s*$/);
  if (parentheticalMatch) {
    const [, arPart, innerPart] = parentheticalMatch;
    if (EN_EXACT_MAP[out.trim()]) return EN_EXACT_MAP[out.trim()];
    if (EN_EXACT_MAP[arPart.trim()]) return EN_EXACT_MAP[arPart.trim()];
    if (EN_EXACT_MAP[innerPart.trim()]) return EN_EXACT_MAP[innerPart.trim()];
  }

  out = out
    .replace(/^بدء علاج جديد:\s*/, 'New medication started: ')
    .replace(/^Nouveau traitement initié\s*:\s*/, 'New medication started: ')
    .replace(/^تحليل مخبري:\s*/, 'Lab test: ')
    .replace(/^Analyse biologique\s*:\s*/, 'Lab test: ')
    .replace(/^تسجيل قياس ضغط الدم:\s*/, 'Blood pressure recorded: ')
    .replace(/^Mesure tensionnelle enregistrée\s*:\s*/, 'Blood pressure recorded: ')
    .replace(/^إضافة وثيقة:\s*/, 'Document archived: ')
    .replace(/^Document archivé\s*:\s*/, 'Document archived: ')
    .replace(/^موعد طبي:\s*/, 'Medical appointment: ')
    .replace(/^Rendez-vous médical\s*:\s*/, 'Medical appointment: ')
    .replace(/^تمديد رابط الطبيب:\s*(.+)$/, (_m, title) => `Extended doctor share link: ${translateTextEn(title)}`)
    .replace(/^Prolongation du lien médecin\s*:\s*(.+)$/, (_m, title) => `Extended doctor share link: ${translateTextEn(title)}`)
    .replace(/^إلغاء عرض رقم الهوية\/الشفاء:\s*(.+)$/, (_m, name) => `Masked ID/Chifa number: ${translateTextEn(name)}`)
    .replace(/^Masquage de l’identifiant\s*:\s*(.+)$/, (_m, name) => `Masked ID/Chifa number: ${translateTextEn(name)}`)
    .replace(
      /^الوصول تحت وصاية الولي القانوني \((.+)\)$/,
      (_m, g) => `Accessed under legal guardianship (${translateTextEn(g)})`
    )
    .replace(
      /^Accès sous tutelle parentale légale \((.+)\)$/,
      (_m, g) => `Accessed under legal guardianship (${translateTextEn(g)})`
    )
    .replace(
      /^مشاركة \((.+)\) موجهة إلى:\s*(.+?)\s*برمز:\s*(.+)$/,
      (_m, title, doc, code) =>
        `Shared (${translateTextEn(title)}) with ${translateTextEn(doc)} • Code: ${code}`
    )
    .replace(
      /^Partage \((.+)\) destiné à (.+?)\s*•\s*Code\s*:\s*(.+)$/,
      (_m, title, doc, code) =>
        `Shared (${translateTextEn(title)}) with ${translateTextEn(doc)} • Code: ${code}`
    )
    .replace(/^وثيقة مؤرشفة في ملف\s*/, 'Document archived in record ')
    .replace(/^Document archivé dans le dossier\s*/, 'Document archived in record ');

  for (const [pattern, replacement] of EN_TOKEN_REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }

  const keys = Object.keys(EN_EXACT_MAP).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    if (out.includes(k)) {
      out = out.split(k).join(EN_EXACT_MAP[k]);
    }
  }

  if (ARABIC_CHAR_REGEX.test(out)) {
    const stripped = out.replace(/[\u0600-\u06FF]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
    return stripped || 'Recorded clinical entry';
  }

  return out;
}

export function translateTextEn(text?: string | null): string {
  if (text === undefined || text === null) return '';
  const trimmed = text.trim();
  if (!trimmed) return text;

  const exact = EN_EXACT_MAP[trimmed];
  if (exact) return exact;

  // Also translate French composite patterns even without Arabic characters
  return translateCompositeTextEn(trimmed);
}
